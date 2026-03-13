import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OdinApiService } from '../../../../../../modules/odin/odin.api';
import { ISubCategoryDetailResponse, IAllocationItemDto, IAmountWithCurrency } from '../../../../../../modules/odin/models/interfaces/api.response.interfaces';
import { IAllocationItemRequestApi } from '../../../../../../modules/odin/models/interfaces/api.request.interfaces';
import { DynamicCurrencyPipe } from '../../../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { BackButtonComponent } from '../../../../../../shared/components/back-button/back-button';
import { CurrencyManager } from '../../../../../../core/currency-manager/currency-manager.manager';
import { LoaderManager } from '../../../../../../core/loader-manager/loader.manager';
import { ThemeColor } from '../../../../../../models/income.model';
import { DeleteConfirmationModal } from '../../../../components/delete-confirmation-modal/delete-confirmation-modal';
import { ItemFormModalComponent } from '../../../../components/item-form-modal/item-form-modal.component';
import { LoaderComponent } from '../../../../../../shared/components/loader/loader.component';
import { ResponsiveDirective } from '../../../../../../shared/directives/responsive.directive';

const TEXT_CLASS_MAP: Record<string, string> = {
    'primary': 'text-purple-400',
    'cyan': 'text-cyan-400',
    'pink': 'text-pink-400',
    'emerald': 'text-emerald-400',
    'amber': 'text-amber-400',
    'indigo': 'text-indigo-400',
    'rose': 'text-rose-400',
    'orange': 'text-orange-400',
    'blue': 'text-blue-400',
    'fuchsia': 'text-fuchsia-400',
    'sky': 'text-sky-400',
    'royal': 'text-indigo-500',
    'crimson': 'text-red-400',
    'teal': 'text-teal-400',
    'violet': 'text-violet-400',
    'gold': 'text-yellow-400',
    'clay': 'text-stone-400',
    'slate': 'text-slate-400'
};

const BG_CLASS_MAP: Record<string, string> = {
    'primary': 'bg-purple-400',
    'cyan': 'bg-cyan-400',
    'pink': 'bg-pink-400',
    'emerald': 'bg-emerald-400',
    'amber': 'bg-amber-400',
    'indigo': 'bg-indigo-400',
    'rose': 'bg-rose-400',
    'orange': 'bg-orange-400',
    'blue': 'bg-blue-400',
    'fuchsia': 'bg-fuchsia-400',
    'sky': 'bg-sky-400',
    'royal': 'bg-indigo-500',
    'crimson': 'bg-red-400',
    'teal': 'bg-teal-400',
    'violet': 'bg-violet-400',
    'gold': 'bg-yellow-400',
    'clay': 'bg-stone-400',
    'slate': 'bg-slate-400'
};

