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
  @Input() color: 'green' | 'orange' = 'green';
  @Input() direction: 'in' | 'out' = 'in';

  // Fixed coordinate space (0-400 wide, 0-100 tall) — same as test_colors.html
  readonly VB_WIDTH = 400;
  readonly CENTER_X = 200;

  getPointsArray(): number[] {
    return Array.from({ length: this.points }, (_, i) => i);
  }

  getColorHex(): string {
    return this.color === 'green' ? '#10b981' : '#fb923c';
  }

  // X position of each card's connection dot (in 0-400 space)
  getCircleCx(index: number): number {
    const sectionWidth = this.VB_WIDTH / this.points;
    return (sectionWidth * index) + (sectionWidth / 2);
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
