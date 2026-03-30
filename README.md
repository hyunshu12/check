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

## Figma MCP 사용

이 프로젝트는 현재 Codex 데스크톱 세션에서 Figma MCP를 사용할 수 있는 상태입니다. 별도의 프로젝트 패키지 설치가 필요한 구조가 아니라, Codex에 연결된 Figma MCP 서버를 통해 디자인 정보를 읽어와 구현하는 방식입니다.

사용할 때는 반드시 **정확한 프레임 또는 레이어 링크**를 복사해서 넘겨주세요. 이 프로젝트는 `React + TypeScript + CSS` 기반이므로, Figma에서 받은 결과를 그대로 Tailwind로 붙이기보다 기존 컴포넌트와 스타일 구조에 맞춰 변환해서 적용하는 것이 좋습니다.

예시 프롬프트:

```text
이 Figma 링크 기준으로 화면을 구현해줘.
기존 React + TypeScript 구조를 유지하고, Tailwind는 쓰지 말고 현재 프로젝트 스타일 방식에 맞춰 적용해줘.
가능하면 기존 컴포넌트를 재사용해줘.
https://www.figma.com/design/...
```

참고:

- 링크는 페이지 전체보다 구현하려는 **정확한 노드**를 가리키는 것이 좋습니다.
- 구현 전에 Figma MCP로 디자인 컨텍스트와 스크린샷을 함께 확인하는 흐름이 가장 안정적입니다.
- 현재 세션에서는 Figma 계정 연결이 확인되었지만, 재시작 후 연결이 끊기면 Codex 전역 설정(`~/.codex/config.toml`)과 Figma 인증 상태를 다시 점검해야 할 수 있습니다.

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

- `VITE_TOTAL_STUDENTS`: 전체 학생 수 (기본값: `students.ts` 명단 인원)
- `VITE_BANNER_HEADLINE`: 배너 헤드라인 (기본값: "넌 충분히 잘하고 있어.")
- `VITE_BANNER_SUBLINE`: 배너 서브라인 (기본값: "오늘의 응원")
- `VITE_GALLERY_IMAGES`: 갤러리 이미지 경로 (쉼표로 구분)
- `VITE_GALLERY_INTERVAL_MS`: 갤러리 이미지 전환 간격 (밀리초, 기본값: 12000)
- `VITE_WEB_VITALS_ENDPOINT`: Core Web Vitals 전송 엔드포인트. 설정하지 않으면 브라우저 콘솔에 기록됩니다.

## 성능 검증

이 프로젝트에는 Lighthouse CI, 번들 크기 예산, 갤러리 이미지 예산, 실사용 Web Vitals 계측이 포함되어 있습니다.

- 전체 성능 검증: `npm run perf:verify`
- 번들 및 이미지 예산 검사: `npm run perf:size`
- Lighthouse CI 수집 및 assertion 검사: `npm run perf:lighthouse:ci`

실사용 Web Vitals는 `src/lib/performance/webVitals.ts`에서 수집합니다.

- 수집 지표: `LCP`, `INP`, `CLS`
- 전송 방식: `VITE_WEB_VITALS_ENDPOINT`가 있으면 `sendBeacon` 우선, 실패 시 `fetch(..., { keepalive: true })`
- 엔드포인트 미설정 시: 브라우저 콘솔 로그와 `window`의 `web-vitals:metric` 커스텀 이벤트로 노출

## 학년 변경 시 명단 업데이트

학년이 바뀌어 학생이 전입/전출되거나 학번이 변경되면 아래 파일만 수정하면 됩니다.

- 대상 파일: `src/config/students.ts`
- 형식: `{ name: '홍길동', hakbun: '1101' }`
- 좌석 배치는 학생 수 기준으로 자동 확장되므로, 별도 좌석 인덱스 수정이 필요하지 않습니다.

선택적으로 `VITE_TOTAL_STUDENTS`를 지정하면 통계의 총원을 강제로 고정할 수 있고, 지정하지 않으면 명단 길이(`students.length`)를 사용합니다.

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
