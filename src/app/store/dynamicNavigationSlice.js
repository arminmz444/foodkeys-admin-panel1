/**
 * Dynamic Navigation Slice (Authorization v2)
 * 
 * This slice manages navigation based on the `meta.navButtons` from API responses.
 * The navigation is dynamically built from the backend, ensuring users only see
 * pages they have access to.
 */

import { createSlice, createSelector } from '@reduxjs/toolkit';
import { getMetaCache, getNavigationButtons } from './metaCache';
import i18next from 'i18next';

const initialState = {
    navButtons: [],
    lastUpdate: null,
};

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
        children: button.children ? button.children.map(transformNavButton) : undefined,
    };

    // Add description/subtitle if available
    if (button.description) {
        transformed.subtitle = button.description;
    }

    return transformed;
}

export const dynamicNavigationSlice = createSlice({
    name: 'dynamicNavigation',
    initialState,
    reducers: {
        updateNavigationFromMeta(state) {
            const navButtons = getNavigationButtons();
            state.navButtons = navButtons;
            state.lastUpdate = Date.now();
        },
        clearDynamicNavigation(state) {
            state.navButtons = [];
            state.lastUpdate = null;
        },
    },
});

export const { updateNavigationFromMeta, clearDynamicNavigation } = dynamicNavigationSlice.actions;

/**
 * Selector for dynamic navigation
 */
export const selectDynamicNavigation = createSelector(
    [(state) => state.dynamicNavigation?.navButtons || []],
    (navButtons) => {
        if (!navButtons || navButtons.length === 0) {
            // Try to get from cache if slice is empty
            const buttons = getNavigationButtons();
            return buttons.map(transformNavButton);
        }
        
        return navButtons.map(transformNavButton);
    }
);

/**
 * Check if dynamic navigation is loaded
 */
export const selectIsDynamicNavigationLoaded = (state) => {
    return state.dynamicNavigation?.navButtons && state.dynamicNavigation.navButtons.length > 0;
};

export default dynamicNavigationSlice.reducer;
