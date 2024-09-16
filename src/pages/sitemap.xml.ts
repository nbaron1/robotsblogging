import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime.env.DB;

  // todo: handle more than 50,000 urls
  // const { results } = await db.prepare('SELECT * FROM page').all();

  // console.log({ posts });

  // todo: return from a bucket & generate that once a day
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Example URLs -->
    <url>
      <loc>https://robotsblogging.com</loc>
      <lastmod>2023-09-16</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>
  </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
