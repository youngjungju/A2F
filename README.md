# A2F (Archive to Football)

한국 축구선수들의 해외 커리어를 시각적 아이덴티티로 재구성하는 인터랙티브 웹 프로젝트

## 🎯 프로젝트 개요

A2F는 선수들의 클럽 이력을 바탕으로 노이즈 그라디언트를 생성하고, 이를 3D 유니폼에 적용하여 데이터를 시각적으로 표현하는 프로젝트입니다.

## ✨ 주요 기능

- **홈페이지**: 프로젝트 소개 및 인터랙티브 그라디언트 배경
- **선수 프로필**: 선수별 데이터 시각화 및 3D 유니폼 프리뷰
- **인터랙티브 스튜디오**: 실시간 노이즈 그라디언트 편집기
- **갤러리**: 모든 선수들의 시각화 결과 모음

## 🛠 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **스타일링**: Tailwind CSS
- **3D 렌더링**: Three.js + React Three Fiber + Drei
- **언어**: TypeScript
- **WebGL**: 커스텀 셰이더 (GLSL)

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어주세요.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
a2f-project/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 홈페이지
│   ├── player/[id]/       # 선수 프로필 페이지
│   ├── studio/            # 인터랙티브 스튜디오
│   └── gallery/           # 갤러리
├── components/            # React 컴포넌트
│   ├── UniformRenderer.tsx
│   ├── NoiseGradientCanvas.tsx
│   └── ControlPanel.tsx
└── lib/                   # 유틸리티 및 데이터
    ├── types.ts
    ├── shaders.ts
    └── playerData.ts
```

## 🎯 향후 계획

- 더 많은 선수 데이터 추가
- 결과물 다운로드 기능
- 다국어 지원 (한국어/영어)
- 모바일 최적화

---

**© 2025 A2F Project**
