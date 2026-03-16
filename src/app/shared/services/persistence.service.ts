import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private readonly MAX_ITEMS = 8;
  private readonly STORAGE_PREFIX = 'iflow_persistence_';

  constructor() {}

  /**
   * Retrieves recent items of a specific type (icons or colors) for a given context (form).
   */
  getRecent(context: string, type: 'icons' | 'colors'): string[] {
    const key = `${this.STORAGE_PREFIX}${context}_${type}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing persistence storage', e);
      return [];
    }
  }

  /**
   * Saves a new selection to the recent list. 
   * Moves to front if exists, limits to MAX_ITEMS.
   */
  saveSelection(context: string, type: 'icons' | 'colors', value: string): void {
    if (!value) return;
    
    const key = `${this.STORAGE_PREFIX}${context}_${type}`;
    let items = this.getRecent(context, type);
    
    // Remove if already exists to move it to the front
    items = items.filter(item => item !== value);
    
    // Add to front
    items.unshift(value);
    
    // Limit size
    if (items.length > this.MAX_ITEMS) {
      items = items.slice(0, this.MAX_ITEMS);
    }
    
    localStorage.setItem(key, JSON.stringify(items));
  }

  /**
   * Clears persistence for a context (optional utility)
   */
  clearContext(context: string): void {
    const iconKey = `${this.STORAGE_PREFIX}${context}_icons`;
    const colorKey = `${this.STORAGE_PREFIX}${context}_colors`;
    localStorage.removeItem(iconKey);
    localStorage.removeItem(colorKey);
  }
}
