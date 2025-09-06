'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Search, 
  Eye, 
  Palette, 
  Layout, 
  Zap, 
  Shield, 
  Smartphone,
  Monitor,
  Tablet,
  Plus,
  X,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  TrendingUp,
  Code2,
  Image as ImageIcon,
  Type,
  MousePointer,
  Layers,
  Settings
} from 'lucide-react';

interface WebsiteAnalysis {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  status: 'analyzing' | 'completed' | 'error';
  analysis?: {
    designSystem: {
      colors: { hex: string; name: string; usage: string }[];
      typography: { font: string; weights: number[]; sizes: string[] }[];
      spacing: { scale: number[]; unit: string };
      breakpoints: { name: string; width: string }[];
    };
    components: {
      type: string;
      description: string;
      complexity: 'simple' | 'moderate' | 'complex';
      technologies: string[];
      accessibility: string[];
    }[];
    interactions: {
      type: 'hover' | 'click' | 'scroll' | 'animation';
      element: string;
      effect: string;
      timing: string;
    }[];
    performance: {
      score: number;
      metrics: {
        fcp: string; // First Contentful Paint
        lcp: string; // Largest Contentful Paint
        cls: string; // Cumulative Layout Shift
        fid: string; // First Input Delay
      };
      optimizations: string[];
    };
    accessibility: {
      score: number;
      compliance: string;
      issues: { type: string; description: string; severity: 'low' | 'medium' | 'high' }[];
      improvements: string[];
    };
    responsiveness: {
      breakpoints: string[];
      approach: string;
      issues: string[];
    };
  };
  extractedCode?: {
    html: string;
    css: string;
    js: string;
  };
  screenshots?: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
}

interface MultiSiteAnalyzerProps {
  onAnalysisComplete: (analyses: WebsiteAnalysis[]) => void;
  onClose: () => void;
  className?: string;
}

