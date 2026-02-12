import {createApi} from '@reduxjs/toolkit/query/react';
import Axios from 'axios';
import {enqueueSnackbar} from 'notistack';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_STATIC_FILES_BASE_URL = import.meta.env.VITE_API_STATIC_FILES_BASE_URL;
const axiosBaseQuery =
    () =>
        async ({url, method, data, params}) => {
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
                    params
                });
                //
                // if (result?.data?.statusCode !== 200) {
                // 	enqueueSnackbar(result.data.message || 'خطا در ارتباط با سرور', { className: 'bg-red' });
                // 	return { error: { status: result.data.statusCode, data: result.data } };
                // }

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
                // showMessage({
                // 	message: apiMessage,
                // 	autoHideDuration: 5000,
                // 	anchorOrigin: {
                // 		vertical: 'bottom',
                // 		horizontal: 'right'
                // 	},
                // 	variant: 'error'
                // });
                enqueueSnackbar(message, {
                    variant: 'error',
                    // anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                    style: {fontSize: 'medium'}
                });

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
