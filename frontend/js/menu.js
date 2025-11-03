// Multilingual Menu System

class MenuApp {
    constructor() {
        this.menuItems = [];
        this.categories = [];
        this.filteredItems = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.currentLanguage = 'en';
        
        // Make this globally accessible for language manager
        window.menuApp = this;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.loadCategories();
        await this.loadMenuItems();
        this.renderCategoryFilters();
        this.renderMenuItems();
        
        // Update current language from language manager
        this.currentLanguage = languageManager.currentLanguage;
    }
    
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.performSearch();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
        
        // Category filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.handleCategoryFilter(e.target);
            }
        });
        
        // Menu item clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.menu-item')) {
                const itemId = e.target.closest('.menu-item').dataset.itemId;
                this.showItemDetail(itemId);
            }
        });
        
        // Modal close
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById('itemModal');
        
        if (closeModal && modal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            // ESC key to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                this.categories = await response.json();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    async loadMenuItems() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/menu');
            if (response.ok) {
                this.menuItems = await response.json();
                this.filteredItems = [...this.menuItems];
                this.renderMenuItems();
            }
        } catch (error) {
            console.error('Error loading menu items:', error);
        } finally {
            this.showLoading(false);
        }
    }
    
    async performSearch() {
        if (!this.searchTerm.trim()) {
            this.filteredItems = this.menuItems;
            this.renderMenuItems();
            return;
        }
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(this.searchTerm)}&lang=${languageManager.currentLanguage}`);
            if (response.ok) {
                this.filteredItems = await response.json();
                this.renderMenuItems();
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    }
    
    renderCategoryFilters() {
        const categoryFilter = document.getElementById('categoriesFilter');
        if (!categoryFilter) return;
        
        // Keep the "All" button
        const allButton = categoryFilter.querySelector('[data-category="all"]');
        
        // Remove existing category buttons (except "All")
        const existingBtns = categoryFilter.querySelectorAll('.category-btn:not([data-category="all"])');
        existingBtns.forEach(btn => btn.remove());
        
        // Add category buttons
        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.setAttribute('data-category', category.id);
            
            // Use appropriate language for category name
            let categoryName = category.name_en;
            if (languageManager.currentLanguage === 'ar' && category.name_ar) {
                categoryName = category.name_ar;
            } else if (languageManager.currentLanguage === 'ku' && category.name_ku) {
                categoryName = category.name_ku;
            }
            
            // Create icon and text elements
            const icon = document.createElement('i');
            icon.className = category.icon || 'fas fa-utensils';
            
            const text = document.createElement('span');
            text.textContent = categoryName;
            
            // Add icon and text to button
            button.appendChild(icon);
            button.appendChild(text);
            
            categoryFilter.appendChild(button);
        });
    }
    
    handleCategoryFilter(button) {
        // Remove active class from all buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Update current category
        this.currentCategory = button.getAttribute('data-category');
        
        // Filter items
        this.filterItemsByCategory();
    }
    
    async filterItemsByCategory() {
        if (this.currentCategory === 'all') {
            await this.loadMenuItems();
            return;
        }
        
        try {
            const response = await fetch(`/api/menu/category/${this.currentCategory}`);
            if (response.ok) {
                this.filteredItems = await response.json();
                this.renderMenuItems();
            }
        } catch (error) {
            console.error('Error filtering by category:', error);
        }
    }
    
    renderMenuItems() {
        const menuGrid = document.getElementById('menuGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!menuGrid) return;
        
        if (this.filteredItems.length === 0) {
            menuGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        menuGrid.style.display = 'grid';
        
        menuGrid.innerHTML = this.filteredItems.map(item => {
            const title = this.getItemText(item, 'title');
            const description = this.getItemText(item, 'description');
            const categoryName = this.getCategoryText(item);
            const priceDisplay = item.price ? `$${parseFloat(item.price).toFixed(2)}` : '';
            
            return `
                <div class="menu-item" data-item-id="${item.id}">
                    <div class="menu-item-image">
                        <img src="${item.image_url || '/assets/images/placeholder.jpg'}" 
                             alt="${this.escapeHtml(title)}" 
                             onerror="this.src='/assets/images/placeholder.jpg'">
                        ${item.price ? `<div class="price-badge">${priceDisplay}</div>` : ''}
                    </div>
                    <div class="menu-item-content">
                        <div class="menu-item-category">${categoryName}</div>
                        <h3 class="menu-item-title">${this.escapeHtml(title)}</h3>
                        <p class="menu-item-description">${this.escapeHtml(description)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getItemText(item, field) {
        const lang = languageManager.currentLanguage;
        
        switch (lang) {
            case 'ar':
                return item[`${field}_ar`] || item[`${field}_en`] || '';
            case 'ku':
                return item[`${field}_ku`] || item[`${field}_en`] || '';
            default:
                return item[`${field}_en`] || '';
        }
    }
    
    getCategoryText(item) {
        const lang = languageManager.currentLanguage;
        
        switch (lang) {
            case 'ar':
                return item.category_name_ar || item.category_name_en || 'غير محدد';
            case 'ku':
                return item.category_name_ku || item.category_name_en || 'نادیار';
            default:
                return item.category_name_en || 'Uncategorized';
        }
    }
    
    async showItemDetail(itemId) {
        try {
            // Find item in current list
            const item = this.filteredItems.find(i => i.id == itemId) || 
                        this.menuItems.find(i => i.id == itemId);
            
            if (!item) return;
            
            const modal = document.getElementById('itemModal');
            const modalBody = document.getElementById('modalBody');
            
            if (!modal || !modalBody) return;
            
            const title = this.getItemText(item, 'title');
            const description = this.getItemText(item, 'description');
            const categoryName = this.getCategoryText(item);
            const priceDisplay = item.price ? `$${parseFloat(item.price).toFixed(2)}` : '';
            
            modalBody.innerHTML = `
                <div class="item-detail">
                    <div class="item-detail-image">
                        <img src="${item.image_url || '/assets/images/placeholder.jpg'}" 
                             alt="${this.escapeHtml(title)}" 
                             onerror="this.src='/assets/images/placeholder.jpg'">
                    </div>
                    <div class="item-detail-content">
                        <div class="item-detail-category">${categoryName}</div>
                        <h2 class="item-detail-title">${this.escapeHtml(title)}</h2>
                        ${priceDisplay ? `<div class="item-detail-price">${priceDisplay}</div>` : ''}
                        <div class="item-detail-description">
                            <h4>${languageManager.getText('description')}</h4>
                            <p>${this.escapeHtml(description || languageManager.getText('empty-text'))}</p>
                        </div>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error loading item details:', error);
        }
    }
    
    updateLanguage() {
        // Update "All" button text
        const allText = document.getElementById('all-text');
        if (allText) {
            allText.textContent = languageManager.getText('all-btn');
        }
        
        // Re-render category filters with updated language
        this.renderCategoryFilters();
        
        // Re-render menu items with updated language
        this.renderMenuItems();
        
        // Update current language
        this.currentLanguage = languageManager.currentLanguage;
    }
    
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const menuGrid = document.getElementById('menuGrid');
        
        if (loadingState) {
            loadingState.style.display = show ? 'block' : 'none';
        }
        if (menuGrid) {
            menuGrid.style.display = show ? 'none' : 'grid';
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Back to Top Button Functionality
class BackToTopButton {
    constructor() {
        this.button = document.getElementById('backToTopBtn');
        this.scrollThreshold = 300; // Show button after scrolling 300px
        
        if (this.button) {
            this.bindEvents();
        }
    }
    
    bindEvents() {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            this.toggleVisibility();
        });
        
        // Scroll to top when button is clicked
        this.button.addEventListener('click', () => {
            this.scrollToTop();
        });
    }
    
    toggleVisibility() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > this.scrollThreshold) {
            this.button.classList.add('show');
        } else {
            this.button.classList.remove('show');
        }
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuApp = new MenuApp();
    window.backToTopButton = new BackToTopButton();
});