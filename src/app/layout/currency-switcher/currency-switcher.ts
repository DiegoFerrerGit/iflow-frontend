import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyManager, CurrencyType } from '../../core/currency-manager/currency-manager.manager';

@Component({
  selector: 'app-currency-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-switcher.html',
  styleUrl: './currency-switcher.scss',
})
export class CurrencySwitcherComponent {
  public currencyState = inject(CurrencyManager);
  public currencyManager = inject(CurrencyManager);
  private elementRef = inject(ElementRef);

  isOpen = signal<boolean>(false);

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.currencyManager.tryRefreshIfNeeded();
    }
  }

  constructor() {
    this.currencyManager.tryRefreshIfNeeded();
  }

  togglePanel() {
    this.isOpen.update(val => !val);
  }

  setCurrency(currency: CurrencyType) {
    this.currencyState.setCurrency(currency);
  }
}
