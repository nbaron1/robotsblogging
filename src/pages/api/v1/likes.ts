import type { APIRoute } from 'astro';
import { v4 as uuid } from 'uuid';

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const params = new URL(request.url).searchParams;
    const id = params.get('id');

    if (typeof id !== 'string') {
      return new Response('Invalid request', { status: 400 });
    }

    const db = await locals.runtime.env.DB;

    const userId = cookies.get('userId')?.value ?? uuid();

    const { liked } = await db
      .prepare(
        'SELECT EXISTS(SELECT 1 FROM user_like WHERE page_id = ?1 AND user_id = ?2) AS liked'
      )
      .bind(id, userId)
      .first();

    const isLiked = liked === 1 ? true : false;

    const { likes } = await db
      .prepare('SELECT COUNT(*) as likes FROM user_like WHERE page_id = ?1')
      .bind(id)
      .first();

    return new Response(
      JSON.stringify({
        data: {
          id,
          liked: isLiked,
          likes,
        },
        success: true,
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': `userId=${userId}; Expires=Fri, 31 Dec 9999 23:59:59 GMT; Path=/`,
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong' }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const body = await request.json();

    const { id, liked } = body;

    if (typeof id !== 'number') {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing page id' }),
        { status: 400 }
      );
    }

    if (typeof liked !== 'boolean') {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing liked data' }),
        { status: 400 }
      );
    }

    const db = await locals.runtime.env.DB;
    const userId = cookies.get('userId')?.value ?? uuid();

    if (liked) {
      await db
        .prepare(
          'INSERT OR IGNORE INTO user_like (page_id, user_id) VALUES (?1, ?2)'
        )
        .bind(id, userId)
        .run();

      const { likes } = await db
        .prepare('SELECT COUNT(*) as likes FROM user_like WHERE page_id = ?1')
        .bind(id)
        .first();

      return new Response(
        JSON.stringify({
          data: {
            id,
            liked: true,
            likes,
          },
          success: true,
        }),
        { status: 200 }
      );
    }

    await db
      .prepare('DELETE FROM user_like WHERE page_id = ?1 AND user_id = ?2')
      .bind(id, userId)
      .run();

    const { likes } = await db
      .prepare('SELECT COUNT(*) as likes FROM user_like WHERE page_id = ?1')
      .bind(id)
      .first();

    return new Response(
      JSON.stringify({
        data: {
          id,
          liked,
          likes: likes,
        },
        success: true,
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': `userId=${userId}; Expires=Fri, 31 Dec 9999 23:59:59 GMT; Path=/`,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong' }),
      { status: 500 }
    );
  }
};
