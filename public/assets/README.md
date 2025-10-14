# Assets 폴더 구조

이 폴더는 A2F 프로젝트의 모든 정적 에셋을 관리합니다.

## 📁 폴더 구조

```
assets/
├── models/     # 3D 모델 파일 (.glb, .gltf)
├── images/     # 이미지 파일 (.png, .jpg, .svg)
├── fonts/      # 커스텀 폰트 파일
└── data/       # JSON 데이터 파일
```

## 🎨 Models (`/models`)

**용도**: 3D 유니폼 모델 및 기타 3D 에셋

**권장 파일명**:
- `jersey.glb` - 기본 축구 유니폼 모델
- `jersey_[team].glb` - 팀별 유니폼 모델
- `player_avatar_[name].glb` - 선수별 아바타

**파일 형식**: `.glb` (권장) 또는 `.gltf`

**최적화 팁**:
- Draco 압축 사용
- 텍스처 크기: 1024x1024 이하
- 폴리곤 수: 10,000 이하 권장

## 🖼️ Images (`/images`)

**용도**: 로고, 아이콘, 배경 이미지

**권장 구조**:
```
images/
├── logos/          # A2F 로고, 클럽 로고
├── players/        # 선수 사진
├── backgrounds/    # 배경 이미지
└── icons/          # UI 아이콘
```

**최적화**:
- WebP 형식 권장
- Next.js Image 컴포넌트 사용

## 🔤 Fonts (`/fonts`)

**용도**: 커스텀 웹 폰트

**지원 형식**: `.woff2`, `.woff`, `.ttf`

**사용 방법**:
```css
/* app/globals.css */
@font-face {
  font-family: 'CustomFont';
  src: url('/assets/fonts/custom-font.woff2') format('woff2');
}
```

## 📊 Data (`/data`)

**용도**: 선수 데이터, 설정 파일

**권장 파일**:
- `players.json` - 전체 선수 데이터
- `clubs.json` - 클럽 정보 및 색상
- `translations.json` - 다국어 번역

**예시**:
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

## 📝 사용 예시

### 3D 모델 로드
```tsx
<UniformRenderer modelPath="/assets/models/jersey.glb" />
```

### 이미지 사용
```tsx
<Image
  src="/assets/images/logos/a2f-logo.png"
  alt="A2F Logo"
  width={200}
  height={200}
/>
```

### 데이터 불러오기
```ts
const players = await fetch('/assets/data/players.json').then(r => r.json());
```

## 🚀 다음 단계

1. **3D 모델 추가**: `models/jersey.glb` 파일 업로드
2. **로고 추가**: A2F 로고 및 클럽 로고
3. **선수 사진**: 고해상도 선수 이미지
4. **데이터 파일**: 확장된 선수 데이터베이스
