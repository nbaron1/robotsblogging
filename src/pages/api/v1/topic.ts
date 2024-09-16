import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const genAI = new GoogleGenerativeAI(locals.runtime.env.GOOGLE_AI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction:
        'You are an AI that generates creative ideas for a blog post. You will respond with only a few words. Do not use any punctuation.',
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

    const result = await chatSession.sendMessage('Generate a blog post idea');
    const text = result.response.text();

    // The AI model seems consistently add a space and a new line character at the end of the text
    const textWithoutNewLines = text.replace(/ \n/g, '');

    return new Response(
      JSON.stringify({ success: true, data: textWithoutNewLines }),
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.log(error);

    // todo: handle logging
    return new Response('Something went wrong', { status: 500 });
  }
};
