import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './components/banner/banner';
import { IncomeCardComponent } from './components/income-card/income-card';
import { OdinMockService } from '../../modules/odin/services/odin-mock.service';
import { IncomeSource, ThemeColor } from '../../models/income.model';
import { AllocationBox } from '../../models/allocation.model';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { IncomeFormModal } from './components/income-form-modal/income-form-modal';
import { AnimatedFlowComponent } from './components/animated-flow/animated-flow';
import { AllocationCardComponent } from './components/allocation-card/allocation-card';
import { AllocationFormModalComponent } from './components/allocation-form-modal/allocation-form-modal';
import { DonutChartComponent, DonutChartSegment } from '../../shared/components/donut-chart/donut-chart.component';
import { DynamicCurrencyPipe } from '../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../shared/pipes/dynamic-currency-symbol.pipe';
import { CurrencyState } from '../../core/services/currency-state';

@Component({
  selector: 'app-odin',
  standalone: true,
  imports: [CommonModule, BannerComponent, IncomeCardComponent, CdkDropList, CdkDrag, IncomeFormModal, AnimatedFlowComponent, AllocationCardComponent, AllocationFormModalComponent, DonutChartComponent, DynamicCurrencyPipe, DynamicCurrencySymbolPipe],
  templateUrl: './odin.html',
  styleUrl: './odin.scss',
})
export class OdinPageComponent implements OnInit {
  private mockService = inject(OdinMockService);
  private currencyState = inject(CurrencyState);

  // Incomes State
  incomes: IncomeSource[] = [];
  incomeToDelete: IncomeSource | null = null;
  isModalOpen = false;
  incomeToEdit: IncomeSource | null = null;

  // Allocations State
  allocations: AllocationBox[] = [];
  isAllocationModalOpen = false;

  // Donut chart hover state -- moved mostly into the donut chart component internally
  // These are kept here just in case they are needed for cross-component interactions
  hoveredSegment: DonutChartSegment | null = null;
  hoveredAllocationSegment: DonutChartSegment | null = null;

  ngOnInit() {
    this.incomes = this.mockService.getIncomes();
    this.allocations = this.mockService.getAllocations();
    this.sortIncomes();
    this.sortAllocations();
  }

  private sortIncomes() {
    this.incomes.sort((a, b) => {
      // 1. Highest monthly amount first
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }
      // 2. Lowest effort percentage first
      return a.effortPercentage - b.effortPercentage;
    });
  }



  get totalPool(): number {
    return this.incomes.reduce((sum, income) => sum + this.currencyState.convert(income.amount, income.currency || 'USD'), 0);
  }

  get totalAllocated(): number {
    const total = this.totalPool;
    if (total === 0) return 0;

    return this.allocations.reduce((sum, box) => {
      if (box.calculationType === 'absoluto') {
        const convertedTarget = this.currencyState.convert(box.targetAmount, (box as any).currency || 'USD');
        return sum + convertedTarget;
      } else {
        return sum + ((box.targetAmount / 100) * total);
      }
    }, 0);
  }

  get freeMoney(): number {
    return Math.max(0, this.totalPool - this.totalAllocated);
  }

  get allocationDonutSegments(): DonutChartSegment[] {
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
      const amount = box.calculationType === 'absoluto'
        ? this.currencyState.convert(box.targetAmount, (box as any).currency || 'USD')
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

  get donutSegments(): DonutChartSegment[] {
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
    const colorMap: Record<ThemeColor, string> = {
      'primary': '#8b5cf6', // Violet-500
      'cyan': '#06b6d4',    // Cyan-500
      'pink': '#ec4899',    // Pink-500
      'emerald': '#10b981', // Emerald-500
      'amber': '#f59e0b',   // Amber-500
      'indigo': '#6366f1',  // Indigo-500
      'rose': '#f43f5e',    // Rose-500
      'orange': '#f97316',  // Orange-500
      'blue': '#3b82f6',    // Blue-500
      'fuchsia': '#d946ef'  // Fuchsia-500
    };
    return colorMap[color] || colorMap['primary'];
  }

  // Override to exact chart colors:
  getChartColor(type: string): string {
    switch (type) {
      case 'primary': return '#6d489b';
      case 'cyan': return '#2d7a5d';
      case 'pink': return '#b35c75';
      default: return '#6d489b';
    }
  }

  // --- Methods ---

  sortAllocations() {
    // Determine the real amount for sorting
    const getAmount = (box: AllocationBox) => {
      return box.calculationType === 'absoluto' ? box.targetAmount : (box.targetAmount / 100) * this.totalPool;
    };
    this.allocations.sort((a, b) => getAmount(b) - getAmount(a));
  }

  dropIncome(event: CdkDragDrop<IncomeSource[]>) {
    moveItemInArray(this.incomes, event.previousIndex, event.currentIndex);
  }

  dropAllocation(event: CdkDragDrop<AllocationBox[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.allocations, event.previousIndex, event.currentIndex);
    }
  }

  // Modals - Allocations
  openAllocationModal() {
    if (this.freeMoney > 0) {
      this.isAllocationModalOpen = true;
    }
  }

  closeAllocationModal() {
    this.isAllocationModalOpen = false;
  }

  handleSaveAllocation(newBox: AllocationBox) {
    this.allocations.unshift(newBox);
    this.sortAllocations();
    this.closeAllocationModal();
  }

  promptDelete(income: IncomeSource) {
    this.incomeToDelete = income;
  }

  confirmDelete() {
    if (this.incomeToDelete) {
      this.incomes = this.incomes.filter(i => i.id !== this.incomeToDelete!.id);
      this.incomeToDelete = null;
      this.sortAllocations();
    }
  }

  deleteAllocation(box: AllocationBox) {
    this.allocations = this.allocations.filter(a => a.id !== box.id);
  }

  cancelDelete() {
    this.incomeToDelete = null;
  }

  openModal(income?: IncomeSource) {
    this.incomeToEdit = income || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.incomeToEdit = null;
  }

  onSaveIncome(income: IncomeSource) {
    if (this.incomeToEdit) {
      // Edit existing
      const index = this.incomes.findIndex(i => i.id === income.id);
      if (index !== -1) {
        this.incomes[index] = income;
      }
    } else {
      // Add new
      this.incomes.push(income);
    }

    this.sortIncomes();
    this.sortAllocations();
    this.closeModal();
  }
}
