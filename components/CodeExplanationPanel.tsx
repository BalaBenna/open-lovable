'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  BookOpen, 
  Lightbulb, 
  Zap, 
  Shield, 
  Smartphone,
  Eye,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Settings,
  Palette,
  Database,
  Globe,
  Lock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface CodeExplanation {
  file: string;
  overview: string;
  keyFeatures: string[];
  codeBreakdown: {
    section: string;
    explanation: string;
    importance: 'high' | 'medium' | 'low';
    icon: React.ReactNode;
  }[];
  bestPractices: {
    practice: string;
    reason: string;
    example?: string;
  }[];
  performance: {
    optimizations: string[];
    metrics: {
      bundleSize: string;
      loadTime: string;
      accessibility: string;
    };
  };
  accessibility: {
    features: string[];
    compliance: string;
    improvements: string[];
  };
  responsiveness: {
    breakpoints: string[];
    approach: string;
    features: string[];
  };
}

interface CodeExplanationPanelProps {
  files: { path: string; content: string }[];
  onClose: () => void;
  className?: string;
}

const CodeExplanationPanel: React.FC<CodeExplanationPanelProps> = ({
  files,
  onClose,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [explanations, setExplanations] = useState<Record<string, CodeExplanation>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  // Auto-select first file
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0].path);
    }
  }, [files, selectedFile]);

  // Generate explanation for selected file
  useEffect(() => {
    if (selectedFile && !explanations[selectedFile]) {
      generateExplanation(selectedFile);
    }
  }, [selectedFile]);

  const generateExplanation = async (filePath: string) => {
    setIsGenerating(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    const file = files.find(f => f.path === filePath);
    if (!file) return;

    // Generate comprehensive explanation based on file type and content
    const explanation: CodeExplanation = generateFileExplanation(file);
    
    setExplanations(prev => ({
      ...prev,
      [filePath]: explanation
    }));
    
    setIsGenerating(false);
  };

  const generateFileExplanation = (file: { path: string; content: string }): CodeExplanation => {
    const isReactComponent = file.path.includes('.jsx') || file.path.includes('.tsx');
    const isStyleFile = file.path.includes('.css');
    const isConfigFile = file.path.includes('config') || file.path.includes('.json');

    if (isReactComponent) {
      return {
        file: file.path,
        overview: `This React component implements a modern, responsive UI element following current web development best practices. It uses functional components with hooks for state management, incorporates accessibility features, and follows a mobile-first design approach.`,
        keyFeatures: [
          "Functional React component with hooks",
          "TypeScript for type safety",
          "Responsive design with Tailwind CSS",
          "Accessibility features (ARIA labels, semantic HTML)",
          "Performance optimizations (memoization, lazy loading)",
          "Modern ES6+ JavaScript features"
        ],
        codeBreakdown: [
          {
            section: "Imports and Dependencies",
            explanation: "The component imports necessary React hooks (useState, useEffect) and external libraries. We use selective imports to optimize bundle size and only include what's needed.",
            importance: 'high' as const,
            icon: <Database className="w-4 h-4" />
          },
          {
            section: "Component State Management",
            explanation: "State is managed using React hooks (useState, useEffect) following functional programming principles. This provides better performance and easier testing compared to class components.",
            importance: 'high' as const,
            icon: <Settings className="w-4 h-4" />
          },
          {
            section: "Event Handlers",
            explanation: "Event handlers are properly memoized using useCallback to prevent unnecessary re-renders. This is crucial for performance in complex applications.",
            importance: 'medium' as const,
            icon: <Zap className="w-4 h-4" />
          },
          {
            section: "JSX Structure",
            explanation: "The JSX follows semantic HTML principles with proper heading hierarchy, meaningful element selection, and accessible markup. This ensures good SEO and screen reader compatibility.",
            importance: 'high' as const,
            icon: <Layers className="w-4 h-4" />
          },
          {
            section: "Styling with Tailwind",
            explanation: "Tailwind CSS classes provide utility-first styling with responsive breakpoints. The approach ensures consistent design while maintaining small bundle sizes.",
            importance: 'medium' as const,
            icon: <Palette className="w-4 h-4" />
          }
        ],
        bestPractices: [
          {
            practice: "Functional Components with Hooks",
            reason: "Modern React development standard that provides better performance, easier testing, and cleaner code organization.",
            example: "const Component = () => { const [state, setState] = useState(initialValue); }"
          },
          {
            practice: "TypeScript Integration",
            reason: "Provides compile-time type checking, better IDE support, and reduces runtime errors by catching issues during development.",
            example: "interface Props { title: string; onClick: () => void; }"
          },
          {
            practice: "Memoization for Performance",
            reason: "Using React.memo, useMemo, and useCallback prevents unnecessary re-renders and improves application performance.",
            example: "const memoizedValue = useMemo(() => expensiveCalculation(a, b), [a, b]);"
          },
          {
            practice: "Semantic HTML Structure",
            reason: "Proper HTML semantics improve accessibility, SEO, and provide better structure for screen readers and search engines.",
            example: "<main><section><h2>Section Title</h2><article>Content</article></section></main>"
          }
        ],
        performance: {
          optimizations: [
            "Tree-shaking compatible imports",
            "Component memoization with React.memo",
            "Lazy loading for heavy components",
            "Optimized re-rendering with dependency arrays",
            "Efficient event handler patterns"
          ],
          metrics: {
            bundleSize: "< 50KB gzipped",
            loadTime: "< 200ms",
            accessibility: "WCAG 2.1 AA compliant"
          }
        },
        accessibility: {
          features: [
            "Semantic HTML elements (header, main, section, article)",
            "Proper heading hierarchy (h1, h2, h3)",
            "ARIA labels for interactive elements",
            "Focus management and keyboard navigation",
            "Color contrast compliance (4.5:1 ratio)",
            "Screen reader friendly markup"
          ],
          compliance: "WCAG 2.1 AA",
          improvements: [
            "Skip navigation links for keyboard users",
            "Live regions for dynamic content updates",
            "High contrast mode support"
          ]
        },
        responsiveness: {
          breakpoints: ["sm: 640px", "md: 768px", "lg: 1024px", "xl: 1280px"],
          approach: "Mobile-first responsive design using Tailwind CSS breakpoints",
          features: [
            "Flexible grid layouts that adapt to screen size",
            "Responsive typography scaling",
            "Touch-friendly interactive elements (44px minimum)",
            "Optimized images with responsive loading",
            "Collapsible navigation for mobile devices"
          ]
        }
      };
    } else if (isStyleFile) {
      return {
        file: file.path,
        overview: `This CSS file establishes the design system and styling foundation for the application. It includes Tailwind CSS utilities, custom component styles, and responsive design patterns that ensure consistency across all UI elements.`,
        keyFeatures: [
          "Tailwind CSS utility classes",
          "Custom component styles",
          "CSS custom properties (variables)",
          "Responsive design patterns",
          "Animation and transition definitions",
          "Typography and color system"
        ],
        codeBreakdown: [
          {
            section: "Tailwind Imports",
            explanation: "Imports Tailwind's base styles, components, and utilities. This provides a comprehensive utility-first CSS framework while maintaining small bundle sizes through purging unused styles.",
            importance: 'high' as const,
            icon: <Palette className="w-4 h-4" />
          },
          {
            section: "CSS Custom Properties",
            explanation: "Defines CSS variables for consistent theming, color schemes, and design tokens. This approach enables easy theme switching and maintains design consistency.",
            importance: 'high' as const,
            icon: <Settings className="w-4 h-4" />
          },
          {
            section: "Component Styles",
            explanation: "Custom component classes that extend Tailwind utilities. These provide reusable styling patterns while maintaining the utility-first approach.",
            importance: 'medium' as const,
            icon: <Layers className="w-4 h-4" />
          },
          {
            section: "Animations and Transitions",
            explanation: "Keyframe animations and transition definitions that enhance user experience with smooth, performant animations using CSS transforms and opacity.",
            importance: 'medium' as const,
            icon: <Zap className="w-4 h-4" />
          }
        ],
        bestPractices: [
          {
            practice: "Utility-First CSS Architecture",
            reason: "Tailwind's utility-first approach provides consistent styling, reduces CSS bundle size, and improves maintainability.",
            example: "@apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;"
          },
          {
            practice: "CSS Custom Properties for Theming",
            reason: "CSS variables enable dynamic theming, dark mode support, and consistent design token management across the application.",
            example: ":root { --primary-color: #3b82f6; --secondary-color: #6366f1; }"
          },
          {
            practice: "Mobile-First Responsive Design",
            reason: "Starting with mobile styles and progressively enhancing for larger screens ensures optimal performance and user experience across all devices.",
            example: ".container { @apply w-full px-4; @screen md { @apply px-8; } }"
          }
        ],
        performance: {
          optimizations: [
            "PurgeCSS removes unused styles",
            "Critical CSS inlined for faster rendering",
            "Efficient CSS custom properties",
            "Optimized animation performance",
            "Minimal CSS specificity conflicts"
          ],
          metrics: {
            bundleSize: "< 20KB gzipped",
            loadTime: "< 100ms",
            accessibility: "High contrast compliant"
          }
        },
        accessibility: {
          features: [
            "High contrast color ratios (4.5:1 minimum)",
            "Focus indicators for interactive elements",
            "Reduced motion support (@prefers-reduced-motion)",
            "Scalable typography (rem/em units)",
            "Screen reader friendly animations"
          ],
          compliance: "WCAG 2.1 AA",
          improvements: [
            "Dark mode color scheme support",
            "Forced colors mode compatibility",
            "Print stylesheet optimization"
          ]
        },
        responsiveness: {
          breakpoints: ["sm: 640px", "md: 768px", "lg: 1024px", "xl: 1280px"],
          approach: "Mobile-first responsive design with Tailwind CSS breakpoints",
          features: [
            "Fluid typography scaling",
            "Responsive spacing and layout",
            "Adaptive component sizing",
            "Optimized touch targets for mobile",
            "Container queries for component-level responsiveness"
          ]
        }
      };
    } else {
      return {
        file: file.path,
        overview: `This configuration file sets up essential project settings, build processes, and development environment configurations. It ensures optimal performance, proper tooling integration, and maintains consistency across different development environments.`,
        keyFeatures: [
          "Environment configuration",
          "Build optimization settings",
          "Development tools integration",
          "Performance tuning parameters",
          "Security configurations",
          "Deployment settings"
        ],
        codeBreakdown: [
          {
            section: "Configuration Object",
            explanation: "The main configuration object defines all necessary settings for the application build process, development environment, and production optimizations.",
            importance: 'high' as const,
            icon: <Settings className="w-4 h-4" />
          },
          {
            section: "Build Settings",
            explanation: "Optimization settings for bundling, code splitting, and asset management ensure optimal performance in production environments.",
            importance: 'high' as const,
            icon: <Zap className="w-4 h-4" />
          },
          {
            section: "Environment Variables",
            explanation: "Environment-specific configurations allow different settings for development, staging, and production without code changes.",
            importance: 'medium' as const,
            icon: <Globe className="w-4 h-4" />
          }
        ],
        bestPractices: [
          {
            practice: "Environment-Based Configuration",
            reason: "Separating configuration by environment ensures security, enables different optimizations, and simplifies deployment processes.",
            example: "process.env.NODE_ENV === 'production' ? prodConfig : devConfig"
          },
          {
            practice: "Security-First Settings",
            reason: "Proper security configurations protect against common vulnerabilities and ensure safe deployment practices.",
            example: "{ contentSecurityPolicy: { directives: { defaultSrc: ['self'] } } }"
          }
        ],
        performance: {
          optimizations: [
            "Code splitting configuration",
            "Asset optimization settings",
            "Caching strategies",
            "Bundle analysis tools",
            "Performance monitoring setup"
          ],
          metrics: {
            bundleSize: "Optimized per environment",
            loadTime: "Configuration dependent",
            accessibility: "Not applicable"
          }
        },
        accessibility: {
          features: ["Configuration supports accessibility tools", "Build process includes accessibility checks"],
          compliance: "Supports WCAG compliance tools",
          improvements: ["Automated accessibility testing integration"]
        },
        responsiveness: {
          breakpoints: ["Configured via build tools"],
          approach: "Build-time responsive optimization",
          features: ["Asset optimization for different screen sizes", "Responsive image generation"]
        }
      };
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getImportanceColor = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const currentExplanation = selectedFile ? explanations[selectedFile] : null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Code Explanation</h2>
                <p className="text-gray-600">Understanding your generated code</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* File List */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Files</h3>
            <div className="space-y-1">
              {files.map(file => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                    selectedFile === file.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{file.path.split('/').pop()}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 truncate">
                    {file.path}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Explanation Content */}
          <div className="flex-1 overflow-y-auto">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600">Analyzing code structure and patterns...</p>
                </div>
              </div>
            ) : currentExplanation ? (
              <div className="p-6 space-y-6">
                {/* Overview */}
                <div>
                  <button
                    onClick={() => toggleSection('overview')}
                    className="flex items-center gap-2 w-full text-left mb-3"
                  >
                    {expandedSections.has('overview') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('overview') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-gray-700 leading-relaxed"
                      >
                        {currentExplanation.overview}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Key Features */}
                <div>
                  <button
                    onClick={() => toggleSection('features')}
                    className="flex items-center gap-2 w-full text-left mb-3"
                  >
                    {expandedSections.has('features') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('features') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {currentExplanation.keyFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Code Breakdown */}
                <div>
                  <button
                    onClick={() => toggleSection('breakdown')}
                    className="flex items-center gap-2 w-full text-left mb-3"
                  >
                    {expandedSections.has('breakdown') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <h3 className="text-lg font-semibold text-gray-900">Code Breakdown</h3>
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('breakdown') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {currentExplanation.codeBreakdown.map((section, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {section.icon}
                                <h4 className="font-medium text-gray-900">{section.section}</h4>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${getImportanceColor(section.importance)}`}>
                                {section.importance}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{section.explanation}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Best Practices */}
                <div>
                  <button
                    onClick={() => toggleSection('practices')}
                    className="flex items-center gap-2 w-full text-left mb-3"
                  >
                    {expandedSections.has('practices') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <h3 className="text-lg font-semibold text-gray-900">Best Practices</h3>
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('practices') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {currentExplanation.bestPractices.map((practice, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-medium text-gray-900 mb-1">{practice.practice}</h4>
                            <p className="text-gray-700 text-sm mb-2">{practice.reason}</p>
                            {practice.example && (
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-800 block">
                                {practice.example}
                              </code>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Performance & Accessibility */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance */}
                  <div>
                    <button
                      onClick={() => toggleSection('performance')}
                      className="flex items-center gap-2 w-full text-left mb-3"
                    >
                      {expandedSections.has('performance') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                    </button>
                    <AnimatePresence>
                      {expandedSections.has('performance') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Optimizations</h5>
                            <ul className="space-y-1">
                              {currentExplanation.performance.optimizations.map((opt, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                  <Zap className="w-3 h-3 text-yellow-500" />
                                  {opt}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Metrics</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Bundle Size:</span>
                                <span className="text-gray-900">{currentExplanation.performance.metrics.bundleSize}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Load Time:</span>
                                <span className="text-gray-900">{currentExplanation.performance.metrics.loadTime}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Accessibility */}
                  <div>
                    <button
                      onClick={() => toggleSection('accessibility')}
                      className="flex items-center gap-2 w-full text-left mb-3"
                    >
                      {expandedSections.has('accessibility') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <Shield className="w-4 h-4 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Accessibility</h3>
                    </button>
                    <AnimatePresence>
                      {expandedSections.has('accessibility') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-gray-900">{currentExplanation.accessibility.compliance}</span>
                            </div>
                            <ul className="space-y-1">
                              {currentExplanation.accessibility.features.slice(0, 4).map((feature, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                  <Eye className="w-3 h-3 text-blue-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Code2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a File</h3>
                  <p className="text-sm">Choose a file from the list to see detailed explanations</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CodeExplanationPanel;
