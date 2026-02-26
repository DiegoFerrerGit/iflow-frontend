import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  readonly showSidebar = signal<boolean>(true);

  setSidebarVisibility(visible: boolean) {
    this.showSidebar.set(visible);
  }
}
