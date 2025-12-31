import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage.utils"; // your sessionStorage helper

const BASE_URL = process.env.API_BASE_URL || "https://lmsapi-production-bd33.up.railway.app/api"; //"http://localhost:3003/api";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
});

// Request Interceptor → Add Bearer token if available in session
api.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccessToken();   // from sessionStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
    (error) => {
        const message =
            error?.message ||
            "Something went wrong";

        return Promise.reject({
            status: error?.statusCode,
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
