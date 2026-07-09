import { contextBridge, ipcRenderer } from 'electron';

type WindowMode = 'windowed' | 'fullscreen' | 'borderless';

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    windowMode: {
        set: (mode: WindowMode) => ipcRenderer.invoke('window:setMode', mode),
    },
});
