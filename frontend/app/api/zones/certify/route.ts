import { NextRequest, NextResponse } from 'next/server';
import { hederaAgentService } from '@/lib/agent-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      symbol,
      zoneId,
      location,
      area,
      certifications
    } = body;

    // Validate required fields
    if (!name || !symbol || !zoneId || !location || !area || !certifications) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate location
    if (!location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Invalid location coordinates' },
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

    // Create zone certification NFT
    const result = await hederaAgentService.createZoneCertificationNFT({
      name,
      symbol,
      zoneId,
      metadata: {
        location: {
          lat: location.lat,
          lng: location.lng
        },
        area,
        verificationDate: new Date().toISOString(),
        certifications
      }
    });

    return NextResponse.json({
      success: true,
      tokenId: result.tokenId,
      transactionId: result.transactionId,
      zoneId,
      message: `Successfully created certification NFT for zone ${zoneId}`
    });

  } catch (error) {
    console.error('Error creating zone certification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create zone certification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}