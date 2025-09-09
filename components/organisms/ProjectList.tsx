"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Folder, Plus, Clock, FileText, MessageSquare, Eye, Trash2, Edit } from 'lucide-react';
import { logger } from '../../lib/logger';
import { supabaseBrowser as supabase } from '../../lib/supabase';

export interface Project {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status: string;
  metadata?: any;
  latestVersion?: any;
  sandboxState?: any;
  stats?: {
    totalVersions: number;
    totalFiles: number;
    totalConversations: number;
    totalAnalytics: number;
  };
}

export interface ProjectListProps {
  onProjectSelect?: (projectId: string) => void;
  onProjectCreate?: () => void;
  onProjectDelete?: (projectId: string) => void;
  className?: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
  className
}) => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get authentication session
      const { data: { session } } = (supabase ? await supabase.auth.getSession() : { data: { session: null } });

      const response = await fetch('/api/projects/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);

      logger.info('Projects loaded successfully', { count: data.projects?.length || 0 });
    } catch (error) {
      logger.error('Failed to load projects', error as Error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    if (onProjectSelect) {
      onProjectSelect(projectId);
    } else {
      // Since projects are removed, just log the action
      logger.info('Project clicked', { projectId });
    }
  };

  const handleDeleteProject = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: You'd need to implement a delete API endpoint
      logger.info('Project deletion requested', { projectId });
      // For now, just remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectId));

      if (onProjectDelete) {
        onProjectDelete(projectId);
      }
    } catch (error) {
      logger.error('Failed to delete project', error as Error, { projectId });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <Icon icon={Trash2} size={48} className="mx-auto mb-2" />
          <p className="font-medium">Error Loading Projects</p>
        </div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadProjects} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <p className="text-muted-foreground">Manage and continue working on your saved projects</p>
        </div>
        <Button onClick={onProjectCreate} className="flex items-center gap-2">
          <Icon icon={Plus} size={16} />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon={Folder} size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Create your first project to get started</p>
          <Button onClick={onProjectCreate}>
            <Icon icon={Plus} size={16} className="mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
              onClick={() => handleProjectClick(project.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate mb-1">{project.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon icon={Clock} size={14} />
                      <span>Updated {formatDate(project.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality could be added here
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Icon icon={Edit} size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon icon={Trash2} size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getProjectStatusColor(project.status)}`}>
                    {project.status}
                  </span>

                  {project.sandboxState?.sandbox_status === 'running' && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Live
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon icon={FileText} size={14} className="text-blue-500" />
                    <span>{project.stats?.totalFiles || 0} files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon={MessageSquare} size={14} className="text-green-500" />
                    <span>{project.stats?.totalConversations || 0} messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon={Eye} size={14} className="text-purple-500" />
                    <span>{project.stats?.totalVersions || 0} versions</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {project.latestVersion ? `v${project.latestVersion.version_number}` : 'No versions'}
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
