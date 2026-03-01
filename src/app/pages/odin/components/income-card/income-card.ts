import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IncomeSource } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';

@Component({
  selector: 'app-income-card',
  standalone: true,
  imports: [CommonModule, DynamicCurrencySymbolPipe, DynamicCurrencyPipe],
  templateUrl: './income-card.html',
  styleUrl: './income-card.scss',
})
export class IncomeCardComponent {
  @Input({ required: true }) income!: IncomeSource;
  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  isImageUrl(icon: string | undefined): boolean {
    if (!icon) return false;
    return icon.startsWith('http://') || icon.startsWith('https://');
  }
}
