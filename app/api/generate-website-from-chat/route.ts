import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { appConfig } from '@/config/app.config';

export async function POST(request: NextRequest) {
  try {
    const { description, model = appConfig.ai.defaultModel, sandboxId } = await request.json();
    
    if (!description) {
      return NextResponse.json({
        success: false,
        error: 'Description is required'
      }, { status: 400 });
    }

    console.log('[generate-website-from-chat] Generating website from description:', description);
    console.log('[generate-website-from-chat] Using model:', model);

    // Select the appropriate AI provider based on the model
    let provider;
    let actualModel = model;
    
    if (model.startsWith('openai/')) {
      provider = openai(model.replace('openai/', ''));
    } else if (model.startsWith('google/')) {
      // Check if Google API key is available
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
        console.warn('[generate-website-from-chat] Google API key not found, falling back to OpenAI');
        // Fallback to OpenAI GPT-5
        actualModel = 'openai/gpt-5';
        provider = openai('gpt-5');
      } else {
        provider = google(model.replace('google/', ''));
      }
    } else {
      return NextResponse.json({
        success: false,
        error: `Unsupported model: ${model}`
      }, { status: 400 });
    }

    const result = await streamText({
      model: provider,
      temperature: appConfig.ai.defaultTemperature,
      system: `You are an expert web developer and designer. Create a complete, modern React website based on the user's natural language description.

IMPORTANT INSTRUCTIONS:
- Create a COMPLETE, working React application
- Use Tailwind CSS for all styling (no custom CSS files)
- Make it responsive and modern
- Create proper component structure
- Make sure the app actually renders visible content
- Create ALL components that you reference in imports
- Use modern design principles and best practices
- Include proper semantic HTML structure
- Add interactive elements where appropriate
- Use a clean, professional color scheme
- Ensure the website is fully functional

You MUST format your response using XML-like tags to separate different files:

<file path="src/App.jsx">
// Complete App.jsx code here
</file>

<file path="src/components/ComponentName.jsx">
// Complete component code here
</file>

<file path="src/index.css">
// CSS code here
</file>

Focus on creating a beautiful, modern website that matches the user's description.`,
      prompt: `Create a complete React website based on this description: "${description}"

Please generate a full React application with:
1. A main App.jsx file
2. All necessary components
3. Proper styling with Tailwind CSS
4. Responsive design
5. Modern UI/UX

Make it a complete, working website that the user can immediately use.`
    });

    // Convert the stream to text
    let fullText = '';
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    console.log('[generate-website-from-chat] Generated response length:', fullText.length);

    return NextResponse.json({
      success: true,
      description,
      generatedCode: fullText,
      model: actualModel,
      message: `Successfully generated website code from description: "${description}"`
    });

  } catch (error) {
    console.error('[generate-website-from-chat] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
