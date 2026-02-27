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

export interface DonutSegment {
  income: IncomeSource;
  dashArray: string;
  dashOffset: number;
  color: string;
  percentage: number;
}

@Component({
  selector: 'app-odin',
  standalone: true,
  imports: [CommonModule, BannerComponent, IncomeCardComponent, CdkDropList, CdkDrag, IncomeFormModal, AnimatedFlowComponent, AllocationCardComponent, AllocationFormModalComponent],
  templateUrl: './odin.html',
  styleUrl: './odin.scss',
})
export class OdinPageComponent implements OnInit {
  private mockService = inject(OdinMockService);

  // Incomes State
  incomes: IncomeSource[] = [];
  incomeToDelete: IncomeSource | null = null;
  isModalOpen = false;
  incomeToEdit: IncomeSource | null = null;

  // Allocations State
  allocations: AllocationBox[] = [];
  isAllocationModalOpen = false;

  // Donut chart hover state
  hoveredSegment: DonutSegment | null = null;
  hoveredAllocationSegment: any | null = null;

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
    return this.incomes.reduce((sum, income) => sum + income.amount, 0);
  }

  get totalAllocated(): number {
    const total = this.totalPool;
    if (total === 0) return 0;

    return this.allocations.reduce((sum, box) => {
      if (box.calculationType === 'absoluto') {
        return sum + box.targetAmount;
      } else {
        return sum + ((box.targetAmount / 100) * total);
      }
    }, 0);
  }

  get freeMoney(): number {
    return Math.max(0, this.totalPool - this.totalAllocated);
  }

  get allocationDonutSegments() {
    const total = this.totalAllocated;
    if (total === 0) return [];

    let currentOffset = 0;
    const pool = this.totalPool;

    return this.allocations.map(box => {
      // Calculate amount
      const amount = box.calculationType === 'absoluto'
        ? box.targetAmount
        : (box.targetAmount / 100) * pool;

      const percentage = amount / total; // relative to total allocated

      // Donut SVG logic (radius = 50, circumference = 2 * PI * 50 = 314.159)
      const r = 50;
      const circumference = 2 * Math.PI * r;
      const strokeLength = percentage * circumference;
      const dashArray = `${strokeLength} ${circumference}`;

      const segment = {
        box,
        amount,
        percentage: percentage * 100, // display format
        dashArray,
        dashOffset: -currentOffset, // the fix for stacking order
        color: this.getCategoryColor(box.color)
      };

      currentOffset += strokeLength;
      return segment;
    });
  }

  get donutSegments(): DonutSegment[] {
    const total = this.totalPool;
    if (total === 0) return [];

    let currentOffset = 0;
    // Radius of the circle. We will use r=45 in the SVG.
    const r = 45;
    const circumference = 2 * Math.PI * r;

    return this.incomes.map(income => {
      const percentage = (income.amount / total);
      const strokeLength = percentage * circumference;
      const dashArray = `${strokeLength} ${circumference}`;

      const segment: DonutSegment = {
        income,
        dashArray,
        dashOffset: -currentOffset,
        color: this.getCategoryColor(income.category.color as 'primary' | 'cyan' | 'pink'),
        percentage: percentage * 100
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
    // Append to the beginning
    this.allocations.unshift(newBox);
    this.closeAllocationModal();
    // sort allocations if there is a specific order, or just leave unshifted
  }

  promptDelete(income: IncomeSource) {
    this.incomeToDelete = income;
  }

  confirmDelete() {
    if (this.incomeToDelete) {
      this.incomes = this.incomes.filter(i => i.id !== this.incomeToDelete!.id);
      this.incomeToDelete = null;
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
    this.closeModal();
  }
}
