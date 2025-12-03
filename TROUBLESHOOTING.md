# 404 에러 해결 가이드

Cloudflare Worker를 통해 배포한 후 404 에러가 발생하는 경우 해결 방법입니다.

## 문제 진단

### 1. Pages 프로젝트 직접 접속 확인

먼저 Pages 프로젝트 URL에 직접 접속하여 정상 작동하는지 확인하세요:

```
https://[your-pages-url].pages.dev/check/
```

**확인 사항:**
- ✅ `/check/` 경로로 접속했을 때 정상 작동하는가?
- ✅ `/check/assets/...` 경로의 리소스가 로드되는가?

### 2. Worker 코드 확인

Worker 코드에서 다음을 확인하세요:

1. **Pages URL이 올바른가?**
   ```javascript
   const pagesUrl = 'https://[실제-pages-url].pages.dev';
   ```

2. **경로 매핑이 올바른가?**
   - `hyunshu.com/check` → `pages.dev/check`
   - `hyunshu.com/check/assets/...` → `pages.dev/check/assets/...`

### 3. 빌드 설정 확인

`vite.config.ts`에서 `base: '/check/'` 설정이 올바른지 확인:

```typescript
base: '/check/',
```

빌드 후 `dist/index.html`의 경로가 `/check/assets/...` 형식인지 확인하세요.

## 해결 방법

### 방법 1: Pages 프로젝트가 루트에 배포된 경우

만약 Pages 프로젝트가 루트(`/`)에 배포되어 있다면, Worker 코드를 다음과 같이 수정:

```javascript
if (url.pathname.startsWith('/check')) {
  const pagesUrl = 'https://[your-pages-url].pages.dev';
  const targetUrl = new URL(request.url);
  targetUrl.hostname = new URL(pagesUrl).hostname;
  
  // /check를 제거하고 루트 경로로 매핑
  targetUrl.pathname = url.pathname.replace('/check', '') || '/';
  
  return fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}
```

그리고 `vite.config.ts`에서 `base: '/'`로 변경:

```typescript
base: '/',
```

### 방법 2: Pages 프로젝트가 /check 경로에 배포된 경우

현재 설정(`base: '/check/'`)을 유지하고, Worker 코드가 경로를 올바르게 전달하는지 확인:

```javascript
if (url.pathname.startsWith('/check')) {
  const pagesUrl = 'https://[your-pages-url].pages.dev';
  const targetUrl = new URL(request.url);
  targetUrl.hostname = new URL(pagesUrl).hostname;
  targetUrl.pathname = url.pathname; // 경로 그대로 유지
  
  return fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}
```

### 방법 3: 디버깅

Worker 코드에 로깅을 추가하여 문제 진단:

```javascript
if (url.pathname.startsWith('/check')) {
  const pagesUrl = 'https://[your-pages-url].pages.dev';
  const targetUrl = new URL(request.url);
  targetUrl.hostname = new URL(pagesUrl).hostname;
  targetUrl.pathname = url.pathname;
  
  console.log('Worker Debug:', {
    originalUrl: request.url,
    targetUrl: targetUrl.toString(),
    pathname: url.pathname,
  });
  
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  
  console.log('Response Status:', response.status);
  
  return response;
}
```

Cloudflare Dashboard > Workers & Pages > 해당 Worker > Logs에서 로그를 확인할 수 있습니다.

## 체크리스트

- [ ] Pages 프로젝트가 정상적으로 배포되었는가?
- [ ] Pages URL에 직접 접속했을 때 정상 작동하는가?
- [ ] Worker 코드의 Pages URL이 올바른가?
- [ ] Route 설정이 `hyunshu.com/check/*`로 되어 있는가?
- [ ] `base: '/check/'` 설정이 올바른가?
- [ ] 빌드된 파일의 경로가 `/check/assets/...` 형식인가?

## 추가 도움

문제가 계속되면:
1. Cloudflare Dashboard > Workers & Pages > 해당 Worker > Logs 확인
2. 브라우저 개발자 도구 > Network 탭에서 실패한 요청 확인
3. Pages 프로젝트의 배포 로그 확인

