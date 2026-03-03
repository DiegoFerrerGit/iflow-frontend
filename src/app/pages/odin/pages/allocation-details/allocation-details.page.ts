import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { OdinMockService } from '../../../../modules/odin/services/odin-mock.service';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { DonutChartComponent, DonutChartSegment } from '../../../../shared/components/donut-chart/donut-chart.component';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button';
import { AmountWithCurrency, OdinAllocationBoxResponse, AllocationSubCategoryDto } from '../../../../../../mock/odin-nivel2.endpoints';
import { ThemeColor, COLOR_MAP } from '../../../../models/income.model';
import { CurrencyState } from '../../../../core/services/currency-state';
import { LoaderService } from '../../../../core/services/loader.service';
import { SubCategoryFormModal } from '../../components/sub-category-form-modal/sub-category-form-modal';
import { DeleteConfirmationModal } from '../../components/delete-confirmation-modal/delete-confirmation-modal';

export interface AllocationDetailsData extends OdinAllocationBoxResponse {
  parentBoxType?: 'percentage' | 'absolute';
}

// Map ThemeColor to valid Tailwind text class (some colors like 'crimson' don't have Tailwind equivalents)
const TEXT_CLASS_MAP: Record<string, string> = {
  'primary': 'text-purple-400',
  'cyan': 'text-cyan-400',
  'pink': 'text-pink-400',
  'emerald': 'text-emerald-400',
  'amber': 'text-amber-400',
  'indigo': 'text-indigo-400',
  'rose': 'text-rose-400',
  'orange': 'text-orange-400',
  'blue': 'text-blue-400',
  'fuchsia': 'text-fuchsia-400',
  'sky': 'text-sky-400',
  'royal': 'text-indigo-500',
  'crimson': 'text-red-400',
  'teal': 'text-teal-400',
  'violet': 'text-violet-400',
  'gold': 'text-yellow-400',
  'clay': 'text-stone-400',
  'slate': 'text-slate-400'
};

