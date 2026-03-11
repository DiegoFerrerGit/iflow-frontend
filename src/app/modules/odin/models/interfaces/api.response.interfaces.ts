export interface IAmountWithCurrency {
    amount: number;
    currency: string;
}

export interface IPoolSummary {
    total_amount_in_usd: number;
    assigned_amount_in_usd: number;
    unassigned_amount_in_usd: number;
}

export interface IIncomeSourceApi {
    id: string;
    name: string;
    role: string;
    effort_percentage: number;
    icon: string;
    color: string;
    category: string;
    amount_with_currency: IAmountWithCurrency;
    has_payment_control: boolean;
    paid: boolean;
}

export interface IAllocationBoxApi {
    id: string;
    name: string;
    description: string;
    type: 'permanent' | 'temporary';
    calculation_type: 'percentage' | 'absolute';
    percentage_of_pool?: number;
    icon: string;
    color: string;
    calculated_amount_in_usd: number;
    saved_amount?: IAmountWithCurrency;
    savings_target?: IAmountWithCurrency;
}

export interface IOdinResponse {
    pool_summary: IPoolSummary;
    income_sources: IIncomeSourceApi[];
    allocation_boxes: IAllocationBoxApi[];
    odin_onboarding?: boolean;
}

export interface IAllocationSubCategoryDto {
    id: string;
    allocation_box_id: string;
    name: string;
    type: 'fixed_amount' | 'sum_items';
    icon?: string;
    color?: string;
    display_amount: IAmountWithCurrency;
}

export interface IAllocationBoxDetailResponse {
    id: string;
    name: string;
    description: string;
    type: 'permanent' | 'temporary';
    calculation_type: 'percentage' | 'absolute';
    available_amount_to_assign: number; // Always in USD
    sub_categories: IAllocationSubCategoryDto[];
}
export interface IAllocationItemDto {
    id: string;
    sub_category_id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    amount_with_currency: IAmountWithCurrency;
    has_payment_control: boolean;
    paid: boolean;
}

export interface ISubCategoryDetailResponse {
    available_amount_to_assign: number;
    items: IAllocationItemDto[];
}
