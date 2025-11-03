# Font Installation Instructions

## Arab Quran Islamic 140 Font

To use the **Arab Quran Islamic 140** font in your multilingual menu system:

### Step 1: Download the Font
1. Search for "Arab Quran Islamic 140 font" online
2. Download the font files in these formats (if available):
   - `Arab_Quran_Islamic_140.woff2` (recommended - smallest file size)
   - `Arab_Quran_Islamic_140.woff` (good browser support)
   - `Arab_Quran_Islamic_140.ttf` (fallback format)

### Step 2: Place Font Files
1. Copy the downloaded font files to this directory:
   ```
   frontend/fonts/
   ```
2. The files should be named exactly as shown above

### Step 3: Enable the Font
1. Open `frontend/css/style.css`
2. Find the commented `@font-face` declaration (around line 10)
3. Uncomment it by removing the `/*` and `*/` 
4. Do the same in `frontend/css/admin.css`

### Step 4: Test the Font
1. Restart your server: `npm start`
2. Switch to Arabic (العربية) or Kurdish (کوردی) language
3. The text should now display in the Arab Quran Islamic 140 font

### Current Font Fallbacks
Even without the custom font file, Arabic and Kurdish text will display using:
- **Arab Quran Islamic 140** (if installed)
- **Noto Sans Arabic** (Google Fonts fallback)
- **Amiri** (Google Fonts fallback for Arabic)
- **Arial** (system fallback)

### Font Usage
The Arab Quran Islamic 140 font is applied to:
- All Arabic text (العربية)
- All Kurdish text (کوردی) 
- RTL input fields in admin panel
- Language dropdown text
- Menu item titles and descriptions

### Troubleshooting
- If font doesn't load, check browser Developer Tools (F12) → Network tab for font loading errors
- Verify font file names match exactly
- Ensure font files are in the correct directory
- Try clearing browser cache (Ctrl+F5)

---
**Note**: If you cannot find the Arab Quran Islamic 140 font, the system will automatically fall back to Noto Sans Arabic and other Arabic fonts that provide excellent readability.