# Cloudflare Pages 배포 가이드
## check.hyunshu.com 서브도메인 배포

---

## 개요

이 가이드는 Cloudflare Pages를 사용하여 `check.hyunshu.com` 서브도메인으로 정적 사이트를 배포하는 방법을 설명합니다.

**Cloudflare Pages의 장점:**
- Git 연동으로 자동 배포
- Pull Request마다 프리뷰 배포
- 무료 SSL 인증서
- 글로벌 CDN
- Workers와 통합 가능

---

## 1. 사전 준비사항

### 1.1 Cloudflare 계정 및 도메인 설정
- Cloudflare 계정이 있어야 합니다
- `hyunshu.com` 도메인이 Cloudflare에 등록되어 있어야 합니다
- 도메인의 DNS 설정이 Cloudflare로 관리되고 있어야 합니다

### 1.2 Git 저장소 확인
- 프로젝트가 GitHub, GitLab, Bitbucket 등에 푸시되어 있어야 합니다
- 현재 저장소: `https://github.com/hyunshu12/check.git`

---

## 2. Cloudflare Pages 프로젝트 생성

### Step 1: Cloudflare 대시보드 접속
1. 브라우저에서 [dash.cloudflare.com](https://dash.cloudflare.com) 접속
2. 로그인 후 `hyunshu.com` 도메인 선택 (또는 계정 레벨에서 진행)

### Step 2: Workers & Pages 메뉴로 이동
1. 좌측 사이드바에서 **"Workers & Pages"** 클릭
2. 상단 탭에서 **"Pages"** 선택
3. **"Create a project"** 버튼 클릭

### Step 3: Git 저장소 연결
1. **"Connect to Git"** 버튼 클릭
2. Git 제공업체 선택 (GitHub, GitLab, Bitbucket 등)
3. 권한 승인 (처음인 경우)
4. 저장소 선택: `hyunshu12/check` 선택

### Step 4: 빌드 설정
다음 정보를 입력합니다:

**Project name:**
```
check
```

**Production branch:**
```
main
```

**Build command:**
```
npm run build
```

**Build output directory:**
```
dist
```

**Root directory (optional):**
```
(비워둠)
```

**Environment variables (optional):**
- 필요시 환경 변수 추가 (예: `VITE_API_URL` 등)

### Step 5: 프로젝트 생성 완료
1. **"Save and Deploy"** 버튼 클릭
2. 첫 배포가 시작됩니다 (몇 분 소요)
3. 배포 완료 후 `https://check.pages.dev` 같은 Pages URL이 생성됩니다

---

## 3. 커스텀 도메인 설정 (check.hyunshu.com)

### Step 1: Pages 프로젝트 선택
1. Workers & Pages → Pages 메뉴로 이동
2. **"check"** 프로젝트 클릭

### Step 2: Custom domains 설정
1. 상단 탭에서 **"Custom domains"** 선택
2. **"Set up a custom domain"** 버튼 클릭
3. **"Domain"** 입력란에 `check.hyunshu.com` 입력
4. **"Continue"** 버튼 클릭

### Step 3: DNS 설정 확인
- Cloudflare가 자동으로 CNAME 레코드를 생성합니다
- DNS 메뉴에서 확인:
  - **Type:** CNAME
  - **Name:** check
  - **Target:** `check.pages.dev` (또는 Pages가 제공하는 도메인)
  - **Proxy status:** Proxied (주황색 구름)

### Step 4: SSL/TLS 확인
- SSL/TLS 인증서는 자동으로 발급됩니다
- 몇 분에서 최대 24시간까지 걸릴 수 있습니다
- **SSL/TLS** 메뉴에서 암호화 모드가 "Full" 또는 "Full (strict)"로 설정되어 있는지 확인

---

## 4. 배포 확인

### 4.1 배포 상태 확인
1. Pages 프로젝트 페이지에서 **"Deployments"** 탭 확인
2. 최신 배포가 "Success" 상태인지 확인
3. 배포 로그를 클릭하여 빌드 과정 확인 가능

### 4.2 사이트 접속 확인
1. 브라우저에서 `https://check.hyunshu.com` 접속
2. 사이트가 정상적으로 로드되는지 확인

---

## 5. 자동 배포 설정

### 5.1 Git 푸시 시 자동 배포
- 기본적으로 `main` 브랜치에 푸시하면 자동으로 배포됩니다
- 배포는 Pages 대시보드에서 확인할 수 있습니다

### 5.2 Pull Request 프리뷰 배포
- Pull Request 생성 시 자동으로 프리뷰 URL이 생성됩니다
- PR에 배포 상태가 표시됩니다

### 5.3 배포 브랜치 변경
1. Pages 프로젝트 → **"Settings"** 탭
2. **"Builds & deployments"** 섹션
3. **"Production branch"** 변경 가능

---

## 6. 빌드 설정 상세

### 6.1 Node.js 버전 설정
프로젝트 루트에 `.nvmrc` 파일 생성 (선택사항):

```bash
# .nvmrc
18
```

또는 Pages 대시보드에서:
1. Settings → **"Builds & deployments"**
2. **"Environment variables"** 섹션
3. `NODE_VERSION` 환경 변수 추가: `18` 또는 `20`

### 6.2 빌드 캐시 설정
- Pages는 자동으로 `node_modules`를 캐시합니다
- 빌드 속도 향상을 위해 자동 최적화됩니다

---

## 7. 환경 변수 설정

### 7.1 환경 변수 추가
1. Pages 프로젝트 → **"Settings"** 탭
2. **"Environment variables"** 섹션
3. **"Add variable"** 클릭
4. 변수 이름과 값 입력
5. 환경 선택 (Production, Preview, Development)

### 7.2 예시 환경 변수
```
VITE_API_URL=https://api.example.com
VITE_CLASSROOMS_MAIN=305호,301호,체육관
VITE_CLASSROOMS_EXTRA=보건실,과학실,201호
```

---

## 8. Workers와 Pages 비교

### Cloudflare Workers (현재 방식)
- ✅ 더 세밀한 제어 가능
- ✅ 커스텀 라우팅 로직 가능
- ❌ 수동 배포 필요
- ❌ Git 연동 없음

### Cloudflare Pages (권장)
- ✅ Git 연동 자동 배포
- ✅ Pull Request 프리뷰
- ✅ 빌드 로그 확인
- ✅ 롤백 기능
- ✅ 더 간단한 설정

**권장사항:** 정적 사이트 배포에는 **Cloudflare Pages**를 사용하는 것이 더 편리합니다.

---

## 9. 문제 해결

### 9.1 빌드 실패
1. **배포 로그 확인**
   - Pages 프로젝트 → Deployments → 실패한 배포 클릭
   - 빌드 로그에서 에러 메시지 확인

2. **로컬에서 빌드 테스트**
   ```bash
   npm install
   npm run build
   ```
   로컬에서 빌드가 성공하는지 확인

3. **Node.js 버전 확인**
   - `.nvmrc` 파일 추가 또는 환경 변수 설정

### 9.2 도메인 연결 실패
1. **DNS 레코드 확인**
   - DNS 메뉴에서 CNAME 레코드 확인
   - Proxy 상태가 활성화되어 있는지 확인

2. **SSL 인증서 대기**
   - SSL 인증서 발급에는 시간이 걸릴 수 있습니다
   - 최대 24시간까지 기다려야 할 수 있습니다

### 9.3 사이트가 업데이트되지 않음
1. **배포 상태 확인**
   - Pages 대시보드에서 최신 배포가 완료되었는지 확인

2. **브라우저 캐시 클리어**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

---

## 10. 완료 체크리스트

- [ ] Cloudflare Pages 프로젝트 생성 완료
- [ ] Git 저장소 연결 완료
- [ ] 빌드 설정 완료 (빌드 명령어: `npm run build`, 출력 디렉토리: `dist`)
- [ ] 첫 배포 성공 확인
- [ ] 커스텀 도메인 `check.hyunshu.com` 추가 완료
- [ ] DNS 레코드 확인 완료
- [ ] SSL 인증서 발급 완료
- [ ] `https://check.hyunshu.com` 접속하여 사이트 확인 완료
- [ ] Git 푸시 시 자동 배포 확인 완료

---

## 11. 추가 팁

### 11.1 빌드 시간 단축
- 불필요한 의존성 제거
- `.gitignore`에 `node_modules`, `dist` 등 추가

### 11.2 프리뷰 배포 활용
- 기능 개발 시 브랜치를 만들어 PR 생성
- 프리뷰 URL로 테스트 후 머지

### 11.3 롤백 기능
- Pages 대시보드 → Deployments
- 이전 배포를 클릭하여 **"Retry deployment"** 또는 **"Rollback to this deployment"** 선택

---

## 12. Workers에서 Pages로 마이그레이션

현재 Workers를 사용 중이라면:

1. **Pages 프로젝트 생성** (위 가이드 참조)
2. **커스텀 도메인 연결** (기존 도메인 사용 가능)
3. **Workers 라우트 제거** (선택사항)
   - Workers & Pages → Workers → check Worker
   - Triggers → Routes에서 라우트 제거

**주의:** Pages와 Workers를 동시에 같은 도메인에 연결할 수 없습니다. Pages로 전환하면 Workers 라우트를 제거해야 합니다.

---

**작성일:** 2025-01-03  
**대상:** Cloudflare Pages를 사용한 정적 사이트 배포

