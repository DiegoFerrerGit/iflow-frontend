import { Component, inject } from '@angular/core';
import { BannerComponent } from './components/banner/banner';
import { IncomeCardComponent } from './components/income-card/income-card';
import { OdinMockService } from '../../modules/odin/services/odin-mock.service';

@Component({
  selector: 'app-odin',
  standalone: true,
  imports: [BannerComponent, IncomeCardComponent],
  templateUrl: './odin.html',
  styleUrl: './odin.scss',
})
export class OdinPageComponent {
  private mockService = inject(OdinMockService);
  incomes = this.mockService.getIncomes();
}
