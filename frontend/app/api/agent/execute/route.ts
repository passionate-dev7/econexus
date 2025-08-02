import { NextRequest, NextResponse } from 'next/server';
import { hederaAgentService } from '@/lib/agent-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing prompt' },
        { status: 400 }
      );
    }

    // Check if agent service is ready
    if (!hederaAgentService.isReady()) {
      return NextResponse.json(
        { error: 'Agent service not initialized' },
        { status: 503 }
      );
    }

    // Execute agent task
    const result = await hederaAgentService.executeAgentTask(prompt);

    return NextResponse.json({
      success: true,
      result,
      prompt
    });

  } catch (error) {
    console.error('Error executing agent task:', error);
    
    // Check if it's because OpenAI key is missing
    if (error instanceof Error && error.message.includes('AI executor not initialized')) {
      return NextResponse.json(
        { 
          error: 'AI features not available',
          details: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to execute agent task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}