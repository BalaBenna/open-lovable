import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'active'; // active, archived, all

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

    logger.info('Listing user projects', { userId, limit, offset, status });

    // Build query
    let query = supabase
      .from('projects')
      .select(`
        *,
        versions:project_versions(count),
        files:project_code_files(count),
        conversations:project_conversations(count),
        analytics:project_analytics(count)
      `)
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: projects, error, count } = await query;

    if (error) {
      logger.error('Failed to list projects', error);
      throw error;
    }

    // Get additional metadata for each project
    const projectsWithMetadata = await Promise.all(
      (projects || []).map(async (project) => {
        // Get latest version info
        const { data: latestVersion } = await supabase
          .from('project_versions')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get sandbox state
        const { data: sandboxState } = await supabase
          .from('project_sandbox_state')
          .select('*')
          .eq('project_id', project.id)
          .single();

        return {
          ...project,
          latestVersion: latestVersion || null,
          sandboxState: sandboxState || null,
          stats: {
            totalVersions: project.versions?.[0]?.count || 0,
            totalFiles: project.files?.[0]?.count || 0,
            totalConversations: project.conversations?.[0]?.count || 0,
            totalAnalytics: project.analytics?.[0]?.count || 0
          }
        };
      })
    );

    logger.info('Successfully listed projects', {
      userId,
      projectCount: projectsWithMetadata.length,
      totalCount: count
    });

    return NextResponse.json({
      projects: projectsWithMetadata,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    logger.error('Failed to list projects', error as Error);

    return NextResponse.json(
      { error: 'Failed to list projects', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST endpoint for authenticated requests
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { limit = 20, offset = 0, status = 'active' } = await request.json();

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

    // Get projects with detailed information
    const { data: projects, error, count } = await supabase
      .from('projects')
      .select(`
        *,
        project_versions!inner(*),
        project_code_files(count),
        project_conversations(count),
        project_analytics(count)
      `)
      .eq('owner_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to list projects via POST', error);
      throw error;
    }

    // Get sandbox states for all projects
    const projectIds = projects?.map(p => p.id) || [];
    const { data: sandboxStates } = await supabase
      .from('project_sandbox_state')
      .select('*')
      .in('project_id', projectIds);

    // Combine data
    const projectsWithDetails = projects?.map(project => {
      const sandboxState = sandboxStates?.find(s => s.project_id === project.id);
      const latestVersion = project.project_versions?.[0];

      return {
        ...project,
        latestVersion,
        sandboxState,
        stats: {
          totalVersions: project.project_versions?.length || 0,
          totalFiles: project.project_code_files?.[0]?.count || 0,
          totalConversations: project.project_conversations?.[0]?.count || 0,
          totalAnalytics: project.project_analytics?.[0]?.count || 0
        },
        // Remove the nested arrays to clean up response
        project_versions: undefined,
        project_code_files: undefined,
        project_conversations: undefined,
        project_analytics: undefined
      };
    });

    return NextResponse.json({
      projects: projectsWithDetails || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    logger.error('Failed to list projects via POST', error as Error);

    return NextResponse.json(
      { error: 'Failed to list projects', details: (error as Error).message },
      { status: 500 }
    );
  }
}
