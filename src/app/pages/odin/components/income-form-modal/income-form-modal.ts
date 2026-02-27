import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IncomeSource } from '../../../../models/income.model';

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

  toggleIconPicker() {
    this.showIconPicker = !this.showIconPicker;
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

      const categoryTypeMatch = this.initialIncome?.category.type || 'primary'; // Simplification for now

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
        category: {
          label: formValue.categoryLabel,
          type: categoryTypeMatch as any
        }
      };

      this.save.emit(result);
    }
  }
}
