// ===== AUTHENTICATION UTILITIES =====
import { STORAGE_KEYS } from './constants.js';

// Get stored token
export const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Set token
export const setToken = (token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

// Remove token
export const removeToken = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Check if user is admin (has valid token)
export const isAdmin = () => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
};

// Set admin session
export const setAdminSession = () => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
};

// Clear admin session
export const clearAdminSession = () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
};

// Logout
export const logout = () => {
    removeToken();
    clearAdminSession();
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
    const token = getToken();
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};