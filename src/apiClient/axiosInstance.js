import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage.utils"; // your sessionStorage helper
import deviceUtils from "../utils/device.utils";
import { API_ENDPOINTS } from "../constants/apiEndPoints";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TENANT_ID = process.env.REACT_APP_TENANT_ID;
const ENTERPRISE_ID = process.env.REACT_APP_ENTERPRISE_ID;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
});

// Request Interceptor → Add Bearer token + tenant/enterprise IDs to every request
api.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccessToken();   // from sessionStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Append tenant_id and enterprise_id as query params on every request
        config.params = {
            ...(config.params || {}),
            ...(TENANT_ID ? { tenant_id: TENANT_ID } : {}),
            ...(ENTERPRISE_ID ? { enterprise_id: ENTERPRISE_ID } : {}),
        };

        try {
            const deviceId = deviceUtils.getDeviceId();
            const info = deviceUtils.getDeviceInfo();
            if (deviceId) config.headers["x-device-id"] = deviceId;
            if (info?.device_type) config.headers["x-device-type"] = info.device_type;
            if (info?.device_info) config.headers["x-device-info"] = info.device_info;
            const refresh = tokenStorage.getRefreshToken();
            if (refresh) config.headers["x-refresh-token"] = refresh;
        } catch (e) {
            // ignore
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor → Clean error message
api.interceptors.response.use(
    (response) => {
        return response;
    }
    ,
    async (error) => {
        const originalRequest = error?.config || {};
        const status = error?.response?.status;

        // Try refresh once on 401
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = tokenStorage.getRefreshToken();
                // if (refreshToken) {
                //     const resp = await api.post(API_ENDPOINTS.REFRESH, { refreshToken });
                //     const newAccess = resp?.data?.response?.accessToken || resp?.data?.response?.token;
                //     const newRefresh = resp?.data?.response?.refreshToken || null;
                //     if (newAccess) tokenStorage.setAccessToken(newAccess);
                //     if (newRefresh) tokenStorage.setRefreshToken(newRefresh);
                //     // set new header and retry original request
                //     originalRequest.headers = originalRequest.headers || {};
                //     originalRequest.headers.Authorization = `Bearer ${tokenStorage.getAccessToken()}`;
                //     return api(originalRequest);
                // }
            } catch (refreshErr) {
                // fall through to reject
            }
        }

        const message = error?.message || "Something went wrong";

        return Promise.reject({
            status: error?.response?.status || error?.statusCode,
            message,
            data: error?.response || null,
        });
    }
);

export default {
    get: (url, config = {}) => api.get(url, config),
    post: (url, data, config = {}) => api.post(url, data, config),
    put: (url, data, config = {}) => api.put(url, data, config),
    delete: (url, config = {}) => api.delete(url, config),
    patch: (url, data, config = {}) => api.patch(url, data, config),
};
