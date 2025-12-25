/**
 * tokenStorage abstraction
 * - default uses localStorage (simple)
 * - optionally swap to cookies (server-set httpOnly cookies recommended)
 * - or use encrypted storage
 *
 * IMPORTANT: httpOnly cookies are the most secure for refresh/access tokens.
 * They must be issued by server. Frontend can still call endpoints and cookies will be sent automatically.
 */

const ACCESS_KEY = "lms_access_token";
const REFRESH_KEY = "lms_refresh_token";
const USER_KEY = "lms_user";


export const tokenStorage = {
    // Access token
    getUserToken: () => {
        try { return localStorage.getItem(USER_KEY); } catch (e) { return null; }
    },
    setUserToken: (t) => {
        try { localStorage.setItem(USER_KEY, t); } catch (e) { }
    },
    removeUserToken: () => {
        try { localStorage.removeItem(USER_KEY); } catch (e) { }
    },

    // Access token
    getAccessToken: () => {
        try { return localStorage.getItem(ACCESS_KEY); } catch (e) { return null; }
    },
    setAccessToken: (t) => {
        try { localStorage.setItem(ACCESS_KEY, t); } catch (e) { }
    },
    removeAccessToken: () => {
        try { localStorage.removeItem(ACCESS_KEY); } catch (e) { }
    },

    // Refresh token
    getRefreshToken: () => {
        try { return localStorage.getItem(REFRESH_KEY); } catch (e) { return null; }
    },
    setRefreshToken: (t) => {
        try { localStorage.setItem(REFRESH_KEY, t); } catch (e) { }
    },
    removeRefreshToken: () => {
        try { localStorage.removeItem(REFRESH_KEY); } catch (e) { }
    },

    clearAll: () => {
        tokenStorage.removeAccessToken();
        tokenStorage.removeRefreshToken();
        tokenStorage.removeUserToken();
    }
};