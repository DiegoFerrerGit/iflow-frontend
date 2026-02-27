import { Injectable } from '@angular/core';
import { IncomeSource } from '../../../models/income.model';

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
                effortPercentage: 29,
                icon: 'trending_up',
                color: 'primary',
                category: {
                    label: 'Management',
                    color: 'primary'
                }
            },
            {
                id: '2',
                name: 'MODAK',
                role: 'Consulting',
                amount: 5000,
                effortPercentage: 30,
                icon: 'group',
                color: 'cyan',
                category: {
                    label: 'Consulting',
                    color: 'cyan'
                }
            },
            {
                id: '3',
                name: 'SUNSET',
                role: 'Advisory',
                amount: 1500,
                effortPercentage: 10,
                icon: 'account_balance',
                color: 'pink',
                category: {
                    label: 'Advisory',
                    color: 'pink'
                }
            }
        ];
    }
}
