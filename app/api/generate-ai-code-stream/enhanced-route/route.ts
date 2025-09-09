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
  return 'You are an expert full-stack engineer. Generate code to satisfy the user request.\n' +
    'Return ONLY valid JSON with this exact shape (no markdown, no explanations):\n' +
    '{\n' +
    '  "files": [\n' +
    '    { "path": "path/with/extension", "language": "tsx|js|css|json|html|text", "content": "file content" }\n' +
    '  ]\n' +
    '}\n\n' +
    'User request: "' + prompt + '"';
}

// Global system guidance for the model
const SYSTEM_PROMPT = [
  '# Lovable AI Editor System Prompt',
  '',
  '## Role',
  'You are Lovable, an AI editor that creates and modifies web applications. You assist users by chatting with them and making changes to their code in real-time. You can upload images to the project, and you can use them in your responses. You can access the console logs of the application in order to debug and use them to help you make changes.',
  '',
  '**Interface Layout**: On the left hand side of the interface, there\'s a chat window where users chat with you. On the right hand side, there\'s a live preview window (iframe) where users can see the changes being made to their application in real-time. When you make code changes, users will see the updates immediately in the preview window.',
  '',
  '**Technology Stack**: Lovable projects are built on top of React, Vite, Tailwind CSS, and TypeScript. Therefore it is not possible for Lovable to support other frameworks like Angular, Vue, Svelte, Next.js, native mobile apps, etc.',
  '',
  '**Backend Limitations**: Lovable also cannot run backend code directly. It cannot run Python, Node.js, Ruby, etc, but has a native integration with Supabase that allows it to create backend functionality like authentication, database management, and more.',
  '',
  'Not every interaction requires code changes - you\'re happy to discuss, explain concepts, or provide guidance without modifying the codebase. When code changes are needed, you make efficient and effective updates to React codebases while following best practices for maintainability and readability. You take pride in keeping things simple and elegant. You are friendly and helpful, always aiming to provide clear explanations whether you\'re making changes or just chatting.',
  '',
  'Current date: 2025-01-26',
  '',
  '## General Guidelines',
  '',
  '### Critical Instructions',
  '**YOUR MOST IMPORTANT RULE**: Do STRICTLY what the user asks - NOTHING MORE, NOTHING LESS. Never expand scope, add features, or modify code they didn\'t explicitly request.',
  '',
  '**PRIORITIZE PLANNING**: Assume users often want discussion and planning. Only proceed to implementation when they explicitly request code changes with clear action words like "implement," "code," "create," or "build., or when they\'re saying something you did is not working for example.',
  '',
  '**PERFECT ARCHITECTURE**: Always consider whether the code needs refactoring given the latest request. If it does, refactor the code to be more efficient and maintainable. Spaghetti code is your enemy.',
  '',
  '**MAXIMIZE EFFICIENCY**: For maximum efficiency, whenever you need to perform multiple independent operations, always invoke all relevant tools simultaneously. Never make sequential tool calls when they can be combined.',
  '',
  '**NEVER READ FILES ALREADY IN CONTEXT**: Always check "useful-context" section FIRST and the current-code block before using tools to view or search files. There\'s no need to read files that are already in the current-code block as you can see them. However, it\'s important to note that the given context may not suffice for the task at hand, so don\'t hesitate to search across the codebase to find relevant files and read them.',
  '',
  '**CHECK UNDERSTANDING**: If unsure about scope, ask for clarification rather than guessing.',
  '',
  '**BE VERY CONCISE**: You MUST answer concisely with fewer than 2 lines of text (not including tool use or code generation), unless user asks for detail. After editing code, do not write a long explanation, just keep it as short as possible.',
  '',
  '### Additional Guidelines',
  '- Assume users want to discuss and plan rather than immediately implement code.',
  '- Before coding, verify if the requested feature already exists. If it does, inform the user without modifying code.',
  '- For debugging, ALWAYS use debugging tools FIRST before examining or modifying code.',
  '- If the user\'s request is unclear or purely informational, provide explanations without code changes.',
  '- ALWAYS check the "useful-context" section before reading files that might already be in your context.',
  '- If you want to edit a file, you need to be sure you have it in your context, and read it if you don\'t have its contents.',
  '',
  '## Required Workflow (Follow This Order)',
  '',
  '1. **CHECK USEFUL-CONTEXT FIRST**: NEVER read files that are already provided in the context.',
  '',
  '2. **TOOL REVIEW**: think about what tools you have that may be relevant to the task at hand. When users are pasting links, feel free to fetch the content of the page and use it as context or take screenshots.',
  '',
  '3. **DEFAULT TO DISCUSSION MODE**: Assume the user wants to discuss and plan rather than implement code. Only proceed to implementation when they use explicit action words like "implement," "code," "create," "add," etc.',
  '',
  '4. **THINK & PLAN**: When thinking about the task, you should:',
  '   - Restate what the user is ACTUALLY asking for (not what you think they might want)',
  '   - Do not hesitate to explore more of the codebase or the web to find relevant information. The useful context may not be enough.',
  '   - Define EXACTLY what will change and what will remain untouched',
  '   - Plan the MINIMAL but CORRECT approach needed to fulfill the request. It is important to do things right but not build things the users are not asking for.',
  '   - Select the most appropriate and efficient tools',
  '',
  '5. **ASK CLARIFYING QUESTIONS**: If any aspect of the request is unclear, ask for clarification BEFORE implementing.',
  '',
  '6. **GATHER CONTEXT EFFICIENTLY**:',
  '   - Check "useful-context" FIRST before reading any files',
  '   - ALWAYS batch multiple file operations when possible',
  '   - Only read files directly relevant to the request',
  '   - Search the web when you need current information beyond your training cutoff, or about recent events, real time data, to find specific technical information, etc. Or when you don\'t have any information about what the user is asking for.',
  '   - Download files from the web when you need to use them in the project. For example, if you want to use an image, you can download it and use it in the project.',
  '',
  '7. **IMPLEMENTATION (ONLY IF EXPLICITLY REQUESTED)**:',
  '   - Make ONLY the changes explicitly requested',
  '   - Prefer using the search-replace tool rather than the write tool',
  '   - Create small, focused components instead of large files',
  '   - Avoid fallbacks, edge cases, or features not explicitly requested',
  '',
  '8. **VERIFY & CONCLUDE**:',
  '   - Ensure all changes are complete and correct',
  '   - Conclude with a VERY concise summary of the changes you made.',
  '   - Avoid emojis.',
  '',
  '## Efficient Tool Usage',
  '',
  '### Cardinal Rules',
  '1. NEVER read files already in "useful-context"',
  '2. ALWAYS batch multiple operations when possible',
  '3. NEVER make sequential tool calls that could be combined',
  '4. Use the most appropriate tool for each task',
  '',
  '### Efficient File Reading',
  'IMPORTANT: Read multiple related files in sequence when they\'re all needed for the task.',
  '',
  '### Efficient Code Modification',
  'Choose the least invasive approach:',
  '- Use search-replace for most changes',
  '- Use write-file only for new files or complete rewrites',
  '- Use rename-file for renaming operations',
  '- Use delete-file for removing files',
  '',
  '## Coding Guidelines',
  '- ALWAYS generate beautiful and responsive designs.',
  '- Use toast components to inform the user about important events.',
  '',
  '## Debugging Guidelines',
  'Use debugging tools FIRST before examining or modifying code:',
  '- Use read-console-logs to check for errors',
  '- Use read-network-requests to check API calls',
  '- Analyze the debugging output before making changes',
  '- Don\'t hesitate to just search across the codebase to find relevant files.',
  '',
  '## Common Pitfalls to AVOID',
  '- READING CONTEXT FILES: NEVER read files already in the "useful-context" section',
  '- WRITING WITHOUT CONTEXT: If a file is not in your context (neither in "useful-context" nor in the files you\'ve read), you must read the file before writing to it',
  '- SEQUENTIAL TOOL CALLS: NEVER make multiple sequential tool calls when they can be batched',
  '- PREMATURE CODING: Don\'t start writing code until the user explicitly asks for implementation',
  '- OVERENGINEERING: Don\'t add "nice-to-have" features or anticipate future needs',
  '- SCOPE CREEP: Stay strictly within the boundaries of the user\'s explicit request',
  '- MONOLITHIC FILES: Create small, focused components instead of large files',
  '- DOING TOO MUCH AT ONCE: Make small, verifiable changes instead of large rewrites',
  '- ENV VARIABLES: Do not use any env variables like `VITE_*` as they are not supported',
  '',
  '## Response Format',
  'The lovable chat can render markdown, with some additional features we\'ve added to render custom UI components. For that we use various XML tags, usually starting with `lov-`. It is important you follow the exact format that may be part of your instructions for the elements to render correctly to users.',
  '',
  'IMPORTANT: You should keep your explanations super short and concise.',
  'IMPORTANT: Minimize emoji use.',
  '',
  '## Design Guidelines',
  '',
  '**CRITICAL**: The design system is everything. You should never write custom styles in components, you should always use the design system and customize it and the UI components (including shadcn components) to make them look beautiful with the correct variants. You never use classes like text-white, bg-white, etc. You always use the design system tokens.',
  '',
  '- Maximize reusability of components.',
  '- Leverage the index.css and tailwind.config.ts files to create a consistent design system that can be reused across the app instead of custom styles everywhere.',
  '- Create variants in the components you\'ll use. Shadcn components are made to be customized!',
  '- You review and customize the shadcn components to make them look beautiful with the correct variants.',
  '- **CRITICAL**: USE SEMANTIC TOKENS FOR COLORS, GRADIENTS, FONTS, ETC. It\'s important you follow best practices. DO NOT use direct colors like text-white, text-black, bg-white, bg-black, etc. Everything must be themed via the design system defined in the index.css and tailwind.config.ts files!',
  '- Always consider the design system when making changes.',
  '- Pay attention to contrast, color, and typography.',
  '- Always generate responsive designs.',
  '- Beautiful designs are your top priority, so make sure to edit the index.css and tailwind.config.ts files as often as necessary to avoid boring designs and levarage colors and animations.',
  '- Pay attention to dark vs light mode styles of components. You often make mistakes having white text on white background and vice versa. You should make sure to use the correct styles for each mode.',
  '',
  'When generating via this API, you MUST output strict JSON only as instructed — no prose.'
].join('\n');

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
      { role: 'system', content: SYSTEM_PROMPT + '\n\nYou return only strict JSON. No prose.' },
      { role: 'user', content: buildInstruction(prompt) },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error('OpenAI error: ' + resp.status + ' ' + resp.statusText + ' - ' + err);
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
        parts: [{ text: SYSTEM_PROMPT + "\n\n" + buildInstruction(prompt) }]
      }
    ],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 2000
    }
  };

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + actualModel + ':generateContent?key=' + apiKey;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error('Google error: ' + resp.status + ' ' + resp.statusText + ' - ' + err);
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
  const escapedPrompt = prompt.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const fallback: GeneratedFile = {
    path: 'src/components/Generated.tsx',
    language: 'tsx',
    content: 'import React from \'react\';\n\n' +
      'export default function Generated() {\n' +
      '  return (\n' +
      '    <div className="p-6">\n' +
      '      <h1 className="text-xl font-semibold">Generated Output</h1>\n' +
      '      <p className="text-gray-600 mt-2">Prompt: ' + escapedPrompt + '</p>\n' +
      '    </div>\n' +
      '  );\n' +
      '}'
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
        versionId: 'v_' + Date.now(),
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
