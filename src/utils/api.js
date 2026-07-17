// ===== API CLIENT =====
import { API_CONFIG, ENDPOINTS } from '../config/api.config.js';
import { getToken, logout } from './auth.js';
import { getErrorMessage } from './helpers.js';

// ===== FETCH WRAPPER =====
const fetchApi = async (endpoint, options = {}) => {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = getToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config = {
        ...API_CONFIG,
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        // Handle token expiry
        if (response.status === 401) {
            logout();
            if (typeof window !== 'undefined') {
                window.location.href = '/login.html';
            }
            throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

// ===== API METHODS =====

// Auth
export const adminLogin = (email, password) => {
    return fetchApi(ENDPOINTS.ADMIN_LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

export const verifyAdmin = () => {
    return fetchApi(ENDPOINTS.ADMIN_VERIFY);
};

// Properties (Public)
export const getProperties = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`${ENDPOINTS.GET_PROPERTIES}?${query}`);
};

export const getProperty = (id) => {
    return fetchApi(ENDPOINTS.GET_PROPERTY(id));
};

export const createProperty = (data) => {
    return fetchApi(ENDPOINTS.CREATE_PROPERTY, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const revealContact = (id, tenantPhone, transactionRef) => {
    return fetchApi(ENDPOINTS.REVEAL_CONTACT(id), {
        method: 'POST',
        body: JSON.stringify({ tenant_phone: tenantPhone, transaction_ref: transactionRef }),
    });
};

// Admin
export const getAdminProperties = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`${ENDPOINTS.ADMIN_PROPERTIES}?${query}`);
};

export const approveProperty = (id) => {
    return fetchApi(ENDPOINTS.ADMIN_APPROVE(id), {
        method: 'PUT',
    });
};

export const rejectProperty = (id) => {
    return fetchApi(ENDPOINTS.ADMIN_REJECT(id), {
        method: 'PUT',
    });
};

export const markAsRented = (id) => {
    return fetchApi(ENDPOINTS.ADMIN_RENTED(id), {
        method: 'PUT',
    });
};

export const deleteProperty = (id) => {
    return fetchApi(ENDPOINTS.ADMIN_DELETE(id), {
        method: 'DELETE',
    });
};

// Health
export const healthCheck = () => {
    return fetchApi(ENDPOINTS.HEALTH);
};