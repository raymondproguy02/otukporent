// ===== OTUKPO LOCATIONS =====
export const LOCATIONS = [
    'GRA',
    'Asa',
    'Otukpo Town',
    'Deport',
    'Eupi',
    'Pipeline',
    'Ochito Ghana',
    'Ogbanor Marje',
    'Obaganya',
    'Otia',
    'Eth Man Quarters',
    'Idye',
    'Otobi',
    'Icho',
];

// ===== PROPERTY TYPES =====
export const PROPERTY_TYPES = [
    'Single Room',
    'Room & Parlor',
    'Self-Contained',
    'Flat',
    'Duplex',
    "Boys' Quarters",
    'Land',
    'Shop/Store',
    'Office',
];

// ===== PROPERTY STATUS =====
export const PROPERTY_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    RENTED: 'rented',
    REJECTED: 'rejected',
    DELETED: 'deleted',
};

// ===== PAYMENT =====
export const CONTACT_REVEAL_FEE = 200;
export const VERIFICATION_FEE = 500;

// ===== STORAGE KEYS =====
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'otukpo_auth_token',
    ADMIN_SESSION: 'otukpo_admin_session',
    LANDLORD_PROFILE: 'otukpo_landlord_profile',
};

// ===== API =====
export const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

// ===== PAGINATION =====
export const DEFAULT_LIMIT = 20;
export const MAX_PHOTOS = 5;