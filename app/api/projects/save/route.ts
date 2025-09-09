import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface SaveProjectData {
  projectId: string;
  versionId?: string;
  changeType: 'initial' | 'incremental' | 'user_edit' | 'ai_generation';
  changeDescription?: string;
  userPrompt?: string;
  aiResponse?: string;
  codeFiles: Array<{
    path: string;
    name: string;
    content: string;
    type?: string;
  }>;
  conversations?: Array<{
    messageId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: any;
  }>;
  sandboxState?: {
    sandboxId?: string;
    sandboxUrl?: string;
    sandboxStatus?: string;
    configuration?: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const data: SaveProjectData = await request.json();

    logger.info('Saving project data', {
      projectId: data.projectId,
      changeType: data.changeType,
      fileCount: data.codeFiles?.length || 0
    });

    // Get user from auth header
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    // Generate version ID if not provided
    const versionId = data.versionId || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Start transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');

    if (transactionError) {
      logger.error('Failed to begin transaction', transactionError);
    }

    try {
      // 1. Update project timestamp
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          updated_at: new Date().toISOString(),
          metadata: {
            last_version: versionId,
            total_files: data.codeFiles?.length || 0
          }
        })
        .eq('id', data.projectId);

      if (projectError) {
        logger.error('Failed to update project', projectError);
        throw projectError;
      }

      // 2. Create version record
      const { error: versionError } = await supabase
        .from('project_versions')
        .insert({
          id: versionId,
          project_id: data.projectId,
          version_number: await getNextVersionNumber(supabase, data.projectId),
          change_type: data.changeType,
          change_description: data.changeDescription,
          user_prompt: data.userPrompt,
          ai_response: data.aiResponse,
          created_by: userId
        });

      if (versionError) {
        logger.error('Failed to create version record', versionError);
        throw versionError;
      }

      // 3. Save code files
      if (data.codeFiles && data.codeFiles.length > 0) {
        const codeFilesToInsert = data.codeFiles.map(file => ({
          project_id: data.projectId,
          file_path: file.path,
          file_name: file.name,
          file_content: file.content,
          file_type: file.type || getFileTypeFromPath(file.path),
          file_size: Buffer.byteLength(file.content, 'utf8'),
          version_id: versionId,
          is_active: true
        }));

        const { error: filesError } = await supabase
          .from('project_code_files')
          .upsert(codeFilesToInsert, {
            onConflict: 'project_id,file_path,version_id',
            ignoreDuplicates: false
          });

        if (filesError) {
          logger.error('Failed to save code files', filesError);
          throw filesError;
        }

        logger.info('Saved code files', {
          projectId: data.projectId,
          fileCount: codeFilesToInsert.length,
          totalSize: codeFilesToInsert.reduce((sum, file) => sum + file.file_size, 0)
        });
      }

      // 4. Save conversations
      if (data.conversations && data.conversations.length > 0) {
        const conversationsToInsert = data.conversations.map(conv => ({
          project_id: data.projectId,
          message_id: conv.messageId,
          role: conv.role,
          content: conv.content,
          timestamp: conv.timestamp,
          metadata: conv.metadata || {},
          version_id: versionId
        }));

        const { error: convError } = await supabase
          .from('project_conversations')
          .upsert(conversationsToInsert, {
            onConflict: 'project_id,message_id',
            ignoreDuplicates: false
          });

        if (convError) {
          logger.error('Failed to save conversations', convError);
          throw convError;
        }
      }

      // 5. Update sandbox state
      if (data.sandboxState) {
        const { error: sandboxError } = await supabase
          .from('project_sandbox_state')
          .upsert({
            project_id: data.projectId,
            sandbox_id: data.sandboxState.sandboxId,
            sandbox_url: data.sandboxState.sandboxUrl,
            sandbox_status: data.sandboxState.sandboxStatus || 'running',
            last_active: new Date().toISOString(),
            configuration: data.sandboxState.configuration || {}
          }, {
            onConflict: 'project_id',
            ignoreDuplicates: false
          });

        if (sandboxError) {
          logger.error('Failed to update sandbox state', sandboxError);
          throw sandboxError;
        }
      }

      // Log analytics event
      await supabase.from('project_analytics').insert({
        project_id: data.projectId,
        event_type: data.changeType === 'ai_generation' ? 'generation' : 'user_action',
        event_data: {
          version_id: versionId,
          change_type: data.changeType,
          file_count: data.codeFiles?.length || 0,
          conversation_count: data.conversations?.length || 0
        },
        user_id: userId
      });

      // Commit transaction
      await supabase.rpc('commit_transaction');

      logger.info('Successfully saved project data', {
        projectId: data.projectId,
        versionId,
        changeType: data.changeType
      });

      return NextResponse.json({
        success: true,
        versionId,
        message: 'Project data saved successfully'
      });

    } catch (error) {
      // Rollback transaction
      await supabase.rpc('rollback_transaction');
      throw error;
    }

  } catch (error) {
    logger.error('Failed to save project data', error as Error, {
      projectId: (await request.json()).projectId
    });

    return NextResponse.json(
      { error: 'Failed to save project data', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function getNextVersionNumber(supabase: any, projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from('project_versions')
    .select('version_number')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (error) {
    logger.error('Failed to get next version number', error);
    return 1;
  }

  return (data?.[0]?.version_number || 0) + 1;
}

function getFileTypeFromPath(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    'tsx': 'tsx',
    'ts': 'typescript',
    'js': 'javascript',
    'jsx': 'jsx',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
    'yml': 'yaml',
    'yaml': 'yaml'
  };

  return typeMap[extension || ''] || 'text';
}
