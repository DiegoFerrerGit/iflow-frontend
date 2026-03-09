import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface DeletableItem {
    name?: string;
    type?: string;
}
@Component({
    selector: 'app-delete-confirmation-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './delete-confirmation-modal.html',
    styleUrl: './delete-confirmation-modal.scss'
})
export class DeleteConfirmationModal {
    @Input({ required: true }) item!: DeletableItem | null;
    @Input() isLoading: boolean = false;
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    public get isSumItems(): boolean {
        return this.item?.type === 'sum_items';
    }
}
