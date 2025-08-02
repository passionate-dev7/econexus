import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';
import { 
  HederaLangchainToolkit,
  coreAccountPlugin,
  coreHTSPlugin,
  coreConsensusPlugin,
  coreQueriesPlugin,
  AgentMode
} from 'hedera-agent-kit';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

/**
 * Hedera Agent Service for EcoNexus
 * Integrates Hedera Agent Kit for AI-powered blockchain interactions
 */
export class HederaAgentService {
  private client: Client;
  private toolkit?: HederaLangchainToolkit;
  private executor?: AgentExecutor;
  private llm?: ChatOpenAI;

  constructor() {
    // Initialize Hedera client
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    this.client = network === 'mainnet' 
      ? Client.forMainnet() 
      : Client.forTestnet();

    // Set operator if available
    if (process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY) {
      const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
      const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_OPERATOR_KEY);
      this.client.setOperator(operatorId, operatorKey);
    }

    this.initializeAgent();
  }

  /**
   * Initialize the Hedera Langchain toolkit
   */
  private async initializeAgent() {
    try {
      // Initialize Langchain toolkit for AI interactions
      this.toolkit = new HederaLangchainToolkit({
        client: this.client,
        configuration: {
          plugins: [
            coreAccountPlugin,
            coreHTSPlugin,
            coreConsensusPlugin,
            coreQueriesPlugin
          ],
          context: {
            mode: AgentMode.AUTONOMOUS,
            accountId: process.env.HEDERA_OPERATOR_ID
          }
        }
      });

      // Initialize LLM if OpenAI key is available
      if (process.env.OPENAI_API_KEY) {
        this.llm = new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: 'gpt-4o-mini',
          temperature: 0.3,
        });

        // Create AI agent executor
        const prompt = ChatPromptTemplate.fromMessages([
          ['system', 'You are an EcoNexus assistant helping with environmental credit management and Hedera blockchain operations.'],
          ['placeholder', '{chat_history}'],
          ['human', '{input}'],
          ['placeholder', '{agent_scratchpad}'],
        ]);

        const tools = this.toolkit.getTools();
        const agent = createToolCallingAgent({
          llm: this.llm,
          tools,
          prompt,
        });

        this.executor = new AgentExecutor({
          agent,
          tools,
          verbose: true,
        });
      }

      console.log('Hedera Agent Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hedera Agent Service:', error);
    }
  }

  /**
   * Create environmental credit token
   */
  async createCreditToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
    maxSupply: number;
    metadata: {
      creditType: 'carbon' | 'biodiversity' | 'water' | 'soil';
      vintageYear: number;
      zoneId: string;
      methodology: string;
    };
  }): Promise<{ tokenId: string; transactionId: string }> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      // Use toolkit to create fungible token
      const tools = this.toolkit.getTools();
      const createTokenTool = tools.find(t => t.name === 'create_fungible_token');
      if (!createTokenTool) {
        throw new Error('Create token tool not found');
      }
      
      const result = await createTokenTool.invoke({
        name: params.name,
        symbol: params.symbol,
        decimals: params.decimals,
        initialSupply: params.initialSupply,
        maxSupply: params.maxSupply,
        memo: JSON.stringify(params.metadata)
      });

      return {
        tokenId: result.tokenId,
        transactionId: result.transactionId
      };
    } catch (error) {
      console.error('Failed to create credit token:', error);
      throw error;
    }
  }

  /**
   * Create HCS topic for zone monitoring
   */
  async createMonitoringTopic(params: {
    memo: string;
    adminKey?: string;
    submitKey?: string;
  }): Promise<{ topicId: string; transactionId: string }> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      const tools = this.toolkit.getTools();
      const createTopicTool = tools.find(t => t.name === 'create_topic');
      if (!createTopicTool) {
        throw new Error('Create topic tool not found');
      }
      
      const result = await createTopicTool.invoke({
        memo: params.memo,
        adminKey: params.adminKey,
        submitKey: params.submitKey
      });

      return {
        topicId: result.topicId,
        transactionId: result.transactionId
      };
    } catch (error) {
      console.error('Failed to create monitoring topic:', error);
      throw error;
    }
  }

  /**
   * Submit monitoring data to HCS topic
   */
  async submitMonitoringData(params: {
    topicId: string;
    message: any;
  }): Promise<{ sequenceNumber: string; transactionId: string }> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      const tools = this.toolkit.getTools();
      const submitMessageTool = tools.find(t => t.name === 'submit_topic_message');
      if (!submitMessageTool) {
        throw new Error('Submit message tool not found');
      }
      
      const result = await submitMessageTool.invoke({
        topicId: params.topicId,
        message: JSON.stringify(params.message)
      });

      return {
        sequenceNumber: result.sequenceNumber,
        transactionId: result.transactionId
      };
    } catch (error) {
      console.error('Failed to submit monitoring data:', error);
      throw error;
    }
  }

  /**
   * Transfer HBAR using agent
   */
  async transferHbar(params: {
    toAccountId: string;
    amount: number;
  }): Promise<{ transactionId: string; status: string }> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      const tools = this.toolkit.getTools();
      const transferTool = tools.find(t => t.name === 'transfer_hbar');
      if (!transferTool) {
        throw new Error('Transfer HBAR tool not found');
      }
      
      const result = await transferTool.invoke({
        toAccountId: params.toAccountId,
        amount: params.amount
      });

      return {
        transactionId: result.transactionId,
        status: result.status
      };
    } catch (error) {
      console.error('Failed to transfer HBAR:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(accountId?: string): Promise<{ hbars: string; tokens: any }> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      const tools = this.toolkit.getTools();
      const balanceTool = tools.find(t => t.name === 'get_hbar_balance');
      if (!balanceTool) {
        throw new Error('Get balance tool not found');
      }
      
      const result = await balanceTool.invoke({
        accountId: accountId || process.env.HEDERA_OPERATOR_ID
      });

      return {
        hbars: result.balance,
        tokens: result.tokens || {}
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Query account information
   */
  async getAccountInfo(accountId: string): Promise<any> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      const tools = this.toolkit.getTools();
      const accountInfoTool = tools.find(t => t.name === 'get_account_info');
      if (!accountInfoTool) {
        throw new Error('Get account info tool not found');
      }
      
      const result = await accountInfoTool.invoke({
        accountId
      });

      return result;
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  /**
   * Execute AI agent task
   */
  async executeAgentTask(prompt: string): Promise<string> {
    if (!this.executor) {
      throw new Error('AI executor not initialized');
    }

    try {
      const response = await this.executor.invoke({
        input: prompt
      });

      return response.output;
    } catch (error) {
      console.error('Failed to execute agent task:', error);
      throw error;
    }
  }

  /**
   * Create NFT for zone certification
   */
  async createZoneCertificationNFT(params: {
    name: string;
    symbol: string;
    zoneId: string;
    metadata: {
      location: { lat: number; lng: number };
      area: number;
      verificationDate: string;
      certifications: string[];
    };
  }): Promise<{ tokenId: string; transactionId: string }> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      const tools = this.toolkit.getTools();
      const createNFTTool = tools.find(t => t.name === 'create_non_fungible_token');
      if (!createNFTTool) {
        throw new Error('Create NFT tool not found');
      }
      
      const result = await createNFTTool.invoke({
        name: params.name,
        symbol: params.symbol,
        maxSupply: 1,
        memo: JSON.stringify({
          zoneId: params.zoneId,
          ...params.metadata
        })
      });

      return {
        tokenId: result.tokenId,
        transactionId: result.transactionId
      };
    } catch (error) {
      console.error('Failed to create zone NFT:', error);
      throw error;
    }
  }

  /**
   * Airdrop credits to multiple recipients
   */
  async airdropCredits(params: {
    tokenId: string;
    recipients: { accountId: string; amount: number }[];
  }): Promise<{ transactionId: string; status: string }> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      const tools = this.toolkit.getTools();
      const airdropTool = tools.find(t => t.name === 'airdrop_fungible_token');
      if (!airdropTool) {
        throw new Error('Airdrop tool not found');
      }
      
      const result = await airdropTool.invoke({
        tokenId: params.tokenId,
        senderAccountId: process.env.HEDERA_OPERATOR_ID!,
        receiverAccountIds: params.recipients.map(r => r.accountId),
        amounts: params.recipients.map(r => r.amount)
      });

      return {
        transactionId: result.transactionId,
        status: result.status
      };
    } catch (error) {
      console.error('Failed to airdrop credits:', error);
      throw error;
    }
  }

  /**
   * Get topic messages for monitoring history
   */
  async getMonitoringHistory(topicId: string, limit: number = 10): Promise<any[]> {
    if (!this.toolkit) {
      throw new Error('Toolkit not initialized');
    }

    try {
      const tools = this.toolkit.getTools();
      const topicMessagesTool = tools.find(t => t.name === 'get_topic_messages');
      if (!topicMessagesTool) {
        throw new Error('Get topic messages tool not found');
      }
      
      const result = await topicMessagesTool.invoke({
        topicId,
        limit
      });

      return result.messages.map((msg: any) => ({
        sequenceNumber: msg.sequenceNumber,
        content: JSON.parse(msg.contents),
        consensusTimestamp: msg.consensusTimestamp
      }));
    } catch (error) {
      console.error('Failed to get monitoring history:', error);
      throw error;
    }
  }

  /**
   * Get client instance
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return !!this.toolkit;
  }
}

// Singleton instance
export const hederaAgentService = new HederaAgentService();