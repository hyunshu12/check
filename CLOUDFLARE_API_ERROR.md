# Cloudflare API 오류 해결 가이드

## 오류: API Request Failed: GET /api/v4/accounts/.../entitlements (500)

이 오류는 Cloudflare API 호출 시 발생하는 서버 오류입니다.

## 가능한 원인

### 1. Cloudflare 서비스 일시적 문제
- Cloudflare의 일시적인 서비스 장애
- API 서버 과부하

### 2. API 토큰 권한 문제
- API 토큰에 필요한 권한이 없음
- 토큰이 만료되었거나 잘못됨

### 3. 계정 권한 문제
- 계정에 필요한 권한이 없음
- 멤버십/플랜 제한

## 해결 방법

### 방법 1: 잠시 후 재시도
1. 몇 분 후 다시 시도
2. Cloudflare 상태 페이지 확인: https://www.cloudflarestatus.com/

### 방법 2: API 토큰 재생성
1. [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) 접속
2. 기존 토큰 삭제 또는 비활성화
3. 새 토큰 생성:
   - **권한**: 
     - Account > Cloudflare Pages > Edit
     - Account > Account Settings > Read
   - **계정 리소스**: 특정 계정 선택
4. 새 토큰을 GitHub Secrets에 업데이트

### 방법 3: Cloudflare Dashboard에서 직접 설정
API를 사용하지 않고 Cloudflare Dashboard에서 직접 설정:

1. **Worker 생성**
   - Cloudflare Dashboard > Workers & Pages > Create application > Worker
   - 코드를 직접 입력

2. **Route 설정**
   - Worker 상세 페이지 > Triggers > Routes
   - 직접 Route 추가

### 방법 4: 브라우저 캐시 및 쿠키 삭제
1. 브라우저 캐시 삭제
2. Cloudflare 로그아웃 후 다시 로그인
3. 시크릿 모드에서 시도

### 방법 5: Cloudflare 지원팀 문의
문제가 계속되면:
- [Cloudflare Community](https://community.cloudflare.com/)에 문의
- 또는 Cloudflare 지원팀에 문의

## GitHub Actions 사용 시

GitHub Actions에서 이 오류가 발생하는 경우:

1. **Secrets 확인**
   - `CLOUDFLARE_API_TOKEN`이 올바른지 확인
   - `CLOUDFLARE_ACCOUNT_ID`가 올바른지 확인

2. **토큰 권한 확인**
   - 토큰에 필요한 모든 권한이 있는지 확인
   - Account > Cloudflare Pages > Edit 권한 필수

3. **수동 배포 사용**
   - GitHub Actions 대신 Cloudflare Dashboard에서 직접 배포

## 참고

- 이 오류는 일반적으로 일시적인 문제입니다
- 대부분의 경우 몇 분 후 재시도하면 해결됩니다
- API 토큰 권한을 확인하는 것이 가장 중요합니다

