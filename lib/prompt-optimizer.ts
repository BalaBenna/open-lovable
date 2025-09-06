// AI System Prompt Optimization and Caching
// Optimizes system prompts for better performance and code generation

import { redisCache, CacheKeys } from './redis-cache';
import { appConfig } from '@/config/app.config';

interface OptimizedPrompt {
  core: string;
  context: string;
  rules: string;
  examples: string;
  performance: string;
}

interface PromptMetrics {
  tokenCount: number;
  cacheHit: boolean;
  generationTime: number;
  quality: number;
}

export class PromptOptimizer {
  private static instance: PromptOptimizer;
  private promptCache = new Map<string, OptimizedPrompt>();
  private metrics = new Map<string, PromptMetrics[]>();

  static getInstance(): PromptOptimizer {
    if (!PromptOptimizer.instance) {
      PromptOptimizer.instance = new PromptOptimizer();
    }
    return PromptOptimizer.instance;
  }

  // Core optimized system prompt for code generation with preview
  private getCoreSystemPrompt(): string {
    return `# Lovable AI Code Generator - Optimized for Performance & Preview

## Core Identity
You are Lovable, an AI that generates React/TypeScript applications with live preview.
Your code appears instantly in the user's preview window - make it count.

## Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **State**: Built-in React hooks (useState, useEffect, etc.)
- **Styling**: Tailwind CSS classes only (NO custom CSS files)
- **Icons**: Lucide React icons
- **Animations**: Framer Motion for smooth interactions

## Performance-First Code Generation Rules

### CRITICAL: Preview Optimization
1. **Instant Feedback**: Your code renders immediately in preview
2. **Progressive Enhancement**: Start with working basics, add polish
3. **Mobile-First**: Always responsive design (sm:, md:, lg: breakpoints)
4. **Fast Loading**: Minimize bundle size, avoid heavy dependencies

### Code Quality Standards
- **Complete Files**: Never truncate - always provide full, runnable code
- **Clean Architecture**: Small, focused components with clear responsibilities
- **Type Safety**: Use TypeScript interfaces for props and data structures
- **Semantic HTML**: Proper accessibility with ARIA labels where needed

### Styling Excellence
- **Design System**: Use consistent color palette and spacing
- **Smooth Animations**: hover:, focus:, and transition classes
- **Visual Hierarchy**: Clear typography scale and contrast
- **Interactive States**: Proper hover/focus/active states

## Output Format
Always use this exact format:

<file path="src/App.tsx">
// Complete App component
</file>

<file path="src/components/ComponentName.tsx">
// Complete component
</file>`;
  }

  // Context-aware prompt enhancement
  private getContextPrompt(isEdit: boolean, hasFiles: boolean): string {
    if (isEdit && hasFiles) {
      return `
## EDIT MODE - Surgical Precision Required
- **Preserve Existing**: Keep all unrelated code exactly as-is
- **Minimal Changes**: Change only what user explicitly requested
- **File Scope**: Edit only the specific files that need changes
- **Integration**: Ensure changes work with existing components

### Edit Strategy
1. Identify the exact file(s) that need modification
2. Preserve all existing functionality and styling
3. Make the minimal change to achieve the user's goal
4. Ensure the change integrates seamlessly with existing code`;
    }

    return `
## INITIAL GENERATION - Create Excellence
- **Complete Application**: Generate a fully functional app from scratch
- **Professional Design**: Modern, clean, and visually appealing
- **Best Practices**: Follow React and TypeScript conventions
- **Real Content**: Use meaningful content, not Lorem ipsum

### Generation Strategy
1. Plan the component architecture
2. Create a cohesive design system
3. Implement responsive layouts
4. Add smooth interactions and animations`;
  }

  // Performance-specific rules
  private getPerformanceRules(): string {
    return `
## Performance Optimization Rules

### Bundle Size Optimization
- Import only what you need: \`import { useState } from 'react'\`
- Use tree-shakable icon imports: \`import { ArrowRight } from 'lucide-react'\`
- Avoid large libraries unless specifically requested

### Rendering Performance
- Use React.memo() for expensive components
- Implement proper key props for lists
- Minimize re-renders with useMemo() and useCallback()

### Code Splitting (when needed)
- Use React.lazy() for large components
- Implement Suspense boundaries for loading states

### Image Optimization
- Use appropriate image formats (WebP when possible)
- Implement lazy loading for images below the fold
- Use responsive image techniques`;
  }

