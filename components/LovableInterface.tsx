'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Code2, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap,
  Globe,
  Palette,
  Layers,
  MessageSquare,
  Eye,
  Download,
  BookTemplate,
  Rocket,
  Brain,
  FileText,
  Plus,
  Mic,
  Image as ImageIcon,
  BookOpen,
  GitBranch,
  Search,
  RefreshCw
} from 'lucide-react';
import RealtimeCodeEditor from './RealtimeCodeEditor';
import EnhancedChatMessage from './EnhancedChatMessage';
import AIThinkingDisplay, { getDefaultThinkingSteps } from './AIThinkingDisplay';
import ProjectTemplates from './ProjectTemplates';
import DeploymentOptions from './DeploymentOptions';
import MultiModalInput from './MultiModalInput';
import CodeExplanationPanel from './CodeExplanationPanel';
import ErrorRecoverySystem from './ErrorRecoverySystem';
import VersionControlPanel from './VersionControlPanel';
import MultiSiteAnalyzer from './MultiSiteAnalyzer';
import SandboxPreview from './SandboxPreview';

interface Message {
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

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  status: 'generating' | 'complete' | 'error';
}

const LovableInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to Lovable! I\'m your AI development partner. Describe what you\'d like to build, and I\'ll create it for you in real-time.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-5');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [sandboxId, setSandboxId] = useState<string>('');
  const [previewPort, setPreviewPort] = useState<number>(3000);
  const [previewType, setPreviewType] = useState<'vite' | 'nextjs' | 'console'>('nextjs');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [showCodeExplanation, setShowCodeExplanation] = useState(false);
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [showSiteAnalyzer, setShowSiteAnalyzer] = useState(false);
  const [currentProject, setCurrentProject] = useState('my-lovable-app');
  const [currentError, setCurrentError] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    // Add assistant message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Simulate AI response and file generation
      await simulateCodeGeneration(userMessage.content);
    } catch (error) {
      console.error('Error generating code:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isGenerating: false }
          : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateCodeGeneration = async (prompt: string) => {
    const startTime = Date.now();
    
    // Determine operation type
    const operation = prompt.toLowerCase().includes('edit') || prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('update') 
      ? 'edit' : prompt.toLowerCase().includes('analyze') ? 'analyze' : 'generate';
    
    // Find the current generating message to get its ID
    const currentGeneratingMessage = messages.find(msg => msg.isGenerating);
    const messageId = currentGeneratingMessage?.id || Date.now().toString();
    
    // Create thinking steps with unique ID
    const thinkingSteps = getDefaultThinkingSteps(operation, messageId);
    
    // Add thinking to assistant message
    setMessages(prev => prev.map(msg => 
      msg.isGenerating 
        ? { 
            ...msg, 
            thinking: {
              isThinking: true,
              steps: thinkingSteps
            }
          }
        : msg
    ));

    // Simulate thinking process
    let stepIndex = 0;
    const processSteps = async () => {
      while (stepIndex < thinkingSteps.length) {
        const currentStep = thinkingSteps[stepIndex];
        
        // Update step to in-progress
        setMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                thinking: {
                  ...msg.thinking!,
                  currentStep: currentStep.id,
                  steps: msg.thinking!.steps.map(step => 
                    step.id === currentStep.id 
                      ? { ...step, status: 'in-progress' }
                      : step
                  )
                }
              }
            : msg
        ));

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Complete step
        setMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                thinking: {
                  ...msg.thinking!,
                  steps: msg.thinking!.steps.map(step => 
                    step.id === currentStep.id 
                      ? { ...step, status: 'completed', duration: Math.round(Math.random() * 2000 + 500) }
                      : step
                  )
                }
              }
            : msg
        ));

        stepIndex++;
      }
    };

    await processSteps();

    // Generate detailed response
    const detailedResponse = `Perfect! I've analyzed your request and here's what I'm creating for you:

🎯 **Project Analysis**
I understand you want to build a ${operation === 'generate' ? 'new application' : 'modification to your existing app'}. Let me break down what I'm implementing:

🏗️ **Architecture Planning** 
- Component structure optimized for maintainability
- Responsive design with mobile-first approach  
- Performance optimizations built-in
- Clean, semantic code following React best practices

🎨 **Design System**
- Modern color palette with consistent theming
- Typography scale for perfect readability
- Smooth animations and micro-interactions
- Accessibility features included

⚡ **Implementation Details**
- Using React 19 with latest features
- Tailwind CSS for styling
- TypeScript for type safety
- Optimized bundle size and loading performance

The code is being generated now and will appear in the editor. You'll see each file as it's created!`;
    
    // Update assistant message with detailed response
    const generationTime = Date.now() - startTime;
    setMessages(prev => prev.map(msg => 
      msg.isGenerating 
        ? { 
            ...msg, 
            content: detailedResponse, 
            isGenerating: false,
            thinking: {
              ...msg.thinking!,
              isThinking: false
            },
            metadata: {
              model: selectedModel,
              tokensUsed: Math.floor(Math.random() * 2000 + 1000),
              generationTime,
              operation,
              filesGenerated: []
            }
          }
        : msg
    ));

    // Simulate file generation with more realistic files
    const mockFiles: GeneratedFile[] = [
      {
        path: 'src/App.jsx',
        content: `import React from 'react';\nimport Header from './components/Header';\nimport Hero from './components/Hero';\nimport Features from './components/Features';\nimport Footer from './components/Footer';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-white">\n      <Header />\n      <main>\n        <Hero />\n        <Features />\n      </main>\n      <Footer />\n    </div>\n  );\n}\n\nexport default App;`,
        language: 'jsx',
        status: 'generating'
      },
      {
        path: 'src/components/Header.jsx',
        content: `import React, { useState } from 'react';\nimport { Menu, X } from 'lucide-react';\n\nconst Header = () => {\n  const [isMenuOpen, setIsMenuOpen] = useState(false);\n\n  return (\n    <header className="bg-white shadow-sm border-b">\n      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\n        <div className="flex justify-between items-center h-16">\n          <div className="flex items-center">\n            <h1 className="text-2xl font-bold text-gray-900">Lovable</h1>\n          </div>\n          <nav className="hidden md:flex space-x-8">\n            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>\n            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>\n            <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>\n          </nav>\n        </div>\n      </div>\n    </header>\n  );\n};\n\nexport default Header;`,
        language: 'jsx',
        status: 'generating'
      },
      {
        path: 'src/components/Hero.jsx',
        content: `import React from 'react';\nimport { ArrowRight, Sparkles } from 'lucide-react';\n\nconst Hero = () => {\n  return (\n    <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20">\n      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">\n        <div className="flex justify-center mb-6">\n          <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">\n            <Sparkles className="w-5 h-5 text-purple-600" />\n            <span className="text-purple-700 font-medium">AI-Powered Development</span>\n          </div>\n        </div>\n        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">\n          Build Amazing Apps with\n          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> AI</span>\n        </h1>\n        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">\n          Transform your ideas into beautiful, functional applications using the power of artificial intelligence. \n          No coding experience required.\n        </p>\n        <div className="flex flex-col sm:flex-row gap-4 justify-center">\n          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2">\n            Get Started Free\n            <ArrowRight className="w-5 h-5" />\n          </button>\n          <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">\n            Watch Demo\n          </button>\n        </div>\n      </div>\n    </section>\n  );\n};\n\nexport default Hero;`,
        language: 'jsx',
        status: 'generating'
      },
      {
        path: 'src/index.css',
        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer base {\n  body {\n    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n    line-height: 1.6;\n  }\n}\n\n@layer components {\n  .btn-primary {\n    @apply bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform;\n  }\n  \n  .card {\n    @apply bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow;\n  }\n}\n\n@keyframes fadeInUp {\n  from {\n    opacity: 0;\n    transform: translateY(30px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n.animate-fade-in-up {\n  animation: fadeInUp 0.6s ease-out forwards;\n}`,
        language: 'css',
        status: 'generating'
      }
    ];

    setGeneratedFiles(mockFiles);

    // Update metadata with generated files
    setMessages(prev => prev.map(msg => 
      msg.metadata?.operation === operation
        ? { 
            ...msg, 
            metadata: {
              ...msg.metadata,
              filesGenerated: mockFiles.map(f => f.path)
            }
          }
        : msg
    ));

    // Simulate file completion
    setTimeout(async () => {
      setGeneratedFiles(prev => prev.map(file => ({ ...file, status: 'complete' })));

      // Create sandbox preview after files are generated
      await createSandboxPreview();
    }, 3000);
  };

  const createSandboxPreview = async () => {
    try {
      setIsPreviewLoading(true);

      // Generate a unique sandbox ID
      const newSandboxId = `sandbox-${Date.now()}`;

      // Set up preview configuration
      setSandboxId(newSandboxId);
      setPreviewType('nextjs'); // Could be dynamic based on project type
      setPreviewPort(3000);

      // Create preview URL (in a real implementation, this would be the E2B sandbox URL)
      const previewUrl = `https://${newSandboxId}-3000.e2b.dev`;
      setPreviewUrl(previewUrl);

      // Show the preview
      setShowPreview(true);

      // Simulate sandbox startup time
      setTimeout(() => {
        setIsPreviewLoading(false);
      }, 2000);

    } catch (error) {
      console.error('Error creating sandbox preview:', error);
      setIsPreviewLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Create a landing page for a SaaS product",
    "Build a todo app with React",
    "Design a dashboard with charts",
    "Make a portfolio website"
  ];

  const handleTemplateSelect = (template: any) => {
    setInputValue(`Create ${template.name.toLowerCase()}: ${template.description}`);
    setShowTemplates(false);
    setCurrentProject(template.name.toLowerCase().replace(/\s+/g, '-'));
  };

  const handleDeploy = (provider: any, config: any) => {
    console.log('Deploying to', provider.name, 'with config:', config);
    setShowDeployment(false);
  };

  const handleRegenerate = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.role === 'user') {
      setInputValue(message.content);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    console.log('Feedback for message', messageId, ':', feedback);
    // In real app, send feedback to analytics
  };

  const handleImageAnalysis = (analysis: any, imageUrl: string) => {
    const prompt = `Based on this design analysis: ${JSON.stringify(analysis, null, 2)}\n\nCreate a similar design with these elements and patterns.`;
    setInputValue(prompt);
  };

  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript);
  };

  const handleErrorRetry = async (strategy?: string) => {
    setIsRetrying(true);
    try {
      // Simulate retry logic based on strategy
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentError(null);
      // Retry the last failed operation
    } catch (error) {
      // Handle retry failure
    } finally {
      setIsRetrying(false);
    }
  };

  const handleVersionControlAction = {
    onRevert: (commitId: string) => {
      console.log('Reverting to commit:', commitId);
      // Implement revert logic
    },
    onCreateBranch: (branchName: string) => {
      console.log('Creating branch:', branchName);
      // Implement branch creation
    },
    onSwitchBranch: (branchName: string) => {
      console.log('Switching to branch:', branchName);
      // Implement branch switching
    },
    onCommit: (message: string, files: string[]) => {
      console.log('Committing:', message, files);
      // Implement commit logic
    }
  };

  const handleSiteAnalysisComplete = (analyses: any[]) => {
    const combinedPrompt = `Based on the analysis of these websites:\n\n${
      analyses.map(analysis => 
        `${analysis.title} (${analysis.url}):\n- Colors: ${analysis.analysis?.designSystem?.colors?.map((c: any) => c.hex).join(', ')}\n- Components: ${analysis.analysis?.components?.map((c: any) => c.type).join(', ')}`
      ).join('\n\n')
    }\n\nCreate a modern web application that combines the best design patterns and components from these sites.`;
    
    setInputValue(combinedPrompt);
    setShowSiteAnalyzer(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Lovable</h1>
          </div>
          <div className="text-sm text-gray-500">AI Web App Builder</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Selector */}
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="openai/gpt-5">GPT-5</option>
            <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
          </select>

          {/* Action Buttons */}
          <button 
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Project Templates"
          >
            <BookTemplate className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button 
            onClick={() => setShowSiteAnalyzer(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Analyze Websites"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze</span>
          </button>

          <button 
            onClick={() => setShowCodeExplanation(true)}
            disabled={generatedFiles.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Explain Code"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Explain</span>
          </button>

          <button 
            onClick={() => setShowVersionControl(true)}
            disabled={generatedFiles.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Version Control"
          >
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Git</span>
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={!sandboxId}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showPreview
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } ${!sandboxId ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Toggle Preview"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          
          <button 
            onClick={() => setShowDeployment(true)}
            disabled={generatedFiles.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Deploy"
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">Deploy</span>
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Fixed 30% width */}
        <div className="w-[30%] flex flex-col bg-white border-r border-gray-200 flex-shrink-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <EnhancedChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={handleRegenerate}
                  onFeedback={handleFeedback}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-6 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(prompt)}
                    className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Multi-modal Input */}
          <div className="p-6 border-t border-gray-200 space-y-4">
            <MultiModalInput
              onImageAnalysis={handleImageAnalysis}
              onVoiceInput={handleVoiceInput}
            />
            
            {/* Text Input Area */}
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what you want to build, upload design references, or use voice input..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[48px] max-h-32"
                  rows={1}
                  disabled={isGenerating}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isGenerating}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor Panel and Preview */}
        <div className="flex-1 flex min-w-0">
          {/* Code Editor - Takes full width when preview is hidden, half when shown */}
          <div className={"flex flex-col min-w-0 " + (showPreview ? "w-1/2" : "flex-1")}>
          {/* Error Recovery */}
          {currentError && (
            <div className="p-4 border-b border-gray-200">
              <ErrorRecoverySystem
                error={currentError}
                onRetry={handleErrorRetry}
                onDismiss={() => setCurrentError(null)}
                isRetrying={isRetrying}
              />
            </div>
          )}

          {/* Version Control Panel */}
          {showVersionControl && generatedFiles.length > 0 && (
            <div className="h-80 border-b border-gray-200">
              <VersionControlPanel
                currentFiles={generatedFiles.map(f => ({ path: f.path, content: f.content }))}
                onRevert={handleVersionControlAction.onRevert}
                onCreateBranch={handleVersionControlAction.onCreateBranch}
                onSwitchBranch={handleVersionControlAction.onSwitchBranch}
                onCommit={handleVersionControlAction.onCommit}
              />
            </div>
          )}

            <div className="flex-1">
              <RealtimeCodeEditor
                isGenerating={isGenerating}
                generatedFiles={generatedFiles}
                className="h-full"
              />
            </div>
          </div>

        {/* Preview Panel - Shows when preview is enabled */}
        {showPreview && (
          <div className="w-1/2 flex flex-col min-w-0 border-l border-gray-200">
            <div className="flex-1">
              <SandboxPreview
                sandboxId={sandboxId}
                port={previewPort}
                type={previewType}
                isLoading={isPreviewLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 text-white px-6 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span>{isGenerating ? 'Generating...' : 'Ready'}</span>
          </div>
          {generatedFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>{generatedFiles.length} files generated</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Powered by {selectedModel}</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTemplates && (
          <ProjectTemplates
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
        
        {showDeployment && (
          <DeploymentOptions
            projectName={currentProject}
            onDeploy={handleDeploy}
            onClose={() => setShowDeployment(false)}
          />
        )}

        {showCodeExplanation && generatedFiles.length > 0 && (
          <CodeExplanationPanel
            files={generatedFiles.map(f => ({ path: f.path, content: f.content }))}
            onClose={() => setShowCodeExplanation(false)}
          />
        )}

        {showSiteAnalyzer && (
          <MultiSiteAnalyzer
            onAnalysisComplete={handleSiteAnalysisComplete}
            onClose={() => setShowSiteAnalyzer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LovableInterface;
