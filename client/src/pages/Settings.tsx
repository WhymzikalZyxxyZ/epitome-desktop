import { Check, Monitor, Maximize2, RectangleHorizontal } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import type { Theme, FontChoice, ZoomLevel, WindowMode } from '@/contexts/SettingsContext';

// ── Option data ───────────────────────────────────────────────────────────────

const THEMES: { value: Theme; label: string; tagline: string; swatch: string }[] = [
    { value: 'midnight', label: 'Midnight',  tagline: 'Dark as desire, deep as ink.',                swatch: '#120818' },
    { value: 'ivory',    label: 'Ivory',     tagline: 'Clean authority. Irresistible clarity.',       swatch: '#faf8f5' },
    { value: 'sepia',    label: 'Sépia',     tagline: 'Warm, unhurried, and dangerously inviting.',   swatch: '#2c2418' },
    { value: 'noir',     label: 'Noir',      tagline: 'Severe. Absolute. Unapologetically stark.',    swatch: '#000000' },
];

const FONTS: { value: FontChoice; label: string; tagline: string; specimen: string }[] = [
    { value: 'inter',    label: 'Inter',            tagline: 'Sleek precision — the voice of control.',          specimen: 'The manuscript awaits.' },
    { value: 'playfair', label: 'Playfair Display', tagline: 'Lush curves. Classical authority. Pure seduction.', specimen: 'The manuscript awaits.' },
    { value: 'lora',     label: 'Lora',             tagline: 'Soft, scholarly, and quietly commanding.',          specimen: 'The manuscript awaits.' },
    { value: 'system',   label: 'System Default',   tagline: 'Effortless. Native. Nothing to prove.',             specimen: 'The manuscript awaits.' },
];

const ZOOM_LEVELS: { value: ZoomLevel; label: string }[] = [
    { value: 75,  label: '75%' },
    { value: 85,  label: '85%' },
    { value: 100, label: '100%' },
    { value: 115, label: '115%' },
    { value: 125, label: '125%' },
    { value: 150, label: '150%' },
];

