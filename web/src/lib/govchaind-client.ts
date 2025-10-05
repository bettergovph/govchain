import { Client } from './ts-client';
import { DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing';
import { StdFee } from '@cosmjs/stargate';

// Debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[GovChain Client] ${message}`, data || '');
  }
}

export interface GovChainConfig {
  chainId: string;
  rpcURL: string;
  apiURL: string;
  prefix: string;
  mnemonic?: string;
}

export interface CreateEntryParams {
  title: string;
  description: string;
  ipfsCid: string;
  mimeType: string;
  fileName: string;
  fileUrl: string;
  fallbackUrl: string;
  fileSize: string;
  checksumSha256: string;
  agency: string;
  category: string;
  submitter: string;
  timestamp: string;
  pinCount: string;
}

export interface TransactionResult {
  transactionHash: string;
  height: number;
  gasUsed: number;
  gasWanted: number;
  code: number;
  rawLog?: string;
}

// Default configuration for GovChain
export function getGovChainConfig(): GovChainConfig {
  return {
    chainId: process.env.CHAIN_ID || 'govchain',
    rpcURL: process.env.BLOCKCHAIN_NODE || 'http://localhost:26657',
    apiURL: process.env.BLOCKCHAIN_REST || 'http://localhost:1317',
    prefix: process.env.ADDRESS_PREFIX || 'govchain',
    mnemonic: process.env.MNEMONIC || 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', // Test mnemonic
  };
}

export class GovChainClient {
  private client: InstanceType<typeof Client>;
  private config: GovChainConfig;
  private signer?: OfflineSigner;

  constructor(config?: Partial<GovChainConfig>, signer?: OfflineSigner) {
    this.config = { ...getGovChainConfig(), ...config };
    this.signer = signer;

    // Create the Ignite client with explicit prefix configuration
    this.client = new Client(
      {
        apiURL: this.config.apiURL,
        rpcURL: this.config.rpcURL,
        prefix: this.config.prefix, // Explicitly set the custom prefix
      },
      this.signer
    );

    debugLog('GovChain client initialized', {
      chainId: this.config.chainId,
      rpcURL: this.config.rpcURL,
      apiURL: this.config.apiURL,
      prefix: this.config.prefix, // Log the prefix being used
      hasSigner: !!this.signer
    });
  }

