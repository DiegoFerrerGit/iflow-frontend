import { Component, Input, inject } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { DynamicCurrencyPipe } from '../../pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../pipes/dynamic-currency-symbol.pipe';
import { CurrencyState } from '../../../core/services/currency-state';

export interface DonutChartSegment {
    id: string;
    color: string;
    dashArray: string;
    dashOffset: number;
    percentage: number;
    icon?: string;
    name: string;
    amount: number;
    amountColorClass?: string; // e.g. 'text-orange-400'
    type?: string;
}

@Component({
    selector: 'app-donut-chart',
    standalone: true,
    imports: [CommonModule, DecimalPipe, DynamicCurrencyPipe, DynamicCurrencySymbolPipe],
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent {
    public currencyState = inject(CurrencyState);

    @Input() segments: DonutChartSegment[] = [];
    @Input() title?: string;
    @Input() subtitle?: string;

    hoveredSegment: DonutChartSegment | null = null;
}
