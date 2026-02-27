import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationFormModal } from './allocation-form-modal';

describe('AllocationFormModal', () => {
  let component: AllocationFormModal;
  let fixture: ComponentFixture<AllocationFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationFormModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AllocationFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
