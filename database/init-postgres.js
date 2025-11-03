// PostgreSQL Database Initialization for Multilingual Menu System
const { Pool } = require('pg');

// Database connection - uses Railway's DATABASE_URL or fallback to SQLite
function createDatabaseConnection() {
    if (process.env.DATABASE_URL) {
        // PostgreSQL (Railway or other hosting)
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    } else {
        // Fallback to SQLite for local development
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'menu.db');
        return new sqlite3.Database(dbPath);
    }
}

async function initializePostgreSQL() {
    const isPostgres = !!process.env.DATABASE_URL;
    const db = createDatabaseConnection();
    
    console.log(`Initializing ${isPostgres ? 'PostgreSQL' : 'SQLite'} multilingual menu database...`);
    
    try {
        if (isPostgres) {
            // PostgreSQL schema
            await db.query(`
                CREATE TABLE IF NOT EXISTS categories (
                    id SERIAL PRIMARY KEY,
                    name_en VARCHAR(255) NOT NULL,
                    name_ar VARCHAR(255),
                    name_ku VARCHAR(255),
                    icon VARCHAR(100) DEFAULT 'fas fa-utensils',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            await db.query(`
                CREATE TABLE IF NOT EXISTS menu_items (
                    id SERIAL PRIMARY KEY,
                    title_en VARCHAR(255) NOT NULL,
                    title_ar VARCHAR(255),
                    title_ku VARCHAR(255),
                    description_en TEXT,
                    description_ar TEXT,
                    description_ku TEXT,
                    price DECIMAL(10,2),
                    image_url VARCHAR(500),
                    category_id INTEGER REFERENCES categories(id),
                    available BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Check if we have any data
            const categoryCount = await db.query('SELECT COUNT(*) as count FROM categories');
            const hasData = parseInt(categoryCount.rows[0].count) > 0;
            
            if (!hasData) {
                console.log('Adding sample data to PostgreSQL...');
                await addSampleData(db, true);
            } else {
                console.log('Database already has data, skipping sample data insertion.');
            }
            
        } else {
            // SQLite schema (local development)
            await new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS categories (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name_en TEXT NOT NULL,
                        name_ar TEXT,
                        name_ku TEXT,
                        icon TEXT DEFAULT 'fas fa-utensils',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`, (err) => {
                        if (err) reject(err);
                    });
                    
                    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title_en TEXT NOT NULL,
                        title_ar TEXT,
                        title_ku TEXT,
                        description_en TEXT,
                        description_ar TEXT,
                        description_ku TEXT,
                        price REAL,
                        image_url TEXT,
                        category_id INTEGER,
                        available BOOLEAN DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (category_id) REFERENCES categories (id)
                    )`, (err) => {
                        if (err) reject(err);
                    });
                    
                    // Check if we have data
                    db.get('SELECT COUNT(*) as count FROM categories', async (err, row) => {
                        if (err) reject(err);
                        
                        if (row.count === 0) {
                            console.log('Adding sample data to SQLite...');
                            await addSampleData(db, false);
                        } else {
                            console.log('Database already has data, skipping sample data insertion.');
                        }
                        resolve();
                    });
                });
            });
        }
        
        console.log(`${isPostgres ? 'PostgreSQL' : 'SQLite'} database initialized successfully!`);
        console.log('Categories: English, Arabic (العربية), Kurdish (کوردی)');
        
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    } finally {
        if (isPostgres) {
            await db.end();
        } else {
            db.close();
        }
    }
}

