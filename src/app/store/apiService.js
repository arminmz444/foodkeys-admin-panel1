import {createApi} from '@reduxjs/toolkit/query/react';
import Axios from 'axios';
import {enqueueSnackbar} from 'notistack';
import { setMetaCache } from './metaCache';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_STATIC_FILES_BASE_URL = import.meta.env.VITE_API_STATIC_FILES_BASE_URL;

// Toast deduplication: Track recent toasts to prevent duplicates
const toastHistory = [];
const TOAST_DEDUP_WINDOW_MS = 2000; // 2 seconds window for deduplication

/**
 * Check if a similar toast was recently shown
 * @param {string} message - The message to check
 * @returns {boolean} - True if should show, false if should skip
 */
function shouldShowToast(message) {
    const now = Date.now();
    
    // Clean up old entries (older than the dedup window)
    while (toastHistory.length > 0 && now - toastHistory[0].timestamp > TOAST_DEDUP_WINDOW_MS) {
        toastHistory.shift();
    }
    
    // Check if a similar message was shown recently
    const isDuplicate = toastHistory.some(entry => {
        // Consider messages similar if they're within 80% similarity
        const similarity = calculateSimilarity(entry.message, message);
        return similarity > 0.8;
    });
    
    if (!isDuplicate) {
        toastHistory.push({ message, timestamp: now });
        return true;
    }
    
    return false;
}

/**
 * Calculate string similarity (simple Levenshtein-based)
 */
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

const axiosBaseQuery =
    () =>
        async ({url, method, data, params, responseType}) => {
            try {
                Axios.defaults.baseURL = API_BASE_URL; // + "/api/v1";

                if (!Axios.defaults.baseURL.includes('/api/v1')) Axios.defaults.baseURL += '/api/v1';

                Axios.defaults.withCredentials = true;
                // Axios.defaults.headers.get['Content-Type'] = 'application/json';
                // Axios.defaults.headers.delete['Content-Type'] = 'application/json';
                // Axios.defaults.headers.post['Content-Type'] = 'application/json';
                // Axios.defaults.headers.put['Content-Type'] = 'application/json';
                const isFormData = data instanceof FormData;
                if (!isFormData) {
                    Axios.defaults.headers.get['Content-Type'] = 'application/json';
                    Axios.defaults.headers.delete['Content-Type'] = 'application/json';
                    Axios.defaults.headers.post['Content-Type'] = 'application/json';
                    Axios.defaults.headers.put['Content-Type'] = 'application/json';
                }
                const requestIntercept = Axios.interceptors.request.use(
                    (config) => {
                        if (!config.headers.Authorization) {
                            // TODO: Use slice instead of localstorage
                            // eslint-disable-next-line no-undef
                            config.headers.Authorization = `Bearer ${localStorage.getItem('jwt_access_token') || ''}`;
                        }
                        if (config.data instanceof FormData) {
                            delete config.headers['Content-Type'];
                        }
                        return config;
                    },
                    (error) => Promise.reject(error)
                );
                // Axios.interceptors.requestheaders.post["Authorization"] = "";
                const result = await Axios({
                    url,
                    method,
                    data,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    params,
                    ...(responseType ? { responseType } : {}),
                });
                //
                // if (result?.data?.statusCode !== 200) {
                // 	enqueueSnackbar(result.data.message || 'خطا در ارتباط با سرور', { className: 'bg-red' });
                // 	return { error: { status: result.data.statusCode, data: result.data } };
                // }

                // Extract and cache meta from response if present
                if (result.data?.meta) {
                    setMetaCache(result.data.meta);
                }

                return {data: result.data};
            } catch (axiosError) {
                const error = axiosError || null;
                const status = axiosError?.response?.status || null;
                const responseData = axiosError?.response?.data || null;
                const statusCode = responseData?.statusCode || null;
                const apiError = responseData?.error || null;
                const defaultMessage = 'خطا در ارتباط با سرور';
                const apiMessage = responseData?.message || defaultMessage;
                const message = `خطا در انجام عملیات: ${apiMessage}`;
                
                // Only show toast if not a duplicate
                if (shouldShowToast(message)) {
                    enqueueSnackbar(message, {
                        variant: 'error',
                        // anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                        style: {fontSize: 'medium'}
                    });
                }

                if (responseData && statusCode >= 400 && statusCode < 500)
                    return {error: {status, statusCode, apiError, apiMessage}};

                return {
                    error
                };
            }
        };

export const apiService = createApi({
    baseQuery: axiosBaseQuery(),
    endpoints: () => ({}),
    reducerPath: 'apiService'
});
export default apiService;
