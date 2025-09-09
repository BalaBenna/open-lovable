import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

function getSupabase(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();
    // Read user token from request and forward it to Supabase so RLS sees auth.uid()
    const authHeader = req.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const supabase = getSupabase(bearerToken || undefined);

    // Verify token and get user id
    let ownerId: string | null = null;
    if (bearerToken) {
      const { data: userData } = await supabase.auth.getUser(bearerToken);
      ownerId = userData?.user?.id ?? null;
    }

    if (!ownerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Generate IDs
    const id = (globalThis as any).crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    // Generate a human-readable project key
    const projectKey = `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;

    const { data, error } = await supabase.from('projects').insert({
      id,
      title: title || 'Untitled Project',
      description: description || '',
      owner_id: ownerId,
      project_key: projectKey
    }).select().single();

    if (error) {
      logger.error('Failed to create project', error);
      throw error;
    }

    logger.info('Project created successfully', {
      projectId: data.id,
      projectKey: data.project_key,
      ownerId
    });

    return NextResponse.json({
      id: data.id,
      projectKey: data.project_key,
      title: data.title
    });
  } catch (e) {
    logger.error('Project creation failed', e as Error);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

