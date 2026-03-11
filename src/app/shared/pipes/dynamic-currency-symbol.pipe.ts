import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyManager } from '../../core/currency-manager/currency-manager.manager';

@Pipe({
    name: 'dynamicCurrencySymbol',
    standalone: true,
    pure: false
})
export class DynamicCurrencySymbolPipe implements PipeTransform {
    private currencyState = inject(CurrencyManager);

    transform(value?: any, forceCurrency?: 'USD' | 'ARS'): string {
        const currency = forceCurrency || this.currencyState.currentCurrency();
        return currency === 'ARS' ? '$' : 'u$d';
    }
}
