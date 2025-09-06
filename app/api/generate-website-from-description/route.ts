import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { appConfig } from '@/config/app.config';

export async function POST(request: NextRequest) {
  let description = '';
  let model = appConfig.ai.defaultModel;
  
  try {
    const requestData = await request.json();
    description = requestData.description;
    model = requestData.model || appConfig.ai.defaultModel;
    
    if (!description) {
      return NextResponse.json({
        success: false,
        error: 'Description is required'
      }, { status: 400 });
    }

    console.log('[generate-website-from-description] Generating website from description:', description);
    console.log('[generate-website-from-description] Using model:', model);

    // Select the appropriate AI provider based on the model
    let provider;
    let actualModel = model;
    
    if (model.startsWith('openai/')) {
      provider = openai(model.replace('openai/', ''));
    } else if (model.startsWith('google/')) {
      // Check if Google API key is available
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
        console.warn('[generate-website-from-description] Google API key not found, falling back to OpenAI');
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

    // Step 1: Analyze the description and plan the website structure
    const { text: analysisText } = await generateText({
      model: provider,
      temperature: 0.3,
      system: `You are a web development planning expert. Analyze the user's description and create a detailed plan for the website structure.`,
      prompt: `Analyze this website description and create a detailed plan: "${description}"

Please provide a JSON response with this structure:
{
  "websiteType": "portfolio|landing|ecommerce|blog|business|other",
  "mainSections": ["section1", "section2", "section3"],
  "components": ["Component1", "Component2", "Component3"],
  "colorScheme": "light|dark|colorful|minimal",
  "style": "modern|classic|creative|professional",
  "features": ["feature1", "feature2", "feature3"]
}

Focus on creating a clear, actionable plan for the website.`
    });

    console.log('[generate-website-from-description] Analysis:', analysisText);

    // Parse the analysis
    let analysis;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in analysis');
      }
    } catch (error) {
      console.warn('[generate-website-from-description] Failed to parse analysis, using defaults');
      analysis = {
        websiteType: "business",
        mainSections: ["hero", "features", "contact"],
        components: ["Header", "Hero", "Features", "Contact"],
        colorScheme: "light",
        style: "modern",
        features: ["responsive", "interactive"]
      };
    }

    // Step 2: Generate the main App.jsx file
    const { text: appCode } = await generateText({
      model: provider,
      temperature: appConfig.ai.defaultTemperature,
      system: `You are an expert React developer. Create a complete App.jsx file based on the website plan.

IMPORTANT INSTRUCTIONS:
- Create a COMPLETE, working React application
- Use Tailwind CSS for all styling
- Make it responsive and modern
- Import and use all the components mentioned in the plan
- Create proper component structure
- Make sure the app actually renders visible content
- Use modern design principles and best practices
- Include proper semantic HTML structure
- Add interactive elements where appropriate
- Use a clean, professional color scheme
- Ensure the website is fully functional

Return ONLY the complete App.jsx code without any explanations or markdown formatting.`,
      prompt: `Create a complete App.jsx file for a ${analysis.websiteType} website with these specifications:

Website Type: ${analysis.websiteType}
Main Sections: ${analysis.mainSections.join(', ')}
Components: ${analysis.components.join(', ')}
Color Scheme: ${analysis.colorScheme}
Style: ${analysis.style}
Features: ${analysis.features.join(', ')}

Original Description: "${description}"

Generate a complete, working App.jsx file that imports and uses all the necessary components.`
    });

    // Step 3: Generate individual components
    const components = [];
    for (const componentName of analysis.components) {
      try {
        const { text: componentCode } = await generateText({
          model: provider,
          temperature: appConfig.ai.defaultTemperature,
          system: `You are an expert React developer. Create a complete React component.

IMPORTANT INSTRUCTIONS:
- Create a COMPLETE, working React component
- Use Tailwind CSS for all styling
- Make it responsive and modern
- Export the component as default
- Use proper React patterns and hooks
- Make the component visually appealing
- Include interactive elements where appropriate
- Use semantic HTML elements

Return ONLY the complete component code without any explanations or markdown formatting.`,
          prompt: `Create a ${componentName} component for a ${analysis.websiteType} website.

Website Specifications:
- Type: ${analysis.websiteType}
- Color Scheme: ${analysis.colorScheme}
- Style: ${analysis.style}
- Features: ${analysis.features.join(', ')}

Original Description: "${description}"

Generate a complete, working ${componentName} component that fits the website's design and functionality.`
        });

        components.push({
          name: componentName,
          code: componentCode.trim()
        });
      } catch (error) {
        console.warn(`[generate-website-from-description] Failed to generate ${componentName} component:`, error);
      }
    }

    // Build the files array
    const files = [];
    
    // Add the main App.jsx file
    files.push({
      path: 'src/App.jsx',
      content: appCode.trim()
    });
    
    // Add all generated components
    for (const component of components) {
      files.push({
        path: `src/components/${component.name}.jsx`,
        content: component.code
      });
    }
    
    // Ensure we have the CSS file
    files.push({
      path: 'src/index.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
    });
    
    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate valid website code'
      }, { status: 500 });
    }

    console.log(`[generate-website-from-description] Generated ${files.length} files`);
    console.log(`[generate-website-from-description] Analysis:`, analysis);

    return NextResponse.json({
      success: true,
      description,
      files,
      model: actualModel,
      analysis,
      message: `Successfully generated ${analysis.websiteType} website from description: "${description}"`
    });

  } catch (error) {
    console.error('[generate-website-from-description] Error:', error);
    
    // Provide a fallback response with a basic website
    const fallbackFiles = [
      {
        path: 'src/App.jsx',
        content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to Your Website
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your website has been generated successfully! This is a basic template that you can customize further.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Feature 1</h3>
              <p className="text-gray-600">Add your first feature description here.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Feature 2</h3>
              <p className="text-gray-600">Add your second feature description here.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Feature 3</h3>
              <p className="text-gray-600">Add your third feature description here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`
      },
      {
        path: 'src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
      }
    ];
    
    return NextResponse.json({
      success: true,
      description,
      files: fallbackFiles,
      model: model || 'openai/gpt-5',
      analysis: {
        websiteType: "business",
        mainSections: ["hero", "features"],
        components: ["App"],
        colorScheme: "light",
        style: "modern",
        features: ["responsive", "basic"]
      },
      message: `Generated a basic website template. Original error: ${(error as Error).message}`,
      fallback: true
    });
  }
}

// Function to parse generated code and extract files
function parseGeneratedCode(text: string): Array<{path: string, content: string}> {
  const files: Array<{path: string, content: string}> = [];
  
  // Look for file blocks in the response
  const fileRegex = /```(?:jsx?|tsx?|javascript|typescript|html|css)?\s*\n([\s\S]*?)```/g;
  let match;
  
  while ((match = fileRegex.exec(text)) !== null) {
    const content = match[1].trim();
    
    // Try to determine the file path based on content
    let path = 'src/App.jsx'; // default
    
    if (content.includes('import React') && content.includes('function App') || content.includes('const App')) {
      path = 'src/App.jsx';
    } else if (content.includes('@tailwind') || content.includes('tailwind')) {
      path = 'src/index.css';
    } else if (content.includes('import') && content.includes('from') && !content.includes('function App')) {
      // This might be a component
      const componentName = extractComponentName(content);
      if (componentName) {
        path = `src/components/${componentName}.jsx`;
      }
    }
    
    files.push({ path, content });
  }
  
  // If no files were found in code blocks, try to extract from the text
  if (files.length === 0) {
    // Look for React code patterns
    if (text.includes('import React') || text.includes('function App') || text.includes('const App')) {
      files.push({
        path: 'src/App.jsx',
        content: text
      });
    }
  }
  
  // Ensure we have at least a basic App.jsx
  if (files.length === 0) {
    files.push({
      path: 'src/App.jsx',
      content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Your Website
        </h1>
        <p className="text-gray-600">
          Your website has been generated successfully!
        </p>
      </div>
    </div>
  );
}

export default App;`
    });
  }
  
  // Ensure we have the CSS file
  const hasCssFile = files.some(file => file.path === 'src/index.css');
  if (!hasCssFile) {
    files.push({
      path: 'src/index.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
    });
  }
  
  return files;
}

// Helper function to extract component name from code
function extractComponentName(content: string): string | null {
  // Look for function declarations
  const functionMatch = content.match(/function\s+([A-Z][a-zA-Z0-9]*)/);
  if (functionMatch) {
    return functionMatch[1];
  }
  
  // Look for const declarations
  const constMatch = content.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*=/);
  if (constMatch) {
    return constMatch[1];
  }
  
  return null;
}
