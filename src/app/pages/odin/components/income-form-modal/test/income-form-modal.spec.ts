import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeFormModal } from './income-form-modal';

describe('IncomeFormModal', () => {
  let component: IncomeFormModal;
  let fixture: ComponentFixture<IncomeFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeFormModal],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