  /**
   * Initialize with a mnemonic
   */
  static async fromMnemonic(mnemonic: string, config?: Partial<GovChainConfig>): Promise<GovChainClient> {
    const fullConfig = { ...getGovChainConfig(), ...config };

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'cosmos'// fullConfig.prefix // Ensure custom prefix is used
    });

    return new GovChainClient(fullConfig, wallet);
  }

  /**
   * Initialize from default configuration
   */
  static async fromConfig(config?: Partial<GovChainConfig>): Promise<GovChainClient> {
    const fullConfig = { ...getGovChainConfig(), ...config };

    if (fullConfig.mnemonic) {
      return GovChainClient.fromMnemonic(fullConfig.mnemonic, fullConfig);
    }

    return new GovChainClient(fullConfig);
  }

  /**
   * Get the first account address
   */
  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available. Initialize with mnemonic or provide signer.');
    }

    const accounts = await this.signer.getAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts available in signer.');
    }

    return accounts[0].address;
  }

  /**
   * Use Keplr wallet
   */
  async useKeplr(): Promise<void> {
    await this.client.useKeplr({
      chainId: this.config.chainId,
      chainName: `${this.config.chainId.toUpperCase()} Network`,
      rpc: this.config.rpcURL,
      rest: this.config.apiURL,
      // Ensure the custom prefix is properly configured
      bech32Config: {
        bech32PrefixAccAddr: this.config.prefix,
        bech32PrefixAccPub: `${this.config.prefix}pub`,
        bech32PrefixValAddr: `${this.config.prefix}valoper`,
        bech32PrefixValPub: `${this.config.prefix}valoperpub`,
        bech32PrefixConsAddr: `${this.config.prefix}valcons`,
        bech32PrefixConsPub: `${this.config.prefix}valconspub`,
      },
    });

    debugLog('Keplr wallet connected with custom prefix:', this.config.prefix);
  }

  /**
   * Create a dataset entry on the blockchain
   * Uses the correct Ignite client pattern: this.client.GovchainDatasetsV_1.tx.msgCreateEntry
   */
  async createEntry(params: CreateEntryParams, fee?: StdFee, memo?: string): Promise<TransactionResult> {
    debugLog('Creating entry with params:', params);

    if (!this.signer) {
      throw new Error('No signer available. Cannot create transactions.');
    }

    const creator = await this.getAddress();

    try {
      // Use the correct Ignite client pattern
      // Note: The actual module name will be determined once ts-client is generated
      const result = await this.client.GovchainDatasetsV_1.tx.sendMsgCreateEntry({
        value: {
          creator,
          ...params
        },
        fee: fee || {
          amount: [{ amount: '2000', denom: 'stake' }],
          gas: '200000',
        },
        memo: memo || 'Dataset entry creation via GovChain client'
      });

      debugLog('Entry creation result:', result);

      return {
        transactionHash: result.transactionHash,
        height: result.height,
        gasUsed: Number(result.gasUsed),
        gasWanted: Number(result.gasWanted),
        code: result.code,
        rawLog: result.rawLog,
      };
    } catch (error) {
      debugLog('Entry creation failed:', error);
      throw new Error(`Entry creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query an entry by ID
   */
  async queryEntry(id: string): Promise<any> {
    debugLog('Querying entry:', id);

    try {
      // Use the correct Ignite client pattern
      const result = await (this.client as any).GovchainDatasetsV_1.query.queryEntry(id);
      debugLog('Query entry result:', result);
      return result;
    } catch (error) {
      debugLog('Query entry failed:', error);
      throw new Error(`Query entry failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query all entries
   */
  async queryAllEntries(limit?: number, offset?: number): Promise<any> {
    debugLog('Querying all entries');

    try {
      // Use the correct Ignite client pattern
      const result = await (this.client as any).GovchainDatasetsV_1.query.queryAllEntry({
        pagination: {
          limit: limit || 100,
          offset: offset || 0
        }
      });
      debugLog('Query all entries result:', result);
      return result;
    } catch (error) {
      debugLog('Query all entries failed:', error);
      throw new Error(`Query all entries failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query entries by agency
   */
  async queryEntriesByAgency(agency: string): Promise<any> {
    debugLog('Querying entries by agency:', agency);

    try {
      const result = await (this.client as any).GovchainDatasetsV_1.query.queryEntriesByAgency(agency);
      debugLog('Query entries by agency result:', result);
      return result;
    } catch (error) {
      debugLog('Query entries by agency failed:', error);
      throw new Error(`Query entries by agency failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query entries by category
   */
  async queryEntriesByCategory(category: string): Promise<any> {
    debugLog('Querying entries by category:', category);

    try {
      const result = await (this.client as any).GovchainDatasetsV_1.query.queryEntriesByCategory(category);
      debugLog('Query entries by category result:', result);
      return result;
    } catch (error) {
      debugLog('Query entries by category failed:', error);
      throw new Error(`Query entries by category failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query entries by MIME type
   */
  async queryEntriesByMimeType(mimeType: string): Promise<any> {
    debugLog('Querying entries by MIME type:', mimeType);

    try {
      const result = await (this.client as any).GovchainDatasetsV_1.query.queryEntriesByMimetype(mimeType);
      debugLog('Query entries by MIME type result:', result);
      return result;
    } catch (error) {
      debugLog('Query entries by MIME type failed:', error);
      throw new Error(`Query entries by MIME type failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generic sign and broadcast method for multiple messages
   */
  async signAndBroadcast(messages: any[], fee?: StdFee, memo?: string): Promise<TransactionResult> {
    debugLog('Broadcasting multiple messages:', { count: messages.length });

    const defaultFee: StdFee = {
      amount: [{ amount: '2000', denom: 'stake' }],
      gas: '200000',
    };

    const result = await this.client.signAndBroadcast(
      messages,
      fee || defaultFee,
      memo || ''
    );

    debugLog('Transaction result:', result);

    return {
      transactionHash: result.transactionHash,
      height: result.height,
      gasUsed: Number(result.gasUsed),
      gasWanted: Number(result.gasWanted),
      code: result.code,
      rawLog: result.rawLog,
    };
  }

  /**
   * Get client configuration
   */
  getConfig(): GovChainConfig {
    return { ...this.config };
  }

  /**
   * Check if client has signing capabilities
   */
  canSign(): boolean {
    return !!this.signer;
  }
}

// Singleton instance for the application
let govChainClient: GovChainClient | null = null;

/**
 * Get or create a singleton GovChain client instance
 */
export async function getGovChainClient(): Promise<GovChainClient> {
  if (!govChainClient) {
    govChainClient = await GovChainClient.fromConfig();
  }
  return govChainClient;
}

/**
 * Create a test account for development
 */
export async function createTestAccount(): Promise<string> {
  const client = await getGovChainClient();

  if (!client.canSign()) {
    throw new Error('No signer available - check mnemonic configuration');
  }

  return client.getAddress();
}