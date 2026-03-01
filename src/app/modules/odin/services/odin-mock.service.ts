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
        category: 'Management',
        currency: 'USD'
      },
      {
        id: '2',
        name: 'MODAK',
        role: 'Frontend Lead',
        amount: 5000,
        effortPercentage: 60,
        icon: 'laptop_mac',
        color: 'cyan',
        category: 'Developer',
        currency: 'USD'
      },
      {
        id: '3',
        name: 'SUNSET',
        role: 'Engineering Advisor',
        amount: 2000000,
        effortPercentage: 10,
        icon: 'lightbulb',
        color: 'rose',
        category: 'Consulting',
        currency: 'ARS'
      }
    ];
  }

  getAllocations(): AllocationBox[] {
    return [
      {
        id: '1',
        name: 'Inversión',
        description: 'Patrimonio & Capital',
        type: 'permanent',
        calculationType: 'percentage',
        targetAmount: 35,
        icon: 'trending_up',
        color: 'emerald'
      },
      {
        id: '2',
        name: 'Calidad de Vida',
        description: 'Gastos Fijos Esenciales',
        type: 'permanent',
        calculationType: 'absolute',
        targetAmount: 845,
        icon: 'home',
        color: 'crimson'
      },
      {
        id: '3',
        name: 'Emergencia',
        description: 'Blindaje (3-6 meses Fijos)',
        type: 'temporary',
        calculationType: 'absolute',
        targetAmount: 1300,
        icon: 'security',
        color: 'gold',
        savedAmount: 4000,
        savingsTarget: 12000
      }
    ];
  }
}
