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
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<IncomeSource>();

  incomeForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.incomeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      currency: ['USD ($)'], // Default based on select
      categoryLabel: ['', Validators.required],
      icon: ['category'],
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

  onSubmit() {
    if (this.incomeForm.valid) {
      const formValue = this.incomeForm.value;

      const categoryTypeMatch = this.initialIncome?.category.type || 'primary'; // Simplification for now

      const result: IncomeSource = {
        id: this.initialIncome?.id || crypto.randomUUID(),
        name: formValue.name,
        role: formValue.role,
        amount: Number(formValue.amount),
        effortPercentage: Number(formValue.effortPercentage),
        icon: formValue.icon,
        category: {
          label: formValue.categoryLabel,
          type: categoryTypeMatch as any
        }
      };

      this.save.emit(result);
    }
  }
}
