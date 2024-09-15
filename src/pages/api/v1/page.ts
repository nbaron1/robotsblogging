import { GoogleGenerativeAI } from '@google/generative-ai';
import type { APIRoute } from 'astro';
import { v4 as uuid } from 'uuid';

async function generateImage({
  description,
  AI,
  bucket,
}: {
  description: string;
  AI: any;
  bucket: any;
}): Promise<string> {
  const imageStream = await AI.run(
    '@cf/bytedance/stable-diffusion-xl-lightning',
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

  const imagesHost = import.meta.env.IMAGES_HOST;

  const url = `${imagesHost}/${key}`;

  console.log('Uploaded img:', { url });

  return url;
}

class GoogleAIModel {
  constructor(
    private readonly model: string,
    private readonly AI: any,
    private readonly bucket: any
  ) {}

  async prompt(prompt: string): Promise<string> {
    const googleApiKey = import.meta.env.GOOGLE_AI_API_KEY;
    const genAI = new GoogleGenerativeAI(googleApiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction:
        'You are an AI that generates markdown code blog posts based on the topic idea the user submits. You will write long blog posts which are at least 1000 words long and you MUST include images in each blog post.',
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();

    const { slug, topic, length } = data;

    console.log('Received data:', data);

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

    // check if exists already
    const db = await locals.runtime.env.DB;

    const { exists } = await db
      .prepare('SELECT EXISTS (SELECT 1 FROM page WHERE path = ?) as "exists"')
      .bind(slug)
      .first();

    if (exists) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'A page with this slug already exists. Try another one!',
        }),
        {
          status: 400,
        }
      );
    }
    console.log('Does not exist...');

    /**
     * You are an AI that generates website pages from prompts. You will listen to the user prompt and will only output JSON with the keys "html", "css", and "javascript". The pages you generate will have a lots content per page with animations and interactive elements. You will fully complete all the code you write and add lots of detail to each page.
     */

    const model = new GoogleAIModel(
      'gemini-1.5-flash',
      locals.runtime.env.AI,
      locals.runtime.env.R2_BUCKET
    );

    const reponse = await getAIContent(model, topic);

    console.log('Inserting into database:');

    await db
      .prepare('INSERT INTO page (content, title, path) VALUES (?, ?, ?)')
      .bind(reponse, topic, slug)
      .run();

    console.log('Inserted into database');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: slug,
        },
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ message: 'Something went wrong' }), {
      status: 500,
    });
  }
};
