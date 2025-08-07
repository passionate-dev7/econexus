import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceService } from '@/lib/marketplace';
import { HederaService } from '@/lib/hedera-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creditType = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const marketplaceService = new MarketplaceService();
    
    const filters = {
      creditType: creditType || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    };

    const listings = await marketplaceService.searchListings(filters);

    return NextResponse.json({
      success: true,
      listings,
      total: listings.length
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      creditId,
      creditType,
      amount,
      pricePerUnit,
      minPurchase,
      vintageYear,
      zoneId,
      sellerId
    } = body;

    // Validate input
    if (!creditId || !amount || !pricePerUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const marketplaceService = new MarketplaceService();
    const hederaService = new HederaService();

    // Create the listing
    const listing = await marketplaceService.createListing(
      {
        id: creditId,
        type: creditType,
        amount,
        unit: 'credits',
        zoneId,
        vintageYear,
        methodology: 'Hedera Guardian',
        status: 'verified',
        owner: sellerId,
        metadata: {}
      },
      pricePerUnit,
      amount,
      minPurchase
    );

    // Record on HCS for transparency
    const operatorId = hederaService.getOperatorId();
    
    // In production, we'd have a dedicated marketplace topic
    const marketplaceTopic = '0.0.123456'; // Replace with actual topic ID
    
    await hederaService.submitMonitoringData(marketplaceTopic, {
      type: 'listing_created',
      listing,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}