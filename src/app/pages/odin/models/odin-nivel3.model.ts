export interface AmountWithCurrency {
    amount: number;
    currency: 'USD' | 'ARS';
}

export type ThemeColor = 'primary' | 'cyan' | 'pink' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'orange' | 'blue' | 'fuchsia' | 'sky' | 'royal' | 'crimson' | 'teal' | 'violet' | 'gold' | 'clay' | 'slate';

export interface AllocationItemDto {
    id: string;
    subCategoryId: string;
    name: string;
    description?: string;
    icon?: string;
    amountWithCurrency: AmountWithCurrency;
    paid: boolean;
    color?: ThemeColor;
}

export interface OdinSubCategoryItemsResponse {
    availableAmountToAssign: number;
    items: AllocationItemDto[];
}
