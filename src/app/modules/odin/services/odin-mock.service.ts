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

  getAllocationBoxLevel2(id: string): any {
    if (id === '1') {
      // Inversión
      return {
        availableAmountToAssign: 500, // USD
        parentBoxType: 'percentage',
        subCategories: [
          {
            id: '1',
            allocationBoxId: id,
            name: 'Cripto',
            type: 'sum_items',
            icon: 'currency_bitcoin',
            color: 'amber',
            displayAmount: { amount: 200, currency: 'USD' }
          },
          {
            id: '2',
            allocationBoxId: id,
            name: 'Cash',
            type: 'fixed_amount',
            icon: 'payments',
            color: 'emerald',
            displayAmount: { amount: 150, currency: 'USD' }
          },
          {
            id: '3',
            allocationBoxId: id,
            name: 'Bolsa',
            type: 'sum_items',
            icon: 'trending_up',
            color: 'indigo',
            displayAmount: { amount: 100, currency: 'USD' }
          }
        ]
      };
    }

    // Default to 'Calidad de vida' (id === '2')
    return {
      availableAmountToAssign: 4383, // en USD (según Stitch ~$2922 + extras)
      parentBoxType: 'absolute', // Now absolute for Calidad de Vida
      subCategories: [
        {
          id: '1',
          allocationBoxId: id,
          name: 'Gastos Fijos',
          type: 'sum_items',
          icon: 'home',
          color: 'crimson',
          displayAmount: { amount: 2922, currency: 'USD' }
        },
        {
          id: '2',
          allocationBoxId: id,
          name: 'Ocio',
          type: 'fixed_amount',
          icon: 'sports_esports',
          color: 'emerald',
          displayAmount: { amount: 500, currency: 'USD' }
        },
        {
          id: '3',
          allocationBoxId: id,
          name: 'Ingles',
          type: 'fixed_amount',
          icon: 'language',
          color: 'amber',
          displayAmount: { amount: 172, currency: 'USD' }
        }
      ]
    };
  }

  getSubCategoryItems(subCategoryId: string): any {
    // Simple mock according to the endpoints specs
    return {
      availableAmountToAssign: 1250,
      items: [
        {
          id: 'item_1',
          subCategoryId: subCategoryId,
          name: 'Alquiler',
          description: 'Vivienda',
          icon: 'home',
          color: 'violet',
          amountWithCurrency: { amount: 1350, currency: 'USD' },
          paid: true
        },
        {
          id: 'item_2',
          subCategoryId: subCategoryId,
          name: 'Expensas',
          description: 'Mantenimiento',
          icon: 'receipt',
          color: 'pink',
          amountWithCurrency: { amount: 735, currency: 'USD' },
          paid: false
        },
        {
          id: 'item_3',
          subCategoryId: subCategoryId,
          name: 'ABL & Servicios',
          description: 'Impuestos',
          icon: 'bolt',
          color: 'cyan',
          amountWithCurrency: { amount: 365, currency: 'USD' },
          paid: false
        }
      ]
    };
  }
}
