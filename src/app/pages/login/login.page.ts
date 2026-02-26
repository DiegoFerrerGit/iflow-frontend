import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.page.html',
    styleUrls: [
        './styles/login.page.mobile.scss',
        './styles/login.page.desktop.scss'
    ]
})
export class LoginPage {
    isLoading = signal(false);

    constructor(private router: Router) { }

    signInWithGoogle(): void {
        this.isLoading.set(true);
        // Simulate SSO delay and redirect to Home
        setTimeout(() => {
            this.isLoading.set(false);
            this.router.navigate(['/home']);
        }, 1500);
    }
}
