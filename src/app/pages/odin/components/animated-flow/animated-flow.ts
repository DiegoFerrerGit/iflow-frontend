import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-animated-flow',
  standalone: true,
  imports: [],
  templateUrl: './animated-flow.html',
  styleUrl: './animated-flow.scss',
})
export class AnimatedFlowComponent {
  @Input() points: number = 3;
  @Input() slots: number = 3; // Number of columns in the UI grid
  @Input() color: 'green' | 'orange' = 'green';
  @Input() direction: 'in' | 'out' = 'in';

  // Viewbox mapped to 1000x120 space
  readonly VB_WIDTH = 1000;
  readonly CENTER_X = 500;

  getPointsArray(): number[] {
    return Array.from({ length: this.points }, (_, i) => i);
  }

  getColorHex(): string {
    return this.color === 'green' ? '#10b981' : '#fb923c';
  }

  // X position of each card's connection dot (in 1000 space)
  getCircleCx(index: number): number {
    const totalSlots = this.slots || 1;
    // We divide the 1000 width into N fixed slots and center the dot in each
    const sectionWidth = this.VB_WIDTH / totalSlots;
    const cx = (sectionWidth * index) + (sectionWidth / 2);

    // Safety offset: if cx is exactly the center, add 0.05 to prevent SVG filter bugs
    return Math.abs(cx - this.CENTER_X) < 0.1 ? cx + 0.05 : cx;
  }

  isCenterPoint(index: number): boolean {
    return Math.abs(this.getCircleCx(index) - this.CENTER_X) < 1;
  }

  // Bezier curve from card position → center meeting point
  generatePath(index: number): string {
    const cx = this.getCircleCx(index);

    if (this.direction === 'in') {
      const my = 60;
      // Stars at top (card), curves down to center merge point
      return `M ${cx} 0 C ${cx} ${my}, ${this.CENTER_X} ${my}, ${this.CENTER_X} ${my}`;
    } else {
      const my = 40;
      // Starts at center split point, curves down to bottom (card)
      // We use 70 for control points to create a smooth outward flare
      return `M ${this.CENTER_X} ${my} C ${this.CENTER_X} 70, ${cx} 70, ${cx} 85`;
    }
  }
}
