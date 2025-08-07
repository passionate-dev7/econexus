'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, Copy, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface WalletContextType {
  isConnected: boolean;
  accountId: string | null;
  balance: number;
  network: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  accountId: null,
  balance: 0,
  network: 'testnet',
  connect: async () => {},
  disconnect: () => {}
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [network] = useState('testnet');

  // Check for existing connection on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('econexus_account');
    if (savedAccount) {
      setAccountId(savedAccount);
      setIsConnected(true);
      // Simulate fetching balance
      setBalance(Math.random() * 1000);
    }
  }, []);

  const connect = async () => {
    try {
      // In production, this would connect to HashPack
      // For demo, we'll simulate the connection
      
      // Check if HashPack is installed
      if (typeof window !== 'undefined' && (window as any).hashpack) {
        // Initialize HashPack connection
        const hashpack = (window as any).hashpack;
        
        // Request account access
        const response = await hashpack.connect();
        
        if (response.success) {
          setAccountId(response.accountId);
          setBalance(response.balance);
          setIsConnected(true);
          localStorage.setItem('econexus_account', response.accountId);
        }
      } else {
        // Demo mode - simulate connection
        const demoAccountId = `0.0.${Math.floor(Math.random() * 1000000)}`;
        setAccountId(demoAccountId);
        setBalance(Math.random() * 1000);
        setIsConnected(true);
        localStorage.setItem('econexus_account', demoAccountId);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAccountId(null);
    setBalance(0);
    localStorage.removeItem('econexus_account');
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      accountId,
      balance,
      network,
      connect,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletConnectButton() {
  const { isConnected, accountId, balance, network, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAccountId = (id: string) => {
    if (id.length > 12) {
      return `${id.slice(0, 6)}...${id.slice(-4)}`;
    }
    return id;
  };

  if (!isConnected) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 flex items-center gap-3 shadow-md"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <div className="text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {network === 'testnet' ? 'Testnet' : 'Mainnet'}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatAccountId(accountId!)}
          </p>
        </div>
        <div className="text-right border-l border-gray-200 dark:border-gray-700 pl-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {balance.toFixed(2)} HBAR
          </p>
        </div>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Account Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Account</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                  Connected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-gray-900 dark:text-white">
                  {accountId}
                </p>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {balance.toFixed(4)} HBAR
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                ≈ ${(balance * 0.05).toFixed(2)} USD
              </div>
            </div>

            {/* Network */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    network === 'testnet' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {network}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
              <a
                href={`https://hashscan.io/${network}/account/${accountId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  View on HashScan
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center justify-between p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
              >
                <span className="text-sm font-medium">Disconnect</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WalletRequiredGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wallet Connection Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please connect your wallet to access this feature
          </p>
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}