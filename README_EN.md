# A2F (Allegiance to Fashion)

An interactive web application that visualizes football players' careers through unique uniform patterns

## Project Overview

The A2F project artistically visualizes the overseas careers of football players. By generating unique uniform designs based on the colors and duration of each team a player has been affiliated with, it provides a "Career Palette" that allows you to see a player's career at a glance.

## Key Features

### 1. Studio Mode (Custom Uniform Creation)
- Interactive studio where users can design uniform patterns themselves
- 2D/3D view mode switching (real-time preview)
- AR virtual fitting feature using webcam in 3D mode
- Save custom designs to database (Archive Uniform)
- Export as PNG image (Export Uniform)

### 2. Explore Mode (Player Career Exploration)
- Uniform pattern visualization based on real football players' career data
- Display player information and career timeline
- Navigate between players using left/right arrows
- Overlay rendering of player photos and 3D uniforms

### 3. Archive (Player Archive)
- List of all players and custom uniforms stored in the database
- Player name search functionality (bidirectional Korean/English support)
- Position-based filtering (FW, MF, DF, GK, etc.)
- Grid layout with card format display

## Technology Stack

### Frontend Framework
- **Next.js 15.5.5** (App Router, Turbopack)
- **React 19.1.0** (Client Components focused)
- **TypeScript 5**
- **Tailwind CSS 4**

### 3D Graphics & WebGL

The core of this project is real-time graphics rendering using WebGL.

#### Three.js-based 3D Rendering
- **Three.js 0.180.0**: WebGL abstraction library
- **@react-three/fiber 9.4.0**: Declarative Three.js usage with React components
- **@react-three/drei 10.7.6**: Useful helper components for 3D scene composition

#### WebGL Shader Programming

The project uses custom GLSL shaders to generate unique noise-based patterns.

##### 1. 2D Rendering - Raw WebGL

[NoiseGradientCanvas.tsx](components/NoiseGradientCanvas.tsx) uses pure WebGL API directly to render noise patterns on a 2D canvas.

**Vertex Shader:**
```glsl
attribute vec4 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_position.xy * 0.5 + 0.5;
}
```

**Fragment Shader Core Features:**
- **Simplex Noise**: Perlin noise implementation for natural pattern generation
- **FBM (Fractal Brownian Motion)**: Layering multiple octaves of noise to create complex patterns
- **Domain Warping**: Warping noise space for organic flow effects
- **Color Gradient System**: Interpolating up to 10 color stops to create multi-color gradients
- **Halftone Pattern**: Optional halftone dot pattern overlay

**Key Uniform Parameters:**
```glsl
uniform float u_amplitude;      // Noise amplitude
uniform float u_saturation;     // Color saturation
uniform int u_layers;           // Number of FBM layers
uniform float u_lacunarity;     // Frequency multiplier
uniform float u_gain;           // Amplitude decay
uniform float u_warpStrength;   // Domain warping strength
uniform int u_halftonePattern;  // Halftone pattern activation
uniform float u_halftoneScale;  // Halftone scale
```

**WebGL Initialization Process:**
1. Create WebGL context (`getContext('webgl')`)
2. Compile Vertex/Fragment shaders and link program
3. Create buffers and bind vertex data (fullscreen quad)
4. Set uniform variables and render loop

##### 2. 3D Rendering - Three.js ShaderMaterial

[UniformRenderer.tsx](components/UniformRenderer.tsx) applies custom shaders to GLTF 3D models (uniforms).

**3D Vertex Shader:**
```glsl
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**3D Fragment Shader Additional Features:**
- Uses the same noise algorithm as 2D version
- **Phong Lighting Model**: Normal vector-based lighting calculations
- **Specular Highlights**: Added specular highlights
- **Camera Position**: Dynamic lighting based on viewing angle

**Three.js Scene Composition:**
```typescript
<Canvas
  camera={{ position: [0, 0, 1.5], fov: 45 }}
  gl={{
    antialias: true,
    preserveDrawingBuffer: true,  // Required for screenshot saving
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
    alpha: transparentBackground,  // Transparent background in AR mode
  }}
