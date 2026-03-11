import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { isLoading, stopLoading } from '../loader-manager/state/loader.actions';

@Injectable({
    providedIn: 'root'
})
export class LoaderManager {
    private readonly store: Store = inject(Store);

    public show(): void {
        this.store.dispatch(isLoading());
    }

    public hide(): void {
        this.store.dispatch(stopLoading());
    }
}
