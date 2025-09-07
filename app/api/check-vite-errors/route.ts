import { NextResponse } from 'next/server';

declare global {
  // Collected via /api/report-vite-error
  var viteErrors: any[];
}

export async function GET() {
  try {
    const reported = Array.isArray(global.viteErrors) ? global.viteErrors : [];

    return NextResponse.json({
      success: true,
      errors: reported,
      count: reported.length
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}