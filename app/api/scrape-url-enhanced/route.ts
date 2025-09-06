import { NextRequest, NextResponse } from 'next/server';

// Known unsupported websites that require special activation
const UNSUPPORTED_WEBSITES = [
  'x.com',
  'twitter.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'tiktok.com',
  'youtube.com'
];

// Function to check if a URL is from an unsupported domain
function isUnsupportedWebsite(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return UNSUPPORTED_WEBSITES.some(unsupported => 
      domain === unsupported || domain.endsWith(`.${unsupported}`)
    );
  } catch {
    return false;
  }
}

// Function to sanitize smart quotes and other problematic characters
function sanitizeQuotes(text: string): string {
  return text
    // Replace smart single quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    // Replace smart double quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Replace other quote-like characters
    .replace(/[\u00AB\u00BB]/g, '"') // Guillemets
    .replace(/[\u2039\u203A]/g, "'") // Single guillemets
    // Replace other problematic characters
    .replace(/[\u2013\u2014]/g, '-') // En dash and em dash
    .replace(/[\u2026]/g, '...') // Ellipsis
    .replace(/[\u00A0]/g, ' '); // Non-breaking space
}

export async function POST(request: NextRequest) {
  let url = '';
  try {
    const requestData = await request.json();
    url = requestData.url;
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }
    
    // Check if the website is known to be unsupported
    if (isUnsupportedWebsite(url)) {
      return NextResponse.json({
        success: false,
        error: `The website ${url} is not supported by our scraping service.`,
        fallback: {
          url,
          message: 'This website requires special activation and cannot be scraped.',
          suggestions: [
            'Try a different website',
            'Use a publicly accessible website',
            'Contact support if you need access to this specific website'
          ]
        }
      }, { status: 403 });
    }
    
    console.log('[scrape-url-enhanced] Scraping with Firecrawl:', url);
    
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }
    
    // Make request to Firecrawl API with increased timeout and retry logic
    let firecrawlResponse;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`[scrape-url-enhanced] Attempt ${retryCount + 1} for URL: ${url}`);
        
        firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'html'],
            waitFor: 2000, // Reduced wait time
            timeout: 60000, // Increased timeout to 60 seconds
            blockAds: true,
            maxAge: 3600000, // Use cached data if less than 1 hour old (500% faster!)
            actions: [
              {
                type: 'wait',
                milliseconds: 1000 // Reduced wait time
              }
            ]
          })
        });
        
        // If we get a response, break out of retry loop
        break;
        
      } catch (error) {
        retryCount++;
        console.warn(`[scrape-url-enhanced] Attempt ${retryCount} failed:`, error);
        
        if (retryCount > maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    if (!firecrawlResponse || !firecrawlResponse.ok) {
      const error = firecrawlResponse ? await firecrawlResponse.text() : 'No response received';
      console.error(`[scrape-url-enhanced] Firecrawl API error: ${error}`);
      
      // Handle specific timeout errors
      if (error.includes('SCRAPE_TIMEOUT') || error.includes('timeout')) {
        throw new Error(`Scraping timeout for ${url}. The website may be slow or unresponsive. Please try again or use a different URL.`);
      }
      
      // Handle unsupported websites
      if (error.includes('no longer supported') || error.includes('not supported')) {
        throw new Error(`The website ${url} is not supported by our scraping service. Please try a different website or contact support for assistance.`);
      }
      
      // Handle blocked websites
      if (error.includes('blocked') || error.includes('forbidden')) {
        throw new Error(`Access to ${url} is blocked. This website may have restrictions that prevent scraping.`);
      }
      
      throw new Error(`Scraping failed for ${url}. Please try a different website.`);
    }
    
    const data = await firecrawlResponse.json();
    
    if (!data.success || !data.data) {
      throw new Error('Failed to scrape content');
    }
    
    const { markdown, html, metadata } = data.data;
    
    // Sanitize the markdown content
    const sanitizedMarkdown = sanitizeQuotes(markdown || '');
    
    // Extract structured data from the response
    const title = metadata?.title || '';
    const description = metadata?.description || '';
    
    // Format content for AI
    const formattedContent = `
Title: ${sanitizeQuotes(title)}
Description: ${sanitizeQuotes(description)}
URL: ${url}

Main Content:
${sanitizedMarkdown}
    `.trim();
    
    return NextResponse.json({
      success: true,
      url,
      content: formattedContent,
      structured: {
        title: sanitizeQuotes(title),
        description: sanitizeQuotes(description),
        content: sanitizedMarkdown,
        url
      },
      metadata: {
        scraper: 'firecrawl-enhanced',
        timestamp: new Date().toISOString(),
        contentLength: formattedContent.length,
        cached: data.data.cached || false, // Indicates if data came from cache
        ...metadata
      },
      message: 'URL scraped successfully with Firecrawl (with caching for 500% faster performance)'
    });
    
  } catch (error) {
    console.error('[scrape-url-enhanced] Error:', error);
    
    // Provide a fallback response for timeout errors
    if ((error as Error).message.includes('timeout') || (error as Error).message.includes('SCRAPE_TIMEOUT')) {
      return NextResponse.json({
        success: false,
        error: (error as Error).message,
        fallback: {
          url,
          message: 'The website is taking too long to respond. This could be due to slow loading times, heavy content, or server issues.',
          suggestions: [
            'Try again in a few moments',
            'Check if the website is accessible in your browser',
            'Try a different URL if available'
          ]
        }
      }, { status: 408 }); // 408 Request Timeout
    }
    
    // Provide a fallback response for unsupported websites
    if ((error as Error).message.includes('not supported') || (error as Error).message.includes('blocked')) {
      return NextResponse.json({
        success: false,
        error: (error as Error).message,
        fallback: {
          url,
          message: 'This website cannot be scraped due to restrictions or limitations.',
          suggestions: [
            'Try a different website',
            'Use a publicly accessible website',
            'Check if the website allows scraping'
          ]
        }
      }, { status: 403 }); // 403 Forbidden
    }
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}