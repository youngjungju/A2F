# A2F (Allegiance to Fashion)

축구 선수의 커리어를 유니폼 패턴으로 시각화하는 인터랙티브 웹 애플리케이션

## 프로젝트 개요

A2F 프로젝트는 축구 선수들의 해외 커리어를 예술적으로 시각화합니다. 각 선수가 소속했던 팀의 색상과 활동 기간을 바탕으로 독특한 유니폼 디자인을 생성하여, 선수의 커리어를 한눈에 볼 수 있는 "Career Palette"를 제공합니다.

## 주요 기능

### 1. Studio Mode (커스텀 유니폼 제작)
- 사용자가 직접 유니폼 패턴을 디자인할 수 있는 인터랙티브 스튜디오
- 2D/3D 뷰 모드 전환 (실시간 프리뷰)
- 3D 모드에서 웹캠을 활용한 AR 가상 피팅 기능
- 커스텀 디자인을 데이터베이스에 저장 (Archive Uniform)
- PNG 이미지로 내보내기 (Export Uniform)

### 2. Explore Mode (선수 커리어 탐색)
- 실제 축구 선수들의 커리어 데이터 기반 유니폼 패턴 시각화
- 선수 정보 및 커리어 타임라인 표시
- 좌우 화살표를 통한 선수 간 네비게이션
- 선수의 사진과 3D 유니폼의 오버레이 렌더링

### 3. Archive (선수 아카이브)
- 데이터베이스에 저장된 모든 선수 및 커스텀 유니폼 목록
- 선수 이름 검색 기능 (한글/영문 양방향 지원)
- 포지션별 필터링 (FW, MF, DF, GK 등)
- 그리드 레이아웃으로 카드 형식 표시

## 기술 스택

### Frontend Framework
- **Next.js 15.5.5** (App Router, Turbopack)
- **React 19.1.0** (Client Components 중심)
- **TypeScript 5**
- **Tailwind CSS 4**

### 3D Graphics & WebGL

이 프로젝트의 핵심은 WebGL을 활용한 실시간 그래픽 렌더링입니다.

#### Three.js 기반 3D 렌더링
- **Three.js 0.180.0**: WebGL 추상화 라이브러리
- **@react-three/fiber 9.4.0**: React 컴포넌트로 Three.js를 선언적으로 사용
- **@react-three/drei 10.7.6**: 3D 씬 구성을 위한 유용한 헬퍼 컴포넌트

#### WebGL 셰이더 프로그래밍

프로젝트는 커스텀 GLSL 셰이더를 사용하여 독특한 노이즈 기반 패턴을 생성합니다.

##### 1. 2D 렌더링 - Raw WebGL

[NoiseGradientCanvas.tsx](components/NoiseGradientCanvas.tsx)에서 순수 WebGL API를 직접 사용하여 2D 캔버스에 노이즈 패턴을 렌더링합니다.

**Vertex Shader:**
```glsl
attribute vec4 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_position.xy * 0.5 + 0.5;
}
```

**Fragment Shader 핵심 기능:**
- **Simplex Noise**: 자연스러운 패턴 생성을 위한 퍼린 노이즈 구현
- **FBM (Fractal Brownian Motion)**: 여러 옥타브의 노이즈를 레이어링하여 복잡한 패턴 생성
- **Domain Warping**: 노이즈 공간을 왜곡하여 유기적인 흐름 효과
- **Color Gradient System**: 최대 10개의 컬러 스톱을 보간하여 멀티 컬러 그라디언트 생성
- **Halftone Pattern**: 선택적으로 하프톤 도트 패턴 오버레이

**주요 Uniform 파라미터:**
```glsl
uniform float u_amplitude;      // 노이즈 진폭
uniform float u_saturation;     // 색상 채도
uniform int u_layers;           // FBM 레이어 수
uniform float u_lacunarity;     // 주파수 배율
uniform float u_gain;           // 진폭 감쇠
uniform float u_warpStrength;   // 도메인 왜곡 강도
uniform int u_halftonePattern;  // 하프톤 패턴 활성화
uniform float u_halftoneScale;  // 하프톤 스케일
```

**WebGL 초기화 프로세스:**
1. WebGL 컨텍스트 생성 (`getContext('webgl')`)
2. Vertex/Fragment 셰이더 컴파일 및 프로그램 링크
3. 버퍼 생성 및 정점 데이터 바인딩 (전체 화면 사각형)
4. Uniform 변수 설정 및 렌더링 루프

##### 2. 3D 렌더링 - Three.js ShaderMaterial

[UniformRenderer.tsx](components/UniformRenderer.tsx)에서 GLTF 3D 모델(유니폼)에 커스텀 셰이더를 적용합니다.

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

