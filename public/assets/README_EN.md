# Assets Folder Structure

This folder manages all static assets for the A2F project.

## 📁 Folder Structure

```
assets/
├── models/     # 3D model files (.glb, .gltf)
├── images/     # Image files (.png, .jpg, .svg)
├── fonts/      # Custom font files
└── data/       # JSON data files
```

## 🎨 Models (`/models`)

**Purpose**: 3D uniform models and other 3D assets

**Recommended File Names**:
- `jersey.glb` - Default football uniform model
- `jersey_[team].glb` - Team-specific uniform models
- `player_avatar_[name].glb` - Player-specific avatars

**File Format**: `.glb` (recommended) or `.gltf`

**Optimization Tips**:
- Use Draco compression
- Texture size: 1024x1024 or lower
- Polygon count: 10,000 or less recommended

## 🖼️ Images (`/images`)

**Purpose**: Logos, icons, background images

**Recommended Structure**:
```
images/
├── logos/          # A2F logo, club logos
├── players/        # Player photos
├── backgrounds/    # Background images
└── icons/          # UI icons
```

**Optimization**:
- WebP format recommended
- Use Next.js Image component

## 🔤 Fonts (`/fonts`)

**Purpose**: Custom web fonts

**Supported Formats**: `.woff2`, `.woff`, `.ttf`

**Usage**:
```css
/* app/globals.css */
@font-face {
  font-family: 'CustomFont';
  src: url('/assets/fonts/custom-font.woff2') format('woff2');
}
```

## 📊 Data (`/data`)

**Purpose**: Player data, configuration files

**Recommended Files**:
- `players.json` - Complete player data
- `clubs.json` - Club information and colors
- `translations.json` - Multi-language translations

**Example**:
```json
{
  "players": [
    {
      "id": "park-jisung",
      "name": "Park Ji-sung",
      "clubs": [...]
    }
  ]
}
```

## 📝 Usage Examples

### Loading 3D Models
```tsx
<UniformRenderer modelPath="/assets/models/jersey.glb" />
```

### Using Images
```tsx
<Image
  src="/assets/images/logos/a2f-logo.png"
  alt="A2F Logo"
  width={200}
  height={200}
/>
```

### Loading Data
```ts
const players = await fetch('/assets/data/players.json').then(r => r.json());
```

## 🚀 Next Steps

1. **Add 3D Models**: Upload `models/jersey.glb` file
2. **Add Logos**: A2F logo and club logos
3. **Player Photos**: High-resolution player images
4. **Data Files**: Extended player database
