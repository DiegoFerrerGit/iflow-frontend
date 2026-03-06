import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { GoogleAuthService } from '../../modules/authentication/google-auth.service';
import { selectIsLoading } from '../../modules/authentication/state/authentication.selectors';

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

    // Global state (backend login + profile calls)
    private isGlobalLoading = this.store.selectSignal(selectIsLoading);
    // Local state (immediate button click reaction before API starts)
    private isLocalLoading = signal(false);

    // Combined loading state for the template
    isLoading = computed(() => this.isLocalLoading() || this.isGlobalLoading());

    private subscriptions: Subscription[] = [];

    constructor() { }

    ngOnInit(): void {
        this.googleAuthService.initialize();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    signInWithGoogle(): void {
        // Show loader instantly on click while Google's prompt opens
        this.isLocalLoading.set(true);
        // Fallback reset in case the user closes the Google window without completing
        setTimeout(() => this.isLocalLoading.set(false), 3000);

        this.googleAuthService.signIn();
    }
}
