import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater }               from 'electron-updater';
import path                          from 'node:path';

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
    const migrationsDir = app.isPackaged
        ? path.join(ROOT, 'server', 'src', 'db', 'migrations')
        : path.join(ROOT, 'server', 'src', 'db', 'migrations');

    const serverPath = app.isPackaged
        ? path.join(ROOT, 'dist', 'server', 'index.js')
        : path.join(ROOT, 'dist', 'server', 'index.js');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startServer: start } = require(serverPath) as {
        startServer: (dataDir: string, port: number, migrationsDir: string) => Promise<void>
    };

    await start(dataDir, PORT, migrationsDir);
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width:  1280,
        height: 820,
        minWidth:  900,
        minHeight: 600,
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        webPreferences: {
            preload:          path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration:  false,
        },
        show: false,
    });

    mainWindow.once('ready-to-show', () => mainWindow?.show());

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
