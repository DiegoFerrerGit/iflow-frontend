import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IOdinResponse, IIncomeSourceApi, IAllocationBoxApi, IAllocationBoxDetailResponse, IAllocationSubCategoryDto, ISubCategoryDetailResponse, IAllocationItemDto } from './models/interfaces/api.response.interfaces';
import { IIncomeSourceRequesApi, IAllocationBoxRequestApi, IAllocationSubCategoryRequestApi, IAllocationItemRequestApi } from './models/interfaces/api.request.interfaces';
import { environment } from '../../../environments/environment';
import { HIDE_SPINNER_OPTIONS } from '../../core/interceptors/models/constants/interceptors.constants';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsManager } from '../../core/errors/error.manager';
import { ERROR_CONTEXTS } from '../../core/errors/models/constants/error-contexts.constants';

@Injectable({
    providedIn: 'root'
})
export class OdinApiService {
    private readonly http: HttpClient = inject(HttpClient);
    private readonly errorsManager: ErrorsManager = inject(ErrorsManager);
    private readonly API_URL: string = `${environment.apiUrl}/odin`;

    public getOdin(): Observable<IOdinResponse> {
        return this.http.get<IOdinResponse>(this.API_URL).pipe(
            map(response => ({
                ...response,
                income_sources: response.income_sources.slice(0, 1)
            })),
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }

    // #region INCOME SECTION
    public createIncomeSource(data: IIncomeSourceRequesApi): Observable<IIncomeSourceApi> {
        return this.http.post<IIncomeSourceApi>(`${this.API_URL}/income-sources`, data, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }

    public updateIncomeSource(id: string, data: IIncomeSourceRequesApi): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/income-sources/${id}`, data, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }

    public deleteIncomeSource(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/income-sources/${id}`, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }
    // #endregion

    // #region ALLOCATION SECTION
    public createAllocationBox(data: IAllocationBoxRequestApi): Observable<IAllocationBoxApi> {
        return this.http.post<IAllocationBoxApi>(`${this.API_URL}/allocation-boxes`, data, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.ODIN_CREATE_BOX);
                return throwError(() => error);
            })
        );
    }

    public updateAllocationBox(id: string, data: IAllocationBoxRequestApi): Observable<IAllocationBoxApi> {
        return this.http.put<IAllocationBoxApi>(`${this.API_URL}/allocation-boxes/${id}`, data, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.ODIN_UPDATE_BOX);
                return throwError(() => error);
            })
        );
    }

    public deleteAllocationBox(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/allocation-boxes/${id}`, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }

    public getAllocationBoxDetail(id: string): Observable<IAllocationBoxDetailResponse> {
        return this.http.get<IAllocationBoxDetailResponse>(`${this.API_URL}/allocation-boxes/${id}`).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }


    // #endregion

    // #region SUB CATEGORIES

    public createSubCategory(allocationId: string, data: IAllocationSubCategoryRequestApi): Observable<IAllocationSubCategoryDto> {
        return this.http.post<IAllocationSubCategoryDto>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories`, data, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.ODIN_CREATE_SUBCATEGORY);
                return throwError(() => error);
            })
        );
    }

    public updateSubCategory(allocationId: string, subCategoryId: string, data: IAllocationSubCategoryRequestApi): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}`, data, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.ODIN_UPDATE_SUBCATEGORY);
                return throwError(() => error);
            })
        );
    }

    public deleteSubCategory(allocationId: string, subCategoryId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}`, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }

    public getSubCategoryDetails(allocationId: string, subCategoryId: string): Observable<ISubCategoryDetailResponse> {
        return this.http.get<ISubCategoryDetailResponse>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}`).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }

    // #region ITEMS of SUB CATEGORIES

    public createItem(allocationId: string, subCategoryId: string, request: IAllocationItemRequestApi): Observable<IAllocationItemDto> {
        return this.http.post<IAllocationItemDto>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}/items`, request, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.ODIN_CREATE_ITEM);
                return throwError(() => error);
            })
        );
    }

    public updateItem(allocationId: string, subCategoryId: string, itemId: string, request: IAllocationItemRequestApi): Observable<IAllocationItemDto> {
        return this.http.put<IAllocationItemDto>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}/items/${itemId}`, request, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.ODIN_UPDATE_ITEM);
                return throwError(() => error);
            })
        );
    }

    public deleteItem(allocationId: string, subCategoryId: string, itemId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}/items/${itemId}`, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.ODIN_DELETE_ITEM);
                return throwError(() => error);
            })
        );
    }

    public togglePaidItem(allocationId: string, subCategoryId: string, itemId: string): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/allocation-boxes/${allocationId}/subcategories/${subCategoryId}/items/${itemId}/toggle-paid`, {}, HIDE_SPINNER_OPTIONS).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.ODIN_UPDATE_ITEM);
                return throwError(() => error);
            })
        );
    }
    // #endregion
}
