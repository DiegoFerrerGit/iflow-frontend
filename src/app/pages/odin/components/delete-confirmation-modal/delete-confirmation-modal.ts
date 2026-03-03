import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllocationSubCategoryDto } from '../../../../../../mock/odin-nivel2.endpoints';

@Component({
    selector: 'app-delete-confirmation-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './delete-confirmation-modal.html',
    styleUrl: './delete-confirmation-modal.scss'
})
export class DeleteConfirmationModal {
    @Input({ required: true }) item!: AllocationSubCategoryDto;
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    get isSumItems(): boolean {
        return this.item?.type === 'sum_items';
    }
}
