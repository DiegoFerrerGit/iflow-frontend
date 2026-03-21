import { Component, inject, OnInit, RendererFactory2 } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { delay, filter, map, mergeMap, Observable, Subscription, tap } from 'rxjs';
import { SidebarMenu } from './layout/sidebar-menu/sidebar-menu';
import { CurrencySwitcherComponent } from './layout/currency-switcher/currency-switcher';
import { LayoutService } from './layout/layout';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { Store } from '@ngrx/store';
import { selectLoader } from './core/loader-manager/state/loader.selectors';
import { AsyncPipe, DOCUMENT } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ToastService } from './shared/components/toast/toast.service';
import { ResponsiveDirective } from './shared/directives/responsive.directive';
import { ResponsiveState } from './core/responsive/responsive.state';
import { BottomNavComponent } from './core/layout/bottom-nav/bottom-nav';
import { InstallPromptComponent } from './core/components/install-prompt/install-prompt.component';
import { PwaService } from './core/services/pwa.service';
import { NavigationThemeService } from './core/services/navigation-theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarMenu, LoaderComponent, AsyncPipe, ToastComponent, ResponsiveDirective, BottomNavComponent, InstallPromptComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  title = 'iflow-frontend';
  isSidebarExpanded = true;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly layoutService = inject(LayoutService);
  private store = inject(Store);
  public readonly toastService = inject(ToastService);
  public readonly responsiveState = inject(ResponsiveState);
  public readonly pwaService = inject(PwaService);
  private navigationThemeService = inject(NavigationThemeService);
  private rendererFactory = inject(RendererFactory2);
  private document = inject(DOCUMENT);

  public inProgress$!: Observable<boolean>;
  private hasPreloadedVideo = false;


  ngOnInit(): void {
    this.routerEventsSubscription();
    this.loaderStateSubscription();
  }

  /**
   * Subscribes to the global NgRx Loader state.
   * This observable drives the fullscreen blocking spinner across the app.
   */
  private loaderStateSubscription(): void {
    this.inProgress$ = this.store.select(selectLoader).pipe(
      delay(0)
    );
  }

  /**
   * Listens to Angular Router events to detect when navigation ends successfully.
   * It traverses the active route tree to find the deepest primary outlet and 
   * checks its route data for a custom 'hideSidebar' flag.
   * This dynamically hides/shows the sidebar layout on specific pages (like Login).
   */
  private routerEventsSubscription(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(data => {
      const hideSidebar = data['hideSidebar'] === true;
      this.layoutService.setSidebarVisibility(!hideSidebar);

      // Eager load background video once user is past login
      if (!hideSidebar && !this.hasPreloadedVideo) {
        this.hasPreloadedVideo = true;
        this.preloadBackgroundVideos();
      }
    });
  }

  private preloadBackgroundVideos(): void {
    const videoPaths = [
      'assets/videos/background-odin-MD.mp4',
      'assets/videos/portfolio-background-MD.mp4'
    ];
    const renderer = this.rendererFactory.createRenderer(null, null);
    
    videoPaths.forEach(videoPath => {
      const link = renderer.createElement('link');
      renderer.setAttribute(link, 'rel', 'preload');
      renderer.setAttribute(link, 'as', 'video');
      renderer.setAttribute(link, 'href', videoPath);
      renderer.appendChild(this.document.head, link);
    });
  }
}
