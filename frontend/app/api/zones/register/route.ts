import { NextRequest, NextResponse } from 'next/server';
import { HederaService } from '@/lib/hedera-client';
import { AIMonitoringService } from '@/lib/ai-monitoring';
import { CommunityZone } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, location, ownerAccountId, ownerName, ownerType } = body;

    // Validate input
    if (!name || !location || !ownerAccountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize services
    const hederaService = new HederaService();
    const aiService = new AIMonitoringService();

    // Create HCS topic for zone monitoring
    const topicResult = await hederaService.createMonitoringTopic(
      name,
      `Zone monitoring for ${name}`
    );

    // Create initial zone object
    const zone: CommunityZone = {
      id: `zone-${Date.now()}`,
      name,
      description,
      location,
      owner: {
        accountId: ownerAccountId,
        name: ownerName,
        type: ownerType
      },
      metrics: {
        carbonSequestration: {
          current: 0,
          baseline: 0,
          change: 0
        },
        biodiversity: {
          speciesCount: 0,
          biodiversityIndex: 0,
          endangeredSpecies: []
        },
        waterQuality: {
          index: 0,
          pollutants: []
        },
        soilHealth: {
          organicMatter: 0,
          erosionRate: 0,
          fertility: 0
        },
        lastUpdated: new Date()
      },
      status: 'pending',
      createdAt: new Date(),
      guardianPolicyId: undefined
    };

    // Submit initial registration to HCS
    await hederaService.submitMonitoringData(topicResult.topicId!, {
      type: 'zone_registration',
      zone,
      timestamp: new Date().toISOString()
    });

    // In production, this would be saved to a database
    // For now, we'll return the created zone
    
    return NextResponse.json({
      success: true,
      zone,
      topicId: topicResult.topicId,
      transactionId: topicResult.transactionId
    });
  } catch (error) {
    console.error('Error registering zone:', error);
    return NextResponse.json(
      { error: 'Failed to register zone' },
      { status: 500 }
    );
  }
}