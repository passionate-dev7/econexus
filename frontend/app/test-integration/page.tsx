'use client';

import { useState } from 'react';
import { useWallet } from '@/components/wallet/wallet-connect';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, Wallet, Bot, Database, Link } from 'lucide-react';

export default function TestIntegrationPage() {
  const { isConnected, accountId, balance } = useWallet();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: any[] = [];

    // Test 1: Wallet Connection Status
    results.push({
      name: 'Wallet Connection',
      status: isConnected ? 'success' : 'warning',
      message: isConnected ? `Connected: ${accountId}` : 'Not connected',
      icon: Wallet
    });

    // Test 2: Balance Check
    if (isConnected) {
      try {
        const response = await fetch('/api/wallet/balance');
        const data = await response.json();
        results.push({
          name: 'Balance API',
          status: data.success ? 'success' : 'error',
          message: data.success ? `Balance: ${data.balance.hbars} HBAR` : data.error,
          icon: Database
        });
      } catch (error) {
        results.push({
          name: 'Balance API',
          status: 'error',
          message: 'Failed to fetch balance',
          icon: Database
        });
      }
    }

    // Test 3: Agent Service Status
    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test connection' })
      });
      const data = await response.json();
      results.push({
        name: 'Agent Service',
        status: response.ok ? 'success' : 'warning',
        message: response.ok ? 'Agent service ready' : 'Agent service not configured',
        icon: Bot
      });
    } catch (error) {
      results.push({
        name: 'Agent Service',
        status: 'error',
        message: 'Failed to connect to agent service',
        icon: Bot
      });
    }

    // Test 4: HCS Topic Creation (Mock)
    results.push({
      name: 'HCS Integration',
      status: 'info',
      message: 'Ready for topic creation',
      icon: Link
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hedera Integration Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Test the integration of Hedera WalletConnect and Agent Kit
          </p>

          {/* Connection Status */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Connection Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Wallet:</span>
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              {isConnected && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account:</span>
                    <span className="text-sm font-mono">{accountId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Balance:</span>
                    <span className="text-sm font-medium">{balance} HBAR</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Run Tests Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runTests}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 mb-8"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Integration Tests'
            )}
          </motion.button>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Test Results
              </h2>
              {testResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4" />
                          <h3 className="font-medium">{result.name}</h3>
                        </div>
                        <p className="text-sm">{result.message}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Environment Info */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Environment Configuration
            </h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Network:</span>{' '}
                <span className="font-mono">Testnet</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">WalletConnect:</span>{' '}
                <span className="font-mono">
                  {process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'Configured' : 'Demo Mode'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Agent Kit:</span>{' '}
                <span className="font-mono">v3.0.7</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}