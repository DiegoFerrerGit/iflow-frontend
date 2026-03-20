import { Component, OnInit, isDevMode, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss'
})
export class PortfolioPage implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  isDevelopment = isDevMode();

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.attemptVideoPlay();
  }

  public attemptVideoPlay(): void {
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.muted = true;
      // Delayed playback attempt to bypass stricter browser restrictions on refresh
      setTimeout(() => {
        video.play().catch(err => console.warn('Video playback blocked:', err));
      }, 150);
    }
  }
}
