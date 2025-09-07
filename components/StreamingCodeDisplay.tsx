'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Code2, 
  FileText, 
  Loader2, 
  Check, 
  AlertCircle, 
  Play,
  Pause,
  Copy,
  Download,
  Eye
} from 'lucide-react';

interface StreamingFile {
  path: string;
  content: string;
  isComplete: boolean;
  error?: string;
}

interface StreamingCodeDisplayProps {
  isStreaming: boolean;
  streamingContent: string;
  files: StreamingFile[];
  onApplyCode?: () => void;
  className?: string;
}

const StreamingCodeDisplay: React.FC<StreamingCodeDisplayProps> = ({
  isStreaming,
  streamingContent,
  files,
  onApplyCode,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<StreamingFile | null>(null);
  const [displayContent, setDisplayContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<NodeJS.Timeout>();

  // Auto-select first file
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  // Streaming effect for selected file content
  useEffect(() => {
    if (selectedFile && !selectedFile.isComplete) {
      setIsTyping(true);
      let currentIndex = 0;
      const targetContent = selectedFile.content;
      
      const typeCharacter = () => {
        if (currentIndex < targetContent.length) {
          setDisplayContent(targetContent.substring(0, currentIndex + 1));
          currentIndex++;
          
          // Variable typing speed for more natural effect
          const delay = Math.random() * 30 + 10;
          typingRef.current = setTimeout(typeCharacter, delay);
        } else {
          setIsTyping(false);
        }
      };

      typeCharacter();

      return () => {
        if (typingRef.current) {
          clearTimeout(typingRef.current);
        }
      };
    } else if (selectedFile) {
      setDisplayContent(selectedFile.content);
      setIsTyping(false);
    }
  }, [selectedFile]);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (contentRef.current && isTyping) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayContent, isTyping]);

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
      case 'md':
        return 'markdown';
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
        return <Code2 className="w-4 h-4 text-blue-400" />;
      case 'css':
        return <FileText className="w-4 h-4 text-green-400" />;
      case 'html':
        return <FileText className="w-4 h-4 text-orange-400" />;
      case 'json':
        return <FileText className="w-4 h-4 text-yellow-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const copyToClipboard = async () => {
    if (selectedFile) {
      await navigator.clipboard.writeText(selectedFile.content);
    }
  };

  const downloadFile = () => {
    if (selectedFile) {
      const blob = new Blob([selectedFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.path.split('/').pop() || 'file.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`flex h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* File List */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Generated Files
            </h3>
            {isStreaming && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            )}
          </div>
          {files.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {files.filter(f => f.isComplete).length}/{files.length} complete
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={file.path || file.name || `file-${index}-${Math.random()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-700 ${
                  selectedFile?.path === file.path ? 'bg-gray-700 border-r-2 border-blue-500' : ''
                }`}
                onClick={() => setSelectedFile(file)}
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
                <div className="flex items-center">
                  {file.error ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : file.isComplete ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {files.length === 0 && !isStreaming && (
            <div className="p-6 text-center text-gray-400">
              <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No files yet</p>
              <p className="text-xs mt-1">Start a conversation to generate code</p>
            </div>
          )}
          
          {isStreaming && files.length === 0 && (
            <div className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-300">AI is generating code...</p>
              <p className="text-xs text-gray-500 mt-1">Files will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            {/* File Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile.path)}
                <div>
                  <div className="text-sm font-medium text-white">
                    {selectedFile.path.split('/').pop()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {selectedFile.path}
                  </div>
                </div>
                {selectedFile.error ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : selectedFile.isComplete ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
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
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                <button
                  onClick={downloadFile}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto" ref={contentRef}>
              <SyntaxHighlighter
                language={getLanguageFromPath(selectedFile.path)}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  background: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                }}
                showLineNumbers={true}
                wrapLines={true}
                wrapLongLines={true}
                lineNumberStyle={{ 
                  minWidth: '3em',
                  paddingRight: '1em',
                  color: '#6B7280',
                  fontSize: '12px'
                }}
              >
                {displayContent || '// Code will appear here...'}
              </SyntaxHighlighter>
              
              {/* Typing cursor */}
              {isTyping && (
                <div className="absolute bottom-4 right-4">
                  <div className="w-2 h-5 bg-blue-400 animate-pulse"></div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center max-w-md">
              <Code2 className="w-16 h-16 mx-auto mb-6 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Welcome to Lovable
              </h3>
              <p className="text-gray-300 mb-4">
                AI-powered web application builder
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Describe what you want to build in natural language, and watch as our AI 
                generates beautiful, functional React applications in real-time. 
                Your code will appear here as it's being created.
              </p>
              
              <div className="mt-8 grid grid-cols-3 gap-4 text-xs">
                <div className="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg">
                  <Code2 className="w-6 h-6 mb-2 text-blue-400" />
                  <span className="text-gray-300">Real-time</span>
                  <span className="text-gray-500">Code Generation</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg">
                  <Eye className="w-6 h-6 mb-2 text-green-400" />
                  <span className="text-gray-300">Live</span>
                  <span className="text-gray-500">Preview</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg">
                  <Play className="w-6 h-6 mb-2 text-purple-400" />
                  <span className="text-gray-300">Instant</span>
                  <span className="text-gray-500">Deploy</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Apply Code Button */}
      {files.length > 0 && files.every(f => f.isComplete) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4"
        >
          <button
            onClick={onApplyCode}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            Apply Code
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default StreamingCodeDisplay;
