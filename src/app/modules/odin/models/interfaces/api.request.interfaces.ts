import { IAmountWithCurrency } from './api.response.interfaces';

export interface IIncomeSourceRequesApi {
    name: string;
    role: string;
    effort_percentage: number;
    icon: string;
    color: string;
    category: string;
    amount_with_currency: IAmountWithCurrency;
}
export interface IAllocationBoxRequestApi {
    name: string;
    description: string;
    type: 'permanent' | 'temporary';
    calculation_type: 'percentage' | 'absolute';
    percentage_of_pool?: number;
    icon: string;
    color: string;
    saved_amount?: IAmountWithCurrency;
    savings_target?: IAmountWithCurrency;
    background?: string;
}
export interface IAllocationSubCategoryRequestApi {
    name: string;
    type: 'fixed_amount' | 'sum_items';
    icon: string;
    color: string;
    fixed_amount?: number;
    fixed_currency?: string;
}
export interface IAllocationItemRequestApi {
    name: string;
    description?: string;
    icon: string;
    color: string;
    amount_with_currency: IAmountWithCurrency;
    has_payment_control: boolean;
}
