import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { COLOR_MAP, ThemeColor } from '../../../models/income.model';

export interface PolarAreaSegment {
    id: string;
    label: string;
    value: number;
    color: ThemeColor | string;
    percentage: number;
}

@Component({
    selector: 'app-polar-area-chart',
    standalone: true,
    imports: [CommonModule, DecimalPipe],
    template: `
        <div class="relative w-full aspect-square flex items-center justify-center overflow-visible select-none">
            <!-- Background Radial Glow -->
            <div class="absolute inset-0 bg-white/[0.02] rounded-full blur-3xl scale-75 opacity-50"></div>
            
            <svg viewBox="0 0 120 120" class="w-full h-full transform -rotate-90 overflow-visible" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="premium-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                        <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                        <feFlood flood-color="white" flood-opacity="0.3" result="offsetColor" />
                        <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    
                    @for (segData of chartSegments(); track segData.id) {
                        <radialGradient [id]="'grad-' + segData.id" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" [attr.stop-color]="segData.hexColor" stop-opacity="0.1" />
                            <stop offset="100%" [attr.stop-color]="segData.hexColor" stop-opacity="0.6" />
                        </radialGradient>
                    }
                </defs>

                <!-- Polar Segments -->
                @for (segData of chartSegments(); track segData.id; let i = $index) {
                    <g class="transition-all duration-300 ease-out"
                       [class.scale-[1.03]]="hoveredSegmentId() === segData.id"
                       [style.transform-origin]="'60px 60px'">
                        <path
                            [attr.d]="segData.path"
                            [attr.fill]="'url(#grad-' + segData.id + ')'"
                            [attr.stroke]="segData.hexColor"
                            stroke-width="0.8"
                            [attr.stroke-opacity]="0.4"
                            class="transition-all duration-200 ease-out cursor-pointer hover:brightness-125"
                            (mouseenter)="hoveredSegmentId.set(segData.id)"
                            (mouseleave)="hoveredSegmentId.set(null)"
                            filter="url(#premium-glow)"
                        >
                            <animate
                                attributeName="opacity"
                                from="0"
                                to="1"
                                [attr.dur]="(0.2 + i * 0.05) + 's'"
                                fill="freeze"
                            />
                        </path>
                    </g>
                }
                
                <!-- Central Core (Refined) -->
                <circle cx="60" cy="60" r="10" fill="white" class="opacity-5" />
                <circle cx="60" cy="60" r="6" [attr.fill]="activeHexColor()" class="opacity-30 blur-[4px] transition-all duration-300" />
                <circle cx="60" cy="60" r="2.5" [attr.fill]="activeHexColor()" class="transition-all duration-300 opacity-80" />
            </svg>

            <!-- Center Info Overlay (Mobile UX) -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300"
                [class.opacity-0]="!hoveredSegment()" [class.scale-95]="!hoveredSegment()">
                @if (hoveredSegment()) {
                    <span class="text-[10px] font-black tracking-widest uppercase opacity-60 mb-1" [style.color]="activeHexColor()">
                        {{ hoveredSegment()?.label }}
                    </span>
                    <span class="text-xl font-black text-white leading-none">
                        {{ hoveredSegment()?.percentage | number:'1.0-1' }}%
                    </span>
                }
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            width: 100%;
            max-width: 220px;
            margin: 0 auto;
        }
    `]
})
export class PolarAreaChartComponent {
    @Input() segments: PolarAreaSegment[] = [];

    hoveredSegmentId = signal<string | null>(null);

    hoveredSegment = computed(() => {
        const id = this.hoveredSegmentId();
        return this.segments.find(s => s.id === id) || null;
    });

    activeHexColor = computed(() => {
        const seg = this.hoveredSegment();
        if (!seg) return 'rgba(255,255,255,0.2)';
        return this.getHexColor(seg.color);
    });

    chartSegments = computed(() => {
        if (this.segments.length === 0) return [];

        // Distribute items evenly in 360 degrees
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        const maxRadius = 55;
        const minRadius = 15;

        // Find max value to normalize radii
        const maxValue = Math.max(...this.segments.map(s => s.value), 1);

        return this.segments.map((s, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            
            // Linear scale for radii based on relative value
            const normalizedValue = s.value / maxValue;
            const radius = minRadius + (maxRadius - minRadius) * normalizedValue;
            
            const path = this.getSectorPath(60, 60, minRadius, radius, startAngle, endAngle);
            
            return {
                ...s,
                path,
                hexColor: this.getHexColor(s.color)
            };
        });
    });

    private getHexColor(color: ThemeColor | string): string {
        if (color in COLOR_MAP) {
            return COLOR_MAP[color as ThemeColor];
        }
        return color;
    }

    private getSectorPath(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): string {
        // Adjust for spacing between segments
        const padding = 0.05; 
        const sA = startAngle + padding;
        const eA = endAngle - padding;

        const startOuterX = x + outerRadius * Math.cos(sA);
        const startOuterY = y + outerRadius * Math.sin(sA);
        const endOuterX = x + outerRadius * Math.cos(eA);
        const endOuterY = y + outerRadius * Math.sin(eA);
        
        const startInnerX = x + innerRadius * Math.cos(sA);
        const startInnerY = y + innerRadius * Math.sin(sA);
        const endInnerX = x + innerRadius * Math.cos(eA);
        const endInnerY = y + innerRadius * Math.sin(eA);
        
        const largeArcFlag = eA - sA <= Math.PI ? "0" : "1";
        
        return [
            `M ${startOuterX} ${startOuterY}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`,
            `L ${endInnerX} ${endInnerY}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}`,
            "Z"
        ].join(" ");
    }
}
