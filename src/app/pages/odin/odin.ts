import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './components/banner/banner';
import { IncomeCardComponent } from './components/income-card/income-card';
import { IncomeSource, ThemeColor, COLOR_MAP } from '../../models/income.model';
import { AllocationBox } from '../../models/allocation.model';
import { OdinApiService } from '../../modules/odin/odin.api';
import { IOdinResponse, IIncomeSourceApi, IAllocationBoxApi } from '../../modules/odin/models/interfaces/api.response.interfaces';
import { IIncomeSourceRequesApi, IAllocationBoxRequestApi } from '../../modules/odin/models/interfaces/api.request.interfaces';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { IncomeFormModal } from './components/income-form-modal/income-form-modal';
import { AnimatedFlowComponent } from './components/animated-flow/animated-flow';
import { AllocationCardComponent } from './components/allocation-card/allocation-card';
import { AllocationFormModalComponent } from './components/allocation-form-modal/allocation-form-modal';
import { DonutChartComponent, DonutChartSegment } from '../../shared/components/donut-chart/donut-chart.component';
import { DynamicCurrencyPipe } from '../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../shared/pipes/dynamic-currency-symbol.pipe';
import { CurrencyManager } from '../../core/currency-manager/currency-manager.manager';
import { LoaderManager } from '../../core/loader-manager/loader.manager';

@Component({
  selector: 'app-odin',
  standalone: true,
  imports: [CommonModule, BannerComponent, IncomeCardComponent, CdkDropList, CdkDrag, IncomeFormModal, AnimatedFlowComponent, AllocationCardComponent, AllocationFormModalComponent, DonutChartComponent, DynamicCurrencyPipe, DynamicCurrencySymbolPipe],
  templateUrl: './odin.html',
  styleUrl: './odin.scss',
})
export class OdinPageComponent implements OnInit {
  private readonly odinApiService = inject(OdinApiService);
  public readonly currencyState = inject(CurrencyManager);
  private readonly loaderService = inject(LoaderManager);
  private readonly cdr = inject(ChangeDetectorRef);

  // #region STATE

  // Incomes State
  public incomes: IncomeSource[] = [];
  public incomeToDelete: IncomeSource | null = null;
  public isModalOpen: boolean = false;
  public incomeToEdit: IncomeSource | null = null;
  public isModalSaving: boolean = false;
  public updatingIncomeId: string | null = null;
  public isDeletingIncome: boolean = false;

  // Allocations State
  public allocations: AllocationBox[] = [];
  public isAllocationModalOpen: boolean = false;
  public allocationToEdit: AllocationBox | null = null;
  public isAllocationModalSaving: boolean = false;
  public updatingAllocationId: string | null = null;
  public allocationToDelete: AllocationBox | null = null;
  public isDeletingAllocation: boolean = false;

  // Dashboard Summary State (API sourced)
  public totalPool: number = 0;
  public totalAllocated: number = 0;
  public freeMoney: number = 0;

  // Donut chart hover state
  public hoveredSegment: DonutChartSegment | null = null;
  public hoveredAllocationSegment: DonutChartSegment | null = null;
  // #endregion

