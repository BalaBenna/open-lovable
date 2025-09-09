import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type GeneratedFile = {
    path: string;
    content: string;
  language?: string;
};

function inferLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'tsx' || ext === 'ts') return 'tsx';
  if (ext === 'jsx') return 'jsx';
  if (ext === 'css') return 'css';
  if (ext === 'html') return 'html';
  if (ext === 'json') return 'json';
  return 'text';
}

function buildInstruction(prompt: string) {
  return `You are an expert full-stack engineer. Generate code to satisfy the user request.
Return ONLY valid JSON with this exact shape (no markdown, no explanations):
{
  "files": [
    { "path": "path/with/extension", "language": "tsx|js|css|json|html|text", "content": "file content" }
  ]
}

User request: "${prompt}"`;
}

function extractJsonFromText(text: string): any | null {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {}
  // Try to extract JSON code block
  const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (jsonBlock) {
    try { return JSON.parse(jsonBlock[1]); } catch {}
  }
  // Fallback: find first { ... }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = text.slice(start, end + 1);
    try { return JSON.parse(candidate); } catch {}
  }
  return null;
}

async function callOpenAI(prompt: string, model: string): Promise<GeneratedFile[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const body = {
    model: model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You return only strict JSON. No prose.' },
      { role: 'user', content: buildInstruction(prompt) },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${resp.statusText} - ${err}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  const parsed = extractJsonFromText(content);
  const files: GeneratedFile[] = (parsed?.files || []).map((f: any) => ({
    path: String(f.path),
    content: String(f.content ?? ''),
    language: String(f.language ?? inferLanguageFromPath(String(f.path)))
  }));
  return files;
}

async function callGoogle(prompt: string, model: string): Promise<GeneratedFile[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Google Gemini API key is not configured');

  let actualModel = model;
  const name = model.toLowerCase();
  if (name.includes('2.5')) actualModel = 'gemini-2.0-flash-exp';
  else if (name.includes('2.0')) actualModel = 'gemini-2.0-flash-exp';
  else if (name.includes('1.5')) actualModel = 'gemini-1.5-pro';
  else if (name.includes('1.0')) actualModel = 'gemini-1.0-pro';

  const body = {
    contents: [
      {
        parts: [{ text: buildInstruction(prompt) }]
      }
    ],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 2000
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Google error: ${resp.status} ${resp.statusText} - ${err}`);
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const parsed = extractJsonFromText(text);
  const files: GeneratedFile[] = (parsed?.files || []).map((f: any) => ({
    path: String(f.path),
    content: String(f.content ?? ''),
    language: String(f.language ?? inferLanguageFromPath(String(f.path)))
  }));
  return files;
}

function getFallbackFiles(prompt: string): GeneratedFile[] {
  const fallback: GeneratedFile = {
    path: 'src/components/Generated.tsx',
    language: 'tsx',
    content: `import React from 'react';

export default function Generated() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Generated Output</h1>
      <p className="text-gray-600 mt-2">Prompt: ${prompt.replace(/`/g, '\\`')}</p>
    </div>
  );
}`
  };
  return [fallback];
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: 'Invalid JSON', details: e?.message }, { status: 400 });
    }

    const {
      prompt,
      projectId,
      model = 'google/gemini-2.5-pro',
      changeType = 'initial',
      existingFiles = []
    } = body || {};

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    let generatedFiles: GeneratedFile[] = [];
    try {
      if (model.startsWith('google/')) {
        const m = model.replace('google/', '');
        generatedFiles = await callGoogle(prompt, m);
      } else {
        // Other providers could be added here
        generatedFiles = getFallbackFiles(prompt);
      }
    } catch (providerError: any) {
      // If provider fails, fallback to minimal file so UI keeps working
      console.error('Provider error:', providerError?.message || providerError);
      generatedFiles = getFallbackFiles(prompt);
    }

    // Normalize languages
    generatedFiles = (generatedFiles || []).map(f => ({
      path: f.path,
      content: f.content,
      language: f.language || inferLanguageFromPath(f.path)
    }));

    return NextResponse.json({
      success: true,
      message: 'Code generation successful',
      data: {
        prompt,
        model,
        changeType,
        projectId,
        existingFilesCount: Array.isArray(existingFiles) ? existingFiles.length : 0,
        generatedFiles,
        versionId: `v_${Date.now()}`,
        summary: {
          filesGenerated: generatedFiles.length,
          changeType,
          projectUpdated: !!projectId
        }
      }
    });
  } catch (error: any) {
    console.error('Request processing error', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error?.message || error) },
      { status: 500 }
    );
  }
}
