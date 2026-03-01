import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyState } from '../../core/services/currency-state';

@Pipe({
    name: 'dynamicCurrencySymbol',
    standalone: true,
    pure: false
})
export class DynamicCurrencySymbolPipe implements PipeTransform {
    private currencyState = inject(CurrencyState);

    transform(value?: any, forceCurrency?: 'USD' | 'ARS'): string {
        return '$';
    }
}
