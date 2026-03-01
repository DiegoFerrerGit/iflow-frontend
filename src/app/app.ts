import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';
import { SidebarMenu } from './layout/sidebar-menu/sidebar-menu';
import { CurrencySwitcherComponent } from './layout/currency-switcher/currency-switcher';
import { LayoutService } from './core/services/layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarMenu, CurrencySwitcherComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  title = 'iflow-frontend';
  isSidebarExpanded = true;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly layoutService = inject(LayoutService);

  ngOnInit() {
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
    });
  }
}
