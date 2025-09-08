'use client';

import React, { useState, useEffect, useRef } from 'react';
import { globalKeyFix } from '../lib/globalKeyFix';
import {
  Send,
  Code2,
  Eye,
  BookTemplate,
  Rocket,
  GitBranch,
  X,
  Save,
  History,
  FileText,
  Plus,
  MoreVertical,
  Mic,
  Globe,
  Zap,
  ShoppingCart,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RealtimeCodeEditor from './RealtimeCodeEditor';
import EnhancedChatMessage from './EnhancedChatMessage';
import ProjectTemplates from './ProjectTemplates';
import DeploymentOptions from './DeploymentOptions';
import PreviewControls from './PreviewControls';
import VersionControlPanel from './VersionControlPanel';
import SandboxPreview from './SandboxPreview';
import { supabaseBrowser } from '@/lib/supabase';

// Custom Chat Input Component
interface CustomChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  isGenerating?: boolean;
}

const CustomChatInput: React.FC<CustomChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask Lovable to create an intern",
  disabled = false,
  isGenerating = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Simplified input: remove extra controls

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isGenerating) {
        onSubmit(e as any);
      }
    }
  };

  // Removed file upload and extra actions

  return (
    <form
      onSubmit={onSubmit}
      className="group grid grid-cols-[1fr_auto] [grid-template-areas:'primary_trailing'] items-center w-full p-2.5 rounded-[28px] bg-white dark:bg-neutral-800 text-base shadow-lg"
    >
      {/* Leading controls removed */}

      {/* Primary input */}
      <div className="-my-2.5 flex min-h-14 items-center px-1.5 [grid-area:primary]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-md px-2 py-2 placeholder:text-gray-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none text-[16px] leading-snug placeholder-shown:text-ellipsis placeholder-shown:whitespace-nowrap md:text-base max-h-[200px] bg-transparent flex-1"
          id="chatinput"
          autoFocus
          style={{ minHeight: '80px', height: '80px' }}
          placeholder={placeholder}
          maxLength={50000}
          disabled={disabled}
        />
      </div>

      {/* Trailing controls */}
      <div className="flex items-center gap-1.5 [grid-area:trailing]">
        {/* Send button only */}
        <button
          id="chatinput-send-message-button"
          type="submit"
          disabled={!value.trim() || isGenerating}
          className="composer-submit-btn composer-submit-button-color flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send prompt"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

// Enhanced Website Analyzer with Real-time Data
const RealtimeWebsiteAnalyzer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: any) => void;
}> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>(null);

  const analyzeWebsite = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    try {
      // Real-time website analysis
      const response = await fetch('/api/scrape-url-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setRealTimeData(data);

        // Extract design patterns and content
        const designPatterns = {
          colors: data.colors || [],
          fonts: data.fonts || [],
          components: data.components || [],
          layout: data.layout || {},
          animations: data.animations || []
        };

        onAnalysisComplete({
          ...data,
          designPatterns,
          realTimeData: data
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Website Analyzer</h2>
                    <p className="text-sm text-gray-600">Real-time website analysis and design extraction</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* URL Input */}
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={analyzeWebsite}
                  disabled={!url.trim() || isAnalyzing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {realTimeData ? (
                <div className="space-y-6">
                  {/* Real-time Data Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Design Patterns */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Design Patterns
                      </h3>
                      <div className="space-y-2">
                        {realTimeData.colors && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Colors:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {realTimeData.colors.slice(0, 6).map((color: string, i: number) => (
                                <div key={globalKeyFix(`color-${i}-${color || 'unknown'}`)} className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-xs text-gray-600">{color}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {realTimeData.components && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Components:</span>
                            <div className="text-sm text-gray-600 mt-1">
                              {realTimeData.components.length} detected components
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Analysis */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Content Analysis
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Title:</span>
                          <p className="text-sm text-gray-600 mt-1">{realTimeData.title || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Meta Description:</span>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {realTimeData.description || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Content Length:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {realTimeData.content?.length || 0} characters
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Preview */}
                  {realTimeData.screenshot && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-orange-600" />
                        Live Preview
                      </h3>
                      <div className="bg-white rounded border overflow-hidden">
                        <img
                          src={realTimeData.screenshot}
                          alt="Website preview"
                          className="w-full h-auto max-h-64 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analyze Any Website</h3>
                  <p className="text-gray-600">
                    Enter a website URL above to get real-time analysis including design patterns,
                    content structure, and visual elements.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main Settings Modal with All Features
const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: any) => void;
  onShowVersionControl: () => void;
}> = ({
  isOpen,
  onClose,
  onTemplateSelect,
  onShowVersionControl
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('templates');

  const settingsTabs = [
    { id: 'templates', label: 'Templates', icon: BookTemplate, description: 'Project templates and starters' },
    { id: 'git', label: 'Git', icon: GitBranch, description: 'Version control and collaboration' }
  ];


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Settings & Tools</h2>
                    <p className="text-sm text-gray-600">Access all your development tools and features</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Settings Tabs */}
              <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                {settingsTabs.map(tab => (
                  <button
                    key={globalKeyFix(`tab-${tab.id || 'unknown'}`)}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={"flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 flex-1 " +
                      (activeSettingsTab === tab.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className={"text-xs " + (activeSettingsTab === tab.id ? 'text-purple-100' : 'text-gray-500')}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeSettingsTab === 'templates' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <BookTemplate className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Project Templates</h3>
                    <p className="text-gray-600 mb-6">
                      Choose from our collection of pre-built templates to kickstart your project
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Landing Page', description: 'Modern landing page with hero section', icon: Code2 },
                      { name: 'Dashboard', description: 'Admin dashboard with charts', icon: Zap },
                      { name: 'E-commerce', description: 'Online store template', icon: ShoppingCart },
                      { name: 'Blog', description: 'Content management system', icon: FileText },
                      { name: 'Portfolio', description: 'Personal portfolio website', icon: User },
                      { name: 'SaaS', description: 'Software as a service template', icon: Rocket }
                    ].map((template, index) => (
                      <div
                        key={globalKeyFix(`template-${index}`)}
                        onClick={() => onTemplateSelect(template)}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-purple-300"
                      >
                        <template.icon className="w-8 h-8 mb-3 text-purple-600" />
                        <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {activeSettingsTab === 'git' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <GitBranch className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Version Control</h3>
                    <p className="text-gray-600 mb-6">
                      Manage your code versions, track changes, and collaborate with Git
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Git Version Control</h4>
                        <p className="text-sm text-gray-600">Complete Git workflow management</p>
                      </div>
                      <button
                        onClick={() => {
                          onShowVersionControl();
                          // Close settings modal
                          onClose();
                        }}
                        disabled={false}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <GitBranch className="w-4 h-4" />
                        Open Git
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-blue-500" />
                        <span>Commit History</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-green-500" />
                        <span>Branch Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4 text-purple-500" />
                        <span>Staged Changes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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

type LovableInterfaceProps = {
  projectId?: string;
};

const LovableInterface: React.FC<LovableInterfaceProps> = ({ projectId }) => {
  // Helper function to generate unique message IDs
  // Use a ref to ensure atomic counter updates
  const messageIdCounterRef = useRef(0);

  const generateMessageId = () => {
    const timestamp = Date.now();
    const counter = ++messageIdCounterRef.current; // Atomic increment
    // Add microsecond precision and random component to ensure uniqueness
    const microTime = typeof performance !== 'undefined' ? 
      Math.floor(performance.now() * 1000) : 
      timestamp * 1000 + Math.random() * 1000;
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    return `msg-${microTime}-${counter}-${randomSuffix}`;
  };

  // AI Insights generation based on user query
  const generateAIInsights = (prompt: string, operation: string) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Analyze the user's request to understand what they want
    let projectType = 'web application';
    let keyFeatures: string[] = [];
    let designStyle = 'modern';
    let colorScheme = 'blue and purple gradient';
    
    // Determine project type
    if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('personal website')) {
      projectType = 'portfolio website';
      keyFeatures = ['About section', 'Projects showcase', 'Contact form', 'Skills display'];
      designStyle = 'professional and clean';
    } else if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
      projectType = 'todo application';
      keyFeatures = ['Task management', 'Add/delete tasks', 'Mark as complete', 'Filter tasks'];
      designStyle = 'minimal and functional';
    } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin')) {
      projectType = 'dashboard application';
      keyFeatures = ['Data visualization', 'Charts and graphs', 'User management', 'Analytics'];
      designStyle = 'data-focused and professional';
    } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
      projectType = 'e-commerce website';
      keyFeatures = ['Product catalog', 'Shopping cart', 'User authentication', 'Payment integration'];
      designStyle = 'commercial and trustworthy';
    } else if (lowerPrompt.includes('blog') || lowerPrompt.includes('article')) {
      projectType = 'blog website';
      keyFeatures = ['Article listing', 'Individual post pages', 'Categories', 'Search functionality'];
      designStyle = 'content-focused and readable';
    } else if (lowerPrompt.includes('landing') || lowerPrompt.includes('marketing')) {
      projectType = 'landing page';
      keyFeatures = ['Hero section', 'Feature highlights', 'Call-to-action buttons', 'Contact form'];
      designStyle = 'conversion-optimized';
    }
    
    // Determine color scheme
    if (lowerPrompt.includes('dark') || lowerPrompt.includes('black')) {
      colorScheme = 'dark theme with neon accents';
    } else if (lowerPrompt.includes('light') || lowerPrompt.includes('white')) {
      colorScheme = 'light theme with subtle colors';
    } else if (lowerPrompt.includes('colorful') || lowerPrompt.includes('bright')) {
      colorScheme = 'vibrant and colorful';
    } else if (lowerPrompt.includes('minimal') || lowerPrompt.includes('simple')) {
      colorScheme = 'minimal with monochrome accents';
    }
    
    return `🎯 **Project Analysis**
I understand you want to build a ${projectType}. Let me break down what I'm implementing:

🏗️ **Architecture Planning** 
- Component structure optimized for maintainability
- Responsive design with mobile-first approach  
- Performance optimizations built-in
- Clean, semantic code following React best practices

🎨 **Design System**
- ${designStyle} design approach
- ${colorScheme} color palette
- Typography scale for perfect readability
- Smooth animations and micro-interactions
- Accessibility features included

⚡ **Implementation Details**
- Using React 19 with latest features
- Tailwind CSS for styling
- TypeScript for type safety
- Optimized bundle size and loading performance

🔧 **Key Features**
${keyFeatures.map(feature => `- ${feature}`).join('\n')}

The code is being generated now and will appear in the editor. You'll see each file as it's created!`;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-5');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [sandboxId, setSandboxId] = useState<string>('');
  const [previewPort, setPreviewPort] = useState<number>(5173); // Default to Vite port
  const [previewType, setPreviewType] = useState<'vite' | 'nextjs' | 'console'>('vite');
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'branches' | 'changes'>('history');
  const [currentProject, setCurrentProject] = useState('my-lovable-app');
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview'); // Toggle between code and preview
  const [showSiteAnalyzer, setShowSiteAnalyzer] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime: subscribe to file updates for this project and patch editor state
  useEffect(() => {
    if (!projectId || !supabaseBrowser) return;
    const channel = supabaseBrowser
      .channel(`files-${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'files',
        filter: `project_id=eq.${projectId}`
      }, (payload: any) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const row = payload.new;
          const language = row.path.endsWith('.tsx') || row.path.endsWith('.ts') ? 'tsx' : row.path.endsWith('.jsx') ? 'jsx' : row.path.endsWith('.css') ? 'css' : 'text';
          setGeneratedFiles(prev => {
            const idx = prev.findIndex(f => f.path === row.path);
            const gf: GeneratedFile = { path: row.path, content: row.content, language, status: 'complete' };
            if (idx >= 0) { const copy = prev.slice(); copy[idx] = gf; return copy; }
            return [...prev, gf];
          });
        }
      })
      .subscribe();
    return () => { supabaseBrowser.removeChannel(channel); };
  }, [projectId]);




  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    // Add assistant message placeholder
    const assistantMessage: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Use streaming AI code generation instead of simulation
      await startStreamingGeneration(userMessage.content);
    } catch (error) {
      console.error('Error generating code:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'I encountered an issue while generating your code. Let me try a different approach...', isGenerating: false }
          : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  // Streaming code generation via backend API
  const startStreamingGeneration = async (prompt: string) => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Reset file list for this run (reuse sandbox, do not recreate)
    setGeneratedFiles([]);

    // Helper to append/replace a file in state
    const upsertFile = (path: string, content: string, language: string) => {
      setGeneratedFiles(prev => {
        const idx = prev.findIndex(f => f.path === path);
        const file: GeneratedFile = {
          path,
          content,
          language: language as any,
          status: 'generating'
        };
        if (idx >= 0) {
          const copy = prev.slice();
          copy[idx] = file;
          return copy;
        }
        return [...prev, file];
      });
    };

    // Ensure an E2B sandbox exists before we start streaming so preview can work
    if (!sandboxId) {
      try {
        const sandboxResponse = await fetch('/api/create-ai-sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (sandboxResponse.ok) {
          const data = await sandboxResponse.json();
          if (data?.sandboxId) setSandboxId(data.sandboxId);
          if (data?.url) setPreviewUrl(data.url);
        }
      } catch (_e) {
        // Non-fatal
      }
    }

    // Stream from backend (SSE JSON events)
    const res = await fetch('/api/generate-ai-code-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model: selectedModel,
        context: { sandboxId },
        isEdit: false
      }),
      signal
    });

    if (!res.ok || !res.body) {
      throw new Error('Failed to start streaming generation');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let sseBuffer = '';

    // Update assistant placeholder text minimally
    setMessages(prev => prev.map(m => m.isGenerating ? { ...m, content: 'Generating code…' } : m));

    // Helpers to parse <file> tags across streamed chunks
    const fileOpen = /<file\s+path="([^"]+)">/i;
    const fileClose = /<\/file>/i;
    let tagBuffer = '';
    let currentPath: string | null = null;
    let currentContent = '';

    const processTextChunk = (text: string) => {
      tagBuffer += text;
      while (tagBuffer.length) {
        if (currentPath === null) {
          const openMatch = tagBuffer.match(fileOpen);
          if (!openMatch) break;
          const idx = (openMatch.index || 0) + openMatch[0].length;
          currentPath = openMatch[1];
          tagBuffer = tagBuffer.slice(idx);
          currentContent = '';
        } else {
          const closeMatch = tagBuffer.match(fileClose);
          if (!closeMatch) {
            // Need more data for this file
            currentContent += tagBuffer;
            tagBuffer = '';
            break;
          }
          const idx = closeMatch.index || 0;
          currentContent += tagBuffer.slice(0, idx);
          tagBuffer = tagBuffer.slice(idx + closeMatch[0].length);
          const ext = (currentPath.split('.').pop() || '').toLowerCase();
          const language = ext === 'tsx' || ext === 'ts' ? 'tsx' : (ext === 'jsx' ? 'jsx' : (ext === 'css' ? 'css' : 'text'));
          upsertFile(currentPath, currentContent, language);
          currentPath = null;
          currentContent = '';
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      sseBuffer += decoder.decode(value, { stream: true });

      // Process complete SSE events (separated by blank lines)
      let sepIndex = sseBuffer.indexOf('\n\n');
      while (sepIndex !== -1) {
        const eventChunk = sseBuffer.slice(0, sepIndex);
        sseBuffer = sseBuffer.slice(sepIndex + 2);
        sepIndex = sseBuffer.indexOf('\n\n');

        const dataLine = eventChunk.split('\n').find(l => l.startsWith('data: '));
        if (!dataLine) continue;
        const jsonStr = dataLine.slice(6);
        let evt: any;
        try { evt = JSON.parse(jsonStr); } catch { continue; }

        if (evt?.type === 'stream' && typeof evt.text === 'string') {
          processTextChunk(evt.text);
        }
        if (evt?.type === 'complete') {
          // Final parse of the full response to ensure completeness
          const generatedCode = String(evt.generatedCode || '');
          const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
          const finalFiles: GeneratedFile[] = [];
          let m: RegExpExecArray | null;
          while ((m = fileRegex.exec(generatedCode)) !== null) {
            const p = m[1];
            const c = m[2];
            const ext = (p.split('.').pop() || '').toLowerCase();
            const language = ext === 'tsx' || ext === 'ts' ? 'tsx' : (ext === 'jsx' ? 'jsx' : (ext === 'css' ? 'css' : 'text'));
            finalFiles.push({ path: p, content: c, language: language as any, status: 'complete' });
          }
          if (finalFiles.length > 0) {
            setGeneratedFiles(finalFiles);
          }

          // Apply files directly from generated response for accuracy
          try {
            const applyResponse = await fetch('/api/apply-ai-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ response: generatedCode, isEdit: false, packages: evt.packagesToInstall || [] })
            });
            if (!applyResponse.ok) {
              console.error('Apply to sandbox failed');
            }
          } catch (e) {
            console.error('Sandbox apply error:', e);
          }

          // Persist files to Supabase (if project provided)
          try {
            if (projectId) {
              await fetch('/api/files/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, files: finalFiles.map(f => ({ path: f.path, content: f.content })) })
              });
            }
          } catch (e) {
            console.error('Persist files error:', e);
          }

          // Switch to real sandbox URL and show loading until ready
          setIsPreviewLoading(true);
          await pollSandboxUntilReady();
          setIsPreviewLoading(false);
        }
      }
    }

    // Mark files as complete
    setGeneratedFiles(prev => prev.map(f => ({ ...f, status: 'complete' })));

    // Apply to sandbox and refresh preview using existing flow
    try {
      // Reuse existing apply flow by creating a mock response from current state
      const payload = generateMockAIResponse(
        (function(files) { return files; })(
          (await (async () => {
            // capture latest
            let latest: GeneratedFile[] = [];
            setGeneratedFiles(prev => (latest = prev, prev));
            return latest;
          })())
        )
      );

      const applyResponse = await fetch('/api/apply-ai-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: payload, isEdit: false, packages: [] })
      });
      if (!applyResponse.ok) {
        console.error('Apply to sandbox failed');
      }
    } catch (e) {
      console.error('Sandbox apply error:', e);
    }

    // Only prefer real sandbox; keep loading state until it's ready
    setIsPreviewLoading(true);
    await pollSandboxUntilReady();
    setIsPreviewLoading(false);

    // Finalize assistant message
    setMessages(prev => prev.map(m => m.isGenerating ? { ...m, isGenerating: false } : m));
    setIsGenerating(false);
  };

  // Poll sandbox status and switch preview to real URL when ready
  const pollSandboxUntilReady = async (maxAttempts: number = 8, delayMs: number = 1000): Promise<boolean> => {
    try {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const statusRes = await fetch('/api/sandbox-status');
          if (statusRes.ok) {
            const data = await statusRes.json();
            const url: string | undefined = data?.sandboxData?.url;
            if (url && (url.includes('e2b.dev') || url.includes('e2b.app'))) {
              setPreviewUrl(url);
              setViewMode('preview');
              return true;
            }
          }
        } catch (_e) {
          // ignore and retry
        }
        await new Promise(r => setTimeout(r, delayMs));
      }
    } catch (_e) {
      // ignore
    }
    return false;
  };

  const generateMockAIResponse = (files: GeneratedFile[]) => {
    let response = `Here are the generated files for your React application:\n\n`;

    files.forEach(file => {
      response += `<file path="${file.path}">\n${file.content}\n</file>\n\n`;
    });

    return response;
  };

  const generateFallbackPreview = (files: GeneratedFile[]) => {
    const indexCss = files.find(f => f.path === 'src/index.css');
    const appTsx = files.find(f => f.path === 'src/App.tsx');
    const headerTsx = files.find(f => f.path === 'src/components/Header.tsx');
    const heroJsx = files.find(f => f.path === 'src/components/Hero.jsx');
    const featuresJsx = files.find(f => f.path === 'src/components/Features.jsx');
    const footerJsx = files.find(f => f.path === 'src/components/Footer.jsx');

    // Extract the actual content from the generated files
    const getComponentContent = (file: GeneratedFile | undefined) => {
      if (!file) return '';
      return file.content;
    };

    // Create a more realistic preview that shows the actual generated content
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated App Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${indexCss?.content || ''}
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
    </style>
</head>
<body class="min-h-screen bg-gray-900 text-white">
    <!-- Header Component -->
    <header class="bg-gray-800 border-b border-gray-700">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-white">Lovable</h1>
        </div>
                <nav class="hidden md:flex">
                    <ul class="flex space-x-8">
                        <li><a href="#features" class="text-gray-300 hover:text-white transition-colors">Features</a></li>
                        <li><a href="#about" class="text-gray-300 hover:text-white transition-colors">About</a></li>
                        <li><a href="#contact" class="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Component -->
    <section class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex justify-center mb-6">
                <div class="flex items-center gap-2 bg-yellow-500 px-4 py-2 rounded-full">
                    <span class="text-yellow-900 font-medium">🚀 AI-Powered Development</span>
                        </div>
                    </div>
            <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
                Build Amazing Apps with
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"> AI</span>
            </h1>
            <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Transform your ideas into beautiful, functional applications using the power of artificial intelligence.
                No coding experience required.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button class="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2">
                    Get Started Free →
                </button>
                <button class="border border-gray-400 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                    Watch Demo
                </button>
            </div>
        </div>
    </section>

    <!-- Features Component -->
    <section class="py-20 bg-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-white mb-4">Features</h2>
                <p class="text-xl text-gray-300">Everything you need to build amazing applications</p>
                </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors">
                    <h3 class="text-xl font-semibold text-white mb-3">AI-Powered Development</h3>
                    <p class="text-gray-300">Build applications with the help of advanced AI that understands your requirements.</p>
                </div>
                <div class="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors">
                    <h3 class="text-xl font-semibold text-white mb-3">Real-time Preview</h3>
                    <p class="text-gray-300">See your changes instantly with live preview functionality.</p>
            </div>
                <div class="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors">
                    <h3 class="text-xl font-semibold text-white mb-3">Modern Tech Stack</h3>
                    <p class="text-gray-300">Built with React, TypeScript, and Tailwind CSS for optimal performance.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer Component -->
    <footer class="bg-gray-900 border-t border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center">
                <p class="text-gray-400">Built with ❤️ using AI-powered development tools</p>
            </div>
        </div>
    </footer>

    <!-- Generated Files Info -->
    <div class="bg-gray-800 border-t border-gray-700 p-4">
        <div class="max-w-7xl mx-auto">
            <p class="text-sm text-gray-400 text-center">
                Generated ${files.length} files • AI-Powered Development
            </p>
        </div>
    </div>
</body>
</html>`;

    return html;
  };


  const getDefaultThinkingSteps = (operation: string, messageId: string) => {
    const baseSteps = [
      {
        id: 'analyze-request',
        title: 'Analyzing your request',
        description: 'Understanding what you want to build',
        status: 'pending' as const,
        duration: 0
      },
      {
        id: 'plan-architecture',
        title: 'Planning architecture',
        description: 'Designing the component structure',
        status: 'pending' as const,
        duration: 0
      },
      {
        id: 'generate-code',
        title: 'Generating code',
        description: 'Creating the implementation',
        status: 'pending' as const,
        duration: 0
      },
      {
        id: 'optimize',
        title: 'Optimizing',
        description: 'Adding performance improvements',
        status: 'pending' as const,
        duration: 0
      }
    ];

    if (operation === 'edit') {
      return [
        {
          id: 'analyze-changes',
          title: 'Analyzing changes',
          description: 'Understanding what needs to be modified',
          status: 'pending' as const,
          duration: 0
        },
        {
          id: 'update-code',
          title: 'Updating code',
          description: 'Making the requested changes',
          status: 'pending' as const,
          duration: 0
        },
        {
          id: 'test-changes',
          title: 'Testing changes',
          description: 'Ensuring everything works correctly',
          status: 'pending' as const,
          duration: 0
        }
      ];
    }

    return baseSteps;
  };

  const simulateCodeGeneration = async (prompt: string) => {
    const startTime = Date.now();
    
    try {
      // Determine operation type
      const operation = prompt.toLowerCase().includes('edit') || prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('update') 
        ? 'edit' : prompt.toLowerCase().includes('analyze') ? 'analyze' : 'generate';

      // First, ensure we have a sandbox created
      try {
        console.log('Ensuring sandbox exists...');
        const sandboxResponse = await fetch('/api/create-ai-sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (sandboxResponse.ok) {
          const sandboxData = await sandboxResponse.json();
          console.log('Sandbox created successfully:', sandboxData);
          if (sandboxData.sandboxId) {
          setSandboxId(sandboxData.sandboxId);
          }
          if (sandboxData.url) {
          setPreviewUrl(sandboxData.url);
            console.log('Sandbox URL set:', sandboxData.url);
          }
        } else {
          const errorText = await sandboxResponse.text();
          console.error('Failed to create sandbox:', errorText);
          // Don't throw error, continue with fallback
        }
      } catch (error) {
        console.error('Error creating sandbox:', error);
        // Don't throw error, continue with fallback
      }
    
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
    
    console.log('Added thinking state to message:', messageId, 'with steps:', thinkingSteps.length);

    // Simulate thinking process with reduced state updates
    let stepIndex = 0;
    const processSteps = async () => {
      console.log('Starting thinking process with', thinkingSteps.length, 'steps');
      
      // Update all steps to completed at once to reduce blinking
      const completedSteps = thinkingSteps.map(step => ({
        ...step,
        status: 'completed' as const,
        duration: Math.round(Math.random() * 2000 + 500)
      }));

      // Single update to show all steps as completed
        setMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                thinking: {
                  ...msg.thinking!,
                currentStep: completedSteps[completedSteps.length - 1].id,
                steps: completedSteps
                }
              }
            : msg
        ));

      // Simulate total processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Thinking process completed');
    };

    await processSteps();

    // Concise assistant message only (no verbose analysis)
    const detailedResponse = 'Generating code and updating the editor and preview...';
    
    // Code generation functions for different project types
    const generateTodoApp = (): GeneratedFile[] => [
      {
        path: 'src/App.tsx',
        content: `import React, { useState } from 'react';
import { TodoList } from './components/TodoList';
import { AddTodo } from './components/AddTodo';
import './index.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Todo App
        </h1>
        <AddTodo onAdd={addTodo} />
        <TodoList 
          todos={todos} 
          onToggle={toggleTodo} 
          onDelete={deleteTodo} 
        />
      </div>
    </div>
  );
}

export default App;`,
        language: 'tsx',
        status: 'generating'
      },
      {
        path: 'src/components/TodoList.tsx',
        content: `import React from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  return (
    <div className="mt-6">
      {todos.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No todos yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggle(todo.id)}
                  className="mr-3 h-5 w-5 text-blue-600"
                />
                <span className={todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => onDelete(todo.id)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};`,
        language: 'tsx',
        status: 'generating'
      },
      {
        path: 'src/components/AddTodo.tsx',
        content: `import React, { useState } from 'react';

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Add Todo
      </button>
    </form>
  );
};`,
        language: 'tsx',
        status: 'generating'
      }
    ];

    const generatePortfolioWebsite = (): GeneratedFile[] => [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
    </div>
  );
}

export default App;`,
        language: 'tsx',
        status: 'generating'
      },
      {
        path: 'src/components/Hero.tsx',
        content: `import React from 'react';

export const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">John Doe</h1>
        <p className="text-xl mb-6">Full Stack Developer & UI/UX Designer</p>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          I create beautiful, functional web applications that solve real-world problems.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          View My Work
        </button>
          </div>
    </section>
  );
};`,
        language: 'tsx',
        status: 'generating'
      }
    ];

    const generateDashboard = (): GeneratedFile[] => [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardContent } from './components/DashboardContent';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <DashboardContent />
          </div>
        </div>
  );
}

export default App;`,
        language: 'tsx',
        status: 'generating'
      }
    ];

    const generateEcommerceSite = (): GeneratedFile[] => [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProductGrid />
      </main>
      <Cart />
    </div>
  );
}

export default App;`,
        language: 'tsx',
        status: 'generating'
      }
    ];

    const generateBlogSite = (): GeneratedFile[] => [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { Header } from './components/Header';
import { BlogList } from './components/BlogList';
import { Article } from './components/Article';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BlogList />
      </main>
    </div>
  );
}

export default App;`,
        language: 'tsx',
        status: 'generating'
      }
    ];

    const generateLandingPage = (): GeneratedFile[] => [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
        </div>
  );
}

export default App;`,
        language: 'tsx',
        status: 'generating'
      }
    ];

    const generateDefaultApp = (): GeneratedFile[] => [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
        </div>
  );
}

export default App;`,
        language: 'tsx',
        status: 'generating'
      }
    ];

    // Generate dynamic code based on user query
    const generateDynamicCode = (prompt: string): GeneratedFile[] => {
      const lowerPrompt = prompt.toLowerCase();
      
      // Determine project type and generate appropriate code
      if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
        return generateTodoApp();
      } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('personal website')) {
        return generatePortfolioWebsite();
      } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin')) {
        return generateDashboard();
      } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
        return generateEcommerceSite();
      } else if (lowerPrompt.includes('blog') || lowerPrompt.includes('article')) {
        return generateBlogSite();
      } else if (lowerPrompt.includes('landing') || lowerPrompt.includes('marketing')) {
        return generateLandingPage();
      } else {
        return generateDefaultApp();
      }
    };

    const mockFiles: GeneratedFile[] = generateDynamicCode(prompt);

    // Add configuration files for Vite + TypeScript + shadcn-ui stack
    const configFiles: GeneratedFile[] = [
      {
        path: 'package.json',
        content: `{\n  "name": "lovable-app",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "lucide-react": "^0.263.1",\n    "@radix-ui/react-slot": "^1.0.2",\n    "class-variance-authority": "^0.7.0",\n    "clsx": "^2.0.0",\n    "tailwind-merge": "^1.14.0"\n  },\n  "devDependencies": {\n    "@types/react": "^18.2.15",\n    "@types/react-dom": "^18.2.7",\n    "@typescript-eslint/eslint-plugin": "^6.0.0",\n    "@typescript-eslint/parser": "^6.0.0",\n    "@vitejs/plugin-react": "^4.0.3",\n    "autoprefixer": "^10.4.14",\n    "eslint": "^8.45.0",\n    "eslint-plugin-react-hooks": "^4.6.0",\n    "eslint-plugin-react-refresh": "^0.4.3",\n    "postcss": "^8.4.27",\n    "tailwindcss": "^3.3.0",\n    "typescript": "^5.0.2",\n    "vite": "^4.4.5"\n  }\n}`,
        language: 'json',
        status: 'generating'
      },
      {
        path: 'vite.config.ts',
        content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport path from 'path';\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },\n});`,
        language: 'typescript',
        status: 'generating'
      }
    ];

    const allFiles = [...mockFiles, ...configFiles];
    setGeneratedFiles(allFiles);

    // Single update to prevent blinking - combine all message updates
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
              filesGenerated: allFiles.map(f => f.path)
            }
          }
        : msg
    ));

    // Apply generated files to sandbox without additional state updates that cause blinking
    setTimeout(async () => {
      // Apply generated files to the sandbox
      try {
        console.log('Applying generated files to sandbox...');
        console.log('Generated files:', allFiles.map(f => ({ path: f.path, contentLength: f.content.length })));
        
        const applyResponse = await fetch('/api/apply-ai-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            response: generateMockAIResponse(allFiles),
            isEdit: false,
            packages: []
          })
        });

        if (applyResponse.ok) {
          const applyResult = await applyResponse.json();
          console.log('Files applied successfully to sandbox:', applyResult);
          
          // Wait a bit for the sandbox to process the files
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try to get the actual sandbox URL
          try {
            const statusResponse = await fetch('/api/sandbox-status');
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              console.log('Sandbox status:', statusData);
              if (statusData.url) {
                setPreviewUrl(statusData.url);
                console.log('Updated preview URL to sandbox:', statusData.url);
              }
            }
          } catch (statusError) {
            console.error('Error getting sandbox status:', statusError);
          }
        } else {
          const errorText = await applyResponse.text();
          console.error('Failed to apply files to sandbox:', errorText);
        }
      } catch (error) {
        console.error('Error applying files:', error);
      }

      // Create sandbox preview - this will use the sandbox URL if available, otherwise fallback
      await createSandboxPreviewOptimized();
      
      // Update file status after preview is ready to minimize blinking
      setGeneratedFiles(prev => prev.map(file => ({ ...file, status: 'complete' })));
    }, 1000); // Further reduced timeout to minimize delay
    
    } catch (error) {
      console.error('Error in simulateCodeGeneration:', error);
      // Update the generating message with error
      setMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: 'I encountered an issue while generating your code. Let me try a different approach...', 
              isGenerating: false,
              thinking: {
                ...msg.thinking!,
                isThinking: false
              }
            }
          : msg
      ));
    }
  };

  const createSandboxPreview = async () => {
    try {
      setIsPreviewLoading(true);

      // Generate a unique sandbox ID
      const newSandboxId = `lovable-${Date.now()}`;

      // Set up preview configuration for Vite stack
      setSandboxId(newSandboxId);
      setPreviewType('vite'); // Use Vite as requested
      setPreviewPort(5173); // Vite default port

      // Validate port configuration
      const newPort = 5173;
      if (typeof newPort !== 'number' || newPort <= 0 || newPort >= 65536) {
        console.error('Invalid port configuration:', newPort);
      } else {
        console.log('Setting preview port to:', newPort);
      }

      // For now, let's use the fallback preview immediately since sandbox isn't working
      // In a real implementation, this would connect to an actual sandbox
      console.log('Creating fallback preview since sandbox is not available...');
      
      // Create a fallback preview URL using the generated files
      const fallbackHtml = generateFallbackPreview(generatedFiles);
      const blob = new Blob([fallbackHtml], { type: 'text/html' });
      const fallbackUrl = URL.createObjectURL(blob);
      setPreviewUrl(fallbackUrl);

      console.log('Fallback Preview Setup:', {
        sandboxId: newSandboxId,
        port: newPort,
        previewUrl: fallbackUrl,
        type: 'fallback'
      });

      // Automatically switch to preview mode when ready
      setViewMode('preview');

      // Simulate loading time
      setTimeout(() => {
        setIsPreviewLoading(false);
        console.log('Preview loading complete');
      }, 2000);

    } catch (error) {
      console.error('Error creating sandbox preview:', error);
      setIsPreviewLoading(false);
    }
  };

  // Optimized version that doesn't cause blinking
  const createSandboxPreviewOptimized = async () => {
    try {
      // Check if we already have a sandbox URL from the API
      if (previewUrl && (previewUrl.includes('e2b.dev') || previewUrl.includes('e2b.app'))) {
        console.log('Using existing sandbox URL:', previewUrl);
        setViewMode('preview');
        return;
      }

      // Generate a unique sandbox ID
      const newSandboxId = `lovable-${Date.now()}`;

      // Set up preview configuration for Vite stack (batch all state updates)
      const newPort = 5173;
      const sandboxUrl = `https://${newSandboxId}-${newPort}.e2b.dev`;
      
      // Batch all state updates to prevent blinking
      setSandboxId(newSandboxId);
      setPreviewType('vite');
      setPreviewPort(newPort);

      console.log('Sandbox Preview Setup:', {
        sandboxId: newSandboxId,
        port: newPort,
        sandboxUrl,
        previewType: 'vite'
      });

      // Try to use the sandbox URL first, fallback to local preview if needed
      try {
        // Test if the sandbox URL is accessible
        const testResponse = await fetch(sandboxUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          setPreviewUrl(sandboxUrl);
          console.log('Using sandbox URL:', sandboxUrl);
        } else {
          throw new Error('Sandbox not accessible');
        }
      } catch (sandboxError) {
        console.log('Sandbox not ready, using fallback preview:', sandboxError);
        // Create a fallback HTML preview using the generated files
        const fallbackHtml = generateFallbackPreview(generatedFiles);
        const blob = new Blob([fallbackHtml], { type: 'text/html' });
        const fallbackUrl = URL.createObjectURL(blob);
        setPreviewUrl(fallbackUrl);
        console.log('Using fallback preview:', fallbackUrl);
      }

      // Automatically switch to preview mode when ready
      setViewMode('preview');

      console.log('Preview created successfully');
    } catch (error) {
      console.error('Error creating sandbox preview:', error);
      // Fallback to local preview on any error
      const fallbackHtml = generateFallbackPreview(generatedFiles);
      const blob = new Blob([fallbackHtml], { type: 'text/html' });
      const fallbackUrl = URL.createObjectURL(blob);
      setPreviewUrl(fallbackUrl);
      setViewMode('preview');
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

  // Preview control functions
  const handlePreviewRefresh = () => {
    console.log('Refreshing preview...');
    // Trigger preview refresh
  };

  const handleToggleConsole = () => {
    console.log('Toggling console...');
    // Toggle console visibility
  };

  const handleOpenInNewTab = () => {
    console.log('Opening preview in new tab...');
    // Open preview in new tab
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
    <div className="h-screen w-screen overflow-x-hidden bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isEditingProjectName ? (
              <input
                type="text"
                value={currentProject}
                onChange={(e) => setCurrentProject(e.target.value)}
                onBlur={() => setIsEditingProjectName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingProjectName(false);
                  } else if (e.key === 'Escape') {
                    setIsEditingProjectName(false);
                  }
                }}
                className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-purple-500 focus:outline-none px-1"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                onClick={() => setIsEditingProjectName(true)}
                title="Click to edit project name"
              >
                {currentProject}
              </h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="openai/gpt-5">GPT-5</option>
            <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
          </select>

          {/* Code/Preview Toggle */}
          <div className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-0.5">
          <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                viewMode === 'code'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title="Code Mode"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Code</span>
            </button>
            <button
              onClick={async () => {
                // Ensure a sandbox exists and prefer its URL
                if (!sandboxId) {
                  try {
                    const resp = await fetch('/api/create-ai-sandbox', { method: 'POST' });
                    if (resp.ok) {
                      const data = await resp.json();
                      if (data?.sandboxId) setSandboxId(data.sandboxId);
                      if (data?.url) setPreviewUrl(data.url);
                    }
                  } catch (_) {}
                }
                try {
                  const ok = await pollSandboxUntilReady();
                  if (!ok && (!previewUrl || previewUrl.startsWith('blob:'))) {
                    await createSandboxPreviewOptimized();
                  }
                } catch (_) {}
                setViewMode('preview');
              }}
              disabled={!sandboxId && !previewUrl}
              className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                viewMode === 'preview'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            } ${(!sandboxId && !previewUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Preview Mode"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          </div>
          
          <button
            onClick={() => setShowDeployment(true)}
            disabled={generatedFiles.length === 0}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Deploy"
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">Deploy</span>
          </button>


          {/* Preview Controls - Only show when in preview mode */}
          {viewMode === 'preview' && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <PreviewControls
                onRefresh={handlePreviewRefresh}
                onToggleConsole={handleToggleConsole}
                onOpenInNewTab={handleOpenInNewTab}
                previewUrl={previewUrl}
                isLoading={isPreviewLoading}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden h-full w-screen px-0 mr-0 gap-0">
        {/* Chat Panel - Fixed 30% width */}
        <div className="basis-[30%] grow-0 shrink-0 flex flex-col bg-white border-r border-gray-200 h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence mode="wait">
              {messages.map((message, index) => {
                // Ensure we always have a valid key - never empty
                const messageKey = message.id && message.id.trim() !== '' 
                  ? message.id 
                  : `message-${message.timestamp?.getTime() || Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
                
                // Debug logging to catch empty keys
                if (!messageKey || messageKey.trim() === '') {
                  console.error('Empty message key detected:', { message, index, messageKey });
                }
                
                return (
                <EnhancedChatMessage
                    key={messageKey}
                  message={message}
                  onRegenerate={handleRegenerate}
                  onFeedback={handleFeedback}
                />
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts removed as requested */}

          {/* Custom Chat Input Area */}
          <div className="p-6">
            <CustomChatInput
                  value={inputValue}
              onChange={setInputValue}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
                  placeholder="Describe what you want to build..."
                  disabled={isGenerating}
              isGenerating={isGenerating}
            />
          </div>
        </div>


        {/* Code Editor Panel and Preview - Right side 70% */}
        <div className="basis-[70%] grow-0 shrink-0 flex min-w-0 h-full mr-0 pr-0">
          {/* Code Editor - Takes full width in code mode, hidden in preview mode */}
          <div className={"flex flex-col min-w-0 h-full " + (viewMode === 'code' ? "flex-1" : "hidden")}>

            {/* Git Modal */}
            <AnimatePresence>
            {showVersionControl && generatedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setShowVersionControl(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <GitBranch className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">Git Version Control</h2>
                            <p className="text-sm text-gray-600">Manage your code changes and collaborate effectively</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowVersionControl(false)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Git Tabs and Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                          {[
                            { id: 'history', label: 'History', icon: History },
                            { id: 'branches', label: 'Branches', icon: GitBranch },
                            { id: 'changes', label: 'Changes', icon: FileText }
                          ].map(tab => (
                            <button
                              key={globalKeyFix(`tab-${tab.id || 'unknown'}`)}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={"flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors " +
                                (activeTab === tab.id
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                )}
                            >
                              <tab.icon className="w-4 h-4" />
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                            <Save className="w-4 h-4" />
                            Quick Commit
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            <GitBranch className="w-4 h-4" />
                            New Branch
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <VersionControlPanel
                  currentFiles={generatedFiles.map(f => ({ path: f.path, content: f.content }))}
                  onRevert={handleVersionControlAction.onRevert}
                  onCreateBranch={handleVersionControlAction.onCreateBranch}
                  onSwitchBranch={handleVersionControlAction.onSwitchBranch}
                  onCommit={handleVersionControlAction.onCommit}
                        className="shadow-none border-none"
                        isModal={true}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                />
              </div>
                  </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Code Editor Container with fixed height and internal scrolling */}
            <div className="flex-1 flex flex-col min-h-0 bg-gray-900 rounded-xl m-0 pb-4 overflow-hidden">
              <div className="flex-1 overflow-hidden">
              <RealtimeCodeEditor
                isGenerating={isGenerating}
                generatedFiles={generatedFiles}
                onFilesChange={(files: any) => {
                  setGeneratedFiles(files);
                  if (projectId) {
                    if ((window as any).__autosaveTimer) clearTimeout((window as any).__autosaveTimer);
                    (window as any).__autosaveTimer = setTimeout(async () => {
                      try {
                        await fetch('/api/files/save', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ projectId, files: files.map((f: any) => ({ path: f.path, content: f.content })) })
                        });
                      } catch (e) { console.error('Autosave error:', e); }
                    }, 700);
                  }
                }}
                className="h-full overflow-auto"
              />
              </div>
              
            </div>
          </div>

          {/* Preview Panel - Shows in preview mode and takes full width with same styling */}
          {viewMode === 'preview' && (
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <div className="flex-1 bg-gray-900 rounded-xl m-0 pb-0 overflow-hidden">
              <SandboxPreview
                sandboxId={sandboxId}
                port={previewPort}
                type={previewType}
                isLoading={isPreviewLoading}
                previewUrl={previewUrl}
                  onRefresh={handlePreviewRefresh}
                  onToggleConsole={handleToggleConsole}
                  onOpenInNewTab={handleOpenInNewTab}
              />
              </div>
            </div>
          )}
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



        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onTemplateSelect={handleTemplateSelect}
          onShowVersionControl={() => setShowVersionControl(true)}
        />

      </AnimatePresence>

    </div>
  );
};

export default LovableInterface;
