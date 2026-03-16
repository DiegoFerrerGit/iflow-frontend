import { Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-premium-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './premium-color-picker.html',
  styleUrls: ['./premium-color-picker.scss']
})
export class PremiumColorPicker implements OnInit {
  @Input() initialColor: string = '#a855f7';
  @Input() isCompact: boolean = false;
  @Output() colorChange = new EventEmitter<string>();

  hue: number = 270;
  saturation: number = 70;
  value: number = 100; // Brightness/Value in HSV
  hexCode: string = '';

  @ViewChild('slArea') slArea!: ElementRef;
  @ViewChild('hueBar') hueBar!: ElementRef;

  isDraggingSL: boolean = false;
  isDraggingHue: boolean = false;

  constructor() {}

  ngOnInit() {
    this.setFromHex(this.initialColor);
  }

  setFromHex(hex: string) {
    if (!hex || !hex.startsWith('#')) return;
    this.hexCode = hex.toUpperCase();
    const hsv = this.hexToHsv(hex);
    this.hue = hsv.h;
    this.saturation = hsv.s;
    this.value = hsv.v;
  }

  updateColor() {
    this.hexCode = this.hsvToHex(this.hue, this.saturation, this.value).toUpperCase();
    this.colorChange.emit(this.hexCode);
  }

  onSLMouseDown(event: MouseEvent | TouchEvent) {
    this.isDraggingSL = true;
    this.handleSLDrag(event);
  }

  onHueMouseDown(event: MouseEvent | TouchEvent) {
    this.isDraggingHue = true;
    this.handleHueDrag(event);
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onMouseMove(event: MouseEvent | TouchEvent) {
    if (this.isDraggingSL) this.handleSLDrag(event);
    if (this.isDraggingHue) this.handleHueDrag(event);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onMouseUp() {
    this.isDraggingSL = false;
    this.isDraggingHue = false;
  }

  handleSLDrag(event: MouseEvent | TouchEvent) {
    const rect = this.slArea.nativeElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;

    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    this.saturation = Math.round(x * 100);
    this.value = Math.round((1 - y) * 100);
    this.updateColor();
  }

  handleHueDrag(event: MouseEvent | TouchEvent) {
    const rect = this.hueBar.nativeElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;

    let x = (clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));

    this.hue = Math.round(x * 360);
    this.updateColor();
  }

  onHexChange() {
    if (this.hexCode.length === 7 && this.hexCode.startsWith('#')) {
      this.setFromHex(this.hexCode);
      this.colorChange.emit(this.hexCode);
    }
  }

  // --- Helpers ---

  hexToHsv(hex: string): { h: number, s: number, v: number } {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16) / 255;
      g = parseInt(hex.substring(3, 5), 16) / 255;
      b = parseInt(hex.substring(5, 7), 16) / 255;
    }

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
  }

  hsvToHex(h: number, s: number, v: number): string {
    h /= 60;
    s /= 100;
    v /= 100;
    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r = 0, g = 0, b = 0;

    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
