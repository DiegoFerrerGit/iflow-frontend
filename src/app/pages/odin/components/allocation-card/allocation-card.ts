import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AllocationBox } from '../../../../models/allocation.model';
import { ThemeColor, COLOR_MAP } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';

@Component({
  selector: 'app-allocation-card',
  standalone: true,
  imports: [CommonModule, RouterModule, DynamicCurrencyPipe, DynamicCurrencySymbolPipe],
  templateUrl: './allocation-card.html',
  styleUrl: './allocation-card.scss'
})
export class AllocationCardComponent {
  @Input({ required: true }) box!: AllocationBox;
  @Input({ required: true }) totalPool!: number;
  @Input() isLoading: boolean = false;
  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  get computedAmount(): number {
    if (this.totalPool === 0) return 0;

    if (this.box.calculationType === 'absolute') {
      return this.box.targetAmount;
    } else {
      // Percentage calculation
      return (this.box.targetAmount / 100) * this.totalPool;
    }
  }

  get computedPercentage(): number {
    if (this.totalPool === 0) return 0;

    if (this.box.calculationType === 'percentage') {
      return this.box.targetAmount;
    } else {
      // Absolute calculation implies a percentage of the total pool
      return (this.box.targetAmount / this.totalPool) * 100;
    }
  }

  getHexColor(color: ThemeColor | string): string {
    if (!color) return COLOR_MAP['primary'];
    // If it's a hex color (starts with #), return it directly
    if (color.startsWith('#')) return color;
    // Otherwise, look it up in the COLOR_MAP
    return COLOR_MAP[color as ThemeColor] || COLOR_MAP['primary'];
  }
}
