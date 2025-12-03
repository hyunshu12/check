# 왜 Worker가 필요한가? (hyunshu.com/portfolio가 이미 있는 경우)

## 문제 상황

- ✅ `hyunshu.com/portfolio` - 이미 존재하는 사이트
- ❌ `hyunshu.com/check` - 새로 만들고 싶은 사이트

## Cloudflare Pages의 제한사항

**하나의 도메인에는 하나의 Pages 프로젝트만 연결할 수 있습니다.**

- `hyunshu.com` → `portfolio` 프로젝트에 이미 연결됨
- `hyunshu.com` → `check` 프로젝트에 연결하려고 하면 오류 발생
  - 오류: "That domain is already associated with an existing project"

## 해결 방법

### 방법 1: Cloudflare Worker 사용 (권장) ⭐

Worker를 사용하여 경로별로 다른 Pages 프로젝트로 라우팅:

```
hyunshu.com/portfolio → portfolio 프로젝트
hyunshu.com/check → check 프로젝트
hyunshu.com/ → portfolio 프로젝트 (또는 기본 사이트)
```

**장점:**
- ✅ 같은 도메인에 여러 프로젝트 배포 가능
- ✅ URL이 깔끔함 (`hyunshu.com/check`)
- ✅ SEO에 유리함

**단점:**
- ⚠️ Worker 설정 필요 (하지만 한 번만 설정하면 됨)

### 방법 2: 서브도메인 사용

```
portfolio.hyunshu.com → portfolio 프로젝트
check.hyunshu.com → check 프로젝트
```

**장점:**
- ✅ Worker 설정 불필요
- ✅ 가장 간단함

**단점:**
- ⚠️ URL이 다름 (`check.hyunshu.com` vs `hyunshu.com/check`)

### 방법 3: 기존 프로젝트에 통합

두 프로젝트를 하나로 합치기 (복잡함, 권장하지 않음)

## Worker 설정 방법 (방법 1)

### Worker 코드 예시

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // /check 경로는 check 프로젝트로
    if (url.pathname.startsWith('/check')) {
      const checkPagesUrl = 'https://[check-pages-url].pages.dev';
      const targetUrl = new URL(request.url);
      targetUrl.hostname = new URL(checkPagesUrl).hostname;
      targetUrl.pathname = url.pathname;
      return fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }
    
    // /portfolio 경로는 portfolio 프로젝트로
    if (url.pathname.startsWith('/portfolio')) {
      const portfolioPagesUrl = 'https://[portfolio-pages-url].pages.dev';
      const targetUrl = new URL(request.url);
      targetUrl.hostname = new URL(portfolioPagesUrl).hostname;
      targetUrl.pathname = url.pathname;
      return fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }
    
    // 나머지는 기본 사이트로 (또는 portfolio로)
    return fetch(request);
  }
}
```

### Route 설정

Worker에 여러 Route를 추가:

1. `hyunshu.com/check/*` → check 프로젝트로 라우팅
2. `hyunshu.com/portfolio/*` → portfolio 프로젝트로 라우팅
3. `hyunshu.com/*` → 기본 사이트로 라우팅

## 결론

**`hyunshu.com/portfolio`가 이미 있다면, `hyunshu.com/check`를 만들려면 Worker가 필요합니다.**

이것은 Cloudflare Pages의 제한사항이 아니라, 하나의 도메인에 여러 프로젝트를 배포하기 위한 표준 방법입니다.

Worker 설정은 한 번만 하면 되고, 이후에는 각 프로젝트를 독립적으로 배포할 수 있습니다.

## 참고

- Worker는 무료 플랜에서도 사용 가능 (일일 100,000 요청)
- Worker 설정은 한 번만 하면 됨
- 각 Pages 프로젝트는 독립적으로 배포 가능

