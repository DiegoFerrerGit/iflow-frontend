import { Component, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss'
})
export class PortfolioPage implements OnInit {
  isDevelopment = isDevMode();
  
  constructor() {}

  ngOnInit(): void {}
}
