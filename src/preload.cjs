const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('zero', {
  pick: () => ipcRenderer.invoke('pick-manifests'),
  locate: p => ipcRenderer.invoke('open-file-location', p),
  save: items => ipcRenderer.invoke('save-library', items),
  load: () => ipcRenderer.invoke('load-library')
});
