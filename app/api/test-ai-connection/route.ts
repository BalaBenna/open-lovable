import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'openai';

    logger.info('Testing AI connection', { provider });

    // Test configuration
    const configStatus = {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      supabase: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    };

    // Test network connectivity
    let networkTest = { success: false, error: null };
    try {
      const testUrl = provider === 'openai' ? 'https://api.openai.com/v1/models' :
                     provider === 'anthropic' ? 'https://api.anthropic.com/v1/messages' :
                     'https://api.groq.com/openai/v1/models';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (provider === 'openai' && configStatus.openai) {
        headers['Authorization'] = `Bearer ${process.env.OPENAI_API_KEY}`;
      } else if (provider === 'anthropic' && configStatus.anthropic) {
        headers['x-api-key'] = process.env.ANTHROPIC_API_KEY!;
        headers['anthropic-version'] = '2023-06-01';
      } else if (provider === 'groq' && configStatus.groq) {
        headers['Authorization'] = `Bearer ${process.env.GROQ_API_KEY}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      networkTest = {
        success: response.status < 400,
        error: response.status >= 400 ? `${response.status} ${response.statusText}` : null
      };

    } catch (error: any) {
      networkTest = {
        success: false,
        error: error.name === 'AbortError' ? 'Request timeout' : error.message
      };
    }

    const result = {
      timestamp: new Date().toISOString(),
      configuration: configStatus,
      networkTest,
      recommendations: []
    };

    // Generate recommendations
    if (!configStatus.openai && !configStatus.anthropic && !configStatus.groq) {
      result.recommendations.push('No AI API keys configured. Add at least one API key to .env.local');
    }

    if (!networkTest.success && networkTest.error) {
      if (networkTest.error.includes('ECONNRESET')) {
        result.recommendations.push('ECONNRESET error detected. Check firewall/proxy settings.');
      } else if (networkTest.error.includes('timeout')) {
        result.recommendations.push('Network timeout. Check internet connection and firewall.');
      } else if (networkTest.error.includes('401')) {
        result.recommendations.push('Authentication failed. Check API key format and validity.');
      } else if (networkTest.error.includes('403')) {
        result.recommendations.push('Access forbidden. Check API key permissions.');
      }
    }

    if (!configStatus.supabase) {
      result.recommendations.push('Supabase not configured. Project persistence will not work.');
    }

    const status = networkTest.success && Object.values(configStatus).some(v => v) ? 'healthy' : 'issues';

    logger.info('AI connection test completed', {
      status,
      provider,
      networkSuccess: networkTest.success
    });

    return NextResponse.json({
      ...result,
      status,
      message: status === 'healthy'
        ? 'AI connection is working correctly!'
        : 'Issues detected. See recommendations for fixes.'
    });

  } catch (error) {
    logger.error('AI connection test failed', error as Error);

    return NextResponse.json({
      status: 'error',
      message: 'Connection test failed',
      error: (error as Error).message,
      recommendations: [
        'Check server logs for detailed error information',
        'Verify all environment variables are set correctly',
        'Test network connectivity to AI service endpoints'
      ]
    }, { status: 500 });
  }
}
