// Minimal preload — the app uses standard fetch/cookie auth, no IPC needed.
// Extend this file if you need to expose native Electron capabilities to the renderer.
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
});