  // #region LIFECYCLE
  public ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.odinApiService.getOdin().subscribe({
      next: (response: IOdinResponse) => {
        this.totalPool = response.pool_summary.total_amount_in_usd;
        this.totalAllocated = response.pool_summary.assigned_amount_in_usd;
        this.freeMoney = response.pool_summary.unassigned_amount_in_usd;
        this.incomes = this.mapIncomes(response.income_sources);
        this.allocations = this.mapAllocations(response.allocation_boxes);
        this.updateCharts();
      },
      error: () => {
        // Errors are globally handled by ErrorsManager
      }
    });
  }
  // #endregion

  // #region MAPPERS
  private mapIncomes(apiIncomes: IIncomeSourceApi[]): IncomeSource[] {
    return apiIncomes.map(apiIncome => ({
      id: apiIncome.id,
      name: apiIncome.name,
      role: apiIncome.role,
      amount: apiIncome.amount_with_currency.amount,
      effortPercentage: apiIncome.effort_percentage,
      icon: apiIncome.icon,
      color: apiIncome.color as ThemeColor,
      category: apiIncome.category,
      currency: apiIncome.amount_with_currency.currency as 'USD' | 'ARS'
    }));
  }

  private mapAllocations(apiAllocations: IAllocationBoxApi[]): AllocationBox[] {
    return apiAllocations.map(apiAlloc => ({
      id: apiAlloc.id,
      name: apiAlloc.name,
      description: apiAlloc.description,
      type: apiAlloc.type,
      calculationType: apiAlloc.calculation_type,
      targetAmount: apiAlloc.calculation_type === 'percentage'
        ? (apiAlloc.percentage_of_pool || 0)
        : (apiAlloc.calculated_amount_in_usd || 0),
      savedAmount: apiAlloc.saved_amount?.amount,
      savingsTarget: apiAlloc.savings_target?.amount,
      icon: apiAlloc.icon,
      color: apiAlloc.color as ThemeColor
    }));
  }
  // #endregion

  // #region COMPUTED PROPERTIES
  public updateCharts() {
    this.sortIncomes();
    this.recalculateSummaries();
    this.sortAllocations();
    this.cdr.markForCheck();
  }

  private sortIncomes() {
    const savedOrderJson = localStorage.getItem('odin_incomes_order');
    if (savedOrderJson) {
      try {
        const orderIds: string[] = JSON.parse(savedOrderJson);
        this.incomes.sort((a, b) => {
          let indexA = orderIds.indexOf(a.id);
          let indexB = orderIds.indexOf(b.id);
          if (indexA === -1) indexA = Number.MAX_SAFE_INTEGER;
          if (indexB === -1) indexB = Number.MAX_SAFE_INTEGER;

          if (indexA !== indexB) {
            return indexA - indexB;
          }
          if (b.amount !== a.amount) return b.amount - a.amount;
          return a.effortPercentage - b.effortPercentage;
        });
        return;
      } catch (e) {
        // Silently skip if localStorage is corrupted
      }
    }

    this.incomes.sort((a, b) => {
      // 1. Highest monthly amount first
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }
      // 2. Lowest effort percentage first
      return a.effortPercentage - b.effortPercentage;
    });
  }

  /**
   * Recalculates the pool summaries in memory for instant UI feedback.
   * totalPool: Sum of all incomes converted to USD.
   * totalAllocated: Sum of (absolute boxes) + (percentage boxes * totalPool).
   * freeMoney: totalPool - totalAllocated.
   */
  public recalculateSummaries() {
    this.totalPool = this.incomes.reduce((sum, income) =>
      sum + this.currencyState.convert(income.amount, income.currency || 'USD'), 0);

    const pool = this.totalPool;
    this.totalAllocated = this.allocations.reduce((sum, box) => {
      if (box.calculationType === 'absolute') {
        return sum + box.targetAmount;
      } else {
        return sum + ((box.targetAmount / 100) * pool);
      }
    }, 0);

    this.freeMoney = Math.max(0, this.totalPool - this.totalAllocated);
  }
  // #endregion

  // #region CHART COMPUTATIONS
  public get allocationDonutSegments(): DonutChartSegment[] {
    const totalAllocated = this.totalAllocated;
    const pool = this.totalPool;
    const freeMoney = this.freeMoney;

    // Total chart represents the entire pool now
    if (pool === 0) return [];

    let currentOffset = 0;
    const r = 50;
    const circumference = 2 * Math.PI * r;

    // First map actual allocations
    const segments = this.allocations.map(box => {
      const amount = box.calculationType === 'absolute'
        ? box.targetAmount
        : (box.targetAmount / 100) * pool;

      const percentage = amount / pool; // relative to entire pool to fit with free money
      const strokeLength = percentage * circumference;
      const dashArray = `${strokeLength} ${circumference}`;

      const segment: DonutChartSegment = {
        id: box.id,
        amount,
        percentage: percentage * 100,
        dashArray,
        dashOffset: -currentOffset,
        color: this.getCategoryColor(box.color),
        icon: box.icon,
        name: box.name,
        amountColorClass: `text-${box.color}-400`
      };

      currentOffset += strokeLength;
      return segment;
    });

    // Append Free Money block if available
    if (freeMoney > 0) {
      const percentage = freeMoney / pool;
      const strokeLength = percentage * circumference;
      const dashArray = `${strokeLength} ${circumference}`;

      segments.push({
        id: 'free-money-indicator',
        amount: freeMoney,
        percentage: percentage * 100,
        dashArray,
        dashOffset: -currentOffset,
        color: this.getCategoryColor('blue'), // Cyan/Blue as requested
        icon: 'account_balance_wallet',
        name: 'Dinero Libre',
        amountColorClass: 'text-blue-400'
      });
    }

    return segments;
  }

  public get donutSegments(): DonutChartSegment[] {
    const total = this.totalPool;
    if (total === 0) return [];

    let currentOffset = 0;
    // Radius of the circle. We will use r=50 in the SVG
    const r = 50;
    const circumference = 2 * Math.PI * r;

    return this.incomes.map(income => {
      const convertedAmount = this.currencyState.convert(income.amount, income.currency || 'USD');
      const percentage = (convertedAmount / total);
      const strokeLength = percentage * circumference;
      const dashArray = `${strokeLength} ${circumference}`;

      const segment: DonutChartSegment = {
        id: income.id,
        dashArray,
        dashOffset: -currentOffset,
        color: this.getCategoryColor(income.color),
        percentage: percentage * 100,
        icon: income.icon,
        name: income.name,
        amount: convertedAmount,
        amountColorClass: 'text-white'
      };

      currentOffset += strokeLength;
      return segment;
    });
  }

  private getCategoryColor(color: ThemeColor): string {
    return COLOR_MAP[color] || COLOR_MAP['primary'];
  }

  // Override to exact chart colors:
  public getChartColor(type: string): string {
    switch (type) {
      case 'primary': return '#6d489b';
      case 'cyan': return '#2d7a5d';
      case 'pink': return '#b35c75';
      default: return '#6d489b';
    }
  }
  // #endregion

  // #region DRAG & DROP
  public dropIncome(event: CdkDragDrop<IncomeSource[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.incomes, event.previousIndex, event.currentIndex);
      const orderIds = this.incomes.map(i => i.id);
      localStorage.setItem('odin_incomes_order', JSON.stringify(orderIds));
    }
  }

  public dropAllocation(event: CdkDragDrop<AllocationBox[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.allocations, event.previousIndex, event.currentIndex);
      const orderIds = this.allocations.map(a => a.id);
      localStorage.setItem('odin_allocations_order', JSON.stringify(orderIds));
    }
  }
  // #endregion

  // #region ALLOCATION ACTIONS
  public sortAllocations() {
    const getAmount = (box: AllocationBox) => {
      return box.calculationType === 'absolute' ? box.targetAmount : (box.targetAmount / 100) * this.totalPool;
    };

    const savedOrderJson = localStorage.getItem('odin_allocations_order');
    if (savedOrderJson) {
      try {
        const orderIds: string[] = JSON.parse(savedOrderJson);
        this.allocations.sort((a, b) => {
          let indexA = orderIds.indexOf(a.id);
          let indexB = orderIds.indexOf(b.id);
          if (indexA === -1) indexA = Number.MAX_SAFE_INTEGER;
          if (indexB === -1) indexB = Number.MAX_SAFE_INTEGER;

          if (indexA !== indexB) {
            return indexA - indexB;
          }
          return getAmount(b) - getAmount(a);
        });
        return;
      } catch (e) {
        // Silently skip if localStorage is corrupted
      }
    }

    // Determine the real amount for sorting
    this.allocations.sort((a, b) => getAmount(b) - getAmount(a));
  }

  public openAllocationModal(allocation?: AllocationBox) {
    if (this.freeMoney > 0 || allocation) {
      this.allocationToEdit = allocation || null;
      this.isAllocationModalOpen = true;
    }
  }

  public closeAllocationModal() {
    this.isAllocationModalOpen = false;
    this.allocationToEdit = null;
    this.isAllocationModalSaving = false;
  }

  public handleSaveAllocation(newBox: AllocationBox) {
    const requestData: IAllocationBoxRequestApi = {
      name: newBox.name,
      description: newBox.description,
      type: newBox.type,
      calculation_type: newBox.calculationType,
      percentage_of_pool: newBox.calculationType === 'percentage' ? newBox.targetAmount : undefined,
      icon: newBox.icon,
      color: newBox.color,
      saved_amount: newBox.savedAmount !== undefined ? { amount: newBox.savedAmount, currency: 'USD' } : undefined,
      savings_target: newBox.savingsTarget !== undefined ? { amount: newBox.savingsTarget, currency: 'USD' } : undefined
    };

    this.isAllocationModalSaving = true;

    if (this.allocationToEdit) {
      // Edit existing
      this.updatingAllocationId = this.allocationToEdit.id;
      this.odinApiService.updateAllocationBox(this.allocationToEdit.id, requestData).subscribe({
        next: (apiAlloc: IAllocationBoxApi) => {
          const updatedBox = this.mapAllocations([apiAlloc])[0];
          const index = this.allocations.findIndex(a => a.id === updatedBox.id);
          if (index !== -1) {
            this.allocations[index] = updatedBox;
            this.allocations = [...this.allocations];
          }
          this.updateCharts();
          this.isAllocationModalSaving = false;
          this.updatingAllocationId = null;
          this.closeAllocationModal();
        },
        error: () => {
          this.isAllocationModalSaving = false;
          this.updatingAllocationId = null;
        }
      });
    } else {
      // Create new
      this.odinApiService.createAllocationBox(requestData).subscribe({
        next: (apiAlloc: IAllocationBoxApi) => {
          const createdBox = this.mapAllocations([apiAlloc])[0];
          this.allocations = [createdBox, ...this.allocations];
          this.updateCharts();
          this.isAllocationModalSaving = false;
          this.closeAllocationModal();
        },
        error: () => {
          this.isAllocationModalSaving = false;
        }
      });
    }
  }

  public deleteAllocation(box: AllocationBox): void {
    this.allocationToDelete = box;
  }

  public confirmDeleteAllocation(): void {
    if (this.allocationToDelete) {
      this.isDeletingAllocation = true;
      this.odinApiService.deleteAllocationBox(this.allocationToDelete.id).subscribe({
        next: () => {
          this.allocations = this.allocations.filter(a => a.id !== this.allocationToDelete!.id);
          this.isDeletingAllocation = false;
          this.allocationToDelete = null;
          this.updateCharts();
        },
        error: () => {
          this.isDeletingAllocation = false;
        }
      });
    }
  }

  public cancelDeleteAllocation() {
    this.allocationToDelete = null;
  }
  // #endregion

  // #region MODAL ACTIONS
  public openModal(income?: IncomeSource) {
    this.incomeToEdit = income || null;
    this.isModalOpen = true;
  }

  public closeModal() {
    this.isModalOpen = false;
    this.incomeToEdit = null;
  }
  // #endregion

  // #region INCOME ACTIONS
  public onSaveIncome(income: IncomeSource) {
    const requestData: IIncomeSourceRequesApi = {
      name: income.name,
      role: income.role,
      effort_percentage: income.effortPercentage,
      icon: income.icon || '',
      color: income.color,
      category: income.category,
      amount_with_currency: {
        amount: income.amount,
        currency: income.currency || 'USD'
      }
    };

    if (this.incomeToEdit) {
      // Edit existing
      this.updatingIncomeId = income.id;
      this.isModalSaving = true;
      this.odinApiService.updateIncomeSource(income.id, requestData).subscribe({
        next: () => {
          const index = this.incomes.findIndex(i => i.id === income.id);
          if (index !== -1) {
            this.incomes[index] = { ...income };
            this.incomes = [...this.incomes];
          }
          this.updateCharts();
          this.isModalSaving = false;
          this.updatingIncomeId = null;
          this.closeModal();
        },
        error: () => {
          this.updatingIncomeId = null;
          this.isModalSaving = false;
        }
      });
    } else {
      // Add new
      this.isModalSaving = true;
      this.odinApiService.createIncomeSource(requestData).subscribe({
        next: (apiIncome: IIncomeSourceApi) => {
          const newIncomeSource = this.mapIncomes([apiIncome])[0];
          this.incomes = [...this.incomes, newIncomeSource];
          this.updateCharts();
          this.isModalSaving = false;
          this.closeModal();
        },
        error: () => {
          this.isModalSaving = false;
        }
      });
    }
  }

  public promptDelete(income: IncomeSource): void {
    this.incomeToDelete = income;
  }

  public confirmDelete(): void {
    if (this.incomeToDelete) {
      this.isDeletingIncome = true;
      this.odinApiService.deleteIncomeSource(this.incomeToDelete.id).subscribe({
        next: () => {
          this.isDeletingIncome = false;
          this.incomes = this.incomes.filter(i => i.id !== this.incomeToDelete?.id);
          this.incomeToDelete = null;
          this.updateCharts();
        },
        error: () => {
          this.isDeletingIncome = false;
          this.incomeToDelete = null;
        }
      });
    }
  }

  public cancelDelete(): void {
    this.incomeToDelete = null;
  }
  // #endregion
}
