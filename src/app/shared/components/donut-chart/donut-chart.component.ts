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
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Input() title?: string;
    @Input() subtitle?: string;

    hoveredSegment: DonutChartSegment | null = null;

    get titleClass(): string {
        switch (this.size) {
            case 'lg': return 'text-[12px]';
            case 'sm': return 'text-[7px]';
            default: return 'text-[8px]';
        }
    }

    get subtitleClass(): any {
        if (!this.subtitle) return {};
        const len = this.subtitle.length;
        if (this.size === 'lg') {
            return {
                'text-4xl': len <= 11,
                'text-3xl': len > 11 && len <= 15,
                'text-2xl': len > 15
            };
        }
        if (this.size === 'sm') {
            return {
                'text-xl': len <= 11,
                'text-lg': len > 11 && len <= 15,
                'text-sm': len > 15
            };
        }
        return {
            'text-2xl': len <= 11,
            'text-xl': len > 11 && len <= 15,
            'text-base': len > 15
        };
    }

    get hoverNameClass(): string {
        switch (this.size) {
            case 'lg': return 'text-[12px]';
            case 'sm': return 'text-[7px]';
            default: return 'text-[8px]';
        }
    }

    get hoverAmountClass(): string {
        switch (this.size) {
            case 'lg': return 'text-3xl';
            case 'sm': return 'text-lg';
            default: return 'text-xl';
        }
    }

    get hoverPercentageClass(): string {
        switch (this.size) {
            case 'lg': return 'text-[14px]';
            case 'sm': return 'text-[9px]';
            default: return 'text-[10px]';
        }
    }

    get firstSegment(): DonutChartSegment | null {
        return this.segments.length > 0 ? this.segments[0] : null;
    }

    get lastSegment(): DonutChartSegment | null {
        return this.segments.length > 0 ? this.segments[this.segments.length - 1] : null;
    }

    getTipOffset(segment: DonutChartSegment): number {
        const length = parseFloat(segment.dashArray.split(' ')[0]) || 0;
        // The end of the segment is at dashOffset - length
        return segment.dashOffset - length;
    }
}
