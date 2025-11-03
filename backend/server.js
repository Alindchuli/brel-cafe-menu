const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const dbPath = path.join(__dirname, '..', 'database', 'menu.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '..', 'assets', 'images');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Authentication Configuration
const ADMIN_CREDENTIALS = {
    username: 'Breladmin',
    password: 'Brelcafe8844', // Change this to a secure password
    // In production, use hashed passwords
};

// Simple session store (in production, use Redis or database)
const activeSessions = new Map();

// Generate secure token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Authentication middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    if (!activeSessions.has(token)) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Update last activity
    activeSessions.get(token).lastActivity = Date.now();
    next();
}

// Clean expired sessions (24 hours)
setInterval(() => {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    for (const [token, session] of activeSessions.entries()) {
        if (now - session.lastActivity > dayInMs) {
            activeSessions.delete(token);
        }
    }
}, 60 * 60 * 1000); // Clean every hour

// ROUTES

// Root route - serve customer menu
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});

// Categories routes
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name_en', (err, categories) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(categories);
    });
});

// Menu items routes
app.get('/api/menu', (req, res) => {
    const query = `
        SELECT mi.*, c.name_en as category_name_en, c.name_ar as category_name_ar, c.name_ku as category_name_ku
        FROM menu_items mi 
        LEFT JOIN categories c ON mi.category_id = c.id 
        WHERE mi.available = 1
        ORDER BY c.name_en, mi.title_en
    `;
    
    db.all(query, (err, items) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(items);
    });
});

// Get menu items by category
app.get('/api/menu/category/:categoryId', (req, res) => {
    const categoryId = req.params.categoryId;
    
    const query = `
        SELECT mi.*, c.name_en as category_name_en, c.name_ar as category_name_ar, c.name_ku as category_name_ku
        FROM menu_items mi 
        LEFT JOIN categories c ON mi.category_id = c.id 
        WHERE mi.category_id = ? AND mi.available = 1
        ORDER BY mi.title_en
    `;
    
    db.all(query, [categoryId], (err, items) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(items);
    });
});

// Search menu items
app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q;
    const language = req.query.lang || 'en';
    
    if (!searchTerm) {
        return res.status(400).json({ error: 'Search term required' });
    }
    
    let searchFields;
    switch(language) {
        case 'ar':
            searchFields = 'mi.title_ar LIKE ? OR mi.description_ar LIKE ?';
            break;
        case 'ku':
            searchFields = 'mi.title_ku LIKE ? OR mi.description_ku LIKE ?';
            break;
        default:
            searchFields = 'mi.title_en LIKE ? OR mi.description_en LIKE ?';
    }
    
    const query = `
        SELECT mi.*, c.name_en as category_name_en, c.name_ar as category_name_ar, c.name_ku as category_name_ku
        FROM menu_items mi 
        LEFT JOIN categories c ON mi.category_id = c.id 
        WHERE (${searchFields}) AND mi.available = 1
        ORDER BY mi.title_en
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    db.all(query, [searchPattern, searchPattern], (err, items) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(items);
    });
});

// Authentication Routes
app.post('/api/admin/login', (req, res) => {
    const { username, password, rememberMe } = req.body;
    
    // Basic validation
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }
    
    // Check credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Generate token
        const token = generateToken();
        
        // Store session
        activeSessions.set(token, {
            username: username,
            loginTime: Date.now(),
            lastActivity: Date.now(),
            rememberMe: rememberMe
        });
        
        res.json({
            success: true,
            token: token,
            username: username,
            message: 'Login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

app.post('/api/admin/verify', requireAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid'
    });
});

app.post('/api/admin/logout', requireAuth, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.substring(7);
    
    // Remove session
    activeSessions.delete(token);
    
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Admin routes for adding menu items
app.post('/api/admin/menu', requireAuth, upload.single('image'), (req, res) => {
    const {
        title_en, title_ar, title_ku,
        description_en, description_ar, description_ku,
        price, category_id, available
    } = req.body;
    
    // Validate required fields
    if (!title_en) {
        return res.status(400).json({ error: 'English title is required' });
    }
    
    const image_url = req.file ? `/assets/images/${req.file.filename}` : null;
    
    const query = `INSERT INTO menu_items 
        (title_en, title_ar, title_ku, description_en, description_ar, description_ku, price, image_url, category_id, available) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [
        title_en, title_ar || null, title_ku || null,
        description_en || null, description_ar || null, description_ku || null,
        price || null, image_url, category_id || null, available || 1
    ], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            id: this.lastID,
            message: 'Menu item added successfully',
            item: {
                id: this.lastID,
                title_en, title_ar, title_ku,
                description_en, description_ar, description_ku,
                price, image_url, category_id, available
            }
        });
    });
});

