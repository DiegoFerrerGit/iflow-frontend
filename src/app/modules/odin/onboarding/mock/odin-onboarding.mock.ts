import { IncomeSource } from '../../../../models/income.model';
import { AllocationBox } from '../../../../models/allocation.model';

/**
 * ODIN Onboarding — Static mock data
 * Transformed once from mock/odin.json into strongly typed TypeScript.
 * Used only during EXPLAIN_* onboarding steps to show a "full" dashboard.
 */

export const MOCK_INCOMES: IncomeSource[] = [
    {
        id: 'mock-income-1',
        name: 'Google',
        role: 'Fullstack Developer',
        amount: 8000,
        effortPercentage: 40,
        icon: 'work',
        color: 'primary',
        category: 'Developer',
        currency: 'USD'
    },
    {
        id: 'mock-income-2',
        name: 'Departamento',
        role: 'Recoleta',
        amount: 5000,
        effortPercentage: 60,
        icon: 'laptop_mac',
        color: 'cyan',
        category: 'Inmuebles',
        currency: 'USD'
    },
    {
        id: 'mock-income-3',
        name: 'Sunset',
        role: 'Consultor SAP',
        amount: 1500,
        effortPercentage: 10,
        icon: 'lightbulb',
        color: 'rose',
        category: 'Consulting',
        currency: 'USD'
    }
];

export const MOCK_ALLOCATIONS: AllocationBox[] = [
    {
        id: 'mock-alloc-1',
        name: 'Inversión',
        description: 'Patrimonio & Capital',
        type: 'permanent',
        calculationType: 'percentage',
        targetAmount: 40,
        icon: 'trending_up',
        color: 'emerald'
    },
    {
        id: 'mock-alloc-2',
        name: 'Calidad de Vida',
        description: 'Entretenimiento & Lifestyle',
        type: 'permanent',
        calculationType: 'percentage',
        targetAmount: 25,
        icon: 'favorite',
        color: 'crimson'
    },
    {
        id: 'mock-alloc-3',
        name: 'Fondo de Emergencia',
        description: 'Blindaje (3-6 meses)',
        type: 'temporary',
        calculationType: 'percentage',
        targetAmount: 15,
        savedAmount: 5000,
        savingsTarget: 12000,
        icon: 'security',
        color: 'gold'
    },
    {
        id: 'mock-alloc-4',
        name: 'Viaje a Europa',
        description: 'Vacaciones 2026',
        type: 'temporary',
        calculationType: 'absolute',
        targetAmount: 4500,
        savedAmount: 1800,
        savingsTarget: 4500,
        icon: 'flight_takeoff',
        color: 'cyan'
    }
];

/** Mock pool total: sum of all mock incomes in USD */
export const MOCK_TOTAL_POOL = 14500;

/** Mock total allocated: sum of all allocation percentages applied to pool */
export const MOCK_TOTAL_ALLOCATED = MOCK_TOTAL_POOL; // 30+35+20+15 = 100%

/** Mock free money */
export const MOCK_FREE_MONEY = 0;
