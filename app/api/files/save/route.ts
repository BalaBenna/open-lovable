import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { projectId, files } = await req.json();
    if (!projectId || !Array.isArray(files)) {
      return NextResponse.json({ error: 'projectId and files[] required' }, { status: 400 });
    }
    const admin = getSupabaseAdmin();

    // Fetch existing files to compute revisions
    const { data: existing, error: exErr } = await admin
      .from('files')
      .select('id, path, content')
      .eq('project_id', projectId);
    if (exErr) throw exErr;

    const map = new Map<string, { id: number; content: string }>();
    (existing || []).forEach((r: any) => map.set(r.path, { id: r.id, content: r.content }));

    // Prepare revisions for changed files
    const revisions: any[] = [];
    for (const f of files) {
      const prev = map.get(f.path);
      if (prev && prev.content !== f.content) {
        revisions.push({ file_id: prev.id, diff: { old: prev.content, new: f.content } });
      }
    }

    if (revisions.length > 0) {
      const { error: revErr } = await admin.from('revisions').insert(revisions);
      if (revErr) throw revErr;
    }

    // Upsert files in batch
    const rows = files.map((f: any) => ({ project_id: projectId, path: f.path, content: f.content }));
    const { error } = await admin.from('files').upsert(rows, { onConflict: 'project_id,path' });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

