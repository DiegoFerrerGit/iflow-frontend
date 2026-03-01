export type ThemeColor =
    | 'primary' | 'cyan' | 'pink' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'orange' | 'blue' | 'fuchsia'
    | 'sky' | 'royal' | 'crimson' | 'teal' | 'violet' | 'gold' | 'clay' | 'slate';

export const THEME_COLORS: ThemeColor[] = [
    'primary', 'cyan', 'pink', 'emerald', 'amber', 'indigo', 'rose', 'orange', 'blue', 'fuchsia',
    'sky', 'royal', 'crimson', 'teal', 'violet', 'gold', 'clay', 'slate'
];

export const COLOR_MAP: Record<ThemeColor, string> = {
    'primary': '#a855f7', // purple-500
    'cyan': '#22d3ee',    // cyan-400
    'pink': '#f472b6',    // pink-400
    'emerald': '#34d399', // emerald-400
    'amber': '#fbbf24',   // amber-400
    'indigo': '#818cf8',  // indigo-400
    'rose': '#f43f5e',    // rose-500
    'orange': '#fb923c',  // orange-400
    'blue': '#60a5fa',    // blue-400
    'fuchsia': '#e879f9', // fuchsia-400
    'sky': '#38bdf8',     // sky-400
    'royal': '#4f46e5',   // indigo-600
    'crimson': '#dc2626', // red-600
    'teal': '#2dd4bf',    // teal-400
    'violet': '#7c3aed',  // violet-600
    'gold': '#eab308',    // yellow-500
    'clay': '#a8a29e',    // stone-400
    'slate': '#64748b'    // slate-500
};

export interface IncomeSource {
    id: string;
    name: string;
    role: string;
    amount: number;
    effortPercentage: number;
    icon?: string;
    color: ThemeColor;       // Frontend-managed: card color
    category: string;        // Just the label: "Management", "Developer", etc. Color is deterministic.
    currency?: 'USD' | 'ARS';
}
