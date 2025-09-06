'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  Code2, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react';
import AIThinkingDisplay, { getDefaultThinkingSteps } from './AIThinkingDisplay';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
  thinking?: {
    isThinking: boolean;
    currentStep?: string;
    steps: any[];
  };
  metadata?: {
    model?: string;
    tokensUsed?: number;
    generationTime?: number;
    filesGenerated?: string[];
    operation?: 'generate' | 'edit' | 'analyze';
  };
}

interface EnhancedChatMessageProps {
  message: ChatMessage;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  className?: string;
}

const EnhancedChatMessage: React.FC<EnhancedChatMessageProps> = ({
  message,
  onRegenerate,
  onFeedback,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [typedContent, setTypedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect for AI messages
  useEffect(() => {
    if (message.role === 'assistant' && message.content && !message.isGenerating) {
      setIsTyping(true);
      let currentIndex = 0;
      const typeSpeed = 30; // Adjust typing speed

      const typeCharacter = () => {
        if (currentIndex <= message.content.length) {
          setTypedContent(message.content.substring(0, currentIndex));
          currentIndex++;
          setTimeout(typeCharacter, typeSpeed);
        } else {
          setIsTyping(false);
        }
      };

      typeCharacter();
    } else if (message.role !== 'assistant') {
      setTypedContent(message.content);
    }
  }, [message.content, message.role, message.isGenerating]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarIcon = () => {
    switch (message.role) {
      case 'user':
        return <User className="w-5 h-5 text-white" />;
      case 'assistant':
        return <Sparkles className="w-5 h-5 text-white" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-white" />;
    }
  };

  const getAvatarColor = () => {
    switch (message.role) {
      case 'user':
        return 'bg-blue-600';
      case 'assistant':
        return 'bg-gradient-to-br from-purple-500 to-blue-600';
      case 'system':
        return 'bg-gray-600';
    }
  };

  const getMessageBubbleStyle = () => {
    switch (message.role) {
      case 'user':
        return 'bg-blue-600 text-white ml-12';
      case 'assistant':
        return 'bg-gray-100 text-gray-900 mr-12';
      case 'system':
        return 'bg-blue-50 text-blue-900 border border-blue-200 mx-8';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''} ${className}`}
    >
      {/* Avatar */}
      {message.role !== 'user' && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColor()}`}>
          {getAvatarIcon()}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {/* Message Bubble */}
        <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${getMessageBubbleStyle()}`}>
          {/* AI Thinking Display */}
          {message.thinking?.isThinking && (
            <AIThinkingDisplay
              isThinking={message.thinking.isThinking}
              currentStep={message.thinking.currentStep}
              steps={message.thinking.steps}
              className="mb-4"
            />
          )}

          {/* Message Content */}
          <div className="prose prose-sm max-w-none">
            {message.isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">AI is generating response...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.role === 'assistant' ? typedContent : message.content}
                {isTyping && <span className="animate-pulse">|</span>}
              </div>
            )}
          </div>

          {/* Message Metadata */}
          {message.metadata && !message.isGenerating && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Generation Details</span>
              </button>
              
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-2 text-xs text-gray-600"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {message.metadata.model && (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          <span>Model: {message.metadata.model}</span>
                        </div>
                      )}
                      {message.metadata.generationTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>Time: {(message.metadata.generationTime / 1000).toFixed(1)}s</span>
                        </div>
                      )}
                      {message.metadata.tokensUsed && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          <span>Tokens: {message.metadata.tokensUsed.toLocaleString()}</span>
                        </div>
                      )}
                      {message.metadata.filesGenerated && message.metadata.filesGenerated.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Code2 className="w-3 h-3" />
                          <span>Files: {message.metadata.filesGenerated.length}</span>
                        </div>
                      )}
                    </div>
                    
                    {message.metadata.filesGenerated && message.metadata.filesGenerated.length > 0 && (
                      <div>
                        <div className="font-medium mb-1">Generated Files:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.metadata.filesGenerated.map((file, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-200 rounded text-xs font-mono"
                            >
                              {file.split('/').pop()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Message Actions */}
        {message.role === 'assistant' && !message.isGenerating && (
          <div className="flex items-center gap-2 mt-2 ml-2">
            <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
            
            <button
              onClick={copyToClipboard}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy message"
            >
              <Copy className="w-3 h-3" />
            </button>
            
            {onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            
            {onFeedback && (
              <div className="flex gap-1">
                <button
                  onClick={() => onFeedback(message.id, 'positive')}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Good response"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'negative')}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Poor response"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* User Avatar */}
      {message.role === 'user' && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColor()}`}>
          {getAvatarIcon()}
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedChatMessage;
