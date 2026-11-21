const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
function createWindow() {
  const win = new BrowserWindow({
    width: 1120, height: 760, minWidth: 850, minHeight: 600,
    backgroundColor: '#070b0a',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}
app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
ipcMain.handle('pick-manifests', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile','multiSelections'], filters: [{name:'Steam manifest files', extensions:['manifest']}] });
  if (result.canceled) return [];
  return result.filePaths.map(file => {
    const data = fs.readFileSync(file);
    return { id: crypto.randomUUID(), name: path.basename(file), path: file, size: data.length,
      hash: crypto.createHash('sha256').update(data).digest('hex').slice(0,16), content: data.toString('utf8').slice(0,12000) };
  });
});
ipcMain.handle('open-file-location', async (_, filePath) => shell.showItemInFolder(filePath));
ipcMain.handle('save-library', async (_, items) => {
  const file = path.join(app.getPath('userData'), 'library.json');
  fs.writeFileSync(file, JSON.stringify(items.map(({id,name,path,size,hash})=>({id,name,path,size,hash})), null, 2));
  return true;
});
ipcMain.handle('load-library', async () => {
  const file = path.join(app.getPath('userData'), 'library.json');
  try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return []; }
});