const WINDOW_MODES: { value: WindowMode; label: string; tagline: string; icon: React.ReactNode }[] = [
    {
        value:   'windowed',
        label:   'Windowed',
        tagline: 'Composed and contained — your workspace on your terms.',
        icon:    <Monitor size={18} />,
    },
    {
        value:   'fullscreen',
        label:   'Fullscreen',
        tagline: 'All-consuming. Let the story swallow the screen whole.',
        icon:    <Maximize2 size={18} />,
    },
    {
        value:   'borderless',
        label:   'Borderless Fullscreen',
        tagline: 'Frameless, seamless, total immersion — nothing between you and the words.',
        icon:    <RectangleHorizontal size={18} />,
    },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function Settings() {
    const { settings, setTheme, setFont, setZoom, setWindowMode } = useSettings();

    return (
        <div className="max-w-2xl mx-auto space-y-10">

            {/* Header */}
            <div>
                <h1 className="font-display font-black text-2xl text-ep-text tracking-tight">Atelier</h1>
                <p className="text-ep-muted text-sm mt-1">
                    Dress the dashboard to match your appetite — atmosphere, typeface, scale, and presence, all on your terms.
                </p>
            </div>

            {/* ── Theme ── */}
            <section>
                <SectionHeader
                    title="Atmosphere"
                    description="The mood that holds every word you write. Choose what the room feels like."
                />
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {THEMES.map(t => (
                        <button
                            key={t.value}
                            className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 ${
                                settings.theme === t.value
                                    ? 'border-ep-rose bg-ep-surface shadow-ep-glow'
                                    : 'border-ep-border bg-ep-surface hover:border-ep-border-hi hover:shadow-sm'
                            }`}
                            onClick={() => setTheme(t.value)}
                        >
                            <div
                                className="w-full h-10 rounded-lg mb-3 border border-ep-border"
                                style={{ background: t.swatch }}
                            />
                            <div className="flex items-center justify-between">
                                <span className="font-display font-bold text-ep-text text-sm">{t.label}</span>
                                {settings.theme === t.value && (
                                    <span className="w-5 h-5 rounded-full bg-ep-rose flex items-center justify-center shrink-0">
                                        <Check size={11} className="text-[#1a0a1e]" strokeWidth={3} />
                                    </span>
                                )}
                            </div>
                            <p className="text-ep-muted text-xs mt-0.5 leading-snug">{t.tagline}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Typeface ── */}
            <section>
                <SectionHeader
                    title="Typeface"
                    description="The shape of your thoughts on screen. Pick the one that makes you want to keep reading."
                />
                <div className="space-y-2 mt-4">
                    {FONTS.map(f => (
                        <button
                            key={f.value}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                                settings.font === f.value
                                    ? 'border-ep-rose bg-ep-surface shadow-ep-glow'
                                    : 'border-ep-border bg-ep-surface hover:border-ep-border-hi hover:shadow-sm'
                            }`}
                            onClick={() => setFont(f.value)}
                        >
                            <div
                                className="shrink-0 w-28 text-ep-text-dim text-sm leading-tight truncate"
                                style={{ fontFamily: fontStack(f.value) }}
                            >
                                {f.specimen}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-ep-text text-sm">{f.label}</span>
                                    {settings.font === f.value && (
                                        <span className="w-4 h-4 rounded-full bg-ep-rose flex items-center justify-center shrink-0">
                                            <Check size={9} className="text-[#1a0a1e]" strokeWidth={3} />
                                        </span>
                                    )}
                                </div>
                                <p className="text-ep-muted text-xs mt-0.5">{f.tagline}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Scale ── */}
            <section>
                <SectionHeader
                    title="Scale"
                    description="Expand or compress the entire interface. Let it breathe — or hold it close."
                />
                <div className="flex gap-2 flex-wrap mt-4">
                    {ZOOM_LEVELS.map(z => (
                        <button
                            key={z.value}
                            className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                                settings.zoom === z.value
                                    ? 'border-ep-rose bg-ep-surface text-ep-rose shadow-ep-glow'
                                    : 'border-ep-border bg-ep-surface text-ep-text-dim hover:border-ep-border-hi hover:text-ep-text'
                            }`}
                            onClick={() => setZoom(z.value)}
                        >
                            {z.value === 100 ? `${z.label} (Default)` : z.label}
                        </button>
                    ))}
                </div>
                <p className="text-ep-muted text-xs mt-3">
                    Scale adjusts the base font size — every rem-unit in the interface scales proportionally.
                </p>
            </section>

            {/* ── Window Mode ── */}
            <section>
                <SectionHeader
                    title="Presence"
                    description="How EPITOME claims its space on your screen. Choose your level of surrender."
                />
                <div className="space-y-2 mt-4">
                    {WINDOW_MODES.map(m => (
                        <button
                            key={m.value}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                                settings.windowMode === m.value
                                    ? 'border-ep-rose bg-ep-surface shadow-ep-glow'
                                    : 'border-ep-border bg-ep-surface hover:border-ep-border-hi hover:shadow-sm'
                            }`}
                            onClick={() => setWindowMode(m.value)}
                        >
                            <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                                settings.windowMode === m.value
                                    ? 'bg-ep-rose/20 text-ep-rose'
                                    : 'bg-ep-surface-2 text-ep-muted'
                            }`}>
                                {m.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-ep-text text-sm">{m.label}</span>
                                    {settings.windowMode === m.value && (
                                        <span className="w-4 h-4 rounded-full bg-ep-rose flex items-center justify-center shrink-0">
                                            <Check size={9} className="text-[#1a0a1e]" strokeWidth={3} />
                                        </span>
                                    )}
                                </div>
                                <p className="text-ep-muted text-xs mt-0.5">{m.tagline}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Reset ── */}
            <section className="pt-4 border-t border-ep-border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-ep-text text-sm font-semibold">Restore Defaults</p>
                        <p className="text-ep-muted text-xs mt-0.5">Return to Midnight · Inter · 100% · Windowed — the original arrangement.</p>
                    </div>
                    <button
                        className="btn-ghost text-sm"
                        onClick={() => {
                            setTheme('midnight');
                            setFont('inter');
                            setZoom(100);
                            setWindowMode('windowed');
                        }}
                    >
                        Reset
                    </button>
                </div>
            </section>

        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fontStack(f: FontChoice): string {
    const stacks: Record<FontChoice, string> = {
        inter:    "'Inter', system-ui, sans-serif",
        playfair: "'Playfair Display', Georgia, serif",
        lora:     "'Lora', Georgia, serif",
        system:   "system-ui, sans-serif",
    };
    return stacks[f];
}

function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="border-b border-ep-border pb-3">
            <h2 className="font-display font-bold text-ep-text text-base tracking-tight">{title}</h2>
            <p className="text-ep-muted text-xs mt-0.5">{description}</p>
        </div>
    );
}
