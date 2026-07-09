import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater }               from 'electron-updater';
import path                          from 'node:path';

const PORT     = 3847;
const DEV      = process.env.NODE_ENV === 'development';
const CLIENT_URL = DEV ? `http://localhost:5173` : `http://localhost:${PORT}`;

// Resolve paths that work both inside and outside asar
const ROOT = app.isPackaged
    ? path.join(process.resourcesPath)
    : path.join(__dirname, '..');

let mainWindow: BrowserWindow | null = null;

async function startServer() {
    const dataDir      = app.getPath('userData');
    const migrationsDir = app.isPackaged
        ? path.join(ROOT, 'server', 'src', 'db', 'migrations')
        : path.join(__dirname, '..', 'server', 'src', 'db', 'migrations');

    // Dynamic require so the server module can be tree-shaken from the renderer
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startServer } = require(
        app.isPackaged
            ? path.join(ROOT, 'dist', 'server', 'index.js')
            : path.join(__dirname, '..', 'dist', 'server', 'index.js'),
    ) as { startServer: (dataDir: string, port: number, migrationsDir: string) => Promise<void> };

    await startServer(dataDir, PORT, migrationsDir);
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

    // Open external links in the system browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) shell.openExternal(url);
        return { action: 'deny' };
    });

    await mainWindow.loadURL(CLIENT_URL);
}

app.whenReady().then(async () => {
    if (!DEV) {
        // In production: start the embedded server then open the window
        await startServer();
    }

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
