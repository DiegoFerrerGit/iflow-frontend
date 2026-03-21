import { Component, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OdinOverlayService } from '../../../../core/services/odin-overlay.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class BannerComponent implements AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  public overlayService = inject(OdinOverlayService);

  ngAfterViewInit(): void {
    this.attemptVideoPlay();
  }

  public attemptVideoPlay(): void {
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.muted = true;
      setTimeout(() => {
        video.play().catch(err => console.warn('Video playback blocked:', err));
      }, 150);
    }
  }
}
