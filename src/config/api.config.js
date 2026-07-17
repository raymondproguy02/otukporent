// ===== API CONFIGURATION =====
import { API_BASE } from '../utils/constants.js';

export const API_CONFIG = {
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
};

// ===== API ENDPOINTS =====
export const ENDPOINTS = {
    // Auth
    ADMIN_LOGIN: '/auth/login',
    ADMIN_VERIFY: '/auth/verify',

    // Properties (Public)
    GET_PROPERTIES: '/properties',
    GET_PROPERTY: (id) => `/properties/${id}`,
    CREATE_PROPERTY: '/properties',
    REVEAL_CONTACT: (id) => `/properties/${id}/reveal`,

    // Admin
    ADMIN_PROPERTIES: '/admin/properties',
    ADMIN_APPROVE: (id) => `/admin/properties/${id}/approve`,
    ADMIN_REJECT: (id) => `/admin/properties/${id}/reject`,
    ADMIN_RENTED: (id) => `/admin/properties/${id}/rented`,
    ADMIN_DELETE: (id) => `/admin/properties/${id}`,

    // Health
    HEALTH: '/health',
};