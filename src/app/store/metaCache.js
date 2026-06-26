/**
 * Meta caching utility for Authorization v2
 *
 * Caches the `meta` object from API responses which contains:
 * - navButtons: Dynamic navigation structure
 * - allowedPages: Pages user can access
 * - pageActions: Actions available per page
 * - permissions: Raw permission names
 *
 * Security considerations:
 * - Cache is stored in memory only (not localStorage) to prevent tampering
 * - Cache is automatically invalidated on:
 *   1. User logout
 *   2. Permission/role changes (detected via fingerprint in backend)
 *   3. Manual invalidation
 * - Backend recomputes meta when user's permission set changes
 */

let metaCache = null;
let cacheTimestamp = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes max cache duration

/**
 * Store meta in cache
 * @param {object} meta - The meta object from API response
 */
export function setMetaCache(meta) {
    if (!meta) return;
    
    metaCache = {
        client: meta.client,
        navButtons: meta.navButtons || [],
        allowedPages: meta.allowedPages || [],
        pageActions: meta.pageActions || {},
        permissions: meta.permissions || [],
    };
    cacheTimestamp = Date.now();
}

/**
 * Get meta from cache
 * @returns {object|null} - Cached meta or null if expired/not set
 */
export function getMetaCache() {
    // Check if cache exists and is not expired
    if (!metaCache || !cacheTimestamp) {
        return null;
    }
    
    const isExpired = Date.now() - cacheTimestamp > CACHE_DURATION_MS;
    if (isExpired) {
        clearMetaCache();
        return null;
    }
    
    return metaCache;
}

/**
 * Clear meta cache (call on logout or permission changes)
 */
export function clearMetaCache() {
    metaCache = null;
    cacheTimestamp = null;
}

/**
 * Check if a page is allowed for the current user
 * @param {string} pageId - The page identifier
 * @returns {boolean} - True if allowed, false otherwise
 */
export function isPageAllowed(pageId) {
    const meta = getMetaCache();
    if (!meta) return false;
    
    return meta.allowedPages.includes(pageId);
}

/**
 * Check if a specific action is allowed on a page
 * @param {string} pageId - The page identifier
 * @param {string} actionId - The action identifier
 * @returns {boolean} - True if allowed, false otherwise
 */
export function isActionAllowed(pageId, actionId) {
    const meta = getMetaCache();
    if (!meta) return false;
    
    const pageActions = meta.pageActions[pageId] || [];
    return pageActions.includes(actionId);
}

/**
 * Get navigation buttons for current user
 * @returns {array} - Navigation buttons structure
 */
export function getNavigationButtons() {
    const meta = getMetaCache();
    return meta?.navButtons || [];
}

/**
 * Check if user has a specific permission
 * @param {string} permissionName - The permission name
 * @returns {boolean} - True if has permission, false otherwise
 */
export function hasPermission(permissionName) {
    const meta = getMetaCache();
    if (!meta) return false;
    
    return meta.permissions.includes(permissionName);
}