**3D Fragment Shader 추가 기능:**
- 2D 버전과 동일한 노이즈 알고리즘 사용
- **Phong Lighting Model**: 법선 벡터 기반 조명 계산
- **Specular Highlights**: 반사광 하이라이트 추가
- **Camera Position**: 뷰 각도에 따른 동적 조명

**Three.js 씬 구성:**
```typescript
<Canvas
  camera={{ position: [0, 0, 1.5], fov: 45 }}
  gl={{
    antialias: true,
    preserveDrawingBuffer: true,  // 스크린샷 저장을 위해 필요
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
    alpha: transparentBackground,  // AR 모드에서 투명 배경
  }}
>
  {/* 조명 설정 */}
  <ambientLight intensity={0.8} />
  <directionalLight position={[3, 4, 4]} intensity={1.5} castShadow />

  {/* 3D 모델 */}
  <UniformMesh modelPath="/assets/models/jersey_tigres/scene.gltf" />

  {/* 카메라 컨트롤 */}
  <OrbitControls enableDamping dampingFactor={0.08} />
</Canvas>
```

**GLTF 모델 처리:**
1. `useGLTF` 훅으로 3D 모델 로드
2. 원본 텍스처 추출 (필요 시 원본 유니폼 표시)
3. 모든 메쉬를 순회하며 커스텀 ShaderMaterial 적용
4. `useFrame` 훅으로 자동 회전 애니메이션

##### 3. 웹캠 통합 (AR 가상 피팅)

3D 모드에서 웹캠 피드 위에 유니폼을 오버레이하여 가상 피팅 효과를 제공합니다.

```typescript
{/* 레이어 구조 */}
<div style={{ zIndex: 1 }}>  {/* 웹캠 배경 */}
  <Webcam mirrored videoConstraints={{ width: 1920, height: 1080 }} />
</div>
<div style={{ zIndex: 2 }}>  {/* 투명 배경의 3D 유니폼 */}
  <UniformRenderer transparentBackground={true} />
</div>
```

**WebGL Alpha Blending:**
- `gl: { alpha: true }` - 투명 배경 활성화
- Three.js의 투명도 설정으로 웹캠 위에 3D 오브젝트 합성

### WebGL 셰이더 상세 분석

#### Simplex Noise 알고리즘

프로젝트는 Ken Perlin의 Simplex Noise를 GLSL로 구현하여 사용합니다. 이는 Perlin Noise보다 계산이 효율적이며 더 자연스러운 패턴을 생성합니다.

**핵심 함수:**
```glsl
float snoise(vec2 v) {
  // Simplex grid 계산
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  // 그라디언트 벡터 계산
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));

  // 노이즈 값 계산 및 반환
  return 130.0 * dot(m, g);
}
```

#### FBM (Fractal Brownian Motion)

여러 주파수의 노이즈를 합성하여 자연스러운 프랙탈 패턴을 생성합니다.

```glsl
float fbm(vec2 p, int layers) {
  float value = 0.0, amplitude = u_amplitude, frequency = 1.0;
  for(int i = 0; i < 8; i++) {
    if(i >= layers) break;
    value += amplitude * snoise(p * frequency);
    frequency *= u_lacunarity;  // 주파수 증가
    amplitude *= u_gain;         // 진폭 감소
  }
  return value;
}
```

#### Domain Warping

노이즈 공간 자체를 왜곡하여 더 복잡하고 유기적인 패턴을 생성합니다.

```glsl
vec2 w = p + vec2(fbm(p * 0.3, 3), fbm(p * 0.5, 2)) * u_warpStrength;
float n = snoise(w);
```

#### 컬러 그라디언트 시스템

최대 10개의 컬러 스톱을 smoothstep 보간하여 부드러운 멀티 컬러 그라디언트를 생성합니다.

