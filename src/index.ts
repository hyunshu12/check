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

