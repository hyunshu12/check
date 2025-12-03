# Cloudflare Pages 배포 가이드

이 문서는 인원체크 시스템을 Cloudflare Pages에 배포하는 방법을 설명합니다.

## 사전 준비

1. **Cloudflare 계정**: [Cloudflare](https://dash.cloudflare.com/sign-up)에서 무료 계정 생성
2. **GitHub 저장소**: 프로젝트를 GitHub에 푸시

## 배포 방법

### 방법 1: Cloudflare 대시보드에서 직접 배포 (가장 간단)

#### 단계별 가이드

1. **Cloudflare Pages 접속**
   - [Cloudflare Pages](https://pages.cloudflare.com/)에 로그인
   - "Create a project" 버튼 클릭

2. **저장소 연결**
   - "Connect to Git" 선택
   - GitHub 인증 및 저장소 선택
   - 또는 "Upload assets"로 직접 업로드

3. **빌드 설정**
   ```
   Project name: beta-classroom-monitor
   Production branch: main
   
   Build settings:
   - Framework preset: Vite
   - Build command: npm run build
   - Build output directory: dist
   - Root directory: (비워두기)
   - Node version: 20
   ```

4. **환경 변수 설정 (선택사항)**
   - "Environment variables" 섹션에서 설정:
     ```
     VITE_TOTAL_STUDENTS=29
     VITE_BANNER_HEADLINE=넌 충분히 잘하고 있어.
     VITE_BANNER_SUBLINE=오늘의 응원
     VITE_GALLERY_INTERVAL_MS=12000
     ```

5. **배포 시작**
   - "Save and Deploy" 클릭
   - 빌드 완료 후 자동으로 배포됩니다

6. **커스텀 도메인 설정 (선택사항)**
   - "Custom domains" 섹션에서 도메인 추가
   - DNS 설정은 Cloudflare가 자동으로 처리합니다

### 방법 2: GitHub Actions를 통한 자동 배포

#### 1단계: Cloudflare API 토큰 생성

1. [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) 접속
2. "Create Token" 클릭
3. "Edit Cloudflare Workers" 템플릿 선택 또는 수동 설정:
   - 권한:
     - Account > Cloudflare Pages > Edit
   - 계정 리소스:
     - 특정 계정 선택
4. 토큰 생성 후 복사 (한 번만 표시됩니다!)

#### 2단계: GitHub Secrets 설정

1. GitHub 저장소로 이동
2. Settings > Secrets and variables > Actions
3. "New repository secret" 클릭하여 다음 추가:

   **Secret 1: CLOUDFLARE_API_TOKEN**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 위에서 생성한 API 토큰

   **Secret 2: CLOUDFLARE_ACCOUNT_ID**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: Cloudflare 대시보드 오른쪽 사이드바에서 확인 가능

#### 3단계: 자동 배포 활성화

1. `main` 브랜치에 코드 푸시
2. GitHub Actions가 자동으로 실행됩니다
3. Actions 탭에서 배포 상태 확인

## 배포 후 확인

1. **배포 URL 확인**
   - Cloudflare Pages 대시보드에서 배포 URL 확인
   - 형식: `https://beta-classroom-monitor.pages.dev`

2. **기능 테스트**
   - 좌석 클릭 및 이동 기록
   - 로컬 스토리지 저장 확인
   - 갤러리 이미지 표시 확인

3. **성능 확인**
   - Lighthouse로 성능 점수 확인
   - 네트워크 탭에서 리소스 로딩 확인

## 문제 해결

### 빌드 실패

- **Node 버전 확인**: Node.js 18 이상 필요
- **의존성 확인**: `npm ci` 실행 후 재빌드
- **빌드 로그 확인**: Cloudflare 대시보드에서 상세 로그 확인

### 배포 후 404 에러

- `_redirects` 파일이 `dist` 폴더에 포함되었는지 확인
- Cloudflare Pages 설정에서 "Single Page Application" 옵션 활성화

### 이미지가 표시되지 않음

- `public/images/` 폴더의 이미지가 빌드에 포함되었는지 확인
- 이미지 경로가 올바른지 확인 (`/check/images/...`)

## 업데이트 배포

### 자동 배포 (GitHub Actions 사용 시)
- `main` 브랜치에 푸시하면 자동 배포

### 수동 배포
- Cloudflare Pages 대시보드에서 "Retry deployment" 클릭
- 또는 새 커밋 푸시

## 추가 리소스

- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)

