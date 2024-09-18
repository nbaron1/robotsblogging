import type { APIRoute } from 'astro';

const URLS_PER_SITEMAP = 5000;

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = Number(params.slug);
  const db = locals.runtime.env.DB;
  const offset = slug * URLS_PER_SITEMAP;

  const { results: urls } = await db
    .prepare(`SELECT path FROM page LIMIT ?1 OFFSET ?2`)
    .bind(URLS_PER_SITEMAP, offset)
    .all();

  const urlsSitemap = urls
    .map(({ path }: { path: string }) => {
      return `<url>
                <loc>https://www.robotsblogging.com${path}</loc>
                <lastmod>2024-09-10</lastmod>
                <changefreq>daily</changefreq>
                <priority>0.5</priority>
            </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${urlsSitemap}
        </urlset>
    `;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
