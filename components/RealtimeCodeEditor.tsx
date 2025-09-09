'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, FileText, Loader2, Check, AlertCircle, Folder, FolderOpen, ChevronRight, ChevronDown, Copy } from 'lucide-react';

interface CodeFile {
  path: string;
  content: string;
  language: string;
  status: 'generating' | 'complete' | 'error';
}

interface RealtimeCodeEditorProps {
  isGenerating: boolean;
  generatedFiles: CodeFile[];
  onFileSelect?: (file: CodeFile) => void;
  onFilesChange?: (files: CodeFile[]) => void;
  className?: string;
}

const RealtimeCodeEditor: React.FC<RealtimeCodeEditorProps> = ({
  isGenerating,
  generatedFiles,
  onFileSelect,
  onFilesChange,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const codeAreaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [fileQuery, setFileQuery] = useState('');

  // Auto-select the first file when files are generated
  useEffect(() => {
    if (generatedFiles.length > 0 && !selectedFile) {
      setSelectedFile(generatedFiles[0]);
    }
  }, [generatedFiles, selectedFile]);

  // Simulate streaming effect for code generation
  useEffect(() => {
    if (selectedFile && selectedFile.status === 'generating') {
      setIsStreaming(true);
      const content = selectedFile.content;
      let currentIndex = 0;
      
      const streamInterval = setInterval(() => {
        if (currentIndex <= content.length) {
          setStreamingContent(content.substring(0, currentIndex));
          currentIndex += Math.random() * 5 + 1; // Variable speed
        } else {
          setStreamingContent(content);
          setIsStreaming(false);
          clearInterval(streamInterval);
        }
      }, 50);

      return () => clearInterval(streamInterval);
    } else if (selectedFile) {
      setStreamingContent(selectedFile.content);
      setIsStreaming(false);
    }
  }, [selectedFile]);

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jsx':
      case 'tsx':
        return 'jsx';
      case 'js':
      case 'ts':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      default:
        return 'text';
    }
  };

  const getFileIcon = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jsx':
      case 'tsx':
      case 'js':
      case 'ts':
        return <Code2 className="w-4 h-4 text-white" />;
      default:
        return <FileText className="w-4 h-4 text-white" />;
    }
  };

  type TreeItem = { type: 'folder' | 'file'; name: string; path: string; children?: TreeItem[]; file?: CodeFile };

  const buildTree = (files: CodeFile[]): TreeItem[] => {
    const root: Record<string, any> = {};
    for (const f of files) {
      const parts = f.path.split('/');
      let curr = root;
      let currentPath = '';
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = i === parts.length - 1;
        if (!curr[part]) {
          curr[part] = isFile
            ? { type: 'file', name: part, path: currentPath, file: f }
            : { type: 'folder', name: part, path: currentPath, children: {} };
        }
        if (!isFile) curr = curr[part].children;
      }
    }
    const toArray = (nodeMap: Record<string, any>): TreeItem[] =>
      Object.values(nodeMap).map((n: any) =>
        n.type === 'folder' ? { ...n, children: toArray(n.children) } : n
      );
    return toArray(root);
  };

  const filterTree = (nodes: TreeItem[], query: string): TreeItem[] => {
    if (!query) return nodes;
    const q = query.toLowerCase();
    const recurse = (n: TreeItem): TreeItem | null => {
      if (n.type === 'file') {
        const match = n.name.toLowerCase().includes(q) || n.path.toLowerCase().includes(q);
        return match ? n : null;
      }
      const kids = (n.children || []).map(recurse).filter(Boolean) as TreeItem[];
      if (kids.length > 0 || n.name.toLowerCase().includes(q)) {
        return { ...n, children: kids };
      }
      return null;
    };
    return nodes.map(recurse).filter(Boolean) as TreeItem[];
  };

  const toggleExpanded = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (items: TreeItem[], depth = 0) => (
    <>
      {items.map((item, idx) => {
        if (item.type === 'folder') {
          const isOpen = expanded[item.path] ?? true;
          return (
            <div key={`${item.path}-${idx}`}>
              <button
                onClick={() => toggleExpanded(item.path)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
                style={{ paddingLeft: 8 + depth * 12 }}
              >
                {isOpen ? <ChevronDown className="w-3 h-3 text-white" /> : <ChevronRight className="w-3 h-3 text-white" />}
                {isOpen ? <FolderOpen className="w-4 h-4 text-white" /> : <Folder className="w-4 h-4 text-white" />}
                <span className="truncate">{item.name}</span>
              </button>
              {isOpen && item.children && (
                <div>
                  {renderTree(item.children, depth + 1)}
                </div>
              )}
            </div>
          );
        }
        // file
        const isActive = selectedFile?.path === item.path;
        return (
          <div
            key={`${item.path}-${idx}`}
            className={`flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-3 py-2 ${isActive ? 'bg-gray-700 border-r-2 border-blue-500' : ''}`}
            style={{ paddingLeft: 8 + depth * 12 }}
            onClick={() => item.file && handleFileClick(item.file)}
          >
            {getFileIcon(item.path)}
            <span className="flex-1 min-w-0 text-sm text-white truncate">{item.name}</span>
            {item.file && getStatusIcon(item.file.status)}
          </div>
        );
      })}
    </>
  );

  const getStatusIcon = (status: CodeFile['status']) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'complete':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const handleFileClick = (file: CodeFile) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleContentEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedFile) return;
    const next = streamingContent;
    setStreamingContent(e.target.value);
    // propagate
    const updated = generatedFiles.map(f =>
      f.path === selectedFile.path ? { ...f, content: e.target.value, status: 'complete' } : f
    );
    onFilesChange?.(updated);
  };

  const handleScrollSync = () => {
    if (lineNumbersRef.current && codeAreaRef.current) {
      lineNumbersRef.current.scrollTop = codeAreaRef.current.scrollTop;
    }
    if (highlightRef.current && codeAreaRef.current) {
      highlightRef.current.scrollTop = codeAreaRef.current.scrollTop;
      highlightRef.current.scrollLeft = codeAreaRef.current.scrollLeft;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(streamingContent);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <div className={`flex h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* File Explorer */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col text-gray-200">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search files..."
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                setFileQuery(q);
              }}
              className="w-full px-2 py-1 rounded bg-gray-700 text-gray-100 placeholder:text-gray-400 text-sm focus:outline-none"
            />
            {isGenerating && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto thin-scrollbar">
          <AnimatePresence>
            {renderTree(filterTree(buildTree(generatedFiles), fileQuery))}
          </AnimatePresence>
          
          {generatedFiles.length === 0 && !isGenerating && (
            <div className="p-3" />
          )}
          
          {isGenerating && generatedFiles.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-500" />
              <p className="text-sm">AI is generating code...</p>
              <p className="text-xs mt-1">Files will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            {/* File Header */}
            <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.path)}
                <span className="text-sm font-medium text-white">
                  {selectedFile.path}
                </span>
                {getStatusIcon(selectedFile.status)}
              </div>
              <div className="flex items-center gap-3">
              {isStreaming && (
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  Generating...
                </div>
              )}
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-100 rounded"
                  title="Copy code"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-hidden" ref={editorRef}>
              <div className="flex h-full">
                {/* Line numbers */}
                <div
                  ref={lineNumbersRef}
                  className="select-none bg-gray-800 border-r border-gray-700 text-gray-300 text-right font-mono text-sm leading-6 overflow-hidden py-4 pr-3 pl-1"
                  style={{ width: `calc(${Math.max(2, String(streamingContent.split('\n').length).length)}ch + 6px)` }}
                >
                  {Array.from({ length: streamingContent.split('\n').length || 1 }).map((_, i) => (
                    <div key={`ln-${i}`} className="tabular-nums flex items-center justify-end h-6">{i + 1}</div>
                  ))}
                </div>
                {/* Highlighted layer */}
                <div ref={highlightRef} className="relative flex-1 h-full overflow-auto thin-scrollbar">
                  <SyntaxHighlighter
                    language={selectedFile ? getLanguageFromPath(selectedFile.path) : 'tsx'}
                    style={oneDark as any}
                    showLineNumbers={false}
                    customStyle={{ margin: 0, background: 'transparent', padding: 16, fontSize: '0.875rem', lineHeight: '1.5rem' }}
                  >
                    {streamingContent}
                  </SyntaxHighlighter>
                </div>
                {/* Editable textarea overlay (transparent text) */}
              <textarea
                  ref={codeAreaRef}
                value={streamingContent}
                onChange={handleContentEdit}
                  onScroll={handleScrollSync}
                  className="absolute inset-0 ml-[calc( (var(--lnw,2)*1ch) + 12px )] flex-1 h-full p-4 bg-transparent text-transparent caret-white font-mono text-sm outline-none overflow-auto leading-6 thin-scrollbar"
                  style={{ left: 0 }}
                spellCheck={false}
              />
              </div>
              
              {isStreaming && (
                <div className="px-4 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    AI is writing code...
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
};

export default RealtimeCodeEditor;
