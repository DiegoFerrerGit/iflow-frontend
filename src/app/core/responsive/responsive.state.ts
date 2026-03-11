import { Injectable, computed, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ResponsiveType, SizesDevice } from './responsive.constants';

@Injectable({
    providedIn: 'root'
})
export class ResponsiveState {
    private breakpointObserver = inject(BreakpointObserver);

    // Define the desktop cutoff breakpoint
    // Note: the original example checked `innerWidth < 960`. We match that behavior.
    private readonly desktopBreakpoint = '(min-width: 960px)';

    // We convert the BreakpointObserver observable into a robust Angular Signal.
    // This automatically listens for window:resize events efficiently under the hood.
    private isDesktopSignal = toSignal(
        this.breakpointObserver.observe([this.desktopBreakpoint]).pipe(
            map(result => result.matches)
        ),
        { initialValue: typeof window !== 'undefined' ? window.innerWidth >= 960 : true }
    );

    // Computed signal that returns 'MOBILE' or 'DESKTOP'
    public currentSize = computed<ResponsiveType>(() => {
        return this.isDesktopSignal() ? SizesDevice.DESKTOP : SizesDevice.MOBILE;
    });

    // Helpers for quick checks
    public isMobile = computed(() => this.currentSize() === SizesDevice.MOBILE);
    public isDesktop = computed(() => this.currentSize() === SizesDevice.DESKTOP);
}
