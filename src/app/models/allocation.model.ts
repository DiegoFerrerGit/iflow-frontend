import { ThemeColor } from './income.model';

export interface AllocationBox {
    id: string;
    name: string;
    description: string; // e.g. "Patrimonio & Capital", "Gastos Fijos Esenciales"
    type: 'permanent' | 'temporary';
    calculationType: 'percentage' | 'absolute';
    targetAmount: number; // Represents % (e.g., 30) or absolute $ (e.g., 1000)

    // Properties for progress bars (temporary boxes usually)
    savedAmount?: number;
    savingsTarget?: number;

    icon: string;
    color: ThemeColor;
}
