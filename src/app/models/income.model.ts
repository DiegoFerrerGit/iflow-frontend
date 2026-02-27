export interface IncomeSource {
    id: string;
    name: string;
    role: string;
    amount: number;
    effortPercentage: number;
    category: {
        label: string;
        type: 'primary' | 'cyan' | 'pink';
    };
}
