export type ThemeColor = 'primary' | 'cyan' | 'pink' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'orange' | 'blue' | 'fuchsia';

export interface IncomeSource {
    id: string;
    name: string;
    role: string;
    amount: number;
    effortPercentage: number;
    icon?: string;
    color: ThemeColor;
    category: {
        label: string;
        color: ThemeColor;
    };
}
