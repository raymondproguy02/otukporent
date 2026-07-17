// ===== HOME PAGE (Property Listings) =====
import { getProperties } from '../../utils/api.js';
import { renderPropertyCard } from '../../components/PropertyCard/PropertyCard.js';
import { LOCATIONS, PROPERTY_TYPES } from '../../utils/constants.js';
import { debounce } from '../../utils/helpers.js';

let currentFilters = {
    search: '',
    location: '',
    type: '',
    limit: 20,
    offset: 0,
};

let isLoading = false;
let hasMore = true;

export async function renderHome(container, params = {}) {
    // Build HTML
    container.innerHTML = `
        <div class="page-home">
            <!-- Search & Filters -->
            <section class="search-section">
                <div class="container">
                    <div class="search-bar">
                        <div class="search-input-group">
                            <i class="fas fa-search"></i>
                            <input
                                type="text"
                                id="homeSearchInput"
                                placeholder="Search by location or property type..."
                                value="${params.search || ''}"
                            />
                        </div>
                        <div class="search-filters">
                            <select id="homeLocationFilter">
                                <option value="">All Locations</option>
                                ${LOCATIONS.map(loc =>
                                    `<option value="${loc}" ${params.location === loc ? 'selected' : ''}>${loc}</option>`
                                ).join('')}
                            </select>
                            <select id="homeTypeFilter">
                                <option value="">All Types</option>
                                ${PROPERTY_TYPES.map(type =>
                                    `<option value="${type}" ${params.type === type ? 'selected' : ''}>${type}</option>`
                                ).join('')}
                            </select>
                            <button id="homeSearchBtn" class="btn btn-primary">
                                <i class="fas fa-search"></i> Search
                            </button>
                        </div>
                    </div>

                    <div class="filter-pills" id="filterPills">
                        <button class="pill active" data-type="all">All</button>
                        ${['Flat', 'Single Room', 'Shop/Store', 'Land'].map(type =>
                            `<button class="pill" data-type="${type}">${type}</button>`
                        ).join('')}
                    </div>
                </div>
            </section>

            <!-- Results -->
            <section class="results-section">
                <div class="container">
                    <div class="results-header flex items-center justify-between">
                        <h2 id="resultsCount">Loading...</h2>
                        <span class="results-view">Showing properties in Otukpo</span>
                    </div>
                    <div class="property-grid" id="propertyGrid">
                        ${Array(6).fill(0).map(() => `
                            <div class="property-card-skeleton">
                                <div class="skeleton" style="height:200px;border-radius:12px;"></div>
                                <div class="skeleton" style="height:20px;margin-top:12px;width:70%;"></div>
                                <div class="skeleton" style="height:16px;margin-top:8px;width:50%;"></div>
                                <div class="skeleton" style="height:16px;margin-top:8px;width:40%;"></div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="load-more-container" id="loadMoreContainer">
                        <button id="loadMoreBtn" class="btn btn-outline" style="display:none;">
                            Load More
                        </button>
                    </div>
                </div>
            </section>
        </div>
    `;

    // ===== SETUP =====
    const grid = document.getElementById('propertyGrid');
    const resultsCount = document.getElementById('resultsCount');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    // ===== LOAD PROPERTIES =====
    async function loadProperties(reset = true) {
        if (isLoading) return;
        if (reset) {
            currentFilters.offset = 0;
            hasMore = true;
            grid.innerHTML = Array(6).fill(0).map(() => `
                <div class="property-card-skeleton">
                    <div class="skeleton" style="height:200px;border-radius:12px;"></div>
                    <div class="skeleton" style="height:20px;margin-top:12px;width:70%;"></div>
                    <div class="skeleton" style="height:16px;margin-top:8px;width:50%;"></div>
                </div>
            `).join('');
            loadMoreBtn.style.display = 'none';
        }

        isLoading = true;

        try {
            const filters = { ...currentFilters };
            if (filters.search) filters.location = filters.search;
            delete filters.search;

            const response = await getProperties(filters);

            if (!response.success) {
                throw new Error(response.error || 'Failed to load properties');
            }

            const properties = response.data || [];
            const total = response.pagination?.total || 0;

            if (reset) {
                grid.innerHTML = properties.length === 0
                    ? `<div class="empty-state">
                        <i class="fas fa-home" style="font-size:3rem;color:var(--color-text-muted);"></i>
                        <h3>No properties found</h3>
                        <p>Try adjusting your search or be the first to <a href="#" onclick="navigate('post')">post a property</a>.</p>
                    </div>`
                    : properties.map(renderPropertyCard).join('');

                resultsCount.textContent = `Showing ${properties.length} of ${total} properties`;
            } else {
                // Append more
                grid.innerHTML += properties.map(renderPropertyCard).join('');
                resultsCount.textContent = `Showing ${grid.children.length} of ${total} properties`;
            }

            // Check if more to load
            const loaded = reset ? properties.length : grid.children.length;
            hasMore = loaded < total;
            loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';

        } catch (error) {
            console.error('Error loading properties:', error);
            if (reset) {
                grid.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle" style="font-size:2rem;color:var(--color-danger);"></i>
                        <h3>Failed to load properties</h3>
                        <p>${error.message || 'Please try again.'}</p>
                        <button onclick="location.reload()" class="btn btn-primary">Retry</button>
                    </div>
                `;
            }
        } finally {
            isLoading = false;
        }
    }

    // ===== EVENT LISTENERS =====
    // Search input (debounced)
    const searchInput = document.getElementById('homeSearchInput');
    searchInput.addEventListener('input', debounce(() => {
        currentFilters.search = searchInput.value.trim();
        loadProperties(true);
    }, 400));

    // Location filter
    document.getElementById('homeLocationFilter').addEventListener('change', (e) => {
        currentFilters.location = e.target.value;
        loadProperties(true);
    });

    // Type filter
    document.getElementById('homeTypeFilter').addEventListener('change', (e) => {
        currentFilters.type = e.target.value;
        loadProperties(true);
    });

    // Search button
    document.getElementById('homeSearchBtn').addEventListener('click', () => {
        currentFilters.search = searchInput.value.trim();
        loadProperties(true);
    });

    // Filter pills
    document.querySelectorAll('#filterPills .pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#filterPills .pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const type = pill.dataset.type;
            currentFilters.type = type === 'all' ? '' : type;
            document.getElementById('homeTypeFilter').value = currentFilters.type;
            loadProperties(true);
        });
    });

    // Load more
    loadMoreBtn.addEventListener('click', () => {
        currentFilters.offset += currentFilters.limit;
        loadProperties(false);
    });

    // ===== LOAD INITIAL =====
    // Set initial filters from params
    if (params.search) {
        currentFilters.search = params.search;
        searchInput.value = params.search;
    }
    if (params.location) {
        currentFilters.location = params.location;
        document.getElementById('homeLocationFilter').value = params.location;
    }
    if (params.type) {
        currentFilters.type = params.type;
        document.getElementById('homeTypeFilter').value = params.type;
        document.querySelectorAll('#filterPills .pill').forEach(p => {
            p.classList.toggle('active', p.dataset.type === params.type);
        });
    }

    await loadProperties(true);
}