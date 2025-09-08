import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder endpoint users can hit to open Supabase OAuth/Linking flow in the future.
  // For now, just returns a simple JSON to confirm wiring.
  return NextResponse.json({ ok: true, message: 'Supabase connect placeholder' });
}

