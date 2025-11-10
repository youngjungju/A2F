# A2F Project - WebGL Noise Gradient Uniform Design Studio

> **Interactive Soccer Uniform Customization Platform Combining WebGL-Based Simplex Noise + Three.js 3D Rendering**

![Project Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)
![React](https://img.shields.io/badge/React-19.1.0-61dafb)
![Three.js](https://img.shields.io/badge/Three.js-0.180.0-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [What is WebGL Noise Gradient?](#-what-is-webgl-noise-gradient)
- [Features](#-features)
- [Demo](#-demo)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Core Logic Analysis](#-core-logic-analysis)
- [Architecture](#-architecture)
- [Performance Optimization](#-performance-optimization)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**A2F Project** is an interactive web application that leverages WebGL's GPU parallel processing capabilities and Simplex Noise algorithms to generate organic gradient patterns in real-time, applying them to Three.js 3D soccer uniform models.

### Core Values

- **WebGL Shader Programming**: GPU-based real-time noise generation using GLSL
- **Three.js 3D Integration**: Declarative 3D rendering through React Three Fiber
- **Next.js SSR/CSR**: Hybrid architecture combining server-side and client-side rendering
- **Real-time Customization**: Instant visual feedback on parameter changes

### Use Cases

- Soccer uniform design simulation
- Generative art creation
- WebGL/Shader learning reference
- Procedural 3D texture generation

---

## 🌊 What is WebGL Noise Gradient?

### WebGL and GLSL Shader Architecture

WebGL (Web Graphics Library) is a JavaScript API that allows direct GPU control in browsers. This project uses shaders written in **GLSL (OpenGL Shading Language)** to perform pixel-level parallel processing.

```glsl
// Vertex Shader: Vertex Transformation
attribute vec4 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_position.xy * 0.5 + 0.5;  // Transform [-1,1] → [0,1] UV coordinates
}
```

```glsl
// Fragment Shader: Pixel Color Determination
precision highp float;
varying vec2 v_uv;

void main() {
  float noise = snoise(v_uv * 10.0);  // Generate Simplex Noise
  vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
  gl_FragColor = vec4(color, 1.0);
}
```

### Mathematical Principles of Simplex Noise

This project uses **Ken Perlin**'s improved Simplex Noise algorithm.

#### 1. Perlin Noise vs Simplex Noise

| Feature | Perlin Noise | Simplex Noise |
|---------|--------------|---------------|
| Dimensional Complexity | O(2^n) | O(n^2) |
| Visual Characteristics | Grid artifacts present | More organic |
| Computational Efficiency | Low (high dimensions) | High (all dimensions) |

#### 2. Simplex Noise Algorithm Implementation

```glsl
float snoise(vec2 v) {
  // 1. Skew: Transform (x,y) coordinates to simplex grid
  const vec4 C = vec4(0.211324865405187,   // (3-sqrt(3))/6
                      0.366025403784439,   // 0.5*(sqrt(3)-1)
                      -0.577350269189626,  // -1+2*C.x
                      0.024390243902439);  // 1/41

  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  // 2. Find three vertices within simplex
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // 3. Calculate gradients at each vertex
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));

  // 4. Distance-based falloff function (Radial Falloff)
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;

  // 5. Dot product of gradient and distance vectors
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;

  return 130.0 * dot(m, g);  // Normalized noise value [-1, 1]
}
```

#### 3. Fractional Brownian Motion (fBM)

Overlaying multiple frequencies of noise to create complex organic patterns.

```glsl
float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float totalAmplitude = 0.0;

  for(int i = 0; i < octaves; i++) {
    // Apply rotation per octave for more organic patterns
    float angle = float(i) * 0.5;
    mat2 rot = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    vec2 rotatedP = rot * p;

    value += amplitude * snoise(rotatedP * frequency);
    totalAmplitude += amplitude;

    frequency *= lacunarity;  // Frequency increase (default: 2.3)
    amplitude *= gain;         // Amplitude decay (default: 0.65)
  }

  return value / totalAmplitude;
}
```

**Parameter Explanations:**
- `octaves`: Number of noise layers to overlay (detail level)
- `lacunarity`: Frequency multiplier per octave (2.0 = frequency doubles each octave)
- `gain`: Amplitude decay rate per octave (0.5 = amplitude halves each octave)

#### 4. Domain Warping

Distorting UV coordinates themselves with noise to create even more complex patterns.

```glsl
vec2 warp1 = vec2(
  fbm(p * 0.5, 3),
  fbm(p * 0.5 + vec2(5.2, 1.3), 3)
) * warpStrength * 0.5;

vec2 warp2 = vec2(
  fbm((p + warp1) * 1.2, 2),
  fbm((p + warp1) * 1.2 + vec2(3.7, 2.9), 2)
) * warpStrength * 0.3;

vec2 finalPos = p + warp1 + warp2;
float noise = fbm(finalPos * 0.8, layers);
```

#### 5. Quintic Interpolation

Quintic interpolation function for smooth color transitions:

```glsl
float quintic(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);  // 6t^5 - 15t^4 + 10t^3
}
```

Graph characteristics:
- **First derivative = 0** at 0 and 1 (smooth start/end)
- Continuous second derivative (visually more natural transitions)

#### 6. Gradient Mapping

Converting noise values [-1, 1] to user-defined color schemes:

```glsl
vec3 getColorFromScheme(float t) {
  t = clamp(t, 0.0, 1.0);

  // Linear interpolation between color stops
  for(int i = 0; i < u_colorStopCount - 1; i++) {
    if(t >= u_colorPositions[i] && t <= u_colorPositions[i+1]) {
      float blend = (t - u_colorPositions[i]) /
                    (u_colorPositions[i+1] - u_colorPositions[i]);
      return mix(u_colorValues[i], u_colorValues[i+1], blend);
    }
  }

  return u_colorValues[u_colorStopCount - 1];
}
```

#### 7. Dithering

Adding noise to eliminate color banding:

```glsl
float dither(vec2 uv) {
  float noise1 = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  float noise2 = fract(sin(dot(uv, vec2(93.9898, 67.345))) * 43758.5453);
  return (noise1 + noise2) * 0.5 - 0.5;  // Triangular distribution
}

// Application
float ditherAmount = dither(v_uv * 1000.0) / 255.0;
t = clamp(t + ditherAmount, 0.0, 1.0);
```

### Benefits of GPU Parallel Processing

1. **Massive Parallelism**: 1920x1080 resolution = 2,073,600 pixels computed **simultaneously**
2. **Real-time Performance**: Generate complex noise patterns at 60 FPS
3. **No CPU Load**: Main thread focuses only on UI event handling

```
CPU (Sequential)      GPU (Parallel)
Pixel 1 → Pixel 2     Pixel 1
  ↓                   Pixel 2
Pixel 3 → Pixel 4     Pixel 3
  ↓                   Pixel 4
...                   ...
                      Pixel 2,073,600
                      ↓
                      Simultaneous completion (16ms @ 60fps)
```

---

## ✨ Features

### 1. Interactive Noise Parameters
- **Amplitude**: Noise intensity control (0-4)
- **Saturation**: Color saturation adjustment (0-2)
- **Lacunarity**: Frequency multiplier (0.7-3.9)
- **Grain**: Inter-octave amplitude decay (0.35-0.95)
- **Warp Strength**: Domain warping intensity (0-2)

### 2. Multi-Color Gradient System
- Support for up to 4 color stops
- Real-time color picker and HEX code input
- Drag-and-drop color reordering
- Percentage-based gradient control

### 3. Dual Rendering Mode
- **2D Canvas**: Native WebGL rendering
- **3D Model**: Shader application to Three.js + GLTF uniform model

### 4. Webcam Integration (3D Mode)
- Real-time webcam background
- Transparent background 3D rendering
- AR-style uniform preview

### 5. Archive & Export
- Supabase database integration
- Custom uniform saving
- PNG image export (Canvas API)

---

## 🎬 Demo

*(Insert project execution GIF/video)*

### Screenshot Examples

```bash
# Demo image paths
/public/assets/demo/
├── 2d-mode.gif
├── 3d-mode.gif
├── color-control.gif
└── webcam-integration.gif
```

---

## 📁 Project Structure

```
a2f-project/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page (Studio)
│   ├── studio/page.tsx           # Studio page
│   ├── archive/page.tsx          # Archive page
│   ├── explore/page.tsx          # Explore page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── NoiseGradientCanvas.tsx   # 2D WebGL canvas (Core)
│   ├── UniformRenderer.tsx       # 3D Three.js renderer (Core)
│   ├── ControlPanel.tsx          # Parameter control UI
│   ├── PlayerCard.tsx            # Player card
│   ├── Navigation.tsx            # Navigation bar
│   ├── AboutButton.tsx           # About button
│   └── ScreenSaver.tsx           # Screen saver
│
├── lib/                          # Utilities and types
│   ├── shaders.ts                # GLSL shaders for Three.js
│   ├── types.ts                  # TypeScript type definitions
│   ├── designTokens.ts           # Design system tokens
│   ├── supabase.ts               # Supabase client
│   ├── playerData.ts             # Player data
│   └── koreanNameMapping.ts      # Korean name mapping
│
├── public/                       # Static resources
│   ├── assets/
│   │   └── models/
│   │       └── jersey_tigres/    # 3D uniform model (GLTF)
│   └── ...
│
├── scripts/                      # Database scripts
│   ├── create-archives.ts        # Archive creation
│   ├── seed-players.ts           # Player seeding
│   └── add_heatmap_columns.sql   # DB schema update
│
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependency management
└── README.md                     # Project documentation
```

### Core File Roles

| File | Role |
|------|------|
| [components/NoiseGradientCanvas.tsx](components/NoiseGradientCanvas.tsx) | WebGL context creation, shader compilation, 2D rendering |
| [components/UniformRenderer.tsx](components/UniformRenderer.tsx) | Three.js scene composition, 3D model loading, shader material application |
| [lib/shaders.ts](lib/shaders.ts) | Vertex/Fragment shader source code |
| [lib/types.ts](lib/types.ts) | Core types like NoiseParams, ColorStop |
| [app/page.tsx](app/page.tsx) | Main UI layout, state management, Supabase integration |

---

## 🛠 Tech Stack

### Frontend Core
- **[Next.js 15.5.5](https://nextjs.org/)**: React framework (App Router)
- **[React 19.1.0](https://react.dev/)**: UI library
- **[TypeScript 5.x](https://www.typescriptlang.org/)**: Static type system

### 3D & Graphics
- **[Three.js 0.180.0](https://threejs.org/)**: WebGL abstraction library
- **[@react-three/fiber 9.4.0](https://docs.pmnd.rs/react-three-fiber/)**: React renderer for Three.js
- **[@react-three/drei 10.7.6](https://github.com/pmndrs/drei)**: Three.js helper components
- **WebGL/GLSL**: GPU shader programming

### Backend & Database
- **[Supabase](https://supabase.com/)**: PostgreSQL-based BaaS
- **[@supabase/supabase-js 2.76.1](https://github.com/supabase/supabase-js)**: Supabase client

### Styling & UI
- **[Tailwind CSS 4.x](https://tailwindcss.com/)**: Utility-first CSS framework
- **Custom Design Tokens**: Design system

### Additional Libraries
- **[react-webcam 7.2.0](https://github.com/mozmorris/react-webcam)**: Webcam integration
- **[webscreensaver 1.0.6](https://github.com/brianreavis/webscreensaver)**: Screen saver

### Development Tools
- **ESLint 9.x**: Code linting
- **PostCSS**: CSS preprocessing

---

## 🚀 Installation

### Requirements

- **Node.js**: 20.x or higher
- **npm / pnpm / yarn**: Latest version
- **WebGL-supported browser**: Chrome, Firefox, Safari (latest versions)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/a2f-project.git
cd a2f-project
```

### 2. Install Dependencies

```bash
# npm
npm install

# pnpm (recommended)
pnpm install

# yarn
yarn install
```

### 3. Configure Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Access [http://localhost:3000](http://localhost:3000) in browser

### 5. Production Build

```bash
npm run build
npm start
```

---

## 📖 Usage

### Basic Workflow

1. **Adjust Parameters**: Change noise parameters with sliders in the left Control Panel
2. **Customize Colors**: Add/remove/reorder colors in the Color Control section
3. **Switch View Mode**: Toggle between 2D/3D rendering with mode buttons
4. **Save/Export**: Archive Uniform (DB save) or Export Uniform (PNG download)

### Modifying Shader Code

#### Modifying 2D WebGL Shader

Edit `fragmentShaderSource` in [components/NoiseGradientCanvas.tsx](components/NoiseGradientCanvas.tsx):

```glsl
// Example: Change noise scale
float n = fbm(finalPos * 1.5, u_layers);  // Changed from 0.8 → 1.5
```

#### Modifying 3D Three.js Shader

Edit `noiseFragmentShader` in [lib/shaders.ts](lib/shaders.ts):

```glsl
// Example: Change lighting intensity
float diffuse = 0.6 + d * 0.4;  // Brighter: changed from 0.4 + d * 0.6
```

**Note**: Browser refresh required after shader modifications

### WebGL Context Considerations

- **Context Loss**: WebGL context may be lost when switching to background on mobile
- **Memory Limits**: High-resolution textures may exceed GPU memory
- **Browser Compatibility**: Safari has limited WebGL 2.0 feature support

---

## 🔬 Core Logic Analysis

### 1. NoiseGradientCanvas.tsx - WebGL Initialization

```typescript
useEffect(() => {
  const canvas = canvasRef.current;
  const gl = canvas.getContext('webgl', {
    preserveDrawingBuffer: true,  // Support canvas.toDataURL()
    antialias: true,               // Edge smoothing
    alpha: false                   // Disable transparent background
  });

  // 1. Compile Vertex Shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  // 2. Compile Fragment Shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  // 3. Link Program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // 4. Create Vertex Buffer (full-screen quad)
  const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // 5. Pass Uniforms and Render
  gl.uniform1f(gl.getUniformLocation(program, 'u_amplitude'), params.amplitude);
  // ... other uniforms
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}, []);
```

### 2. UniformRenderer.tsx - Three.js Shader Material

```typescript
const material = new THREE.ShaderMaterial({
  uniforms: {
    u_amplitude: { value: params.amplitude },
    u_colorStopCount: { value: params.colorStops.length },
    u_colorPositions: { value: positions },
    u_colorValues: { value: colorValues },
    cameraPosition: { value: camera.position },
  },
  vertexShader: noiseVertexShader,
  fragmentShader: noiseFragmentShader,
  side: THREE.DoubleSide,  // Double-sided rendering
});

// Apply shader to all meshes in GLTF model
scene.traverse((child) => {
  if (child.isMesh) {
    child.material = material;
    child.castShadow = true;
    child.receiveShadow = true;
  }
});
```

### 3. Real-time Parameter Updates

```typescript
// Update uniforms with React Hook
useEffect(() => {
  if (!materialRef.current) return;

  materialRef.current.uniforms.u_amplitude.value = params.amplitude;
  materialRef.current.uniforms.u_saturation.value = params.saturation;
  // ... other uniform updates

  // Update color stops
  const colorValues = params.colorStops.map(stop => {
    const hex = stop.color.replace('#', '');
    return new THREE.Vector3(
      parseInt(hex.substring(0, 2), 16) / 255,
      parseInt(hex.substring(2, 4), 16) / 255,
      parseInt(hex.substring(4, 6), 16) / 255
    );
  });

  materialRef.current.uniforms.u_colorValues.value = colorValues;
}, [params]);
```

### 4. Canvas Export (PNG)

```typescript
const handleDownload = () => {
  const canvas = document.querySelector('canvas');
  const dataURL = canvas.toDataURL('image/png');  // WebGL → Base64

  const link = document.createElement('a');
  link.download = `a2f-${viewMode}-${timestamp}.png`;
  link.href = dataURL;
  link.click();
};
```

---

## 🏗 Architecture

### Overall System Diagram

```
┌─────────────────────────────────────────────────┐
│          Next.js App Router (SSR/CSR)           │
├─────────────────────────────────────────────────┤
│  app/page.tsx                                   │
│  ├─ useState<NoiseParams>     ← State mgmt     │
│  ├─ ControlPanel              ← UI Controls     │
│  ├─ NoiseGradientCanvas (2D)  ← WebGL          │
│  └─ UniformRenderer (3D)       ← Three.js       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              WebGL Layer (GPU)                  │
├─────────────────────────────────────────────────┤
│  Vertex Shader → Rasterizer → Fragment Shader  │
│       ↓                              ↓          │
│  gl_Position                   gl_FragColor     │
│  (vertex transform)            (pixel color)    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│            Three.js Layer (3D)                  │
├─────────────────────────────────────────────────┤
│  Scene → Camera → Renderer                      │
│    ↓                                            │
│  GLTF Model + ShaderMaterial                    │
│    ↓                                            │
│  OrbitControls (interaction)                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          Supabase (PostgreSQL)                  │
├─────────────────────────────────────────────────┤
│  Players Table                                  │
│  ├─ Player Name                                 │
│  ├─ NoiseParams (JSON)                          │
│  └─ Teams/Colors (Normalized)                   │
└─────────────────────────────────────────────────┘
```

### Rendering Pipeline

#### 2D Mode (WebGL)

```
User Input (ControlPanel)
    ↓
React State Update (params)
    ↓
useEffect Hook Trigger
    ↓
gl.uniform1f(...) - Pass Uniforms
    ↓
gl.drawArrays(TRIANGLE_STRIP) - Draw Call
    ↓
GPU: Vertex Shader → Fragment Shader
    ↓
Canvas Pixel Update (60fps)
```

#### 3D Mode (Three.js + WebGL)

```
User Input (ControlPanel)
    ↓
React State Update (params)
    ↓
ShaderMaterial.uniforms Update
    ↓
useFrame Hook (RAF loop)
    ↓
Three.js Renderer.render(scene, camera)
    ↓
WebGL Shader Pipeline
    ↓
Auto-rotation (rotation.y += 0.003)
```

### Next.js SSR/CSR Strategy

```typescript
// Dynamic Import (CSR only)
const UniformRenderer = dynamic(() => import('@/components/UniformRenderer'), {
  ssr: false,  // Three.js is browser-only
  loading: () => <LoadingSpinner />
});
```

---

## ⚡ Performance Optimization

### 1. WebGL Context Reuse

```typescript
const glRef = useRef<WebGLRenderingContext | null>(null);
const programRef = useRef<WebGLProgram | null>(null);

// Create once during initialization
useEffect(() => {
  glRef.current = canvas.getContext('webgl');
  programRef.current = createProgram(...);
}, []);

// Update only uniforms on parameter changes
useEffect(() => {
  gl.uniform1f(...);  // No shader recompilation
}, [params]);
```

### 2. Three.js Memory Management

```typescript
useEffect(() => {
  return () => {
    // Cleanup: Prevent memory leaks
    material.dispose();
    geometry.dispose();
    texture.dispose();
  };
}, []);
```

### 3. requestAnimationFrame vs useFrame

```typescript
// ❌ Inefficient: Manual RAF
useEffect(() => {
  const animate = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
}, []);

// ✅ Efficient: React Three Fiber's useFrame
useFrame(() => {
  meshRef.current.rotation.y += 0.003;  // Synced with Three.js render loop
});
```

### 4. Shader Optimization

```glsl
// ❌ Inefficient: Conditional inside loop
for(int i = 0; i < 10; i++) {
  if(i < u_colorStopCount) {
    // ...
  }
}

// ✅ Efficient: Early exit
for(int i = 0; i < 10; i++) {
  if(i >= u_colorStopCount) break;
  // ...
}
```

### 5. Mobile Optimization

- **Resolution Scaling**: `gl.canvas.width = window.innerWidth * 0.8` (mobile)
- **Reduce Octaves**: `layers: 3` on mobile (desktop uses `4`)
- **Texture Compression**: Apply Draco compression to GLTF models

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy Project
vercel

# 3. Production Deployment
vercel --prod
```

### Environment Variable Setup (Vercel Dashboard)

```
Settings → Environment Variables:
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
```

### Asset Path Optimization

`next.config.ts`:

```typescript
const nextConfig = {
  images: {
    unoptimized: true,  // Required for static export
  },
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};
```

---

## 🔐 Environment Variables

### `.env.local` (Local Development)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# (Optional) Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Supabase Table Schema

```sql
-- Players Table (see scripts/add_heatmap_columns.sql)
CREATE TABLE "Players" (
  id SERIAL PRIMARY KEY,
  "Player Name" TEXT,
  "Position" TEXT,
  "Saturation" NUMERIC,
  "Amplitude" NUMERIC,
  "Lacunarity" NUMERIC,
  "Grain" NUMERIC,
  "Warp Strength" NUMERIC,
  "Teams/0/Color" TEXT,
  "Teams/0/Percentage" TEXT,
  -- ... (up to Teams/8)
);
```

---

## 🤝 Contributing

### Contribution Guidelines

1. **Fork** the repository
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit**: `git commit -m "Add amazing feature"`
4. **Push**: `git push origin feature/amazing-feature`
5. **Create Pull Request**

### Code Style

- **TypeScript**: Follow ESLint rules
- **Commit Messages**: [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation changes
  - `style:` Code formatting
  - `refactor:` Refactoring
  - `test:` Add tests
  - `chore:` Build/config changes

### Issue Reporting

- **Bugs**: Reproduction steps, browser/OS info, screenshots
- **Feature Requests**: Detailed description, use cases, mockup images

---

## 📄 License

This project is distributed under the **MIT License**.

```
MIT License

Copyright (c) 2025 A2F Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📚 References

### Papers and Documentation
- [Simplex Noise (Ken Perlin, 2001)](https://www.csee.umbc.edu/~olano/s2002c36/ch02.pdf)
- [WebGL Specification](https://www.khronos.org/webgl/)
- [Three.js Documentation](https://threejs.org/docs/)

### Related Projects
- [Shadertoy](https://www.shadertoy.com/) - WebGL shader playground
- [The Book of Shaders](https://thebookofshaders.com/) - GLSL learning resource
- [React Three Fiber Examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)

---

## 🙏 Acknowledgments

- **Ken Perlin**: Simplex Noise algorithm
- **Three.js Team**: Powerful 3D library
- **Vercel**: Next.js framework and hosting
- **Supabase**: Open-source Firebase alternative

---

**Made with ❤️ by A2F Team**

[GitHub](https://github.com/your-repo) | [Demo](https://a2f-project.vercel.app) | [Issues](https://github.com/your-repo/issues)
