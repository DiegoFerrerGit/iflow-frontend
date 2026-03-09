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
  @Input() initialAllocation: AllocationBox | null = null;
  @Input() isLoading: boolean = false;
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
    savedAmount: 0,
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
    if (this.initialAllocation) {
      // For editing: copy existing data
      this.formData = {
        name: this.initialAllocation.name,
        description: this.initialAllocation.description,
        type: this.initialAllocation.type,
        calculationType: this.initialAllocation.calculationType,
        targetAmount: this.initialAllocation.targetAmount,
        icon: this.initialAllocation.icon,
        color: this.initialAllocation.color,
        savedAmount: this.initialAllocation.savedAmount || 0,
        savingsTarget: this.initialAllocation.savingsTarget
      };
    } else {
      // For creating: auto-pick color
      const avail = this.availableColors;
      if (avail.length > 0) {
        this.formData.color = avail[0];
      }
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

    // Only validate targetAmount and savingsTarget if it's a new allocation or relevant fields are visible
    // But since they are fixed when editing, we still want to ensure they are valid.
    const currentCalcType = this.initialAllocation ? this.initialAllocation.calculationType : this.formData.calculationType;
    const currentType = this.initialAllocation ? this.initialAllocation.type : this.formData.type;

    // For percentage, targetAmount must be > 0. For absoluto, it can be 0.
    if (currentCalcType === 'percentage' && (!this.formData.targetAmount || this.formData.targetAmount <= 0)) {
      this.errors['targetAmount'] = 'El porcentaje debe ser mayor a 0.';
    } else if (currentCalcType === 'absolute' && (this.formData.targetAmount === undefined || this.formData.targetAmount < 0)) {
      // This shouldn't happen with the UI hiding it, but for safety:
      this.formData.targetAmount = 0;
    }

    // Cross-validate maximum one last time to be safe
    if (currentCalcType === 'absolute' && this.formData.targetAmount! > this.availablePool) {
      // For absolute it's 0 usually but let's be consistent
    } else if (currentCalcType === 'percentage') {
      const percentageAmountValue = (this.formData.targetAmount! / 100) * this.totalPool;
      if (percentageAmountValue > this.availablePool) {
        this.errors['targetAmount'] = 'El porcentaje excede el dinero disponible del pool.';
      }
    }

    if (currentType === 'temporary') {
      if (!this.formData.savingsTarget || this.formData.savingsTarget <= 0) {
        this.errors['savingsTarget'] = 'El objetivo de ahorro es requerido para cajas temporales.';
      }
    }

    if (Object.keys(this.errors).length > 0) {
      return; // Stop submission
    }

    // Force original values if editing, to ensure absolute consistency
    const boxType = (this.initialAllocation ? this.initialAllocation.type : this.formData.type) as 'permanent' | 'temporary';
    const boxCalcType = (this.initialAllocation ? this.initialAllocation.calculationType : this.formData.calculationType) as 'percentage' | 'absolute';

    const boxToSave: AllocationBox = {
      id: this.initialAllocation ? this.initialAllocation.id : crypto.randomUUID(),
      name: this.formData.name!,
      description: this.formData.description!,
      type: boxType,
      calculationType: boxCalcType,
      targetAmount: boxCalcType === 'percentage' ? this.formData.targetAmount! : (this.initialAllocation?.targetAmount || 0),
      icon: this.formData.icon!,
      color: this.formData.color!,
    };

    if (boxToSave.type === 'temporary') {
      boxToSave.savingsTarget = this.formData.savingsTarget;
      boxToSave.savedAmount = this.formData.savedAmount || 0;
    }

    this.save.emit(boxToSave);
  }
}
