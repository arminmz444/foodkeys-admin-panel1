/**
 * Navigation Merger Utility
 * 
 * Merges static navigation config with dynamic navigation from meta.
 * Dynamic navigation from backend takes precedence.
 */

import navigationConfig from 'app/configs/navigationConfig';
import { getMetaCache } from './metaCache';

/**
 * Transform backend nav button to Fuse navigation format
 */
function transformNavButton(button) {
    const transformed = {
        id: button.id,
        title: button.label,
        type: button.page ? 'item' : (button.children && button.children.length > 0 ? 'collapse' : 'item'),
        url: button.route || undefined,
        icon: button.icon || 'heroicons-outline:document',
    };

    // Add description/subtitle if available
    if (button.description) {
        transformed.subtitle = button.description;
    }

    // Transform children recursively
    if (button.children && button.children.length > 0) {
        transformed.children = button.children.map(transformNavButton);
    }

    return transformed;
}

/**
 * Get merged navigation (dynamic from backend + static fallback)
 * @returns {array} - Navigation structure
 */
export function getMergedNavigation() {
    const meta = getMetaCache();
    
    // If we have dynamic navigation from backend, use it
    if (meta && meta.navButtons && meta.navButtons.length > 0) {
        return meta.navButtons.map(transformNavButton);
    }

    // Fallback to static config (for backwards compatibility or when meta not available)
    return navigationConfig;
}

/**
 * Check if using dynamic navigation
 * @returns {boolean} - True if dynamic nav is active
 */
export function isDynamicNavigationActive() {
    const meta = getMetaCache();
    return meta && meta.navButtons && meta.navButtons.length > 0;
}
