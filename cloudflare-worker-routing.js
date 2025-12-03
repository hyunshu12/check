// Cloudflare Worker를 사용한 서브디렉토리 라우팅
// 이 파일은 참고용이며, Cloudflare Dashboard에서 직접 설정해야 합니다.

/**
 * hyunshu.com/check 경로를 Cloudflare Pages 프로젝트로 라우팅하는 Worker
 * 
 * 설정 방법:
 * 1. Cloudflare Dashboard > Workers & Pages > Create application > Worker
 * 2. 이 코드를 복사하여 Worker에 붙여넣기
 * 3. Pages 프로젝트 URL을 실제 배포 URL로 변경
 * 4. Worker를 hyunshu.com 도메인에 연결
 */

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      
      // /check 경로로 시작하는 요청을 Pages로 라우팅
      if (url.pathname.startsWith('/check')) {
        // Pages 프로젝트의 배포 URL (실제 배포 후 변경 필요)
        const pagesUrl = 'https://beta-classroom-monitor.pages.dev';
        
        // 요청 URL을 Pages URL로 변환
        const targetUrl = new URL(request.url);
        targetUrl.hostname = new URL(pagesUrl).hostname;
        
        // 경로 처리: /check로 시작하는 경로를 Pages의 /check 경로로 매핑
        // 예: hyunshu.com/check -> pages.dev/check
        // 예: hyunshu.com/check/assets/... -> pages.dev/check/assets/...
        targetUrl.pathname = url.pathname;
        
        // 요청을 Pages로 프록시
        const response = await fetch(targetUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
        
        // 404 에러인 경우 디버깅 정보 추가
        if (response.status === 404) {
          console.log('404 Error:', {
            originalPath: url.pathname,
            targetPath: targetUrl.pathname,
            targetUrl: targetUrl.toString(),
          });
        }
        
        return response;
      }
      
      // /check가 아닌 다른 경로는 기존 사이트로 라우팅
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

