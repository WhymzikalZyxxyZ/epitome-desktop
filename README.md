# EPITOME Desktop

A standalone desktop application for writers — track your projects, characters, chapters, events, commissions, and sales, all stored locally on your machine. No cloud required.

---

## Download

Go to the [**Releases**](../../releases) page and grab the installer for your platform:

| Platform | File |
|----------|------|
| **Windows** | `EPITOME-Setup-x.x.x.exe` |
| **macOS**   | `EPITOME-x.x.x.dmg` |
| **Linux**   | `EPITOME-x.x.x.AppImage` |

---

## Install & Launch

### Windows

1. Download `EPITOME-Setup-x.x.x.exe`
2. Double-click the installer and follow the prompts
3. Launch **EPITOME** from your Start menu or desktop shortcut

> If Windows Defender SmartScreen warns you, click **More info → Run anyway**. The app is unsigned; a code-signing certificate will be added in a future release.

### macOS

1. Download `EPITOME-x.x.x.dmg`
2. Open the `.dmg` and drag **EPITOME** into your Applications folder
3. On first launch, right-click the app and choose **Open** to bypass Gatekeeper

### Linux

1. Download `EPITOME-x.x.x.AppImage`
2. Make it executable:
   ```bash
   chmod +x EPITOME-x.x.x.AppImage
   ```
3. Run it:
   ```bash
   ./EPITOME-x.x.x.AppImage
   ```

---

## Your Data

All data is stored locally on your machine — no account, no cloud sync, no subscription.

| Platform | Location |
|----------|----------|
| Windows | `%APPDATA%\epitome-desktop\` |
| macOS   | `~/Library/Application Support/epitome-desktop/` |
| Linux   | `~/.config/epitome-desktop/` |

Back up this folder to keep your data safe.

---

## Auto-updates

EPITOME checks for updates automatically on launch. When a new version is available you'll be prompted to install it.

---

## Development

```bash
# Install dependencies
npm install

# Start in development mode (server + client + Electron)
npm run dev

# Build a distributable package
npm run build && npm run package
```

Requires Node.js 20+ and the platform toolchain for native modules (`windows-build-tools` on Windows, Xcode Command Line Tools on macOS).

---

## License

MIT
