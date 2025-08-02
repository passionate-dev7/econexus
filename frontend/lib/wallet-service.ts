import { 
  HederaSessionEvent, 
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
  ExtensionData,
  DAppSigner
} from '@hashgraph/hedera-wallet-connect';
import { 
  AccountId, 
  AccountBalance,
  TransferTransaction,
  TransactionId,
  Client,
  PrivateKey
} from '@hashgraph/sdk';
import { SignClientTypes } from '@walletconnect/types';

// Wallet Connection Service for EcoNexus
export class WalletService {
  private dAppConnector: DAppConnector | null = null;
  private accountId: string | null = null;
  private signer: DAppSigner | null = null;
  private client: Client | null = null;
  private isInitialized = false;
  
  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    this.client = network === 'mainnet' 
      ? Client.forMainnet() 
      : Client.forTestnet();
  }

  /**
   * Initialize WalletConnect connection
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Get WalletConnect project ID from environment
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
      
      if (!projectId) {
        console.warn('WalletConnect Project ID not configured');
        // Use demo mode
        this.isInitialized = true;
        return;
      }

      // Initialize DApp metadata
      const metadata: SignClientTypes.Metadata = {
        name: process.env.NEXT_PUBLIC_DAPP_NAME || 'EcoNexus',
        description: process.env.NEXT_PUBLIC_DAPP_DESCRIPTION || 'Regenerative Impact Marketplace',
        url: process.env.NEXT_PUBLIC_DAPP_URL || window.location.origin,
        icons: [process.env.NEXT_PUBLIC_DAPP_ICONS || `${window.location.origin}/icon.png`]
      };

      // Create DApp connector
      this.dAppConnector = new DAppConnector(
        metadata,
        HederaChainId.Testnet,
        projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [ExtensionData.None]
      );

      // Initialize the connector
      await this.dAppConnector.init();
      
      this.isInitialized = true;
      console.log('WalletConnect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
      this.isInitialized = true; // Allow demo mode
    }
  }

  /**
   * Connect to wallet (HashPack, Blade, etc.)
   */
  async connect(): Promise<{ accountId: string; network: string }> {
    await this.init();

    // Demo mode if WalletConnect not configured
    if (!this.dAppConnector) {
      return this.connectDemoMode();
    }

    try {
      // Open modal for wallet selection
      await this.dAppConnector.openModal();
      
      // Wait for connection
      const session = await this.waitForConnection();
      
      if (!session) {
        throw new Error('No session established');
      }

      // Get account info from session
      const accountId = session.namespaces.hedera.accounts[0].split(':').pop();
      if (!accountId) {
        throw new Error('No account ID found in session');
      }

      this.accountId = accountId;
      
      // Create signer for transactions
      this.signer = this.dAppConnector.signers[0];
      
      return {
        accountId,
        network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'
      };
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  /**
   * Wait for wallet connection
   */
  private async waitForConnection(timeout = 60000): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.dAppConnector?.signers && this.dAppConnector.signers.length > 0) {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          resolve(this.dAppConnector.session);
        }
      }, 500);

      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Connection timeout'));
      }, timeout);
    });
  }

  /**
   * Demo mode connection for development
   */
  private async connectDemoMode(): Promise<{ accountId: string; network: string }> {
    // Use operator account from environment for demo
    const operatorId = process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID;
    
    if (operatorId) {
      this.accountId = operatorId;
      return {
        accountId: operatorId,
        network: 'testnet'
      };
    }

    // Generate random demo account
    const demoAccountId = `0.0.${Math.floor(Math.random() * 1000000)}`;
    this.accountId = demoAccountId;
    
    return {
      accountId: demoAccountId,
      network: 'testnet'
    };
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.dAppConnector) {
        await this.dAppConnector.disconnect();
      }
      
      this.accountId = null;
      this.signer = null;
      this.dAppConnector = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ hbars: string; tokens: any }> {
    if (!this.accountId || !this.client) {
      throw new Error('Not connected');
    }

    try {
      // Use signer if available (real wallet)
      if (this.signer) {
        const balance = await this.signer.getAccountBalance();
        return {
          hbars: balance.hbars.toString(),
          tokens: balance.tokens || {}
        };
      }

      // Fallback to direct query (demo mode)
      const accountId = AccountId.fromString(this.accountId);
      const balance = await this.client.getAccountBalance(accountId);
      
      return {
        hbars: balance.hbars.toString(),
        tokens: balance.tokens?.toString() || {}
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      // Return mock balance for demo
      return {
        hbars: '100.0',
        tokens: {}
      };
    }
  }

  /**
   * Execute transaction using connected wallet
   */
  async executeTransaction(transaction: any): Promise<string> {
    if (!this.signer) {
      throw new Error('No wallet connected');
    }

    try {
      const result = await this.signer.signTransaction(transaction);
      return result.transactionId?.toString() || '';
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Transfer HBAR
   */
  async transferHbar(toAccountId: string, amount: number): Promise<string> {
    if (!this.accountId || !this.client) {
      throw new Error('Not connected');
    }

    try {
      const transaction = new TransferTransaction()
        .addHbarTransfer(this.accountId, -amount)
        .addHbarTransfer(toAccountId, amount)
        .setTransactionId(TransactionId.generate(this.accountId));

      if (this.signer) {
        // Use wallet signer
        return await this.executeTransaction(transaction);
      } else {
        // Demo mode - simulate transaction
        console.log(`Demo: Transfer ${amount} HBAR to ${toAccountId}`);
        return `demo-tx-${Date.now()}`;
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  /**
   * Get connected account ID
   */
  getAccountId(): string | null {
    return this.accountId;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return !!this.accountId;
  }

  /**
   * Get network
   */
  getNetwork(): string {
    return process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
  }

  /**
   * Subscribe to account change events
   */
  onAccountChanged(callback: (accountId: string) => void): void {
    if (this.dAppConnector) {
      this.dAppConnector.walletConnectClient?.on('session_update', (session) => {
        const newAccountId = session.namespaces.hedera.accounts[0]?.split(':').pop();
        if (newAccountId && newAccountId !== this.accountId) {
          this.accountId = newAccountId;
          callback(newAccountId);
        }
      });
    }
  }

  /**
   * Get available extensions (HashPack, Blade, etc.)
   */
  async getAvailableExtensions(): Promise<string[]> {
    if (!this.dAppConnector) {
      return ['Demo Mode'];
    }

    try {
      const extensions = await this.dAppConnector.getExtensions();
      return extensions.map(ext => ext.name);
    } catch (error) {
      console.error('Failed to get extensions:', error);
      return [];
    }
  }
}

// Singleton instance
export const walletService = new WalletService();