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
                effortPercentage: 60,
                category: {
                    label: 'Management',
                    type: 'primary'
                }
            },
            {
                id: '2',
                name: 'MODAK',
                role: 'Consulting',
                amount: 5000,
                effortPercentage: 30,
                category: {
                    label: 'Consulting',
                    type: 'cyan'
                }
            },
            {
                id: '3',
                name: 'SUNSET',
                role: 'Advisory',
                amount: 1500,
                effortPercentage: 10,
                category: {
                    label: 'Advisory',
                    type: 'pink'
                }
            }
        ];
    }
}
