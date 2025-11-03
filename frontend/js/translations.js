// Translations for the multilingual menu system

const translations = {
    en: {
        'site-title': 'Brel Cafe',
        'site-subtitle': 'Delicious Coffee & Food',
        'page-title': 'Brel Cafe - Menu',
        'search-placeholder': 'Search menu...',
        'all-btn': 'All',
        'loading-text': 'Loading menu...',
        'empty-title': 'No items found',
        'empty-text': 'Try adjusting your search or filter',
        'footer-title': 'Brel Cafe',
        'footer-description': 'Serving delicious coffee & food with love',
        'footer-contact': 'Contact',
        'footer-address': 'Erbil, Kurdistan',
        'admin-panel-text': 'Admin Panel',
        'price-label': 'Price',
        'add-to-cart': 'Order Now',
        'category': 'Category',
        'description': 'Description'
    },
    ar: {
        'site-title': 'مقهى برێل',
        'site-subtitle': 'قهوة وطعام لذيذ',
        'page-title': 'مقهى برێل - القائمة',
        'search-placeholder': 'البحث في القائمة...',
        'all-btn': 'الكل',
        'loading-text': 'جاري تحميل القائمة...',
        'empty-title': 'لم يتم العثور على عناصر',
        'empty-text': 'حاول تعديل البحث أو المرشح',
        'footer-title': 'مقهى برێل',
        'footer-description': 'نقدم قهوة وطعام لذيذ بحب',
        'footer-contact': 'اتصل بنا',
        'footer-address': 'أربيل، كردستان',
        'admin-panel-text': 'لوحة الإدارة',
        'price-label': 'السعر',
        'add-to-cart': 'اطلب الآن',
        'category': 'الفئة',
        'description': 'الوصف'
    },
    ku: {
        'site-title': 'کافی برێل',
        'site-subtitle': 'قاوە و خواردنی خۆشتام',
        'page-title': 'کافی برێل - لیستە',
        'search-placeholder': 'گەڕان لە لیستەکە...',
        'all-btn': 'هەموو',
        'loading-text': 'لیستەکە دادەبەزێت...',
        'empty-title': 'هیچ شتێک نەدۆزرایەوە',
        'empty-text': 'هەوڵ بدە گەڕان یان فلتەرەکە بگۆڕیت',
        'footer-title': 'کافی برێل',
        'footer-description': 'قاوە و خواردنی خۆشتام بە خۆشەویستی پێشکەش دەکەین',
        'footer-contact': 'پەیوەندی',
        'footer-address': 'هەولێر، کوردستان',
        'admin-panel-text': 'پانێڵی بەڕێوەبەر',
        'price-label': 'نرخ',
        'add-to-cart': 'ئێستا داوای بکە',
        'category': 'جۆر',
        'description': 'وەسف'
    }
};

// Language management
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.rtlLanguages = ['ar', 'ku']; // Right-to-left languages
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('selectedLanguage', lang);
        
        // Update page direction
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', this.rtlLanguages.includes(lang) ? 'rtl' : 'ltr');
        
        // Update document title
        document.title = translations[lang]['page-title'];
        
        // Update all translatable elements
        this.updateTranslations();
        
        // Update language buttons
        this.updateLanguageButtons();
        
        // Update menu app if it exists
        if (window.menuApp && typeof window.menuApp.updateLanguage === 'function') {
            window.menuApp.updateLanguage();
        }
        
        // Update search placeholder
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.placeholder = translations[lang]['search-placeholder'];
        }
        
        // Trigger menu reload to show content in new language
        if (window.menuApp) {
            window.menuApp.loadMenuItems();
        }
    }
    
    updateTranslations() {
        const elements = document.querySelectorAll('[id]');
        elements.forEach(element => {
            const key = element.id;
            if (translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translations[this.currentLanguage][key];
                } else {
                    element.textContent = translations[this.currentLanguage][key];
                }
            }
        });
    }
    
    updateLanguageButtons() {
        // Update dropdown items
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === this.currentLanguage) {
                btn.classList.add('active');
            }
        });
        
        // Update current language display
        const currentLangDisplay = document.getElementById('current-language');
        if (currentLangDisplay) {
            const langMap = {
                'en': 'EN',
                'ar': 'ع',
                'ku': 'ک'
            };
            currentLangDisplay.textContent = langMap[this.currentLanguage] || 'EN';
        }
    }
    
    getText(key, lang = null) {
        const language = lang || this.currentLanguage;
        return translations[language] && translations[language][key] ? translations[language][key] : key;
    }
    
    isRTL() {
        return this.rtlLanguages.includes(this.currentLanguage);
    }
}

// Initialize language manager
const languageManager = new LanguageManager();

// Set up language switching
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with saved language
    languageManager.setLanguage(languageManager.currentLanguage);
    
    // Set up dropdown functionality
    const dropdownBtn = document.getElementById('language-dropdown-btn');
    const dropdownMenu = document.getElementById('language-dropdown-menu');
    
    if (dropdownBtn && dropdownMenu) {
        // Toggle dropdown
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownBtn.classList.toggle('active');
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownBtn.classList.remove('active');
            dropdownMenu.classList.remove('show');
        });
        
        // Add event listeners to dropdown items
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = item.getAttribute('data-lang');
                languageManager.setLanguage(lang);
                dropdownBtn.classList.remove('active');
                dropdownMenu.classList.remove('show');
            });
        });
    }
});