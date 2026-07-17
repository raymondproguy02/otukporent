// ===== ADMIN PANEL =====
import { getAdminProperties, approveProperty, rejectProperty, deleteProperty } from '../../utils/api.js';
import { formatCurrency, timeAgo } from '../../utils/helpers.js';
import { PROPERTY_STATUS } from '../../utils/constants.js';

let currentFilter = 'pending';

export async function renderAdmin(container) {
    container.innerHTML = `
        <div class="page-admin">
            <div class="container">
                <div class="admin-header flex items-center justify-between">
                    <h1 class="page-title"><i class="fas fa-shield-alt"></i> Admin Panel</h1>
                    <button class="btn btn-outline btn-sm" onclick="window.logoutAdmin()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>

                <!-- Filter Tabs -->
                <div class="admin-tabs" id="adminTabs">
                    <button class="tab active" data-filter="pending">Pending</button>
                    <button class="tab" data-filter="active">Active</button>
                    <button class="tab" data-filter="rented">Rented</button>
                    <button class="tab" data-filter="rejected">Rejected</button>
                    <button class="tab" data-filter="all">All</button>
                </div>

                <!-- Stats -->
                <div class="admin-stats" id="adminStats">
                    <div class="stat-item">
                        <span class="stat-label">Pending</span>
                        <span class="stat-value" id="statPending">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Active</span>
                        <span class="stat-value" id="statActive">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Rented</span>
                        <span class="stat-value" id="statRented">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total</span>
                        <span class="stat-value" id="statTotal">0</span>
                    </div>
                </div>

                <!-- Listings -->
                <div id="adminListings">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Loading...
                    </div>
                </div>
            </div>
        </div>
    `;

    // ===== TAB HANDLING =====
    document.querySelectorAll('#adminTabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#adminTabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            loadAdminListings();
        });
    });

    await loadAdminListings();
}

