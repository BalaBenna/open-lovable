'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, FileText, Loader2, Check, AlertCircle } from 'lucide-react';

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
        return <Code2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

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

  return (
    <div className={`flex h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* File Explorer */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search files..."
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                const filtered = generatedFiles.filter(f =>
                  f.path.toLowerCase().includes(q) ||
                  f.path.split('/').pop()?.toLowerCase().includes(q)
                );
                // Keep selection if still present
                if (filtered.length > 0 && !filtered.find(f => f.path === (selectedFile?.path || ''))) {
                  setSelectedFile(filtered[0]);
                }
                // Reflect filtered list to parent if provided, else maintain local view only
                // We won't mutate parent state; we'll derive view below using local query state
                (editorRef.current as any).__fileQuery = q;
                // Force rerender
                setStreamingContent(prev => prev);
              }}
              className="w-full px-2 py-1 rounded bg-gray-700 text-gray-100 placeholder:text-gray-400 text-sm focus:outline-none"
            />
            {isGenerating && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {(generatedFiles.filter(f => {
              const q = ((editorRef.current as any)?.__fileQuery || '').toLowerCase();
              if (!q) return true;
              const name = f.path.split('/').pop() || '';
              return f.path.toLowerCase().includes(q) || name.toLowerCase().includes(q);
            })).map((file, index) => (
              <motion.div
                key={file.path || file.name || `file-${index}-${Math.random()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 p-3 cursor-pointer transition-colors hover:bg-gray-700 ${
                  selectedFile?.path === file.path ? 'bg-gray-700 border-r-2 border-blue-500' : ''
                }`}
                onClick={() => handleFileClick(file)}
              >
                {getFileIcon(file.path)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">
                    {file.path.split('/').pop()}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {file.path}
                  </div>
                </div>
                {getStatusIcon(file.status)}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {generatedFiles.length === 0 && !isGenerating && (
            <div className="p-6 text-center text-gray-400">
              <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No files generated yet</p>
              <p className="text-xs mt-1">Start a conversation to generate code</p>
            </div>
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
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto" ref={editorRef}>
              {/* Editable textarea for now to enable autosave; keep syntax highlighter later if needed */}
              <textarea
                value={streamingContent}
                onChange={handleContentEdit}
                className="w-full h-full p-4 bg-transparent text-gray-100 font-mono text-sm outline-none"
                spellCheck={false}
              />
              
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
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Code2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Welcome to Lovable</h3>
              <p className="text-sm mb-4">AI-powered web application builder</p>
              <p className="text-xs text-gray-500 max-w-md">
                Describe what you want to build, and our AI will generate 
                beautiful, functional React applications in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeCodeEditor;
