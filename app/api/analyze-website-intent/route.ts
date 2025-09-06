import { NextRequest, NextResponse } from 'next/server';
import { websiteCache, generateCacheKey } from '@/lib/website-cache';

// Function to detect website references in user messages
function detectWebsiteReferences(message: string): string[] {
  const urls: string[] = [];
  
  // Direct URL detection
  const urlRegex = /https?:\/\/[^\s]+/g;
  const directUrls = message.match(urlRegex) || [];
  urls.push(...directUrls);
  
  // Common website references
  const websitePatterns = [
    /like\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /similar\s+to\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /inspired\s+by\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /copy\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /clone\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /recreate\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  ];
  
  websitePatterns.forEach(pattern => {
    const matches = [...message.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && !match[1].includes(' ')) {
        urls.push(`https://${match[1]}`);
      }
    });
  });
  
  // Famous website names that should be scraped
  const famousWebsites = {
    'stripe': 'https://stripe.com',
    'linear': 'https://linear.app',
    'vercel': 'https://vercel.com',
    'github': 'https://github.com',
    'notion': 'https://notion.so',
    'figma': 'https://figma.com',
    'discord': 'https://discord.com',
    'slack': 'https://slack.com',
    'twitter': 'https://twitter.com',
    'dribbble': 'https://dribbble.com',
    'behance': 'https://behance.net',
    'airbnb': 'https://airbnb.com',
    'uber': 'https://uber.com',
    'netflix': 'https://netflix.com',
    'spotify': 'https://spotify.com',
    'apple': 'https://apple.com',
    'google': 'https://google.com',
    'microsoft': 'https://microsoft.com',
    'amazon': 'https://amazon.com',
    'facebook': 'https://facebook.com',
  };
  
  const lowerMessage = message.toLowerCase();
  Object.entries(famousWebsites).forEach(([name, url]) => {
    if (lowerMessage.includes(`like ${name}`) || 
        lowerMessage.includes(`${name} style`) ||
        lowerMessage.includes(`${name} design`) ||
        lowerMessage.includes(`similar to ${name}`) ||
        lowerMessage.includes(`inspired by ${name}`)) {
      urls.push(url);
    }
  });
  
  // Remove duplicates and invalid URLs
  return [...new Set(urls)].filter(url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
}

// Function to merge design patterns from multiple websites
function mergeDesignPatterns(patternsList: any[]) {
  const merged = {
    colors: [] as string[],
    typography: {} as any,
    layout: {} as any,
    components: [] as string[],
    animations: [] as string[],
  };

  patternsList.forEach(patterns => {
    // Merge colors (unique)
    merged.colors = [...new Set([...merged.colors, ...patterns.colors])];
    
    // Merge components (unique)
    merged.components = [...new Set([...merged.components, ...patterns.components])];
    
    // Merge animations (unique)
    merged.animations = [...new Set([...merged.animations, ...patterns.animations])];
    
    // Merge typography (combine flags)
    Object.keys(patterns.typography).forEach(key => {
      if (typeof patterns.typography[key] === 'boolean') {
        merged.typography[key] = merged.typography[key] || patterns.typography[key];
      }
    });
    
    // Merge layout (combine flags)
    Object.keys(patterns.layout).forEach(key => {
      if (typeof patterns.layout[key] === 'boolean') {
        merged.layout[key] = merged.layout[key] || patterns.layout[key];
      }
    });
  });

  return merged;
}

