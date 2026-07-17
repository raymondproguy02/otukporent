// ===== PROPERTY CARD COMPONENT =====
import { truncate, formatCurrency } from '../../utils/helpers.js';

export function renderPropertyCard(property) {
    const {
        id,
        type,
        location,
        street,
        price,
        landlord_name,
        verified,
        photos = [],
        views = 0,
    } = property;

    const imageUrl = photos.length > 0 ? photos[0] : null;

    return `
        <a href="/app.html?property=${id}" class="property-card" data-id="${id}">
            <div class="property-card-img">
                ${imageUrl
                    ? `<img src="${imageUrl}" alt="${type} in ${location}" loading="lazy" />`
                    : `<div class="no-img">🏠</div>`
                }
                ${verified ? '<span class="badge-verified">✅ Verified</span>' : ''}
                <span class="badge-views"><i class="fas fa-eye"></i> ${views}</span>
            </div>
            <div class="property-card-body">
                <h3>${type}</h3>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${location} ${street ? `· ${street}` : ''}</p>
                ${price ? `<p class="price">${formatCurrency(price)}</p>` : ''}
                <div class="property-card-footer">
                    <span class="landlord"><i class="fas fa-user"></i> ${landlord_name}</span>
                    <span class="contact-lock"><i class="fas fa-lock"></i> ₦200</span>
                </div>
            </div>
        </a>
    `;
}