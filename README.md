# EPITOME Desktop

A standalone desktop application for writers — track your projects, characters, chapters, events, commissions, and sales, all stored locally on your machine. No cloud required. No account required. No Node.js required.

---

## Download & Run — No Setup Needed

Go to the [**Latest Release**](../../releases/latest) and download the file for your platform:

| Platform | Download |
|----------|----------|
| **Windows** | `EPITOME-Desktop-Setup-x.x.x.exe` |
| **macOS**   | `EPITOME-Desktop-x.x.x.dmg`       |
| **Linux**   | `EPITOME-Desktop-x.x.x.AppImage`  |

> No Node.js, no npm, no terminal. Just download and open.

---

## Install Instructions

### Windows

1. Download `EPITOME-Desktop-Setup-x.x.x.exe`
2. Double-click the installer — it takes about 10 seconds
3. Launch **EPITOME Desktop** from the Start menu or your desktop shortcut

> **SmartScreen warning?** Click **More info → Run anyway**. The app is unsigned; a code-signing certificate will be added in a future release.

---

### macOS

1. Download `EPITOME-Desktop-x.x.x.dmg`
2. Open the `.dmg` file
3. Drag **EPITOME Desktop** into your **Applications** folder
4. On first launch, **right-click the app → Open** (only needed once, to bypass Gatekeeper)

---

### Linux

1. Download `EPITOME-Desktop-x.x.x.AppImage`
2. Open a terminal and make it executable:
   ```bash
   chmod +x EPITOME-Desktop-x.x.x.AppImage
   ```
3. Double-click it in your file manager, or run it from the terminal:
   ```bash
   ./EPITOME-Desktop-x.x.x.AppImage
   ```

---

## First Launch

When EPITOME opens for the first time it creates a local database automatically — nothing to configure. Create an account (stored only on your machine), and you're writing.

---

## Your Data

Everything lives on your machine. EPITOME never connects to a remote server.

| Platform | Data Location |
|----------|---------------|
| Windows  | `%APPDATA%\epitome-desktop\` |
| macOS    | `~/Library/Application Support/epitome-desktop/` |
| Linux    | `~/.config/epitome-desktop/` |

Back up this folder to keep your projects safe.

---

## Auto-Updates

EPITOME checks for new versions automatically on launch and prompts you to install them.

---

## What's Inside

- **Projects** — novels, novellas, short stories, essays, poetry
- **Chapters & Writing Pad** — rich-text editor with word count tracking
- **Series** — group related projects together
- **Events** — signings, readings, and appearances
- **Inventory** — track physical copies
- **Publishing** — sizes, distribution, manufacturers, social
- **Commissions** — who owes you, what for, and when
- **Sales** — production and revenue tracking
- **Four themes** — Midnight, Ivory, Sépia, Noir
- **Window modes** — Windowed, Fullscreen, Borderless Fullscreen

---

## For Developers

If you want to run from source or contribute:

```bash
# Prerequisites: Node.js 20+
git clone https://github.com/WhymzikalZyxxyZ/epitome-desktop.git
cd epitome-desktop
npm install
npm run dev
```

To build a distributable:

```bash
npm run build && npm run package
```

Requires the platform native toolchain for `better-sqlite3` (`windows-build-tools` on Windows, Xcode Command Line Tools on macOS).

---

## License

MIT
