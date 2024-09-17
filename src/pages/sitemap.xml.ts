import type { APIRoute } from 'astro';

const URLS_PER_SITEMAP = 5000;

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime.env.DB;

  const { count } = await db
    .prepare('SELECT COUNT(*) as count from page')
    .first();

  const numberOfSitemaps = Math.ceil(count / URLS_PER_SITEMAP);

  const now = new Date();
  const currentTime = now.toISOString();

  const sitemaps = Array.from({ length: numberOfSitemaps }).map(
    (_, index) =>
      `<sitemap>
          <loc>https://robotsblogging.com/sitemaps/${index}.xml</loc>
          <lastmod>${currentTime}</lastmod>
      </sitemap>
    `
  );

  // todo: return from a bucket & generate that once a day
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemaps}
  </sitemapindex>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
