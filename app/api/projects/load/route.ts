import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const versionId = searchParams.get('versionId'); // Optional: load specific version
    const includeConversations = searchParams.get('includeConversations') === 'true';

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    logger.info('Loading project data', { projectId, versionId, includeConversations });

    // Get user from auth header
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    // 1. Get project info (conditionally filter by owner when authenticated)
    let projectQuery = supabase
      .from('projects')
      .select('*')
      .eq('id', projectId) as any;
    if (userId) {
      projectQuery = projectQuery.eq('owner_id', userId);
    }
    const { data: project, error: projectError } = await projectQuery.single();

    if (projectError || !project) {
      logger.warn('Project not found or access denied', { projectId, userId });
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 2. Get latest version or specific version
    const targetVersionId = versionId || project.metadata?.last_version;

    if (!targetVersionId) {
      return NextResponse.json({
        project,
        codeFiles: [],
        conversations: [],
        sandboxState: null,
        versions: []
      });
    }

    // 3. Get code files for the version
    const { data: codeFiles, error: filesError } = await supabase
      .from('project_code_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('version_id', targetVersionId)
      .eq('is_active', true)
      .order('file_path');

    if (filesError) {
      logger.error('Failed to load code files', filesError);
      throw filesError;
    }

    // 4. Get conversations if requested
    let conversations = [];
    if (includeConversations) {
      const { data: convData, error: convError } = await supabase
        .from('project_conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true });

      if (convError) {
        logger.error('Failed to load conversations', convError);
      } else {
        conversations = convData || [];
      }
    }

    // 5. Get sandbox state
    const { data: sandboxState, error: sandboxError } = await supabase
      .from('project_sandbox_state')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (sandboxError && sandboxError.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error('Failed to load sandbox state', sandboxError);
    }

    // 6. Get version history
    const { data: versions, error: versionsError } = await supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10); // Get last 10 versions

    if (versionsError) {
      logger.error('Failed to load version history', versionsError);
    }

    // 7. Get analytics summary
    const { data: analytics, error: analyticsError } = await supabase
      .from('project_analytics')
      .select('event_type, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (analyticsError) {
      logger.error('Failed to load analytics', analyticsError);
    }

    // Prepare response data
    const projectData = {
      project,
      currentVersion: targetVersionId,
      codeFiles: codeFiles || [],
      conversations: conversations || [],
      sandboxState: sandboxState || null,
      versions: versions || [],
      analytics: analytics || [],
      summary: {
        totalFiles: codeFiles?.length || 0,
        totalVersions: versions?.length || 0,
        lastModified: project.updated_at,
        totalSize: codeFiles?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0
      }
    };

    logger.info('Successfully loaded project data', {
      projectId,
      versionId: targetVersionId,
      fileCount: codeFiles?.length || 0,
      conversationCount: conversations?.length || 0
    });

    return NextResponse.json(projectData);

  } catch (error) {
    logger.error('Failed to load project data', error as Error, {
      projectId: new URL(request.url).searchParams.get('projectId')
    });

    return NextResponse.json(
      { error: 'Failed to load project data', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST endpoint for loading with authentication
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { projectId, versionId, includeConversations = false } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get user from auth header
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Reuse the GET logic but with authentication
    const getRequest = new NextRequest(
      `${request.nextUrl.origin}/api/projects/load?projectId=${projectId}&versionId=${versionId || ''}&includeConversations=${includeConversations}`,
      {
        headers: request.headers
      }
    );

    return GET(getRequest);

  } catch (error) {
    logger.error('Failed to load project data via POST', error as Error);

    return NextResponse.json(
      { error: 'Failed to load project data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
