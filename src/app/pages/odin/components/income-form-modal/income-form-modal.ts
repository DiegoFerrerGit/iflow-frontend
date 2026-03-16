import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IncomeSource, ThemeColor, COLOR_MAP, THEME_COLORS } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { CategoryColorService } from '../../../../shared/services/category-color.service';
import { ICON_LIBRARY, DEFAULT_ICONS, IconCategory } from '../../../../shared/constants/icons.constants';
import { PersistenceService } from '../../../../shared/services/persistence.service';
import { ResponsiveState } from '../../../../core/responsive/responsive.state';

import { ToggleComponent, ToggleOption } from '../../../../shared/components/toggle/toggle.component';
import { ResponsiveDirective } from '../../../../shared/directives/responsive.directive';
import { FormsModule } from '@angular/forms';

import { PremiumColorPicker } from '../../../../shared/components/premium-color-picker/premium-color-picker';

@Component({
  selector: 'app-income-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DynamicCurrencySymbolPipe, ToggleComponent, PremiumColorPicker],
  templateUrl: './income-form-modal.html',
  styleUrl: './income-form-modal.scss'
})
export class IncomeFormModal implements OnInit {
  private categoryColorService = inject(CategoryColorService);
  private persistenceService = inject(PersistenceService);
  private readonly CONTEXT = 'income';
  public responsiveState = inject(ResponsiveState);

  @Input() initialIncome: IncomeSource | null = null;
  @Input() existingIncomes: IncomeSource[] = [];
  @Input() isLoading = false;
  @Input() onboardingMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<IncomeSource>();

  incomeForm!: FormGroup;
  showIconPicker = false;
  showTagPicker = false;
  tagSearch = '';
  activeColorMode: 'card' | 'category' = 'card';
  isClosing = false;
  defaultTags = ['Management', 'Developer', 'Consulting'];
  allThemeColors = THEME_COLORS;
  private pendingCategoryColor: ThemeColor | string | null = null;

  public currencyOptions: ToggleOption[] = [
    { label: 'USD', value: 'USD' },
    { label: 'ARS', value: 'ARS' }
  ];

  // Curated list of popular generic and tech/finance Material Icons
  public curatedIcons = [
    'account_balance', 'home', 'shopping_cart', 'restaurant', 'directions_car',
    'flight', 'school', 'health_and_safety', 'pets', 'fitness_center',
    'redeem', 'savings', 'paid', 'credit_card', 'receipt',
    'local_mall', 'sports_esports', 'movie', 'music_note', 'park',
    'bolt', 'security', 'trending_up', 'work', 'business_center'
  ];

  refinedPalette: (ThemeColor | string)[] = [
    'primary', 'cyan', 'pink', 'emerald', 'amber', 'indigo', 'orange', 'slate'
  ];

  showCustomPicker = false;
  showIconExplorer = false;
  iconSearchQuery = '';
  recentIcons: string[] = [];
  recentColors: string[] = [];
  iconCategories = ICON_LIBRARY;

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

    this.loadPersistence();

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

  get tagColor(): ThemeColor | string {
    const category = this.incomeForm.get('categoryLabel')?.value;
    if (!category && this.pendingCategoryColor) return this.pendingCategoryColor;
    return this.categoryColorService.getColor(category);
  }

  get cardColor(): ThemeColor | string {
    return this.incomeForm.get('color')?.value || 'primary';
  }

  getTagPreviewColorForColor(color: ThemeColor | string): string {
    if (this.isCustomColor(color)) return color;
    return COLOR_MAP[color as ThemeColor] || COLOR_MAP['primary'];
  }

  get availableCategoryColors(): (ThemeColor | string)[] {
    const currentCategory = this.incomeForm.get('categoryLabel')?.value;
    const usedColors = this.categoryColorService.getUsedColors();
    const currentColor = this.categoryColorService.getColor(currentCategory);
    return this.refinedPalette.filter(color => !usedColors.has(color as ThemeColor) || color === currentColor);
  }

  get availableCardColors(): (ThemeColor | string)[] {
    const currentColor = this.incomeForm.get('color')?.value;
    const usedColors = new Set(this.existingIncomes
      .filter(i => i.id !== this.initialIncome?.id)
      .map(i => i.color));
    return this.refinedPalette.filter(color => !usedColors.has(color) || color === currentColor);
  }

