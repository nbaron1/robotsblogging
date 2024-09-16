import { GoogleGenerativeAI } from '@google/generative-ai';
import type { APIRoute } from 'astro';
import { v4 as uuid } from 'uuid';

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
  const imageStream = await AI.run(
    '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    {
      prompt: description,
    }
  );

  const chunks = [];
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

type MessagePayload =
  | {
      step: number;
      completed: boolean;
      message: string;
      type: 'progress';
    }
  | {
      type: 'final';
      path: string;
    };

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
        return 'You are an AI that generates markdown code blog posts based on the topic the user submits. You MUST write blog posts that are at least 600 words long and you MUST include images in each blog post';
      }
      case 'medium': {
        return 'You are an AI that generates markdown code blog posts based on the topic the user submits. You MUST write blog posts that are at least 1,000 words long and you MUST include images in each blog post';
      }
      case 'long': {
        return 'You are an AI that generates markdown code blog posts based on the topic the user submits. You MUST write blog posts that are at least 2,000 words long and you MUST include images in each blog post';
      }
    }
  }

  async prompt(
    prompt: string,
    sendEvent: (data: MessagePayload) => void
  ): Promise<string> {
    sendEvent({
      step: 2,
      message: 'Generating content...',
      completed: false,
      type: 'progress',
    });

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

    sendEvent({
      step: 2,
      message: 'Content generated',
      completed: true,
      type: 'progress',
    });

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

    sendEvent({
      step: 3,
      message: 'Adding the final details...',
      completed: false,
      type: 'progress',
    });

    const imageURLs = await Promise.all(imagePromises);

    sendEvent({
      step: 3,
      message: 'Generation completed',
      completed: true,
      type: 'progress',
    });

    content = content.replace(imageRegex, (_, description) => {
      const imageUrl = imageURLs.shift();
      return `![${description}](${imageUrl})`;
    });

    return content;
  }
}

const getAIContent = async (
  model: GoogleAIModel,
  prompt: string,
  sendEvent: (data: MessagePayload) => void
) => {
  return await model.prompt(prompt, sendEvent);
};

const generateUniqueSlug = async (
  db: any,
  slug: string,
  appendedNumber: null | number
) => {
  const { exists } = await db
    .prepare('SELECT EXISTS (SELECT 1 FROM page WHERE path = ?) as "exists"')
    .bind(slug)
    .first();

  if (exists) {
    return generateUniqueSlug(
      db,
      slug,
      appendedNumber ? appendedNumber + 1 : 1
    );
  }

  if (appendedNumber) {
    return `${slug}-${appendedNumber}`;
  }

  return slug;
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // const data = await request.query json();
    const url = new URL(request.url);

    const slug = url.searchParams.get('slug');
    const topic = url.searchParams.get('topic');
    const length = url.searchParams.get('length');

    if (
      typeof slug !== 'string' ||
      typeof topic !== 'string' ||
      typeof length !== 'string'
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

    const encoder = new TextEncoder();

    const body = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: MessagePayload) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        sendEvent({
          type: 'progress',
          step: 1,
          completed: true,
          message: 'Connected to server',
        });

        const db = await locals.runtime.env.DB;

        const uniqueSlug = await generateUniqueSlug(db, slug, null);

        const model = new GoogleAIModel(
          'gemini-1.5-flash',
          locals.runtime.env.AI,
          locals.runtime.env.R2_BUCKET,
          locals.runtime.env.IMAGES_HOST,
          locals.runtime.env.GOOGLE_AI_API_KEY
        );

        const reponse = await getAIContent(model, topic, sendEvent);

        sendEvent({
          step: 2,
          completed: true,
          message: 'Content generated',
          type: 'progress',
        });

        console.log('Inserting into database:');

        sendEvent({
          step: 4,
          completed: false,
          message: 'Uploading to the cloud...',
          type: 'progress',
        });

        await db
          .prepare('INSERT INTO page (content, title, path) VALUES (?, ?, ?)')
          .bind(reponse, topic, uniqueSlug)
          .run();

        sendEvent({
          step: 4,
          completed: false,
          message: 'Redirecting...',
          type: 'progress',
        });

        sendEvent({
          type: 'final',
          path: uniqueSlug,
        });

        controller.close();

        request.signal.addEventListener('abort', () => {
          controller.close();
        });
      },
    });

    return new Response(body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ message: 'Something went wrong' }), {
      status: 500,
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  return new Response(null, { status: 200 });
};
