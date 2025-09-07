'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Search, 
  Code2, 
  FileText, 
  Zap, 
  CheckCircle, 
  Clock,
  Lightbulb,
  Target,
  Layers,
  Palette,
  Globe,
  Settings
} from 'lucide-react';

interface ThinkingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  icon: React.ReactNode;
  timestamp?: Date;
  details?: string[];
  duration?: number;
}

interface AIThinkingDisplayProps {
  isThinking: boolean;
  currentStep?: string;
  steps: ThinkingStep[];
  onStepComplete?: (stepId: string) => void;
  className?: string;
}

const AIThinkingDisplay: React.FC<AIThinkingDisplayProps> = ({
  isThinking,
  currentStep,
  steps,
  onStepComplete,
  className = ''
}) => {
  const [visibleSteps, setVisibleSteps] = useState<ThinkingStep[]>([]);
  const [currentThought, setCurrentThought] = useState('');

  // Simulate thinking process
  useEffect(() => {
    if (isThinking && steps.length > 0) {
      // Reset visible steps when new steps are provided
      setVisibleSteps([]);
      
      let stepIndex = 0;
      const showNextStep = () => {
        if (stepIndex < steps.length) {
          const nextStep = steps[stepIndex];
          setVisibleSteps(prev => {
            // Prevent adding duplicate steps
            if (prev.some(step => step.id === nextStep.id)) {
              return prev;
            }
            return [...prev, nextStep];
          });
          stepIndex++;
          setTimeout(showNextStep, 800); // Stagger step appearance
        }
      };
      showNextStep();
    } else if (!isThinking) {
      setVisibleSteps([]);
    }
  }, [isThinking, steps]);

  // Simulate thinking thoughts
  useEffect(() => {
    if (isThinking) {
      const thoughts = [
        "Analyzing your request...",
        "Understanding the requirements...",
        "Planning the architecture...",
        "Selecting optimal components...",
        "Designing the user interface...",
        "Optimizing for performance...",
        "Generating clean code...",
        "Adding responsive design...",
        "Implementing best practices...",
        "Finalizing the solution..."
      ];

      let thoughtIndex = 0;
      const cycleThoughts = () => {
        setCurrentThought(thoughts[thoughtIndex]);
        thoughtIndex = (thoughtIndex + 1) % thoughts.length;
      };

      const interval = setInterval(cycleThoughts, 2000);
      cycleThoughts(); // Start immediately

      return () => clearInterval(interval);
    } else {
      setCurrentThought('');
    }
  }, [isThinking]);

  const getStatusIcon = (status: ThinkingStep['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'in-progress':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <div className="w-4 h-4 bg-red-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: ThinkingStep['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-600 bg-gray-800/50';
      case 'in-progress':
        return 'border-blue-500 bg-blue-500/10';
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
    }
  };

  if (!isThinking && visibleSteps.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* AI Thinking Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium">AI is thinking...</span>
        </div>
        {isThinking && (
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>

      {/* Current Thought */}
      {currentThought && (
        <motion.div
          key={currentThought || `thought-${Math.random()}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm italic">{currentThought}</span>
          </div>
        </motion.div>
      )}

      {/* Thinking Steps */}
      <div className="space-y-3">
        <AnimatePresence>
          {visibleSteps.map((step, index) => (
            <motion.div
              key={step.id || `step-${index}-${Math.random()}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-3 transition-all ${getStatusColor(step.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium text-sm">{step.title}</h4>
                    <div className="flex items-center gap-2">
                      {step.duration && (
                        <span className="text-xs text-gray-400">
                          {step.duration}ms
                        </span>
                      )}
                      {getStatusIcon(step.status)}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{step.description}</p>
                  
                  {/* Step Details */}
                  {step.details && step.details.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {step.details.map((detail, idx) => (
                        <div key={"step-detail-" + idx + "-" + (detail || `detail-${Math.random()}`)} className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Summary */}
      {visibleSteps.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Progress: {visibleSteps.filter(s => s.status === 'completed').length}/{visibleSteps.length}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ 
                    width: `${(visibleSteps.filter(s => s.status === 'completed').length / visibleSteps.length) * 100}%` 
                  }}
                />
              </div>
              <span className="text-gray-400 text-xs">
                {Math.round((visibleSteps.filter(s => s.status === 'completed').length / visibleSteps.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Default thinking steps for common operations
export const getDefaultThinkingSteps = (operation: 'generate' | 'edit' | 'analyze', uniqueId?: string): ThinkingStep[] => {
  const prefix = uniqueId ? `${uniqueId}-` : '';
  switch (operation) {
    case 'generate':
      return [
        {
          id: `${prefix}gen-analyze`,
          title: 'Analyzing Requirements',
          description: 'Understanding what you want to build and planning the optimal solution',
          status: 'pending',
          icon: <Search className="w-4 h-4 text-blue-400" />,
          details: ['Parsing user input with AI understanding', 'Identifying key features and user needs', 'Determining project scope and complexity', 'Researching best practices for your use case']
        },
        {
          id: `${prefix}gen-plan`,
          title: 'Planning Architecture',
          description: 'Designing a scalable and maintainable application structure',
          status: 'pending',
          icon: <Target className="w-4 h-4 text-yellow-400" />,
          details: ['Designing component hierarchy for reusability', 'Planning state management strategy', 'Organizing file structure for maintainability', 'Considering performance and scalability']
        },
        {
          id: `${prefix}gen-design`,
          title: 'Creating Design System',
          description: 'Establishing visual design and styling',
          status: 'pending',
          icon: <Palette className="w-4 h-4 text-pink-400" />,
          details: ['Color palette', 'Typography', 'Layout patterns']
        },
        {
          id: `${prefix}gen-code`,
          title: 'Generating Code',
          description: 'Writing React components and logic',
          status: 'pending',
          icon: <Code2 className="w-4 h-4 text-green-400" />,
          details: ['Creating components', 'Adding functionality', 'Implementing styles']
        },
        {
          id: `${prefix}gen-optimize`,
          title: 'Optimizing Performance',
          description: 'Ensuring fast loading and smooth interactions',
          status: 'pending',
          icon: <Zap className="w-4 h-4 text-orange-400" />,
          details: ['Code splitting', 'Lazy loading', 'Bundle optimization']
        }
      ];
    
    case 'edit':
      return [
        {
          id: `${prefix}edit-understand`,
          title: 'Understanding Changes',
          description: 'Analyzing what needs to be modified',
          status: 'pending',
          icon: <Search className="w-4 h-4 text-blue-400" />,
          details: ['Reviewing existing code', 'Identifying target files', 'Planning modifications']
        },
        {
          id: `${prefix}edit-modify`,
          title: 'Making Changes',
          description: 'Implementing the requested modifications',
          status: 'pending',
          icon: <Code2 className="w-4 h-4 text-green-400" />,
          details: ['Updating components', 'Preserving existing logic', 'Testing changes']
        },
        {
          id: `${prefix}edit-validate`,
          title: 'Validating Changes',
          description: 'Ensuring everything works correctly',
          status: 'pending',
          icon: <CheckCircle className="w-4 h-4 text-purple-400" />,
          details: ['Checking syntax', 'Verifying functionality', 'Maintaining compatibility']
        }
      ];
    
    case 'analyze':
      return [
        {
          id: `${prefix}analyze-scan`,
          title: 'Scanning Code',
          description: 'Examining the codebase structure',
          status: 'pending',
          icon: <FileText className="w-4 h-4 text-blue-400" />,
          details: ['Reading files', 'Understanding architecture', 'Identifying patterns']
        },
        {
          id: `${prefix}analyze-patterns`,
          title: 'Analyzing Patterns',
          description: 'Understanding code quality and structure',
          status: 'pending',
          icon: <Layers className="w-4 h-4 text-yellow-400" />,
          details: ['Code quality check', 'Performance analysis', 'Best practices review']
        },
        {
          id: `${prefix}analyze-report`,
          title: 'Generating Report',
          description: 'Creating detailed analysis report',
          status: 'pending',
          icon: <FileText className="w-4 h-4 text-green-400" />,
          details: ['Compiling findings', 'Suggesting improvements', 'Creating documentation']
        }
      ];
    
    default:
      return [];
  }
};

export default AIThinkingDisplay;
