'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, ShoppingCart, Leaf, Droplets, Bug, Sprout, Activity, ChevronDown } from 'lucide-react';
import { CreditListingCard } from '@/components/marketplace/credit-listing';
import { MarketplaceListing, EnvironmentalCredit } from '@/lib/types';
import { MarketplaceService } from '@/lib/marketplace';

// Mock data for demonstration
const mockCredits: EnvironmentalCredit[] = [
  {
    id: 'credit-1',
    type: 'carbon',
    amount: 100,
    unit: 'tCO2e',
    zoneId: 'zone-1',
    vintageYear: 2024,
    methodology: 'Verra VCS',
    status: 'verified',
    tokenId: '0.0.123456',
    price: 25,
    owner: '0.0.1234',
    metadata: {
      project: 'Amazon Rainforest Conservation',
      location: 'Brazil',
      additionalInfo: 'High-quality carbon credits from protected rainforest'
    }
  },
  {
    id: 'credit-2',
    type: 'biodiversity',
    amount: 50,
    unit: 'credits',
    zoneId: 'zone-2',
    vintageYear: 2024,
    methodology: 'IUCN Red List',
    status: 'verified',
    tokenId: '0.0.123457',
    price: 45,
    owner: '0.0.5678',
    metadata: {
      project: 'Coral Reef Protection',
      location: 'Great Barrier Reef',
      speciesProtected: 150
    }
  },
  {
    id: 'credit-3',
    type: 'water',
    amount: 200,
    unit: 'ML saved',
    zoneId: 'zone-3',
    vintageYear: 2024,
    methodology: 'Alliance for Water Stewardship',
    status: 'verified',
    tokenId: '0.0.123458',
    price: 30,
    owner: '0.0.9012',
    metadata: {
      project: 'Watershed Restoration',
      location: 'Colorado River Basin',
      waterSaved: '200 million liters'
    }
  },
  {
    id: 'credit-4',
    type: 'soil',
    amount: 75,
    unit: 'hectares',
    zoneId: 'zone-4',
    vintageYear: 2024,
    methodology: 'Regenerative Organic Certified',
    status: 'verified',
    tokenId: '0.0.123459',
    price: 20,
    owner: '0.0.3456',
    metadata: {
      project: 'Regenerative Agriculture',
      location: 'Iowa, USA',
      carbonSequestered: 150
    }
  }
];

const mockListings: MarketplaceListing[] = mockCredits.map((credit, index) => ({
  id: `listing-${index + 1}`,
  creditId: credit.id,
  sellerId: credit.owner,
  price: credit.price || 25,
  currency: 'HBAR',
  quantity: credit.amount,
  minPurchase: Math.floor(credit.amount / 10),
  description: credit.metadata.project as string,
  active: true,
  createdAt: new Date(),
}));

export default function MarketplacePage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState<'price' | 'newest' | 'popular'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [marketStats, setMarketStats] = useState<any>(null);

  useEffect(() => {
    // Load market statistics
    const loadMarketStats = async () => {
      const service = new MarketplaceService();
      const stats = await service.getMarketplaceStats();
      setMarketStats(stats);
    };
    loadMarketStats();
  }, []);

  const creditTypes = [
    { id: 'all', name: 'All Credits', icon: '🌍', color: 'bg-gray-100' },
    { id: 'carbon', name: 'Carbon', icon: '🌳', color: 'bg-green-100' },
    { id: 'biodiversity', name: 'Biodiversity', icon: '🦋', color: 'bg-blue-100' },
    { id: 'water', name: 'Water', icon: '💧', color: 'bg-cyan-100' },
    { id: 'soil', name: 'Soil', icon: '🌱', color: 'bg-amber-100' }
  ];

  const filteredListings = mockListings.filter(listing => {
    const credit = mockCredits.find(c => c.id === listing.creditId);
    if (!credit) return false;
    
    if (selectedType !== 'all' && credit.type !== selectedType) return false;
    if (searchQuery && !listing.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (listing.price < priceRange[0] || listing.price > priceRange[1]) return false;
    
    return true;
  });

  const handlePurchase = (listingId: string) => {
    setCartItems([...cartItems, listingId]);
    // In production, this would open a purchase modal or redirect to checkout
    console.log('Purchase listing:', listingId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Environmental Credit Marketplace
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Trade verified carbon, biodiversity, water, and soil credits
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Market Stats Banner */}
      {marketStats && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex gap-8">
                <div>
                  <span className="text-sm opacity-90">Total Volume</span>
                  <p className="text-xl font-bold">{marketStats.totalVolume.toLocaleString()} HBAR</p>
                </div>
                <div>
                  <span className="text-sm opacity-90">Active Listings</span>
                  <p className="text-xl font-bold">{marketStats.activeListings}</p>
                </div>
                <div>
                  <span className="text-sm opacity-90">Avg Carbon Price</span>
                  <p className="text-xl font-bold">{marketStats.averagePrice.carbon} HBAR</p>
                </div>
                <div>
                  <span className="text-sm opacity-90">24h Transactions</span>
                  <p className="text-xl font-bold">{marketStats.recentTransactions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Market is trending up 12.5%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <motion.aside 
            className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 space-y-6`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            {/* Credit Type Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Credit Type</h3>
              <div className="space-y-2">
                {creditTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      selectedType === type.id
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Price Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Min: {priceRange[0]} HBAR</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Max: {priceRange[1]} HBAR</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Vintage Year Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Vintage Year</h3>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </motion.aside>

          {/* Main Listings Area */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search credits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="newest">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredListings.length} of {mockListings.length} listings
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredListings.map((listing, index) => {
                  const credit = mockCredits.find(c => c.id === listing.creditId)!;
                  return (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CreditListingCard
                        listing={listing}
                        credit={credit}
                        onPurchase={() => handlePurchase(listing.id)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No credits found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}