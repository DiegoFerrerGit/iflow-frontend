import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AllocationSubCategoryDto, SupportedCurrency } from '../../../../../../mock/odin-nivel2.endpoints';
import { ThemeColor, THEME_COLORS } from '../../../../models/income.model';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { ToggleComponent, ToggleOption } from '../../../../shared/components/toggle/toggle.component';

@Component({
    selector: 'app-sub-category-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DynamicCurrencySymbolPipe, ToggleComponent],
    templateUrl: './sub-category-form-modal.html',
    styleUrl: './sub-category-form-modal.scss'
})
export class SubCategoryFormModal implements OnInit {
    private fb = inject(FormBuilder);

    @Input() initialSubCategory: AllocationSubCategoryDto | null = null;
    @Input() allocationBoxId!: string;
    @Input() usedColors: ThemeColor[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<AllocationSubCategoryDto>();

    form!: FormGroup;
    allThemeColors = THEME_COLORS;

    typeOptions: ToggleOption[] = [
        { label: 'Monto Único', value: 'fixed_amount', icon: 'payments' },
        { label: 'Suma de Ítems', value: 'sum_items', icon: 'list_alt' }
    ];

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

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            icon: ['category', Validators.required],
            type: ['fixed_amount', Validators.required],
            currency: ['USD'],
            amount: [0, [Validators.min(0)]],
            color: ['primary', Validators.required]
        });

        if (this.initialSubCategory) {
            this.form.patchValue({
                name: this.initialSubCategory.name,
                icon: this.initialSubCategory.icon || 'category',
                type: this.initialSubCategory.type,
                currency: this.initialSubCategory.displayAmount.currency,
                amount: this.initialSubCategory.displayAmount.amount,
                color: this.initialSubCategory.color || 'primary'
            });
        }

        // Update validators based on type
        this.form.get('type')?.valueChanges.subscribe(type => {
            const amountControl = this.form.get('amount');
            if (type === 'fixed_amount') {
                amountControl?.setValidators([Validators.required, Validators.min(0)]);
            } else {
                amountControl?.clearValidators();
            }
            amountControl?.updateValueAndValidity();
        });
    }

    get amountType(): 'fixed_amount' | 'sum_items' {
        return this.form.get('type')?.value;
    }

    get isEditMode(): boolean {
        return !!this.initialSubCategory;
    }

    get isTypeLocked(): boolean {
        return this.isEditMode && this.initialSubCategory?.type === 'sum_items';
    }

    isColorUsed(color: string): boolean {
        if (this.initialSubCategory && this.initialSubCategory.color === color) {
            return false; // Current color is not "used" by others for the current sub-category
        }
        return this.usedColors.includes(color as ThemeColor);
    }

    // Use any to avoid template type issues with $event
    onTypeChange(type: any) {
        this.form.patchValue({ type });
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
            const result: AllocationSubCategoryDto = {
                id: this.initialSubCategory?.id || crypto.randomUUID(),
                allocationBoxId: this.allocationBoxId,
                name: val.name,
                type: val.type,
                icon: val.icon,
                color: val.color,
                displayAmount: {
                    amount: val.type === 'fixed_amount' ? Number(val.amount) : 0,
                    currency: val.currency as SupportedCurrency
                }
            };
            this.save.emit(result);
        }
    }
}
