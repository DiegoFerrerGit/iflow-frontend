import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToggleOption {
    label: string;
    value: any;
    icon?: string;
}

@Component({
    selector: 'app-toggle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toggle.component.html',
    styleUrl: './toggle.component.scss'
})
export class ToggleComponent {
    @Input({ required: true }) options: ToggleOption[] = [];
    @Input({ required: true }) selectedValue: any;
    @Input() disabled: boolean = false;
    @Input() label?: string;
    @Output() selectionChange = new EventEmitter<any>();

    selectOption(value: any) {
        if (!this.disabled && this.selectedValue !== value) {
            this.selectionChange.emit(value);
        }
    }

    getSelectedIndex(): number {
        return this.options.findIndex(opt => opt.value === this.selectedValue);
    }
}
