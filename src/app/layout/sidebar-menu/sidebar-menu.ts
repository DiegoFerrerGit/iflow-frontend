import { Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUserFullName, selectUserAvatarUrl } from '../../modules/authentication/state/authentication.selectors';
import { AuthActions } from '../../modules/authentication/state/authentication.actions';

import { CurrencySwitcherComponent } from '../currency-switcher/currency-switcher';
import { OdinOverlayService } from '../../core/services/odin-overlay.service';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CurrencySwitcherComponent],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.scss',
})
export class SidebarMenu {
  @Output() expandedChange = new EventEmitter<boolean>();
  isExpanded: boolean = true;

  private store = inject(Store);
  public overlayService = inject(OdinOverlayService);

  /** User data from NgRx store */
  userFullName = toSignal(this.store.select(selectUserFullName), { initialValue: null });
  userAvatarUrl = toSignal(this.store.select(selectUserAvatarUrl), { initialValue: null });

  /** Compute initials from fullName for the avatar fallback */
  userInitials = computed(() => {
    const name = this.userFullName();
    if (!name) return '??';
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.expandedChange.emit(this.isExpanded);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logoutStart());
  }
}
