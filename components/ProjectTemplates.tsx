'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  FileText, 
  Camera, 
  Gamepad2, 
  Music, 
  Briefcase,
  Heart,
  GraduationCap,
  Utensils,
  Plane,
  Palette,
  Code2,
  Sparkles,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'ecommerce' | 'portfolio' | 'dashboard' | 'entertainment' | 'education';
  icon: React.ReactNode;
  features: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  preview?: string;
  tags: string[];
  popularity: number;
}

interface ProjectTemplatesProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
  className?: string;
}

const templates: Template[] = [
  {
    id: 'saas-landing',
    name: 'SaaS Landing Page',
    description: 'Modern landing page with hero, features, pricing, and testimonials',
    category: 'business',
    icon: <Layout className="w-6 h-6" />,
    features: ['Hero Section', 'Pricing Tables', 'Testimonials', 'Contact Forms', 'Responsive Design'],
    complexity: 'beginner',
    estimatedTime: '5-10 min',
    tags: ['landing', 'saas', 'business', 'marketing'],
    popularity: 95
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Full-featured online store with product catalog and shopping cart',
    category: 'ecommerce',
    icon: <ShoppingCart className="w-6 h-6" />,
    features: ['Product Grid', 'Shopping Cart', 'Checkout Process', 'Product Details', 'Search & Filter'],
    complexity: 'intermediate',
    estimatedTime: '15-20 min',
    tags: ['ecommerce', 'shopping', 'products', 'cart'],
    popularity: 88
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio Website',
    description: 'Showcase your work with a beautiful portfolio design',
    category: 'portfolio',
    icon: <Briefcase className="w-6 h-6" />,
    features: ['Project Gallery', 'About Section', 'Skills Display', 'Contact Form', 'Blog'],
    complexity: 'beginner',
    estimatedTime: '8-12 min',
    tags: ['portfolio', 'personal', 'showcase', 'creative'],
    popularity: 92
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'Comprehensive dashboard with charts, tables, and analytics',
    category: 'dashboard',
    icon: <BarChart3 className="w-6 h-6" />,
    features: ['Data Visualization', 'User Management', 'Analytics', 'Settings Panel', 'Notifications'],
    complexity: 'advanced',
    estimatedTime: '20-30 min',
    tags: ['dashboard', 'admin', 'analytics', 'data'],
    popularity: 85
  },
  {
    id: 'blog-platform',
    name: 'Blog Platform',
    description: 'Modern blog with article management and reader engagement',
    category: 'business',
    icon: <FileText className="w-6 h-6" />,
    features: ['Article Editor', 'Category System', 'Comments', 'Search', 'Author Profiles'],
    complexity: 'intermediate',
    estimatedTime: '12-18 min',
    tags: ['blog', 'content', 'writing', 'cms'],
    popularity: 78
  },
  {
    id: 'social-media-app',
    name: 'Social Media App',
    description: 'Social platform with posts, profiles, and interactions',
    category: 'entertainment',
    icon: <Users className="w-6 h-6" />,
    features: ['User Profiles', 'Post Feed', 'Likes & Comments', 'Follow System', 'Direct Messages'],
    complexity: 'advanced',
    estimatedTime: '25-35 min',
    tags: ['social', 'community', 'posts', 'profiles'],
    popularity: 90
  },
  {
    id: 'restaurant-website',
    name: 'Restaurant Website',
    description: 'Appetizing website for restaurants with menu and reservations',
    category: 'business',
    icon: <Utensils className="w-6 h-6" />,
    features: ['Menu Display', 'Reservation System', 'Gallery', 'Location Map', 'Reviews'],
    complexity: 'beginner',
    estimatedTime: '10-15 min',
    tags: ['restaurant', 'food', 'menu', 'reservations'],
    popularity: 82
  },
  {
    id: 'learning-platform',
    name: 'Learning Platform',
    description: 'Educational platform with courses and progress tracking',
    category: 'education',
    icon: <GraduationCap className="w-6 h-6" />,
    features: ['Course Catalog', 'Video Player', 'Progress Tracking', 'Quizzes', 'Certificates'],
    complexity: 'advanced',
    estimatedTime: '30-40 min',
    tags: ['education', 'courses', 'learning', 'videos'],
    popularity: 87
  },
  {
    id: 'photography-portfolio',
    name: 'Photography Portfolio',
    description: 'Stunning portfolio for photographers and visual artists',
    category: 'portfolio',
    icon: <Camera className="w-6 h-6" />,
    features: ['Image Gallery', 'Lightbox View', 'Categories', 'Client Area', 'Booking System'],
    complexity: 'intermediate',
    estimatedTime: '15-20 min',
    tags: ['photography', 'gallery', 'portfolio', 'visual'],
    popularity: 89
  },
  {
    id: 'music-streaming',
    name: 'Music Streaming App',
    description: 'Music player with playlists and streaming capabilities',
    category: 'entertainment',
    icon: <Music className="w-6 h-6" />,
    features: ['Music Player', 'Playlists', 'Search', 'Artist Profiles', 'Favorites'],
    complexity: 'advanced',
    estimatedTime: '35-45 min',
    tags: ['music', 'streaming', 'player', 'audio'],
    popularity: 91
  },
  {
    id: 'travel-blog',
    name: 'Travel Blog',
    description: 'Beautiful travel blog with destination guides and tips',
    category: 'business',
    icon: <Plane className="w-6 h-6" />,
    features: ['Travel Posts', 'Destination Guides', 'Photo Galleries', 'Travel Tips', 'Map Integration'],
    complexity: 'intermediate',
    estimatedTime: '18-25 min',
    tags: ['travel', 'blog', 'destinations', 'photography'],
    popularity: 84
  },
  {
    id: 'fitness-app',
    name: 'Fitness Tracker',
    description: 'Fitness tracking app with workouts and progress monitoring',
    category: 'entertainment',
    icon: <Heart className="w-6 h-6" />,
    features: ['Workout Plans', 'Progress Tracking', 'Exercise Library', 'Nutrition Log', 'Goals'],
    complexity: 'intermediate',
    estimatedTime: '20-25 min',
    tags: ['fitness', 'health', 'workouts', 'tracking'],
    popularity: 86
  }
];

