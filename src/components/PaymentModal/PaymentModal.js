// ===== PAYMENT MODAL COMPONENT =====
import { CONTACT_REVEAL_FEE } from '../../utils/constants.js';

export function renderPaymentModal(property) {
    const { id, type, location, landlord_name } = property;

    return `
        <div class="payment-modal">
            <div class="payment-modal-header">
                <h2>💰 Pay ₦${CONTACT_REVEAL_FEE} to Contact</h2>
                <button class="modal-close-btn" onclick="window.closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="payment-modal-body">
                <p class="modal-subtitle">${type} in ${location}</p>
                <p class="modal-landlord">👤 Landlord: ${landlord_name}</p>

                <div class="modal-section">
                    <label for="modalTenantPhone">Your Phone Number *</label>
                    <input type="tel" id="modalTenantPhone" placeholder="e.g. 080XXXXXXX" required />
                </div>

                <div class="payment-info-box">
                    <h4>Pay via OPAY</h4>
                    <p><strong>Account:</strong> OtukpoRent</p>
                    <p><strong>OPAY Number:</strong> 080XXXXXXX</p>
                    <p><strong>Amount:</strong> ₦${CONTACT_REVEAL_FEE}</p>
                </div>

                <div class="modal-section">
                    <label for="modalTransactionRef">Transaction Reference</label>
                    <input type="text" id="modalTransactionRef" placeholder="e.g. OPAY123456" />
                </div>

                <button class="btn btn-gold btn-block" onclick="window.submitPaymentReveal('${id}')">
                    <i class="fas fa-check"></i> Verify & Reveal
                </button>

                <div class="modal-divider">or</div>

                <div class="cash-option">
                    <p><i class="fas fa-hand-holding-usd"></i> Pay cash at our agent in Otukpo</p>
                    <button class="btn btn-outline btn-sm" onclick="window.showToast('📍 Visit any OtukpoRent agent in Otukpo town')">
                        Find Agent
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== PAYMENT SUBMISSION =====
window.submitPaymentReveal = async function(propertyId) {
    const phone = document.getElementById('modalTenantPhone')?.value.trim();
    const ref = document.getElementById('modalTransactionRef')?.value.trim();

    if (!phone) {
        window.showToast('Please enter your phone number', 'error');
        return;
    }

    if (!ref) {
        window.showToast('Please enter your transaction reference', 'error');
        return;
    }

    try {
        const { revealContact } = await import('../../utils/api.js');
        const response = await revealContact(propertyId, phone, ref);

        if (response.success) {
            window.closeModal();
            window.showToast('✅ Contact revealed! You can now call the landlord.', 'success');
            // Refresh detail page
            setTimeout(() => {
                window.navigate('detail', { id: propertyId });
            }, 500);
        } else {
            window.showToast(response.error || 'Failed to verify payment', 'error');
        }
    } catch (error) {
        window.showToast(error.message || 'Something went wrong', 'error');
    }
};