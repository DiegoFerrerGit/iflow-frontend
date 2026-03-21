import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OdinOverlayService {
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  public isDark$ = this.isDarkSubject.asObservable();

  constructor() { }

  public toggleDarkOverlay(): void {
    this.isDarkSubject.next(!this.isDarkSubject.value);
  }
}
