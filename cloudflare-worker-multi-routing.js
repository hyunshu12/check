// Cloudflare Worker를 사용한 다중 프로젝트 라우팅
// hyunshu.com/portfolio와 hyunshu.com/check를 각각 다른 Pages 프로젝트로 라우팅

/**
 * 다중 프로젝트 라우팅 Worker
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
      
      // /check 경로는 check 프로젝트로 라우팅
      if (url.pathname.startsWith('/check')) {
        // ⚠️ 실제 check 프로젝트의 Pages URL로 변경하세요!
        const checkPagesUrl = 'https://[check-pages-url].pages.dev';
        
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

