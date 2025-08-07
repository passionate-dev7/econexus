import { NextRequest, NextResponse } from 'next/server';
import { AIMonitoringService } from '@/lib/ai-monitoring';
import { HederaService } from '@/lib/hedera-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zoneId, dataType, data } = body;

    if (!zoneId || !dataType || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const aiService = new AIMonitoringService();
    const hederaService = new HederaService();

    let analysisResult;

    switch (dataType) {
      case 'satellite':
        analysisResult = await aiService.analyzeSatelliteImagery(
          zoneId,
          data.currentImage,
          data.previousImage
        );
        break;

      case 'bioacoustic':
        // Convert base64 to ArrayBuffer if needed
        const audioBuffer = Buffer.from(data.audio, 'base64').buffer;
        analysisResult = await aiService.analyzeBioacousticData(
          zoneId,
          audioBuffer
        );
        break;

      case 'citizen_report':
        analysisResult = await aiService.processCitizenSubmission(
          zoneId,
          {
            type: data.type,
            data: data.content,
            description: data.description,
            location: data.location,
            submittedBy: data.submittedBy
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid data type' },
          { status: 400 }
        );
    }

    // Submit analysis to HCS for immutable record
    if (data.topicId) {
      await hederaService.submitMonitoringData(data.topicId, {
        type: 'ai_analysis',
        zoneId,
        dataType,
        analysis: analysisResult,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult
    });
  } catch (error) {
    console.error('Error analyzing monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to analyze monitoring data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');

    if (!zoneId) {
      return NextResponse.json(
        { error: 'Zone ID required' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    // For demo, return mock alerts
    const mockAlerts = [
      {
        id: `alert-${Date.now()}`,
        zoneId,
        type: 'biodiversity_change',
        severity: 'medium',
        description: 'Decreased bird activity detected in sector 3',
        detectedAt: new Date(),
        resolved: false
      }
    ];

    return NextResponse.json({
      success: true,
      alerts: mockAlerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}