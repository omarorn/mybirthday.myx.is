interface Env {
  APP_NAME?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({
        ok: true,
        portal: 'mybirthday',
        domain: 'mybirthday.myx.is'
      });
    }

    return new Response(
      JSON.stringify({
        portal: 'mybirthday',
        app: env.APP_NAME ?? 'MYX.IS',
        status: 'scaffold-ready'
      }),
      {
        headers: { 'content-type': 'application/json; charset=utf-8' }
      }
    );
  }
};
