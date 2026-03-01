import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllocationBox } from '../../../../models/allocation.model';
import { ThemeColor } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';

@Component({
  selector: 'app-allocation-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicCurrencyPipe, DynamicCurrencySymbolPipe],
  templateUrl: './allocation-form-modal.html',
  styleUrl: './allocation-form-modal.scss'
})
export class AllocationFormModalComponent implements OnInit {
  @Input() totalPool: number = 0;
  @Input() availablePool: number = 0;
  @Input() existingAllocations: AllocationBox[] = [];
  @Output() save = new EventEmitter<AllocationBox>();
  @Output() cancel = new EventEmitter<void>();

  Math = Math; // To expose Math floor/min max to template if needed

  // Form Model
  formData: Partial<AllocationBox> = {
    name: '',
    description: '',
    type: 'permanent',
    calculationType: 'absolute',
    targetAmount: 0,
    icon: 'category',
    color: 'emerald',
    savingsTarget: undefined
  };

  errors: { [key: string]: string } = {};

  iconsList = [
    'account_balance', 'home', 'shopping_cart', 'restaurant', 'directions_car',
    'flight', 'school', 'health_and_safety', 'pets', 'fitness_center',
    'redeem', 'savings', 'paid', 'credit_card', 'receipt',
    'local_mall', 'sports_esports', 'movie', 'music_note', 'park',
    'bolt', 'security', 'trending_up', 'work', 'business_center'
  ];

  colorsList: ThemeColor[] = ['primary', 'pink', 'emerald', 'amber', 'indigo', 'rose', 'orange', 'fuchsia'];

  get availableColors(): ThemeColor[] {
    const usedColors = this.existingAllocations.map(a => a.color);
    return this.colorsList.filter(c => !usedColors.includes(c));
  }

  isColorInUse(color: ThemeColor): boolean {
    return this.existingAllocations.some(a => a.color === color);
  }

  ngOnInit(): void {
    const avail = this.availableColors;
    if (avail.length > 0) {
      this.formData.color = avail[0]; // Auto pick first completely free color
    }
  }

  get computedPercentageValue(): number {
    if (!this.formData.targetAmount || this.totalPool === 0) return 0;
    return (this.formData.targetAmount / this.totalPool) * 100;
  }

  get computedAbsoluteValue(): number {
    if (!this.formData.targetAmount) return 0;
    return (this.formData.targetAmount / 100) * this.totalPool;
  }

  get availablePoolPercentage(): number {
    if (this.totalPool === 0) return 0;
    return (this.availablePool / this.totalPool) * 100;
  }

  selectColor(color: ThemeColor) {
    this.formData.color = color;
  }

  selectIcon(icon: string) {
    this.formData.icon = icon;
  }

  // Handle number input changes to enforce constraints
  onAmountChange(value: number | string) {
    this.errors = {}; // reset errors

    if (this.formData.calculationType === 'absolute') {
      // Enforce exactly 0
      this.formData.targetAmount = 0;
      return;
    }

    const numValue = Number(value) || 0;
    // It's percentage
    const maxPercentage = (this.availablePool / this.totalPool) * 100;

    // We only enforce maximums, not minimums dynamically to avoid frustrating typing experience
    if (numValue > maxPercentage) {
      this.formData.targetAmount = maxPercentage;
      this.errors['targetAmount'] = `Porcentaje excede el disponible (${maxPercentage.toFixed(1)}%). Limitado al máximo.`;
    } else {
      this.formData.targetAmount = numValue;
    }
  }

  onSubmit() {
    this.errors = {}; // Reset

    // Validation
    if (!this.formData.name?.trim()) {
      this.errors['name'] = 'El nombre es requerido.';
    }
    if (!this.formData.description?.trim()) {
      this.errors['description'] = 'La descripción es requerida.';
    }

    // For percentage, targetAmount must be > 0. For absoluto, it can be 0.
    if (this.formData.calculationType === 'percentage' && (!this.formData.targetAmount || this.formData.targetAmount <= 0)) {
      this.errors['targetAmount'] = 'El porcentaje debe ser mayor a 0.';
    } else if (this.formData.calculationType === 'absolute' && (this.formData.targetAmount === undefined || this.formData.targetAmount < 0)) {
      this.errors['targetAmount'] = 'El monto debe ser 0 o mayor.';
    }

    // Cross-validate maximum one last time to be safe
    if (this.formData.calculationType === 'absolute' && this.formData.targetAmount! > this.availablePool) {
      this.errors['targetAmount'] = 'El monto excede el disponible.';
    } else if (this.formData.calculationType === 'percentage') {
      const percentageAmountValue = (this.formData.targetAmount! / 100) * this.totalPool;
      if (percentageAmountValue > this.availablePool) {
        this.errors['targetAmount'] = 'El porcentaje excede el dinero disponible del pool.';
      }
    }

    if (this.formData.type === 'temporary') {
      if (!this.formData.savingsTarget || this.formData.savingsTarget <= 0) {
        this.errors['savingsTarget'] = 'El objetivo de ahorro es requerido para cajas temporales.';
      }
    }

    if (Object.keys(this.errors).length > 0) {
      return; // Stop submission
    }

    const newBox: AllocationBox = {
      id: crypto.randomUUID(),
      name: this.formData.name!,
      description: this.formData.description!,
      type: this.formData.type as 'permanent' | 'temporary',
      calculationType: this.formData.calculationType as 'percentage' | 'absolute',
      targetAmount: this.formData.targetAmount!,
      icon: this.formData.icon!,
      color: this.formData.color!,
    };

    if (newBox.type === 'temporary') {
      newBox.savingsTarget = this.formData.savingsTarget;
      newBox.savedAmount = 0; // Starts at 0
    }

    this.save.emit(newBox);
  }
}