// Function to extract design patterns from scraped content
function extractDesignPatterns(content: string, metadata: any) {
  const patterns = {
    colors: [] as string[],
    typography: {} as any,
    layout: {} as any,
    components: [] as string[],
    animations: [] as string[],
    frameworks: [] as string[],
    designTokens: {} as any,
    spacing: [] as string[],
    breakpoints: [] as string[],
  };
  
  // Extract CSS framework detection
  const frameworks = detectCSSFrameworks(content);
  patterns.frameworks = frameworks;
  
  // Enhanced color extraction with CSS variables and design tokens
  const colorRegex = /#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|var\(--[^)]+\)|(?:white|black|red|blue|green|yellow|purple|pink|orange|gray|grey|indigo|teal|cyan|rose|emerald|amber|lime|violet|fuchsia|sky|slate)\b/gi;
  const colorMatches = content.match(colorRegex) || [];
  patterns.colors = [...new Set(colorMatches)];
  
  // Extract CSS custom properties (design tokens)
  const cssVariableRegex = /--[\w-]+:\s*([^;]+);/gi;
  const cssVariables = [...content.matchAll(cssVariableRegex)];
  patterns.designTokens = {
    colors: cssVariables.filter(v => v[1].includes('#') || v[1].includes('rgb') || v[1].includes('hsl')).map(v => v[0]),
    spacing: cssVariables.filter(v => v[1].includes('px') || v[1].includes('rem') || v[1].includes('em')).map(v => v[0]),
    fonts: cssVariables.filter(v => v[1].includes('font') || v[0].includes('font')).map(v => v[0]),
  };
  
  // Enhanced typography detection
  patterns.typography = {
    hasCustomFonts: content.includes('font-family') || content.includes('@font-face'),
    hasWebFonts: content.includes('fonts.googleapis.com') || content.includes('fonts.adobe.com'),
    hasLargeTitles: /text-[456]xl|font-size:\s*[3-9]\d+px|font-size:\s*[2-9]\.?\d*rem/i.test(content),
    hasSubtitles: /text-[xl]{1,2}|font-size:\s*[12]\d+px|font-size:\s*1\.[2-9]rem/i.test(content),
    hasVariableFonts: content.includes('font-variation-settings'),
    fontStacks: extractFontStacks(content),
  };
  
  // Enhanced layout pattern detection
  patterns.layout = {
    hasGrid: /display:\s*grid|grid-template|\.grid\b/i.test(content),
    hasFlex: /display:\s*flex|flex-direction|\.flex\b/i.test(content),
    hasCards: /\.card\b|card-/i.test(content),
    hasHero: /\.hero\b|hero-/i.test(content),
    hasNavigation: /\.nav\b|navigation|navbar/i.test(content),
    hasFooter: /\.footer\b|site-footer/i.test(content),
    hasSidebar: /\.sidebar\b|side-nav/i.test(content),
    hasContainer: /\.container\b|max-width.*mx-auto/i.test(content),
    isResponsive: detectResponsivePatterns(content),
  };
  
  // Extract spacing patterns
  const spacingRegex = /(?:margin|padding|gap):\s*(\d+(?:px|rem|em|%)|var\([^)]+\))/gi;
  const spacingMatches = [...content.matchAll(spacingRegex)];
  patterns.spacing = [...new Set(spacingMatches.map(m => m[1]))];
  
  // Extract responsive breakpoints
  const breakpointRegex = /@media[^{]*\((?:min-width|max-width):\s*(\d+(?:px|em|rem))\)/gi;
  const breakpointMatches = [...content.matchAll(breakpointRegex)];
  patterns.breakpoints = [...new Set(breakpointMatches.map(m => m[1]))];
  
  // Enhanced component detection
  const componentPatterns = {
    buttons: /\.btn\b|button|\.button\b/i.test(content),
    forms: /\.form\b|input|textarea|select/i.test(content),
    modals: /\.modal\b|dialog|overlay/i.test(content),
    dropdowns: /\.dropdown\b|select|menu/i.test(content),
    carousels: /\.carousel\b|slider|swiper/i.test(content),
    tabs: /\.tab\b|tabpanel|tab-content/i.test(content),
    accordions: /\.accordion\b|collaps|expand/i.test(content),
    tables: /\.table\b|table-/i.test(content),
    alerts: /\.alert\b|notification|toast/i.test(content),
    badges: /\.badge\b|tag|chip/i.test(content),
    progress: /\.progress\b|progress-bar/i.test(content),
    tooltips: /\.tooltip\b|popover/i.test(content),
  };
  
  patterns.components = Object.entries(componentPatterns)
    .filter(([key, hasComponent]) => hasComponent)
    .map(([key]) => key);
  
  // Enhanced animation detection
  const animationPatterns = {
    transitions: /transition:|\.transition\b/i.test(content),
    transforms: /transform:|\.transform\b/i.test(content),
    keyframes: /@keyframes|animation:/i.test(content),
    hover: /:hover|\.hover:/i.test(content),
    focus: /:focus|\.focus:/i.test(content),
    motion: /motion-reduce|prefers-reduced-motion/i.test(content),
  };
  
  patterns.animations = Object.entries(animationPatterns)
    .filter(([key, hasAnimation]) => hasAnimation)
    .map(([key]) => key);
  
  return patterns;
}