const MultiSiteAnalyzer: React.FC<MultiSiteAnalyzerProps> = ({
  onAnalysisComplete,
  onClose,
  className = ''
}) => {
  const [websites, setWebsites] = useState<WebsiteAnalysis[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'design' | 'components' | 'interactions' | 'performance'>('design');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());

  const analyzeWebsite = async (url: string) => {
    const websiteId = Date.now().toString();
    const newWebsite: WebsiteAnalysis = {
      id: websiteId,
      url,
      title: 'Analyzing...',
      status: 'analyzing'
    };

    setWebsites(prev => [...prev, newWebsite]);

    try {
      // Simulate analysis process
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 4000));

      // Generate mock analysis
      const analysis = generateMockAnalysis(url);
      
      setWebsites(prev => prev.map(site => 
        site.id === websiteId 
          ? { 
              ...site, 
              title: analysis.title,
              favicon: analysis.favicon,
              status: 'completed',
              analysis: analysis.analysis,
              extractedCode: analysis.extractedCode,
              screenshots: analysis.screenshots
            }
          : site
      ));

    } catch (error) {
      setWebsites(prev => prev.map(site => 
        site.id === websiteId 
          ? { ...site, status: 'error' }
          : site
      ));
    }
  };

  const generateMockAnalysis = (url: string) => {
    const domainName = url.replace(/https?:\/\//, '').split('.')[0];
    
    return {
      title: `${domainName.charAt(0).toUpperCase() + domainName.slice(1)} - Modern Web Platform`,
      favicon: `https://www.google.com/s2/favicons?domain=${url}&sz=32`,
      analysis: {
        designSystem: {
          colors: [
            { hex: '#3b82f6', name: 'Primary Blue', usage: 'CTAs, links, primary actions' },
            { hex: '#1f2937', name: 'Dark Gray', usage: 'Text, headings, navigation' },
            { hex: '#f8fafc', name: 'Light Gray', usage: 'Backgrounds, subtle elements' },
            { hex: '#10b981', name: 'Success Green', usage: 'Success states, confirmations' },
            { hex: '#ef4444', name: 'Error Red', usage: 'Errors, warnings, destructive actions' }
          ],
          typography: [
            { font: 'Inter', weights: [400, 500, 600, 700], sizes: ['14px', '16px', '18px', '24px', '32px', '48px'] },
            { font: 'JetBrains Mono', weights: [400, 500], sizes: ['12px', '14px', '16px'] }
          ],
          spacing: { scale: [4, 8, 12, 16, 24, 32, 48, 64, 96], unit: 'px' },
          breakpoints: [
            { name: 'sm', width: '640px' },
            { name: 'md', width: '768px' },
            { name: 'lg', width: '1024px' },
            { name: 'xl', width: '1280px' }
          ]
        },
        components: [
          {
            type: 'Navigation Header',
            description: 'Sticky navigation with logo, menu items, and CTA button',
            complexity: 'moderate' as const,
            technologies: ['React', 'Tailwind CSS', 'Framer Motion'],
            accessibility: ['ARIA navigation', 'Keyboard navigation', 'Focus management']
          },
          {
            type: 'Hero Section',
            description: 'Large hero with headline, description, and action buttons',
            complexity: 'simple' as const,
            technologies: ['CSS Grid', 'CSS Animations', 'Responsive Images'],
            accessibility: ['Semantic HTML', 'Alt text', 'Proper heading hierarchy']
          },
          {
            type: 'Feature Cards Grid',
            description: 'Responsive grid of feature cards with icons and descriptions',
            complexity: 'moderate' as const,
            technologies: ['CSS Grid', 'CSS Flexbox', 'SVG Icons'],
            accessibility: ['ARIA labels', 'Focus indicators', 'Screen reader friendly']
          },
          {
            type: 'Interactive Dashboard',
            description: 'Complex data visualization with charts and interactive elements',
            complexity: 'complex' as const,
            technologies: ['D3.js', 'React', 'WebGL', 'Canvas API'],
            accessibility: ['ARIA live regions', 'Keyboard controls', 'High contrast mode']
          }
        ],
        interactions: [
          { type: 'hover' as const, element: 'CTA Button', effect: 'Scale transform + shadow', timing: '0.2s ease' },
          { type: 'click' as const, element: 'Mobile Menu', effect: 'Slide animation', timing: '0.3s cubic-bezier' },
          { type: 'scroll' as const, element: 'Parallax Background', effect: 'Transform Y offset', timing: 'smooth' },
          { type: 'animation' as const, element: 'Loading Spinner', effect: 'Rotation keyframes', timing: '1s infinite' }
        ],
        performance: {
          score: 92,
          metrics: {
            fcp: '1.2s',
            lcp: '2.1s',
            cls: '0.05',
            fid: '45ms'
          },
          optimizations: [
            'Image lazy loading implemented',
            'CSS and JS minification',
            'CDN delivery for static assets',
            'Code splitting for route-based chunks',
            'Service worker for caching'
          ]
        },
        accessibility: {
          score: 88,
          compliance: 'WCAG 2.1 AA',
          issues: [
            { type: 'Color Contrast', description: 'Some text has insufficient contrast ratio', severity: 'medium' as const },
            { type: 'Alt Text', description: 'Missing alt text on decorative images', severity: 'low' as const },
            { type: 'Focus Order', description: 'Skip navigation link needed', severity: 'medium' as const }
          ],
          improvements: [
            'Add skip navigation links',
            'Improve color contrast ratios',
            'Add ARIA landmarks',
            'Implement focus management'
          ]
        },
        responsiveness: {
          breakpoints: ['320px (mobile)', '768px (tablet)', '1024px (desktop)', '1440px (large)'],
          approach: 'Mobile-first responsive design with CSS Grid and Flexbox',
          issues: [
            'Horizontal scroll on small screens',
            'Touch targets too small on mobile',
            'Text readability issues on tablet'
          ]
        }
      },
      extractedCode: {
        html: `<header class="sticky top-0 bg-white shadow-sm z-50">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <img src="/logo.svg" alt="Logo" class="h-8 w-auto">
      </div>
      <div class="hidden md:flex space-x-8">
        <a href="#features" class="text-gray-600 hover:text-gray-900">Features</a>
        <a href="#pricing" class="text-gray-600 hover:text-gray-900">Pricing</a>
        <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Get Started
      </button>
    </div>
  </nav>
</header>`,
        css: `.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 120px 0;
  text-align: center;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 0;
  }
  
  .feature-card {
    padding: 24px;
  }
}`,
        js: `// Mobile menu toggle
const mobileMenuButton = document.querySelector('#mobile-menu-button');
const mobileMenu = document.querySelector('#mobile-menu');

mobileMenuButton.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  mobileMenu.classList.toggle('animate-slide-down');
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in-up');
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});`
      },
      screenshots: {
        desktop: '/api/placeholder/1200/800',
        tablet: '/api/placeholder/768/1024',
        mobile: '/api/placeholder/375/667'
      }
    };
  };

  const handleAddWebsite = () => {
    if (!newUrl.trim()) return;
    
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    analyzeWebsite(url);
    setNewUrl('');
  };

  const removeWebsite = (id: string) => {
    setWebsites(prev => prev.filter(site => site.id !== id));
    if (selectedSite === id) {
      setSelectedSite('');
    }
  };

  const toggleComparison = (id: string) => {
    setSelectedForComparison(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const generateCombinedAnalysis = () => {
    const completedAnalyses = websites.filter(site => 
      site.status === 'completed' && site.analysis
    );
    onAnalysisComplete(completedAnalyses);
  };

  const selectedSiteData = websites.find(site => site.id === selectedSite);

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Multi-Site Analyzer</h2>
                <p className="text-gray-600">Analyze and extract design patterns from websites</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Add Website */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter website URL (e.g., example.com)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWebsite()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleAddWebsite}
              disabled={!newUrl.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Analyze
            </button>
            {websites.some(site => site.status === 'completed') && (
              <button
                onClick={generateCombinedAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Generate Code
              </button>
            )}
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Website List */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Analyzed Websites ({websites.length})
              </h3>
              
              <div className="space-y-3">
                {websites.map(site => (
                  <div
                    key={site.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedSite === site.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSite(site.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {site.favicon ? (
                          <img src={site.favicon} alt="" className="w-5 h-5 flex-shrink-0" />
                        ) : (
                          <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {site.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {site.url}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {site.status === 'analyzing' && (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        )}
                        {site.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {site.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWebsite(site.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {site.status === 'completed' && site.analysis && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span>Perf: {site.analysis.performance.score}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-blue-500" />
                              <span>A11y: {site.analysis.accessibility.score}</span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedForComparison.has(site.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleComparison(site.id);
                            }}
                            className="w-3 h-3"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {websites.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No websites analyzed yet</p>
                    <p className="text-xs">Add a URL above to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedSiteData && selectedSiteData.status === 'completed' && selectedSiteData.analysis ? (
              <div className="p-6">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                  {[
                    { id: 'design', label: 'Design System', icon: Palette },
                    { id: 'components', label: 'Components', icon: Layout },
                    { id: 'interactions', label: 'Interactions', icon: MousePointer },
                    { id: 'performance', label: 'Performance', icon: Zap }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'design' && (
                    <div className="space-y-6">
                      {/* Colors */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palette</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedSiteData.analysis.designSystem.colors.map((color, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                              <div
                                className="w-12 h-12 rounded-lg border-2 border-gray-200"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{color.name}</div>
                                <div className="text-sm text-gray-500">{color.hex}</div>
                                <div className="text-xs text-gray-400 mt-1">{color.usage}</div>
                              </div>
                              <button
                                onClick={() => navigator.clipboard.writeText(color.hex)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Typography */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
                        <div className="space-y-4">
                          {selectedSiteData.analysis.designSystem.typography.map((font, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">{font.font}</h4>
                                <div className="flex items-center gap-2">
                                  <Type className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-500">
                                    {font.weights.length} weights
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Weights:</span>
                                  <div className="mt-1">
                                    {font.weights.map(weight => (
                                      <span key={weight} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                                        {weight}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Sizes:</span>
                                  <div className="mt-1">
                                    {font.sizes.slice(0, 4).map(size => (
                                      <span key={size} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                                        {size}
                                      </span>
                                    ))}
                                    {font.sizes.length > 4 && (
                                      <span className="text-xs text-gray-400">+{font.sizes.length - 4} more</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'components' && (
                    <div className="space-y-4">
                      {selectedSiteData.analysis.components.map((component, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{component.type}</h4>
                              <p className="text-sm text-gray-600 mt-1">{component.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              component.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                              component.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {component.complexity}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Technologies:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {component.technologies.map(tech => (
                                  <span key={tech} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700">Accessibility:</span>
                              <ul className="mt-1 space-y-1">
                                {component.accessibility.map((item, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'interactions' && (
                    <div className="space-y-4">
                      {selectedSiteData.analysis.interactions.map((interaction, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              interaction.type === 'hover' ? 'bg-blue-100 text-blue-600' :
                              interaction.type === 'click' ? 'bg-green-100 text-green-600' :
                              interaction.type === 'scroll' ? 'bg-purple-100 text-purple-600' :
                              'bg-orange-100 text-orange-600'
                            }`}>
                              <MousePointer className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{interaction.element}</h4>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {interaction.type}
                              </span>
                            </div>
                          </div>
                          <div className="ml-11 space-y-1 text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">Effect:</span> {interaction.effect}
                            </div>
                            <div className="text-gray-600">
                              <span className="font-medium">Timing:</span> {interaction.timing}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'performance' && (
                    <div className="space-y-6">
                      {/* Performance Score */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Performance Score</h3>
                            <p className="text-gray-600">Overall website performance rating</p>
                          </div>
                          <div className="text-3xl font-bold text-green-600">
                            {selectedSiteData.analysis.performance.score}
                          </div>
                        </div>
                      </div>

                      {/* Core Web Vitals */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Core Web Vitals</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 border border-gray-200 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedSiteData.analysis.performance.metrics.fcp}
                            </div>
                            <div className="text-sm text-gray-600">First Contentful Paint</div>
                          </div>
                          <div className="text-center p-4 border border-gray-200 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {selectedSiteData.analysis.performance.metrics.lcp}
                            </div>
                            <div className="text-sm text-gray-600">Largest Contentful Paint</div>
                          </div>
                          <div className="text-center p-4 border border-gray-200 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {selectedSiteData.analysis.performance.metrics.cls}
                            </div>
                            <div className="text-sm text-gray-600">Cumulative Layout Shift</div>
                          </div>
                          <div className="text-center p-4 border border-gray-200 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {selectedSiteData.analysis.performance.metrics.fid}
                            </div>
                            <div className="text-sm text-gray-600">First Input Delay</div>
                          </div>
                        </div>
                      </div>

                      {/* Optimizations */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Applied Optimizations</h4>
                        <div className="space-y-2">
                          {selectedSiteData.analysis.performance.optimizations.map((optimization, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-gray-700">{optimization}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedSiteData && selectedSiteData.status === 'analyzing' ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Website</h3>
                  <p className="text-gray-600">Extracting design patterns and components...</p>
                </div>
              </div>
            ) : selectedSiteData && selectedSiteData.status === 'error' ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
                  <p className="text-gray-600">Unable to analyze this website. Please try another URL.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Website</h3>
                  <p className="text-sm">Choose a website from the list to view its analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MultiSiteAnalyzer;
