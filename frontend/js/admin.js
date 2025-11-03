// Modern Admin Panel with Sidebar and CRUD Operations

class AdminPanel {
    constructor() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return; // Will redirect to login
        }
        
        this.menuItems = [];
        this.categories = [];
        this.currentSection = 'dashboard';
        this.deleteItemId = null;
        this.deleteCategoryId = null;
        this.editItemId = null;
        this.editCategoryId = null;
        
        this.init();
    }
    
    checkAuthentication() {
        // Ensure AdminAuth is available
        if (typeof AdminAuth === 'undefined') {
            window.location.href = 'login.html';
            return false;
        }
        
        if (!AdminAuth.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    }
    
    getAuthHeaders() {
        const token = AdminAuth.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
    
    async init() {
        this.bindEvents();
        await this.loadCategories();
        await this.loadDashboard();
        this.showSection('dashboard');
    }
    
    bindEvents() {
        // Sidebar navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileToggle = document.getElementById('mobileToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    AdminAuth.logout();
                }
            });
        }
        
        // Menu Item Modal Events
        this.bindMenuItemEvents();
        
        // Category Modal Events
        this.bindCategoryEvents();
        
        // Delete Modal Events
        this.bindDeleteEvents();
    }
    
    bindMenuItemEvents() {
        const addBtn = document.getElementById('addMenuItemBtn');
        const modal = document.getElementById('menuItemModal');
        const closeBtn = document.getElementById('closeMenuItemModal');
        const cancelBtn = document.getElementById('cancelMenuItemBtn');
        const form = document.getElementById('menuItemForm');
        const imageInput = document.getElementById('image');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openMenuItemModal();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeMenuItemModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeMenuItemModal();
            });
        }
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveMenuItem();
            });
        }
        
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.previewImage(e.target);
            });
        }
        
        // Search and filters
        const searchInput = document.getElementById('menuItemSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterMenuItems();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterMenuItems();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterMenuItems();
            });
        }
    }
    
    bindCategoryEvents() {
        const addBtn = document.getElementById('addCategoryBtn');
        const modal = document.getElementById('categoryModal');
        const closeBtn = document.getElementById('closeCategoryModal');
        const cancelBtn = document.getElementById('cancelCategoryBtn');
        const form = document.getElementById('categoryForm');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openCategoryModal();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeCategoryModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeCategoryModal();
            });
        }
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCategory();
            });
        }
    }
    
    bindDeleteEvents() {
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const cancelBtn = document.getElementById('cancelDeleteBtn');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeDeleteModal();
            });
        }
    }
    
    showSection(section) {
        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        const titles = {
            'dashboard': 'Dashboard',
            'menu-items': 'Menu Items',
            'categories': 'Categories',
            'settings': 'Settings'
        };
        if (pageTitle) {
            pageTitle.textContent = titles[section] || 'Admin Panel';
        }
        
        // Show/hide sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        this.currentSection = section;
        
        // Load section data
        this.loadSectionData(section);
    }
    
    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'menu-items':
                await this.loadMenuItems();
                break;
            case 'categories':
                await this.loadCategories();
                this.renderCategories();
                break;
        }
    }
    
    async loadDashboard() {
        try {
            // Load stats
            const statsResponse = await fetch('/api/admin/stats', {
                headers: this.getAuthHeaders()
            });
            
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                this.renderStats(stats);
            }
            
            // Load recent items
            const recentResponse = await fetch('/api/admin/recent', {
                headers: this.getAuthHeaders()
            });
            
            if (recentResponse.ok) {
                const recentItems = await recentResponse.json();
                this.renderRecentItems(recentItems);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showToast('Error loading dashboard data', 'error');
        }
    }
    
    renderStats(stats) {
        const elements = {
            totalItems: document.getElementById('totalItems'),
            totalCategories: document.getElementById('totalCategories'),
            availableItems: document.getElementById('availableItems'),
            unavailableItems: document.getElementById('unavailableItems')
        };
        
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = stats[key] || 0;
            }
        });
    }
    
    renderRecentItems(items) {
        const container = document.getElementById('recentItemsList');
        if (!container) return;
        
        if (items.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No items yet</p>';
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="recent-item">
                <div class="recent-item-image">
                    <img src="${item.image ? `/assets/images/${item.image}` : '/assets/images/placeholder.jpg'}" alt="${item.title_en}">
                </div>
                <div class="recent-item-info">
                    <div class="recent-item-title">${this.escapeHtml(item.title_en)}</div>
                    <div class="recent-item-meta">
                        ${item.category_name || 'No category'} • 
                        ${item.available ? 'Available' : 'Unavailable'}
                        ${item.price ? ` • ${Math.round(parseFloat(item.price))} IQD` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/admin/categories', {
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                this.categories = await response.json();
                this.populateCategorySelects();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showToast('Error loading categories', 'error');
        }
    }
    
    renderCategories() {
        const container = document.getElementById('categoriesGrid');
        if (!container) return;
        
        if (this.categories.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">No categories yet. Add one to get started!</p>';
            return;
        }
        
        container.innerHTML = this.categories.map(category => `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-icon">
                        <i class="${category.icon || 'fas fa-utensils'}"></i>
                    </div>
                    <div class="category-actions">
                        <button class="btn btn-sm btn-secondary" onclick="adminPanel.editCategory(${category.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteCategory(${category.id}, '${this.escapeHtml(category.name_en)}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="category-title">${this.escapeHtml(category.name_en)}</div>
                <div class="category-translations">
                    ${category.name_ar ? `<div class="category-translation arabic">${this.escapeHtml(category.name_ar)}</div>` : ''}
                    ${category.name_ku ? `<div class="category-translation kurdish">${this.escapeHtml(category.name_ku)}</div>` : ''}
                </div>
                <div class="category-stats">
                    ${category.item_count} items (${category.available_count} available)
                </div>
            </div>
        `).join('');
    }
    
    populateCategorySelects() {
        const selects = ['category_id', 'categoryFilter'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Keep existing options for filters
                const isFilter = selectId === 'categoryFilter';
                if (!isFilter) {
                    select.innerHTML = '<option value="">Select Category</option>';
                } else {
                    const currentValue = select.value;
                    select.innerHTML = '<option value="">All Categories</option>';
                    if (currentValue) select.value = currentValue;
                }
                
                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name_en;
                    select.appendChild(option);
                });
            }
        });
    }
    
    async loadMenuItems() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/admin/menu', {
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                this.menuItems = await response.json();
                this.renderMenuItems();
            }
        } catch (error) {
            console.error('Error loading menu items:', error);
            this.showToast('Error loading menu items', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderMenuItems(filteredItems = null) {
        const tbody = document.getElementById('menuItemsTableBody');
        if (!tbody) return;
        
        const items = filteredItems || this.menuItems;
        
        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-secondary);">
                        ${filteredItems ? 'No items match your search criteria' : 'No menu items yet. Add one to get started!'}
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = items.map(item => {
            const category = this.categories.find(c => c.id === item.category_id);
            return `
                <tr>
                    <td>
                        <div class="table-image">
                            <img src="${item.image ? `/assets/images/${item.image}` : '/assets/images/placeholder.jpg'}" alt="${item.title_en}">
                        </div>
                    </td>
                    <td>
                        <strong>${this.escapeHtml(item.title_en)}</strong>
                        ${item.title_ar ? `<br><small class="arabic-text">${this.escapeHtml(item.title_ar)}</small>` : ''}
                        ${item.title_ku ? `<br><small class="kurdish-text">${this.escapeHtml(item.title_ku)}</small>` : ''}
                    </td>
                    <td>${category ? this.escapeHtml(category.name_en) : 'No category'}</td>
                    <td>${item.price ? `${Math.round(parseFloat(item.price))} IQD` : 'N/A'}</td>
                    <td>
                        <span class="status-badge ${item.available ? 'available' : 'unavailable'}">
                            ${item.available ? 'Available' : 'Unavailable'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-secondary" onclick="adminPanel.editMenuItem(${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteMenuItem(${item.id}, '${this.escapeHtml(item.title_en)}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    filterMenuItems() {
        const searchTerm = document.getElementById('menuItemSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        let filteredItems = this.menuItems;
        
        // Apply search filter
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.title_en.toLowerCase().includes(searchTerm) ||
                (item.title_ar && item.title_ar.includes(searchTerm)) ||
                (item.title_ku && item.title_ku.includes(searchTerm)) ||
                (item.description_en && item.description_en.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply category filter
        if (categoryFilter) {
            filteredItems = filteredItems.filter(item => 
                item.category_id == categoryFilter
            );
        }
        
        // Apply status filter
        if (statusFilter !== '') {
            filteredItems = filteredItems.filter(item => 
                item.available == statusFilter
            );
        }
        
        this.renderMenuItems(filteredItems);
    }
    
    // Menu Item CRUD Operations
    openMenuItemModal(itemId = null) {
        const modal = document.getElementById('menuItemModal');
        const title = document.getElementById('menuItemModalTitle');
        const form = document.getElementById('menuItemForm');
        
        if (itemId) {
            // Edit mode
            const item = this.menuItems.find(i => i.id === itemId);
            if (item) {
                title.textContent = 'Edit Menu Item';
                this.populateMenuItemForm(item);
                this.editItemId = itemId;
            }
        } else {
            // Add mode
            title.textContent = 'Add Menu Item';
            form.reset();
            this.clearImagePreview();
            this.editItemId = null;
        }
        
        modal.classList.add('show');
    }
    
    closeMenuItemModal() {
        const modal = document.getElementById('menuItemModal');
        modal.classList.remove('show');
        this.editItemId = null;
    }
    
    populateMenuItemForm(item) {
        const fields = ['title_en', 'title_ar', 'title_ku', 'description_en', 'description_ar', 'description_ku', 'price', 'category_id'];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && item[field] !== undefined) {
                element.value = item[field] || '';
            }
        });
        
        const availableCheckbox = document.getElementById('available');
        if (availableCheckbox) {
            availableCheckbox.checked = item.available;
        }
        
        // Show current image
        if (item.image) {
            this.showImagePreview(`/assets/images/${item.image}`);
        } else {
            this.clearImagePreview();
        }
    }
    
    async saveMenuItem() {
        const form = document.getElementById('menuItemForm');
        const formData = new FormData(form);
        
        // Set available checkbox value
        formData.set('available', formData.has('available') ? '1' : '0');
        
        try {
            const url = this.editItemId ? `/api/admin/menu/${this.editItemId}` : '/api/admin/menu';
            const method = this.editItemId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${AdminAuth.getToken()}`
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showToast(result.message || 'Menu item saved successfully!', 'success');
                this.closeMenuItemModal();
                await this.loadMenuItems();
                await this.loadCategories(); // Refresh category stats
            } else {
                this.showToast(result.message || 'Error saving menu item', 'error');
            }
        } catch (error) {
            console.error('Error saving menu item:', error);
            this.showToast('Error saving menu item', 'error');
        }
    }
    
    editMenuItem(itemId) {
        this.openMenuItemModal(itemId);
    }
    
    deleteMenuItem(itemId, itemName) {
        this.deleteItemId = itemId;
        this.openDeleteModal('menu item', itemName);
    }
    
    // Category CRUD Operations
    openCategoryModal(categoryId = null) {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');
        
        if (categoryId) {
            // Edit mode
            const category = this.categories.find(c => c.id === categoryId);
            if (category) {
                title.textContent = 'Edit Category';
                this.populateCategoryForm(category);
                this.editCategoryId = categoryId;
            }
        } else {
            // Add mode
            title.textContent = 'Add Category';
            form.reset();
            this.editCategoryId = null;
        }
        
        modal.classList.add('show');
    }
    
    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.remove('show');
        this.editCategoryId = null;
    }
    
    populateCategoryForm(category) {
        const fields = ['cat_name_en', 'cat_name_ar', 'cat_name_ku', 'cat_icon'];
        const mapping = {
            'cat_name_en': 'name_en',
            'cat_name_ar': 'name_ar',
            'cat_name_ku': 'name_ku',
            'cat_icon': 'icon'
        };
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            const dataField = mapping[field];
            if (element && category[dataField] !== undefined) {
                element.value = category[dataField] || '';
            }
        });
    }
    
    async saveCategory() {
        const form = document.getElementById('categoryForm');
        const formData = new FormData(form);
        
        const data = {
            name_en: formData.get('name_en'),
            name_ar: formData.get('name_ar'),
            name_ku: formData.get('name_ku'),
            icon: formData.get('icon')
        };
        
        try {
            const url = this.editCategoryId ? `/api/admin/categories/${this.editCategoryId}` : '/api/admin/categories';
            const method = this.editCategoryId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showToast(result.message || 'Category saved successfully!', 'success');
                this.closeCategoryModal();
                await this.loadCategories();
                this.renderCategories();
            } else {
                this.showToast(result.message || 'Error saving category', 'error');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            this.showToast('Error saving category', 'error');
        }
    }
    
    editCategory(categoryId) {
        this.openCategoryModal(categoryId);
    }
    
    deleteCategory(categoryId, categoryName) {
        this.deleteCategoryId = categoryId;
        this.openDeleteModal('category', categoryName);
    }
    
    // Delete Operations
    openDeleteModal(type, name) {
        const modal = document.getElementById('deleteModal');
        const message = document.getElementById('deleteMessage');
        
        message.textContent = `Are you sure you want to delete this ${type}: "${name}"?`;
        modal.classList.add('show');
    }
    
    closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.classList.remove('show');
        this.deleteItemId = null;
        this.deleteCategoryId = null;
    }
    
    async confirmDelete() {
        try {
            let url, type;
            
            if (this.deleteItemId) {
                url = `/api/admin/menu/${this.deleteItemId}`;
                type = 'menu item';
            } else if (this.deleteCategoryId) {
                url = `/api/admin/categories/${this.deleteCategoryId}`;
                type = 'category';
            } else {
                return;
            }
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showToast(result.message || `${type} deleted successfully!`, 'success');
                this.closeDeleteModal();
                
                if (this.deleteItemId) {
                    await this.loadMenuItems();
                } else if (this.deleteCategoryId) {
                    await this.loadCategories();
                    this.renderCategories();
                }
            } else {
                this.showToast(result.message || `Error deleting ${type}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            this.showToast('Error deleting item', 'error');
        }
    }
    
    // Utility Functions
    previewImage(input) {
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
        } else {
            this.clearImagePreview();
        }
    }
    
    showImagePreview(src) {
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');
        
        if (preview && img) {
            img.src = src;
            preview.style.display = 'block';
        }
    }
    
    clearImagePreview() {
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.style.display = 'none';
        }
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, (m) => map[m]) : '';
    }
}

// Initialize admin panel when DOM is loaded
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});