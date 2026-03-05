import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { OdinMockService } from '../../../../../../modules/odin/services/odin-mock.service';
import { DynamicCurrencyPipe } from '../../../../../../shared/pipes/dynamic-currency-pipe';
import { DynamicCurrencySymbolPipe } from '../../../../../../shared/pipes/dynamic-currency-symbol.pipe';
import { BackButtonComponent } from '../../../../../../shared/components/back-button/back-button';
import { CurrencyState } from '../../../../../../core/services/currency-state';
import { LoaderService } from '../../../../../../core/services/loader.service';
import { AllocationItemDto, OdinSubCategoryItemsResponse, ThemeColor } from '../../../../models/odin-nivel3.model';
import { DeleteConfirmationModal } from '../../../../components/delete-confirmation-modal/delete-confirmation-modal';
import { ItemFormModalComponent } from '../../../../components/item-form-modal/item-form-modal.component';
import { LoaderComponent } from '../../../../../../shared/components/loader/loader.component';

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
        LoaderComponent
    ],
    templateUrl: './sub-category-details.page.html'
})
export class SubCategoryDetailsPage implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private mockService = inject(OdinMockService);
    public currencyState = inject(CurrencyState);
    private loaderService = inject(LoaderService);

    boxId = signal<string | null>(null);
    subCategoryId = signal<string | null>(null);

    pageData = signal<OdinSubCategoryItemsResponse | null>(null);
    hoveredItem = signal<string | null>(null);
    parentBoxType = signal<'percentage' | 'absolute'>('percentage');

    // Form Modal
    isItemFormModalOpen = signal<boolean>(false);
    itemToEdit = signal<AllocationItemDto | null>(null);

    // Delete Modal
    isDeleteModalOpen = signal<boolean>(false);
    itemToDelete = signal<AllocationItemDto | null>(null);

    // Element loader per item
    loadingItemId = signal<string | null>(null);

    // Gets the box name from the allocation list
    boxName = computed(() => {
        const id = this.boxId();
        if (!id) return 'Categoría';
        const boxes = this.mockService.getAllocations();
        const box = boxes.find((b: any) => b.id === id);
        return box ? box.name : 'Categoría';
    });

    // Since we don't have a direct endpoint yet to just get the subcategory name,
    // we could find it from the level 2 mock for the breadcrumbs.
    subCategoryName = computed(() => {
        const bId = this.boxId();
        const subId = this.subCategoryId();
        if (!bId || !subId) return 'Detalle';

        const l2 = this.mockService.getAllocationBoxLevel2(bId);
        if (l2 && l2.subCategories) {
            const sub = l2.subCategories.find((s: any) => s.id === subId);
            if (sub) return sub.name;
        }
        return 'Detalle';
    });

    // Calculate accumulated total based on the items and currency conversion
    accumulatedTotal = computed(() => {
        const data = this.pageData();
        if (!data || !data.items) return 0;

        return data.items.reduce((sum, item) => sum + this.getConvertedAmount(item.amountWithCurrency.amount, item.amountWithCurrency.currency), 0);
    });

    // Expose items with calculated percentages
    itemsWithDetails = computed(() => {
        const data = this.pageData();
        if (!data || !data.items) return [];

        const total = this.accumulatedTotal();

        return data.items
            .map(item => {
                const convertedAmt = this.getConvertedAmount(item.amountWithCurrency.amount, item.amountWithCurrency.currency);
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

                // Recover parent box type from navigation state or session storage
                const nav = this.router.getCurrentNavigation();
                let typeStr = nav?.extras?.state?.['parentBoxType'] || history.state?.['parentBoxType'] || sessionStorage.getItem(`odin_box_type_${id}`);

                if (typeStr === 'percentage' || typeStr === 'absolute') {
                    this.parentBoxType.set(typeStr as 'percentage' | 'absolute');
                    sessionStorage.setItem(`odin_box_type_${id}`, typeStr);
                }

                this.loadItems(subId);
            }
        });
    }

    loadItems(subId: string) {
        this.loaderService.show();
        setTimeout(() => {
            const data = this.mockService.getSubCategoryItems(subId);
            this.pageData.set(data);
            this.loaderService.hide();
        }, 1000);
    }

    goBack() {
        const id = this.boxId();
        if (id) {
            this.router.navigate(['/odin/allocation-details', id]);
        } else {
            this.router.navigate(['/odin']);
        }
    }

    togglePaidStatus(id: string) {
        this.loadingItemId.set(id);
        setTimeout(() => {
            this.pageData.update(data => {
                if (!data) return data;
                const updatedItems = data.items.map(item =>
                    item.id === id ? { ...item, paid: !item.paid } : item
                );
                return { ...data, items: updatedItems };
            });
            this.loadingItemId.set(null);
        }, 800);
    }

    getConvertedAmount(amount: number, currency: 'USD' | 'ARS'): number {
        const targetCurrency = this.currencyState.currentCurrency();

        if (currency === targetCurrency) return amount;
        if (currency === 'USD' && targetCurrency === 'ARS') return amount * this.currencyState.exchangeRate();
        if (currency === 'ARS' && targetCurrency === 'USD') return amount / this.currencyState.exchangeRate();

        return amount;
    }

    // --- Modals ---

    openItemModal(item?: AllocationItemDto) {
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
    }

    handleSaveItem(item: AllocationItemDto) {
        this.closeItemModal();
        this.loadingItemId.set(item.id);
        setTimeout(() => {
            const data = this.pageData();
            if (!data) { this.loadingItemId.set(null); return; }

            const existingIndex = data.items.findIndex(i => i.id === item.id);

            let amountChange = 0;
            const incomingAmountUsd = this.getConvertedAmount(item.amountWithCurrency.amount, item.amountWithCurrency.currency);

            if (existingIndex >= 0) {
                const oldItem = data.items[existingIndex];
                const oldAmountUsd = this.getConvertedAmount(oldItem.amountWithCurrency.amount, oldItem.amountWithCurrency.currency);
                data.items[existingIndex] = item;
                amountChange = incomingAmountUsd - oldAmountUsd;
            } else {
                data.items.push(item);
                amountChange = incomingAmountUsd;
            }

            data.availableAmountToAssign -= amountChange;
            this.pageData.set({ ...data });
            this.loadingItemId.set(null);
        }, 800);
    }

    openDeleteModal(item: AllocationItemDto) {
        this.itemToDelete.set(item);
        this.isDeleteModalOpen.set(true);
    }

    cancelDelete() {
        this.isDeleteModalOpen.set(false);
        this.itemToDelete.set(null);
    }

    confirmDelete() {
        const data = this.pageData();
        const item = this.itemToDelete();
        if (!data || !item) return;

        this.cancelDelete();
        this.loadingItemId.set(item.id);
        setTimeout(() => {
            const itemAmountUsd = this.getConvertedAmount(item.amountWithCurrency.amount, item.amountWithCurrency.currency);
            data.availableAmountToAssign += itemAmountUsd;
            data.items = data.items.filter(i => i.id !== item.id);
            this.pageData.set({ ...data });
            this.loadingItemId.set(null);
        }, 800);
    }
}
