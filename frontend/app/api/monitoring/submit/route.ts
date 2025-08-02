import { NextRequest, NextResponse } from 'next/server';
import { hederaAgentService } from '@/lib/agent-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId, data } = body;

    // Validate input
    if (!topicId || !data) {
      return NextResponse.json(
        { error: 'Topic ID and data are required' },
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

    // Prepare monitoring message
    const message = {
      timestamp: new Date().toISOString(),
      type: data.type || 'monitoring_update',
      source: data.source || 'econexus_platform',
      metrics: data.metrics || {},
      metadata: data.metadata || {}
    };

    // Add specific monitoring data based on type
    if (data.type === 'satellite') {
      message.metrics = {
        ndvi: data.ndvi,
        forestCover: data.forestCover,
        waterQuality: data.waterQuality,
        ...data.metrics
      };
    } else if (data.type === 'bioacoustic') {
      message.metrics = {
        speciesDetected: data.speciesDetected,
        soundscapeIndex: data.soundscapeIndex,
        recordings: data.recordings,
        ...data.metrics
      };
    } else if (data.type === 'sensor') {
      message.metrics = {
        temperature: data.temperature,
        humidity: data.humidity,
        soilMoisture: data.soilMoisture,
        airQuality: data.airQuality,
        ...data.metrics
      };
    }

    // Submit to HCS topic
    const result = await hederaAgentService.submitMonitoringData({
      topicId,
      message
    });

    return NextResponse.json({
      success: true,
      sequenceNumber: result.sequenceNumber,
      transactionId: result.transactionId,
      timestamp: message.timestamp,
      message: 'Monitoring data submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting monitoring data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}