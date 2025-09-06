import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let url = '';
  try {
    const requestData = await req.json();
    url = requestData.url;
    
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

    if (!firecrawlResponse || !firecrawlResponse.ok) {
      const error = firecrawlResponse ? await firecrawlResponse.text() : 'No response received';
      console.error(`[scrape-screenshot] Firecrawl API error: ${error}`);
      
      // Handle specific timeout errors
      if (error.includes('SCRAPE_TIMEOUT') || error.includes('timeout')) {
        throw new Error(`Screenshot capture timeout for ${url}. The website may be slow or unresponsive. Please try again or use a different URL.`);
      }
      
      // Handle unsupported websites
      if (error.includes('no longer supported') || error.includes('not supported')) {
        throw new Error(`The website ${url} is not supported by our screenshot service. Please try a different website.`);
      }
      
      // Handle blocked websites
      if (error.includes('blocked') || error.includes('forbidden')) {
        throw new Error(`Access to ${url} is blocked. This website may have restrictions that prevent screenshot capture.`);
      }
      
      throw new Error(`Screenshot capture failed for ${url}. Please try a different website.`);
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
    
    // Provide a fallback response for unsupported websites
    if (error.message?.includes('not supported') || error.message?.includes('blocked')) {
      return NextResponse.json({ 
        success: false,
        error: error.message || 'Screenshot capture not supported',
        fallback: {
          url,
          message: 'This website cannot be captured due to restrictions or limitations.',
          suggestions: [
            'Try a different website',
            'Use a publicly accessible website',
            'Check if the website allows screenshot capture'
          ]
        }
      }, { status: 403 }); // 403 Forbidden
    }
    
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to capture screenshot' 
    }, { status: 500 });
  }
}