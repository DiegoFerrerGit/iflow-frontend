import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyState } from '../../core/services/currency-state';

@Pipe({
  name: 'dynamicCurrency',
  standalone: true,
  // The pipe must be impure because it relies on a global signal that can change 
  // outside of the component's input bindings.
  pure: false
})
export class DynamicCurrencyPipe implements PipeTransform {
  private currencyState = inject(CurrencyState);

  transform(value: number | string | null | undefined, sourceCurrency: 'USD' | 'ARS' = 'USD', forceFormat?: 'USD' | 'ARS'): string | null {
    if (value == null) return null;

    // Parse the input value
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return null;

    // Get current global state
    const currentCurrency = this.currencyState.currentCurrency();
    const rate = this.currencyState.exchangeRate();

    // Determine target formatting. If a forced currency is passed, we format according to that
    // ignoring the global state's format (but NOT ignoring the conversion logic).
    // Actually, usually we'll just respect the global state unless specified.
    const targetFormat = forceFormat || currentCurrency;

    // Calculate the final absolute value
    let finalValue = numericValue;

    // Convert logic
    if (sourceCurrency === 'USD' && currentCurrency === 'ARS') {
      finalValue = numericValue * rate;
    } else if (sourceCurrency === 'ARS' && currentCurrency === 'USD') {
      finalValue = numericValue / rate;
    }

    // Format based on target currency format
    if (targetFormat === 'ARS') {
      // ARS uses dots for thousands and comma for decimals (European standard in Latam)
      // For integers, just dots.
      const formatted = Math.round(finalValue).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      return formatted;
    } else {
      // USD uses commas for thousands and dots for decimals (US standard)
      const formatted = Math.round(finalValue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      return formatted;
    }
  }
}
