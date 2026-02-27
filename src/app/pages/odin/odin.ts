import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './components/banner/banner';
import { IncomeCardComponent } from './components/income-card/income-card';
import { OdinMockService } from '../../modules/odin/services/odin-mock.service';
import { IncomeSource } from '../../models/income.model';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { IncomeFormModal } from './components/income-form-modal/income-form-modal';
import { AnimatedFlowComponent } from './components/animated-flow/animated-flow';

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
  imports: [CommonModule, BannerComponent, IncomeCardComponent, CdkDropList, CdkDrag, IncomeFormModal, AnimatedFlowComponent],
  templateUrl: './odin.html',
  styleUrl: './odin.scss',
})
export class OdinPageComponent implements OnInit {
  private mockService = inject(OdinMockService);
  incomes: IncomeSource[] = [];
  incomeToDelete: IncomeSource | null = null;
  isModalOpen = false;
  incomeToEdit: IncomeSource | null = null;

  // Donut chart hover state
  hoveredSegment: DonutSegment | null = null;

  ngOnInit() {
    this.incomes = this.mockService.getIncomes();
    this.sortIncomes();
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

  private getCategoryColor(colorCode: 'primary' | 'cyan' | 'pink'): string {
    switch (colorCode) {
      case 'primary': return '#6d489b'; // Purple
      case 'cyan': return '#10b981'; // Green (#2d7a5d in design, but let's use the brighter #10b981 or what's in tailwind)
      // Actually let's use the exact chart colors from previous hardcoded svg:
      // Purple: #6d489b, Green: #2d7a5d, Pink: #b35c75
      // Wait, Tinasoft represents 8000 (primary/purple), Modak 5000 (cyan/green), Sunset 1500 (pink)
      case 'pink': return '#b35c75';
      default: return '#6d489b';
    }
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

  drop(event: CdkDragDrop<IncomeSource[]>) {
    moveItemInArray(this.incomes, event.previousIndex, event.currentIndex);
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
