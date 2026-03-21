import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { OdinOverlayService } from '../../../../core/services/odin-overlay.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class BannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  public overlayService = inject(OdinOverlayService);
  private sub?: Subscription;

  ngAfterViewInit(): void {
    this.sub = this.overlayService.selectedVideo$.subscribe(() => {
      if (this.videoPlayer?.nativeElement) {
        this.videoPlayer.nativeElement.load();
        this.attemptVideoPlay();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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