async function loadAdminListings() {
    const container = document.getElementById('adminListings');

    try {
        const response = await getAdminProperties({ status: currentFilter === 'all' ? undefined : currentFilter, limit: 100 });

        if (!response.success) {
            throw new Error(response.error || 'Failed to load properties');
        }

        const properties = response.data || [];
        const total = response.pagination?.total || 0;

        // Update stats (fetch all counts)
        await updateStats();

        if (properties.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="font-size:2rem;color:var(--color-success);"></i>
                    <p>No ${currentFilter} properties found.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = properties.map(p => `
            <div class="admin-listing-item" data-id="${p.id}">
                <div class="admin-listing-header flex items-center justify-between">
                    <div>
                        <h4>${p.type} - ${p.location}</h4>
                        <p class="admin-listing-meta">
                            ${p.street || ''} ${p.price ? `· ${formatCurrency(p.price)}` : ''}
                            <span class="status-badge ${p.status}">${p.status}</span>
                        </p>
                    </div>
                    <span class="admin-listing-date">${timeAgo(p.created_at)}</span>
                </div>

                <div class="admin-listing-details">
                    <p><strong>Landlord:</strong> ${p.landlord_name} (${p.landlord_phone})</p>
                    ${p.description ? `<p class="admin-desc">${p.description.substring(0, 150)}${p.description.length > 150 ? '...' : ''}</p>` : ''}
                    ${p.photos && p.photos.length > 0 ? `
                        <div class="admin-photos">
                            ${p.photos.slice(0, 3).map(ph => `
                                <img src="${ph}" alt="Property photo" loading="lazy" />
                            `).join('')}
                            ${p.photos.length > 3 ? `<span class="photo-count">+${p.photos.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                    <div class="admin-stats-row">
                        <span><i class="fas fa-eye"></i> ${p.views || 0} views</span>
                        <span><i class="fas fa-phone"></i> ${p.contactReveals?.length || 0} reveals</span>
                    </div>
                </div>

                <div class="admin-listing-actions">
                    ${p.status === PROPERTY_STATUS.PENDING ? `
                        <button class="btn btn-success btn-sm" onclick="window.approveProperty('${p.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.rejectProperty('${p.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : p.status === PROPERTY_STATUS.ACTIVE ? `
                        <button class="btn btn-outline btn-sm" onclick="window.markAsRentedAdmin('${p.id}')">
                            <i class="fas fa-check-circle"></i> Mark Rented
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteListingAdmin('${p.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : p.status === PROPERTY_STATUS.RENTED ? `
                        <button class="btn btn-outline btn-sm" onclick="window.reactivateProperty('${p.id}')">
                            <i class="fas fa-undo"></i> Reactivate
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteListingAdmin('${p.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : `
                        <button class="btn btn-outline btn-sm" onclick="window.reactivateProperty('${p.id}')">
                            <i class="fas fa-undo"></i> Reactivate
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteListingAdmin('${p.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    `}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading admin listings:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message || 'Failed to load listings'}</p>
                <button onclick="loadAdminListings()" class="btn btn-primary btn-sm">Retry</button>
            </div>
        `;
    }
}

async function updateStats() {
    try {
        const response = await getAdminProperties({ limit: 500 });
        if (response.success) {
            const properties = response.data || [];
            const pending = properties.filter(p => p.status === PROPERTY_STATUS.PENDING).length;
            const active = properties.filter(p => p.status === PROPERTY_STATUS.ACTIVE).length;
            const rented = properties.filter(p => p.status === PROPERTY_STATUS.RENTED).length;

            document.getElementById('statPending').textContent = pending;
            document.getElementById('statActive').textContent = active;
            document.getElementById('statRented').textContent = rented;
            document.getElementById('statTotal').textContent = properties.length;
        }
    } catch (e) {
        console.warn('Failed to update stats:', e);
    }
}

// ===== ADMIN ACTIONS =====
window.approveProperty = async function(id) {
    try {
        const response = await approveProperty(id);
        if (response.success) {
            window.showToast('✅ Property approved and live!', 'success');
            await loadAdminListings();
        } else {
            throw new Error(response.error || 'Failed to approve');
        }
    } catch (error) {
        window.showToast(error.message || 'Failed to approve', 'error');
    }
};

window.rejectProperty = async function(id) {
    if (!confirm('Reject this property?')) return;
    try {
        const response = await rejectProperty(id);
        if (response.success) {
            window.showToast('❌ Property rejected', 'warning');
            await loadAdminListings();
        } else {
            throw new Error(response.error || 'Failed to reject');
        }
    } catch (error) {
        window.showToast(error.message || 'Failed to reject', 'error');
    }
};

window.markAsRentedAdmin = async function(id) {
    if (!confirm('Mark this property as rented?')) return;
    try {
        const { markAsRented } = await import('../../utils/api.js');
        const response = await markAsRented(id);
        if (response.success) {
            window.showToast('✅ Property marked as rented', 'success');
            await loadAdminListings();
        } else {
            throw new Error(response.error || 'Failed to update');
        }
    } catch (error) {
        window.showToast(error.message || 'Failed to update', 'error');
    }
};

window.reactivateProperty = async function(id) {
    try {
        const response = await approveProperty(id);
        if (response.success) {
            window.showToast('✅ Property reactivated', 'success');
            await loadAdminListings();
        } else {
            throw new Error(response.error || 'Failed to reactivate');
        }
    } catch (error) {
        window.showToast(error.message || 'Failed to reactivate', 'error');
    }
};

window.deleteListingAdmin = async function(id) {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return;
    try {
        const response = await deleteProperty(id);
        if (response.success) {
            window.showToast('🗑️ Listing deleted', 'success');
            await loadAdminListings();
        } else {
            throw new Error(response.error || 'Failed to delete');
        }
    } catch (error) {
        window.showToast(error.message || 'Failed to delete', 'error');
    }
};

window.logoutAdmin = function() {
    if (confirm('Logout from admin?')) {
        localStorage.removeItem('otukpo_auth_token');
        localStorage.removeItem('otukpo_admin_session');
        window.updateAdminNav();
        window.showToast('👋 Logged out', 'info');
        window.navigate('home');
    }
};