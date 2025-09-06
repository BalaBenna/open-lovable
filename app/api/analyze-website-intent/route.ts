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

// Function to extract design patterns from scraped content
function extractDesignPatterns(content: string, metadata: any) {
  const patterns = {
    colors: [] as string[],
    typography: {} as any,
    layout: {} as any,
    components: [] as string[],
    animations: [] as string[],
  };
  
  // Extract color mentions from content
  const colorRegex = /#[0-9a-fA-F]{6}|rgb\([^)]+\)|hsl\([^)]+\)|(?:white|black|red|blue|green|yellow|purple|pink|orange|gray|grey)\b/gi;
  const colorMatches = content.match(colorRegex) || [];
  patterns.colors = [...new Set(colorMatches)];
  
  // Extract typography patterns
  if (content.includes('font-') || content.includes('text-')) {
    patterns.typography = {
      hasCustomFonts: content.includes('font-family'),
      hasLargeTitles: content.includes('text-6xl') || content.includes('text-5xl'),
      hasSubtitles: content.includes('text-xl') || content.includes('text-lg'),
    };
  }
  
  // Extract layout patterns
  patterns.layout = {
    hasGrid: content.includes('grid') || content.includes('Grid'),
    hasFlex: content.includes('flex') || content.includes('Flex'),
    hasCards: content.includes('card') || content.includes('Card'),
    hasHero: content.includes('hero') || content.includes('Hero'),
    hasNavigation: content.includes('nav') || content.includes('Navigation'),
    hasFooter: content.includes('footer') || content.includes('Footer'),
  };
  
  // Extract component patterns
  const componentKeywords = ['button', 'modal', 'dropdown', 'carousel', 'tabs', 'accordion', 'form', 'input', 'table'];
  patterns.components = componentKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword)
  );
  
  // Extract animation patterns
  const animationKeywords = ['fade', 'slide', 'bounce', 'scale', 'rotate', 'transition', 'animation'];
  patterns.animations = animationKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword)
  );
  
  return patterns;
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
    
    // Scrape the first website reference for now (can be extended to handle multiple)
    const targetUrl = websiteUrls[0];
    const cacheKey = generateCacheKey(targetUrl);
    
    try {
      // Check cache first for performance
      let scrapeData = websiteCache.get(cacheKey);
      
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
          websiteCache.set(cacheKey, scrapeData, 30 * 60 * 1000);
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
      
      console.log('[analyze-website-intent] Successfully analyzed website:', {
        url: targetUrl,
        contentLength: scrapeData.content.length,
        patterns: designPatterns
      });
      
      return NextResponse.json({
        success: true,
        hasWebsiteReferences: true,
        websiteData: {
          url: targetUrl,
          title: scrapeData.structured.title,
          description: scrapeData.structured.description,
          content: scrapeData.content,
          designPatterns,
          metadata: scrapeData.metadata
        },
        allDetectedUrls: websiteUrls,
        message: `Successfully scraped and analyzed ${targetUrl}`
      });
      
    } catch (scrapeError) {
      console.error('[analyze-website-intent] Error scraping website:', scrapeError);
      
      return NextResponse.json({
        success: true,
        hasWebsiteReferences: true,
        websiteData: null,
        allDetectedUrls: websiteUrls,
        error: `Failed to scrape ${targetUrl}: ${(scrapeError as Error).message}`,
        message: `Detected website references but failed to scrape: ${websiteUrls.join(', ')}`
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
