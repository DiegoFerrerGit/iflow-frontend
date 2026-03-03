import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';

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

    // Internal state driven by the service if used globally
    public loaderService = inject(LoaderService);
}
