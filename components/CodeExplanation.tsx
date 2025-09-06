'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeExplanationProps {
  code?: string;
  language?: string;
  onExplain?: (explanation: string) => void;
}

const CodeExplanation: React.FC<CodeExplanationProps> = ({
  code: initialCode = '',
  language = 'javascript',
  onExplain
}) => {
  const [code, setCode] = useState(initialCode);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please provide some code to explain');
      return;
    }

    setIsLoading(true);
    setError('');
    setExplanation('');

    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          language,
          context: 'React/TypeScript component for a web application'
        })
      });

      const result = await response.json();

      if (result.success) {
        setExplanation(result.explanation);
        setIsExpanded(true);
        
        if (onExplain) {
          onExplain(result.explanation);
        }
      } else {
        setError(result.error || 'Failed to generate explanation');
      }
    } catch (err) {
      console.error('Code explanation error:', err);
      setError('Failed to connect to explanation service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setExplanation('');
    setError('');
    setIsExpanded(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* Code Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Code to Explain
          </label>
          <div className="flex gap-2">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here to get an AI explanation..."
          className={`font-mono text-sm transition-all duration-200 ${
            isExpanded ? 'min-h-[200px]' : 'min-h-[100px]'
          }`}
          disabled={isLoading}
        />
      </div>

      {/* Language Selection */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Language:</label>
        <select
          value={language}
          onChange={(e) => setCode(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
          disabled={isLoading}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="jsx">JSX</option>
          <option value="tsx">TSX</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>
      </div>

      {/* Explain Button */}
      <Button
        onClick={handleExplain}
        disabled={isLoading || !code.trim()}
        className="w-full"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing code...
          </div>
        ) : (
          'Explain Code'
        )}
      </Button>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation Display */}
      <AnimatePresence>
        {explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Code Explanation
              </h3>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(explanation);
                }}
                variant="outline"
                size="sm"
              >
                Copy
              </Button>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="prose prose-sm max-w-none">
                {explanation.split('\n').map((paragraph, index) => {
                  if (paragraph.trim() === '') return null;
                  
                  // Handle headers
                  if (paragraph.startsWith('#')) {
                    const level = paragraph.match(/^#+/)?.[0].length || 1;
                    const text = paragraph.replace(/^#+\s*/, '');
                    const headerLevel = Math.min(level + 2, 6);
                    
                    if (headerLevel === 3) {
                      return <h3 key={index} className="font-semibold text-gray-900 mt-4 mb-2">{text}</h3>;
                    } else if (headerLevel === 4) {
                      return <h4 key={index} className="font-semibold text-gray-900 mt-4 mb-2">{text}</h4>;
                    } else if (headerLevel === 5) {
                      return <h5 key={index} className="font-semibold text-gray-900 mt-4 mb-2">{text}</h5>;
                    } else {
                      return <h6 key={index} className="font-semibold text-gray-900 mt-4 mb-2">{text}</h6>;
                    }
                  }
                  
                  // Handle bullet points
                  if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                    return (
                      <li key={index} className="ml-4 text-gray-700">
                        {paragraph.replace(/^[-*]\s*/, '')}
                      </li>
                    );
                  }
                  
                  // Handle code blocks
                  if (paragraph.includes('`')) {
                    const parts = paragraph.split(/(`[^`]+`)/g);
                    return (
                      <p key={index} className="text-gray-700 mb-2">
                        {parts.map((part, i) => 
                          part.startsWith('`') && part.endsWith('`') ? (
                            <code key={i} className="px-1 py-0.5 bg-gray-200 rounded text-sm font-mono">
                              {part.slice(1, -1)}
                            </code>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  }
                  
                  // Regular paragraphs
                  return (
                    <p key={index} className="text-gray-700 mb-2">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodeExplanation;