>
  {/* Lighting setup */}
  <ambientLight intensity={0.8} />
  <directionalLight position={[3, 4, 4]} intensity={1.5} castShadow />

  {/* 3D model */}
  <UniformMesh modelPath="/assets/models/jersey_tigres/scene.gltf" />

  {/* Camera controls */}
  <OrbitControls enableDamping dampingFactor={0.08} />
</Canvas>
```

**GLTF Model Processing:**
1. Load 3D model with `useGLTF` hook
2. Extract original textures (for displaying original uniforms if needed)
3. Traverse all meshes and apply custom ShaderMaterial
4. Auto-rotation animation with `useFrame` hook

##### 3. Webcam Integration (AR Virtual Fitting)

In 3D mode, uniforms are overlaid on the webcam feed to provide a virtual fitting effect.

```typescript
{/* Layer structure */}
<div style={{ zIndex: 1 }}>  {/* Webcam background */}
  <Webcam mirrored videoConstraints={{ width: 1920, height: 1080 }} />
</div>
<div style={{ zIndex: 2 }}>  {/* 3D uniform with transparent background */}
  <UniformRenderer transparentBackground={true} />
</div>
```

**WebGL Alpha Blending:**
- `gl: { alpha: true }` - Enable transparent background
- Three.js transparency settings to composite 3D objects over webcam

### WebGL Shader Detailed Analysis

#### Simplex Noise Algorithm

The project implements Ken Perlin's Simplex Noise in GLSL. This is more computationally efficient than Perlin Noise and generates more natural patterns.

**Core Function:**
```glsl
float snoise(vec2 v) {
  // Calculate simplex grid
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  // Calculate gradient vectors
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));

  // Calculate and return noise value
  return 130.0 * dot(m, g);
}
```

#### FBM (Fractal Brownian Motion)

Combines noise at multiple frequencies to generate natural fractal patterns.

```glsl
float fbm(vec2 p, int layers) {
  float value = 0.0, amplitude = u_amplitude, frequency = 1.0;
  for(int i = 0; i < 8; i++) {
    if(i >= layers) break;
    value += amplitude * snoise(p * frequency);
    frequency *= u_lacunarity;  // Increase frequency
    amplitude *= u_gain;         // Decrease amplitude
  }
  return value;
}
```

#### Domain Warping

Warps the noise space itself to create more complex and organic patterns.

```glsl
vec2 w = p + vec2(fbm(p * 0.3, 3), fbm(p * 0.5, 2)) * u_warpStrength;
float n = snoise(w);
```

#### Color Gradient System

Creates smooth multi-color gradients by smoothstep interpolating up to 10 color stops.

```glsl
vec3 getColorFromScheme(float t) {
  // Find the color segment that the current noise value belongs to
  for(int i = 0; i < 9; i++) {
    if(i >= u_colorStopCount - 1) break;
    if(t >= u_colorPositions[i] && t <= u_colorPositions[i + 1]) {
      float blend = smoothstep(u_colorPositions[i],
                               u_colorPositions[i + 1], t);
      return mix(u_colorValues[i], u_colorValues[i + 1], blend);
    }
  }
  return u_colorValues[u_colorStopCount - 1];
}
```

#### WebGL Performance Optimization

1. **Shader Optimization**
   - Loop unrolling for WebGL 1.0 compatibility
   - Prevent unnecessary re-rendering with `preserveDrawingBuffer`

2. **Dynamic Updates**
   - Prevent recompilation by updating only uniform variables
   - Detect parameter changes with React useEffect and upload to GPU

3. **Memory Management**
   - Clean up WebGL resources on component unmount (dispose shader, program, buffer)

### Database
- **Supabase** (PostgreSQL)
  - Players table: Player information and career data
  - Custom uniform storage
  - Storage: Player images and loading animations

### Other Libraries
- **react-webcam 7.2.0**: Webcam integration
- **webscreensaver 1.0.6**: Screensaver functionality

## Project Structure

```
a2f-project/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Studio Mode (main page)
│   ├── explore/page.tsx          # Explore Mode (player exploration)
│   ├── archive/page.tsx          # Archive (player list)
│   ├── about/page.tsx            # About page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── UniformRenderer.tsx       # 3D uniform renderer (Three.js)
│   ├── NoiseGradientCanvas.tsx   # 2D noise pattern (Raw WebGL)
│   ├── ControlPanel.tsx          # Pattern adjustment control panel
│   ├── PlayerCard.tsx            # Player card component
│   └── Navigation.tsx            # Navigation bar
├── lib/                          # Utilities and types
│   ├── shaders.ts                # GLSL shader code
│   ├── types.ts                  # TypeScript type definitions
│   ├── playerData.ts             # Player data API
│   ├── supabase.ts               # Supabase client
│   ├── koreanNameMapping.ts      # Korean name mapping
│   └── designTokens.ts           # Design tokens
└── public/assets/models/         # 3D models (GLTF)
    └── jersey_tigres/
        └── scene.gltf            # Uniform 3D model
