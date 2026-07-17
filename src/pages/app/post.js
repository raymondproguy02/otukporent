// ===== POST PROPERTY PAGE =====
import { createProperty } from '../../utils/api.js';
import { LOCATIONS, PROPERTY_TYPES, MAX_PHOTOS } from '../../utils/constants.js';
import { isValidPhone } from '../../utils/helpers.js';

let uploadedPhotos = [];
let landlordProfile = null;

export async function renderPost(container) {
    // Load saved landlord profile
    try {
        const saved = localStorage.getItem('otukpo_landlord_profile');
        if (saved) {
            landlordProfile = JSON.parse(saved);
        }
    } catch (e) {
        landlordProfile = null;
    }

    container.innerHTML = `
        <div class="page-post">
            <div class="container">
                <h1 class="page-title"><i class="fas fa-plus-circle"></i> Post Your Property</h1>
                <p class="page-subtitle">Fill in the details below. Your listing will be reviewed by admin before going live.</p>

                ${landlordProfile ? `
                    <div class="profile-notice">
                        <i class="fas fa-check-circle"></i> Welcome back, ${landlordProfile.name}! Your details have been auto-filled.
                    </div>
                ` : ''}

                <form class="post-form" id="postForm">
                    <!-- Property Type -->
                    <div class="form-group">
                        <label>Property Type *</label>
                        <div class="checkbox-grid" id="typeCheckboxes">
                            ${PROPERTY_TYPES.map(type => `
                                <label>
                                    <input type="checkbox" value="${type}" />
                                    ${type}
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Location -->
                    <div class="form-group">
                        <label for="postLocation">Location *</label>
                        <select id="postLocation" required>
                            <option value="">Select location</option>
                            ${LOCATIONS.map(loc =>
                                `<option value="${loc}">${loc}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <!-- Street -->
                    <div class="form-group">
                        <label for="postStreet">Street / Area</label>
                        <input type="text" id="postStreet" placeholder="e.g. Behind market, Near GRA junction" />
                    </div>

                    <!-- Price -->
                    <div class="form-group">
                        <label for="postPrice">Rent Price (Optional)</label>
                        <input type="text" id="postPrice" placeholder="e.g. ₦250,000/year" />
                    </div>

                    <!-- Description -->
                    <div class="form-group">
                        <label for="postDesc">Description</label>
                        <textarea id="postDesc" rows="4" placeholder="Describe your property..."></textarea>
                    </div>

                    <!-- Photos -->
                    <div class="form-group">
                        <label>Photos * (Max ${MAX_PHOTOS})</label>
                        <div class="photo-upload-zone" onclick="document.getElementById('photoInput').click()">
                            <i class="fas fa-camera"></i>
                            <span>Tap to upload photos</span>
                            <span class="photo-hint">Tap multiple times to select up to ${MAX_PHOTOS} photos</span>
                            <input type="file" id="photoInput" accept="image/*" multiple onchange="handlePhotos(event)" />
                        </div>
                        <div class="photo-preview" id="photoPreview"></div>
                        <span class="photo-count" id="photoCount">0 photos selected</span>
                    </div>

                    <!-- Landlord Details -->
                    <div class="form-group">
                        <label for="postName">Your Full Name *</label>
                        <input type="text" id="postName" placeholder="e.g. Mr. Emmanuel Oche"
                               value="${landlordProfile?.name || ''}" required />
                    </div>

                    <div class="form-group">
                        <label for="postPhone">Your Phone Number *</label>
                        <input type="tel" id="postPhone" placeholder="e.g. 080XXXXXXX"
                               value="${landlordProfile?.phone || ''}" required />
                    </div>

                    <!-- Submit -->
                    <button type="submit" class="btn btn-primary btn-lg btn-block" id="submitBtn">
                        <i class="fas fa-check-circle"></i> Submit for Review
                    </button>

                    <p class="form-footnote">
                        ⚡ Your listing will be reviewed by admin before going live.
                        ${landlordProfile ? 'Your contact details are saved for future posts.' : ''}
                    </p>
                </form>
            </div>
        </div>
    `;

    // ===== PHOTO HANDLING =====
    window.handlePhotos = function(event) {
        const files = event.target.files;
        const preview = document.getElementById('photoPreview');
        const count = document.getElementById('photoCount');

        const fileArray = Array.from(files);

        // Check limit
        if (uploadedPhotos.length + fileArray.length > MAX_PHOTOS) {
            window.showToast(`Maximum ${MAX_PHOTOS} photos allowed`, 'error');
            return;
        }

        fileArray.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedPhotos.push(e.target.result);
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Property photo';
                preview.appendChild(img);
                count.textContent = `${uploadedPhotos.length} / ${MAX_PHOTOS} photos selected`;
            };
            reader.readAsDataURL(file);
        });

        // Reset input so same file can be selected again
        event.target.value = '';
    };

    // ===== FORM SUBMISSION =====
    document.getElementById('postForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            // Get selected types
            const checkedTypes = document.querySelectorAll('#typeCheckboxes input:checked');
            if (checkedTypes.length === 0) {
                window.showToast('Please select at least one property type', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Submit for Review';
                return;
            }
            const type = checkedTypes[0].value;

            const location = document.getElementById('postLocation').value;
            if (!location) {
                window.showToast('Please select a location', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Submit for Review';
                return;
            }

            const name = document.getElementById('postName').value.trim();
            const phone = document.getElementById('postPhone').value.trim();

            if (!name || !phone) {
                window.showToast('Please enter your name and phone number', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Submit for Review';
                return;
            }

            if (!isValidPhone(phone)) {
                window.showToast('Please enter a valid Nigerian phone number', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Submit for Review';
                return;
            }

            if (uploadedPhotos.length === 0) {
                window.showToast('Please upload at least one photo', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Submit for Review';
                return;
            }

            // Save landlord profile for future
            localStorage.setItem('otukpo_landlord_profile', JSON.stringify({ name, phone }));

            // Build property data
            const propertyData = {
                type,
                location,
                street: document.getElementById('postStreet').value.trim(),
                price: document.getElementById('postPrice').value.trim(),
                description: document.getElementById('postDesc').value.trim(),
                landlord_name: name,
                landlord_phone: phone,
                photos: uploadedPhotos.slice(0, MAX_PHOTOS),
            };

            const response = await createProperty(propertyData);

            if (response.success) {
                window.showToast('✅ Property submitted for review!', 'success');
                // Reset form
                document.getElementById('postForm').reset();
                document.getElementById('photoPreview').innerHTML = '';
                uploadedPhotos = [];
                document.getElementById('photoCount').textContent = '0 photos selected';
                document.querySelectorAll('#typeCheckboxes input').forEach(c => c.checked = false);

                // Navigate home after delay
                setTimeout(() => {
                    window.navigate('home');
                }, 1500);
            } else {
                throw new Error(response.error || 'Failed to submit property');
            }
        } catch (error) {
            console.error('Error submitting property:', error);
            window.showToast(error.message || 'Something went wrong', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Submit for Review';
        }
    });
}