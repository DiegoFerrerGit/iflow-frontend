import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loader.component.html',
    styleUrl: './loader.component.scss'
})
export class LoaderComponent {
    // If true, shows a full-screen blurred backdrop overlay.
    // If false, it acts as an inline/element loader.
    @Input() fullScreen: boolean = false;
}
