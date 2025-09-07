import { NextResponse } from 'next/server';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
}

export async function GET() {
  try {
    const health = {
      sandbox: {
        exists: !!global.activeSandbox,
        data: !!global.sandboxData,
        url: global.sandboxData?.url || null,
        sandboxId: global.sandboxData?.sandboxId || null
      },
      vite: {
        reachable: false,
        statusCode: null,
        error: null
      },
      timestamp: new Date().toISOString()
    };

    // Check if Vite server is reachable
    if (global.sandboxData?.url) {
      try {
        const response = await fetch(global.sandboxData.url, {
          method: 'HEAD',
          timeout: 5000 // 5 second timeout
        });
        health.vite.reachable = response.ok;
        health.vite.statusCode = response.status;
      } catch (error: any) {
        health.vite.error = error.message;
      }
    }

    return NextResponse.json({
      success: true,
      health
    });
  } catch (error) {
    console.error('[sandbox-health] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
