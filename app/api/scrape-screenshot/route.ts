import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Use Firecrawl API to capture screenshot with retry logic
    let firecrawlResponse;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`[scrape-screenshot] Attempt ${retryCount + 1} for URL: ${url}`);
        
        firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url,
            formats: ['screenshot'], // Regular viewport screenshot, not full page
            waitFor: 2000, // Reduced wait time
            timeout: 60000, // Increased timeout to 60 seconds
            blockAds: true,
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
        console.warn(`[scrape-screenshot] Attempt ${retryCount} failed:`, error);
        
        if (retryCount > maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!firecrawlResponse.ok) {
      const error = await firecrawlResponse.text();
      console.error(`[scrape-screenshot] Firecrawl API error: ${error}`);
      
      // Handle specific timeout errors
      if (error.includes('SCRAPE_TIMEOUT') || error.includes('timeout')) {
        throw new Error(`Screenshot capture timeout for ${url}. The website may be slow or unresponsive. Please try again or use a different URL.`);
      }
      
      throw new Error(`Firecrawl API error: ${error}`);
    }

    const data = await firecrawlResponse.json();
    
    if (!data.success || !data.data?.screenshot) {
      throw new Error('Failed to capture screenshot');
    }

    return NextResponse.json({
      success: true,
      screenshot: data.data.screenshot,
      metadata: data.data.metadata
    });

  } catch (error: any) {
    console.error('Screenshot capture error:', error);
    
    // Provide a fallback response for timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('SCRAPE_TIMEOUT')) {
      return NextResponse.json({ 
        success: false,
        error: error.message || 'Screenshot capture timeout',
        fallback: {
          url,
          message: 'Screenshot capture timed out. The website may be slow or unresponsive.',
          suggestions: [
            'Try again in a few moments',
            'Check if the website is accessible in your browser',
            'Try a different URL if available'
          ]
        }
      }, { status: 408 }); // 408 Request Timeout
    }
    
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to capture screenshot' 
    }, { status: 500 });
  }
}