  get currentAvailableColors(): (ThemeColor | string)[] {
    return this.activeColorMode === 'card' ? this.availableCardColors : this.availableCategoryColors;
  }

  get activeColorSelection(): ThemeColor | string {
    return this.activeColorMode === 'card' ? this.cardColor : this.tagColor;
  }

  selectColorMode(mode: 'card' | 'category') {
    this.activeColorMode = mode;
    this.showCustomPicker = false;
  }

  selectThemeColor(color: string) {
    if (this.activeColorMode === 'card') {
      this.incomeForm.patchValue({ color });
      this.persistenceService.saveSelection(this.CONTEXT, 'colors', color);
      this.loadPersistence();
    } else {
      const category = this.incomeForm.get('categoryLabel')?.value;
      if (category) {
        this.categoryColorService.setColor(category, color as any);
        this.persistenceService.saveSelection(this.CONTEXT, 'colors', color);
        this.loadPersistence();
      } else {
        this.pendingCategoryColor = color;
      }
    }
    this.showCustomPicker = false;
  }

  handleCustomColorChange(color: string) {
    if (this.activeColorMode === 'card') {
      this.incomeForm.patchValue({ color });
    } else {
      const category = this.incomeForm.get('categoryLabel')?.value;
      if (category) {
        this.categoryColorService.setColor(category, color as any);
      } else {
        this.pendingCategoryColor = color;
      }
    }
    this.persistenceService.saveSelection(this.CONTEXT, 'colors', color);
    this.loadPersistence();
  }

  isCustomColor(color: ThemeColor | string): boolean {
    return !!color && color.startsWith('#');
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
    
    // Apply pending color if exists
    if (this.pendingCategoryColor) {
      this.categoryColorService.setColor(tag, this.pendingCategoryColor as any);
      this.pendingCategoryColor = null;
    }
    
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

  selectIcon(icon: string) {
    this.incomeForm.patchValue({ icon });
    this.persistenceService.saveSelection(this.CONTEXT, 'icons', icon);
    this.recentIcons = this.persistenceService.getRecent(this.CONTEXT, 'icons');
    if (this.showIconExplorer) {
      this.showIconExplorer = false;
    }
  }

  toggleIconExplorer() {
    this.showIconExplorer = !this.showIconExplorer;
    this.iconSearchQuery = '';
  }

  onIconSearch(event: Event) {
    this.iconSearchQuery = (event.target as HTMLInputElement).value;
  }

  get filteredIcons(): string[] {
    const combined = [...new Set([...this.recentIcons, ...DEFAULT_ICONS])];
    return combined.slice(0, 31);
  }

  private loadPersistence(): void {
    this.recentIcons = this.persistenceService.getRecent(this.CONTEXT, 'icons');
    const storedColors = this.persistenceService.getRecent(this.CONTEXT, 'colors');
    
    // Always ensure 8 colors are visible
    this.recentColors = [...storedColors];
    if (this.recentColors.length < 8) {
      const remainingSlots = 8 - this.recentColors.length;
      const defaultPaddings = this.refinedPalette.filter(c => !this.recentColors.includes(c));
      this.recentColors.push(...defaultPaddings.slice(0, remainingSlots));
    }
  }

  get filteredExplorerIcons(): string[] {
    if (!this.iconSearchQuery) return [];
    const query = this.iconSearchQuery.toLowerCase();
    const result: string[] = [];
    
    this.iconCategories.forEach(cat => {
      cat.icons.forEach(icon => {
        if (icon.name.includes(query) || icon.tags.some(t => t.includes(query))) {
          if (!result.includes(icon.name)) result.push(icon.name);
        }
      });
    });
    return result;
  }

  isImageUrl(str: string): boolean {
    if (!str) return false;
    return str.startsWith('http://') || str.startsWith('https://');
  }

  closeModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
    }, 280); // matches Tailwind animation duration
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

      // Save to persistence on submit
      if (result.icon) this.persistenceService.saveSelection(this.CONTEXT, 'icons', result.icon);
      if (result.color) this.persistenceService.saveSelection(this.CONTEXT, 'colors', result.color);

      this.save.emit(result);
    }
  }
}
