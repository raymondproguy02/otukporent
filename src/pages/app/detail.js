// ===== PROPERTY DETAIL PAGE =====
import { getProperty, revealContact } from '../../utils/api.js';
import { renderImageGallery } from '../../components/ImageGallery/ImageGallery.js';
import { formatCurrency, timeAgo, truncate } from '../../utils/helpers.js';
import { CONTACT_REVEAL_FEE } from '../../utils/constants.js';

let currentPropertyId = null;
let currentProperty = null;

export async function renderDetail(container, params = {}) {
    const { id } = params;
    if (!id) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Property not found</h3>
                <p>No property ID provided.</p>
                <a href="/app.html" class="btn btn-primary">Go Home</a>
            </div>
        `;
        return;
    }

    currentPropertyId = id;

    // Show loading
    container.innerHTML = `
        <div class="page-detail">
            <div class="container">
                <div class="detail-loading">
                    <div class="skeleton" style="height:300px;border-radius:12px;"></div>
                    <div class="skeleton" style="height:32px;margin-top:16px;width:60%;"></div>
                    <div class="skeleton" style="height:20px;margin-top:8px;width:40%;"></div>
                    <div class="skeleton" style="height:100px;margin-top:16px;"></div>
                </div>
            </div>
        </div>
    `;

    try {
        const response = await getProperty(id);
        if (!response.success) {
            throw new Error(response.error || 'Failed to load property');
        }

        currentProperty = response.data;
        renderPropertyDetail(container);
    } catch (error) {
        console.error('Error loading property:', error);
        container.innerHTML = `
            <div class="page-detail">
                <div class="container">
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Failed to load property</h3>
                        <p>${error.message || 'Please try again.'}</p>
                        <a href="/app.html" class="btn btn-primary">Go Home</a>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderPropertyDetail(container) {
    const p = currentProperty;
    if (!p) return;

    const {
        id,
        type,
        location,
        street,
        price,
        description,
        landlord_name,
        landlord_phone,
        verified,
        photos = [],
        views = 0,
        revealed = false,
        created_at,
    } = p;

    const imageGalleryHTML = renderImageGallery(photos, type);

    container.innerHTML = `
        <div class="page-detail">
            <div class="container">
                <!-- Back Button -->
                <button class="back-btn" onclick="window.history.back()">
                    <i class="fas fa-arrow-left"></i> Back
                </button>

                <!-- Image Gallery -->
                ${imageGalleryHTML}

                <!-- Property Info -->
                <div class="detail-header">
                    <h1 class="detail-title">${type}</h1>
                    <div class="detail-meta">
                        ${verified ? '<span class="badge-verified">⭐ Verified Landlord</span>' : ''}
                        <span class="badge-views"><i class="fas fa-eye"></i> ${views} views</span>
                        ${created_at ? `<span class="badge-time"><i class="fas fa-clock"></i> ${timeAgo(created_at)}</span>` : ''}
                    </div>
                </div>

                <!-- Detail Info -->
                <div class="detail-info card">
                    <div class="info-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <span><strong>Location:</strong> ${location} ${street ? `· ${street}` : ''}</span>
                    </div>
                    ${price ? `
                        <div class="info-row">
                            <i class="fas fa-money-bill-wave"></i>
                            <span><strong>Price:</strong> ${formatCurrency(price)}</span>
                        </div>
                    ` : ''}
                    <div class="info-row">
                        <i class="fas fa-user"></i>
                        <span><strong>Landlord:</strong> ${landlord_name}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-phone"></i>
                        <span>
                            <strong>Contact:</strong>
                            ${revealed
                                ? `<span class="contact-revealed">${landlord_phone}</span>`
                                : `<span class="contact-hidden">🔒 Pay ${CONTACT_REVEAL_FEE} to reveal</span>`
                            }
                        </span>
                    </div>
                </div>

                <!-- Description -->
                ${description ? `
                    <div class="detail-description card">
                        <h3>Description</h3>
                        <p>${description}</p>
                    </div>
                ` : ''}

                <!-- Contact Action -->
                ${!revealed ? `
                    <button class="btn btn-gold btn-lg btn-block reveal-btn" onclick="openRevealModal()">
                        <i class="fas fa-lock"></i> Pay ₦${CONTACT_REVEAL_FEE} to Reveal Contact
                    </button>
                ` : `
                    <div class="contact-revealed-box">
                        <i class="fas fa-check-circle"></i>
                        <span>Contact revealed! Call the landlord directly: <strong>${landlord_phone}</strong></span>
                    </div>
                `}

                <!-- Actions -->
                <div class="detail-actions">
                    <button class="btn btn-outline btn-sm" onclick="shareProperty()">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="reportProperty(${id})">
                        <i class="fas fa-flag"></i> Report
                    </button>
                </div>

                <!-- Similar Properties (Placeholder) -->
                <div class="similar-properties">
                    <h3>Similar Properties</h3>
                    <div class="similar-grid">
                        <p style="grid-column:1/-1;color:var(--color-text-muted);text-align:center;padding:20px 0;">
                            More properties coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== REVEAL MODAL =====
window.openRevealModal = function() {
    const p = currentProperty;
    if (!p) return;

    const modalContent = `
        <div class="reveal-modal">
            <h2>💰 Pay ₦${CONTACT_REVEAL_FEE} to Contact</h2>
            <p class="modal-sub">${p.type} in ${p.location}</p>
            <p class="modal-landlord">👤 Landlord: ${p.landlord_name}</p>

            <div class="modal-section">
                <label for="tenantPhone">Your Phone Number *</label>
                <input type="tel" id="tenantPhone" placeholder="e.g. 080XXXXXXX" required />
            </div>

            <div class="modal-section payment-info">
                <h4>Pay via OPAY</h4>
                <p><strong>Account:</strong> OtukpoRent</p>
                <p><strong>OPAY Number:</strong> 080XXXXXXX</p>
                <p><strong>Amount:</strong> ₦${CONTACT_REVEAL_FEE}</p>
            </div>

            <div class="modal-section">
                <label for="transactionRef">Transaction Reference</label>
                <input type="text" id="transactionRef" placeholder="e.g. OPAY123456" />
            </div>

            <button class="btn btn-gold btn-block" onclick="submitReveal()">
                <i class="fas fa-check"></i> Verify & Reveal
            </button>

            <div class="modal-divider">or</div>

            <div class="modal-section cash-option">
                <p><i class="fas fa-hand-holding-usd"></i> Pay cash at our agent in Otukpo</p>
                <button class="btn btn-outline btn-sm" onclick="window.showToast('📍 Visit any OtukpoRent agent in Otukpo town')">
                    Find Agent
                </button>
            </div>

            <button class="modal-close" onclick="window.closeModal()">Cancel</button>
        </div>
    `;

    window.openModal(modalContent);
};

// ===== SUBMIT REVEAL =====
window.submitReveal = async function() {
    const phone = document.getElementById('tenantPhone')?.value.trim();
    const ref = document.getElementById('transactionRef')?.value.trim();

    if (!phone) {
        window.showToast('Please enter your phone number', 'error');
        return;
    }

    if (!ref) {
        window.showToast('Please enter your transaction reference', 'error');
        return;
    }

    try {
        const response = await revealContact(currentPropertyId, phone, ref);
        if (response.success) {
            window.closeModal();
            window.showToast('✅ Contact revealed! You can now call the landlord.', 'success');
            // Refresh detail page
            await renderDetail(document.getElementById('pageContainer'), { id: currentPropertyId });
        } else {
            window.showToast(response.error || 'Failed to verify payment', 'error');
        }
    } catch (error) {
        window.showToast(error.message || 'Something went wrong', 'error');
    }
};

// ===== SHARE PROPERTY =====
window.shareProperty = function() {
    if (!currentProperty) return;
    const p = currentProperty;
    const text =
        `🏠 ${p.type} in ${p.location} - ${p.price || ''}\nCheck it out on OtukpoRent!`;

    if (navigator.share) {
        navigator.share({
            title: 'OtukpoRent Property',
            text: text,
            url: window.location.href,
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            window.showToast('📋 Copied to clipboard!', 'success');
        }).catch(() => {
            window.showToast('Share: ' + text, 'info');
        });
    }
};

// ===== REPORT PROPERTY =====
window.reportProperty = function(id) {
    window.showToast('📢 Property reported. We\'ll review it.', 'info');
};