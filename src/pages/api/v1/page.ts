import { GoogleGenerativeAI } from '@google/generative-ai';
import type { APIRoute } from 'astro';

class GoogleAIModel {
  constructor(private readonly model: string) {}

  async prompt(prompt: string): Promise<string> {
    const googleApiKey = import.meta.env.GOOGLE_AI_API_KEY;
    const genAI = new GoogleGenerativeAI(googleApiKey);

    const model = genAI.getGenerativeModel({
      model: this.model,
      systemInstruction:
        'You are an AI that generates markdown code blog post for a topic idea the user submits',
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

    const content = candidates[0].content.parts[0].text;

    if (!content) {
      // todo: add logging
      throw new Error('Missing content');
    }

    return content;
  }
}

const getAIContent = async (model: GoogleAIModel, prompt: string) => {
  return await model.prompt(prompt);
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.formData();
    const path = data.get('path');
    const prompt = data.get('prompt');

    if (!path || !prompt) {
      return new Response(
        JSON.stringify({ message: 'Please provide a path and prompt' }),
        {
          status: 400,
        }
      );
    }

    // access env vars
    // todo: sitemap

    /**
     * You are an AI that generates website pages from prompts. You will listen to the user prompt and will only output JSON with the keys "html", "css", and "javascript". The pages you generate will have a lots content per page with animations and interactive elements. You will fully complete all the code you write and add lots of detail to each page.
     */

    const model = new GoogleAIModel('gemini-1.5-flash');
    const reponse = await getAIContent(model, prompt.toString());

    // todo: streaming the response to client
    const db = locals.runtime.env.DB;

    const statement = db
      .prepare('INSERT INTO page (path, title, content) VALUES (?1, ?2, ?3)')
      .bind(path, prompt, reponse);

    await statement.run();

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/${path}`,
      },
    });
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ message: 'Something went wrong' }), {
      status: 500,
    });
  }
};
