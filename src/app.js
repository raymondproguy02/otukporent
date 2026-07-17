// ===== APP ENTRY POINT =====
// This file is the main JavaScript entry point.
// It handles routing, page rendering, and global state.

import { renderHome } from './pages/app/home.js';
import { renderDetail } from './pages/app/detail.js';
import { renderPost } from './pages/app/post.js';
import { renderDashboard } from './pages/app/dashboard.js';
import { renderAdmin } from './pages/app/admin.js';
import { renderLogin } from './pages/app/auth/login.js';
import { isAdmin, getToken } from './utils/auth.js';
import { initGallery } from './components/ImageGallery/ImageGallery.js';

// ===== STATE =====
let currentPage = 'home';
let currentParams = {};

// ===== DOM REFS =====
const pageContainer = document.getElementById('pageContainer');
const navLinks = document.querySelectorAll('[data-page]');
const adminNavLink = document.getElementById('adminNavLink');

// ===== PAGE RENDERER =====
const pages = {
    home: renderHome,
    detail: renderDetail,
    post: renderPost,
    dashboard: renderDashboard,
    admin: renderAdmin,
    login: renderLogin,
};

export async function navigate(page, params = {}) {
    currentPage = page;
    currentParams = params;

    // Update URL
    const url = new URL(window.location);
    url.search = new URLSearchParams(params).toString();
    window.history.pushState({ page, params }, '', url);

    // Update nav
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Show admin nav if authenticated
    if (page === 'admin' && !isAdmin() && !getToken()) {
        navigate('login');
        return;
    }

    // Render page
    const renderFn = pages[page];
    if (renderFn) {
        pageContainer.innerHTML = '<div class="loader-container"><div class="loader"><div></div><div></div><div></div><div></div></div></div>';
        try {
            await renderFn(pageContainer, params);
            // Initialize any galleries after render
            setTimeout(() => initGallery(pageContainer), 100);
        } catch (error) {
            console.error('Error rendering page:', error);
            pageContainer.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Something went wrong</h3>
                    <p>${error.message || 'Please try again.'}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Reload</button>
                </div>
            `;
        }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ROUTING =====
function handleRoute() {
    const url = new URL(window.location);
    const params = Object.fromEntries(url.searchParams);
    const page = params.page || 'home';

    // Special case: if property ID is present, go to detail
    if (params.property) {
        navigate('detail', { id: params.property });
        return;
    }

    // Check if user is trying to access admin
    if (page === 'admin' && !isAdmin() && !getToken()) {
        navigate('login');
        return;
    }

    navigate(page, params);
}

// ===== NAVIGATION CLICKS =====
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page === 'admin' && !isAdmin() && !getToken()) {
            navigate('login');
            return;
        }
        navigate(page);
    });
});

// ===== ADMIN NAV VISIBILITY =====
function updateAdminNav() {
    if (isAdmin() || getToken()) {
        adminNavLink.style.display = 'inline-flex';
    } else {
        adminNavLink.style.display = 'none';
    }
}

// ===== POPSTATE (Back/Forward) =====
window.addEventListener('popstate', handleRoute);

// ===== MOBILE MENU =====
document.getElementById('appMobileMenuBtn')?.addEventListener('click', () => {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('open');
});

// ===== INIT =====
updateAdminNav();
handleRoute();

// ===== EXPOSE GLOBALLY =====
window.navigate = navigate;
window.updateAdminNav = updateAdminNav;

console.log('🏠 OtukpoRent App initialized');