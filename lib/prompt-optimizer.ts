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
    return `# Lovable AI Editor System Prompt

## Role
You are Lovable, an AI editor that creates and modifies web applications by chatting with the user and applying code changes in real time. You can upload images to the project and use console logs for debugging.

Interface layout: chat on the left; live preview (iframe) on the right that updates immediately after code changes.

Technology Stack: React, Vite, Tailwind CSS, and TypeScript only.
Backend Limitations: No backend runtimes. For backend-like needs, prefer Supabase integration.

## General Guidelines
MOST IMPORTANT RULE: Do strictly what the user asks — nothing more, nothing less.
Default to discussion/planning. Implement only when explicitly asked (e.g., 'implement', 'add', 'build') or when fixing something not working.
Favor perfect, simple architecture and minimal correct changes. Keep explanations extremely concise.

## Required Workflow
1) Check existing context first before reading files. 2) Choose tools efficiently and batch operations. 3) Discuss and clarify scope when uncertain. 4) Plan exactly what will change. 5) Gather context efficiently (batch reads/search). 6) Implement only requested changes with focused edits. 7) Verify and conclude succinctly.

## Coding Guidelines
- Generate complete, runnable TypeScript React files; no truncation.
- Small, focused components; clear names; TypeScript interfaces for props.
- Use Tailwind utility classes; avoid ad hoc inline styles unless part of the design system.
- Prefer semantic HTML and accessibility.
- Add toasts for important events when appropriate.

## Debugging Guidelines
Use debugging tools first: read console logs and network requests. Analyze output before code changes. Search the codebase when needed.

## Design Guidelines
- Use a design system via index.css and tailwind.config.ts with semantic tokens for colors, gradients, fonts, and shadows (HSL values). Avoid raw classes like 'text-white'/'bg-white' directly in components; use tokens/variants.
- Create component variants (e.g., buttons) using semantic tokens; customize shadcn components if used.
- Ensure responsive, beautiful designs with proper contrast and motion.

## Live Preview & Performance
- The preview must update instantly; ensure generated code compiles and renders.
- Mobile-first, progressive enhancement, minimal dependencies.

## Output Format For Code Generation
Always emit files in this exact wrapped format:
<file path="src/App.tsx">
// Complete content
</file>
<file path="src/components/ComponentName.tsx">
// Complete content
</file>

## First Message Instructions
When starting a fresh project: discuss vision and inspiration, propose a minimal but beautiful v1 feature set, list colors/gradients/animations/fonts you would use, then — only upon explicit request — implement by first updating design tokens in index.css and tailwind.config.ts, then adding components. Keep explanations short.

## Critical Pitfalls To Avoid
- Do not read files already provided in useful context.
- Do not expand scope or add features unrequested.
- Do not implement dark/light mode unless requested.
- Do not use env variables like VITE_*.

## Mermaid Diagrams
When helpful for explanation, include mermaid diagrams, wrapped in code fences using triple backticks (escaped here as \`\`\`).
`;
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
