import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    const supabase = getSupabase();
    // Get user from Authorization header if present (bearer from Supabase Auth)
    const authHeader = req.headers.get('Authorization');
    let ownerId: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      // Verify token by calling getUser
      const { data: userData } = await supabase.auth.getUser(token);
      ownerId = userData?.user?.id ?? null;
    }

    // Create row
    const id = `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    const { error } = await supabase.from('projects').insert({
      id,
      title: title || 'Untitled',
      created_at: new Date().toISOString(),
      owner_id: ownerId
    });
    if (error) throw error;

    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

