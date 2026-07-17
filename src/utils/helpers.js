// ===== FORMATTING HELPERS =====

// Format currency
export const formatCurrency = (amount) => {
    if (!amount) return '';
    const num = parseInt(amount.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return amount;
    return `₦${num.toLocaleString()}`;
};

// Format date
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format time ago
export const timeAgo = (dateString) => {
    if (!dateString) return '';
    const now = Date.now();
    const diff = now - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
};

// ===== VALIDATION HELPERS =====

// Validate phone number (Nigeria)
export const isValidPhone = (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/\s/g, '');
    return /^(0|234)?[789][01]\d{8}$/.test(cleaned);
};

// Validate email
export const isValidEmail = (email) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate URL
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// ===== STRING HELPERS =====

// Truncate text
export const truncate = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Slugify
export const slugify = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

// ===== DOM HELPERS =====

// Debounce
export const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

// Throttle
export const throttle = (fn, delay = 300) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
};

// ===== ERROR HELPERS =====

// Get error message from API response
export const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return 'Something went wrong. Please try again.';
};