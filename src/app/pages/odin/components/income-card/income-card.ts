import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IncomeSource, ThemeColor, COLOR_MAP } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { CategoryColorService } from '../../../../shared/services/category-color.service';
import { ResponsiveState } from '../../../../core/responsive/responsive.state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-income-card',
  standalone: true,
  imports: [CommonModule, DynamicCurrencySymbolPipe, DynamicCurrencyPipe],
  templateUrl: './income-card.html',
  styleUrl: './income-card.scss',
})
export class IncomeCardComponent implements OnInit, OnDestroy {
  private categoryColorService = inject(CategoryColorService);
  public responsiveState = inject(ResponsiveState);
  private cdr = inject(ChangeDetectorRef);
  private colorSub?: Subscription;

  @Input({ required: true }) income!: IncomeSource;
  @Input() isLoading = false;
  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  ngOnInit(): void {
    this.colorSub = this.categoryColorService.colorUpdate$.subscribe(update => {
      // If the updated category matches this card's category, force Refresh
      if (update.category === this.income.category?.trim().toLowerCase()) {
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.colorSub?.unsubscribe();
  }

  isCustomColor(color: ThemeColor | string | undefined): boolean {
    if (!color) return false;
    return color.startsWith('#');
  }

  get tagColor(): ThemeColor {
    return this.categoryColorService.getColor(this.income.category);
  }

  getHexColor(color: ThemeColor | string): string {
    if (this.isCustomColor(color)) return color as string;
    return COLOR_MAP[color as ThemeColor] || COLOR_MAP['primary'];
  }

  isImageUrl(icon: string | undefined): boolean {
    if (!icon) return false;
    return icon.startsWith('http://') || icon.startsWith('https://');
  }
}