// Detect CSS frameworks
function detectCSSFrameworks(content: string): string[] {
  const frameworks: string[] = [];
  
  const frameworkPatterns = {
    'Tailwind CSS': /tailwind|@tailwind|tw-|bg-|text-|p-\d|m-\d|flex|grid/i,
    'Bootstrap': /bootstrap|\.btn-|\.col-|\.row|\.container-fluid/i,
    'Bulma': /bulma|\.is-|\.has-|\.column|\.hero/i,
    'Foundation': /foundation|\.grid-x|\.cell|\.callout/i,
    'Material-UI': /mui|material-ui|\.MuiButton|\.MuiPaper/i,
    'Ant Design': /antd|ant-design|\.ant-btn|\.ant-card/i,
    'Chakra UI': /chakra|\.chakra-|css-/i,
    'Styled Components': /styled-components|styled\.|css`/i,
    'Emotion': /@emotion|css\(|styled\(/i,
    'Mantine': /mantine|\.mantine-/i,
  };
  
  Object.entries(frameworkPatterns).forEach(([name, pattern]) => {
    if (pattern.test(content)) {
      frameworks.push(name);
    }
  });
  
  return frameworks;
}

// Extract font stacks
function extractFontStacks(content: string): string[] {
  const fontFamilyRegex = /font-family:\s*([^;]+);/gi;
  const fontMatches = [...content.matchAll(fontFamilyRegex)];
  return [...new Set(fontMatches.map(m => m[1].trim()))];
}

// Detect responsive patterns
function detectResponsivePatterns(content: string): boolean {
  const responsivePatterns = [
    /@media/i,
    /responsive|mobile-first/i,
    /sm:|md:|lg:|xl:|2xl:/i, // Tailwind breakpoints
    /col-xs|col-sm|col-md|col-lg/i, // Bootstrap grid
    /flex-wrap|flex-nowrap/i,
    /grid-cols-/i,
  ];
  
  return responsivePatterns.some(pattern => pattern.test(content));
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }
    
    console.log('[analyze-website-intent] Analyzing message for website references:', message);
    
    // Detect website references
    const websiteUrls = detectWebsiteReferences(message);
    
    if (websiteUrls.length === 0) {
      return NextResponse.json({
        success: true,
        hasWebsiteReferences: false,
        message: 'No website references detected'
      });
    }
    
    console.log('[analyze-website-intent] Found website references:', websiteUrls);
    
    // Scrape multiple website references concurrently
    const scrapePromises = websiteUrls.slice(0, 3).map(async (targetUrl) => { // Limit to 3 for performance
      const cacheKey = generateCacheKey(targetUrl);
      
      try {
        // Check cache first for performance
        let scrapeData = await websiteCache.get(cacheKey);
        
        if (!scrapeData) {
          console.log('[analyze-website-intent] Cache miss, scraping website:', targetUrl);
          
          // Use the existing scrape-url-enhanced endpoint
          const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scrape-url-enhanced`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: targetUrl })
          });
          
          if (!scrapeResponse.ok) {
            throw new Error(`Failed to scrape ${targetUrl}`);
          }
          
          scrapeData = await scrapeResponse.json();
          
          // Cache the successful result for 30 minutes
          if (scrapeData.success) {
            await websiteCache.set(cacheKey, scrapeData, 30 * 60);
            console.log('[analyze-website-intent] Cached website data for:', targetUrl);
          }
        } else {
          console.log('[analyze-website-intent] Cache hit for:', targetUrl);
        }
        
        if (!scrapeData.success) {
          throw new Error(scrapeData.error || 'Failed to scrape website');
        }
        
        // Extract design patterns from scraped content
        const designPatterns = extractDesignPatterns(scrapeData.content, scrapeData.metadata);
        
        return {
          success: true,
          url: targetUrl,
          title: scrapeData.structured.title,
          description: scrapeData.structured.description,
          content: scrapeData.content,
          designPatterns,
          metadata: scrapeData.metadata
        };
        
      } catch (scrapeError) {
        console.error(`[analyze-website-intent] Error scraping ${targetUrl}:`, scrapeError);
        return {
          success: false,
          url: targetUrl,
          error: (scrapeError as Error).message
        };
      }
    });
    
    try {
      const scrapeResults = await Promise.allSettled(scrapePromises);
      const successfulScrapes = scrapeResults
        .map((result, index) => result.status === 'fulfilled' ? result.value : null)
        .filter((result): result is NonNullable<typeof result> => result !== null && result.success);
      
      const failedScrapes = scrapeResults
        .map((result, index) => result.status === 'fulfilled' ? result.value : null)
        .filter((result): result is NonNullable<typeof result> => result !== null && !result.success);
      
      if (successfulScrapes.length === 0) {
        return NextResponse.json({
          success: true,
          hasWebsiteReferences: true,
          websiteData: null,
          allDetectedUrls: websiteUrls,
          errors: failedScrapes.map(f => `${f.url}: ${f.error}`),
          message: `Detected website references but failed to scrape any: ${websiteUrls.join(', ')}`
        });
      }
      
      // Merge design patterns from all successful scrapes
      const mergedPatterns = mergeDesignPatterns(successfulScrapes.map(s => s.designPatterns));
      
      console.log('[analyze-website-intent] Successfully analyzed websites:', {
        successful: successfulScrapes.length,
        failed: failedScrapes.length,
        patterns: mergedPatterns
      });
      
      return NextResponse.json({
        success: true,
        hasWebsiteReferences: true,
        websiteData: {
          primary: successfulScrapes[0], // Primary reference
          additional: successfulScrapes.slice(1), // Additional references
          mergedPatterns,
          totalSites: successfulScrapes.length
        },
        allDetectedUrls: websiteUrls,
        errors: failedScrapes.map(f => `${f.url}: ${f.error}`),
        message: `Successfully scraped and analyzed ${successfulScrapes.length} websites`
      });
      
    } catch (error) {
      console.error('[analyze-website-intent] Error in multi-site analysis:', error);
      return NextResponse.json({
        success: true,
        hasWebsiteReferences: true,
        websiteData: null,
        allDetectedUrls: websiteUrls,
        error: `Multi-site analysis failed: ${(error as Error).message}`,
        message: `Detected website references but analysis failed: ${websiteUrls.join(', ')}`
      });
    }
    
  } catch (error) {
    console.error('[analyze-website-intent] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
