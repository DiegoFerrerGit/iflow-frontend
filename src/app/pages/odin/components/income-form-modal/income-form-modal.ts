import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IncomeSource, ThemeColor, COLOR_MAP, THEME_COLORS } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { CategoryColorService } from '../../../../core/services/category-color.service';

@Component({
  selector: 'app-income-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicCurrencySymbolPipe],
  templateUrl: './income-form-modal.html',
  styleUrl: './income-form-modal.scss'
})
export class IncomeFormModal implements OnInit {
  private categoryColorService = inject(CategoryColorService);

  @Input() initialIncome: IncomeSource | null = null;
  @Input() existingIncomes: IncomeSource[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<IncomeSource>();

  incomeForm!: FormGroup;
  showIconPicker = false;
  showTagPicker = false;
  tagSearch = '';
  activeColorMode: 'card' | 'category' = 'card';
  defaultTags = ['Management', 'Developer', 'Consulting'];
  allThemeColors = THEME_COLORS;

  // Curated list of popular generic and tech/finance Material Icons
  public curatedIcons = [
    'category', 'account_balance', 'account_balance_wallet', 'savings', 'payments',
    'credit_card', 'request_quote', 'receipt_long', 'trending_up', 'work',
    'business_center', 'laptop_mac', 'computer', 'code', 'data_object',
    'database', 'terminal', 'memory', 'dns', 'public',
    'storefront', 'shopping_cart', 'local_shipping', 'restaurant', 'directions_car',
    'flight', 'school', 'music_note', 'movie', 'sports_esports',
    'home', 'apartment', 'build', 'engineering', 'science',
    'gavel', 'health_and_safety', 'monitor_heart', 'fitness_center', 'group',
    'person', 'support_agent', 'handshake', 'verified', 'stars',
    'bolt', 'local_fire_department', 'diamond', 'rocket_launch', 'lightbulb',
    'pie_chart', 'bar_chart', 'monitoring', 'timeline', 'hub'
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.incomeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      currency: ['USD'], // Default based on select
      categoryLabel: ['', Validators.required],
      icon: [''],
      color: ['primary'], // Default card color
      effortPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    if (this.initialIncome) {
      this.incomeForm.patchValue({
        name: this.initialIncome.name,
        role: this.initialIncome.role,
        amount: this.initialIncome.amount,
        currency: this.initialIncome.currency || 'USD',
        categoryLabel: this.initialIncome.category,
        icon: this.initialIncome.icon,
        color: this.initialIncome.color || 'primary',
        effortPercentage: this.initialIncome.effortPercentage
      });
    }
  }

  get tagColor(): ThemeColor {
    return this.categoryColorService.getColor(this.incomeForm.get('categoryLabel')?.value);
  }

  get cardColor(): ThemeColor {
    return this.incomeForm.get('color')?.value || 'primary';
  }

  getTagPreviewColorForColor(color: ThemeColor): string {
    return COLOR_MAP[color] || COLOR_MAP['primary'];
  }

  get availableCategoryColors(): ThemeColor[] {
    const currentCategory = this.incomeForm.get('categoryLabel')?.value;
    const usedColors = this.categoryColorService.getUsedColors();
    const currentColor = this.categoryColorService.getColor(currentCategory);
    return THEME_COLORS.filter(color => !usedColors.has(color) || color === currentColor);
  }

  get availableCardColors(): ThemeColor[] {
    const currentColor = this.incomeForm.get('color')?.value;
    const usedColors = new Set(this.existingIncomes
      .filter(i => i.id !== this.initialIncome?.id)
      .map(i => i.color));
    return THEME_COLORS.filter(color => !usedColors.has(color) || color === currentColor);
  }

  get currentAvailableColors(): ThemeColor[] {
    return this.activeColorMode === 'card' ? this.availableCardColors : this.availableCategoryColors;
  }

  get activeColorSelection(): ThemeColor {
    return this.activeColorMode === 'card' ? this.cardColor : this.tagColor;
  }

  selectColorMode(mode: 'card' | 'category') {
    this.activeColorMode = mode;
  }

  selectThemeColor(color: ThemeColor) {
    if (this.activeColorMode === 'card') {
      this.incomeForm.patchValue({ color });
    } else {
      const category = this.incomeForm.get('categoryLabel')?.value;
      if (category) {
        this.categoryColorService.setColor(category, color);
      }
    }
  }

  getTagPreviewColor(tag: string): string {
    const color = this.categoryColorService.getColor(tag);
    return COLOR_MAP[color] || COLOR_MAP['primary'];
  }

  get availableTags(): string[] {
    const existing = this.existingIncomes.map(i => i.category).filter(l => !!l);
    const all = Array.from(new Set([...this.defaultTags, ...existing]));
    if (!this.tagSearch) return all;
    return all.filter(t => t.toLowerCase().includes(this.tagSearch.toLowerCase()));
  }

  get exactTagMatch(): boolean {
    if (!this.tagSearch) return true;
    const existing = this.existingIncomes.map(i => i.category).filter(l => !!l);
    const all = Array.from(new Set([...this.defaultTags, ...existing]));
    return all.some(t => t.toLowerCase() === this.tagSearch.toLowerCase());
  }

  toggleTagPicker() {
    this.showTagPicker = !this.showTagPicker;
    if (this.showTagPicker) {
      this.showIconPicker = false;
      this.tagSearch = '';
    }
  }

  selectTag(tag: string) {
    this.incomeForm.patchValue({ categoryLabel: tag });
    this.showTagPicker = false;
    this.tagSearch = '';
  }

  onTagSearch(event: Event) {
    this.tagSearch = (event.target as HTMLInputElement).value;
  }

  addAndSelectTag(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const trimmed = this.tagSearch.trim();
    if (trimmed && !this.exactTagMatch) {
      this.selectTag(trimmed);
    }
  }

  toggleIconPicker() {
    this.showIconPicker = !this.showIconPicker;
    if (this.showIconPicker) {
      this.showTagPicker = false;
    }
  }

  selectIcon(icon: string) {
    this.incomeForm.patchValue({ icon });
    this.showIconPicker = false;
  }

  isImageUrl(str: string): boolean {
    if (!str) return false;
    return str.startsWith('http://') || str.startsWith('https://');
  }

  onSubmit() {
    if (this.incomeForm.valid) {
      const formValue = this.incomeForm.value;
      const availableColors: ThemeColor[] = ['primary', 'pink', 'emerald', 'amber', 'indigo', 'rose', 'orange'];

      // 1. Determine card's primary color (unique per source)
      const cardColorMatch = formValue.color;

      // 2. Icon determination
      let finalIcon = formValue.icon?.trim();

      // If empty, generate a random icon not currently in use
      if (!finalIcon) {
        const usedIcons = new Set(this.existingIncomes.map(i => i.icon).filter(i => !!i));
        const availableIcons = this.curatedIcons.filter(icon => !usedIcons.has(icon));

        // If somehow all 50+ are used, fallback to the entire list
        const poolToPickFrom = availableIcons.length > 0 ? availableIcons : this.curatedIcons;
        const randomIndex = Math.floor(Math.random() * poolToPickFrom.length);
        finalIcon = poolToPickFrom[randomIndex];
      }

      const result: IncomeSource = {
        id: this.initialIncome?.id || crypto.randomUUID(),
        name: formValue.name,
        role: formValue.role,
        amount: Number(formValue.amount),
        effortPercentage: Number(formValue.effortPercentage),
        icon: finalIcon,
        color: cardColorMatch,
        category: formValue.categoryLabel,
        currency: formValue.currency
      };

      this.save.emit(result);
    }
  }
}
