const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path with Railway volume support
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'menu.db')
    : path.join(__dirname, 'menu.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize database with multilingual support
function initializeDatabase() {
    console.log('Initializing multilingual menu database...');
    console.log(`Database location: ${dbPath}`);
    
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
        
        // Create menu_items table with multilingual support
        db.run(`CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title_en TEXT NOT NULL,
            title_ar TEXT,
            title_ku TEXT,
            description_en TEXT,
            description_ar TEXT,
            description_ku TEXT,
            price DECIMAL(10,2),
            image_url TEXT,
            category_id INTEGER,
            available INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )`);

        // Check if database already has data
        db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
            if (err) {
                console.error('Error checking categories:', err);
                return;
            }

            // Only insert sample data if database is empty
            if (row.count === 0) {
                console.log('Database is empty, adding sample data...');
                insertSampleData();
            } else {
                console.log(`Database already has ${row.count} categories. Skipping sample data insertion.`);
            }
        });
    });
}

function insertSampleData() {
    // Insert default categories with multilingual names and icons
    const categories = [
        ['Beverages', 'المشروبات', 'خواردنەوە', 'fas fa-coffee'],
        ['Food', 'الطعام', 'خواردن', 'fas fa-hamburger'],
        ['Desserts', 'الحلويات', 'شیرینی', 'fas fa-ice-cream'],
        ['Breakfast', 'الفطور', 'تايشتى بەیانی', 'fas fa-bread-slice'],
        ['Lunch', 'الغداء', 'نانی نیوەڕۆ', 'fas fa-bowl-food'],
        ['Dinner', 'العشاء', 'نانی ئێوارە', 'fas fa-utensils']
    ];

    const insertCategory = db.prepare(`INSERT INTO categories (name_en, name_ar, name_ku, icon) VALUES (?, ?, ?, ?)`);
    categories.forEach(category => {
        insertCategory.run(category);
    });
    insertCategory.finalize();

    // Insert sample menu items with multilingual content (converted to IQD)
    const menuItems = [
        // Beverages (prices in IQD)
        ['Coffee', 'قهوة', 'قاوە', 'Fresh brewed coffee', 'قهوة مخمرة طازجة', 'قاوەی تازە', 4500, '/assets/images/coffee.jpg', 1, 1],
        ['Tea', 'شاي', 'چا', 'Traditional tea', 'شاي تقليدي', 'چای ڕەسەن', 3000, '/assets/images/tea.jpg', 1, 1],
        ['Orange Juice', 'عصير برتقال', 'شەربەتی پرتەقاڵ', 'Fresh orange juice', 'عصير برتقال طازج', 'شەربەتی پرتەقاڵی تازە', 5000, '/assets/images/orange-juice.jpg', 1, 1],
        ['Water', 'ماء', 'ئاو', 'Pure drinking water', 'مياه شرب نقية', 'ئاوی خواردنەوەی پاک', 2000, '/assets/images/water.jpg', 1, 1],

        // Food (prices in IQD)
        ['Grilled Chicken', 'دجاج مشوي', 'مریشکی بریان', 'Delicious grilled chicken', 'دجاج مشوي لذيذ', 'مریشکی بریانی خۆشتام', 15000, '/assets/images/chicken.jpg', 2, 1],
        ['Rice with Meat', 'رز باللحم', 'برنج لەگەڵ گۆشت', 'Traditional rice with meat', 'أرز تقليدي باللحم', 'برنجی ڕەسەن لەگەڵ گۆشت', 18000, '/assets/images/rice-meat.jpg', 2, 1],
        ['Salad', 'سلطة', 'زەڵاتە', 'Fresh vegetable salad', 'سلطة خضار طازجة', 'زەڵاتەی سەوزەی تازە', 8000, '/assets/images/salad.jpg', 2, 1],
        ['Sandwich', 'ساندويتش', 'ساندویش', 'Delicious sandwich', 'ساندويتش لذيذ', 'ساندویشی خۆشتام', 10000, '/assets/images/sandwich.jpg', 2, 1],

        // Desserts (prices in IQD)
        ['Baklava', 'بقلاوة', 'بەقڵەوە', 'Traditional Middle Eastern sweet', 'حلوى شرق أوسطية تقليدية', 'شیرینی ڕۆژهەڵاتی ناوەڕاستی ڕەسەن', 6000, '/assets/images/baklava.jpg', 3, 1],
        ['Ice Cream', 'آيس كريم', 'بەستەنی', 'Cold ice cream', 'آيس كريم بارد', 'بەستەنی سارد', 4000, '/assets/images/ice-cream.jpg', 3, 1],
        ['Cake', 'كعكة', 'کێک', 'Chocolate cake', 'كعكة شوكولاتة', 'کێکی شۆکلێت', 7000, '/assets/images/cake.jpg', 3, 1],

        // Breakfast (prices in IQD)
        ['Eggs', 'بيض', 'هێلکە', 'Scrambled eggs', 'بيض مخفوق', 'هێلکەی تێکەڵکراو', 5000, '/assets/images/eggs.jpg', 4, 1],
        ['Bread', 'خبز', 'نان', 'Fresh bread', 'خبز طازج', 'نانی تازە', 2500, '/assets/images/bread.jpg', 4, 1],
        ['Cheese', 'جبن', 'پەنیر', 'Fresh cheese', 'جبن طازج', 'پەنیری تازە', 4500, '/assets/images/cheese.jpg', 4, 1],

        // Lunch (prices in IQD)
        ['Kebab', 'كباب', 'کەباب', 'Grilled kebab', 'كباب مشوي', 'کەبابی بریان', 22000, '/assets/images/kebab.jpg', 5, 1],
        ['Pizza', 'بيتزا', 'پیتزا', 'Italian pizza', 'بيتزا إيطالية', 'پیتزای ئیتاڵی', 17000, '/assets/images/pizza.jpg', 5, 1],

        // Dinner (prices in IQD)
        ['Fish', 'سمك', 'ماسی', 'Grilled fish', 'سمك مشوي', 'ماسی بریان', 25000, '/assets/images/fish.jpg', 6, 1],
        ['Steak', 'ستيك', 'ستێک', 'Beef steak', 'ستيك لحم بقري', 'ستێکی گۆشتی گا', 30000, '/assets/images/steak.jpg', 6, 1]
    ];

    const insertMenuItem = db.prepare(`INSERT INTO menu_items 
        (title_en, title_ar, title_ku, description_en, description_ar, description_ku, price, image_url, category_id, available) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    menuItems.forEach(item => {
        insertMenuItem.run(item);
    });
    insertMenuItem.finalize();

    console.log(`Categories: English, Arabic (العربية), Kurdish (کوردی)`);
    console.log(`Sample menu items added: ${menuItems.length} items`);
    console.log('Sample data initialization completed!');
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
    }, 3000);
}

module.exports = { initializeDatabase, dbPath };