```glsl
vec3 getColorFromScheme(float t) {
  // 현재 노이즈 값이 속한 컬러 세그먼트 찾기
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

#### WebGL 성능 최적화

1. **Shader 최적화**
   - WebGL 1.0 호환성을 위한 루프 언롤링
   - `preserveDrawingBuffer`로 불필요한 재렌더링 방지

2. **동적 업데이트**
   - Uniform 변수만 업데이트하여 리컴파일 방지
   - React useEffect로 파라미터 변경 감지 및 GPU 업로드

3. **메모리 관리**
   - 컴포넌트 언마운트 시 WebGL 리소스 정리 (shader, program, buffer dispose)

### 데이터베이스
- **Supabase** (PostgreSQL)
  - Players 테이블: 선수 정보 및 커리어 데이터
  - 커스텀 유니폼 저장
  - Storage: 선수 이미지 및 로딩 애니메이션

### 기타 라이브러리
- **react-webcam 7.2.0**: 웹캠 통합
- **webscreensaver 1.0.6**: 화면보호기 기능

## 프로젝트 구조

```
a2f-project/
├── app/                          # Next.js App Router 페이지
│   ├── page.tsx                  # Studio Mode (메인 페이지)
│   ├── explore/page.tsx          # Explore Mode (선수 탐색)
│   ├── archive/page.tsx          # Archive (선수 목록)
│   ├── about/page.tsx            # About 페이지
│   └── layout.tsx                # 루트 레이아웃
├── components/                   # React 컴포넌트
│   ├── UniformRenderer.tsx       # 3D 유니폼 렌더러 (Three.js)
│   ├── NoiseGradientCanvas.tsx   # 2D 노이즈 패턴 (Raw WebGL)
│   ├── ControlPanel.tsx          # 패턴 조정 컨트롤 패널
│   ├── PlayerCard.tsx            # 선수 카드 컴포넌트
│   └── Navigation.tsx            # 네비게이션 바
├── lib/                          # 유틸리티 및 타입
│   ├── shaders.ts                # GLSL 셰이더 코드
│   ├── types.ts                  # TypeScript 타입 정의
│   ├── playerData.ts             # 선수 데이터 API
│   ├── supabase.ts               # Supabase 클라이언트
│   ├── koreanNameMapping.ts      # 한글 이름 매핑
│   └── designTokens.ts           # 디자인 토큰
└── public/assets/models/         # 3D 모델 (GLTF)
    └── jersey_tigres/
        └── scene.gltf            # 유니폼 3D 모델
```

## 데이터 구조

### NoiseParams (패턴 생성 파라미터)
```typescript
interface NoiseParams {
  amplitude: number;        // 노이즈 진폭 (0-5)
  saturation: number;       // 색상 채도 (0-1)
  layers: number;           // FBM 레이어 수 (1-8)
  lacunarity: number;       // 주파수 배율 (1-4)
  gain: number;             // 진폭 감쇠 (0-1)
  warpStrength: number;     // 도메인 왜곡 강도 (0-3)
  halftonePattern: number;  // 하프톤 패턴 (0/1)
  halftoneScale: number;    // 하프톤 스케일 (10-100)
  colorStops: ColorStop[];  // 컬러 그라디언트 (최대 10개)
}
```

### PlayerData (선수 정보)
```typescript
interface PlayerData {
  id: string;
  name: string;             // 영문 이름
  nameKo: string;           // 한글 이름
  clubs: Club[];            // 소속 팀 히스토리
  position: string;         // 포지션
  description: string;      // 설명
  // Heatmap Control (커스텀 유니폼용)
  saturation?: number;
  amplitude?: number;
  lacunarity?: number;
  grain?: number;
  warpStrength?: number;
}
```

## 설치 및 실행

### 환경 변수 설정
`.env.local` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 개발 서버 실행
```bash
# 패키지 설치
npm install

# 개발 서버 (Turbopack)
npm run dev

# 빌드
npm run build

# 프로덕션 서버
npm start
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

## 주요 페이지

### 1. Studio Mode (`/`)
- **목적**: 사용자가 직접 유니폼 패턴을 디자인하고 저장
- **기능**:
  - Heatmap Control 패널로 노이즈 파라미터 조정
  - 최대 9개의 컬러 스톱 추가/수정/삭제
  - 2D/3D 뷰 모드 실시간 전환
  - 3D 모드에서 웹캠 활성화 시 AR 가상 피팅
  - "Archive Uniform": 디자인을 데이터베이스에 저장
  - "Export Uniform": PNG 이미지로 다운로드

### 2. Explore Mode (`/explore`)
- **목적**: 실제 선수 커리어를 시각화한 유니폼 감상
- **기능**:
  - 선수별 고유한 Career Palette (팀 색상 기반)
  - 선수 정보 및 커리어 타임라인 표시
  - 좌우 화살표로 이전/다음 선수 탐색
  - 배경에 선수 사진, 전면에 3D 유니폼 오버레이
  - localStorage에 마지막으로 본 선수 저장

### 3. Archive (`/archive`)
- **목적**: 모든 선수 및 커스텀 유니폼 아카이브
- **기능**:
  - 검색: 한글/영문 선수 이름 검색 (음역 지원)
  - 필터: 포지션별 필터링 (All Position, FW, MF, DF, GK, Custom 등)
  - 선수 카드 클릭 시 Explore 페이지로 이동

## 라이선스

이 프로젝트는 개인 프로젝트로, 상업적 사용에 대한 라이선스는 별도 문의 바랍니다.

---

**© 2025 A2F Project**
