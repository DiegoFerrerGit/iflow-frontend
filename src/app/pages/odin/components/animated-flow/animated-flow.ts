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

  getPointsArray(): number[] {
    return Array.from({ length: this.points }, (_, i) => i);
  }

  getColorHex(): string {
    return this.color === 'green' ? '#34d399' : '#fb923c';
  }

  generatePath(index: number, total: number): string {
    const widthPercentPerPoint = 100 / total;
    const offset = widthPercentPerPoint / 2;
    const startX = `${(widthPercentPerPoint * index) + offset}%`;
    const startY = this.direction === 'in' ? 0 : 80;
    const endX = '50%';
    const endY = this.direction === 'in' ? 80 : 0;

    return `M ${startX} ${startY} C ${startX} 40, ${endX} 40, ${endX} ${endY}`;
  }
}
