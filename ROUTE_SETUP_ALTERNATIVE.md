# Route 설정 대안 방법 (Triggers 탭이 없는 경우)

Cloudflare의 UI가 변경되어 Triggers 탭이 보이지 않는 경우의 대안 방법입니다.

## 방법 1: Custom Domains 사용

### 단계별 가이드

1. **Worker 상세 페이지로 이동**
   - Workers & Pages > 생성한 Worker 클릭

2. **Custom Domains 섹션 찾기**
   - 상단 메뉴에서 **Custom domains** 또는 **Domains** 탭 확인
   - 또는 Settings 탭 내부에 있을 수 있음

3. **도메인 연결**
   - **Add Custom Domain** 또는 **Connect Domain** 클릭
   - 도메인 입력: `hyunshu.com`
   - 경로 설정 (있는 경우): `/check/*`

## 방법 2: Workers & Pages 통합 인터페이스

### 단계별 가이드

1. **Workers & Pages 메인 페이지로 이동**
   - 왼쪽 사이드바 > **Workers & Pages**

2. **Routes 섹션 확인**
   - 상단에 **Routes** 탭이 있을 수 있음
   - 또는 **Add route** 버튼이 상단에 표시될 수 있음

3. **Route 추가**
   - **Add route** 클릭
   - Route 입력: `hyunshu.com/check/*`
   - Worker 선택: 생성한 Worker 선택

## 방법 3: Worker를 도메인 전체에 연결

### 단계별 가이드

1. **Worker Settings로 이동**
   - Worker 상세 페이지 > **Settings** 탭

2. **Custom Domain 추가**
   - **Add Custom Domain** 클릭
   - 도메인 입력: `hyunshu.com`
   - 이렇게 하면 Worker가 도메인 전체의 요청을 처리

3. **Worker 코드에서 경로 처리**
   - Worker 코드에서 `/check`, `/portfolio` 경로를 구분하여 처리
   - Route 설정 없이도 작동함

## 방법 4: DNS 레코드 사용 (고급)

### 단계별 가이드

1. **Cloudflare DNS로 이동**
   - Dashboard > **DNS** 메뉴
   - `hyunshu.com` 도메인 선택

2. **Worker 서브도메인 확인**
   - Worker 상세 페이지에서 Worker의 서브도메인 확인
   - 형식: `worker-name.your-subdomain.workers.dev`

3. **CNAME 레코드 추가**
   - 타입: `CNAME`
   - 이름: `check` (또는 원하는 서브도메인)
   - 대상: Worker 서브도메인

⚠️ **주의**: 이 방법은 서브도메인(`check.hyunshu.com`)으로 접근하게 됩니다.

## 방법 5: Cloudflare Dashboard 검색 사용

### 단계별 가이드

1. **Cloudflare Dashboard 상단 검색창 사용**
   - "route" 또는 "trigger" 검색
   - 관련 메뉴로 이동

2. **도메인 설정에서 확인**
   - Dashboard > **Websites** > `hyunshu.com` 선택
   - **Workers Routes** 섹션 확인

## 가장 권장하는 방법

**방법 3 (Worker를 도메인 전체에 연결)**을 권장합니다:

1. ✅ 가장 간단함
2. ✅ Route 설정 불필요
3. ✅ Worker 코드에서 모든 경로 처리 가능

### 설정 방법

1. Worker Settings > **Add Custom Domain** > `hyunshu.com` 추가
2. Worker 코드에서 경로별로 처리:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/check')) {
      // check 프로젝트로
    } else if (url.pathname.startsWith('/portfolio')) {
      // portfolio 프로젝트로
    } else {
      // 기본 사이트로
    }
  }
}
```

이렇게 하면 Route 설정 없이도 작동합니다!

## 문제 해결

### 여전히 찾을 수 없는 경우

1. **Cloudflare 지원팀 문의**
   - [Cloudflare Community](https://community.cloudflare.com/)
   - 또는 [Cloudflare Support](https://support.cloudflare.com/)

2. **브라우저 캐시 삭제**
   - 브라우저 캐시 및 쿠키 삭제 후 다시 시도

3. **다른 브라우저에서 시도**
   - Chrome, Firefox, Safari 등 다른 브라우저에서 시도

4. **모바일 앱 사용**
   - Cloudflare 모바일 앱에서 설정 시도

