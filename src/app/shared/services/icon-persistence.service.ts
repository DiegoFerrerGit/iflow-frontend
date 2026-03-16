import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IconPersistenceService {
  private readonly STORAGE_KEY = 'iflow_recent_icons_';

  /**
   * Retrieves the list of recently used icons for a given context (e.g., 'allocation', 'income').
   */
  getRecentIcons(context: string): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY + context);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading recent icons from localStorage', e);
      return [];
    }
  }

  /**
   * Saves a new icon usage. Keeps only the last 8 unique icons.
   */
  saveIconUsage(context: string, icon: string): void {
    if (!icon) return;
    
    try {
      let recent = this.getRecentIcons(context);
      
      // Remove if already exists to move it to the front
      recent = recent.filter(i => i !== icon);
      
      // Add to start
      recent.unshift(icon);
      
      // Limit to 8
      recent = recent.slice(0, 8);
      
      localStorage.setItem(this.STORAGE_KEY + context, JSON.stringify(recent));
    } catch (e) {
      console.error('Error saving recent icon to localStorage', e);
    }
  }
}
