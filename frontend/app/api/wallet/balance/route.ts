import { NextRequest, NextResponse } from 'next/server';
import { hederaAgentService } from '@/lib/agent-service';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    // Check if agent service is ready
    if (!hederaAgentService.isReady()) {
      return NextResponse.json(
        { error: 'Agent service not initialized' },
        { status: 503 }
      );
    }

    // Get balance
    const balance = await hederaAgentService.getBalance(accountId || undefined);

    return NextResponse.json({
      success: true,
      accountId: accountId || process.env.HEDERA_OPERATOR_ID,
      balance: {
        hbars: balance.hbars,
        tokens: balance.tokens
      }
    });

  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}