// Get all menu items for admin (including unavailable ones)
app.get('/api/admin/menu', (req, res) => {
    const query = `
        SELECT mi.*, c.name_en as category_name_en, c.name_ar as category_name_ar, c.name_ku as category_name_ku
        FROM menu_items mi 
        LEFT JOIN categories c ON mi.category_id = c.id 
        ORDER BY mi.created_at DESC
    `;
    
    db.all(query, (err, items) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(items);
    });
});

// Delete menu item
app.delete('/api/admin/menu/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    
    // First get the item to delete associated image
    db.get('SELECT image_url FROM menu_items WHERE id = ?', [id], (err, item) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        db.run('DELETE FROM menu_items WHERE id = ?', [id], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Item not found' });
            }
            
            // Delete image file if it exists
            if (item && item.image_url) {
                const imagePath = path.join(__dirname, '..', item.image_url);
                if (fs.existsSync(imagePath)) {
                    try {
                        fs.unlinkSync(imagePath);
                    } catch (error) {
                        console.error('Error deleting image file:', error);
                    }
                }
            }
            
            res.json({ message: 'Menu item deleted successfully' });
        });
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 5MB)' });
        }
    }
    
    if (error.message === 'Only image files are allowed') {
        return res.status(400).json({ error: 'Only image files are allowed' });
    }
    
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Category CRUD Routes
app.post('/api/admin/categories', requireAuth, (req, res) => {
    const { name_en, name_ar, name_ku, icon } = req.body;
    
    if (!name_en) {
        return res.status(400).json({ 
            success: false, 
            message: 'English name is required' 
        });
    }
    
    const query = `
        INSERT INTO categories (name_en, name_ar, name_ku, icon)
        VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [name_en, name_ar || null, name_ku || null, icon || 'fas fa-utensils'], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error' 
            });
        }
        
        res.json({
            success: true,
            message: 'Category created successfully',
            categoryId: this.lastID
        });
    });
});

app.put('/api/admin/categories/:id', requireAuth, (req, res) => {
    const categoryId = req.params.id;
    const { name_en, name_ar, name_ku, icon } = req.body;
    
    if (!name_en) {
        return res.status(400).json({ 
            success: false, 
            message: 'English name is required' 
        });
    }
    
    const query = `
        UPDATE categories 
        SET name_en = ?, name_ar = ?, name_ku = ?, icon = ?
        WHERE id = ?
    `;
    
    db.run(query, [name_en, name_ar || null, name_ku || null, icon || 'fas fa-utensils', categoryId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error' 
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Category not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Category updated successfully'
        });
    });
});

app.delete('/api/admin/categories/:id', requireAuth, (req, res) => {
    const categoryId = req.params.id;
    
    // First check if category has menu items
    db.get('SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?', [categoryId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error' 
            });
        }
        
        if (row.count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category that has menu items. Please move or delete the menu items first.'
            });
        }
        
        // Delete category
        db.run('DELETE FROM categories WHERE id = ?', [categoryId], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Category not found' 
                });
            }
            
            res.json({
                success: true,
                message: 'Category deleted successfully'
            });
        });
    });
});

// Get category with item count
app.get('/api/admin/categories', requireAuth, (req, res) => {
    const query = `
        SELECT c.*, 
               COUNT(mi.id) as item_count,
               COUNT(CASE WHEN mi.available = 1 THEN 1 END) as available_count
        FROM categories c 
        LEFT JOIN menu_items mi ON c.id = mi.category_id 
        GROUP BY c.id
        ORDER BY c.name_en
    `;
    
    db.all(query, [], (err, categories) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(categories);
    });
});

// Dashboard stats endpoint
app.get('/api/admin/stats', requireAuth, (req, res) => {
    const queries = {
        totalItems: 'SELECT COUNT(*) as count FROM menu_items',
        totalCategories: 'SELECT COUNT(*) as count FROM categories',
        availableItems: 'SELECT COUNT(*) as count FROM menu_items WHERE available = 1',
        unavailableItems: 'SELECT COUNT(*) as count FROM menu_items WHERE available = 0'
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.get(queries[key], [], (err, row) => {
            if (!err) {
                results[key] = row.count;
            } else {
                results[key] = 0;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

// Get recent menu items
app.get('/api/admin/recent', requireAuth, (req, res) => {
    const query = `
        SELECT mi.*, c.name_en as category_name
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        ORDER BY mi.id DESC
        LIMIT 5
    `;
    
    db.all(query, [], (err, items) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(items);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Multilingual Menu Server running on port ${PORT}`);
    console.log(`📱 Customer Menu: http://localhost:${PORT}`);
    console.log(`⚙️  Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🌍 Languages: English, العربية, کوردی`);
});

module.exports = app;