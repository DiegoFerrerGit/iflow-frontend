import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { GoogleAuthService } from '../../modules/authentication/google-auth.service';

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
    isLoading = signal(false);

    private subscriptions: Subscription[] = [];

    constructor(
        private store: Store,
        private googleAuthService: GoogleAuthService,
    ) { }

    ngOnInit(): void {
        this.googleAuthService.initialize();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    signInWithGoogle(): void {
        // Set local loading state while Google API loads
        this.isLoading.set(true);
        setTimeout(() => this.isLoading.set(false), 3000); // fallback reset
        this.googleAuthService.signIn();
    }
}
