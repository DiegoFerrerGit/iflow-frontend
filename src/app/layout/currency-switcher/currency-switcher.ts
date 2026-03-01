import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyState, CurrencyType } from '../../core/services/currency-state';

@Component({
  selector: 'app-currency-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-switcher.html',
  styleUrl: './currency-switcher.scss',
})
export class CurrencySwitcherComponent {
  currencyState = inject(CurrencyState);
  elementRef = inject(ElementRef);

  isOpen = signal<boolean>(false);

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  togglePanel() {
    this.isOpen.update(val => !val);
  }

  setCurrency(currency: CurrencyType) {
    this.currencyState.setCurrency(currency);
  }
}
