'use client';

import React, { useState, useEffect, useRef } from 'react';
import { globalKeyFix } from '../lib/globalKeyFix';
import {
  Send,
  Sparkles,
  Code2,
  Eye,
  BookTemplate,
  Rocket,
  GitBranch,
  Settings,
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
import ErrorRecoverySystem from './ErrorRecoverySystem';
import VersionControlPanel from './VersionControlPanel';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublic, setIsPublic] = useState(false);

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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="group flex flex-col gap-2 p-3 w-full rounded-3xl border border-gray-300 bg-gray-100 text-base shadow-xl transition-all duration-150 ease-in-out focus-within:border-gray-400 hover:border-gray-400 focus-within:hover:border-gray-400"
    >
      <div className="relative flex flex-1 items-center">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex w-full rounded-md px-2 py-2 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none text-[16px] leading-snug placeholder-shown:text-ellipsis placeholder-shown:whitespace-nowrap md:text-base focus-visible:ring-0 focus-visible:ring-offset-0 max-h-[200px] bg-transparent focus:bg-transparent flex-1"
          id="chatinput"
          autoFocus
          style={{ minHeight: '80px', height: '80px' }}
          placeholder={placeholder}
          maxLength={50000}
          disabled={disabled}
        />
      </div>

      <div className="flex gap-1 flex-wrap items-center">
        {/* Plus button for attachments */}
        <button
          type="button"
          onClick={handleFileUpload}
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-gray-100 shadow-sm hover:bg-gray-200 hover:border-gray-400 gap-1.5 h-8 w-8 rounded-full p-0 text-gray-500 hover:text-gray-700"
        >
          <Plus className="shrink-0 h-5 w-5 text-gray-500" />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id="file-upload"
          className="hidden"
          accept="image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp"
          multiple
          type="file"
          onChange={handleFileChange}
        />

        {/* Public/Private toggle button */}
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className="whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-gray-100 shadow-sm hover:bg-gray-200 hover:border-gray-400 px-3 py-2 flex h-8 items-center justify-center gap-1 rounded-full text-gray-500 hover:text-gray-700"
        >
          <div className="flex items-center gap-1 duration-200">
            <Mic className="shrink-0 h-4 w-4" />
            <span className="hidden md:flex">{isPublic ? 'Public' : 'Private'}</span>
          </div>
        </button>

        {/* Menu button */}
        <div className="ml-auto flex items-center gap-1">
          <div className="relative flex items-center gap-1 md:gap-2">
            <div></div>
            <button
              type="button"
              className="gap-2 whitespace-nowrap text-sm font-medium ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none border border-gray-300 bg-gray-100 shadow-sm hover:bg-gray-200 hover:border-gray-400 relative z-10 flex rounded-full p-0 text-gray-500 transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50 items-center justify-center h-8 w-8"
            >
              <MoreVertical className="shrink-0 relative z-10 h-5 w-5" />
            </button>

            {/* Send button */}
            <button
              id="chatinput-send-message-button"
              type="submit"
              disabled={!value.trim() || isGenerating}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="shrink-0 h-6 w-6 text-white" />
            </button>
          </div>
        </div>
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
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
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
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Settings className="w-5 h-5 text-white" />
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
                      { name: 'Landing Page', description: 'Modern landing page with hero section', icon: Sparkles },
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
                        disabled={generatedFiles.length === 0}
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
import SandboxPreview from './SandboxPreview';
import AutoErrorCorrection from './AutoErrorCorrection';

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
  // Helper function to generate unique message IDs
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  const generateMessageId = () => {
    const timestamp = Date.now();
    const counter = messageIdCounter;
    setMessageIdCounter(prev => prev + 1);
    // Add microsecond precision and random component to ensure uniqueness
    const microTime = typeof performance !== 'undefined' ? 
      Math.floor(performance.now() * 1000) : 
      timestamp * 1000 + Math.random() * 1000;
    return `msg-${microTime}-${counter}`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-message',
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
  const [previewPort, setPreviewPort] = useState<number>(5173); // Default to Vite port
  const [previewType, setPreviewType] = useState<'vite' | 'nextjs' | 'console'>('vite');
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'branches' | 'changes'>('history');
  const [currentProject, setCurrentProject] = useState('my-lovable-app');
  const [currentError, setCurrentError] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code'); // Toggle between code and preview
  const [codeErrors, setCodeErrors] = useState<any[]>([]);
  const [showSiteAnalyzer, setShowSiteAnalyzer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


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
      // Simulate AI response and file generation
      await simulateCodeGeneration(userMessage.content);
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

  const generateMockAIResponse = (files: GeneratedFile[]) => {
    let response = `Here are the generated files for your React application:\n\n`;

    files.forEach(file => {
      response += `<file path="${file.path}">\n${file.content}\n</file>\n\n`;
    });

    return response;
  };

  const generateFallbackPreview = (files: GeneratedFile[]) => {
    const indexCss = files.find(f => f.path === 'src/index.css');

    // Create a simple HTML preview
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lovable Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${indexCss?.content || ''}
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
    </style>
</head>
<body class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-4">🚀 Lovable Preview</h1>
            <p class="text-xl text-gray-300">Your generated React application preview</p>
        </div>

        <!-- Generated App Content -->
        <div class="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 class="text-2xl font-bold mb-4">Generated Files:</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${files.map(file => `
                    <div class="bg-gray-700 rounded p-4">
                        <h3 class="text-lg font-semibold mb-2">${file.path}</h3>
                        <div class="text-sm text-gray-300 max-h-32 overflow-hidden">
                            <pre class="whitespace-pre-wrap text-xs">${file.content.substring(0, 200)}${file.content.length > 200 ? '...' : ''}</pre>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Fallback Content -->
        <div class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-lg p-8 text-center">
            <h2 class="text-3xl font-bold mb-4">✨ Your App is Ready!</h2>
            <p class="text-xl text-gray-300 mb-6">
                This is a fallback preview of your generated React application.
                The sandbox environment may take a moment to load.
            </p>
            <div class="flex justify-center space-x-4">
                <div class="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold">
                    🎯 Generated Successfully
                </div>
                <div class="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold">
                    🔄 Sandbox Loading...
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    return html;
  };

  const generateAIInsights = (prompt: string, operation: string) => {
    const promptLower = prompt.toLowerCase();

    // Analyze the prompt for specific patterns and provide relevant insights
    if (promptLower.includes('landing page') || promptLower.includes('homepage')) {
      return `🌟 **Landing Page Strategy Insights**\nBased on your request, I'm creating a high-converting landing page with:\n• Hero section with compelling value proposition\n• Social proof elements (testimonials, stats)\n• Clear call-to-action buttons\n• Mobile-responsive design that works on all devices\n• Fast loading performance for better SEO`;
    }

    if (promptLower.includes('dashboard') || promptLower.includes('admin')) {
      return `📊 **Dashboard Design Insights**\nI'm building a comprehensive dashboard with:\n• Intuitive navigation and user experience\n• Data visualization components (charts, graphs)\n• Real-time updates and live data feeds\n• Responsive grid layout that adapts to screen sizes\n• Clean information hierarchy for better usability`;
    }

    if (promptLower.includes('ecommerce') || promptLower.includes('shop') || promptLower.includes('store')) {
      return `🛒 **E-commerce Excellence Insights**\nYour online store will feature:\n• Product catalog with advanced filtering\n• Shopping cart with persistent state\n• Secure checkout flow with multiple payment options\n• Customer reviews and ratings system\n• Inventory management and order tracking`;
    }

    if (promptLower.includes('blog') || promptLower.includes('news') || promptLower.includes('article')) {
      return `📝 **Content Platform Insights**\nI'm creating a content-rich platform with:\n• Clean article layout with optimal readability\n• Category-based content organization\n• Search functionality with filters\n• Social sharing capabilities\n• SEO-optimized structure for better discoverability`;
    }

    if (promptLower.includes('portfolio') || promptLower.includes('showcase')) {
      return `🎨 **Portfolio Showcase Insights**\nYour portfolio will showcase:\n• Professional project galleries\n• Skill highlights and expertise areas\n• Contact integration and lead capture\n• Visual storytelling through design\n• Performance optimized for creative work presentation`;
    }

    if (operation === 'edit') {
      return `🔧 **Code Enhancement Insights**\nI'm improving your existing code by:\n• Refactoring for better maintainability\n• Adding error handling and validation\n• Optimizing performance and loading times\n• Enhancing user experience and accessibility\n• Following modern React and TypeScript best practices`;
    }

    // Generic insights for other types of applications
    return `🚀 **Application Development Insights**\nI'm building your application with:\n• Modern React architecture and patterns\n• TypeScript for enhanced developer experience\n• Responsive design that works everywhere\n• Performance optimizations for fast loading\n• Clean, maintainable code structure that scales`;
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
          setSandboxId(sandboxData.sandboxId);
          setPreviewUrl(sandboxData.url);
        } else {
          console.error('Failed to create sandbox');
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

    // Simulate thinking process
    let stepIndex = 0;
    const processSteps = async () => {
      console.log('Starting thinking process with', thinkingSteps.length, 'steps');
      while (stepIndex < thinkingSteps.length) {
        const currentStep = thinkingSteps[stepIndex];
        console.log('Processing step', stepIndex + 1, ':', currentStep.title);
        
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

        console.log('Completed step', stepIndex + 1, ':', currentStep.title);
        stepIndex++;
      }
      console.log('Thinking process completed');
    };

    await processSteps();

    // Generate detailed response with insights
    const insights = generateAIInsights(prompt, operation);
    const detailedResponse = `Perfect! I've analyzed your request and here's what I'm creating for you:

${insights}

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

    // Simulate file generation with Vite + TypeScript + React + Tailwind CSS stack
    const mockFiles: GeneratedFile[] = [
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
      },
      {
        path: 'src/components/Header.tsx',
        content: `import React from 'react';

export const Header = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Lovable</h1>
          </div>
          <nav className="hidden md:flex">
            <ul className="flex space-x-8">
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};`,
        language: 'tsx',
        status: 'generating'
      },
      {
        path: 'src/components/Hero.jsx',
        content: `import React from 'react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-yellow-500 px-4 py-2 rounded-full">
            <span className="text-yellow-900 font-medium">🚀 AI-Powered Development</span>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Build Amazing Apps with
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"> AI</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Transform your ideas into beautiful, functional applications using the power of artificial intelligence.
          No coding experience required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2">
            Get Started Free →
          </button>
          <button className="border border-gray-400 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;`,
        language: 'jsx',
        status: 'generating'
      },
      {
        path: 'src/index.css',
        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer base {\n  body {\n    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n    line-height: 1.6;\n  }\n}\n\n@layer components {\n  .btn-primary {\n    @apply bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform;\n  }\n  \n  .card {\n    @apply bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow;\n  }\n}\n\n@keyframes fadeInUp {\n  from {\n    opacity: 0;\n    transform: translateY(30px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n.animate-fade-in-up {\n  animation: fadeInUp 0.6s ease-out forwards;\n}`,
        language: 'css',
        status: 'generating'
      },
      {
        path: 'src/components/Features.jsx',
        content: `import React from 'react';

const Features = () => {
  const features = [
    {
      title: 'AI-Powered Development',
      description: 'Build applications with the help of advanced AI that understands your requirements.'
    },
    {
      title: 'Real-time Preview',
      description: 'See your changes instantly with live preview functionality.'
    },
    {
      title: 'Modern Tech Stack',
      description: 'Built with React, TypeScript, and Tailwind CSS for optimal performance.'
    }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Features</h2>
          <p className="text-xl text-gray-300">Everything you need to build amazing applications</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={globalKeyFix('feature-' + index)} className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;`,
        language: 'jsx',
        status: 'generating'
      },
      {
        path: 'src/components/Footer.jsx',
        content: `import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-400">
            Built with ❤️ using AI-powered development tools
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`,
        language: 'jsx',
        status: 'generating'
      }
    ];

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

    // Update metadata with generated files
    setMessages(prev => prev.map(msg => 
      msg.metadata?.operation === operation
        ? { 
            ...msg, 
            metadata: {
              ...msg.metadata,
              filesGenerated: allFiles.map(f => f.path)
            }
          }
        : msg
    ));

    // Simulate file completion and apply to sandbox
    setTimeout(async () => {
      setGeneratedFiles(prev => prev.map(file => ({ ...file, status: 'complete' })));

      // Apply generated files to the sandbox
      try {
        console.log('Applying generated files to sandbox...');
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
          console.log('Files applied successfully:', applyResult);
        } else {
          console.error('Failed to apply files to sandbox');
        }
      } catch (error) {
        console.error('Error applying files:', error);
      }

      // Create sandbox preview after files are applied
      await createSandboxPreview();

      // Fallback: Create a simple HTML preview if sandbox fails
      setTimeout(() => {
        if (!previewUrl || previewUrl.trim() === '') {
          console.log('Creating fallback HTML preview...');
          const fallbackHtml = generateFallbackPreview(allFiles);
          const blob = new Blob([fallbackHtml], { type: 'text/html' });
          const fallbackUrl = URL.createObjectURL(blob);
          setPreviewUrl(fallbackUrl);
          console.log('Fallback preview created:', fallbackUrl);
        }
      }, 6000); // Wait a bit longer for sandbox to be ready
    }, 4000);
    
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

      // Create preview URL (E2B sandbox URL)
      const previewUrl = `https://${newSandboxId}-${newPort}.e2b.dev`;
      setPreviewUrl(previewUrl);

      console.log('Sandbox Preview Setup:', {
        sandboxId: newSandboxId,
        port: newPort,
        previewUrl,
        type: 'vite'
      });

      // Automatically switch to preview mode when ready
      setViewMode('preview');

      // Simulate Vite dev server startup time
      setTimeout(() => {
        setIsPreviewLoading(false);
        console.log('Preview loading complete');
      }, 3000);

    } catch (error) {
      console.error('Error creating sandbox preview:', error);
      setIsPreviewLoading(false);
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


  const handleErrorRetry = async (_strategy?: string) => {
    setIsRetrying(true);
    try {
      // Simulate retry logic based on strategy
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentError(null);
      // Retry the last failed operation
    } catch (_error) {
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

  const handleCodeCorrected = (correctedCode: string) => {
    // Update the generated files with corrected code
    setGeneratedFiles(prev => prev.map(file => {
      if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
        return { ...file, content: correctedCode };
      }
      return file;
    }));
    
    // Show success message
    console.log('Code automatically corrected!');
  };

  const handleErrorsDetected = (errors: any[]) => {
    setCodeErrors(errors);
    if (errors.length > 0) {
      console.log(`Detected ${errors.length} code errors - auto-fixing...`);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between">
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
              onClick={() => setViewMode('preview')}
            disabled={!sandboxId}
              className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                viewMode === 'preview'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            } ${!sandboxId ? 'opacity-50 cursor-not-allowed' : ''}`}
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

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings & Tools"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Fixed 30% width */}
        <div className="w-[30%] flex flex-col bg-white border-r border-gray-200 flex-shrink-0 max-h-screen">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <EnhancedChatMessage
                  key={globalKeyFix(`message-${message.id || 'unknown'}`)}
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
                    key={globalKeyFix(`prompt-${index}`)}
                    onClick={() => setInputValue(prompt)}
                    className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Chat Input Area */}
          <div className="p-6 border-t border-gray-200">
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


        {/* Code Editor Panel and Preview */}
        <div className="flex-1 flex min-w-0">
          {/* Code Editor - Takes full width in code mode, hidden in preview mode */}
          <div className={"flex flex-col min-w-0 " + (viewMode === 'code' ? "flex-1" : "hidden")}>
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
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
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

            <div className="flex-1 flex flex-col">
              <RealtimeCodeEditor
                isGenerating={isGenerating}
                generatedFiles={generatedFiles}
                className="flex-1"
              />
              
              {/* Auto Error Correction */}
              {generatedFiles.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  <AutoErrorCorrection
                    generatedCode={generatedFiles.find(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'))?.content || ''}
                    onCodeCorrected={handleCodeCorrected}
                    onErrorsDetected={handleErrorsDetected}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel - Shows in preview mode and takes full width */}
          {viewMode === 'preview' && (
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1">
              <SandboxPreview
                sandboxId={sandboxId}
                port={previewPort}
                type={previewType}
                isLoading={isPreviewLoading}
                previewUrl={previewUrl}
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
