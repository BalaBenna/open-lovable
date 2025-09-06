'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  History, 
  Save, 
  Undo2, 
  Redo2,
  Plus,
  Trash2,
  Eye,
  Download,
  Upload,
  Clock,
  User,
  Tag,
  CheckCircle,
  AlertCircle,
  Code2,
  FileText,
  Folder,
  Star
} from 'lucide-react';

interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  files: {
    path: string;
    status: 'added' | 'modified' | 'deleted';
    changes: number;
  }[];
  tags?: string[];
  isStarred?: boolean;
}

interface GitBranchInfo {
  name: string;
  current: boolean;
  commits: number;
  lastCommit: Date;
  ahead: number;
  behind: number;
}

interface VersionControlPanelProps {
  currentFiles: { path: string; content: string }[];
  onRevert: (commitId: string) => void;
  onCreateBranch: (branchName: string) => void;
  onSwitchBranch: (branchName: string) => void;
  onCommit: (message: string, files: string[]) => void;
  className?: string;
}

const VersionControlPanel: React.FC<VersionControlPanelProps> = ({
  currentFiles,
  onRevert,
  onCreateBranch,
  onSwitchBranch,
  onCommit,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'branches' | 'changes'>('history');
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [branches, setBranches] = useState<GitBranchInfo[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize with mock data
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockCommits: GitCommit[] = [
      {
        id: '1',
        hash: 'a1b2c3d',
        message: 'Initial project setup with React and Tailwind',
        author: 'AI Assistant',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        files: [
          { path: 'src/App.jsx', status: 'added', changes: 45 },
          { path: 'src/index.css', status: 'added', changes: 20 },
          { path: 'package.json', status: 'added', changes: 15 }
        ],
        tags: ['v1.0.0', 'initial'],
        isStarred: true
      },
      {
        id: '2',
        hash: 'e4f5g6h',
        message: 'Add responsive navigation component',
        author: 'AI Assistant',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        files: [
          { path: 'src/components/Header.jsx', status: 'added', changes: 67 },
          { path: 'src/App.jsx', status: 'modified', changes: 8 }
        ]
      },
      {
        id: '3',
        hash: 'i7j8k9l',
        message: 'Implement hero section with animations',
        author: 'AI Assistant',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        files: [
          { path: 'src/components/Hero.jsx', status: 'added', changes: 89 },
          { path: 'src/index.css', status: 'modified', changes: 12 }
        ]
      },
      {
        id: '4',
        hash: 'm0n1o2p',
        message: 'Add features grid and improve accessibility',
        author: 'AI Assistant',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        files: [
          { path: 'src/components/Features.jsx', status: 'added', changes: 124 },
          { path: 'src/components/Header.jsx', status: 'modified', changes: 15 },
          { path: 'src/index.css', status: 'modified', changes: 8 }
        ],
        tags: ['features']
      }
    ];

    const mockBranches: GitBranchInfo[] = [
      {
        name: 'main',
        current: true,
        commits: 4,
        lastCommit: new Date(Date.now() - 300000),
        ahead: 0,
        behind: 0
      },
      {
        name: 'feature/dark-mode',
        current: false,
        commits: 2,
        lastCommit: new Date(Date.now() - 7200000),
        ahead: 2,
        behind: 1
      },
      {
        name: 'feature/mobile-optimization',
        current: false,
        commits: 3,
        lastCommit: new Date(Date.now() - 3600000),
        ahead: 1,
        behind: 2
      }
    ];

    setCommits(mockCommits);
    setBranches(mockBranches);
  };

  const handleCommit = () => {
    if (!commitMessage.trim() || selectedFiles.size === 0) return;

    const newCommit: GitCommit = {
      id: Date.now().toString(),
      hash: Math.random().toString(36).substr(2, 7),
      message: commitMessage,
      author: 'AI Assistant',
      timestamp: new Date(),
      files: Array.from(selectedFiles).map(path => ({
        path,
        status: 'modified' as const,
        changes: Math.floor(Math.random() * 50) + 10
      }))
    };

    setCommits(prev => [newCommit, ...prev]);
    setCommitMessage('');
    setSelectedFiles(new Set());
    setShowCommitDialog(false);
    onCommit(commitMessage, Array.from(selectedFiles));
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;

    const newBranch: GitBranchInfo = {
      name: newBranchName,
      current: false,
      commits: 0,
      lastCommit: new Date(),
      ahead: 0,
      behind: commits.length
    };

    setBranches(prev => [...prev, newBranch]);
    setNewBranchName('');
    setShowBranchDialog(false);
    onCreateBranch(newBranchName);
  };

  const toggleFileSelection = (filePath: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const toggleCommitStar = (commitId: string) => {
    setCommits(prev => prev.map(commit => 
      commit.id === commitId 
        ? { ...commit, isStarred: !commit.isStarred }
        : commit
    ));
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.jsx') || path.endsWith('.tsx')) {
      return <Code2 className="w-4 h-4 text-blue-500" />;
    } else if (path.endsWith('.css')) {
      return <FileText className="w-4 h-4 text-green-500" />;
    } else if (path.endsWith('.json')) {
      return <FileText className="w-4 h-4 text-yellow-500" />;
    } else {
      return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: 'added' | 'modified' | 'deleted') => {
    switch (status) {
      case 'added':
        return 'text-green-600 bg-green-50';
      case 'modified':
        return 'text-blue-600 bg-blue-50';
      case 'deleted':
        return 'text-red-600 bg-red-50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const filteredCommits = commits.filter(commit =>
    commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.hash.includes(searchQuery.toLowerCase()) ||
    commit.files.some(file => file.path.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Version Control</h3>
              <p className="text-sm text-gray-600">Track and manage your code changes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommitDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              Commit
            </button>
            <button
              onClick={() => setShowBranchDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <GitBranch className="w-4 h-4" />
              Branch
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'history', label: 'History', icon: History },
            { id: 'branches', label: 'Branches', icon: GitBranch },
            { id: 'changes', label: 'Changes', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search commits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            {/* Commit History */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCommits.map(commit => (
                <motion.div
                  key={commit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCommit === commit.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCommit(commit.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GitCommit className="w-4 h-4 text-gray-500" />
                        <span className="font-mono text-sm text-gray-600">{commit.hash}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCommitStar(commit.id);
                          }}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            commit.isStarred ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                        >
                          <Star className="w-3 h-3" fill={commit.isStarred ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{commit.message}</h4>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{commit.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(commit.timestamp)}</span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {commit.tags && commit.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {commit.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1"
                            >
                              <Tag className="w-2 h-2" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Files */}
                      <div className="space-y-1">
                        {commit.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {getFileIcon(file.path)}
                            <span className="text-gray-700">{file.path}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(file.status)}`}>
                              {file.status}
                            </span>
                            <span className="text-gray-500 text-xs">
                              +{file.changes} lines
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRevert(commit.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Revert to this commit"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="View diff"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {branches.map(branch => (
                <div
                  key={branch.name}
                  className={`border rounded-lg p-4 ${
                    branch.current ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitBranch className={`w-4 h-4 ${branch.current ? 'text-green-600' : 'text-gray-500'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${branch.current ? 'text-green-900' : 'text-gray-900'}`}>
                            {branch.name}
                          </span>
                          {branch.current && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{branch.commits} commits</span>
                          <span>Last: {formatTimeAgo(branch.lastCommit)}</span>
                          {branch.ahead > 0 && <span className="text-green-600">↑{branch.ahead}</span>}
                          {branch.behind > 0 && <span className="text-red-600">↓{branch.behind}</span>}
                        </div>
                      </div>
                    </div>
                    
                    {!branch.current && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSwitchBranch(branch.name)}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                        >
                          Switch
                        </button>
                        <button
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete branch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'changes' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Select files to include in your next commit:
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentFiles.map(file => (
                <div
                  key={file.path}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedFiles.has(file.path)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleFileSelection(file.path)}
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.path)}
                    onChange={() => toggleFileSelection(file.path)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  {getFileIcon(file.path)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{file.path}</div>
                    <div className="text-xs text-gray-500">
                      {file.content.split('\n').length} lines
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                    modified
                  </span>
                </div>
              ))}
            </div>

            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                <input
                  type="text"
                  placeholder="Commit message..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleCommit}
                  disabled={!commitMessage.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Commit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Commit Dialog */}
      <AnimatePresence>
        {showCommitDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Commit</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commit Message
                  </label>
                  <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Describe your changes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCommitDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommit}
                    disabled={!commitMessage.trim() || selectedFiles.size === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Commit Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Branch Dialog */}
      <AnimatePresence>
        {showBranchDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Branch</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="feature/new-feature"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowBranchDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBranch}
                    disabled={!newBranchName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Branch
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VersionControlPanel;
