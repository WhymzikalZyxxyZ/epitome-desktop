import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron';
import { autoUpdater }                               from 'electron-updater';
import path                                          from 'node:path';

const PORT       = 3847;
const DEV        = process.env.NODE_ENV === 'development';
const CLIENT_URL = DEV ? `http://localhost:5173` : `http://localhost:${PORT}`;

// __dirname in dev = epitome-desktop/dist/electron; go up two levels to reach project root
const ROOT = app.isPackaged
    ? path.join(process.resourcesPath)
    : path.join(__dirname, '..', '..');

let mainWindow: BrowserWindow | null = null;

async function startServer() {
    const dataDir       = app.isPackaged ? app.getPath('userData') : path.join(ROOT, '.epitome-data');
    const migrationsDir = path.join(ROOT, 'server', 'src', 'db', 'migrations');
    const serverPath    = path.join(ROOT, 'dist', 'server', 'index.js');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startServer: start } = require(serverPath) as {
        startServer: (dataDir: string, port: number, migrationsDir: string) => Promise<void>
    };

    await start(dataDir, PORT, migrationsDir);
}

async function createWindow() {
    // Remove the native menu bar (File / Edit / View / Help)
    Menu.setApplicationMenu(null);

    mainWindow = new BrowserWindow({
        width:  1280,
        height: 820,
        minWidth:  900,
        minHeight: 600,
        // Hide the native title bar; keep OS window controls via titleBarOverlay on Windows
        titleBarStyle: 'hidden',
        titleBarOverlay: process.platform === 'win32' ? {
            color:       '#1f1028',
            symbolColor: '#e8a0b4',
            height:      40,
        } : undefined,
        webPreferences: {
            preload:          path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration:  false,
        },
        show:           false,
        autoHideMenuBar: true,
    });

    mainWindow.once('ready-to-show', () => mainWindow?.show());

    ipcMain.handle('window:setMode', (_, mode: 'windowed' | 'fullscreen' | 'borderless') => {
        if (!mainWindow) return;
        if (mode === 'fullscreen') {
            mainWindow.setFullScreen(true);
        } else if (mode === 'borderless') {
            mainWindow.setFullScreen(false);
            mainWindow.maximize();
        } else {
            mainWindow.setFullScreen(false);
            mainWindow.unmaximize();
        }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) shell.openExternal(url);
        return { action: 'deny' };
    });

    await mainWindow.loadURL(CLIENT_URL);
}

app.whenReady().then(async () => {
    // Server always starts inside Electron's process (uses Electron's Node ABI)
    await startServer();
    await createWindow();

    if (!DEV) {
        autoUpdater.checkForUpdatesAndNotify();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
