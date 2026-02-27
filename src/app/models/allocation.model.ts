import { ThemeColor } from './income.model';

export interface AllocationBox {
    id: string;
    name: string;
    subCategory: string; // e.g. "Patrimonio & Capital", "Gastos Fijos Esenciales"
    type: 'permanente' | 'temporal' | 'remanente';
    calculationType: 'porcentaje' | 'absoluto';
    targetAmount: number; // Represents % (e.g., 30) or absolute $ (e.g., 1000)

    // Properties for progress bars (temporal boxes usually)
    savedAmount?: number;
    savingsTarget?: number;

    icon: string;
    color: ThemeColor;
}
