import { Action, createReducer, on } from '@ngrx/store';
import { isLoading, stopLoading } from './loader.actions';

export interface LoaderState {
    isLoading: boolean;
}

export const initialState: LoaderState = {
    isLoading: false,
};

const _loaderReducer = createReducer(initialState,
    on(isLoading, state => ({ ...state, isLoading: true })),
    on(stopLoading, state => ({ ...state, isLoading: false }))
);

export function loaderReducer(state: LoaderState | undefined, action: Action) {
    return _loaderReducer(state, action);
}
