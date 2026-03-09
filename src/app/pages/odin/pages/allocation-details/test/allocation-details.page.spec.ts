import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationDetailsPage } from './allocation-details.page';

describe('AllocationDetailsPage', () => {
  let component: AllocationDetailsPage;
  let fixture: ComponentFixture<AllocationDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AllocationDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
