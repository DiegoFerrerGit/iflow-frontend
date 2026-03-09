import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOdinResponse, IIncomeSourceApi, IAllocationBoxApi, IAllocationBoxDetailResponse, IAllocationSubCategoryDto, ISubCategoryDetailResponse, IAllocationItemDto } from './models/interfaces/api.response.interfaces';
import { IIncomeSourceRequesApi, IAllocationBoxRequestApi, IAllocationSubCategoryRequestApi, IAllocationItemRequestApi } from './models/interfaces/api.request.interfaces';
import { environment } from '../../../environments/environment';
import { HIDE_SPINNER_OPTIONS } from '../../core/interceptors/models/constants/interceptors.constants';

@Injectable({
    providedIn: 'root'
})
export class OdinApiService {
    private readonly http: HttpClient = inject(HttpClient);
    private readonly API_URL: string = `${environment.apiUrl}/odin`;

    public getOdin(): Observable<IOdinResponse> {
        return this.http.get<IOdinResponse>(this.API_URL);
    }

    // #region INCOME SECTION
    public createIncomeSource(data: IIncomeSourceRequesApi): Observable<IIncomeSourceApi> {
        return this.http.post<IIncomeSourceApi>(`${this.API_URL}/income-sources`, data, HIDE_SPINNER_OPTIONS);
    }

    public updateIncomeSource(id: string, data: IIncomeSourceRequesApi): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/income-sources/${id}`, data, HIDE_SPINNER_OPTIONS);
    }

    public deleteIncomeSource(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/income-sources/${id}`, HIDE_SPINNER_OPTIONS);
    }
    // #endregion

    // #region ALLOCATION SECTION
    public createAllocationBox(data: IAllocationBoxRequestApi): Observable<IAllocationBoxApi> {
        return this.http.post<IAllocationBoxApi>(`${this.API_URL}/allocation-boxes`, data, HIDE_SPINNER_OPTIONS);
    }

    public updateAllocationBox(id: string, data: IAllocationBoxRequestApi): Observable<IAllocationBoxApi> {
        return this.http.put<IAllocationBoxApi>(`${this.API_URL}/allocation-boxes/${id}`, data, HIDE_SPINNER_OPTIONS);
    }

    public deleteAllocationBox(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/allocation-boxes/${id}`, HIDE_SPINNER_OPTIONS);
    }

    public getAllocationBoxDetail(id: string): Observable<IAllocationBoxDetailResponse> {
        return this.http.get<IAllocationBoxDetailResponse>(`${this.API_URL}/allocation-boxes/${id}`);
    }


    // #endregion

    // #region SUB CATEGORIES

    public createSubCategory(allocationId: string, data: IAllocationSubCategoryRequestApi): Observable<IAllocationSubCategoryDto> {
        return this.http.post<IAllocationSubCategoryDto>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories`, data, HIDE_SPINNER_OPTIONS);
    }

    public updateSubCategory(allocationId: string, subCategoryId: string, data: IAllocationSubCategoryRequestApi): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}`, data, HIDE_SPINNER_OPTIONS);
    }

    public deleteSubCategory(allocationId: string, subCategoryId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}`, HIDE_SPINNER_OPTIONS);
    }

    public getSubCategoryDetails(allocationId: string, subCategoryId: string): Observable<ISubCategoryDetailResponse> {
        return this.http.get<ISubCategoryDetailResponse>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}`);
    }

    // #region ITEMS of SUB CATEGORIES

    public createItem(allocationId: string, subCategoryId: string, request: IAllocationItemRequestApi): Observable<IAllocationItemDto> {
        return this.http.post<IAllocationItemDto>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}/items`, request, HIDE_SPINNER_OPTIONS);
    }

    public updateItem(allocationId: string, subCategoryId: string, itemId: string, request: IAllocationItemRequestApi): Observable<IAllocationItemDto> {
        return this.http.put<IAllocationItemDto>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}/items/${itemId}`, request, HIDE_SPINNER_OPTIONS);
    }

    public deleteItem(allocationId: string, subCategoryId: string, itemId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}/items/${itemId}`, HIDE_SPINNER_OPTIONS);
    }

    public togglePaidItem(allocationId: string, subCategoryId: string, itemId: string): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}/items/${itemId}/toggle-paid`, {}, HIDE_SPINNER_OPTIONS);
    }
    // #endregion
}
