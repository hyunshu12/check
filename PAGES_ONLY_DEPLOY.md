# Cloudflare Pages만 사용한 배포 방법 (Worker 없이)

Worker 없이 Cloudflare Pages만 사용하여 배포하는 가장 간단한 방법입니다.

## 방법 1: 서브도메인 사용 (가장 간단) ⭐ 권장

`hyunshu.com/check` 대신 `check.hyunshu.com`으로 배포하는 방법입니다.

### 장점
- ✅ Worker 설정 불필요
- ✅ 가장 간단하고 빠름
- ✅ 추가 비용 없음
- ✅ 설정이 간단함

### 단계별 가이드

1. **Cloudflare Pages 프로젝트 배포**
   - [Cloudflare Pages](https://pages.cloudflare.com/) 접속
   - 프로젝트 생성 및 배포 (기존 프로젝트 사용 가능)

2. **빌드 설정**
   ```
   Build command: npm run build
   Build output directory: dist
   ```

3. **vite.config.ts 수정**
   ```typescript
   base: '/',  // 서브도메인은 루트 경로 사용
   ```

4. **커스텀 도메인 추가**
   - Pages 프로젝트 > **Custom domains** 섹션
   - **Set up a custom domain** 클릭
   - 도메인 입력: `check.hyunshu.com`
   - Cloudflare가 자동으로 DNS 설정

5. **완료!**
   - `https://check.hyunshu.com`으로 접속하면 정상 작동합니다

### DNS 설정 확인

Cloudflare가 자동으로 DNS 레코드를 생성하지만, 수동으로 확인하려면:
- DNS 타입: `CNAME`
- 이름: `check`
- 대상: `[프로젝트명].pages.dev`

## 방법 2: 루트 도메인에 배포 (hyunshu.com 전체 사용)

만약 `hyunshu.com`에 다른 사이트가 없고 전체 도메인을 이 프로젝트에 사용한다면:

1. **vite.config.ts 수정**
   ```typescript
   base: '/',  // 루트 경로 사용
   ```

2. **커스텀 도메인 추가**
   - Pages 프로젝트 > **Custom domains**
   - 도메인 입력: `hyunshu.com`
   - Cloudflare가 자동으로 DNS 설정

3. **접속**
   - `https://hyunshu.com`으로 접속
   - `/check` 경로는 사용하지 않음

⚠️ **주의**: 이 방법은 `hyunshu.com` 전체를 이 프로젝트에 사용하므로, 다른 사이트가 있다면 사용할 수 없습니다.

## 방법 3: Pages Functions 사용 (고급)

Cloudflare Pages Functions를 사용하여 라우팅할 수 있지만, 이는 복잡하고 Worker와 유사한 설정이 필요합니다.

## 권장 방법

**서브도메인 사용 (방법 1)**을 강력히 권장합니다:
- 가장 간단하고 빠름
- Worker 설정 불필요
- 추가 비용 없음
- 유지보수가 쉬움

## 설정 변경 가이드

### 서브도메인으로 변경하는 경우

1. **vite.config.ts 수정**
   ```typescript
   base: '/',
   ```

2. **빌드 및 배포**
   ```bash
   npm run build
   git add .
   git commit -m "서브도메인 배포를 위해 base 경로 변경"
   git push
   ```

3. **Cloudflare Pages에서 커스텀 도메인 추가**
   - `check.hyunshu.com` 추가

4. **완료!**

## 비교

| 방법 | URL | Worker 필요 | 설정 난이도 | 권장도 |
|------|-----|------------|------------|--------|
| 서브도메인 | `check.hyunshu.com` | ❌ | ⭐ 쉬움 | ⭐⭐⭐⭐⭐ |
| 루트 도메인 | `hyunshu.com` | ❌ | ⭐ 쉬움 | ⭐⭐⭐ (다른 사이트 없을 때만) |
| 서브디렉토리 | `hyunshu.com/check` | ✅ | ⭐⭐⭐ 어려움 | ⭐⭐ |

## 결론

**서브도메인(`check.hyunshu.com`)을 사용하는 것이 가장 간단하고 권장되는 방법입니다!**

Worker 설정 없이도 바로 사용할 수 있고, 추가 비용도 없습니다.

