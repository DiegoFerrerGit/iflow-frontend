import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IncomeSource, ThemeColor, COLOR_MAP } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { CategoryColorService } from '../../../../core/services/category-color.service';

@Component({
  selector: 'app-income-card',
  standalone: true,
  imports: [CommonModule, DynamicCurrencySymbolPipe, DynamicCurrencyPipe],
  templateUrl: './income-card.html',
  styleUrl: './income-card.scss',
})
export class IncomeCardComponent {
  private categoryColorService = inject(CategoryColorService);

  @Input({ required: true }) income!: IncomeSource;
  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  isImageUrl(icon: string | undefined): boolean {
    if (!icon) return false;
    return icon.startsWith('http://') || icon.startsWith('https://');
  }

  get tagColor(): ThemeColor {
    return this.categoryColorService.getColor(this.income.category);
  }

  getHexColor(color: ThemeColor): string {
    return COLOR_MAP[color] || COLOR_MAP['primary'];
  }
}
