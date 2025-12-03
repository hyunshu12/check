# Cloudflare Worker 설정 가이드

`hyunshu.com/check` 경로를 Cloudflare Pages 프로젝트로 라우팅하기 위한 Worker 설정 가이드입니다.

## 사전 준비

1. ✅ Cloudflare Pages 프로젝트가 배포되어 있어야 합니다
2. ✅ 배포된 Pages URL을 확인해두세요 (예: `https://beta-classroom-monitor.pages.dev`)
3. ✅ `hyunshu.com` 도메인이 Cloudflare에 연결되어 있어야 합니다

## 단계별 설정

### 1단계: Cloudflare Pages 프로젝트 배포 확인

1. [Cloudflare Pages](https://pages.cloudflare.com/) 접속
2. 프로젝트가 배포되어 있는지 확인
3. 배포 URL 복사 (예: `https://beta-classroom-monitor.pages.dev`)

### 2단계: Cloudflare Worker 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속
2. 왼쪽 메뉴에서 **Workers & Pages** 클릭
3. **Create application** 버튼 클릭
4. **Worker** 선택
5. Worker 이름 입력: `hyunshu-check-routing` (원하는 이름)
6. **Deploy** 클릭하여 기본 Worker 생성

### 3단계: Worker 코드 작성

1. 생성된 Worker를 클릭하여 상세 페이지로 이동
2. **Edit code** 버튼 클릭
3. 기본 코드를 모두 삭제하고 아래 코드로 교체:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // /check 경로로 시작하는 요청을 Pages로 라우팅
    if (url.pathname.startsWith('/check')) {
      // ⚠️ 실제 Pages 배포 URL로 변경하세요!
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

4. **⚠️ 중요**: `pagesUrl` 변수의 값을 실제 배포된 Pages URL로 변경하세요!
5. **Save and deploy** 클릭

### 4단계: Worker를 도메인에 연결

1. Worker 상세 페이지에서 **Triggers** 탭 클릭
2. **Routes** 섹션에서 **Add route** 버튼 클릭
3. 다음 정보 입력:
   - **Route**: `hyunshu.com/check/*`
   - **Zone**: `hyunshu.com` 선택
4. **Add route** 클릭하여 저장

### 5단계: 확인

1. 브라우저에서 `https://hyunshu.com/check` 접속
2. 정상적으로 Pages 프로젝트가 표시되는지 확인
3. 다른 경로(`hyunshu.com/`, `hyunshu.com/about` 등)는 기존 사이트로 라우팅되는지 확인

## 문제 해결

### Worker가 작동하지 않는 경우

1. **Route 설정 확인**
   - Route가 `hyunshu.com/check/*` 형식으로 올바르게 설정되었는지 확인
   - Zone이 올바른 도메인을 가리키는지 확인

2. **Worker 코드 확인**
   - Pages URL이 올바른지 확인
   - 코드에 문법 오류가 없는지 확인 (Save and deploy 시 오류 메시지 확인)

3. **캐시 문제**
   - 브라우저 캐시 삭제 후 다시 시도
   - Cloudflare 캐시 삭제 (Workers & Pages > 해당 Worker > Settings > Clear cache)

### 404 에러가 발생하는 경우

1. **Pages 프로젝트 확인**
   - Pages 프로젝트가 정상적으로 배포되었는지 확인
   - Pages URL이 올바른지 확인

2. **경로 문제**
   - `base: '/check/'` 설정이 올바르게 되어 있는지 확인
   - 빌드된 파일의 경로가 `/check/assets/...` 형식인지 확인

### 기존 사이트가 작동하지 않는 경우

- Worker 코드의 마지막 부분 `return fetch(request);`가 올바르게 설정되어 있는지 확인
- 기존 사이트의 URL이 올바른지 확인

## 참고 사항

- Worker는 무료 플랜에서도 사용 가능합니다 (일일 요청 제한: 100,000건)
- Worker는 전 세계에 배포되어 빠른 응답 속도를 제공합니다
- Route는 와일드카드(`*`)를 사용하여 `/check` 하위의 모든 경로를 포함합니다

## 추가 리소스

- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)

