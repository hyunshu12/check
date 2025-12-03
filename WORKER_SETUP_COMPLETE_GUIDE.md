# Cloudflare Worker 설정 완전 가이드

`hyunshu.com/portfolio`와 `hyunshu.com/check`를 각각 다른 Pages 프로젝트로 라우팅하는 Worker 설정 가이드입니다.

## 목차

1. [사전 준비](#사전-준비)
2. [Worker 생성](#1단계-worker-생성)
3. [Worker 코드 작성](#2단계-worker-코드-작성)
4. [Route 설정](#3단계-route-설정)
5. [확인 및 테스트](#4단계-확인-및-테스트)
6. [문제 해결](#문제-해결)

---

## 사전 준비

### 필요한 정보

1. **Portfolio 프로젝트의 Pages URL**
   - 예: `https://portfolio-abc123.pages.dev`
   - Cloudflare Pages > Portfolio 프로젝트 > 배포 URL 확인

2. **Check 프로젝트의 Pages URL**
   - 예: `https://check-xyz789.pages.dev`
   - Cloudflare Pages > Check 프로젝트 > 배포 URL 확인

3. **도메인 정보**
   - 도메인: `hyunshu.com`
   - Cloudflare에 연결되어 있어야 함

---

## 1단계: Worker 생성

### 1-1. Cloudflare Dashboard 접속

1. 브라우저에서 [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속
2. 로그인 (계정이 없다면 무료 계정 생성)

### 1-2. Workers & Pages 메뉴로 이동

1. 왼쪽 사이드바에서 **Workers & Pages** 클릭
2. 상단에 "Workers & Pages" 메뉴가 표시됨

### 1-3. Worker 생성 방법 선택

**방법 A: Hello World로 시작 (권장) ⭐**

1. **Create application** 버튼 클릭 (우측 상단 또는 중앙)
2. **Worker** 선택 (Pages가 아닌 Worker)
3. **"Create from template"** 또는 **"Create Worker"** 선택
4. **"Hello World"** 템플릿 선택 (기본값)
5. Worker 이름 입력:
   - 예: `hyunshu-routing` 또는 `domain-routing`
   - 이름은 나중에 변경 가능
6. **Deploy** 버튼 클릭
7. 기본 "Hello World" Worker가 생성되고 배포됨

**방법 B: Git으로 시작 (고급)**

1. **Create application** > **Worker**
2. **"Connect to Git"** 선택
3. GitHub 저장소 연결
4. 자동 배포 설정

⚠️ **권장**: 처음 시작할 때는 **방법 A (Hello World)**를 사용하는 것이 더 간단합니다.

### 1-4. Worker 확인

- 생성된 Worker가 목록에 표시됨
- 상태가 "Active"로 표시되어야 함
- 기본 "Hello World" 코드가 들어있을 것입니다

---

## 2단계: Worker 코드 작성

### 2-1. Worker 편집 페이지로 이동

1. 생성된 Worker 이름 클릭
2. Worker 상세 페이지로 이동
3. **Edit code** 버튼 클릭 (또는 **Quick edit**)

### 2-2. 기본 코드 확인

**Hello World 템플릿으로 시작한 경우:**

기본적으로 다음과 같은 코드가 있을 것입니다:

```javascript
export default {
  async fetch(request, env) {
    return new Response("Hello World!");
  }
}
```

또는 더 간단한 버전:

```javascript
export default {
  async fetch(request) {
    return new Response("Hello World!");
  }
}
```

이 코드를 모두 삭제하고 아래 코드로 교체하면 됩니다.

### 2-3. 코드 교체

기본 코드를 모두 삭제하고 아래 코드로 교체하세요:

```javascript
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      
      // /check 경로는 check 프로젝트로 라우팅
      if (url.pathname.startsWith('/check')) {
        // ⚠️ 실제 check 프로젝트의 Pages URL로 변경하세요!
        const checkPagesUrl = 'https://e7b499c2.check-7yv.pages.dev';
        
        const targetUrl = new URL(request.url);
        targetUrl.hostname = new URL(checkPagesUrl).hostname;
        targetUrl.pathname = url.pathname; // /check 경로 유지
        
        return fetch(targetUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
      }
      
      // /portfolio 경로는 portfolio 프로젝트로 라우팅
      if (url.pathname.startsWith('/portfolio')) {
        // ⚠️ 실제 portfolio 프로젝트의 Pages URL로 변경하세요!
        const portfolioPagesUrl = 'https://[portfolio-pages-url].pages.dev';
        
        const targetUrl = new URL(request.url);
        targetUrl.hostname = new URL(portfolioPagesUrl).hostname;
        targetUrl.pathname = url.pathname; // /portfolio 경로 유지
        
        return fetch(targetUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
      }
      
      // 나머지 경로는 기본 사이트로 라우팅
      // (기존 사이트가 있다면 해당 URL로 변경)
      return fetch(request);
    } catch (error) {
      // 에러 발생 시 500 에러 반환
      return new Response('Internal Server Error', {
        status: 500,
        statusText: 'Worker Error',
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  }
}
```

### 2-4. Pages URL 변경

**⚠️ 중요**: 코드에서 다음 부분을 실제 Pages URL로 변경하세요:

1. **Check 프로젝트 URL**
   ```javascript
   const checkPagesUrl = 'https://e7b499c2.check-7yv.pages.dev';
   ```
   → 실제 check 프로젝트의 Pages URL로 변경

2. **Portfolio 프로젝트 URL**
   ```javascript
   const portfolioPagesUrl = 'https://[portfolio-pages-url].pages.dev';
   ```
   → 실제 portfolio 프로젝트의 Pages URL로 변경

### 2-5. 코드 저장 및 배포

1. 코드 입력 후 **Save and deploy** 버튼 클릭
2. 또는 **Ctrl+S** (Windows) / **Cmd+S** (Mac)로 저장
3. 배포가 완료되면 "Deployed" 메시지 표시

---

## 3단계: Route 설정

### 3-1. Route 설정 위치 찾기

Cloudflare의 UI가 변경되었을 수 있습니다. 다음 위치들을 확인하세요:

**방법 1: Worker 상세 페이지에서 찾기**
1. Worker 상세 페이지에서 다음 탭들을 확인:
   - **Triggers** 탭
   - **Routes** 탭
   - **Settings** 탭
   - **Custom domains** 섹션

**방법 2: 상단 메뉴에서 찾기**
1. Worker 상세 페이지 상단 메뉴 확인:
   - **Routes** 메뉴
   - **Triggers** 메뉴
   - **Settings** 메뉴

**방법 3: Worker 편집 페이지에서 찾기**
1. Worker 편집 페이지(Edit code)에서:
   - 우측 사이드바 확인
   - 또는 상단의 **Routes** 또는 **Triggers** 버튼 확인

**방법 4: 직접 URL로 접근**
1. 브라우저 주소창에서 Worker 이름 확인
2. URL 형식: `https://dash.cloudflare.com/[account-id]/workers/services/view/[worker-name]/routes`
3. 또는 `.../triggers` 경로로 접근 시도

### 3-2. Routes 섹션 확인

- **Routes** 섹션을 찾았으면 다음 단계로 진행
- 만약 찾을 수 없다면, 아래 "Route 설정 대안 방법" 참고

### 3-3. Route 추가 - Check 프로젝트

1. **Add route** 버튼 클릭
2. 다음 정보 입력:
   - **Route**: `hyunshu.com/check/*`
     - 정확히 입력: `hyunshu.com/check/*`
     - `*`는 와일드카드 (모든 하위 경로 포함)
   - **Zone**: 드롭다운에서 `hyunshu.com` 선택
   - **Fail open**: ✅ 체크 (권장)
     - Worker가 실패해도 원본 요청을 전달
3. **Add route** 버튼 클릭하여 저장

### 3-4. Route 추가 - Portfolio 프로젝트

1. 다시 **Add route** 버튼 클릭
2. 다음 정보 입력:
   - **Route**: `hyunshu.com/portfolio/*`
   - **Zone**: `hyunshu.com` 선택
   - **Fail open**: ✅ 체크
3. **Add route** 버튼 클릭하여 저장

### 3-5. Route 추가 - 루트 경로 (선택사항)

루트 경로(`hyunshu.com/`)를 특정 프로젝트로 라우팅하려면:

1. **Add route** 버튼 클릭
2. 다음 정보 입력:
   - **Route**: `hyunshu.com/*`
   - **Zone**: `hyunshu.com` 선택
   - **Fail open**: ✅ 체크
3. **Add route** 버튼 클릭하여 저장

⚠️ **주의**: 루트 Route는 가장 마지막에 추가해야 합니다. Route는 위에서 아래로 순서대로 매칭되므로, `/check/*`와 `/portfolio/*`가 먼저 와야 합니다.

### 3-6. Route 순서 확인

Route 목록에서 순서가 다음과 같이 되어 있어야 합니다:

1. `hyunshu.com/check/*` (가장 위)
2. `hyunshu.com/portfolio/*`
3. `hyunshu.com/*` (가장 아래, 선택사항)

순서를 변경하려면 Route를 삭제하고 다시 추가하세요.

### 3-7. Route 설정 대안 방법 (Triggers 탭이 없는 경우)

**방법 A: Custom Domains 사용**

1. Worker 상세 페이지에서 **Custom domains** 또는 **Domains** 섹션 찾기
2. **Add Custom Domain** 또는 **Connect Domain** 클릭
3. 도메인 입력: `hyunshu.com`
4. 경로 설정: `/check/*` 또는 `/portfolio/*`

**방법 B: DNS에서 직접 설정**

1. Cloudflare Dashboard > **DNS** 메뉴로 이동
2. `hyunshu.com` 도메인 선택
3. **Add record** 클릭
4. 타입: `CNAME` 또는 `A` 레코드
5. 이름: `check` (서브도메인인 경우)
6. 대상: Worker의 서브도메인 (예: `worker-name.your-subdomain.workers.dev`)

**방법 C: Workers & Pages 통합 인터페이스**

1. **Workers & Pages** 메뉴로 이동
2. 상단에 **Routes** 또는 **Triggers** 탭 확인
3. 또는 **Add route** 버튼이 상단에 있을 수 있음

**방법 D: Worker 코드에서 직접 처리**

Route 설정 없이 Worker 코드에서 모든 경로를 처리:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 모든 요청을 처리 (Route 설정 불필요)
    if (url.pathname.startsWith('/check')) {
      // check 프로젝트로 라우팅
    }
    // ...
  }
}
```

그리고 Worker를 도메인 전체에 연결:
- Settings > **Add Custom Domain** > `hyunshu.com` 추가

---

## 4단계: 확인 및 테스트

### 4-1. 배포 확인

1. Worker 상세 페이지에서 **Deployments** 탭 확인
2. 최신 배포가 "Active" 상태인지 확인

### 4-2. Route 확인

1. **Triggers** 탭에서 Route 목록 확인
2. 모든 Route가 "Active" 상태인지 확인

### 4-3. 테스트

브라우저에서 다음 URL들을 테스트하세요:

1. **Check 프로젝트 테스트**
   - `https://hyunshu.com/check` 접속
   - Check 프로젝트가 정상적으로 표시되는지 확인
   - 개발자 도구 > Network 탭에서 리소스가 올바르게 로드되는지 확인

2. **Portfolio 프로젝트 테스트**
   - `https://hyunshu.com/portfolio` 접속
   - Portfolio 프로젝트가 정상적으로 표시되는지 확인

3. **루트 경로 테스트** (Route를 추가한 경우)
   - `https://hyunshu.com/` 접속
   - 예상대로 작동하는지 확인

### 4-4. 로그 확인 (문제 발생 시)

1. Worker 상세 페이지에서 **Logs** 탭 클릭
2. 실시간 로그 확인
3. 에러 메시지가 있는지 확인

---

## 문제 해결

### 문제 1: 404 에러 발생

**원인:**
- Pages URL이 잘못됨
- Route 설정이 잘못됨
- 빌드된 파일의 경로 문제

**해결 방법:**

1. **Pages URL 확인**
   - Cloudflare Pages에서 실제 배포 URL 확인
   - Worker 코드의 URL이 정확한지 확인

2. **Route 확인**
   - Route가 `hyunshu.com/check/*` 형식으로 올바르게 설정되었는지 확인
   - Zone이 올바른 도메인을 가리키는지 확인

3. **빌드 설정 확인**
   - Check 프로젝트의 `base: '/check/'` 설정 확인
   - Portfolio 프로젝트의 `base: '/portfolio/'` 설정 확인

### 문제 2: Worker가 작동하지 않음

**원인:**
- 코드에 문법 오류
- Route가 활성화되지 않음
- 배포가 완료되지 않음

**해결 방법:**

1. **코드 확인**
   - Worker 편집 페이지에서 문법 오류 확인
   - Save and deploy 시 오류 메시지 확인

2. **Route 활성화 확인**
   - Triggers 탭에서 Route가 "Active" 상태인지 확인
   - Route를 삭제하고 다시 추가

3. **배포 확인**
   - Deployments 탭에서 최신 배포가 "Active"인지 확인
   - 필요시 다시 배포

### 문제 3: 캐시 문제

**원인:**
- 브라우저 캐시
- Cloudflare 캐시

**해결 방법:**

1. **브라우저 캐시 삭제**
   - 개발자 도구 > Network 탭 > "Disable cache" 체크
   - 또는 시크릿 모드에서 테스트

2. **Cloudflare 캐시 삭제**
   - Cloudflare Dashboard > Caching > Purge Everything
   - 또는 Worker > Settings > Clear cache

### 문제 4: 기존 사이트가 작동하지 않음

**원인:**
- Worker가 모든 요청을 가로챔
- Route 설정이 잘못됨

**해결 방법:**

1. **Route 순서 확인**
   - 특정 경로(`/check/*`, `/portfolio/*`)가 루트(`/*`)보다 먼저 와야 함

2. **기본 사이트 라우팅 확인**
   - Worker 코드의 마지막 `return fetch(request);`가 올바른지 확인
   - 기존 사이트의 URL이 올바른지 확인

---

## 최종 확인 체크리스트

배포 전 다음 사항을 확인하세요:

- [ ] Check 프로젝트가 Cloudflare Pages에 배포되었는가?
- [ ] Portfolio 프로젝트가 Cloudflare Pages에 배포되었는가?
- [ ] 각 프로젝트의 Pages URL을 확인했는가?
- [ ] Worker 코드의 Pages URL이 올바른가?
- [ ] Worker 코드를 저장하고 배포했는가?
- [ ] Route가 올바른 순서로 설정되었는가?
- [ ] Route의 Zone이 올바른 도메인을 가리키는가?
- [ ] `https://hyunshu.com/check`가 정상 작동하는가?
- [ ] `https://hyunshu.com/portfolio`가 정상 작동하는가?

---

## 추가 팁

### Worker 코드 최적화

더 많은 프로젝트를 추가하려면:

```javascript
const routes = {
  '/check': 'https://check-pages-url.pages.dev',
  '/portfolio': 'https://portfolio-pages-url.pages.dev',
  '/blog': 'https://blog-pages-url.pages.dev',
  // 추가 프로젝트...
};

for (const [path, pagesUrl] of Object.entries(routes)) {
  if (url.pathname.startsWith(path)) {
    const targetUrl = new URL(request.url);
    targetUrl.hostname = new URL(pagesUrl).hostname;
    targetUrl.pathname = url.pathname;
    return fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }
}
```

### 성능 모니터링

- Worker 상세 페이지 > **Analytics** 탭에서 요청 수, 응답 시간 등 확인
- 무료 플랜: 일일 100,000 요청 제한

### 보안

- Worker 코드에 민감한 정보를 포함하지 마세요
- Pages URL은 공개되어도 문제없지만, API 키 등은 포함하지 마세요

---

## 참고 자료

- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Worker 예제](https://developers.cloudflare.com/workers/examples/)

---

## 요약

1. ✅ Worker 생성
2. ✅ 코드 작성 및 Pages URL 설정
3. ✅ Route 추가 (`/check/*`, `/portfolio/*`)
4. ✅ 테스트 및 확인

이제 `hyunshu.com/check`와 `hyunshu.com/portfolio`가 각각 다른 Pages 프로젝트로 정상 작동합니다!

