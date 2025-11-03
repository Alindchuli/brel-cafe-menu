# Brel Cafe - Multilingual Menu System

A comprehensive multilingual menu system supporting **Arabic**, **Kurdish**, and **English** languages with RTL (Right-to-Left) text support and admin functionality.

## Features

### 🌍 Multi-language Support
- **English** (LTR - Left to Right)
- **Arabic** (RTL - Right to Left) 
- **Kurdish** (RTL - Right to Left)
- Seamless language switching
- Proper RTL text rendering with Arabic fonts

### 🔍 Search & Filter
- Real-time multilingual search
- Category-based filtering
- Search across all languages simultaneously

### 👨‍💼 Admin Panel
- Add menu items in all three languages
- Upload item images (supports JPG, PNG, GIF)
- Optional pricing system
- Delete existing menu items
- Real-time preview

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for all screen sizes
- Cross-browser compatibility

## Project Structure

```
brel menu/
├── backend/
│   └── server.js          # Express.js server with multilingual API
├── database/
│   ├── init.js           # Database initialization script
│   └── menu.db           # SQLite database (auto-generated)
├── frontend/
│   ├── index.html        # Customer menu interface
│   ├── admin.html        # Admin panel
│   ├── css/
│   │   ├── style.css     # Main customer interface styles
│   │   └── admin.css     # Admin panel styles
│   └── js/
│       ├── translations.js # Language management system
│       ├── menu.js       # Customer menu functionality
│       └── admin.js      # Admin panel functionality
├── uploads/              # Image storage (auto-generated)
└── package.json          # Node.js dependencies
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run init-db
```
This will create the SQLite database with sample menu items in all three languages.

### 3. Start the Server
```bash
npm start
```
For development with auto-reload:
```bash
npm run dev
```

### 4. Access the Application
- **Customer Menu**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## Language Support

### Arabic Text (عربي)
- Uses **Noto Sans Arabic** and **Amiri** fonts
- RTL text direction
- Proper Arabic text rendering
- Cultural-appropriate formatting

### Kurdish Text (کوردی)  
- Uses **Noto Sans Arabic** font
- RTL text direction
- Kurdish language support
- Regional text formatting

### English Text
- Uses **Inter** and system fonts
- LTR text direction
- Standard Latin text rendering

## Database Schema

### Categories Table
- `id` - Primary key
- `name_en` - English category name
- `name_ar` - Arabic category name  
- `name_ku` - Kurdish category name
- `icon` - Font Awesome icon class

### Menu Items Table
- `id` - Primary key
- `category_id` - Foreign key to categories
- `title_en/ar/ku` - Multilingual titles
- `description_en/ar/ku` - Multilingual descriptions
- `price` - Item price (optional)
- `image` - Image filename
- `available` - Availability status
- `created_at` - Creation timestamp

## API Endpoints

### Public Endpoints
- `GET /api/menu` - Get all menu items
- `GET /api/menu/search?q=query&lang=en` - Search menu items
- `GET /api/categories` - Get all categories

### Admin Endpoints  
- `POST /api/admin/items` - Add new menu item
- `DELETE /api/admin/items/:id` - Delete menu item
- `POST /api/admin/upload` - Upload item image

## Image Upload

- **Supported formats**: JPG, JPEG, PNG, GIF
- **Maximum file size**: 5MB
- **Storage location**: `/uploads` directory
- **Automatic resizing**: Images are optimized for web display

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Adding New Languages
1. Update database schema in `database/init.js`
2. Add translations to `frontend/js/translations.js`
3. Update API endpoints in `backend/server.js`
4. Add CSS styles for new text direction if needed

### Customizing Styles
- Edit `frontend/css/style.css` for customer interface
- Edit `frontend/css/admin.css` for admin panel
- Modify CSS variables in `:root` for color scheme changes

### Sample Data
The system comes with 17 sample menu items across 6 categories:
- ☕ Coffee & Hot Drinks
- 🥤 Cold Drinks & Juices  
- 🍰 Desserts & Pastries
- 🥗 Light Meals & Salads
- 🍕 Main Dishes
- 🍞 Breakfast & Bakery

## Technical Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **File Upload**: Multer middleware
- **Fonts**: Google Fonts (Noto Sans Arabic, Amiri, Inter)
- **Icons**: Font Awesome 6

## Configuration

### Server Settings
- **Port**: 3000 (configurable via environment)
- **Upload limit**: 5MB per file
- **CORS**: Enabled for all origins

### Database Settings  
- **Type**: SQLite3
- **File**: `database/menu.db`
- **Encoding**: UTF-8 (supports all languages)

## Troubleshooting

### Common Issues

**Fonts not displaying correctly for Arabic/Kurdish:**
- Ensure Google Fonts are loading properly
- Check internet connection for font downloads
- Verify CSS font-family declarations

**Images not uploading:**
- Check file size (must be under 5MB)
- Verify file format (JPG, PNG, GIF only)
- Ensure uploads directory has write permissions

**Database errors:**
- Run `npm run init-db` to recreate database
- Check SQLite3 installation
- Verify file permissions in project directory

**RTL text not rendering:**
- Confirm CSS `direction: rtl` is applied
- Check Arabic/Kurdish font loading
- Verify HTML `dir` attributes

## License

MIT License - feel free to use this project for your restaurant or cafe!

## Support

For issues or questions about the multilingual menu system, please check:
1. This README for common solutions
2. Verify all dependencies are installed correctly
3. Ensure database is initialized properly
4. Check browser console for JavaScript errors

---

**Enjoy your multilingual cafe menu! 🌍☕**

## 🚀 Free Hosting Options

### 1. **Vercel (Recommended)**
Perfect for Node.js apps with SQLite:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy your app
vercel
```

**Features:**
- ✅ Free tier includes 100GB bandwidth
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Git integration
- ✅ Node.js support

### 2. **Railway**
Great alternative with database support:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

### 3. **Render**
Another excellent free option:

1. Connect your GitHub repository
2. Choose "Web Service"
3. Set build command: `npm install`
4. Set start command: `node backend/server.js`

### 4. **Netlify Functions**
For serverless deployment:

1. Create `netlify.toml` in project root
2. Deploy frontend to Netlify
3. Use Netlify Functions for API

## 🔧 Deployment Configuration

The project includes `vercel.json` for easy Vercel deployment. Your app will be available at:
`https://your-app-name.vercel.app`

## 🌐 Live Demo
After deployment, access:
- **Menu**: `https://your-domain.com`
- **Admin**: `https://your-domain.com/login.html`
- **Credentials**: admin / admin123