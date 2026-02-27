import { Injectable } from '@angular/core';
import { IncomeSource } from '../../../models/income.model';
import { AllocationBox } from '../../../models/allocation.model';

@Injectable({
  providedIn: 'root'
})
export class OdinMockService {

  getIncomes(): IncomeSource[] {
    return [
      {
        id: '1',
        name: 'TINASOFT',
        role: 'Engineering Manager',
        amount: 8000,
        effortPercentage: 40,
        icon: 'work',
        color: 'primary',
        category: { label: 'Principal', color: 'primary' }
      },
      {
        id: '2',
        name: 'MODAK',
        role: 'Tech Lead / Architect',
        amount: 5000,
        effortPercentage: 60,
        icon: 'laptop_mac',
        color: 'cyan',
        category: { label: 'Contractor', color: 'cyan' }
      },
      {
        id: '3',
        name: 'SUNSET',
        role: 'Consulting',
        amount: 1500,
        effortPercentage: 10,
        icon: 'lightbulb',
        color: 'pink',
        category: { label: 'Advisory', color: 'pink' }
      }
    ];
  }

  getAllocations(): AllocationBox[] {
    return [
      {
        id: '1',
        name: 'Inversión',
        subCategory: 'Patrimonio & Capital',
        type: 'permanente',
        calculationType: 'porcentaje',
        targetAmount: 35, // 35%
        icon: 'trending_up',
        color: 'emerald'
      },
      {
        id: '2',
        name: 'Calidad de Vida',
        subCategory: 'Gastos Fijos Esenciales',
        type: 'permanente',
        calculationType: 'absoluto',
        targetAmount: 845,
        icon: 'home',
        color: 'rose'
      },
      {
        id: '3',
        name: 'Emergencia',
        subCategory: 'Blindaje (3-6 meses Fijos)',
        type: 'temporal', // In the image it says EMERGENCIA & TEMPORAL
        calculationType: 'absoluto', // Image shows 9% / ABSOLUTE. Let's do absolute $1300
        targetAmount: 1300,
        icon: 'security',
        color: 'orange',
        savedAmount: 4000,
        savingsTarget: 12000
      }
    ];
  }
}