@Component({
  selector: 'app-allocation-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DynamicCurrencyPipe,
    DynamicCurrencySymbolPipe,
    DonutChartComponent,
    BackButtonComponent,
    SubCategoryFormModal,
    DeleteConfirmationModal
  ],
  templateUrl: './allocation-details.page.html',
  styleUrl: './allocation-details.page.scss'
})
export class AllocationDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mockService = inject(OdinMockService);
  public currencyState = inject(CurrencyState);
  private loaderService = inject(LoaderService);

  boxId = signal<string | null>(null);
  allocationData = signal<AllocationDetailsData | null>(null);

  // Modal State
  isSubCategoryModalOpen = signal(false);
  subCategoryToEdit = signal<AllocationSubCategoryDto | null>(null);

  // Delete Modal State
  isDeleteModalOpen = signal(false);
  subCategoryToDelete = signal<AllocationSubCategoryDto | null>(null);

  // Computed helper for box type
  parentBoxType = computed(() => this.allocationData()?.parentBoxType || 'absolute');

  assignedTotal = computed(() => {
    const data = this.allocationData();
    if (!data || !data.subCategories) return 0;

    return data.subCategories.reduce((sum: number, sub: AllocationSubCategoryDto) => {
      const isFixedArs = sub.displayAmount.currency === 'ARS';
      const parsedAmount = (isFixedArs && this.currencyState.currentCurrency() === 'USD')
        ? sub.displayAmount.amount / this.currencyState.exchangeRate()
        : (sub.displayAmount.currency === 'USD' && this.currencyState.currentCurrency() === 'ARS')
          ? sub.displayAmount.amount * this.currencyState.exchangeRate()
          : sub.displayAmount.amount;
      return sum + parsedAmount;
    }, 0);
  });

  // How many actual subcategories (excluding 'unassigned' donut segment)
  subCategoryCount = computed(() => {
    const data = this.allocationData();
    return data?.subCategories?.length ?? 0;
  });

  // Computed signal to feed the Donut Chart
  donutSegments = computed<DonutChartSegment[]>(() => {
    const data = this.allocationData();
    if (!data || !data.subCategories) return [];

    // 1. Map amounts and calculate category total
    const mappedCategories = data.subCategories.map((sub: AllocationSubCategoryDto) => {
      const isFixedArs = sub.displayAmount.currency === 'ARS';
      const parsedAmount = (isFixedArs && this.currencyState.currentCurrency() === 'USD')
        ? sub.displayAmount.amount / this.currencyState.exchangeRate()
        : (sub.displayAmount.currency === 'USD' && this.currencyState.currentCurrency() === 'ARS')
          ? sub.displayAmount.amount * this.currencyState.exchangeRate()
          : sub.displayAmount.amount;

      return { ...sub, calculatedAmount: parsedAmount };
    });

    const totalCalculatedAmount = mappedCategories.reduce((sum, sub) => sum + sub.calculatedAmount, 0);
    const parsedAvailableAmount = this.parentBoxType() === 'absolute' ? totalCalculatedAmount : this.totalAvailableAmountForDonut();
    const unassigned = Math.max(0, parsedAvailableAmount - totalCalculatedAmount);

    // 2. Setup visual constants
    const circumference = 2 * Math.PI * 50; // Donut r=50
    const gap = 2.5; // Visual gap in pixels
    let currentOffset = 0;

    const totalSegments = mappedCategories.length + (unassigned > 0 ? 1 : 0);

    // 3. Map to Donut segments
    let segments = mappedCategories.map((sub: AllocationSubCategoryDto & { calculatedAmount: number }) => {
      const percentage = parsedAvailableAmount > 0 ? (sub.calculatedAmount / parsedAvailableAmount) * 100 : 0;
      const strokeLength = (percentage / 100) * circumference;
      const visualStrokeLength = totalSegments > 1 ? Math.max(0, strokeLength - gap) : strokeLength;
      const initialOffset = currentOffset;
      currentOffset += strokeLength;

      return {
        id: sub.id,
        name: sub.name,
        amount: sub.calculatedAmount,
        color: COLOR_MAP[sub.color as ThemeColor] || '#64748b',
        amountColorClass: (sub.color ? TEXT_CLASS_MAP[sub.color] : undefined) || 'text-slate-400',
        percentage: percentage,
        dashArray: `${visualStrokeLength} ${circumference - visualStrokeLength}`,
        dashOffset: -initialOffset,
        type: sub.type as string,
        icon: sub.icon,
        colorName: sub.color
      };
    });

    // Remanente ("Sin Asignar") Segment
    if (unassigned > 0) {
      const percentage = (unassigned / parsedAvailableAmount) * 100;
      const strokeLength = (percentage / 100) * circumference;
      const visualStrokeLength = totalSegments > 1 ? Math.max(0, strokeLength - gap) : strokeLength;
      const initialOffset = currentOffset;

      segments.push({
        id: 'unassigned',
        name: 'Sin Asignar',
        amount: unassigned,
        color: '#22d3ee', // cyan-400
        amountColorClass: 'text-cyan-400',
        percentage: percentage,
        dashArray: `${visualStrokeLength} ${circumference - visualStrokeLength}`,
        dashOffset: -initialOffset,
        type: 'fixed_amount', // Since it's a calculated remainder
        icon: 'help_outline',
        colorName: 'cyan'
      });
    }

    return segments;
  });

  usedColors = computed(() => {
    const data = this.allocationData();
    if (!data || !data.subCategories) return [];
    return data.subCategories
      .map(s => s.color)
      .filter((c): c is ThemeColor => !!c);
  });

  totalAvailableAmountForDonut = computed<number>(() => {
    const data = this.allocationData();
    if (!data) return 0;
    // Base amount is always USD, apply conversion if needed
    if (this.currencyState.currentCurrency() === 'ARS') {
      return data.availableAmountToAssign * this.currencyState.exchangeRate();
    }
    return data.availableAmountToAssign;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.boxId.set(id);
        this.loadDetails(id);
      }
    });
  }

  loadDetails(id: string) {
    this.loaderService.show();
    setTimeout(() => {
      const data = this.mockService.getAllocationBoxLevel2(id);
      this.allocationData.set(data);
      this.loaderService.hide();
    }, 8000); // Increased from 1500 to 8000 for screenshot testing
  }

  goBack() {
    this.router.navigate(['/odin']);
  }

  getBoxName(): string {
    const id = this.boxId();
    if (!id) return 'Categoría Principal';
    const boxes = this.mockService.getAllocations();
    const box = boxes.find((b: any) => b.id === id);
    return box ? box.name : 'Categoría Principal';
  }

  // Helper function to safely apply dynamic currency inline if needed
  getConvertedAmount(amountData: AmountWithCurrency): number {
    const targetCurrency = this.currencyState.currentCurrency();
    const { amount, currency } = amountData;

    if (currency === targetCurrency) return amount;

    if (currency === 'USD' && targetCurrency === 'ARS') {
      return amount * this.currencyState.exchangeRate();
    }

    if (currency === 'ARS' && targetCurrency === 'USD') {
      return amount / this.currencyState.exchangeRate();
    }

    return amount;
  }

  getUnassignedAmount(): number {
    const data = this.allocationData();
    if (!data) return 0;

    const available = this.totalAvailableAmountForDonut();
    let totalAssigned = 0;
    data.subCategories.forEach(sub => {
      totalAssigned += this.getConvertedAmount(sub.displayAmount);
    });
    return Math.max(0, available - totalAssigned);
  }

  getAssignedPercentage(): number {
    const data = this.allocationData();
    if (!data) return 0;
    const available = this.totalAvailableAmountForDonut();
    if (available === 0) return 0;
    const unassigned = this.getUnassignedAmount();
    return ((available - unassigned) / available) * 100;
  }

  getMissingAmount(): number | null {
    if (this.parentBoxType() === 'absolute') return null;
    const u = this.getUnassignedAmount();
    return u > 0 ? u : null;
  }

  getCalculationType(): string {
    return this.parentBoxType() === 'absolute' ? 'ABSOLUTO' : 'PORCENTAJE';
  }

  // --- Modal Handlers ---

  openSubCategoryModal(segment?: DonutChartSegment) {
    if (segment && segment.id !== 'unassigned') {
      const data = this.allocationData();
      const sub = data?.subCategories.find(s => s.id === segment.id);
      this.subCategoryToEdit.set(sub || null);
    } else {
      this.subCategoryToEdit.set(null);
    }
    this.isSubCategoryModalOpen.set(true);
  }

  closeSubCategoryModal() {
    this.isSubCategoryModalOpen.set(false);
    this.subCategoryToEdit.set(null);
  }

  handleSaveSubCategory(subCategory: AllocationSubCategoryDto) {
    const data = this.allocationData();
    if (!data) return;

    const existingIndex = data.subCategories.findIndex(s => s.id === subCategory.id);
    if (existingIndex !== -1) {
      data.subCategories[existingIndex] = subCategory;
    } else {
      data.subCategories.push(subCategory);
    }

    this.allocationData.set({ ...data }); // Trigger reactivity
    this.closeSubCategoryModal();
  }

  deleteSubCategory(id: string) {
    const data = this.allocationData();
    if (!data) return;

    const sub = data.subCategories.find(s => s.id === id);
    if (sub) {
      this.subCategoryToDelete.set(sub);
      this.isDeleteModalOpen.set(true);
    }
  }

  cancelDeleteSubCategory() {
    this.isDeleteModalOpen.set(false);
    this.subCategoryToDelete.set(null);
  }

  confirmDeleteSubCategory() {
    const data = this.allocationData();
    const sub = this.subCategoryToDelete();
    if (!data || !sub) return;

    data.subCategories = data.subCategories.filter(s => s.id !== sub.id);
    this.allocationData.set({ ...data }); // Trigger reactivity
    this.cancelDeleteSubCategory();
  }
}
