// ===== IMAGE GALLERY COMPONENT =====
export function renderImageGallery(photos = [], alt = 'Property') {
    if (!photos || photos.length === 0) {
        return `
            <div class="image-gallery">
                <div class="gallery-main no-image">
                    <span class="no-img-icon">🏠</span>
                    <span class="no-img-text">No photos available</span>
                </div>
            </div>
        `;
    }

    const mainImage = photos[0];
    const thumbnails = photos.slice(1);

    return `
        <div class="image-gallery" data-gallery>
            <div class="gallery-main" data-main>
                <img src="${mainImage}" alt="${alt}" loading="lazy" />
                ${photos.length > 1 ? `
                    <button class="gallery-nav gallery-prev" data-prev aria-label="Previous image">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="gallery-nav gallery-next" data-next aria-label="Next image">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <span class="gallery-counter" data-counter>1 / ${photos.length}</span>
                ` : ''}
            </div>
            ${photos.length > 1 ? `
                <div class="gallery-thumbnails" data-thumbnails>
                    ${photos.map((src, idx) => `
                        <button class="thumbnail-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}" data-thumbnail>
                            <img src="${src}" alt="${alt} ${idx + 1}" loading="lazy" />
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// ===== GALLERY CONTROLLER =====
export function initGallery(container) {
    const gallery = container?.querySelector('[data-gallery]') || document.querySelector('[data-gallery]');
    if (!gallery) return;

    const mainImg = gallery.querySelector('[data-main] img');
    const thumbnails = gallery.querySelectorAll('[data-thumbnail]');
    const counter = gallery.querySelector('[data-counter]');
    const prevBtn = gallery.querySelector('[data-prev]');
    const nextBtn = gallery.querySelector('[data-next]');

    if (!mainImg || thumbnails.length === 0) return;

    let currentIndex = 0;
    const total = thumbnails.length;

    function setImage(index) {
        currentIndex = (index + total) % total;
        const src = thumbnails[currentIndex].querySelector('img')?.src;
        if (src) {
            mainImg.src = src;
            mainImg.alt = `Property image ${currentIndex + 1}`;
        }
        thumbnails.forEach((btn, i) => {
            btn.classList.toggle('active', i === currentIndex);
        });
        if (counter) {
            counter.textContent = `${currentIndex + 1} / ${total}`;
        }
    }

    // Thumbnail clicks
    thumbnails.forEach((btn) => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            setImage(index);
        });
    });

    // Prev/Next
    prevBtn?.addEventListener('click', () => setImage(currentIndex - 1));
    nextBtn?.addEventListener('click', () => setImage(currentIndex + 1));

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!gallery.closest('.page-detail')) return;
        if (e.key === 'ArrowLeft') setImage(currentIndex - 1);
        if (e.key === 'ArrowRight') setImage(currentIndex + 1);
    });

    // Touch swipe
    let touchStartX = 0;
    let touchEndX = 0;

    const mainContainer = gallery.querySelector('[data-main]');
    if (mainContainer) {
        mainContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        mainContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    setImage(currentIndex + 1);
                } else {
                    setImage(currentIndex - 1);
                }
            }
        }, { passive: true });
    }
}