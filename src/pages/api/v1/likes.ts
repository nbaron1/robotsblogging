import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, clientAddress, locals }) => {
  try {
    const params = new URL(request.url).searchParams;
    const id = params.get('id');

    console.log(request.url);

    if (typeof id !== 'string') {
      return new Response('Invalid request', { status: 400 });
    }

    const db = await locals.runtime.env.DB;

    const { liked } = await db
      .prepare(
        'SELECT EXISTS(SELECT 1 FROM user_like WHERE page_id = ?1 AND ip = ?2) AS liked'
      )
      .bind(id, clientAddress)
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
      { status: 200 }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong' }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ clientAddress, request, locals }) => {
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

    // todo: create user based on ip if not exists

    // if liked=true:
    // create new row if it doesn't exist
    // do nothing it exists

    console.log('ip');

    const db = await locals.runtime.env.DB;

    if (liked) {
      await db
        .prepare(
          'INSERT OR IGNORE INTO user_like (page_id, ip) VALUES (?1, ?2)'
        )
        .bind(id, clientAddress)
        .run();

      const { likes } = await db
        .prepare('SELECT COUNT(*) as likes FROM user_like WHERE page_id = ?1')
        .bind(id)
        .first();

      console.log({ likes });

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
      .prepare('DELETE FROM user_like WHERE page_id = ?1 AND ip = ?2')
      .bind(id, clientAddress)
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
      { status: 200 }
    );
  } catch (error) {
    // todo: add logging
    console.log(error);

    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong' }),
      { status: 500 }
    );
  }
};
