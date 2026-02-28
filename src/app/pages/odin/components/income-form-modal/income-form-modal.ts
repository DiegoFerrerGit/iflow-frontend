import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IncomeSource, ThemeColor } from '../../../../models/income.model';

@Component({
  selector: 'app-income-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './income-form-modal.html',
  styleUrl: './income-form-modal.scss'
})
export class IncomeFormModal implements OnInit {
  @Input() initialIncome: IncomeSource | null = null;
  @Input() existingIncomes: IncomeSource[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<IncomeSource>();

  incomeForm!: FormGroup;
  showIconPicker = false;
  showTagPicker = false;
  tagSearch = '';
  defaultTags = ['Management', 'Developer', 'Consulting'];

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
      currency: ['USD ($)'], // Default based on select
      categoryLabel: ['', Validators.required],
      icon: [''],
      effortPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    if (this.initialIncome) {
      this.incomeForm.patchValue({
        name: this.initialIncome.name,
        role: this.initialIncome.role,
        amount: this.initialIncome.amount,
        categoryLabel: this.initialIncome.category.label,
        icon: this.initialIncome.icon,
        effortPercentage: this.initialIncome.effortPercentage
      });
    }
  }

  get availableTags(): string[] {
    const existing = this.existingIncomes.map(i => i.category.label).filter(l => !!l);
    const all = Array.from(new Set([...this.defaultTags, ...existing]));
    if (!this.tagSearch) return all;
    return all.filter(t => t.toLowerCase().includes(this.tagSearch.toLowerCase()));
  }

  get exactTagMatch(): boolean {
    if (!this.tagSearch) return true;
    const existing = this.existingIncomes.map(i => i.category.label).filter(l => !!l);
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
      let cardColorMatch = this.initialIncome?.color;
      if (!cardColorMatch) {
        const usedColors = new Set(this.existingIncomes.map(i => i.color));
        const unusedColors = availableColors.filter(c => !usedColors.has(c));
        const pool = unusedColors.length > 0 ? unusedColors : availableColors;
        cardColorMatch = pool[Math.floor(Math.random() * pool.length)];
      }

      // 2. Determine category color (consistent across identical tags)
      let categoryColorMatch: ThemeColor = this.initialIncome?.category.color || 'primary';
      const typedCategory = formValue.categoryLabel?.trim().toLowerCase();

      // If we're creating a new one rather than editing, or if the name changed, verify existence
      if (!this.initialIncome || this.initialIncome.category.label.toLowerCase() !== typedCategory) {
        const existingCategoryIndex = this.existingIncomes.findIndex(i => i.category.label.toLowerCase() === typedCategory);
        if (existingCategoryIndex !== -1) {
          categoryColorMatch = this.existingIncomes[existingCategoryIndex].category.color;
        } else {
          // It's a brand new tag, pick a random color
          categoryColorMatch = availableColors[Math.floor(Math.random() * availableColors.length)];
        }
      }

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
        category: {
          label: formValue.categoryLabel,
          color: categoryColorMatch
        }
      };

      this.save.emit(result);
    }
  }
}