const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({
  onSelectTemplate,
  onClose,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'complexity' | 'time'>('popularity');

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'business', name: 'Business', count: templates.filter(t => t.category === 'business').length },
    { id: 'ecommerce', name: 'E-commerce', count: templates.filter(t => t.category === 'ecommerce').length },
    { id: 'portfolio', name: 'Portfolio', count: templates.filter(t => t.category === 'portfolio').length },
    { id: 'dashboard', name: 'Dashboard', count: templates.filter(t => t.category === 'dashboard').length },
    { id: 'entertainment', name: 'Entertainment', count: templates.filter(t => t.category === 'entertainment').length },
    { id: 'education', name: 'Education', count: templates.filter(t => t.category === 'education').length },
  ];

  const filteredTemplates = templates
    .filter(template => 
      (selectedCategory === 'all' || template.category === selectedCategory) &&
      (searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'complexity':
          const complexityOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return complexityOrder[a.complexity] - complexityOrder[b.complexity];
        case 'time':
          return parseInt(a.estimatedTime) - parseInt(b.estimatedTime);
        default:
          return 0;
      }
    });

  const getComplexityColor = (complexity: Template['complexity']) => {
    switch (complexity) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
    }
  };

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Project Templates</h2>
                <p className="text-gray-600">Choose a template to get started quickly</p>
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

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="complexity">Sort by Complexity</option>
              <option value="time">Sort by Time</option>
            </select>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id || category.name || `category-${Math.random()}`}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-xs text-gray-400">{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id || template.name || `template-${Math.random()}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => onSelectTemplate(template)}
                  >
                    {/* Template Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(template.complexity)}`}>
                              {template.complexity}
                            </span>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Star className="w-3 h-3 fill-current text-yellow-400" />
                              <span className="text-xs">{template.popularity}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Template Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={"feature-" + (idx || Math.random())}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {template.features.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{template.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{template.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 group-hover:text-purple-700 transition-colors">
                        <span className="text-sm font-medium">Use Template</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectTemplates;
