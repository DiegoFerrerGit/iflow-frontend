import { Injectable } from '@angular/core';
import { ThemeColor, THEME_COLORS } from '../../models/income.model';

@Injectable({
    providedIn: 'root'
})
export class CategoryColorService {
    private readonly STORAGE_KEY = 'iflow_category_colors';
    private categoryMap: Record<string, ThemeColor> = {};

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Gets a persistent color for a category label.
     */
    getColor(category: string): ThemeColor {
        if (!category) return 'primary';

        const cleanCategory = category.trim().toLowerCase();

        // 1. Return existing assignment
        if (this.categoryMap[cleanCategory]) {
            return this.categoryMap[cleanCategory];
        }

        // 2. Assign a new color (automatic)
        const usedColors = this.getUsedColors();
        const availableColor = THEME_COLORS.find(color => !usedColors.has(color));

        let assignedColor: ThemeColor;
        if (availableColor) {
            assignedColor = availableColor;
        } else {
            // Fallback: rotation
            const index = Object.keys(this.categoryMap).length % THEME_COLORS.length;
            assignedColor = THEME_COLORS[index];
        }

        this.categoryMap[cleanCategory] = assignedColor;
        this.saveToStorage();
        return assignedColor;
    }

    /**
     * Manually sets/overrides a color for a category.
     */
    setColor(category: string, color: ThemeColor): void {
        if (!category) return;
        const cleanCategory = category.trim().toLowerCase();
        this.categoryMap[cleanCategory] = color;
        this.saveToStorage();
    }

    /**
     * Returns a set of all colors currently assigned to ANY category.
     */
    getUsedColors(): Set<ThemeColor> {
        return new Set(Object.values(this.categoryMap));
    }

    private loadFromStorage(): void {
        if (typeof localStorage === 'undefined') return;
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.categoryMap = JSON.parse(stored);
            } catch (e) {
                this.categoryMap = {};
            }
        }
    }

    private saveToStorage(): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categoryMap));
    }
}
