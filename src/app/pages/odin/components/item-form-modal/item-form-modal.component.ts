import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAllocationItemDto } from '../../../../modules/odin/models/interfaces/api.response.interfaces';
import { ThemeColor } from '../../models/odin-nivel3.model';
import { THEME_COLORS } from '../../../../models/income.model';
import { DynamicCurrencySymbolPipe } from '../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { DynamicCurrencyPipe } from '../../../../shared/pipes/dynamic-currency-pipe';
import { ToggleComponent, ToggleOption } from '../../../../shared/components/toggle/toggle.component';
import { CurrencyManager } from '../../../../core/currency-manager/currency-manager.manager';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-item-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DynamicCurrencySymbolPipe, DynamicCurrencyPipe, ToggleComponent],
    templateUrl: './item-form-modal.html',
    styleUrls: ['./item-form-modal.scss']
})
export class ItemFormModalComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly currencyState = inject(CurrencyManager);
    private readonly subs = new Subscription();

    @Input() initialItem: IAllocationItemDto | null = null;
    @Input() subCategoryId!: string;
    @Input() availableAmountToAssign: number = 0;
    @Input() usedColors: ThemeColor[] = [];
    @Input() currentCurrency: 'USD' | 'ARS' = 'USD'; // For displaying available amount correctly
    @Input() isLoading: boolean = false;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<IAllocationItemDto>();

    public isClosing = false;
    public form!: FormGroup;
    public allThemeColors = THEME_COLORS;

    public currencyOptions: ToggleOption[] = [
        { label: 'USD', value: 'USD' },
        { label: 'ARS', value: 'ARS' }
    ];

    public paymentTrackingOptions: ToggleOption[] = [
        { label: 'NO', value: false },
        { label: 'SI', value: true }
    ];

    public iconsList = [
        'category', 'payments', 'home', 'shopping_cart', 'restaurant', 'directions_car',
        'flight', 'school', 'health_and_safety', 'pets', 'fitness_center',
        'redeem', 'savings', 'paid', 'credit_card', 'receipt',
        'local_mall', 'sports_esports', 'movie', 'music_note', 'park',
        'bolt', 'security', 'trending_up', 'work', 'business_center',
        'terminal', 'code', 'data_object', 'database', 'laptop_mac',
        'currency_bitcoin', 'currency_exchange', 'account_balance_wallet', 'monetization_on', 'token'
    ];

    public maxAllowedAmount: number = 0;
    public totalAvailableInBase: number = 0;

    public ngOnInit(): void {
        const initialAmountInOriginalCurrency = this.initialItem ? this.initialItem.amount_with_currency.amount : 0;
        const initialCurrency = this.initialItem?.amount_with_currency.currency || 'USD';

        // Convert initial amount to USD (base) so we can add it to availableAmountToAssign (which is also base USD)
        const initialAmountInBase = this.convertToBase(initialAmountInOriginalCurrency, initialCurrency as 'USD' | 'ARS');
        const totalAvailableInBase = this.availableAmountToAssign + initialAmountInBase;

        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: [''],
            icon: ['category'],
            currency: [initialCurrency],
            amount: [initialAmountInOriginalCurrency, [Validators.required, Validators.min(0)]],
            color: ['primary', Validators.required],
            has_payment_control: [false]
        });

        // Dynamic validator setup
        this.totalAvailableInBase = totalAvailableInBase;
        this.updateMaxValidator();

        this.subs.add(
            this.form.get('currency')?.valueChanges.subscribe(() => {
                this.updateMaxValidator();
            })
        );

        if (this.initialItem) {
            this.form.patchValue({
                name: this.initialItem.name,
                description: this.initialItem.description || '',
                icon: this.initialItem.icon || 'category',
                currency: this.initialItem.amount_with_currency.currency || 'USD',
                amount: this.initialItem.amount_with_currency.amount,
                color: this.initialItem.color || 'primary',
                has_payment_control: this.initialItem.has_payment_control || false
            });
        }
    }

    public get isEditMode(): boolean {
        return !!this.initialItem;
    }

    public get isAmountMaxedOut(): boolean {
        return this.availableAmountToAssign <= 0;
    }

    public isColorUsed(color: string): boolean {
        if (this.initialItem && this.initialItem.color === color) {
            return false;
        }
        return this.usedColors.includes(color as ThemeColor);
    }

    public onCurrencyChange(currency: 'USD' | 'ARS'): void {
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

    private updateMaxValidator(): void {
        const amountControl = this.form.get('amount');
        if (!amountControl) return;

        // Custom validator that checks against USD base
        amountControl.setValidators([
            Validators.required,
            Validators.min(0),
            (control) => {
                const val = Number(control.value);
                if (!val) return null;
                const currency = this.form.get('currency')?.value as 'USD' | 'ARS';
                const valInBase = this.convertToBase(val, currency || 'USD');

                // Round to avoid floating point issues (2 decimals in USD)
                if (Math.round(valInBase * 100) / 100 > Math.round(this.totalAvailableInBase * 100) / 100) {
                    return { max: true };
                }
                return null;
            }
        ]);
        amountControl.updateValueAndValidity();
    }

    public closeModal(): void {
        this.isClosing = true;
        setTimeout(() => {
            this.close.emit();
            this.isClosing = false;
        }, 300);
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public selectIcon(icon: string): void {
        this.form.patchValue({ icon });
    }

    public selectColor(color: ThemeColor): void {
        if (this.isColorUsed(color)) return;
        this.form.patchValue({ color });
    }

    public onSubmit(): void {
        if (this.form.valid) {
            const val = this.form.getRawValue();
            let finalIcon = val.icon;
            if (!finalIcon) {
                const usedIcons = new Set(this.usedColors.map(c => c)); // Approximation for random
                const randomIndex = Math.floor(Math.random() * this.iconsList.length);
                finalIcon = this.iconsList[randomIndex];
            }

            const result: IAllocationItemDto = {
                id: this.initialItem?.id || crypto.randomUUID(),
                sub_category_id: this.subCategoryId,
                name: val.name,
                description: val.description ? val.description : undefined,
                icon: finalIcon,
                color: val.color,
                amount_with_currency: {
                    amount: Number(val.amount),
                    currency: val.currency
                },
                has_payment_control: val.has_payment_control,
                paid: this.initialItem?.paid || false
            };
            this.save.emit(result);
        }
    }
}
