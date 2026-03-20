import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationThemeService {
  private router = inject(Router);

  private readonly themes: Record<string, any> = {
    odin: {
      '--nav-bg': '#0f0a15',
      '--nav-accent-from': '#8b5cf6',
      '--nav-accent-to': '#ec4899',
      '--nav-glow': 'rgba(168, 85, 247, 0.4)',
    },
    patrimonio: {
      '--nav-bg': '#0f172a', // Deep Navy to match Portfolio aesthetic
      '--nav-accent-from': '#38bdf8', // Celeste
      '--nav-accent-to': '#1e40af', // Blue
      '--nav-glow': 'rgba(56, 189, 248, 0.4)', // Celeste-toned glow
    }
  };

  constructor() {
    // Initial theme check
    this.updateTheme(this.router.url);

    // Watch for subsequent navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTheme(event.urlAfterRedirects);
    });
  }

  private updateTheme(url: string) {
    let themeKey = 'odin';
    
    // Check for Patrimonio / Portfolio
    if (url.includes('/portfolio')) {
      themeKey = 'patrimonio';
    }

    const theme = this.themes[themeKey];
    Object.keys(theme).forEach(key => {
      document.documentElement.style.setProperty(key, theme[key]);
    });
  }
}
