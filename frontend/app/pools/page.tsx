'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Users, Lock, Timer, Award, Plus, ArrowUpRight, Wallet } from 'lucide-react';
import { ReFiPool } from '@/lib/types';

// Mock data for demonstration
const mockPools: ReFiPool[] = [
  {
    id: 'pool-1',
    name: 'Amazon Rainforest Conservation',
    description: 'Support indigenous communities protecting rainforest areas',
    targetZones: ['zone-1', 'zone-2', 'zone-3'],
    totalStaked: 125000,
    currency: 'HBAR',
    apy: 15.5,
    minimumStake: 100,
    lockPeriod: 30,
    impactMetrics: {
      carbonOffset: 2500,
      biodiversityScore: 88,
      communityBenefit: 95
    },
    participants: 342,
    status: 'active'
  },
  {
    id: 'pool-2',
    name: 'Ocean Cleanup Initiative',
    description: 'Fund ocean conservation and plastic removal projects',
    targetZones: ['zone-4', 'zone-5'],
    totalStaked: 87500,
    currency: 'HBAR',
    apy: 12.0,
    minimumStake: 50,
    lockPeriod: 60,
    impactMetrics: {
      carbonOffset: 1800,
      biodiversityScore: 92,
      communityBenefit: 78
    },
    participants: 256,
    status: 'active'
  },
  {
    id: 'pool-3',
    name: 'Regenerative Agriculture Fund',
    description: 'Support farmers transitioning to sustainable practices',
    targetZones: ['zone-6', 'zone-7', 'zone-8'],
    totalStaked: 195000,
    currency: 'HBAR',
    apy: 18.0,
    minimumStake: 200,
    lockPeriod: 90,
    impactMetrics: {
      carbonOffset: 3200,
      biodiversityScore: 75,
      communityBenefit: 98
    },
    participants: 428,
    status: 'active'
  }
];

interface StakeModalProps {
  pool: ReFiPool;
  isOpen: boolean;
  onClose: () => void;
}

function StakeModal({ pool, isOpen, onClose }: StakeModalProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

  if (!isOpen) return null;

  const handleStake = async () => {
    setIsStaking(true);
    // Simulate staking
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsStaking(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Stake in {pool.name}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stake Amount (HBAR)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder={`Min: ${pool.minimumStake} HBAR`}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">APY</span>
              <span className="text-sm font-medium text-green-600">{pool.apy}%</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Lock Period</span>
              <span className="text-sm font-medium">{pool.lockPeriod} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Est. Annual Return</span>
              <span className="text-sm font-medium text-green-600">
                {stakeAmount ? `${(parseFloat(stakeAmount) * pool.apy / 100).toFixed(2)} HBAR` : '0 HBAR'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) < pool.minimumStake}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isStaking ? 'Staking...' : 'Confirm Stake'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PoolsPage() {
  const [selectedPool, setSelectedPool] = useState<ReFiPool | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [totalValueLocked, setTotalValueLocked] = useState(0);

  useEffect(() => {
    const tvl = mockPools.reduce((sum, pool) => sum + pool.totalStaked, 0);
    setTotalValueLocked(tvl);
  }, []);

  const handleStake = (pool: ReFiPool) => {
    setSelectedPool(pool);
    setIsStakeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ReFi Staking Pools
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Stake HBAR to support conservation and earn sustainable yields
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Pool
            </motion.button>
          </div>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Value Locked</p>
              <p className="text-3xl font-bold">{totalValueLocked.toLocaleString()} HBAR</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm mb-1">Active Pools</p>
              <p className="text-3xl font-bold">{mockPools.length}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm mb-1">Average APY</p>
              <p className="text-3xl font-bold">
                {(mockPools.reduce((sum, p) => sum + p.apy, 0) / mockPools.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Participants</p>
              <p className="text-3xl font-bold">
                {mockPools.reduce((sum, p) => sum + p.participants, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              {/* Pool Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {pool.name}
                </h3>
                <p className="text-purple-100 text-sm">
                  {pool.description}
                </p>
              </div>

              {/* Pool Stats */}
              <div className="p-6 space-y-4">
                {/* APY and Lock */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {pool.apy}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Annual Yield</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium">{pool.lockPeriod} days</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Lock Period</p>
                  </div>
                </div>

                {/* Staking Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Staked</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {pool.totalStaked.toLocaleString()} HBAR
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Min Stake</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {pool.minimumStake} HBAR
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Participants</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {pool.participants}
                    </span>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Impact Metrics
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Carbon Offset</span>
                      <div className="flex items-center gap-1">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${(pool.impactMetrics.carbonOffset / 50)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{pool.impactMetrics.carbonOffset}t</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Biodiversity</span>
                      <div className="flex items-center gap-1">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${pool.impactMetrics.biodiversityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{pool.impactMetrics.biodiversityScore}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Community</span>
                      <div className="flex items-center gap-1">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${pool.impactMetrics.communityBenefit}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{pool.impactMetrics.communityBenefit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStake(pool)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Stake Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Your Positions Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Staking Positions
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Active Positions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start staking to support conservation projects and earn rewards
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium">
                Explore Pools
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stake Modal */}
      {selectedPool && (
        <StakeModal
          pool={selectedPool}
          isOpen={isStakeModalOpen}
          onClose={() => {
            setIsStakeModalOpen(false);
            setSelectedPool(null);
          }}
        />
      )}
    </div>
  );
}