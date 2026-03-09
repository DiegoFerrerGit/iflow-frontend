import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAllocationSubCategoryDto } from '../../../../modules/odin/models/interfaces/api.response.interfaces';
import { ThemeColor, THEME_COLORS } from '../../../../models/income.model';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { ToggleComponent, ToggleOption } from '../../../../shared/components/toggle/toggle.component';
import { CurrencyState } from '../../../../core/services/currency-state';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sub-category-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DynamicCurrencySymbolPipe, ToggleComponent],
    templateUrl: './sub-category-form-modal.html',
    styleUrl: './sub-category-form-modal.scss'
})
export class SubCategoryFormModal implements OnInit {
    private fb = inject(FormBuilder);
    private currencyState = inject(CurrencyState);
    private cdr = inject(ChangeDetectorRef);
    private subs = new Subscription();

    @Input() initialSubCategory: IAllocationSubCategoryDto | null = null;
    @Input() allocationBoxId!: string;
    @Input() availableAmountToAssign: number = 0; // Base USD
    @Input() usedColors: ThemeColor[] = [];
    @Input() isLoading: boolean = false;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<IAllocationSubCategoryDto>();

    form!: FormGroup;
    allThemeColors = THEME_COLORS;
    displayedAvailableAmount: number = 0;
    formattedAvailableAmount: string = '0';
    maxAllowedAmount: number = 0;
    totalAvailableInBase: number = 0;

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
        'terminal', 'code', 'data_object', 'database', 'laptop_mac',
        'currency_bitcoin', 'currency_exchange', 'account_balance_wallet', 'monetization_on', 'token'
    ];

    ngOnInit(): void {
        const initialAmountInOriginalCurrency = this.initialSubCategory?.display_amount?.amount || 0;
        const initialCurrency = this.initialSubCategory?.display_amount?.currency || 'USD';

        // Convert initial amount to USD (base)
        const initialAmountInBase = this.convertToBase(initialAmountInOriginalCurrency, initialCurrency as 'USD' | 'ARS');
        this.totalAvailableInBase = this.availableAmountToAssign + initialAmountInBase;

        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            icon: ['category', Validators.required],
            type: ['fixed_amount', Validators.required],
            currency: [initialCurrency],
            amount: [initialAmountInOriginalCurrency, [Validators.min(0)]],
            color: ['primary', Validators.required]
        });

        // Use a small timeout to ensure Angular has set up the view before patching and triggering updates
        setTimeout(() => {
            if (this.initialSubCategory) {
                this.form.patchValue({
                    name: this.initialSubCategory.name,
                    icon: this.initialSubCategory.icon || 'category',
                    type: this.initialSubCategory.type,
                    currency: this.initialSubCategory.display_amount?.currency || 'USD',
                    amount: this.initialSubCategory.display_amount?.amount || 0,
                    color: this.initialSubCategory.color || 'primary'
                });
            }

            this.updateMaxValidator();
            this.cdr.detectChanges();
        }, 0);

        this.subs.add(
            this.form.get('currency')?.valueChanges.subscribe(() => {
                this.updateMaxValidator();
                this.cdr.detectChanges();
            })
        );

        this.subs.add(
            this.form.get('type')?.valueChanges.subscribe(() => {
                this.updateMaxValidator();
                this.cdr.detectChanges();
            })
        );
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
            return false;
        }
        return this.usedColors.includes(color as ThemeColor);
    }

    onTypeChange(type: any) {
        this.form.patchValue({ type });
    }

    onCurrencyChange(currency: any) {
        this.form.get('currency')?.setValue(currency);
    }

    private convertToBase(amount: number, currency: 'USD' | 'ARS'): number {
        if (currency === 'USD') return amount;
        return amount / this.currencyState.exchangeRate();
    }

    private convertFromBase(amount: number, targetCurrency: 'USD' | 'ARS'): number {
        if (targetCurrency === 'USD') return amount;
        return amount * this.currencyState.exchangeRate();
    }

    private updateMaxValidator() {
        const type = this.form.get('type')?.value;
        const currentCurrency = this.form.get('currency')?.value as 'USD' | 'ARS';

        // The label only shows the STRICTLY unassigned amount (per user feedback)
        this.displayedAvailableAmount = this.convertFromBase(this.availableAmountToAssign, currentCurrency);
        this.formattedAvailableAmount = Math.round(this.displayedAvailableAmount).toLocaleString('es-AR');

        // The validation limit is unassigned + already assigned to this sub-category
        this.maxAllowedAmount = this.convertFromBase(this.totalAvailableInBase, currentCurrency);

        const amountControl = this.form.get('amount');
        if (type === 'fixed_amount') {
            amountControl?.setValidators([Validators.required, Validators.min(0), Validators.max(this.maxAllowedAmount)]);
        } else {
            amountControl?.clearValidators();
            amountControl?.setValidators([Validators.min(0)]);
        }
        amountControl?.updateValueAndValidity();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
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
            const result: IAllocationSubCategoryDto = {
                id: this.initialSubCategory?.id || crypto.randomUUID(),
                allocation_box_id: this.allocationBoxId,
                name: val.name,
                type: val.type,
                icon: val.icon,
                color: val.color,
                display_amount: {
                    amount: val.type === 'fixed_amount' ? Number(val.amount) : 0,
                    currency: val.currency
                }
            };
            this.save.emit(result);
        }
    }
}
