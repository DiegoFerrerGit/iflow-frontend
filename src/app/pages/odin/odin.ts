import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from './components/banner/banner';
import { IncomeCardComponent } from './components/income-card/income-card';
import { OdinMockService } from '../../modules/odin/services/odin-mock.service';
import { IncomeSource } from '../../models/income.model';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-odin',
  standalone: true,
  imports: [BannerComponent, IncomeCardComponent, CdkDropList, CdkDrag],
  templateUrl: './odin.html',
  styleUrl: './odin.scss',
})
export class OdinPageComponent implements OnInit {
  private mockService = inject(OdinMockService);
  incomes: IncomeSource[] = [];
  incomeToDelete: IncomeSource | null = null;

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
}