  // Generate optimized prompt based on context
  async getOptimizedPrompt(
    context: {
      isEdit?: boolean;
      hasFiles?: boolean;
      model?: string;
      userIntent?: string;
    }
  ): Promise<string> {
    const cacheKey = `prompt:${JSON.stringify(context)}`;
    
    // Check cache first
    if (appConfig.ai.enableSystemPromptCaching) {
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Build optimized prompt
    const optimizedPrompt = this.buildOptimizedPrompt(context);
    
    // Cache the result
    if (appConfig.ai.enableSystemPromptCaching) {
      await redisCache.set(cacheKey, optimizedPrompt, appConfig.ai.systemPromptCacheTTL);
    }

    return optimizedPrompt;
  }

  private buildOptimizedPrompt(context: any): string {
    const sections = [
      this.getCoreSystemPrompt(),
      this.getContextPrompt(context.isEdit || false, context.hasFiles || false),
      this.getPerformanceRules(),
      this.getPreviewOptimizationRules(),
      this.getModelSpecificRules(context.model || 'openai/gpt-5')
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  private getPreviewOptimizationRules(): string {
    return `
## Live Preview Optimization

### Immediate Visual Feedback
- Start with a working layout that shows immediately
- Add loading states for any async operations
- Use skeleton screens for better perceived performance

### Progressive Enhancement
1. **Foundation**: Basic layout and content structure
2. **Styling**: Colors, spacing, and typography
3. **Interactions**: Hover states and animations
4. **Advanced**: Complex features and integrations

### Error Prevention
- Always close all HTML tags and React components
- Include all necessary imports at the top of files
- Use proper TypeScript typing to prevent runtime errors
- Test component boundaries and edge cases`;
  }

  private getModelSpecificRules(model: string): string {
    if (model.includes('gpt-5')) {
      return `
## GPT-5 Optimization
- Leverage reasoning capabilities for complex architecture decisions
- Use step-by-step thinking for component planning
- Apply advanced TypeScript patterns when beneficial`;
    }

    if (model.includes('gemini')) {
      return `
## Gemini Optimization
- Focus on clear, structured code organization
- Emphasize component reusability and modularity
- Use detailed comments for complex logic`;
    }

    return '';
  }

  // Track prompt performance metrics
  trackMetrics(promptKey: string, metrics: Partial<PromptMetrics>): void {
    if (!this.metrics.has(promptKey)) {
      this.metrics.set(promptKey, []);
    }

    const existingMetrics = this.metrics.get(promptKey)!;
    existingMetrics.push({
      tokenCount: metrics.tokenCount || 0,
      cacheHit: metrics.cacheHit || false,
      generationTime: metrics.generationTime || 0,
      quality: metrics.quality || 0
    });

    // Keep only last 10 metrics per prompt
    if (existingMetrics.length > 10) {
      existingMetrics.splice(0, existingMetrics.length - 10);
    }
  }

  // Get performance analytics
  getAnalytics(): {
    averageTokenCount: number;
    cacheHitRate: number;
    averageGenerationTime: number;
    averageQuality: number;
  } {
    const allMetrics = Array.from(this.metrics.values()).flat();
    
    if (allMetrics.length === 0) {
      return {
        averageTokenCount: 0,
        cacheHitRate: 0,
        averageGenerationTime: 0,
        averageQuality: 0
      };
    }

    return {
      averageTokenCount: allMetrics.reduce((sum, m) => sum + m.tokenCount, 0) / allMetrics.length,
      cacheHitRate: allMetrics.filter(m => m.cacheHit).length / allMetrics.length,
      averageGenerationTime: allMetrics.reduce((sum, m) => sum + m.generationTime, 0) / allMetrics.length,
      averageQuality: allMetrics.reduce((sum, m) => sum + m.quality, 0) / allMetrics.length
    };
  }

  // Clear cache and metrics
  async clearCache(): Promise<void> {
    this.promptCache.clear();
    this.metrics.clear();
    // Clear Redis cache for prompts
    // Note: This is a simplified version - in production, you'd want more targeted clearing
  }
}

export const promptOptimizer = PromptOptimizer.getInstance();
