import { NextRequest, NextResponse } from 'next/server';
import { hederaAgentService } from '@/lib/agent-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memo, adminKey, submitKey } = body;

    // Validate memo
    if (!memo || typeof memo !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing memo' },
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

    // Create monitoring topic
    const result = await hederaAgentService.createMonitoringTopic({
      memo,
      adminKey,
      submitKey
    });

    return NextResponse.json({
      success: true,
      topicId: result.topicId,
      transactionId: result.transactionId,
      message: `Successfully created monitoring topic: ${memo}`
    });

  } catch (error) {
    console.error('Error creating monitoring topic:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create monitoring topic',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const topicId = searchParams.get('topicId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
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

    // Get monitoring history
    const history = await hederaAgentService.getMonitoringHistory(topicId, limit);

    return NextResponse.json({
      success: true,
      topicId,
      messages: history,
      count: history.length
    });

  } catch (error) {
    console.error('Error fetching monitoring history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch monitoring history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}