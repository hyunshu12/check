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

6. **커스텀 도메인 설정**

   **서브도메인으로 배포하는 경우 (예: check.hyunshu.com)**
   - "Custom domains" 섹션에서 `check.hyunshu.com` 추가
   - DNS 설정은 Cloudflare가 자동으로 처리합니다

   **서브디렉토리로 배포하는 경우 (예: hyunshu.com/check) ⭐**
   
   `hyunshu.com/check`에 아무것도 없다면, **가장 간단한 방법**은 Cloudflare Pages에 직접 커스텀 도메인을 추가하는 것입니다!
   
   **방법 1: 직접 커스텀 도메인 추가 (가장 간단) ⭐**
   
   ⚠️ **주의**: `hyunshu.com`이 이미 다른 Cloudflare Pages 프로젝트에 연결되어 있다면 이 방법은 사용할 수 없습니다. 
   오류 메시지: "That domain is already associated with an existing project"
   
   이 경우 **방법 2 (Cloudflare Workers)**를 사용하세요!
   
   `hyunshu.com`에 다른 사이트가 없고 `/check` 경로만 사용한다면:
   
   1. **Cloudflare Pages 프로젝트 배포**
      - 빌드 설정 완료 후 배포
   
   2. **커스텀 도메인 추가**
      - Pages 프로젝트 > **Custom domains** 섹션
      - **Set up a custom domain** 클릭
      - 도메인 입력: `hyunshu.com`
      - Cloudflare가 자동으로 DNS 설정
   
   3. **완료!**
      - `https://hyunshu.com/check`로 접속하면 자동으로 작동합니다
      - `base: '/check/'` 설정 덕분에 `/check` 경로에서 정상 작동
   
   **방법 2: Cloudflare Workers 사용 ⭐ 권장 (도메인이 이미 사용 중인 경우)**
   
   `hyunshu.com`이 이미 다른 Cloudflare Pages 프로젝트에 연결되어 있거나, 루트에 다른 사이트가 있는 경우:
   
   1. **Cloudflare Pages에서 프로젝트 배포**
      - 배포 후 받은 Pages URL 기록 (예: `beta-classroom-monitor.pages.dev`)
   
   2. **Cloudflare Workers 생성**
      - Cloudflare Dashboard > **Workers & Pages** > **Create application** > **Worker**
      - Worker 이름: `hyunshu-routing`
      - "Deploy" 클릭
   
   3. **Worker 코드 작성**
      - 생성된 Worker의 "Edit code" 클릭
      - 다음 코드로 교체 (실제 Pages URL로 변경 필요):
      
      ```javascript
      export default {
        async fetch(request, env) {
          const url = new URL(request.url);
          
          // /check 경로로 시작하는 요청을 Pages로 라우팅
          if (url.pathname.startsWith('/check')) {
            // 실제 Pages 배포 URL로 변경하세요!
            const pagesUrl = 'https://beta-classroom-monitor.pages.dev';
            
            const targetUrl = new URL(request.url);
            targetUrl.hostname = new URL(pagesUrl).hostname;
            targetUrl.pathname = url.pathname; // /check 경로 유지
            
            return fetch(targetUrl, {
              method: request.method,
              headers: request.headers,
              body: request.body,
            });
          }
          
          // /check가 아닌 다른 경로는 기존 사이트로 라우팅
          return fetch(request);
        }
      }
      ```
   
   4. **Worker를 도메인에 연결**
      - Worker 페이지 > **Triggers** 탭
      - **Routes** 섹션 > **Add route**
      - Route: `hyunshu.com/check/*`
      - Zone: `hyunshu.com` 선택
      - **Save** 클릭
   
   **방법 3: Page Rules 사용 (리다이렉트만 가능)**
   
   Page Rules는 프록시가 아닌 리다이렉트만 가능하므로 권장하지 않습니다. 하지만 간단한 리다이렉트가 필요하다면:
   
   1. Cloudflare Dashboard > **Rules** > **Page Rules**
   2. **Create Page Rule** 클릭
   3. URL 패턴: `hyunshu.com/check/*`
   4. 설정: **Forwarding URL** (301 또는 302)
   5. Destination URL: `https://beta-classroom-monitor.pages.dev$1`
   
   ⚠️ **주의**: Page Rules는 리다이렉트만 가능하므로, URL이 변경되어 표시됩니다.
   
   **참고**: 
   - 현재 프로젝트는 `base: '/check/'`로 설정되어 있어, 이미 서브디렉토리 배포를 위한 설정이 완료되어 있습니다.
   - `hyunshu.com`에 다른 사이트가 없다면 **방법 1**이 가장 간단합니다!

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

