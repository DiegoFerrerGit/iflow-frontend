import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, filter, first, interval, concat } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private deferredPrompt: any;
    private showInstallBanner$ = new BehaviorSubject<boolean>(false);

    public installPrompt$ = this.showInstallBanner$.asObservable();
    public isIOS = false;
    public isMobile = false;

    constructor(
        private swUpdate: SwUpdate,
        private appRef: ApplicationRef
    ) {
        this.checkDevice();
        this.initializeStepInstaller();
        this.handleUpdates();
    }

    private checkDevice(): void {
        const userAgent = window.navigator.userAgent.toLowerCase();
        this.isIOS = /iphone|ipad|ipod/.test(userAgent);
        this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    }

    private initializeStepInstaller(): void {
        const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            this.deferredPrompt = e;
            // Only show banner if on mobile and not already dismissed
            if (this.isMobile && !isDismissed) {
                this.showInstallBanner$.next(true);
            }
        });

        // Special handling for iOS Safari which doesn't support beforeinstallprompt
        if (this.isIOS && this.isMobile && !this.isStandalone() && !isDismissed) {
            this.showInstallBanner$.next(true);
        }
    }

    private isStandalone(): boolean {
        return (window.matchMedia('(display-mode: standalone)').matches) || ((window.navigator as any).standalone);
    }

    public installPwa(): void {
        if (!this.deferredPrompt) {
            return;
        }
        // Show the install prompt
        this.deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        this.deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                localStorage.setItem('pwa-install-dismissed', 'true');
            } else {
                console.log('User dismissed the install prompt');
            }
            this.deferredPrompt = null;
            this.showInstallBanner$.next(false);
        });
    }

    public dismissInstall(): void {
        localStorage.setItem('pwa-install-dismissed', 'true');
        this.showInstallBanner$.next(false);
    }

    private isUpdatePending = false;
    private updateReadyTimestamp: number | null = null;

    private handleUpdates(): void {
        if (!this.swUpdate.isEnabled) return;

        // Check for updates every 1 hour
        const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
        const everyHour$ = interval(1 * 60 * 60 * 1000);
        const everyHourOnceAppIsStable$ = concat(appIsStable$, everyHour$);

        everyHourOnceAppIsStable$.subscribe(() => {
            this.swUpdate.checkForUpdate();
        });

        this.swUpdate.versionUpdates
            .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
            .subscribe(async () => {
                this.isUpdatePending = true;
                this.updateReadyTimestamp = Date.now();

                // Activate update in background so any subsequent reload is definitely fresh
                await this.swUpdate.activateUpdate();

                if (confirm('Nueva versión disponible. ¿Deseas actualizar?')) {
                    window.location.reload();
                }
            });

        // Background auto-refresh logic when returning to the app
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isUpdatePending) {
                const now = Date.now();
                // If more than 30 minutes passed since update was ready, reload automatically when returning
                if (this.updateReadyTimestamp && (now - this.updateReadyTimestamp > 30 * 60 * 1000)) {
                    window.location.reload();
                }
            }
        });
    }
}
