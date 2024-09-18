import { GoogleGenerativeAI } from '@google/generative-ai';
import type { APIRoute } from 'astro';
import { v4 as uuid } from 'uuid';

const getCloudflareAIStream = async (
  AI: any,
  description: string,
  model: string
) => {
  return await AI.run(model, {
    prompt: description,
  });
};

// Add fallback models incase we hit a rate limit
async function getImageStream({
  AI,
  description,
}: {
  AI: any;
  description: string;
}) {
  try {
    const stream = await getCloudflareAIStream(
      AI,
      description,
      '@cf/stabilityai/stable-diffusion-xl-base-1.0'
    );
    return stream;
  } catch (error) {
    try {
      const stream = await getCloudflareAIStream(
        AI,
        description,
        '@cf/bytedance/stable-diffusion-xl-lightning'
      );

      return stream;
    } catch (error) {
      const stream = await getCloudflareAIStream(
        AI,
        description,
        '@cf/lykon/dreamshaper-8-lcm'
      );

      return stream;
    }
  }
}

async function generateImage({
  description,
  AI,
  bucket,
  imagesHost,
}: {
  description: string;
  AI: any;
  bucket: any;
  imagesHost: string;
}): Promise<string> {
  const chunks = [];
  const imageStream = await getImageStream({ AI, description });
  const reader = imageStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const key = `${uuid()}.png`;

  // Combine chunks into a single Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const imageArray = new Uint8Array(totalLength);

  let offset = 0;

  for (const chunk of chunks) {
    imageArray.set(chunk, offset);
    offset += chunk.length;
  }

  console.log('Uploading image to bucket:', key, imageArray.length);

  await bucket.put(key, imageArray, {
    contentType: 'image/png',
  });

  const url = `${imagesHost}/${key}`;

  console.log('Uploaded img:', { url });

  return url;
}

class GoogleAIModel {
  constructor(
    private readonly model: string,
    private readonly AI: any,
    private readonly bucket: any,
    private readonly imagesHost: string,
    private readonly googleAPIKey: string,
    private readonly length: 'short' | 'medium' | 'long' = 'medium'
  ) {}

  private getSystemInstruction() {
    switch (this.length) {
      case 'short': {
        return 'You are an AI that generates markdown code blog posts based on the topic the user submits. You MUST write blog posts that are at least 600 words long and you MUST include images in each blog post. You can include a conclusion but NEVER include a conclusion subheading in your post. NEVER include placeholder text for an image.';
      }
      case 'medium': {
        return 'You are an AI that generates markdown code blog posts based on the topic the user submits. You MUST write blog posts that are at least 1,000 words long and you MUST include images in each blog post. You can include a conclusion but NEVER include a conclusion subheading in your post. NEVER include placeholder text for an image.';
      }
      case 'long': {
        return 'You are an AI that generates markdown code blog posts based on the topic the user submits. You MUST write blog posts that are at least 2,000 words long and you MUST include images in each blog post. You can include a conclusion but NEVER include a conclusion subheading in your post. NEVER include placeholder text for an image.';
      }
    }
  }

  async prompt(prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(this.googleAPIKey);

    const systemInstruction = this.getSystemInstruction();

    const model = genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: systemInstruction,
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    };

    const chatSession = model.startChat({
      generationConfig: generationConfig as any,
    });

    const result = await chatSession.sendMessage(prompt);

    const candidates = result.response.candidates;

    if (!candidates || candidates.length === 0) {
      // todo: add logging
      throw new Error('No candidates found');
    }

    let content = candidates[0].content.parts[0].text;

    if (!content) {
      // todo: add logging
      throw new Error('Missing content');
    }

    const imageRegex = /!\[(.*?)\]\([^)]+\)/g;
    const imagePromises = [];

    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const imageDescription = match[1];
      imagePromises.push(
        generateImage({
          AI: this.AI,
          description: imageDescription,
          bucket: this.bucket,
          imagesHost: this.imagesHost,
        })
      );
    }

    const imageURLs = await Promise.all(imagePromises);

    content = content.replace(imageRegex, (_, description) => {
      const imageUrl = imageURLs.shift();
      return `![${description}](${imageUrl})`;
    });

    return content;
  }
}

const getAIContent = async (model: GoogleAIModel, prompt: string) => {
  return await model.prompt(prompt);
};

const generateUniqueSlug = async (
  db: any,
  slug: string,
  appendedNumber: null | number
) => {
  const parsedSlug =
    appendedNumber !== null ? `${slug}-${appendedNumber}` : slug;

  const { exists } = await db
    .prepare('SELECT EXISTS (SELECT 1 FROM page WHERE path = ?) as "exists"')
    .bind(parsedSlug)
    .first();

  const slugExists = exists === 1;

  if (slugExists) {
    console.log('Slug exists:', parsedSlug);
    return generateUniqueSlug(
      db,
      slug,
      appendedNumber ? appendedNumber + 1 : 1
    );
  }

  if (appendedNumber) {
    return parsedSlug;
  }

  return parsedSlug;
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();

    const { slug, topic, length, token } = data;

    if (!slug || !topic || !length || !token) {
      return new Response(JSON.stringify({ message: 'Invalid body' }), {
        status: 400,
      });
    }

    if (
      typeof slug !== 'string' ||
      typeof topic !== 'string' ||
      typeof length !== 'string' ||
      typeof token !== 'string'
    ) {
      return new Response(JSON.stringify({ message: 'Invalid body' }), {
        status: 400,
      });
    }

    if (slug === '') {
      return new Response(
        JSON.stringify({ success: false, message: 'Slug cannot be empty' }),
        {
          status: 400,
        }
      );
    }

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: JSON.stringify({
          secret: '13',
          response: token,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!verifyResponse.ok) {
      return new Response(null, { status: 403 });
    }

    const isVerifiedData = await verifyResponse.json();

    if (!isVerifiedData.success) {
      return new Response(null, { status: 403 });
    }

    const db = await locals.runtime.env.DB;

    const uniqueSlug = await generateUniqueSlug(db, slug, null);

    const model = new GoogleAIModel(
      'gemini-1.5-flash',
      locals.runtime.env.AI,
      locals.runtime.env.R2_BUCKET,
      locals.runtime.env.IMAGES_HOST,
      locals.runtime.env.GOOGLE_AI_API_KEY
    );

    const reponse = await getAIContent(model, topic);

    await db
      .prepare('INSERT INTO page (content, title, path) VALUES (?, ?, ?)')
      .bind(reponse, topic, uniqueSlug)
      .run();

    return new Response(
      JSON.stringify({
        data: { slug: uniqueSlug, topic, length },
        success: true,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: 'Something went wrong', success: false }),
      {
        status: 500,
      }
    );
  }
};
