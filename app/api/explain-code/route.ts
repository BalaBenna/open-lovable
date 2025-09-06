import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { appConfig } from '@/config/app.config';

export async function POST(request: NextRequest) {
  try {
    const { code, language, context, model } = await request.json();

    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Code is required for explanation'
      }, { status: 400 });
    }

    console.log('[explain-code] Generating explanation for code:', {
      language: language || 'unknown',
      codeLength: code.length,
      model: model || appConfig.ai.defaultModel
    });

    // Create AI provider based on model
    let aiProvider;
    const selectedModel = model || appConfig.ai.defaultModel;

    try {
      if (selectedModel.startsWith('openai/')) {
        const openai = createOpenAI({
          apiKey: process.env.OPENAI_API_KEY || '',
        });
        aiProvider = openai(selectedModel.replace('openai/', ''));
      } else if (selectedModel.startsWith('anthropic/')) {
        const anthropic = createAnthropic({
          apiKey: process.env.ANTHROPIC_API_KEY || '',
        });
        aiProvider = anthropic(selectedModel.replace('anthropic/', ''));
      } else if (selectedModel.startsWith('google/')) {
        const google = createGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '',
        });
        aiProvider = google(selectedModel.replace('google/', ''));
      } else if (selectedModel.startsWith('groq/')) {
        const groq = createGroq({
          apiKey: process.env.GROQ_API_KEY || '',
        });
        aiProvider = groq(selectedModel.replace('groq/', ''));
      } else {
        throw new Error(`Unsupported model: ${selectedModel}`);
      }
    } catch (providerError) {
      console.error('[explain-code] Provider creation error:', providerError);
      return NextResponse.json({
        success: false,
        error: `Failed to create AI provider: ${(providerError as Error).message}`
      }, { status: 500 });
    }

    const systemPrompt = `You are an expert code explainer. Your job is to analyze code and provide clear, comprehensive explanations that help developers understand what the code does, how it works, and why it's written that way.

## Your Explanation Should Include:

1. **Overview**: What does this code do at a high level?
2. **Key Components**: Break down the main parts/functions/classes
3. **Logic Flow**: How does the code work step by step?
4. **Design Patterns**: What patterns or best practices are used?
5. **Dependencies**: What external libraries or APIs are used?
6. **Performance Considerations**: Any notable performance aspects
7. **Potential Issues**: Are there any potential problems or areas for improvement?

## Style Guidelines:
- Use clear, simple language
- Provide specific examples from the code
- Use bullet points and sections for readability
- Explain technical terms when necessary
- Be encouraging and educational

${language ? `The code is written in ${language}.` : ''}
${context ? `Additional context: ${context}` : ''}`;

    try {
      const { text: explanation } = await generateText({
        model: aiProvider,
        system: systemPrompt,
        prompt: `Please explain this code:

\`\`\`${language || 'javascript'}
${code}
\`\`\``,
        temperature: 0.3,
      });

      console.log('[explain-code] Successfully generated explanation');

      return NextResponse.json({
        success: true,
        explanation: explanation.trim(),
        metadata: {
          model: selectedModel,
          language: language || 'unknown',
          codeLength: code.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (aiError) {
      console.error('[explain-code] AI generation error:', aiError);
      return NextResponse.json({
        success: false,
        error: `Failed to generate explanation: ${(aiError as Error).message}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[explain-code] API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
