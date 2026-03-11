import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
    inject,
    effect
} from '@angular/core';
import { ResponsiveState } from '../../core/responsive/responsive.state';
import { ResponsiveType, SizesDevice } from '../../core/responsive/responsive.constants';

@Directive({
    selector: '[iflowResponsive]',
    standalone: true
})
export class ResponsiveDirective {
    private templateRef = inject(TemplateRef<any>);
    private viewContainer = inject(ViewContainerRef);
    private responsiveState = inject(ResponsiveState);

    private desiredValue: ResponsiveType = SizesDevice.MOBILE;
    private hasView = false;

    @Input() set iflowResponsive(desiredValue: ResponsiveType) {
        this.desiredValue = desiredValue || SizesDevice.MOBILE;
        // We don't call updateView() here manually since the effect will re-run automatically.
    }

    constructor() {
        // This effect runs initially and whenever currentSize() changes or desiredValue changes (indirectly triggering CD)
        effect(() => {
            const currentSize = this.responsiveState.currentSize();

            if (currentSize === this.desiredValue && !this.hasView) {
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.hasView = true;
            } else if (currentSize !== this.desiredValue && this.hasView) {
                this.viewContainer.clear();
                this.hasView = false;
            }
        });
    }
}
