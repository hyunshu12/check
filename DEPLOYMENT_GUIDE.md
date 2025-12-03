# Cloudflare Workers + Static Assets 배포 가이드
## hyunshu.com/check 경로 배포

---

## 1. package.json 빌드 스크립트 예시

프로젝트 루트의 `package.json`에 다음 스크립트가 포함되어 있어야 합니다:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && npx wrangler deploy"
  }
}
```

**설명:**
- `build`: TypeScript 컴파일 + Vite 빌드로 `./dist` 폴더 생성
- `deploy`: 빌드 후 자동으로 Wrangler 배포 실행

---

## 2. wrangler.jsonc 파일 전체 예시

프로젝트 루트에 `wrangler.jsonc` 파일을 생성하고 다음 내용을 작성합니다:

```jsonc
{
  // Worker 이름 (Cloudflare 대시보드에서 표시됨)
  "name": "check",
  
  // Worker 진입점 파일 경로
  "main": "src/index.ts",
  
  // Cloudflare Workers 호환성 날짜
  "compatibility_date": "2025-01-03",
  
  // 정적 파일 서빙 설정
  "assets": {
    // 빌드된 정적 파일이 있는 디렉토리
    "directory": "./dist",
    
    // Worker 코드에서 사용할 바인딩 이름
    "binding": "ASSETS"
  },
  
  // 정적 파일이 없을 때만 Worker 실행 (false = 항상 Worker 실행)
  "run_worker_first": false
}
```

**파일 위치:** 프로젝트 루트 (`/wrangler.jsonc`)

**설명:**
- `name`: Cloudflare 대시보드에서 보이는 Worker 이름
- `main`: Worker 코드의 진입점 파일
- `assets.directory`: Vite 빌드 결과물이 있는 폴더 (`./dist`)
- `assets.binding`: Worker 코드에서 `env.ASSETS`로 접근 가능
- `run_worker_first: false`: 정적 파일이 우선적으로 서빙되고, 없을 때만 Worker 실행

---

## 3. src/index.ts Worker 코드 예시

프로젝트 루트의 `src/index.ts` 파일을 생성하고 다음 내용을 작성합니다:

```typescript
/**
 * Cloudflare Worker + Static Assets
 * hyunshu.com/check 경로의 정적 파일을 서빙합니다.
 */

interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      
      // 정적 파일 요청을 ASSETS로 전달
      // ASSETS가 자동으로 dist 폴더의 파일을 서빙합니다
      const response = await env.ASSETS.fetch(request);
      
      // 404 에러인 경우 기본 index.html로 폴백 (SPA 라우팅 지원)
      if (response.status === 404) {
        // /check 경로로 시작하는 요청은 /check/index.html로 리다이렉트
        if (url.pathname.startsWith('/check')) {
          const indexRequest = new Request(
            new URL('/check/index.html', request.url),
            request
          );
          const fallbackResponse = await env.ASSETS.fetch(indexRequest);
          
          // index.html도 없으면 404 반환
          if (fallbackResponse.status === 404) {
            return new Response('Not Found', { status: 404 });
          }
          
          return fallbackResponse;
        }
        
        return new Response('Not Found', { status: 404 });
      }
      
      return response;
    } catch (error) {
      // 에러 발생 시 500 에러 반환
      console.error('Worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        statusText: 'Worker Error',
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
} satisfies ExportedHandler<Env>;
```

**파일 위치:** `src/index.ts`

**설명:**
- `env.ASSETS.fetch(request)`: `wrangler.jsonc`에서 설정한 `ASSETS` 바인딩을 통해 정적 파일 요청 처리
- 404 처리: SPA 라우팅을 위해 404 시 `/check/index.html`로 폴백
- 에러 핸들링: 예외 발생 시 500 에러 반환

---

## 4. CLI 명령어 정리

### 4.1 의존성 설치

```bash
# npm 사용
npm install

# 또는 pnpm 사용
pnpm install
```

**설명:** 프로젝트 의존성 패키지 설치

---

### 4.2 Cloudflare Wrangler 설치 (이미 설치되어 있다면 생략)

```bash
# npm 사용
npm install -D wrangler

# 또는 pnpm 사용
pnpm add -D wrangler
```

**설명:** Cloudflare Workers 배포 도구 설치 (개발 의존성)

---

### 4.3 정적 사이트 빌드

```bash
npm run build
```

**설명:** TypeScript 컴파일 + Vite 빌드 실행, `./dist` 폴더 생성

---

### 4.4 Worker + Assets 배포

```bash
npx wrangler deploy
```

**설명:** `wrangler.jsonc` 설정을 기반으로 Worker와 정적 파일을 Cloudflare에 배포

**참고 (CLI 옵션 방식):**
`wrangler.jsonc` 없이 CLI 옵션으로 직접 배포하는 방법:

```bash
npx wrangler deploy --name check --assets=./dist --compatibility-date=2025-01-03 src/index.ts
```

하지만 **권장 방식은 `wrangler.jsonc` 파일을 사용하는 것**입니다. 설정이 한 곳에 모여 관리가 쉽습니다.

---

## 5. Cloudflare 대시보드에서 라우트(Triggers) 설정하는 GUI 단계

### Step 1: Cloudflare 대시보드 접속
1. 브라우저에서 [dash.cloudflare.com](https://dash.cloudflare.com) 접속
2. 로그인 후 `hyunshu.com` 도메인 선택

### Step 2: Workers & Pages 메뉴로 이동
1. 좌측 사이드바에서 **"Workers & Pages"** 클릭
2. 상단 탭에서 **"Workers"** 선택

### Step 3: 배포된 Worker 선택
1. Worker 목록에서 **"check"** Worker 찾기
2. **"check"** Worker 이름 클릭하여 상세 페이지로 이동

### Step 4: Triggers 메뉴로 이동
1. Worker 상세 페이지 좌측 사이드바에서 **"Triggers"** 메뉴 클릭
2. 또는 상단 탭에서 **"Triggers"** 선택

### Step 5: Custom Domain 또는 Route 추가
1. **"Add route"** 또는 **"Add custom domain"** 버튼 클릭
2. **"Routes"** 섹션에서 **"Add route"** 선택

### Step 6: 라우트 설정 입력
1. **"Zone"** 드롭다운에서 `hyunshu.com` 선택
2. **"Route"** 또는 **"URL pattern"** 입력란에 다음 입력:
   ```
   hyunshu.com/check*
   ```
   (또는 `hyunshu.com/check/*` 형식도 가능)
3. **"Worker"** 드롭다운에서 `check` 선택 (자동으로 선택되어 있을 수 있음)

### Step 7: 저장
1. **"Save"** 또는 **"Add route"** 버튼 클릭
2. 라우트가 추가되었는지 확인

### 기존 `hyunshu.com/portfolio*` 라우트와 충돌하지 않는 이유

Cloudflare Workers의 라우트 매칭 규칙:
- **더 구체적인 패턴이 우선 적용됩니다**
- `hyunshu.com/portfolio*`와 `hyunshu.com/check*`는 서로 다른 경로로 시작하므로 **충돌하지 않습니다**
- `/portfolio`로 시작하는 요청은 `portfolio` Worker로, `/check`로 시작하는 요청은 `check` Worker로 라우팅됩니다
- 만약 동일한 경로에 여러 라우트가 있다면, **더 구체적인 패턴**이 우선순위를 가집니다

---

## 6. 전체 과정을 Step 1 ~ Step N 형식으로 재정리

### Step 1: 프로젝트 빌드 스크립트 확인/수정

프로젝트 루트의 `package.json` 파일을 열고 `scripts` 섹션을 확인합니다:

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "deploy": "npm run build && npx wrangler deploy"
  }
}
```

`build` 스크립트가 `./dist` 폴더를 생성하는지 확인하세요.

---

### Step 2: wrangler.jsonc 생성

프로젝트 루트에 `wrangler.jsonc` 파일을 생성하고 다음 내용을 복사합니다:

```jsonc
{
  "name": "check",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-03",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "run_worker_first": false
}
```

**파일 경로:** `/wrangler.jsonc` (프로젝트 루트)

---

### Step 3: src/index.ts Worker 파일 생성

`src/index.ts` 파일을 생성하고 다음 코드를 복사합니다:

```typescript
interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const response = await env.ASSETS.fetch(request);
      
      if (response.status === 404) {
        if (url.pathname.startsWith('/check')) {
          const indexRequest = new Request(
            new URL('/check/index.html', request.url),
            request
          );
          const fallbackResponse = await env.ASSETS.fetch(indexRequest);
          
          if (fallbackResponse.status === 404) {
            return new Response('Not Found', { status: 404 });
          }
          
          return fallbackResponse;
        }
        
        return new Response('Not Found', { status: 404 });
      }
      
      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        statusText: 'Worker Error',
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
} satisfies ExportedHandler<Env>;
```

**파일 경로:** `/src/index.ts`

---

### Step 4: 의존성 설치 및 빌드

터미널에서 다음 명령어를 실행합니다:

```bash
# 의존성 설치
npm install

# 정적 사이트 빌드
npm run build
```

**확인사항:** `./dist` 폴더가 생성되고 `index.html` 파일이 있는지 확인하세요.

---

### Step 5: wrangler deploy로 배포

터미널에서 다음 명령어를 실행합니다:

```bash
npx wrangler deploy
```

**처음 실행 시:**
- Cloudflare 계정 로그인을 요청할 수 있습니다
- 브라우저가 열리면 로그인 후 권한을 승인하세요

**배포 성공 시:**
- 터미널에 "Published check (X seconds)" 메시지가 표시됩니다
- Worker가 Cloudflare에 배포되었습니다

---

### Step 6: Cloudflare 대시보드에서 hyunshu.com/check* 라우트 연결

1. **Cloudflare 대시보드 접속**
   - [dash.cloudflare.com](https://dash.cloudflare.com) 접속
   - `hyunshu.com` 도메인 선택

2. **Workers & Pages 메뉴로 이동**
   - 좌측 사이드바 → **"Workers & Pages"** 클릭
   - 상단 탭 → **"Workers"** 선택

3. **check Worker 선택**
   - Worker 목록에서 **"check"** 클릭

4. **Triggers 메뉴로 이동**
   - 좌측 사이드바 → **"Triggers"** 클릭

5. **라우트 추가**
   - **"Add route"** 버튼 클릭
   - **Zone:** `hyunshu.com` 선택
   - **Route:** `hyunshu.com/check*` 입력
   - **Worker:** `check` 선택
   - **"Save"** 또는 **"Add route"** 클릭

6. **확인**
   - 브라우저에서 `https://hyunshu.com/check` 접속하여 사이트가 정상적으로 로드되는지 확인

---

## 7. 다른 하위 경로에 정적 사이트를 추가 배포할 때 재사용할 수 있는 패턴

### 예시: hyunshu.com/blog* 경로에 새 정적 사이트 배포

**패턴 요약:**
1. **새 프로젝트 폴더 생성** (예: `blog` 폴더)
2. **새 `wrangler.jsonc` 생성** (`name: "blog"`, `main: "src/index.ts"` 등)
3. **동일한 `src/index.ts` Worker 코드 재사용** (경로만 `/blog`로 변경)
4. **빌드 및 배포** (`npm run build && npx wrangler deploy`)
5. **Cloudflare 대시보드에서 새 라우트 추가** (`hyunshu.com/blog*`)

**구체적인 예시:**

#### 1. 새 프로젝트 폴더에 `wrangler.jsonc` 생성

```jsonc
{
  "name": "blog",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-03",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "run_worker_first": false
}
```

#### 2. `src/index.ts` Worker 코드 (경로만 변경)

```typescript
interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const response = await env.ASSETS.fetch(request);
      
      if (response.status === 404) {
        // /blog 경로로 변경
        if (url.pathname.startsWith('/blog')) {
          const indexRequest = new Request(
            new URL('/blog/index.html', request.url),
            request
          );
          const fallbackResponse = await env.ASSETS.fetch(indexRequest);
          
          if (fallbackResponse.status === 404) {
            return new Response('Not Found', { status: 404 });
          }
          
          return fallbackResponse;
        }
        
        return new Response('Not Found', { status: 404 });
      }
      
      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        statusText: 'Worker Error',
      });
    }
  },
} satisfies ExportedHandler<Env>;
```

#### 3. 배포 및 라우트 연결

```bash
# 새 프로젝트 폴더에서
npm run build
npx wrangler deploy
```

그리고 Cloudflare 대시보드에서 `hyunshu.com/blog*` 라우트를 `blog` Worker에 연결합니다.

**핵심 포인트:**
- 각 정적 사이트마다 **별도의 Worker**를 생성합니다 (`check`, `blog`, `lab` 등)
- 각 Worker는 **독립적인 `wrangler.jsonc`** 설정을 가집니다
- Worker 코드는 **경로만 변경**하여 재사용 가능합니다
- Cloudflare 대시보드에서 **각각의 라우트를 별도로 연결**합니다
- 기존 라우트(`portfolio*`, `check*`)는 **전혀 건드리지 않아도** 됩니다

---

## 완료 체크리스트

- [ ] `package.json`에 `build` 스크립트 확인
- [ ] `wrangler.jsonc` 파일 생성 및 설정 완료
- [ ] `src/index.ts` Worker 파일 생성 완료
- [ ] `npm install` 실행 완료
- [ ] `npm run build` 실행 완료 (`./dist` 폴더 생성 확인)
- [ ] `npx wrangler deploy` 실행 완료
- [ ] Cloudflare 대시보드에서 `hyunshu.com/check*` 라우트 연결 완료
- [ ] `https://hyunshu.com/check` 접속하여 사이트 확인 완료

---

## 문제 해결

### 배포 시 에러가 발생하는 경우

1. **Wrangler 로그인 확인**
   ```bash
   npx wrangler login
   ```

2. **빌드 결과물 확인**
   ```bash
   ls -la dist/
   ```
   `index.html` 파일이 있는지 확인하세요.

3. **wrangler.jsonc 문법 확인**
   JSONC 형식이 올바른지 확인하세요 (주석 사용 가능).

### 라우트가 작동하지 않는 경우

1. Cloudflare 대시보드에서 라우트가 올바르게 추가되었는지 확인
2. Worker 이름과 라우트의 Worker 선택이 일치하는지 확인
3. DNS 설정이 올바른지 확인 (Cloudflare 프록시 활성화)

---

**작성일:** 2025-01-03  
**대상:** Cloudflare Workers + Static Assets를 사용한 정적 사이트 배포

