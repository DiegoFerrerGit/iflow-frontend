import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllocationBox } from '../../../../models/allocation.model';
import { ThemeColor } from '../../../../models/income.model';

@Component({
  selector: 'app-allocation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './allocation-card.html',
  styleUrl: './allocation-card.scss'
})
export class AllocationCardComponent {
  @Input({ required: true }) box!: AllocationBox;
  @Input({ required: true }) totalPool!: number;
  @Output() delete = new EventEmitter<void>();

  get computedAmount(): number {
    if (this.totalPool === 0) return 0;

    if (this.box.calculationType === 'absoluto') {
      return this.box.targetAmount;
    } else {
      // Percentage calculation
      return (this.box.targetAmount / 100) * this.totalPool;
    }
  }

  get computedPercentage(): number {
    if (this.totalPool === 0) return 0;

    if (this.box.calculationType === 'porcentaje') {
      return this.box.targetAmount;
    } else {
      // Absolute calculation implies a percentage of the total pool
      return (this.box.targetAmount / this.totalPool) * 100;
    }
  }
}
