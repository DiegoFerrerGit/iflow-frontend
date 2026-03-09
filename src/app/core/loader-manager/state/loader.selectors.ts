import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoaderState } from './loader.reducer';

export const selectLoaderState = createFeatureSelector<LoaderState>('loader');
export const selectLoader = createSelector(selectLoaderState, (state: LoaderState) => state?.isLoading);
