import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUserFullName, selectUserAvatarUrl } from '../../../modules/authentication/state/authentication.selectors';
import { AuthActions } from '../../../modules/authentication/state/authentication.actions';
import { CurrencyManager } from '../../currency-manager/currency-manager.manager';

@Component({
    selector: 'app-bottom-nav',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './bottom-nav.html',
})
export class BottomNavComponent {
    private store = inject(Store);
    public readonly currencyManager = inject(CurrencyManager);

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

    public isMenuOpen = signal(false);

    public toggleUserMenu(): void {
        this.isMenuOpen.set(!this.isMenuOpen());
    }

    public closeUserMenu(): void {
        if (this.isMenuOpen()) {
            this.isMenuOpen.set(false);
        }
    }

    public logout(): void {
        this.store.dispatch(AuthActions.logoutStart());
    }
}
