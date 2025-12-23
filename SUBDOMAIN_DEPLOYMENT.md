# Cloudflare 서브도메인 배포 가이드
## check.hyunshu.com 서브도메인 배포

---

## 개요

이 가이드는 `check.hyunshu.com` 서브도메인으로 Cloudflare Workers를 사용하여 정적 사이트를 배포하는 방법을 설명합니다.

---

## 1. 사전 준비사항

### 1.1 Cloudflare 계정 및 도메인 설정
- Cloudflare 계정이 있어야 합니다
- `hyunshu.com` 도메인이 Cloudflare에 등록되어 있어야 합니다
- 도메인의 DNS 설정이 Cloudflare로 관리되고 있어야 합니다

### 1.2 프로젝트 빌드 확인
```bash
# 의존성 설치
npm install

# 빌드 실행
npm run build
```

`./dist` 폴더에 빌드 결과물이 생성되었는지 확인하세요.

---

## 2. 배포 단계

### Step 1: Worker 배포

터미널에서 다음 명령어를 실행합니다:

```bash
npx wrangler deploy
```

**처음 실행 시:**
- 브라우저가 열리면 Cloudflare 계정으로 로그인하세요
- 권한 승인을 완료하세요

**배포 성공 시:**
- 터미널에 "Published check (X seconds)" 메시지가 표시됩니다
- Worker가 Cloudflare에 배포되었습니다

---

### Step 2: Cloudflare 대시보드에서 Custom Domain 설정

#### 2.1 Cloudflare 대시보드 접속
1. 브라우저에서 [dash.cloudflare.com](https://dash.cloudflare.com) 접속
2. 로그인 후 `hyunshu.com` 도메인 선택

#### 2.2 Workers & Pages 메뉴로 이동
1. 좌측 사이드바에서 **"Workers & Pages"** 클릭
2. 상단 탭에서 **"Workers"** 선택

#### 2.3 check Worker 선택
1. Worker 목록에서 **"check"** Worker 찾기
2. **"check"** Worker 이름 클릭하여 상세 페이지로 이동

#### 2.4 Triggers 메뉴로 이동
1. Worker 상세 페이지 좌측 사이드바에서 **"Triggers"** 메뉴 클릭
2. 또는 상단 탭에서 **"Triggers"** 선택

#### 2.5 Custom Domain 추가
1. **"Custom Domains"** 섹션에서 **"Add Custom Domain"** 버튼 클릭
2. **"Domain"** 입력란에 `check.hyunshu.com` 입력
3. **"Add Custom Domain"** 버튼 클릭

#### 2.6 DNS 레코드 확인
- Cloudflare가 자동으로 CNAME 레코드를 생성합니다
- DNS 설정에서 `check.hyunshu.com`이 `check.workers.dev`를 가리키는 CNAME 레코드가 생성되었는지 확인하세요
- DNS 전파에는 몇 분에서 최대 24시간까지 걸릴 수 있습니다

---

### Step 3: 배포 확인

#### 3.1 DNS 전파 확인
```bash
# 터미널에서 DNS 확인
nslookup check.hyunshu.com
# 또는
dig check.hyunshu.com
```

#### 3.2 브라우저에서 접속 확인
1. 브라우저에서 `https://check.hyunshu.com` 접속
2. 사이트가 정상적으로 로드되는지 확인

---

## 3. 배포 후 업데이트

코드를 수정한 후 다시 배포하려면:

```bash
# 빌드 및 배포
npm run deploy
```

또는

```bash
npm run build
npx wrangler deploy
```

배포 후 몇 초 내에 변경사항이 `check.hyunshu.com`에 반영됩니다.

---

## 4. 문제 해결

### 4.1 배포 시 에러가 발생하는 경우

**Wrangler 로그인 확인:**
```bash
npx wrangler login
```

**빌드 결과물 확인:**
```bash
ls -la dist/
```
`index.html` 파일이 있는지 확인하세요.

**wrangler.jsonc 문법 확인:**
- JSONC 형식이 올바른지 확인하세요 (주석 사용 가능)

---

### 4.2 DNS가 전파되지 않는 경우

1. **Cloudflare 대시보드에서 DNS 레코드 확인**
   - DNS 메뉴에서 `check.hyunshu.com` CNAME 레코드가 있는지 확인
   - 레코드가 없으면 수동으로 추가:
     - **Type:** CNAME
     - **Name:** check
     - **Target:** check.workers.dev
     - **Proxy status:** Proxied (주황색 구름)

2. **DNS 전파 시간 대기**
   - 일반적으로 몇 분에서 몇 시간이 걸릴 수 있습니다
   - 전 세계 DNS 서버에 전파되는 데 시간이 필요합니다

3. **DNS 캐시 클리어**
   ```bash
   # macOS/Linux
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```

---

### 4.3 사이트가 로드되지 않는 경우

1. **Worker가 배포되었는지 확인**
   - Cloudflare 대시보드 → Workers & Pages → Workers
   - `check` Worker가 목록에 있는지 확인

2. **Custom Domain이 연결되었는지 확인**
   - Worker 상세 페이지 → Triggers → Custom Domains
   - `check.hyunshu.com`이 목록에 있는지 확인

3. **SSL/TLS 설정 확인**
   - Cloudflare 대시보드 → SSL/TLS
   - 암호화 모드가 "Full" 또는 "Full (strict)"로 설정되어 있는지 확인

4. **브라우저 콘솔 확인**
   - 브라우저 개발자 도구(F12) → Console 탭
   - 에러 메시지가 있는지 확인

---

## 5. 주요 파일 설명

### 5.1 wrangler.jsonc
```jsonc
{
  "name": "check",                    // Worker 이름
  "main": "src/index.ts",             // Worker 진입점
  "compatibility_date": "2025-01-03", // 호환성 날짜
  "assets": {
    "directory": "./dist",            // 정적 파일 디렉토리
    "binding": "ASSETS"               // Worker에서 사용할 바인딩 이름
  },
  "run_worker_first": false          // 정적 파일 우선 서빙
}
```

### 5.2 src/index.ts
- Worker 코드가 있는 파일
- 정적 파일 요청을 처리하고, 404 시 `index.html`로 폴백
- SPA 라우팅을 지원합니다

---

## 6. 완료 체크리스트

- [ ] `npm install` 실행 완료
- [ ] `npm run build` 실행 완료 (`./dist` 폴더 생성 확인)
- [ ] `npx wrangler deploy` 실행 완료
- [ ] Cloudflare 대시보드에서 `check` Worker 확인 완료
- [ ] Custom Domain `check.hyunshu.com` 추가 완료
- [ ] DNS 레코드 확인 완료
- [ ] `https://check.hyunshu.com` 접속하여 사이트 확인 완료

---

## 7. 참고사항

### 7.1 서브도메인 vs 경로 배포

**서브도메인 배포 (현재 방식):**
- `check.hyunshu.com` - 독립적인 서브도메인
- Custom Domain 설정 필요
- DNS 레코드 필요

**경로 배포 (이전 방식):**
- `hyunshu.com/check` - 메인 도메인의 하위 경로
- Route 설정 필요
- DNS 레코드 불필요

### 7.2 비용

- Cloudflare Workers 무료 플랜:
  - 일일 100,000 요청
  - 월 10,000,000 요청
- 대부분의 개인 프로젝트에는 무료 플랜으로 충분합니다

---

**작성일:** 2025-01-03  
**대상:** Cloudflare Workers를 사용한 서브도메인 정적 사이트 배포




