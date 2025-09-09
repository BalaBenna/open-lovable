import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'google/gemini-2.5-pro' } = await request.json();

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }

    // Create a stream for real-time updates
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Function to send progress updates
    const sendProgress = async (data: any) => {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      await writer.write(encoder.encode(message));
    };

    // Send an immediate test message to verify connection
    const testMessage = {
      type: 'conversation',
      text: `🔗 **Connection Test**\n\nReceived your request: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\nStarting analysis with ${model}...\n\n---`,
      isPlanning: false
    };

    await sendProgress(testMessage);

    // Start processing in background
    (async () => {
      try {
        // Send initial status
        await sendProgress({
          type: 'status',
          message: '🤔 Analyzing your request and understanding requirements...'
        });

        // Simulate some processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send a simple response
        await sendProgress({
          type: 'stream',
          text: `<file path="src/App.tsx">
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Hello World
        </h1>
        <p className="text-gray-600">
          Generated from: ${prompt}
        </p>
      </div>
    </div>
  );
}

export default App;
</file>`
        });

        // Send completion message
        await sendProgress({
          type: 'complete',
          generatedCode: `<file path="src/App.tsx">
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Hello World
        </h1>
        <p className="text-gray-600">
          Generated from: ${prompt}
        </p>
      </div>
    </div>
  );
}

export default App;
</file>`
        });

      } catch (error) {
        console.error('Streaming error:', error);
        await sendProgress({
          type: 'error',
          message: 'An error occurred during code generation'
        });
      } finally {
        await writer.close();
      }
    })();

    // Return the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
