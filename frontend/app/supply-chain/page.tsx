'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, CheckCircle, TrendingUp, Leaf, QrCode, ArrowRight, Truck, Factory, Store } from 'lucide-react';
import { SupplyChainProduct } from '@/lib/types';
import Image from 'next/image';

// Mock products for demonstration
const mockProducts: SupplyChainProduct[] = [
  {
    id: 'product-1',
    name: 'Organic Coffee Beans',
    description: 'Single-origin arabica from sustainable farms',
    producer: 'Amazon Cooperative',
    origin: {
      zoneId: 'zone-1',
      location: 'Amazonas, Brazil'
    },
    certifications: ['Rainforest Alliance', 'Fair Trade', 'Organic'],
    environmentalFootprint: {
      carbonEmissions: 2.5,
      waterUsage: 120,
      sustainabilityScore: 92
    },
    trackingHistory: [
      {
        stage: 'Harvest',
        location: 'Amazon Farm, Brazil',
        timestamp: new Date('2024-10-15'),
        handler: 'Local Farmers Cooperative'
      },
      {
        stage: 'Processing',
        location: 'Processing Facility, Manaus',
        timestamp: new Date('2024-10-20'),
        handler: 'EcoProcess Ltd'
      },
      {
        stage: 'Export',
        location: 'Port of Santos, Brazil',
        timestamp: new Date('2024-10-25'),
        handler: 'Global Logistics Co'
      },
      {
        stage: 'Distribution',
        location: 'Miami Distribution Center',
        timestamp: new Date('2024-11-01'),
        handler: 'US Distributors Inc'
      },
      {
        stage: 'Retail',
        location: 'EcoMart Store, New York',
        timestamp: new Date('2024-11-05'),
        handler: 'EcoMart Retail'
      }
    ],
    qrCode: 'QR-COFFEE-001',
    verified: true
  },
  {
    id: 'product-2',
    name: 'Sustainable Cocoa',
    description: 'Premium cocoa from regenerative agriculture',
    producer: 'Ghana Farmers Union',
    origin: {
      zoneId: 'zone-2',
      location: 'Ashanti Region, Ghana'
    },
    certifications: ['UTZ Certified', 'Carbon Neutral'],
    environmentalFootprint: {
      carbonEmissions: 1.8,
      waterUsage: 95,
      sustainabilityScore: 88
    },
    trackingHistory: [
      {
        stage: 'Harvest',
        location: 'Ashanti Farms, Ghana',
        timestamp: new Date('2024-09-20'),
        handler: 'Ghana Farmers Union'
      },
      {
        stage: 'Fermentation',
        location: 'Local Processing Center',
        timestamp: new Date('2024-09-25'),
        handler: 'Community Processors'
      },
      {
        stage: 'Export',
        location: 'Port of Tema, Ghana',
        timestamp: new Date('2024-10-01'),
        handler: 'African Export Co'
      }
    ],
    qrCode: 'QR-COCOA-002',
    verified: true
  }
];

function ProductCard({ product }: { product: SupplyChainProduct }) {
  const [showDetails, setShowDetails] = useState(false);

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'harvest': return <Leaf className="w-4 h-4" />;
      case 'processing': case 'fermentation': return <Factory className="w-4 h-4" />;
      case 'export': case 'distribution': return <Truck className="w-4 h-4" />;
      case 'retail': return <Store className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Product Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-green-100 text-sm mt-1">{product.description}</p>
          </div>
          <QrCode className="w-8 h-8 opacity-50" />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Origin */}
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Origin</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{product.origin.location}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Producer: {product.producer}</p>
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Certifications</p>
          <div className="flex flex-wrap gap-2">
            {product.certifications.map((cert, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Environmental Impact</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Carbon Emissions</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${100 - (product.environmentalFootprint.carbonEmissions * 10)}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{product.environmentalFootprint.carbonEmissions} kg</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Water Usage</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${100 - (product.environmentalFootprint.waterUsage / 2)}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{product.environmentalFootprint.waterUsage} L</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Sustainability Score</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    style={{ width: `${product.environmentalFootprint.sustainabilityScore}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-green-600">{product.environmentalFootprint.sustainabilityScore}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supply Chain Timeline */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-900 dark:text-white mb-3"
          >
            <span>Supply Chain Journey</span>
            <motion.div
              animate={{ rotate: showDetails ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              {product.trackingHistory.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === product.trackingHistory.length - 1
                        ? 'bg-green-100 dark:bg-green-900 text-green-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                    }`}>
                      {getStageIcon(step.stage)}
                    </div>
                    {index < product.trackingHistory.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{step.stage}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{step.location}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {step.timestamp.toLocaleDateString()} • {step.handler}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Verify Button */}
        <div className="mt-4 flex gap-3">
          <button className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" />
            Scan QR Code
          </button>
          {product.verified && (
            <div className="flex items-center gap-1 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Verified</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function SupplyChainPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products', icon: '📦' },
    { id: 'food', name: 'Food & Agriculture', icon: '🌾' },
    { id: 'textiles', name: 'Textiles', icon: '👕' },
    { id: 'timber', name: 'Timber & Wood', icon: '🪵' },
    { id: 'minerals', name: 'Minerals', icon: '💎' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Supply Chain Transparency
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track products from source to consumer with complete transparency
            </p>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-blue-100 text-sm">Products Tracked</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Verified Suppliers</p>
              <p className="text-2xl font-bold">89</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Carbon Saved</p>
              <p className="text-2xl font-bold">342 tons</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Avg Sustainability</p>
              <p className="text-2xl font-bold">87/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by product name or QR code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium">
              Search
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            How Supply Chain Tracking Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Product Registration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Producers register products with origin zone and environmental data
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chain of Custody</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Each handler updates location and processing information on Hedera
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">QR Code Generation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unique QR codes link physical products to blockchain records
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Consumer Verification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan QR codes to view complete journey and environmental impact
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}