@Component({
    selector: 'app-sub-category-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        DynamicCurrencyPipe,
        DynamicCurrencySymbolPipe,
        BackButtonComponent,
        DeleteConfirmationModal,
        ItemFormModalComponent,
        LoaderComponent,
        ResponsiveDirective
    ],
    templateUrl: './sub-category-details.page.html'
})
export class SubCategoryDetailsPage implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private odinApi = inject(OdinApiService);
    public currencyState = inject(CurrencyManager);
    private loaderService = inject(LoaderManager);

    boxId = signal<string | null>(null);
    subCategoryId = signal<string | null>(null);

    // Fallbacks for breadcrumbs
    initialBoxName = signal<string | null>(null);
    initialSubCategoryName = signal<string | null>(null);

    pageData = signal<ISubCategoryDetailResponse | null>(null);
    hoveredItem = signal<string | null>(null);
    parentBoxType = signal<'percentage' | 'absolute'>('percentage');

    // Form Modal
    isItemFormModalOpen = signal<boolean>(false);
    itemToEdit = signal<IAllocationItemDto | null>(null);

    // Delete Modal
    isDeleteModalOpen = signal<boolean>(false);
    itemToDelete = signal<IAllocationItemDto | null>(null);

    // Element loader per item
    loadingItemId = signal<string | null>(null);

    // Modal Loading States
    isItemModalSaving = signal<boolean>(false);
    isDeletingItem = signal<boolean>(false);

    activeMobileMenuId = signal<string | null>(null);
    isFabMenuOpen = signal<boolean>(false);

    // Gets the box name from signal or fallback
    boxName = computed(() => {
        return this.initialBoxName() || 'Cargando...';
    });

    // Gets the subcategory name from signal or fallback
    subCategoryName = computed(() => {
        return this.initialSubCategoryName() || 'Cargando...';
    });

    // Calculate accumulated total based on the items and currency conversion
    accumulatedTotal = computed(() => {
        const data = this.pageData();
        if (!data || !data.items) return 0;

        return data.items.reduce((sum, item) => sum + this.getConvertedAmount(item.amount_with_currency.amount, item.amount_with_currency.currency as 'USD' | 'ARS'), 0);
    });

    // Expose items with calculated percentages
    itemsWithDetails = computed(() => {
        const data = this.pageData();
        if (!data || !data.items) return [];

        const total = this.accumulatedTotal();

        return data.items
            .map(item => {
                const convertedAmt = this.getConvertedAmount(item.amount_with_currency.amount, item.amount_with_currency.currency as 'USD' | 'ARS');
                const percentage = total > 0 ? (convertedAmt / total) * 100 : 0;
                return {
                    ...item,
                    calculatedAmount: convertedAmt,
                    percentage,
                    textColorClass: item.color ? TEXT_CLASS_MAP[item.color] : 'text-slate-400',
                    bgColorClass: item.color ? BG_CLASS_MAP[item.color] : 'bg-slate-400'
                };
            })
            .sort((a, b) => {
                // False (unpaid) comes first
                if (a.paid === b.paid) {
                    // Descending amount
                    return b.calculatedAmount - a.calculatedAmount;
                }
                return a.paid ? 1 : -1;
            });
    });

    proportionBarItems = computed(() => {
        return this.itemsWithDetails().filter(item => item.calculatedAmount > 0);
    });

    hoveredItemDetails = computed(() => {
        const id = this.hoveredItem();
        if (!id) return null;
        return this.itemsWithDetails().find(i => i.id === id) || null;
    });

    usedColors = computed(() => {
        const data = this.pageData();
        if (!data || !data.items) return [];
        return data.items.map(i => i.color).filter(c => !!c) as ThemeColor[];
    });

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            const subId = params.get('subCategoryId');
            if (id && subId) {
                this.boxId.set(id);
                this.subCategoryId.set(subId);

                // Recover state for breadcrumbs
                const state = history.state;
                if (state?.boxName) this.initialBoxName.set(state.boxName);
                if (state?.subCategoryName) this.initialSubCategoryName.set(state.subCategoryName);

                let typeStr = state?.['parentBoxType'] || sessionStorage.getItem(`odin_box_type_${id}`);

                if (typeStr === 'percentage' || typeStr === 'absolute') {
                    this.parentBoxType.set(typeStr as 'percentage' | 'absolute');
                    sessionStorage.setItem(`odin_box_type_${id}`, typeStr);
                }

                this.loadItems(id, subId);
            }
        });
    }

    loadItems(boxId: string, subId: string) {
        this.loaderService.show();
        this.odinApi.getSubCategoryDetails(boxId, subId).subscribe({
            next: (data: ISubCategoryDetailResponse) => {
                this.pageData.set(data);
                this.loaderService.hide();
            },
            error: () => this.loaderService.hide()
        });
    }

    goBack() {
        const id = this.boxId();
        if (id) {
            this.router.navigate(['/odin/allocation-details', id]);
        } else {
            this.router.navigate(['/odin']);
        }
    }

    goToDashboard() {
        this.router.navigate(['/odin']);
    }

    togglePaidStatus(id: string) {
        const boxId = this.boxId();
        const subId = this.subCategoryId();
        if (!boxId || !subId) return;

        this.loadingItemId.set(id);
        this.odinApi.togglePaidItem(boxId, subId, id).subscribe({
            next: () => {
                this.pageData.update(data => {
                    if (!data) return data;
                    const updatedItems = data.items.map(item =>
                        item.id === id ? { ...item, paid: !item.paid } : item
                    );
                    return { ...data, items: updatedItems };
                });
                this.loadingItemId.set(null);
            },
            error: () => this.loadingItemId.set(null)
        });
    }

    getConvertedAmount(amount: number, currency: 'USD' | 'ARS'): number {
        const targetCurrency = this.currencyState.currentCurrency();

        if (currency === targetCurrency) return amount;
        if (currency === 'USD' && targetCurrency === 'ARS') return amount * this.currencyState.exchangeRate();
        if (currency === 'ARS' && targetCurrency === 'USD') return amount / this.currencyState.exchangeRate();

        return amount;
    }

    private convertToUsd(amount: number, currency: 'USD' | 'ARS'): number {
        if (currency === 'USD') return amount;
        return amount / this.currencyState.exchangeRate();
    }

    // --- Modals ---

    openItemModal(item?: IAllocationItemDto) {
        if (item) {
            this.itemToEdit.set(item);
        } else {
            this.itemToEdit.set(null);
        }
        this.isItemFormModalOpen.set(true);
    }

    closeItemModal() {
        this.isItemFormModalOpen.set(false);
        this.itemToEdit.set(null);
        this.isItemModalSaving.set(false);
    }

    handleSaveItem(item: IAllocationItemDto) {
        const boxId = this.boxId();
        const subId = this.subCategoryId();
        if (!boxId || !subId) return;

        this.isItemModalSaving.set(true);

        const request: IAllocationItemRequestApi = {
            name: item.name,
            description: item.description,
            icon: item.icon,
            color: item.color,
            amount_with_currency: item.amount_with_currency,
            has_payment_control: item.has_payment_control
        };

        const isEdit = this.itemToEdit() !== null;

        if (isEdit) {
            this.odinApi.updateItem(boxId, subId, item.id, request).subscribe({
                next: (updatedItem) => {
                    this.updateLocalItem(updatedItem, true);
                    this.closeItemModal();
                },
                error: () => this.isItemModalSaving.set(false)
            });
        } else {
            this.odinApi.createItem(boxId, subId, request).subscribe({
                next: (newItem) => {
                    this.updateLocalItem(newItem, false);
                    this.closeItemModal();
                },
                error: () => this.isItemModalSaving.set(false)
            });
        }
    }

    private updateLocalItem(item: IAllocationItemDto, isEdit: boolean) {
        this.pageData.update(data => {
            if (!data) return null;

            let amountChange = 0;
            const incomingAmountUsd = this.convertToUsd(item.amount_with_currency.amount, item.amount_with_currency.currency as 'USD' | 'ARS');

            if (isEdit) {
                const oldItem = data.items.find(i => i.id === item.id);
                if (oldItem) {
                    const oldAmountUsd = this.convertToUsd(oldItem.amount_with_currency.amount, oldItem.amount_with_currency.currency as 'USD' | 'ARS');
                    amountChange = incomingAmountUsd - oldAmountUsd;
                    data.items = data.items.map(i => i.id === item.id ? item : i);
                }
            } else {
                data.items = [...data.items, item];
                amountChange = incomingAmountUsd;
            }

            return {
                ...data,
                available_amount_to_assign: data.available_amount_to_assign - amountChange,
                items: data.items
            };
        });
    }

    openDeleteModal(item: IAllocationItemDto) {
        this.itemToDelete.set(item);
        this.isDeleteModalOpen.set(true);
    }

    cancelDelete() {
        this.isDeleteModalOpen.set(false);
        this.itemToDelete.set(null);
        this.isDeletingItem.set(false);
    }

    confirmDelete() {
        const boxId = this.boxId();
        const subId = this.subCategoryId();
        const item = this.itemToDelete();
        if (!boxId || !subId || !item) return;

        this.isDeletingItem.set(true);
        this.odinApi.deleteItem(boxId, subId, item.id).subscribe({
            next: () => {
                this.pageData.update(data => {
                    if (!data) return null;
                    const itemAmountUsd = this.convertToUsd(item.amount_with_currency.amount, item.amount_with_currency.currency as 'USD' | 'ARS');
                    return {
                        ...data,
                        available_amount_to_assign: data.available_amount_to_assign + itemAmountUsd,
                        items: data.items.filter(i => i.id !== item.id)
                    };
                });
                this.cancelDelete();
            },
            error: () => this.isDeletingItem.set(false)
        });
    }

    toggleMobileMenu(id: string, event: Event) {
        event.stopPropagation();
        if (this.activeMobileMenuId() === id) {
            this.activeMobileMenuId.set(null);
        } else {
            this.activeMobileMenuId.set(id);
            this.isFabMenuOpen.set(false);
        }
    }

    closeMobileMenu() {
        this.activeMobileMenuId.set(null);
        this.isFabMenuOpen.set(false);
    }

    toggleFabMenu() {
        this.isFabMenuOpen.update(prev => !prev);
        if (this.isFabMenuOpen()) {
            this.activeMobileMenuId.set(null);
        }
    }
}
