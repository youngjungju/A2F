# A2F Project - WebGL 노이즈 그라데이션 유니폼 디자인 스튜디오

> **WebGL 기반 Simplex Noise + Three.js 3D 렌더링을 결합한 인터랙티브 축구 유니폼 커스터마이징 플랫폼**

![Project Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)
![React](https://img.shields.io/badge/React-19.1.0-61dafb)
![Three.js](https://img.shields.io/badge/Three.js-0.180.0-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

---

## 📖 목차

- [프로젝트 소개](#-프로젝트-소개)
- [WebGL 노이즈 그라데이션이란?](#-webgl-노이즈-그라데이션이란)
- [주요 기능](#-주요-기능)
- [데모](#-데모)
- [프로젝트 구조](#-프로젝트-구조)
- [기술 스택](#-기술-스택)
- [설치 및 실행](#-설치-및-실행)
- [사용 방법](#-사용-방법)
- [핵심 로직 분석](#-핵심-로직-분석)
- [아키텍처](#-아키텍처)
- [성능 최적화](#-성능-최적화)
- [배포](#-배포)
- [환경 변수](#-환경-변수)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

---

## 🎯 프로젝트 소개

**A2F Project**는 WebGL의 GPU 병렬 처리 능력과 Simplex Noise 알고리즘을 활용하여 실시간으로 유기적인 그라데이션 패턴을 생성하고, 이를 Three.js 3D 축구 유니폼 모델에 적용하는 인터랙티브 웹 애플리케이션입니다.

### 프로젝트의 핵심 가치

- **WebGL Shader Programming**: GLSL을 사용한 GPU 기반 실시간 노이즈 생성
- **Three.js 3D Integration**: React Three Fiber를 통한 선언적 3D 렌더링
- **Next.js SSR/CSR**: 서버 사이드 렌더링과 클라이언트 렌더링의 하이브리드 아키텍처
- **Real-time Customization**: 파라미터 변경 시 즉각적인 시각적 피드백

### 사용 사례

- 축구 유니폼 디자인 시뮬레이션
- 제너레이티브 아트 제작
- WebGL/Shader 학습 레퍼런스
- 3D 텍스처 프로시저럴 생성

---

## 🌊 WebGL 노이즈 그라데이션이란?

### WebGL과 GLSL 셰이더 구조

WebGL(Web Graphics Library)은 브라우저에서 GPU를 직접 제어할 수 있는 JavaScript API입니다. 이 프로젝트는 **GLSL(OpenGL Shading Language)**로 작성된 셰이더를 사용하여 픽셀 단위로 병렬 처리를 수행합니다.

```glsl
// Vertex Shader: 정점 변환
attribute vec4 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_position.xy * 0.5 + 0.5;  // [-1,1] → [0,1] UV 좌표 변환
}
```

```glsl
// Fragment Shader: 픽셀 색상 결정
precision highp float;
varying vec2 v_uv;

void main() {
  float noise = snoise(v_uv * 10.0);  // Simplex Noise 생성
  vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
  gl_FragColor = vec4(color, 1.0);
}
```

### Simplex Noise의 수학적 원리

이 프로젝트는 **Ken Perlin**의 개선된 Simplex Noise 알고리즘을 사용합니다.

#### 1. Perlin Noise vs Simplex Noise

| 특성 | Perlin Noise | Simplex Noise |
|------|--------------|---------------|
| 차원 복잡도 | O(2^n) | O(n^2) |
| 시각적 특성 | 격자 아티팩트 존재 | 더 유기적 |
| 계산 효율성 | 낮음 (고차원) | 높음 (모든 차원) |

#### 2. Simplex Noise 알고리즘 구현

```glsl
float snoise(vec2 v) {
  // 1. Skew: (x,y) 좌표를 단체 격자(Simplex Grid)로 변환
  const vec4 C = vec4(0.211324865405187,   // (3-sqrt(3))/6
                      0.366025403784439,   // 0.5*(sqrt(3)-1)
                      -0.577350269189626,  // -1+2*C.x
                      0.024390243902439);  // 1/41

  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  // 2. 단체 내부의 세 정점 찾기
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // 3. 각 정점에서의 그라디언트 계산
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));

  // 4. 거리 기반 감쇠 함수 (Radial Falloff)
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;

  // 5. 그라디언트 벡터와 거리 벡터의 내적
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;

  return 130.0 * dot(m, g);  // 정규화된 노이즈 값 [-1, 1]
}
```

#### 3. Fractional Brownian Motion (fBM)

여러 주파수의 노이즈를 중첩하여 복잡한 유기적 패턴을 생성합니다.

```glsl
float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float totalAmplitude = 0.0;

  for(int i = 0; i < octaves; i++) {
    // 각 옥타브마다 회전 적용 (더 유기적인 패턴)
    float angle = float(i) * 0.5;
    mat2 rot = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    vec2 rotatedP = rot * p;

    value += amplitude * snoise(rotatedP * frequency);
    totalAmplitude += amplitude;

    frequency *= lacunarity;  // 주파수 증가 (기본값: 2.3)
    amplitude *= gain;         // 진폭 감쇠 (기본값: 0.65)
  }

  return value / totalAmplitude;
}
```

**파라미터 설명:**
- `octaves`: 중첩할 노이즈 레이어 수 (detail level)
- `lacunarity`: 각 옥타브의 주파수 배율 (2.0 = 주파수 2배씩 증가)
- `gain`: 각 옥타브의 진폭 감쇠율 (0.5 = 진폭 절반씩 감소)

#### 4. Domain Warping (도메인 왜곡)

노이즈로 UV 좌표 자체를 왜곡하여 더욱 복잡한 패턴을 생성합니다.

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

#### 5. Quintic 보간법

색상 전환을 부드럽게 만들기 위한 5차 보간 함수:

```glsl
float quintic(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);  // 6t^5 - 15t^4 + 10t^3
}
```

그래프:
- 0과 1에서 **1차 미분값 = 0** (부드러운 시작/끝)
- 2차 미분값도 연속 (시각적으로 더 자연스러운 전환)

#### 6. Gradient Mapping (그라데이션 매핑)

노이즈 값 [-1, 1]을 사용자 정의 색상 스킴으로 변환:

```glsl
vec3 getColorFromScheme(float t) {
  t = clamp(t, 0.0, 1.0);

  // 색상 정지점(color stops) 사이 선형 보간
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

#### 7. Dithering (디더링)

색상 밴딩(banding) 제거를 위한 노이즈 추가:

```glsl
float dither(vec2 uv) {
  float noise1 = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  float noise2 = fract(sin(dot(uv, vec2(93.9898, 67.345))) * 43758.5453);
  return (noise1 + noise2) * 0.5 - 0.5;  // 삼각 분포
}

// 적용
float ditherAmount = dither(v_uv * 1000.0) / 255.0;
t = clamp(t + ditherAmount, 0.0, 1.0);
```

### GPU 병렬 처리의 이점

1. **대량 병렬성**: 1920x1080 해상도 = 2,073,600개 픽셀을 **동시에** 계산
2. **실시간 성능**: 60 FPS로 복잡한 노이즈 패턴 생성
3. **CPU 부하 없음**: 메인 스레드는 UI 이벤트 처리에만 집중

```
CPU (순차 처리)       GPU (병렬 처리)
Pixel 1 → Pixel 2     Pixel 1
  ↓                   Pixel 2
Pixel 3 → Pixel 4     Pixel 3
  ↓                   Pixel 4
...                   ...
                      Pixel 2,073,600
                      ↓
                      동시 완료 (16ms @ 60fps)
```

---

## ✨ 주요 기능

### 1. Interactive Noise Parameters
- **Amplitude**: 노이즈 강도 조절 (0-4)
- **Saturation**: 색상 채도 제어 (0-2)
- **Lacunarity**: 주파수 배율 (0.7-3.9)
- **Grain**: 옥타브 간 진폭 감쇠 (0.35-0.95)
- **Warp Strength**: 도메인 왜곡 강도 (0-2)

### 2. Multi-Color Gradient System
- 최대 4개의 색상 정지점 지원
- 실시간 색상 선택 및 HEX 코드 입력
- 드래그앤드롭으로 색상 순서 변경
- 비율 기반 그라데이션 제어

### 3. Dual Rendering Mode
- **2D Canvas**: WebGL 네이티브 렌더링
- **3D Model**: Three.js + GLTF 유니폼 모델에 셰이더 적용

### 4. Webcam Integration (3D 모드)
- 실시간 웹캠 배경
- 투명 배경 3D 렌더링
- AR 스타일 유니폼 프리뷰

### 5. Archive & Export
- Supabase 데이터베이스 연동
- 커스텀 유니폼 저장
- PNG 이미지 내보내기 (Canvas API)

---

## 🎬 데모

*(프로젝트 실행 화면 GIF/비디오 삽입)*

### 스크린샷 예시

```bash
# 데모 이미지 경로
/public/assets/demo/
├── 2d-mode.gif
├── 3d-mode.gif
├── color-control.gif
└── webcam-integration.gif
```

---

## 📁 프로젝트 구조

```
a2f-project/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 홈 페이지 (스튜디오)
│   ├── studio/page.tsx           # 스튜디오 페이지
│   ├── archive/page.tsx          # 아카이브 페이지
│   ├── explore/page.tsx          # 탐색 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   └── globals.css               # 글로벌 스타일
│
├── components/                   # React 컴포넌트
│   ├── NoiseGradientCanvas.tsx   # 2D WebGL 캔버스 (핵심)
│   ├── UniformRenderer.tsx       # 3D Three.js 렌더러 (핵심)
│   ├── ControlPanel.tsx          # 파라미터 제어 UI
│   ├── PlayerCard.tsx            # 플레이어 카드
│   ├── Navigation.tsx            # 내비게이션 바
│   ├── AboutButton.tsx           # About 버튼
│   └── ScreenSaver.tsx           # 스크린세이버
│
├── lib/                          # 유틸리티 및 타입
│   ├── shaders.ts                # Three.js용 GLSL 셰이더
│   ├── types.ts                  # TypeScript 타입 정의
│   ├── designTokens.ts           # 디자인 시스템 토큰
│   ├── supabase.ts               # Supabase 클라이언트
│   ├── playerData.ts             # 플레이어 데이터
│   └── koreanNameMapping.ts      # 한글 이름 매핑
│
├── public/                       # 정적 리소스
│   ├── assets/
│   │   └── models/
│   │       └── jersey_tigres/    # 3D 유니폼 모델 (GLTF)
│   └── ...
│
├── scripts/                      # 데이터베이스 스크립트
│   ├── create-archives.ts        # 아카이브 생성
│   ├── seed-players.ts           # 플레이어 시드
│   └── add_heatmap_columns.sql   # DB 스키마 업데이트
│
├── next.config.ts                # Next.js 설정
├── tsconfig.json                 # TypeScript 설정
├── package.json                  # 의존성 관리
└── README.md                     # 프로젝트 문서
```

### 핵심 파일 역할

| 파일 | 역할 |
|------|------|
| `components/NoiseGradientCanvas.tsx` | WebGL 컨텍스트 생성, 셰이더 컴파일, 2D 렌더링 |
| `components/UniformRenderer.tsx` | Three.js 씬 구성, 3D 모델 로딩, 셰이더 머티리얼 적용 |
| `lib/shaders.ts` | Vertex/Fragment 셰이더 소스 코드 |
| `lib/types.ts` | NoiseParams, ColorStop 등 핵심 타입 |
| `app/page.tsx` | 메인 UI 레이아웃, 상태 관리, Supabase 연동 |

---

## 🛠 기술 스택

### Frontend Core
- **[Next.js 15.5.5](https://nextjs.org/)**: React 프레임워크 (App Router)
- **[React 19.1.0](https://react.dev/)**: UI 라이브러리
- **[TypeScript 5.x](https://www.typescriptlang.org/)**: 정적 타입 시스템

### 3D & Graphics
- **[Three.js 0.180.0](https://threejs.org/)**: WebGL 추상화 라이브러리
- **[@react-three/fiber 9.4.0](https://docs.pmnd.rs/react-three-fiber/)**: React용 Three.js 렌더러
- **[@react-three/drei 10.7.6](https://github.com/pmndrs/drei)**: Three.js 헬퍼 컴포넌트
- **WebGL/GLSL**: GPU 셰이더 프로그래밍

### Backend & Database
- **[Supabase](https://supabase.com/)**: PostgreSQL 기반 BaaS
- **[@supabase/supabase-js 2.76.1](https://github.com/supabase/supabase-js)**: Supabase 클라이언트

### Styling & UI
- **[Tailwind CSS 4.x](https://tailwindcss.com/)**: 유틸리티 CSS 프레임워크
- **Custom Design Tokens**: 디자인 시스템

### Additional Libraries
- **[react-webcam 7.2.0](https://github.com/mozmorris/react-webcam)**: 웹캠 통합
- **[webscreensaver 1.0.6](https://github.com/brianreavis/webscreensaver)**: 스크린세이버

### Development Tools
- **ESLint 9.x**: 코드 린팅
- **PostCSS**: CSS 전처리

---

## 🚀 설치 및 실행

### 요구 사항

- **Node.js**: 20.x 이상
- **npm / pnpm / yarn**: 최신 버전
- **WebGL 지원 브라우저**: Chrome, Firefox, Safari (최신 버전)

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/a2f-project.git
cd a2f-project
```

### 2. 의존성 설치

```bash
# npm
npm install

# pnpm (권장)
pnpm install

# yarn
yarn install
```

### 3. 환경 변수 설정

`.env.local` 파일 생성:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 📖 사용 방법

### 기본 워크플로우

1. **파라미터 조정**: 왼쪽 Control Panel에서 슬라이더로 노이즈 파라미터 변경
2. **색상 커스터마이징**: Color Control 섹션에서 색상 추가/제거/순서 변경
3. **뷰 모드 전환**: 2D/3D 버튼으로 렌더링 모드 변경
4. **저장/내보내기**: Archive Uniform (DB 저장) 또는 Export Uniform (PNG 다운로드)

### 셰이더 코드 수정

#### 2D WebGL 셰이더 수정

`components/NoiseGradientCanvas.tsx` 파일의 `fragmentShaderSource` 수정:

```glsl
// 예: 노이즈 스케일 변경
float n = fbm(finalPos * 1.5, u_layers);  // 0.8 → 1.5로 변경
```

#### 3D Three.js 셰이더 수정

`lib/shaders.ts` 파일의 `noiseFragmentShader` 수정:

```glsl
// 예: 조명 강도 변경
float diffuse = 0.6 + d * 0.4;  // 0.4 + d * 0.6 → 더 밝게
```

**주의**: 셰이더 수정 후 브라우저 새로고침 필요

### WebGL Context 주의사항

- **Context Loss**: 모바일에서 백그라운드 전환 시 WebGL 컨텍스트가 손실될 수 있음
- **메모리 제한**: 고해상도 텍스처 사용 시 GPU 메모리 초과 가능
- **브라우저 호환성**: Safari는 일부 WebGL 2.0 기능 미지원

---

## 🔬 핵심 로직 분석

### 1. NoiseGradientCanvas.tsx - WebGL 초기화

```typescript
useEffect(() => {
  const canvas = canvasRef.current;
  const gl = canvas.getContext('webgl', {
    preserveDrawingBuffer: true,  // canvas.toDataURL() 지원
    antialias: true,               // 엣지 스무딩
    alpha: false                   // 투명 배경 비활성화
  });

  // 1. Vertex Shader 컴파일
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  // 2. Fragment Shader 컴파일
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  // 3. Program 링크
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // 4. Vertex Buffer 생성 (전체 화면 쿼드)
  const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // 5. Uniform 전달 및 렌더링
  gl.uniform1f(gl.getUniformLocation(program, 'u_amplitude'), params.amplitude);
  // ... 기타 uniform
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}, []);
```

### 2. UniformRenderer.tsx - Three.js 셰이더 머티리얼

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
  side: THREE.DoubleSide,  // 양면 렌더링
});

// GLTF 모델의 모든 메시에 셰이더 적용
scene.traverse((child) => {
  if (child.isMesh) {
    child.material = material;
    child.castShadow = true;
    child.receiveShadow = true;
  }
});
```

### 3. 실시간 파라미터 업데이트

```typescript
// React Hook으로 uniform 업데이트
useEffect(() => {
  if (!materialRef.current) return;

  materialRef.current.uniforms.u_amplitude.value = params.amplitude;
  materialRef.current.uniforms.u_saturation.value = params.saturation;
  // ... 기타 uniform 업데이트

  // 색상 정지점 업데이트
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

### 4. Canvas 내보내기 (PNG)

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

## 🏗 아키텍처

### 전체 시스템 다이어그램

```
┌─────────────────────────────────────────────────┐
│          Next.js App Router (SSR/CSR)           │
├─────────────────────────────────────────────────┤
│  app/page.tsx                                   │
│  ├─ useState<NoiseParams>     ← State 관리     │
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
│  (정점 변환)                    (픽셀 색상)      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│            Three.js Layer (3D)                  │
├─────────────────────────────────────────────────┤
│  Scene → Camera → Renderer                      │
│    ↓                                            │
│  GLTF Model + ShaderMaterial                    │
│    ↓                                            │
│  OrbitControls (인터랙션)                        │
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

### 렌더링 파이프라인

#### 2D 모드 (WebGL)

```
User Input (ControlPanel)
    ↓
React State Update (params)
    ↓
useEffect Hook 트리거
    ↓
gl.uniform1f(...) - Uniform 전달
    ↓
gl.drawArrays(TRIANGLE_STRIP) - 드로우 콜
    ↓
GPU: Vertex Shader → Fragment Shader
    ↓
Canvas 픽셀 업데이트 (60fps)
```

#### 3D 모드 (Three.js + WebGL)

```
User Input (ControlPanel)
    ↓
React State Update (params)
    ↓
ShaderMaterial.uniforms 업데이트
    ↓
useFrame Hook (RAF loop)
    ↓
Three.js Renderer.render(scene, camera)
    ↓
WebGL Shader Pipeline
    ↓
Auto-rotation (rotation.y += 0.003)
```

### Next.js SSR/CSR 전략

```typescript
// Dynamic Import (CSR만 실행)
const UniformRenderer = dynamic(() => import('@/components/UniformRenderer'), {
  ssr: false,  // Three.js는 브라우저 전용
  loading: () => <LoadingSpinner />
});
```

---

## ⚡ 성능 최적화

### 1. WebGL Context 재사용

```typescript
const glRef = useRef<WebGLRenderingContext | null>(null);
const programRef = useRef<WebGLProgram | null>(null);

// 초기화 시 한 번만 생성
useEffect(() => {
  glRef.current = canvas.getContext('webgl');
  programRef.current = createProgram(...);
}, []);

// 파라미터 변경 시 uniform만 업데이트
useEffect(() => {
  gl.uniform1f(...);  // 셰이더 재컴파일 없음
}, [params]);
```

### 2. Three.js 메모리 관리

```typescript
useEffect(() => {
  return () => {
    // Cleanup: 메모리 누수 방지
    material.dispose();
    geometry.dispose();
    texture.dispose();
  };
}, []);
```

### 3. requestAnimationFrame vs useFrame

```typescript
// ❌ 비효율적: 수동 RAF
useEffect(() => {
  const animate = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
}, []);

// ✅ 효율적: React Three Fiber의 useFrame
useFrame(() => {
  meshRef.current.rotation.y += 0.003;  // Three.js 렌더 루프와 동기화
});
```

### 4. 셰이더 최적화

```glsl
// ❌ 비효율적: 루프 내부 조건문
for(int i = 0; i < 10; i++) {
  if(i < u_colorStopCount) {
    // ...
  }
}

// ✅ 효율적: Early exit
for(int i = 0; i < 10; i++) {
  if(i >= u_colorStopCount) break;
  // ...
}
```

### 5. 모바일 최적화

- **해상도 스케일링**: `gl.canvas.width = window.innerWidth * 0.8` (모바일)
- **옥타브 감소**: 모바일에서 `layers: 3` (데스크톱은 `4`)
- **텍스처 압축**: GLTF 모델에 Draco 압축 적용

---

## 🌐 배포

### Vercel 배포 (권장)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 프로젝트 배포
vercel

# 3. 프로덕션 배포
vercel --prod
```

### 환경 변수 설정 (Vercel Dashboard)

```
Settings → Environment Variables:
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
```

### Asset 경로 최적화

`next.config.ts`:

```typescript
const nextConfig = {
  images: {
    unoptimized: true,  // 정적 export 시 필요
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

## 🔐 환경 변수

### `.env.local` (로컬 개발)

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# (Optional) Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Supabase 테이블 스키마

```sql
-- Players 테이블 (scripts/add_heatmap_columns.sql 참고)
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
  -- ... (최대 Teams/8까지)
);
```

---

## 🤝 기여하기

### 기여 가이드라인

1. **Fork** 저장소
2. **Feature Branch** 생성: `git checkout -b feature/amazing-feature`
3. **Commit**: `git commit -m "Add amazing feature"`
4. **Push**: `git push origin feature/amazing-feature`
5. **Pull Request** 생성

### 코드 스타일

- **TypeScript**: ESLint 규칙 준수
- **Commit Message**: [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` 새로운 기능
  - `fix:` 버그 수정
  - `docs:` 문서 변경
  - `style:` 코드 포맷팅
  - `refactor:` 리팩토링
  - `test:` 테스트 추가
  - `chore:` 빌드/설정 변경

### 이슈 리포팅

- **버그**: 재현 단계, 브라우저/OS 정보, 스크린샷
- **기능 제안**: 상세한 설명, 사용 사례, 모킹 이미지

---

## 📄 라이선스

이 프로젝트는 **MIT License** 하에 배포됩니다.

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

## 📚 참고 자료

### 논문 및 문서
- [Simplex Noise (Ken Perlin, 2001)](https://www.csee.umbc.edu/~olano/s2002c36/ch02.pdf)
- [WebGL Specification](https://www.khronos.org/webgl/)
- [Three.js Documentation](https://threejs.org/docs/)

### 관련 프로젝트
- [Shadertoy](https://www.shadertoy.com/) - WebGL 셰이더 플레이그라운드
- [The Book of Shaders](https://thebookofshaders.com/) - GLSL 학습 리소스
- [React Three Fiber Examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)

---

## 🙏 감사의 말

- **Ken Perlin**: Simplex Noise 알고리즘
- **Three.js Team**: 강력한 3D 라이브러리
- **Vercel**: Next.js 프레임워크 및 호스팅
- **Supabase**: 오픈소스 Firebase 대안

---

**Made with ❤️ by A2F Team**

[GitHub](https://github.com/your-repo) | [Demo](https://a2f-project.vercel.app) | [Issues](https://github.com/your-repo/issues)
