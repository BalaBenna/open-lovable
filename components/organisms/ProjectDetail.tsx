"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import {
  History,
  Code,
  MessageSquare,
  Eye,
  Download,
  GitBranch,
  Clock,
  User,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { logger } from '../../lib/logger';

export interface ProjectVersion {
  id: string;
  version_number: number;
  change_type: string;
  change_description: string;
  user_prompt: string;
  ai_response: string;
  created_at: string;
  created_by?: string;
}

export interface ProjectDetailData {
  project: {
    id: string;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
    metadata?: any;
  };
  codeFiles: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  conversations: Array<{
    message_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  versions: ProjectVersion[];
  sandboxState?: {
    sandbox_id?: string;
    sandbox_url?: string;
    sandbox_status?: string;
  };
}

export interface ProjectDetailProps {
  projectId: string;
  onBack?: () => void;
  onVersionSelect?: (versionId: string) => void;
  className?: string;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectId,
  onBack,
  onVersionSelect,
  className
}) => {
  const [projectData, setProjectData] = useState<ProjectDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'conversations' | 'versions'>('overview');

  useEffect(() => {
    loadProjectDetail();
  }, [projectId]);

  const loadProjectDetail = async () => {
    try {
      setIsLoading(true);
      logger.info('Loading project detail', { projectId });

      const response = await fetch(`/api/projects/load?projectId=${projectId}&includeConversations=true`);

      if (!response.ok) {
        throw new Error(`Failed to load project detail: ${response.status}`);
      }

      const data = await response.json();
      setProjectData(data);
      setSelectedVersion(data.currentVersion);

      logger.info('Project detail loaded', {
        projectId,
        fileCount: data.codeFiles?.length || 0,
        versionCount: data.versions?.length || 0
      });
    } catch (error) {
      logger.error('Failed to load project detail', error as Error, { projectId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
    if (onVersionSelect) {
      onVersionSelect(versionId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'initial': return 'bg-blue-100 text-blue-800';
      case 'incremental': return 'bg-green-100 text-green-800';
      case 'user_edit': return 'bg-purple-100 text-purple-800';
      case 'ai_generation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'initial': return GitBranch;
      case 'incremental': return Code;
      case 'user_edit': return User;
      case 'ai_generation': return Eye;
      default: return History;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Project not found</p>
        <Button onClick={onBack} className="mt-4">
          <Icon icon={ArrowLeft} size={16} className="mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const { project, codeFiles, conversations, versions, sandboxState } = projectData;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <Icon icon={ArrowLeft} size={16} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">
              Created {formatDate(project.created_at)} •
              Last updated {formatDate(project.updated_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sandboxState?.sandbox_status === 'running' && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Live Preview
            </div>
          )}
          <Button variant="outline">
            <Icon icon={Download} size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'files', label: 'Files', icon: FileText },
          { id: 'conversations', label: 'Chat History', icon: MessageSquare },
          { id: 'versions', label: 'Versions', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon icon={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon icon={FileText} size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{codeFiles.length}</p>
                    <p className="text-sm text-muted-foreground">Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon icon={MessageSquare} size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{conversations.length}</p>
                    <p className="text-sm text-muted-foreground">Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon icon={History} size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{versions.length}</p>
                    <p className="text-sm text-muted-foreground">Versions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Icon icon={GitBranch} size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedVersion ? 'v' + versions.find(v => v.id === selectedVersion)?.version_number : 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Current</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'files' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Project Files</h3>
              <p className="text-sm text-muted-foreground">
                {codeFiles.length} files in current version
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {codeFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon={FileText} size={16} className="text-blue-500" />
                      <div>
                        <p className="font-medium">{file.path.split('/').pop()}</p>
                        <p className="text-sm text-muted-foreground">{file.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {file.language}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(file.content.length / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'conversations' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Chat History</h3>
              <p className="text-sm text-muted-foreground">
                {conversations.length} messages in conversation
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversations.slice(-20).map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : msg.role === 'assistant'
                        ? 'bg-gray-100'
                        : 'bg-green-100'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDate(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'versions' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Version History</h3>
              <p className="text-sm text-muted-foreground">
                {versions.length} versions available
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versions.map((version) => {
                  const IconComponent = getChangeTypeIcon(version.change_type);
                  return (
                    <div
                      key={version.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedVersion === version.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Icon icon={IconComponent} size={16} className="text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Version {version.version_number}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getChangeTypeColor(version.change_type)}`}>
                                {version.change_type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {version.change_description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(version.created_at)}
                            </p>
                          </div>
                        </div>
                        {selectedVersion === version.id && (
                          <div className="text-blue-600">
                            <Icon icon={Eye} size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
