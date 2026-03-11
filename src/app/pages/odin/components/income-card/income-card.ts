import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IncomeSource, ThemeColor, COLOR_MAP } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { CategoryColorService } from '../../../../shared/services/category-color.service';
import { ResponsiveState } from '../../../../core/responsive/responsive.state';

@Component({
  selector: 'app-income-card',
  standalone: true,
  imports: [CommonModule, DynamicCurrencySymbolPipe, DynamicCurrencyPipe],
  templateUrl: './income-card.html',
  styleUrl: './income-card.scss',
})
export class IncomeCardComponent {
  private categoryColorService = inject(CategoryColorService);
  public responsiveState = inject(ResponsiveState);

  @Input({ required: true }) income!: IncomeSource;
  @Input() isLoading = false;
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