async function addSampleData(db, isPostgres) {
    // Sample categories
    const categories = [
        { name_en: 'Hot Drinks', name_ar: 'المشروبات الساخنة', name_ku: 'خواردنەوە گەرمەکان', icon: 'fas fa-mug-hot' },
        { name_en: 'Cold Drinks', name_ar: 'المشروبات الباردة', name_ku: 'خواردنەوە ساردەکان', icon: 'fas fa-glass-water' },
        { name_en: 'Breakfast', name_ar: 'الإفطار', name_ku: 'تایبەتمەندی بەیانی', icon: 'fas fa-bread-slice' },
        { name_en: 'Main Dishes', name_ar: 'الأطباق الرئيسية', name_ku: 'خواردنە سەرەکیەکان', icon: 'fas fa-utensils' },
        { name_en: 'Desserts', name_ar: 'الحلويات', name_ku: 'شیرینی', icon: 'fas fa-birthday-cake' },
        { name_en: 'Snacks', name_ar: 'الوجبات الخفيفة', name_ku: 'خواردنە سووکەکان', icon: 'fas fa-cookie-bite' }
    ];
    
    // Sample menu items
    const menuItems = [
        // Hot Drinks (category 1)
        { title_en: 'Turkish Coffee', title_ar: 'قهوة تركية', title_ku: 'قاوەی تورکی', description_en: 'Traditional Turkish coffee', description_ar: 'قهوة تركية تقليدية', description_ku: 'قاوەی تورکی تایبەت', price: 8000, category_id: 1 },
        { title_en: 'Tea', title_ar: 'شاي', title_ku: 'چا', description_en: 'Fresh brewed tea', description_ar: 'شاي مغلي طازج', description_ku: 'چای تازە کراو', price: 5000, category_id: 1 },
        { title_en: 'Cappuccino', title_ar: 'كابتشينو', title_ku: 'کاپووچینۆ', description_en: 'Espresso with steamed milk foam', description_ar: 'إسبريسو مع رغوة الحليب المبخر', description_ku: 'ئێسپرێسۆ لەگەڵ کەفی شیر', price: 12000, category_id: 1 },
        
        // Cold Drinks (category 2)
        { title_en: 'Fresh Orange Juice', title_ar: 'عصير برتقال طازج', title_ku: 'شەربەتی پرتەقاڵی تازە', description_en: 'Freshly squeezed orange juice', description_ar: 'عصير برتقال معصور طازج', description_ku: 'شەربەتی پرتەقاڵی تازە گوشراو', price: 10000, category_id: 2 },
        { title_en: 'Lemonade', title_ar: 'عصير ليمون', title_ku: 'شەربەتی لیمۆ', description_en: 'Fresh lemonade with mint', description_ar: 'عصير ليمون طازج بالنعناع', description_ku: 'شەربەتی لیمۆی تازە لەگەڵ پونک', price: 8000, category_id: 2 },
        { title_en: 'Iced Coffee', title_ar: 'قهوة مثلجة', title_ku: 'قاوەی سارد', description_en: 'Cold brew coffee with ice', description_ar: 'قهوة مخمرة باردة مع الثلج', description_ku: 'قاوەی سارد لەگەڵ بەستەڵەک', price: 9000, category_id: 2 },
        
        // Breakfast (category 3)
        { title_en: 'Kurdish Breakfast', title_ar: 'إفطار كردي', title_ku: 'تایبەتمەندی کوردی', description_en: 'Traditional Kurdish breakfast', description_ar: 'إفطار كردي تقليدي', description_ku: 'تایبەتمەندی کوردی تایبەت', price: 25000, category_id: 3 },
        { title_en: 'Scrambled Eggs', title_ar: 'بيض مخفوق', title_ku: 'هێلکە تێکەڵکراو', description_en: 'Fluffy scrambled eggs with toast', description_ar: 'بيض مخفوق مع الخبز المحمص', description_ku: 'هێلکە تێکەڵکراو لەگەڵ نان برژاو', price: 15000, category_id: 3 },
        { title_en: 'Cheese Omelet', title_ar: 'عجة الجبن', title_ku: 'ئۆملێتی پەنیر', description_en: 'Cheese omelet with herbs', description_ar: 'عجة جبن بالأعشاب', description_ku: 'ئۆملێتی پەنیر لەگەڵ گیا', price: 18000, category_id: 3 },
        
        // Main Dishes (category 4)
        { title_en: 'Grilled Chicken', title_ar: 'دجاج مشوي', title_ku: 'مریشکی برژاو', description_en: 'Grilled chicken breast with vegetables', description_ar: 'صدر دجاج مشوي مع الخضار', description_ku: 'سنگی مریشک لەگەڵ سەوزە', price: 30000, category_id: 4 },
        { title_en: 'Kebab Platter', title_ar: 'طبق كباب', title_ku: 'قاپی کەباب', description_en: 'Mixed kebab with rice and salad', description_ar: 'كباب مشكل مع الأرز والسلطة', description_ku: 'کەبابی تێکەڵ لەگەڵ برنج و زەڵاتە', price: 35000, category_id: 4 },
        { title_en: 'Fish and Chips', title_ar: 'سمك مع البطاطس', title_ku: 'ماسی و پەتاتە برژاو', description_en: 'Fried fish with crispy fries', description_ar: 'سمك مقلي مع بطاطس مقرمشة', description_ku: 'ماسی برژاو لەگەڵ پەتاتە ترش', price: 28000, category_id: 4 },
        
        // Desserts (category 5)
        { title_en: 'Baklava', title_ar: 'بقلاوة', title_ku: 'بەقلەوا', description_en: 'Traditional Middle Eastern pastry', description_ar: 'معجنات شرق أوسطية تقليدية', description_ku: 'خواردنی شیرینی ناوچەکەی ناوەڕاست', price: 12000, category_id: 5 },
        { title_en: 'Ice Cream', title_ar: 'آيس كريم', title_ku: 'ئایس کریم', description_en: 'Vanilla ice cream with toppings', description_ar: 'آيس كريم فانيليا مع الإضافات', description_ku: 'ئایس کریمی ڤانیلیا لەگەڵ زیادکراو', price: 8000, category_id: 5 },
        { title_en: 'Chocolate Cake', title_ar: 'كيك شوكولاتة', title_ku: 'کێکی شۆکۆلاتە', description_en: 'Rich chocolate cake slice', description_ar: 'قطعة كيك شوكولاتة غنية', description_ku: 'پارچە کێکی شۆکۆلاتە', price: 15000, category_id: 5 },
        
        // Snacks (category 6)
        { title_en: 'French Fries', title_ar: 'بطاطس محمرة', title_ku: 'پەتاتە برژاو', description_en: 'Crispy golden French fries', description_ar: 'بطاطس محمرة ذهبية مقرمشة', description_ku: 'پەتاتە برژاوی زێڕین', price: 10000, category_id: 6 },
        { title_en: 'Mixed Nuts', title_ar: 'مكسرات مشكلة', title_ku: 'گوێزە تێکەڵەکان', description_en: 'Roasted mixed nuts', description_ar: 'مكسرات مشكلة محمصة', description_ku: 'گوێزە تێکەڵی برژاو', price: 12000, category_id: 6 },
        { title_en: 'Sandwich', title_ar: 'ساندويش', title_ku: 'ساندویچ', description_en: 'Club sandwich with fries', description_ar: 'ساندويش نادي مع البطاطس', description_ku: 'ساندویچی کلوب لەگەڵ پەتاتە', price: 20000, category_id: 6 }
    ];
    
    if (isPostgres) {
        // Insert categories
        for (const category of categories) {
            await db.query(
                'INSERT INTO categories (name_en, name_ar, name_ku, icon) VALUES ($1, $2, $3, $4)',
                [category.name_en, category.name_ar, category.name_ku, category.icon]
            );
        }
        
        // Insert menu items
        for (const item of menuItems) {
            await db.query(
                'INSERT INTO menu_items (title_en, title_ar, title_ku, description_en, description_ar, description_ku, price, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [item.title_en, item.title_ar, item.title_ku, item.description_en, item.description_ar, item.description_ku, item.price, item.category_id]
            );
        }
    } else {
        // SQLite - Insert categories
        const categoryStmt = db.prepare('INSERT INTO categories (name_en, name_ar, name_ku, icon) VALUES (?, ?, ?, ?)');
        categories.forEach(category => {
            categoryStmt.run([category.name_en, category.name_ar, category.name_ku, category.icon]);
        });
        categoryStmt.finalize();
        
        // Insert menu items
        const itemStmt = db.prepare('INSERT INTO menu_items (title_en, title_ar, title_ku, description_en, description_ar, description_ku, price, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        menuItems.forEach(item => {
            itemStmt.run([item.title_en, item.title_ar, item.title_ku, item.description_en, item.description_ar, item.description_ku, item.price, item.category_id]);
        });
        itemStmt.finalize();
    }
    
    console.log(`Sample menu items added: ${menuItems.length} items`);
}

// Run initialization if called directly
if (require.main === module) {
    initializePostgreSQL()
        .then(() => {
            console.log('Database connection closed.');
            process.exit(0);
        })
        .catch(error => {
            console.error('Initialization failed:', error);
            process.exit(1);
        });
}

module.exports = { initializePostgreSQL, createDatabaseConnection };