import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';

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
}

@Component({
    selector: 'app-donut-chart',
    standalone: true,
    imports: [CommonModule, DecimalPipe, CurrencyPipe],
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent {
    @Input() segments: DonutChartSegment[] = [];
    @Input() title?: string;

    hoveredSegment: DonutChartSegment | null = null;
}