```

## Data Structure

### NoiseParams (Pattern Generation Parameters)
```typescript
interface NoiseParams {
  amplitude: number;        // Noise amplitude (0-5)
  saturation: number;       // Color saturation (0-1)
  layers: number;           // Number of FBM layers (1-8)
  lacunarity: number;       // Frequency multiplier (1-4)
  gain: number;             // Amplitude decay (0-1)
  warpStrength: number;     // Domain warping strength (0-3)
  halftonePattern: number;  // Halftone pattern (0/1)
  halftoneScale: number;    // Halftone scale (10-100)
  colorStops: ColorStop[];  // Color gradient (up to 10)
}
```

### PlayerData (Player Information)
```typescript
interface PlayerData {
  id: string;
  name: string;             // English name
  nameKo: string;           // Korean name
  clubs: Club[];            // Team history
  position: string;         // Position
  description: string;      // Description
  // Heatmap Control (for custom uniforms)
  saturation?: number;
  amplitude?: number;
  lacunarity?: number;
  grain?: number;
  warpStrength?: number;
}
```

## Installation and Running

### Environment Variable Setup
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server
```bash
# Install packages
npm install

# Development server (Turbopack)
npm run dev

# Build
npm run build

# Production server
npm start
```

The development server runs at `http://localhost:3000`.

## Main Pages

### 1. Studio Mode (`/`)
- **Purpose**: Users can design and save uniform patterns themselves
- **Features**:
  - Adjust noise parameters with Heatmap Control panel
  - Add/modify/delete up to 9 color stops
  - Real-time 2D/3D view mode switching
  - AR virtual fitting when webcam is enabled in 3D mode
  - "Archive Uniform": Save design to database
  - "Export Uniform": Download as PNG image

### 2. Explore Mode (`/explore`)
- **Purpose**: Appreciate uniforms visualizing actual player careers
- **Features**:
  - Unique Career Palette for each player (based on team colors)
  - Display player information and career timeline
  - Navigate to previous/next player with left/right arrows
  - Player photos in background, 3D uniform overlay in foreground
  - Save last viewed player in localStorage

### 3. Archive (`/archive`)
- **Purpose**: Archive of all players and custom uniforms
- **Features**:
  - Search: Search player names in Korean/English (transliteration support)
  - Filter: Filter by position (All Position, FW, MF, DF, GK, Custom, etc.)
  - Navigate to Explore page when clicking player card

## License

This project is a personal project. Please inquire separately about licenses for commercial use.

---

**© 2025 A2F Project**
