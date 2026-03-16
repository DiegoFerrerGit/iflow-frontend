import { Component, Input, inject } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { DynamicCurrencyPipe } from '../../pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../pipes/dynamic-currency-symbol.pipe';
import { CurrencyManager } from '../../../core/currency-manager/currency-manager.manager';
import { ResponsiveState } from '../../../core/responsive/responsive.state';

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
    public currencyState = inject(CurrencyManager);
    public responsiveState = inject(ResponsiveState);

    @Input() segments: DonutChartSegment[] = [];
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Input() title?: string;
    @Input() subtitle?: string;
    @Input() subtitleSymbol?: string | null;
    @Input() subtitleValue?: string | null;
    @Input() hideLegendOnMobile: boolean = false;
    @Input() invertLabels: boolean = false;
    @Input() titleUppercase: boolean = true;

    activeSegment: DonutChartSegment | null = null;

    onSegmentEnter(segment: DonutChartSegment) {
        if (!this.responsiveState.isMobile()) {
            this.activeSegment = segment;
        }
    }

    onSegmentLeave(segment: DonutChartSegment) {
        if (!this.responsiveState.isMobile()) {
            this.activeSegment = null;
        }
    }

    onSegmentClick(segment: DonutChartSegment) {
        if (this.responsiveState.isMobile()) {
            // Toggle selection on touch
            if (this.activeSegment?.id === segment.id) {
                this.activeSegment = null;
            } else {
                this.activeSegment = segment;
            }
        }
    }

    get titleClass(): string {
        const isMobile = this.responsiveState.isMobile();
        switch (this.size) {
            case 'lg': return isMobile ? 'text-[10px]' : 'text-[13px]';
            case 'sm': return 'text-[8px]';
            default: return isMobile ? 'text-[9px]' : 'text-[12px]';
        }
    }

    get subtitleClass(): any {
        const text = this.subtitleValue || this.subtitle;
        if (!text) return {};
        const len = text.length;
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
        const isMobile = this.responsiveState.isMobile();
        switch (this.size) {
            case 'lg': return isMobile ? 'text-[12px]' : 'text-[16px]';
            case 'sm': return 'text-[8px]';
            default: return isMobile ? 'text-[9px]' : 'text-[12px]';
        }
    }

    get hoverAmountClass(): string {
        switch (this.size) {
            case 'lg': return 'text-4xl';
            case 'sm': return 'text-xl';
            default: return 'text-2xl';
        }
    }

    get hoverPercentageClass(): string {
        const isMobile = this.responsiveState.isMobile();
        switch (this.size) {
            case 'lg': return isMobile ? 'text-[14px]' : 'text-[18px]';
            case 'sm': return 'text-[10px]';
            default: return isMobile ? 'text-[10px]' : 'text-[14px]';
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

    /**
     * Returns a tiny arc (just the end tip) of the last segment.
     * Used to overlay ONLY the final rounded cap on top of the first segment's start,
     * without covering any other junctions.
     */
    get lastSegmentTip(): { dashArray: string; dashOffset: number } | null {
        const seg = this.lastSegment;
        if (!seg) return null;
        const circumference = 2 * Math.PI * 50; // r=50
        const segLength = parseFloat(seg.dashArray.split(' ')[0]) || 0;

        const tipLength = 1; // Minimal: keeps backward cap extension far from the previous segment's junction
        // Position the tip at the END of the last segment
        return {
            dashArray: `${tipLength} ${circumference}`,
            dashOffset: seg.dashOffset - segLength + tipLength
        };
    }

    /**
     * A near-zero-length dash at the very END of the last segment.
     * With stroke-linecap="round", this creates just a round dot (the "finger" finish)
     * without a significant backward-extending cap.
     */
    get lastSegmentEndDot(): { dashArray: string; dashOffset: number } {
        const seg = this.lastSegment!;
        const circumference = 2 * Math.PI * 50;
        const segLength = parseFloat(seg.dashArray.split(' ')[0]) || 0;
        const dotLength = 0.1; // Near-zero: round caps create a circle at this point
        return {
            dashArray: `${dotLength} ${circumference}`,
            dashOffset: seg.dashOffset - segLength + dotLength
        };
    }
}
