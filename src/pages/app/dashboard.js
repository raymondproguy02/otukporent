// ===== LANDLORD DASHBOARD =====
import { getProperties, deleteProperty, markAsRented } from '../../utils/api.js';
import { formatCurrency, timeAgo } from '../../utils/helpers.js';
import { PROPERTY_STATUS } from '../../utils/constants.js';

let landlordPhone = null;

export async function renderDashboard(container) {
    // Try to get landlord phone from profile
    try {
        const saved = localStorage.getItem('otukpo_landlord_profile');
        if (saved) {
            const profile = JSON.parse(saved);
            landlordPhone = profile.phone;
        }
    } catch (e) {
        landlordPhone = null;
    }

    container.innerHTML = `
        <div class="page-dashboard">
            <div class="container">
                <div class="dashboard-header flex items-center justify-between">
                    <h1 class="page-title"><i class="fas fa-user"></i> My Dashboard</h1>
                    <a href="#" onclick="window.navigate('post')" class="btn btn-primary btn-sm">
                        <i class="fas fa-plus-circle"></i> New Listing
                    </a>
                </div>

                ${!landlordPhone ? `
                    <div class="dashboard-warning">
                        <i class="fas fa-info-circle"></i>
                        <span>No profile found. <a href="#" onclick="window.navigate('post')">Post a property</a> to get started.</span>
                    </div>
                ` : ''}

                <!-- Stats -->
                <div class="stats-grid" id="statsGrid">
                    <div class="stat-card">
                        <div class="stat-number" id="statActive">0</div>
                        <div class="stat-label">Active</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="statPending">0</div>
                        <div class="stat-label">Pending</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="statRented">0</div>
                        <div class="stat-label">Rented</div>
                    </div>
                </div>

                <!-- Listings -->
                <div class="listings-section">
                    <h2 class="section-title-sm">My Listings</h2>
                    <div id="dashboardListings">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    await loadDashboard();
}

async function loadDashboard() {
    const container = document.getElementById('dashboardListings');
    const statsActive = document.getElementById('statActive');
    const statsPending = document.getElementById('statPending');
    const statsRented = document.getElementById('statRented');

    try {
        // Get all properties (admin can see all, but we filter by phone)
        const response = await getProperties({ limit: 100 });

        if (!response.success) {
            throw new Error(response.error || 'Failed to load properties');
        }

        let properties = response.data || [];

        // If landlord phone is set, filter by phone
        if (landlordPhone) {
            properties = properties.filter(p => p.landlord_phone === landlordPhone);
        } else {
            // If no phone, show all (for testing)
            console.warn('No landlord phone set, showing all properties');
        }

        // Calculate stats
        const active = properties.filter(p => p.status === PROPERTY_STATUS.ACTIVE).length;
        const pending = properties.filter(p => p.status === PROPERTY_STATUS.PENDING).length;
        const rented = properties.filter(p => p.status === PROPERTY_STATUS.RENTED).length;

        statsActive.textContent = active;
        statsPending.textContent = pending;
        statsRented.textContent = rented;

        if (properties.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-home" style="font-size:2rem;color:var(--color-text-muted);"></i>
                    <p>You haven't posted any properties yet.</p>
                    <a href="#" onclick="window.navigate('post')" class="btn btn-primary btn-sm">
                        <i class="fas fa-plus-circle"></i> Post Your First Property
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = properties.map(p => `
            <div class="listing-item" data-id="${p.id}">
                <div class="listing-info">
                    <h4>${p.type} - ${p.location}</h4>
                    <p class="listing-meta">
                        ${p.street || ''} ${p.price ? `· ${formatCurrency(p.price)}` : ''}
                        <span class="listing-views"><i class="fas fa-eye"></i> ${p.views || 0}</span>
                        ${p.contactReveals ? `<span><i class="fas fa-phone"></i> ${p.contactReveals.length} reveals</span>` : ''}
                    </p>
                    <p class="listing-date">Posted ${timeAgo(p.created_at)}</p>
                </div>
                <div class="listing-actions">
                    <span class="status-badge ${p.status}">${p.status}</span>
                    ${p.status === PROPERTY_STATUS.ACTIVE ? `
                        <button class="action-btn rent-btn" onclick="window.markAsRented('${p.id}')" title="Mark as rented">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    ` : p.status === PROPERTY_STATUS.RENTED ? `
                        <button class="action-btn active-btn" onclick="window.markAsActive('${p.id}')" title="Mark as available">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn delete-btn" onclick="window.deleteListing('${p.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading dashboard:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message || 'Failed to load listings'}</p>
                <button onclick="location.reload()" class="btn btn-primary btn-sm">Retry</button>
            </div>
        `;
    }
}

// ===== DASHBOARD ACTIONS =====
window.markAsRented = async function(id) {
    if (!confirm('Mark this property as rented?')) return;
    try {
        const response = await markAsRented(id);
        if (response.success) {
            window.showToast('✅ Property marked as rented', 'success');
            await loadDashboard();
        } else {
            throw new Error(response.error || 'Failed to update');
        }
    } catch (error) {
        window.showToast(error.message || 'Failed to update', 'error');
    }
};

window.markAsActive = async function(id) {
    if (!confirm('Mark this property as available again?')) return;
    try {
        // Approve will set it back to active
        const { approveProperty } = await import('../../utils/api.js');
        const response = await approveProperty(id);
        if (response.success) {
            window.showToast('✅ Property marked as available', 'success');
            await loadDashboard();
        } else {
            throw new Error(response.error || 'Failed to update');
        }
    } catch (error) {
        window.showToast(error.message || 'Failed to update', 'error');
    }
};

window.deleteListing = async function(id) {
    if (!confirm('Delete this listing permanently? This action cannot be undone.')) return;
    try {
        const response = await deleteProperty(id);
        if (response.success) {
            window.showToast('🗑️ Listing deleted', 'success');
            await loadDashboard();
        } else {
            throw new Error(response.error || 'Failed to delete');
        }
    } catch (error) {
        window.showToast(error.message || 'Failed to delete', 'error');
    }
};

// Re-export for reload
export async function reloadDashboard() {
    await loadDashboard();
}