import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencySwitcher } from './currency-switcher';

describe('CurrencySwitcher', () => {
  let component: CurrencySwitcher;
  let fixture: ComponentFixture<CurrencySwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencySwitcher],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencySwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
