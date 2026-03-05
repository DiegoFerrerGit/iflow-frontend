import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AllocationItemDto, ThemeColor } from '../../models/odin-nivel3.model';
import { THEME_COLORS } from '../../../../models/income.model';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { ToggleComponent, ToggleOption } from '../../../../shared/components/toggle/toggle.component';

@Component({
    selector: 'app-item-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DynamicCurrencySymbolPipe, DynamicCurrencyPipe, ToggleComponent],
    templateUrl: './item-form-modal.html',
    styleUrls: ['./item-form-modal.scss']
})
export class ItemFormModalComponent implements OnInit {
    private fb = inject(FormBuilder);

    @Input() initialItem: AllocationItemDto | null = null;
    @Input() subCategoryId!: string;
    @Input() availableAmountToAssign: number = 0;
    @Input() usedColors: ThemeColor[] = [];
    @Input() currentCurrency: 'USD' | 'ARS' = 'USD'; // For displaying available amount correctly

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<AllocationItemDto>();

    form!: FormGroup;
    allThemeColors = THEME_COLORS;

    currencyOptions: ToggleOption[] = [
        { label: 'USD', value: 'USD' },
        { label: 'ARS', value: 'ARS' }
    ];

    iconsList = [
        'category', 'payments', 'home', 'shopping_cart', 'restaurant', 'directions_car',
        'flight', 'school', 'health_and_safety', 'pets', 'fitness_center',
        'redeem', 'savings', 'paid', 'credit_card', 'receipt',
        'local_mall', 'sports_esports', 'movie', 'music_note', 'park',
        'bolt', 'security', 'trending_up', 'work', 'business_center',
        'terminal', 'code', 'data_object', 'database', 'laptop_mac'
    ];

    maxAllowedAmount: number = 0;

    ngOnInit(): void {
        const initialAmount = this.initialItem ? this.initialItem.amountWithCurrency.amount : 0;
        this.maxAllowedAmount = this.availableAmountToAssign + initialAmount;

        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: [''],
            icon: ['category', Validators.required],
            currency: ['USD'],
            amount: [0, [Validators.required, Validators.min(0), Validators.max(this.maxAllowedAmount)]],
            color: ['primary', Validators.required]
        });

        if (this.initialItem) {
            this.form.patchValue({
                name: this.initialItem.name,
                description: this.initialItem.description || '',
                icon: this.initialItem.icon || 'category',
                currency: this.initialItem.amountWithCurrency.currency || 'USD',
                amount: this.initialItem.amountWithCurrency.amount,
                color: this.initialItem.color || 'primary'
            });
        }
    }

    get isEditMode(): boolean {
        return !!this.initialItem;
    }

    get isAmountMaxedOut(): boolean {
        return this.availableAmountToAssign <= 0;
    }

    isColorUsed(color: string): boolean {
        if (this.initialItem && this.initialItem.color === color) {
            return false;
        }
        return this.usedColors.includes(color as ThemeColor);
    }

    onCurrencyChange(currency: any) {
        this.form.patchValue({ currency });
    }

    selectIcon(icon: string) {
        this.form.patchValue({ icon });
    }

    selectColor(color: ThemeColor) {
        if (this.isColorUsed(color)) return;
        this.form.patchValue({ color });
    }

    onSubmit() {
        if (this.form.valid) {
            const val = this.form.getRawValue();
            const result: AllocationItemDto = {
                id: this.initialItem?.id || crypto.randomUUID(),
                subCategoryId: this.subCategoryId,
                name: val.name,
                description: val.description ? val.description : undefined,
                icon: val.icon,
                color: val.color,
                amountWithCurrency: {
                    amount: Number(val.amount),
                    currency: val.currency
                },
                paid: this.initialItem?.paid || false
            };
            this.save.emit(result);
        }
    }
}
