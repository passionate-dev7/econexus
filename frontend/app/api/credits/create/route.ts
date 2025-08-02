import { NextRequest, NextResponse } from 'next/server';
import { hederaAgentService } from '@/lib/agent-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      symbol,
      decimals = 2,
      initialSupply,
      maxSupply,
      creditType,
      vintageYear,
      zoneId,
      methodology
    } = body;

    // Validate required fields
    if (!name || !symbol || !initialSupply || !maxSupply || !creditType || !vintageYear || !zoneId || !methodology) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate credit type
    const validCreditTypes = ['carbon', 'biodiversity', 'water', 'soil'];
    if (!validCreditTypes.includes(creditType)) {
      return NextResponse.json(
        { error: 'Invalid credit type' },
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

    // Create credit token using agent service
    const result = await hederaAgentService.createCreditToken({
      name,
      symbol,
      decimals,
      initialSupply,
      maxSupply,
      metadata: {
        creditType,
        vintageYear,
        zoneId,
        methodology
      }
    });

    return NextResponse.json({
      success: true,
      tokenId: result.tokenId,
      transactionId: result.transactionId,
      message: `Successfully created ${creditType} credit token: ${name}`
    });

  } catch (error) {
    console.error('Error creating credit token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create credit token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}