import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllocationBox } from '../../../../models/allocation.model';
import { ThemeColor } from '../../../../models/income.model';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { ToggleComponent, ToggleOption } from '../../../../shared/components/toggle/toggle.component';
import { PremiumColorPicker } from '../../../../shared/components/premium-color-picker/premium-color-picker';
import { PersistenceService } from '../../../../shared/services/persistence.service';
import { ICON_LIBRARY, DEFAULT_ICONS, IconCategory } from '../../../../shared/constants/icons.constants';
import { ResponsiveState } from '../../../../core/responsive/responsive.state';

@Component({
  selector: 'app-allocation-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicCurrencyPipe, DynamicCurrencySymbolPipe, ToggleComponent, PremiumColorPicker],
  templateUrl: './allocation-form-modal.html',
  styleUrl: './allocation-form-modal.scss'
})
export class AllocationFormModalComponent implements OnInit {
  public responsiveState = inject(ResponsiveState);
  @Input() totalPool: number = 0;
  @Input() availablePool: number = 0;
  @Input() existingAllocations: AllocationBox[] = [];
  @Input() initialAllocation: AllocationBox | null = null;
  @Input() isLoading: boolean = false;
  @Input() onboardingMode = false;
  @Output() save = new EventEmitter<AllocationBox>();
  @Output() cancel = new EventEmitter<void>();

  constructor(private persistenceService: PersistenceService) { }

  showCustomPicker = false;
  showIconExplorer = false;
  iconSearchQuery = '';
  recentIcons: string[] = [];

  public calculationTypeOptions: ToggleOption[] = [
    { label: 'Fijo con categorías', value: 'absolute', icon: 'list_alt' },
    { label: 'Porcentaje', value: 'percentage', icon: 'percent' }
  ];

  public typeOptions: ToggleOption[] = [
    { label: 'Permanente', value: 'permanent', icon: 'lock' },
    { label: 'Temporal (Objetivo)', value: 'temporary', icon: 'flag' }
  ];

  Math = Math;

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

  isClosing = false;
  errors: { [key: string]: string } = {};

  iconsList = [...DEFAULT_ICONS];

  get filteredIcons(): string[] {
    // Show Recents + Defaults (limited based on device)
    const combined = [...new Set([...this.recentIcons, ...this.iconsList])];
    const limit = this.responsiveState.isMobile() ? 29 : 31;
    return combined.slice(0, limit);
  }

  get iconCategories(): IconCategory[] {
    return ICON_LIBRARY;
  }

  colorsList: string[] = [
    'primary', 'cyan', 'pink', 'emerald', 'amber', 'indigo', 'rose', 'orange', 'blue', 'fuchsia', 'violet'
  ];

  get displayColors(): string[] {
    const limit = this.responsiveState.isMobile() ? 5 : 11;
    return this.recentColors.slice(0, limit);
  }

  public recentColors: string[] = [];

  get availableColors(): (ThemeColor | string)[] {
    const usedColors = this.existingAllocations.map(a => a.color);
    return this.colorsList.filter(c => !usedColors.includes(c));
  }

  isColorInUse(color: ThemeColor | string): boolean {
    return this.existingAllocations.some(a => a.color === color);
  }

  ngOnInit(): void {
    this.recentIcons = this.persistenceService.getRecent('allocation', 'icons');
    this.recentColors = this.persistenceService.getRecent('allocation', 'colors');

    // Ensure recent colors are populated up to 11 items for desktop
    if (this.recentColors.length < 11) {
      const remainingSlots = 11 - this.recentColors.length;
      const defaultPaddings = this.colorsList.filter(c => !this.recentColors.includes(c));
      this.recentColors.push(...defaultPaddings.slice(0, remainingSlots));
    }

    if (this.onboardingMode) {
      // Onboarding: pre-fill 'Inversión' with locked fields
      this.formData = {
        name: 'Inversión',
        description: 'Patrimonio & Capital',
        type: 'permanent',
        calculationType: 'percentage',
        targetAmount: 0,
        icon: 'trending_up',
        color: 'emerald',
        savedAmount: 0,
        savingsTarget: undefined
      };
    } else if (this.initialAllocation) {
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

  get effectiveAvailablePool(): number {
    if (this.initialAllocation && this.initialAllocation.calculationType === 'percentage') {
      const initialAmountInUsd = (this.initialAllocation.targetAmount / 100) * this.totalPool;
      return this.availablePool + initialAmountInUsd;
    }
    return this.availablePool;
  }

  get availablePoolPercentage(): number {
    if (this.totalPool === 0) return 0;
    return (this.effectiveAvailablePool / this.totalPool) * 100;
  }

  selectColor(color: string) {
    if (this.onboardingMode || this.isColorInUse(color)) return;
    this.formData.color = color;
    this.persistenceService.saveSelection('allocation', 'colors', color);
    this.recentColors = this.persistenceService.getRecent('allocation', 'colors');
    this.showCustomPicker = false;
  }

  selectHexColor(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.formData.color = input.value;
    }
  }

  handleCustomColorChange(color: string) {
    this.formData.color = color;
    this.persistenceService.saveSelection('allocation', 'colors', color);
    this.recentColors = this.persistenceService.getRecent('allocation', 'colors');
  }

  isCustomColor(color: ThemeColor | string): boolean {
    return !!color && color.startsWith('#');
  }

  selectIcon(icon: string) {
    this.formData.icon = icon;
    this.persistenceService.saveSelection('allocation', 'icons', icon);
    this.recentIcons = this.persistenceService.getRecent('allocation', 'icons');
    this.showIconExplorer = false;
    this.iconSearchQuery = '';
  }

  get filteredExplorerIcons(): string[] {
    const query = this.iconSearchQuery.toLowerCase().trim();
    if (!query) return [];

    // Search across ALL categories by name or tags
    const allAvailable = ICON_LIBRARY.flatMap(cat => cat.icons);

    return [...new Set(allAvailable
      .filter(icon =>
        icon.name.toLowerCase().includes(query) ||
        icon.tags.some(tag => tag.toLowerCase().includes(query))
      )
      .map(icon => icon.name))];
  }

  toggleIconExplorer() {
    this.showIconExplorer = !this.showIconExplorer;
    if (!this.showIconExplorer) {
      this.iconSearchQuery = '';
    }
  }

  onIconSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.iconSearchQuery = input?.value || '';
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
    const maxPercentage = (this.effectiveAvailablePool / this.totalPool) * 100;

    // We only enforce maximums, not minimums dynamically to avoid frustrating typing experience
    if (numValue > maxPercentage) {
      this.formData.targetAmount = Number(maxPercentage.toFixed(1));
      this.errors['targetAmount'] = `Porcentaje excede el disponible (${maxPercentage.toFixed(1)}%). Limitado al máximo.`;
    } else {
      this.formData.targetAmount = numValue;
    }
  }

  closeModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.cancel.emit();
    }, 280);
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

    // Save icon usage to persistence (handled via selectIcon usually, but for safety)
    if (this.formData.icon) {
      this.persistenceService.saveSelection('allocation', 'icons', this.formData.icon);
    }
    if (this.formData.color) {
      this.persistenceService.saveSelection('allocation', 'colors', this.formData.color);
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
      if (percentageAmountValue > this.effectiveAvailablePool + 0.01) { // 0.01 for floating point safety
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
