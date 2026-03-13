import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { GoogleAuthService } from '../../modules/authentication/google-auth.service';
import { selectLoader } from '../../core/loader-manager/state/loader.selectors';
import { selectIsLoggingIn } from '../../modules/authentication/state/authentication.selectors';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [CommonModule, LoaderComponent],
    templateUrl: './login.page.html',
    styleUrls: [
        './styles/login.page.mobile.scss',
        './styles/login.page.desktop.scss'
    ]
})
export class LoginPage implements OnInit, OnDestroy {
    private store = inject(Store);
    private googleAuthService = inject(GoogleAuthService);

    // Global auth loading state
    private isAuthLoading = this.store.selectSignal(selectIsLoggingIn);
    // Global generic loader (API calls)
    private isGlobalLoading = this.store.selectSignal(selectLoader);

    // Combined loading state for the template
    isLoading = computed(() => this.isAuthLoading() || this.isGlobalLoading());

    private subscriptions: Subscription[] = [];

    constructor() { }

    ngOnInit(): void {
        this.googleAuthService.initialize();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    signInWithGoogle(): void {
        this.googleAuthService.signIn();
    }
}
