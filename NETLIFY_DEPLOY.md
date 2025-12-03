# Netlify 배포 가이드

Netlify를 사용하여 `hyunshu.com/check` 경로에 배포하는 방법입니다.

## Netlify의 장점

- ✅ **서브디렉토리 배포가 간단함**: `netlify.toml` 설정만으로 가능
- ✅ **Worker 설정 불필요**: Cloudflare Worker 없이도 서브디렉토리 배포 가능
- ✅ **자동 HTTPS**: SSL 인증서 자동 발급
- ✅ **간단한 설정**: `netlify.toml` 파일 하나로 모든 설정 가능
- ✅ **무료 플랜 제공**: 개인 프로젝트에 충분한 무료 플랜

## 사전 준비

1. **Netlify 계정**: [Netlify](https://www.netlify.com/)에서 무료 계정 생성
2. **GitHub 저장소**: 프로젝트가 GitHub에 푸시되어 있어야 함

## 배포 방법

### 방법 1: Netlify 대시보드에서 배포 (권장)

#### 1단계: 프로젝트 생성

1. [Netlify Dashboard](https://app.netlify.com/) 접속
2. **Add new site** > **Import an existing project** 클릭
3. **GitHub** 선택 및 인증
4. 저장소 선택: `hyunshu12/check`

#### 2단계: 빌드 설정

Netlify가 자동으로 설정을 감지하지만, 수동으로 확인:

```
Build command: npm run build
Publish directory: dist
```

또는 `netlify.toml` 파일이 있으면 자동으로 읽습니다.

#### 3단계: 환경 변수 설정 (선택사항)

**Site settings** > **Environment variables**에서 설정:

- `VITE_TOTAL_STUDENTS`: `29`
- `VITE_BANNER_HEADLINE`: `넌 충분히 잘하고 있어.`
- `VITE_BANNER_SUBLINE`: `오늘의 응원`
- `VITE_GALLERY_INTERVAL_MS`: `12000`

#### 4단계: 배포

1. **Deploy site** 클릭
2. 빌드 완료 대기
3. 배포 완료 후 사이트 URL 확인 (예: `https://random-name-123.netlify.app`)

#### 5단계: 커스텀 도메인 설정

**Domain settings** > **Custom domains**:

1. **Add custom domain** 클릭
2. 도메인 입력: `hyunshu.com`
3. **Verify** 클릭
4. DNS 설정 안내에 따라 DNS 레코드 추가:
   - 타입: `A` 또는 `CNAME`
   - 값: Netlify가 제공하는 IP 주소 또는 도메인

#### 6단계: 서브디렉토리 경로 설정

**Domain settings** > **Domain management**:

1. **Add subdomain** 또는 **Split paths** 선택
2. 경로 설정: `/check`
3. 또는 `netlify.toml`의 리다이렉트 설정 사용

### 방법 2: Netlify CLI 사용

#### 1단계: Netlify CLI 설치

```bash
npm install -g netlify-cli
```

#### 2단계: 로그인

```bash
netlify login
```

#### 3단계: 사이트 초기화

```bash
netlify init
```

#### 4단계: 배포

```bash
netlify deploy --prod
```

## 서브디렉토리 배포 설정

### netlify.toml 설정

프로젝트 루트에 `netlify.toml` 파일이 있으면 자동으로 적용됩니다:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/check/*"
  to = "/check/index.html"
  status = 200
```

### _redirects 파일

`public/_redirects` 파일도 사용 가능:

```
/check/*    /check/index.html   200
```

## hyunshu.com/check로 배포하기

### 옵션 1: Netlify Split Paths 사용

1. **Domain settings** > **Domain management**
2. **Split paths** 선택
3. 경로별로 다른 사이트 연결:
   - `/check` → check 프로젝트
   - `/portfolio` → portfolio 프로젝트
   - `/` → 기본 사이트

### 옵션 2: Netlify Redirects 사용

`netlify.toml`에서 리다이렉트 설정:

```toml
[[redirects]]
  from = "/check/*"
  to = "https://check-project.netlify.app/:splat"
  status = 200
  force = true
```

### 옵션 3: 단일 프로젝트로 배포 (권장)

현재 프로젝트를 `hyunshu.com/check` 경로에 배포:

1. **Domain settings** > **Custom domains** > `hyunshu.com` 추가
2. `netlify.toml`의 리다이렉트 설정 사용
3. `base: '/check/'` 설정으로 빌드

## Cloudflare와 비교

| 기능 | Netlify | Cloudflare Pages |
|------|---------|------------------|
| 서브디렉토리 배포 | ✅ 간단 (`netlify.toml`) | ⚠️ Worker 필요 |
| 설정 난이도 | ⭐ 쉬움 | ⭐⭐⭐ 어려움 |
| 무료 플랜 | ✅ 100GB 대역폭 | ✅ 무제한 |
| 빌드 시간 | ✅ 300분/월 | ✅ 무제한 |
| 배포 속도 | ✅ 빠름 | ✅ 매우 빠름 |

## 권장 사항

**Netlify를 사용하는 것이 좋습니다:**

1. ✅ **서브디렉토리 배포가 훨씬 간단함**
2. ✅ **Worker 설정 불필요**
3. ✅ **설정 파일 하나로 해결**
4. ✅ **개인 프로젝트에 충분한 무료 플랜**

## 다음 단계

1. `netlify.toml` 파일 확인 (이미 생성됨)
2. Netlify에 프로젝트 연결
3. 배포 및 도메인 설정
4. 완료!

## 참고 자료

- [Netlify 문서](https://docs.netlify.com/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)
- [Netlify Split Paths](https://docs.netlify.com/routing/split-testing/)

