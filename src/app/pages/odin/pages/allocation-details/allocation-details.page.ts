import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OdinApiService } from '../../../../modules/odin/odin.api';
import { IAllocationBoxDetailResponse, IAllocationSubCategoryDto, IOdinResponse } from '../../../../modules/odin/models/interfaces/api.response.interfaces';
import { IAllocationSubCategoryRequestApi } from '../../../../modules/odin/models/interfaces/api.request.interfaces';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { DonutChartComponent, DonutChartSegment } from '../../../../shared/components/donut-chart/donut-chart.component';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button';
import { ThemeColor, COLOR_MAP } from '../../../../models/income.model';
import { CurrencyState } from '../../../../core/currency-manager/currency-state';
import { LoaderService } from '../../../../core/loader-manager/loader.service';
import { SubCategoryFormModal } from '../../components/sub-category-form-modal/sub-category-form-modal';
import { DeleteConfirmationModal } from '../../components/delete-confirmation-modal/delete-confirmation-modal';

// Map ThemeColor to valid Tailwind text class
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
  private odinApi = inject(OdinApiService);
  public currencyState = inject(CurrencyState);
  private loaderService = inject(LoaderService);

  trueBoxCapacity = signal<number | null>(null);
  boxPercentage = signal<number | null>(null);

  // #region STATE

  boxId = signal<string | null>(null);
  allocationData = signal<IAllocationBoxDetailResponse | null>(null);
  initialName = signal<string | null>(null);
  initialType = signal<string | null>(null);

  // Modal Loading State
  isSubCategoryModalOpen = signal(false);
  isSubCategoryModalSaving = signal(false);
  subCategoryToEdit = signal<IAllocationSubCategoryDto | null>(null);

  // Delete Modal State
  isDeleteModalOpen = signal(false);
  isDeletingSubCategory = signal(false);
  subCategoryToDelete = signal<IAllocationSubCategoryDto | null>(null);

  // Computed helper for box type
  parentBoxType = computed(() => this.allocationData()?.calculation_type || this.initialType() || 'absolute');

  assignedTotal = computed(() => {
    const data = this.allocationData();
    if (!data || !data.sub_categories) return 0;

    return data.sub_categories.reduce((sum: number, sub: IAllocationSubCategoryDto) => {
      const isFixedArs = sub.display_amount.currency === 'ARS';
      const parsedAmount = (isFixedArs && this.currencyState.currentCurrency() === 'USD')
        ? sub.display_amount.amount / this.currencyState.exchangeRate()
        : (sub.display_amount.currency === 'USD' && this.currencyState.currentCurrency() === 'ARS')
          ? sub.display_amount.amount * this.currencyState.exchangeRate()
          : sub.display_amount.amount;
      return sum + parsedAmount;
    }, 0);
  });

  subCategoryCount = computed(() => {
    const data = this.allocationData();
    return data?.sub_categories?.length ?? 0;
  });

  donutSegments = computed<DonutChartSegment[]>(() => {
    const data = this.allocationData();
    if (!data || !data.sub_categories) return [];

    const mappedCategories = data.sub_categories.map((sub: IAllocationSubCategoryDto) => {
      const isFixedArs = sub.display_amount.currency === 'ARS';
      const parsedAmount = (isFixedArs && this.currencyState.currentCurrency() === 'USD')
        ? sub.display_amount.amount / this.currencyState.exchangeRate()
        : (sub.display_amount.currency === 'USD' && this.currencyState.currentCurrency() === 'ARS')
          ? sub.display_amount.amount * this.currencyState.exchangeRate()
          : sub.display_amount.amount;

      return { ...sub, calculatedAmount: parsedAmount };
    });

    const totalCalculatedAmount = mappedCategories.reduce((sum, sub) => sum + sub.calculatedAmount, 0);
    const parsedAvailableAmount = this.parentBoxType() === 'absolute' ? totalCalculatedAmount : this.totalAvailableAmountForDonut();
    const unassigned = this.parentBoxType() === 'absolute' ? 0 : Math.max(0, parsedAvailableAmount - totalCalculatedAmount);

    const circumference = 2 * Math.PI * 50;
    const totalSegmentsCount = mappedCategories.length + (unassigned > 0 ? 1 : 0);
    const gap = 0;
    let currentOffset = 0;

    let segments = mappedCategories.map((sub) => {
      const percentage = parsedAvailableAmount > 0 ? (sub.calculatedAmount / parsedAvailableAmount) * 100 : 0;
      const strokeLength = (percentage / 100) * circumference;
      // Ensure at least 3px length if percent > 0 so it's visible and interactive
      const minShowableLength = (percentage > 0 && percentage < 1) ? 3 : 1;
      const visualStrokeLength = totalSegmentsCount > 1 ? Math.max(minShowableLength, strokeLength) : strokeLength;
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
        type: sub.type,
        icon: sub.icon,
        colorName: sub.color
      };
    });

    if (unassigned > 0) {
      const percentage = (unassigned / parsedAvailableAmount) * 100;
      const strokeLength = (percentage / 100) * circumference;
      const visualStrokeLength = totalSegmentsCount > 1 ? Math.max(1, strokeLength) : strokeLength;
      const initialOffset = currentOffset;

      segments.push({
        id: 'unassigned',
        name: 'Sin Asignar',
        amount: unassigned,
        color: '#22d3ee',
        amountColorClass: 'text-cyan-400',
        percentage: percentage,
        dashArray: `${visualStrokeLength} ${circumference - visualStrokeLength}`,
        dashOffset: -initialOffset,
        type: 'fixed_amount',
        icon: 'help_outline',
        colorName: 'cyan'
      });
    }

    return segments;
  });

  donutChartSegments = computed(() => {
    return this.donutSegments().filter(segment => segment.amount > 0);
  });

  usedColors = computed(() => {
    const data = this.allocationData();
    if (!data || !data.sub_categories) return [];
    return data.sub_categories
      .map(s => s.color)
      .filter((c): c is ThemeColor => !!c);
  });

  totalAvailableAmountForDonut = computed<number>(() => {
    const data = this.allocationData();
    if (!data) return 0;

    if (this.parentBoxType() === 'absolute') {
      return this.assignedTotal();
    }

    // For percentage boxes, Capacity = Assigned + Unassigned
    // available_amount_to_assign from detail is the REMAINDER (unassigned) for this specific box.
    const unassignedInUsd = data.available_amount_to_assign;
    const assignedInUsd = data.sub_categories.reduce((sum, sub) => {
      const isArs = sub.display_amount.currency === 'ARS';
      const val = isArs ? sub.display_amount.amount / this.currencyState.exchangeRate() : sub.display_amount.amount;
      return sum + val;
    }, 0);

    const totalUsd = assignedInUsd + unassignedInUsd;
    return this.currencyState.currentCurrency() === 'ARS' ? totalUsd * this.currencyState.exchangeRate() : totalUsd;
  });

  getAssignedAmountFromPool(): number {
    return this.totalAvailableAmountForDonut();
  }

  ngOnInit() {
    // Attempt to get name and type from navigation state to avoid "Cargando..."
    const state = history.state;
    if (state?.name) this.initialName.set(state.name);
    if (state?.type) this.initialType.set(state.type);

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

    forkJoin({
      detail: this.odinApi.getAllocationBoxDetail(id),
      odin: this.odinApi.getOdin()
    }).subscribe({
      next: ({ detail, odin }) => {
        this.allocationData.set(detail);

        // Find the box in the summary to get its calculated capacity/percentage
        const box = odin.allocation_boxes.find(b => b.id === id);
        if (box) {
          if (box.calculation_type === 'percentage') {
            this.boxPercentage.set(box.percentage_of_pool || null);

            // Prefer the backend's calculated amount if available
            if (box.calculated_amount_in_usd) {
              this.trueBoxCapacity.set(box.calculated_amount_in_usd);
            } else if (box.percentage_of_pool) {
              const totalPool = odin.pool_summary.total_amount_in_usd;
              const capacity = (box.percentage_of_pool / 100) * totalPool;
              this.trueBoxCapacity.set(capacity);
            }
          }
        }

        this.loaderService.hide();
      },
      error: () => this.loaderService.hide()
    });
  }

  goBack() {
    this.router.navigate(['/odin']);
  }

  getBoxName(): string {
    return this.allocationData()?.name || this.initialName() || 'Cargando...';
  }

  getConvertedAmount(amount: number, currency: string): number {
    const targetCurrency = this.currencyState.currentCurrency();

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
    data.sub_categories.forEach(sub => {
      totalAssigned += this.getConvertedAmount(sub.display_amount.amount, sub.display_amount.currency);
    });
    return Math.max(0, available - totalAssigned);
  }

  getUnassignedAmountInBase(): number {
    const data = this.allocationData();
    if (!data) return 0;

    const capacityInBase = this.trueBoxCapacity();
    if (capacityInBase !== null) {
      let totalAssignedInBase = 0;
      data.sub_categories.forEach(sub => {
        if (sub.display_amount.currency === 'USD') {
          totalAssignedInBase += sub.display_amount.amount;
        } else {
          totalAssignedInBase += sub.display_amount.amount / this.currencyState.exchangeRate();
        }
      });
      return Math.max(0, capacityInBase - totalAssignedInBase);
    }

    // Fallback: If we don't have the capacity yet, trust the remainder sent by the backend.
    return data.available_amount_to_assign;
  }

  getAssignedPercentage(): number {
    const data = this.allocationData();
    if (!data) return 0;

    // For absolute boxes, percentage doesn't make sense the same way, return 0 or 100
    if (this.parentBoxType() === 'absolute') {
      return 100;
    }

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
      const sub = data?.sub_categories.find(s => s.id === segment.id);
      this.subCategoryToEdit.set(sub || null);
    } else {
      this.subCategoryToEdit.set(null);
    }
    this.isSubCategoryModalOpen.set(true);
  }

  closeSubCategoryModal() {
    this.isSubCategoryModalOpen.set(false);
    this.subCategoryToEdit.set(null);
    this.isSubCategoryModalSaving.set(false);
  }

  handleSaveSubCategory(subCategory: IAllocationSubCategoryDto) {
    const boxId = this.boxId();
    if (!boxId) return;

    this.isSubCategoryModalSaving.set(true);

    const request: IAllocationSubCategoryRequestApi = {
      name: subCategory.name,
      type: subCategory.type,
      icon: subCategory.icon || 'category',
      color: subCategory.color || 'primary',
      fixed_amount: subCategory.type === 'fixed_amount' ? subCategory.display_amount.amount : undefined,
      fixed_currency: subCategory.type === 'fixed_amount' ? subCategory.display_amount.currency : undefined
    };

    const isEdit = this.allocationData()?.sub_categories.some(s => s.id === subCategory.id);

    if (isEdit) {
      this.odinApi.updateSubCategory(boxId, subCategory.id, request).subscribe({
        next: () => {
          this.allocationData.update(data => {
            if (!data) return null;
            return {
              ...data,
              sub_categories: data.sub_categories.map(s => s.id === subCategory.id ? { ...s, ...subCategory } : s)
            };
          });
          this.isSubCategoryModalSaving.set(false);
          this.closeSubCategoryModal();
        },
        error: () => this.isSubCategoryModalSaving.set(false)
      });
    } else {
      this.odinApi.createSubCategory(boxId, request).subscribe({
        next: (newSub) => {
          this.allocationData.update(data => {
            if (!data) return null;
            return {
              ...data,
              sub_categories: [...data.sub_categories, newSub]
            };
          });
          this.isSubCategoryModalSaving.set(false);
          this.closeSubCategoryModal();
        },
        error: () => this.isSubCategoryModalSaving.set(false)
      });
    }
  }

  deleteSubCategory(id: string) {
    const data = this.allocationData();
    if (!data) return;

    const sub = data.sub_categories.find(s => s.id === id);
    if (sub) {
      this.subCategoryToDelete.set(sub);
      this.isDeleteModalOpen.set(true);
    }
  }

  cancelDeleteSubCategory() {
    this.isDeleteModalOpen.set(false);
    this.subCategoryToDelete.set(null);
    this.isDeletingSubCategory.set(false);
  }

  confirmDeleteSubCategory() {
    const boxId = this.boxId();
    const sub = this.subCategoryToDelete();
    if (!boxId || !sub) return;

    this.isDeletingSubCategory.set(true);
    this.odinApi.deleteSubCategory(boxId, sub.id).subscribe({
      next: () => {
        this.allocationData.update(data => {
          if (!data) return null;
          return {
            ...data,
            sub_categories: data.sub_categories.filter(s => s.id !== sub.id)
          };
        });
        this.isDeletingSubCategory.set(false);
        this.cancelDeleteSubCategory();
      },
      error: () => this.isDeletingSubCategory.set(false)
    });
  }

  navigateToSubCategory(subCategoryId: string) {
    const boxId = this.boxId();
    if (!boxId) return;

    const data = this.allocationData();
    const sub = data?.sub_categories.find(s => s.id === subCategoryId);

    const type = this.parentBoxType();
    this.router.navigate(['/odin/allocation-details', boxId, 'subcategories', subCategoryId], {
      state: {
        parentBoxType: type,
        boxName: this.getBoxName(),
        subCategoryName: sub?.name
      }
    });
    sessionStorage.setItem(`odin_box_type_${boxId}`, type);
  }
}
