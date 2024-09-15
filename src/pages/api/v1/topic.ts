import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
  return new Response('Hello from the API', { status: 200 });
};
