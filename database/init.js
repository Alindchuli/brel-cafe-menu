const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'menu.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with multilingual support
function initializeDatabase() {
    console.log('Initializing multilingual menu database...');
    
    db.serialize(() => {
        // Create categories table with multilingual support
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name_en TEXT NOT NULL,
            name_ar TEXT,
            name_ku TEXT,
            icon TEXT DEFAULT 'fas fa-utensils',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Add icon column if it doesn't exist (for existing databases)
        db.run(`ALTER TABLE categories ADD COLUMN icon TEXT DEFAULT 'fas fa-utensils'`, (err) => {
            // Ignore error if column already exists
        });

        // Create menu_items table with multilingual support
        db.run(`CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title_en TEXT NOT NULL,
            title_ar TEXT,
            title_ku TEXT,
            description_en TEXT,
            description_ar TEXT,
            description_ku TEXT,
            price DECIMAL(10, 2),
            image_url TEXT,
            category_id INTEGER,
            available BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )`);

        // Insert default categories with multilingual names and icons
        const categories = [
            ['Beverages', 'المشروبات', 'خواردنەوە', 'fas fa-coffee'], // Drinks
            ['Food', 'الطعام', 'خواردن', 'fas fa-hamburger'], // Food
            ['Desserts', 'الحلويات', 'شیرینی', 'fas fa-ice-cream'], // Desserts
            ['Breakfast', 'الفطور', 'تايشتى بەیانی', 'fas fa-bread-slice'], // Breakfast
            ['Lunch', 'الغداء', 'نانی نیوەڕۆ', 'fas fa-bowl-food'], // Lunch
            ['Dinner', 'العشاء', 'نانی ئێوارە', 'fas fa-utensils'] // Dinner
        ];

        const insertCategory = db.prepare(`INSERT OR IGNORE INTO categories (name_en, name_ar, name_ku, icon) VALUES (?, ?, ?, ?)`);
        categories.forEach(category => {
            insertCategory.run(category);
        });
        insertCategory.finalize();

        // Insert sample menu items with multilingual content
        const menuItems = [
            // Beverages
            ['Coffee', 'قهوة', 'قاوە', 'Fresh brewed coffee', 'قهوة مخمرة طازجة', 'قاوەی تازە', 3.50, '/assets/images/coffee.jpg', 1, 1],
            ['Tea', 'شاي', 'چا', 'Traditional tea', 'شاي تقليدي', 'چای ڕەسەن', 2.50, '/assets/images/tea.jpg', 1, 1],
            ['Orange Juice', 'عصير برتقال', 'شەربەتی پرتەقاڵ', 'Fresh orange juice', 'عصير برتقال طازج', 'شەربەتی پرتەقاڵی تازە', 4.00, '/assets/images/orange-juice.jpg', 1, 1],
            ['Water', 'ماء', 'ئاو', 'Pure drinking water', 'مياه شرب نقية', 'ئاوی خواردنەوەی پاک', 1.50, '/assets/images/water.jpg', 1, 1],

            // Food
            ['Grilled Chicken', 'دجاج مشوي', 'مریشکی بریان', 'Delicious grilled chicken', 'دجاج مشوي لذيذ', 'مریشکی بریانی خۆشتام', 12.00, '/assets/images/chicken.jpg', 2, 1],
            ['Rice with Meat', 'رز باللحم', 'برنج لەگەڵ گۆشت', 'Traditional rice with meat', 'أرز تقليدي باللحم', 'برنجی ڕەسەن لەگەڵ گۆشت', 15.00, '/assets/images/rice-meat.jpg', 2, 1],
            ['Salad', 'سلطة', 'زەڵاتە', 'Fresh vegetable salad', 'سلطة خضار طازجة', 'زەڵاتەی سەوزەی تازە', 6.50, '/assets/images/salad.jpg', 2, 1],
            ['Sandwich', 'ساندويتش', 'ساندویش', 'Delicious sandwich', 'ساندويتش لذيذ', 'ساندویشی خۆشتام', 8.00, '/assets/images/sandwich.jpg', 2, 1],

            // Desserts
            ['Baklava', 'بقلاوة', 'بەقڵەوە', 'Traditional Middle Eastern sweet', 'حلوى شرق أوسطية تقليدية', 'شیرینی ڕۆژهەڵاتی ناوەڕاستی ڕەسەن', 4.50, '/assets/images/baklava.jpg', 3, 1],
            ['Ice Cream', 'آيس كريم', 'بەستەنی', 'Cold ice cream', 'آيس كريم بارد', 'بەستەنی سارد', 3.00, '/assets/images/ice-cream.jpg', 3, 1],
            ['Cake', 'كعكة', 'کێک', 'Chocolate cake', 'كعكة شوكولاتة', 'کێکی شۆکلێت', 5.00, '/assets/images/cake.jpg', 3, 1],

            // Breakfast
            ['Eggs', 'بيض', 'هێلکە', 'Scrambled eggs', 'بيض مخفوق', 'هێلکەی تێکەڵکراو', 4.00, '/assets/images/eggs.jpg', 4, 1],
            ['Bread', 'خبز', 'نان', 'Fresh bread', 'خبز طازج', 'نانی تازە', 2.00, '/assets/images/bread.jpg', 4, 1],
            ['Cheese', 'جبن', 'پەنیر', 'Fresh cheese', 'جبن طازج', 'پەنیری تازە', 3.50, '/assets/images/cheese.jpg', 4, 1],

            // Lunch
            ['Kebab', 'كباب', 'کەباب', 'Grilled kebab', 'كباب مشوي', 'کەبابی بریان', 18.00, '/assets/images/kebab.jpg', 5, 1],
            ['Pizza', 'بيتزا', 'پیتزا', 'Italian pizza', 'بيتزا إيطالية', 'پیتزای ئیتاڵی', 14.00, '/assets/images/pizza.jpg', 5, 1],

            // Dinner
            ['Fish', 'سمك', 'ماسی', 'Grilled fish', 'سمك مشوي', 'ماسی بریان', 20.00, '/assets/images/fish.jpg', 6, 1],
            ['Soup', 'حساء', 'شۆربا', 'Hot soup', 'حساء ساخن', 'شۆربای گەرم', 7.00, '/assets/images/soup.jpg', 6, 1]
        ];

        const insertItem = db.prepare(`INSERT OR IGNORE INTO menu_items 
            (title_en, title_ar, title_ku, description_en, description_ar, description_ku, price, image_url, category_id, available) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        menuItems.forEach(item => {
            insertItem.run(item);
        });
        insertItem.finalize();

        console.log('Multilingual database initialized successfully!');
        console.log('Categories: English, Arabic (العربية), Kurdish (کوردی)');
        console.log(`Sample menu items added: ${menuItems.length} items`);
    });
}

// Run initialization if called directly
if (require.main === module) {
    initializeDatabase();
    
    // Close database after a short delay to allow async operations to complete
    setTimeout(() => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed.');
            }
        });
    }, 2000);
}

module.exports = { initializeDatabase, dbPath };