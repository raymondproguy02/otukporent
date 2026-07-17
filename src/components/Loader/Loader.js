// ===== LOADER COMPONENT =====
export function renderLoader(size = 'md') {
    const sizes = {
        sm: '24px',
        md: '40px',
        lg: '56px',
    };

    return `
        <div class="loader-container">
            <div class="loader loader-${size}" style="width:${sizes[size]};height:${sizes[size]};">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    `;
}

export function renderInlineLoader() {
    return `
        <span class="inline-loader">
            <i class="fas fa-spinner fa-spin"></i>
        </span>
    `;
}

export function renderSkeleton(type = 'card', count = 3) {
    if (type === 'card') {
        return Array(count).fill(0).map(() => `
            <div class="skeleton-card">
                <div class="skeleton" style="height:200px;border-radius:12px;"></div>
                <div class="skeleton" style="height:20px;margin-top:12px;width:70%;"></div>
                <div class="skeleton" style="height:16px;margin-top:8px;width:50%;"></div>
                <div class="skeleton" style="height:16px;margin-top:8px;width:40%;"></div>
            </div>
        `).join('');
    }

    if (type === 'detail') {
        return `
            <div class="skeleton-detail">
                <div class="skeleton" style="height:300px;border-radius:12px;"></div>
                <div class="skeleton" style="height:32px;margin-top:16px;width:60%;"></div>
                <div class="skeleton" style="height:20px;margin-top:8px;width:40%;"></div>
                <div class="skeleton" style="height:120px;margin-top:16px;"></div>
                <div class="skeleton" style="height:60px;margin-top:12px;"></div>
            </div>
        `;
    }

    return '';
}