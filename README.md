# 인원체크 시스템 (Beta Classroom Monitor)

교실 학생들의 이동 현황을 실시간으로 추적하고 관리하는 웹 애플리케이션입니다.

## 주요 기능

- 📊 **좌석 배치도**: 학생들의 좌석을 시각적으로 표시
- 📍 **이동 현황 추적**: 학생들의 이동 위치를 실시간으로 기록 및 관리
- ⏰ **시간표 연동**: 현재 시간표 슬롯과 진행률 표시
- 🖼️ **갤러리**: 교실 사진을 자동으로 순환 표시
- 💾 **로컬 저장소**: 이동 기록을 브라우저 로컬 스토리지에 자동 저장

## 기술 스택

- **React 18** - UI 프레임워크
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **CSS3** - 스타일링

## 개발 환경 설정

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173/check/)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기 (http://localhost:4173/check/)
npm run preview
```

**⚠️ 중요**: 
- 빌드된 `dist/index.html` 파일을 직접 열면 작동하지 않습니다 (경로 문제)
- 반드시 `npm run preview` 명령어를 사용하여 미리보기를 확인하세요
- 또는 Cloudflare Pages에 배포하여 실제 환경에서 테스트하세요

## Cloudflare Pages 배포

### 방법 1: Cloudflare 대시보드에서 배포 (권장)

1. [Cloudflare Pages](https://pages.cloudflare.com/)에 로그인
2. "Create a project" 클릭
3. GitHub 저장소 연결 또는 직접 업로드
4. 빌드 설정:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (비워두기)
   - **Node version**: `20`
5. "Save and Deploy" 클릭

### 방법 2: GitHub Actions를 통한 자동 배포

1. Cloudflare API 토큰 생성:
   - [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)에서 API 토큰 생성
   - 권한: `Account` > `Cloudflare Pages` > `Edit`

2. GitHub Secrets 설정:
   - 저장소 Settings > Secrets and variables > Actions
   - 다음 Secrets 추가:
     - `CLOUDFLARE_API_TOKEN`: Cloudflare API 토큰
     - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID

3. GitHub에 푸시하면 자동으로 배포됩니다.

### 환경 변수 설정 (선택사항)

Cloudflare Pages 대시보드에서 환경 변수를 설정할 수 있습니다:

- `VITE_TOTAL_STUDENTS`: 전체 학생 수 (기본값: 29)
- `VITE_BANNER_HEADLINE`: 배너 헤드라인 (기본값: "넌 충분히 잘하고 있어.")
- `VITE_BANNER_SUBLINE`: 배너 서브라인 (기본값: "오늘의 응원")
- `VITE_GALLERY_IMAGES`: 갤러리 이미지 경로 (쉼표로 구분)
- `VITE_GALLERY_INTERVAL_MS`: 갤러리 이미지 전환 간격 (밀리초, 기본값: 12000)

## 프로젝트 구조

```
check/
├── src/
│   ├── components/      # React 컴포넌트
│   ├── config/         # 설정 파일 (학생, 시간표, 교실 등)
│   ├── hooks/          # 커스텀 훅
│   ├── types/          # TypeScript 타입 정의
│   └── utils/          # 유틸리티 함수
├── public/              # 정적 파일
├── dist/               # 빌드 결과물
├── vite.config.ts      # Vite 설정
└── package.json        # 프로젝트 의존성
```

## 최적화 사항

- ✅ TypeScript로 타입 안정성 확보
- ✅ React.useCallback을 통한 함수 메모이제이션
- ✅ React.useMemo를 통한 계산 결과 캐싱
- ✅ 코드 스플리팅 (React 벤더 청크 분리)
- ✅ ESBuild를 통한 빠른 빌드
- ✅ 불필요한 소스맵 제거로 빌드 크기 최소화

## 라이선스

Private - 개인 프로젝트
