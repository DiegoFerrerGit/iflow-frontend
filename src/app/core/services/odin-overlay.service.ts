import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OdinOverlayService {
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  public isDark$ = this.isDarkSubject.asObservable();

  private defaultVideos = [
    'https://media.istockphoto.com/id/2194125480/video/wide-angle-gimbal-shot-downtown-high-rise-glass-skyscrapers-financial-district-modern.mp4?s=mp4-640x640-is&k=20&c=sCfCNuqSZwrpLB2UhZzWfiYU6Hp13SiRhxY1ohwnzpU=',
    'https://media.istockphoto.com/id/1215610643/video/business-infographic-screen-presentation.mp4?s=mp4-640x640-is&k=20&c=wYRjBH8t8kjDyRT19R7lX-KxWJniH5io8L3ZbDdGjI0=',
    'https://media.istockphoto.com/id/1759564497/video/digital-display-with-financial-charts-and-graphs-close-up-abstract-stock-market-business.mp4?s=mp4-640x640-is&k=20&c=zsyx-Hh-V171goZMBsTgRKzUlamezLjTfWwOB_-hzqQ=',
    'https://media.istockphoto.com/id/1223690728/video/purple-and-blue-2d-vector-graphics-in-3d-animation-showing-graphs-and-charts-with-data.mp4?s=mp4-640x640-is&k=20&c=Pc-tbED-z9KglmvZH5XTKp6q1Bz55DcFY4R7m-st_CY=',
    'https://media.istockphoto.com/id/2173260257/video/business-infographic-showcase-presentation-display.mp4?s=mp4-640x640-is&k=20&c=-UMbuAxzmUmmmFo1uss1kPxcxJrp-xu-0BrrpmYElgw=',
    'https://media.istockphoto.com/id/1556253588/video/business-data-analytics-dashboard-animated-overlays.mp4?s=mp4-640x640-is&k=20&c=JLYgYhy-EtU0RmI0gyJds-QHbuW8zlmDgBIaVkhV7s4=',
    'https://media.istockphoto.com/id/1412190065/video/business-woman-working-with-tablet-computer-and-financial-charts-in-office.mp4?s=mp4-640x640-is&k=20&c=CAPNoQuUzoxEBmVMJjar07PBGRmKHTUpgevD7NVm09w=',
    'https://media.istockphoto.com/id/2175321260/video/glowing-financial-chart-on-futuristic-network-surface.mp4?s=mp4-640x640-is&k=20&c=BE8qcWQ_DEqbWwMaVeg3Kl3v4vc-s6vy-7sspvuCmHY='
  ];

  private videosSubject = new BehaviorSubject<string[]>(this.defaultVideos);
  public videos$ = this.videosSubject.asObservable();

  private selectedVideoSubject = new BehaviorSubject<string>(this.defaultVideos[0]);
  public selectedVideo$ = this.selectedVideoSubject.asObservable();

  constructor() { }

  public toggleDarkOverlay(): void {
    this.isDarkSubject.next(!this.isDarkSubject.value);
  }

  public selectVideo(url: string): void {
    this.selectedVideoSubject.next(url);
  }

  public removeVideo(url: string): void {
    const currentVideos = this.videosSubject.value;
    const newVideos = currentVideos.filter(v => v !== url);
    this.videosSubject.next(newVideos);
    
    // Select first available if the deleted one was selected
    if (this.selectedVideoSubject.value === url && newVideos.length > 0) {
      this.selectedVideoSubject.next(newVideos[0]);
    }
  }
}

