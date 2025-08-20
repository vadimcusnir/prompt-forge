# PromptForge Favicons & Branding

## Fișiere create

### ✅ Favicon SVG (Modern)
- **`favicon.svg`** - Favicon modern în format SVG, optimizat pentru browsere moderne
- Folosește designul geometric cu forme cristaline inspirat din conceptele vizuale
- Coloare principală: #0A0A0A (negru) cu forme albe

### ✅ Logo SVG (Branding)
- **`logo.svg`** - Logo complet cu icon și text "PromptForge"
- Include tagline-ul "Generatorul Operațional de Prompturi"
- Optimizat pentru utilizare în header, footer și materiale de marketing

### ✅ Web App Manifest
- **`site.webmanifest`** - Configurare PWA pentru instalarea ca aplicație
- Include toate icon-urile necesare
- Configurare pentru tema întunecată (#0A0A0A)

### ⚠️ Favicon ICO (Necesită conversie)
- **`favicon.ico`** - Placeholder text, trebuie convertit la format ICO
- Browserele vechi necesită acest format

## Cum să configurezi favicon-urile

### 1. Convertire favicon.ico
```bash
# Folosind ImageMagick
convert favicon.svg -resize 32x32 favicon.ico

# Sau folosind online converters:
# - https://convertio.co/svg-ico/
# - https://favicon.io/favicon-converter/
```

### 2. Generare PNG-uri
```bash
# Favicon 16x16
convert favicon.svg -resize 16x16 favicon-16x16.png

# Favicon 32x32  
convert favicon.svg -resize 32x32 favicon-32x32.png

# Apple touch icon 180x180
convert favicon.svg -resize 180x180 apple-touch-icon.png
```

### 3. Verificare în browser
- Deschide aplicația în browser
- Verifică tab-ul să vădă favicon-ul
- Testează pe mobile pentru apple-touch-icon
- Verifică PWA manifest în DevTools

## Design System

### Culori
- **Primar**: #0A0A0A (negru)
- **Accent**: #d1a954 (auriu industrial)
- **Text secundar**: #5a5a5a (plumb gri)

### Forme geometrice
- Triunghiuri asimetrice pentru dinamism
- Forme cristaline pentru aspect modern
- Linii de accent pentru adâncime

### Tipografie
- **Heading**: Montserrat (bold, modern)
- **Body**: Open Sans (citibil, curat)

## Compatibilitate

- ✅ **Browsere moderne**: SVG favicon
- ✅ **iOS**: Apple touch icon 180x180
- ✅ **Android**: Web app manifest
- ⚠️ **Browsere vechi**: ICO format (necesită conversie)
- ✅ **PWA**: Manifest complet configurat

## Optimizări viitoare

1. **Favicon animat** - Versiune cu animații subtile
2. **Dark/Light mode** - Favicon-uri adaptive
3. **Brand guidelines** - Documentație completă de branding
4. **Social media** - Versiuni pentru platforme sociale
