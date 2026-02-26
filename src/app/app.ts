import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarMenu } from './layout/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'iflow-frontend';
  isSidebarExpanded = true;
}
