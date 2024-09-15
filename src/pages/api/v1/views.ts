import type { APIRoute } from 'astro';

export const GET: APIRoute = (req) => {
  return new Response(
    JSON.stringify({
      data: {
        views: 1000,
      },
    }),
    { status: 200 }
  );
};
