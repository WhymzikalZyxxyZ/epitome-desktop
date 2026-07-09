import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Theme      = 'midnight' | 'ivory' | 'sepia' | 'noir';
export type FontChoice = 'inter' | 'playfair' | 'lora' | 'system';
export type ZoomLevel  = 75 | 85 | 100 | 115 | 125 | 150;
export type WindowMode = 'windowed' | 'fullscreen' | 'borderless';

export interface Settings {
    theme:      Theme;
    font:       FontChoice;
    zoom:       ZoomLevel;
    windowMode: WindowMode;
}

interface SettingsCtx {
    settings:      Settings;
    setTheme:      (t: Theme)       => void;
    setFont:       (f: FontChoice)  => void;
    setZoom:       (z: ZoomLevel)   => void;
    setWindowMode: (m: WindowMode)  => void;
}

// ── Font stacks ───────────────────────────────────────────────────────────────

const FONT_STACKS: Record<FontChoice, string> = {
    inter:    "'Inter', system-ui, sans-serif",
    playfair: "'Playfair Display', Georgia, serif",
    lora:     "'Lora', Georgia, serif",
    system:   "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

// ── Defaults + persistence ────────────────────────────────────────────────────

const STORAGE_KEY = 'ep-settings';

function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...defaults(), ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return defaults();
}

function defaults(): Settings {
    return { theme: 'midnight', font: 'inter', zoom: 100, windowMode: 'windowed' };
}

// ── Apply to DOM ──────────────────────────────────────────────────────────────

function applySettings(s: Settings) {
    const root = document.documentElement;
    if (s.theme === 'midnight') root.removeAttribute('data-theme');
    else                        root.setAttribute('data-theme', s.theme);
    document.body.style.fontFamily = FONT_STACKS[s.font];
    root.style.fontSize = s.zoom === 100 ? '' : `${s.zoom}%`;
}

// ── Context ───────────────────────────────────────────────────────────────────

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(loadSettings);

    useEffect(() => {
        applySettings(settings);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
    }, [settings]);

    const setTheme = useCallback((theme: Theme) =>
        setSettings(s => ({ ...s, theme })), []);

    const setFont = useCallback((font: FontChoice) =>
        setSettings(s => ({ ...s, font })), []);

    const setZoom = useCallback((zoom: ZoomLevel) =>
        setSettings(s => ({ ...s, zoom })), []);

    const setWindowMode = useCallback((windowMode: WindowMode) => {
        setSettings(s => ({ ...s, windowMode }));
        const electron = (window as unknown as { electron?: { windowMode?: { set: (m: WindowMode) => void } } }).electron;
        electron?.windowMode?.set(windowMode);
    }, []);

    return (
        <Ctx.Provider value={{ settings, setTheme, setFont, setZoom, setWindowMode }}>
            {children}
        </Ctx.Provider>
    );
}

export function useSettings(): SettingsCtx {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
    return ctx;
}
