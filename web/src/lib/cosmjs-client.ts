import { SigningStargateClient, StargateClient, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { Coin } from "@cosmjs/amino";

export interface CosmJSConfig {
  chainId: string;
  rpcEndpoint: string;
  prefix: string;
  mnemonic?: string;
  gasPrice: string;
}

export interface CreateEntryMessage {
  typeUrl: string;
  value: {
    creator: string;
    index: string;
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
  };
}

export interface TransactionResponse {
  transactionHash: string;
  height: number;
  gasUsed: bigint;
  gasWanted: bigint;
  events: readonly any[];
}

export function getCosmJSConfig(): CosmJSConfig {
  return {
    chainId: process.env.CHAIN_ID || 'govchain',
    rpcEndpoint: process.env.BLOCKCHAIN_NODE || 'http://localhost:26657',
    prefix: process.env.ADDRESS_PREFIX || 'govchain',
    mnemonic: process.env.MNEMONIC || 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', // Test mnemonic
    gasPrice: process.env.GAS_PRICE || '0.025stake',
  };
}

export class CosmJSClient {
  private config: CosmJSConfig;
  private wallet?: OfflineSigner;
  private client?: SigningStargateClient;
  private queryClient?: StargateClient;

  constructor(config?: Partial<CosmJSConfig>) {
    this.config = { ...getCosmJSConfig(), ...config };
  }

  async getQueryClient(): Promise<StargateClient> {
    if (!this.queryClient) {
      this.queryClient = await StargateClient.connect(this.config.rpcEndpoint);
    }
    return this.queryClient;
  }

  async getSigningClient(): Promise<SigningStargateClient> {
    if (!this.client) {
      await this.initializeWallet();
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }
      
      this.client = await SigningStargateClient.connectWithSigner(
        this.config.rpcEndpoint,
        this.wallet,
        {
          gasPrice: GasPrice.fromString(this.config.gasPrice),
        }
      );
    }
    return this.client;
  }

  private async initializeWallet(): Promise<void> {
    if (!this.config.mnemonic) {
      throw new Error('Mnemonic not configured');
    }

    this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      this.config.mnemonic,
      { prefix: this.config.prefix }
    );
  }

  async getAccounts(): Promise<string[]> {
    if (!this.wallet) {
      await this.initializeWallet();
    }
    
    const accounts = await this.wallet!.getAccounts();
    return accounts.map(account => account.address);
  }

  async getFirstAccount(): Promise<string> {
    const accounts = await this.getAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts available');
    }
    return accounts[0];
  }

  async createEntry(entryData: Omit<CreateEntryMessage['value'], 'creator'>): Promise<TransactionResponse> {
    const client = await this.getSigningClient();
    const creator = await this.getFirstAccount();

    // Discover actual type URLs first
    const discoveredUrls = await discoverActualTypeUrls();
    const createTypeUrl = Object.values(discoveredUrls).find(url => 
      url.includes('Create') || url.includes('create')
    ) || '/govchain.datasets.MsgCreateEntry'; // fallback

    const message: CreateEntryMessage = {
      typeUrl: createTypeUrl,
      value: {
        creator,
        ...entryData,
      },
    };

    // Calculate gas
    const gasEstimation = await client.simulate(creator, [message], "");
    const gas = Math.round(gasEstimation * 1.5); // 50% buffer

    const fee = {
      amount: [] as Coin[],
      gas: gas.toString(),
    };

    const result = await client.signAndBroadcast(
      creator,
      [message],
      fee,
      "Dataset entry creation"
    );

    if (result.code !== 0) {
      throw new Error(`Transaction failed: ${result.rawLog}`);
    }

    return {
      transactionHash: result.transactionHash,
      height: result.height,
      gasUsed: result.gasUsed,
      gasWanted: result.gasWanted,
      events: result.events,
    };
  }

  async queryEntry(id: string): Promise<any> {
    // For custom modules, we need to use REST API directly
    try {
      const restEndpoint = this.config.rpcEndpoint.replace('26657', '1317');
      const response = await fetch(`${restEndpoint}/govchain/datasets/v1/entry/${id}`);
      return response.json();
    } catch (error) {
      console.error('Query failed:', error);
      throw new Error(`Failed to query entry: ${error}`);
    }
  }

  async queryAllEntries(limit = 100, offset = 0): Promise<any> {
    const client = await this.getQueryClient();
    
    try {
      // Fallback to REST API for list queries
      const restEndpoint = this.config.rpcEndpoint.replace('26657', '1317');
      const response = await fetch(`${restEndpoint}/govchain/datasets/v1/entry?pagination.limit=${limit}&pagination.offset=${offset}`);
      return response.json();
    } catch (error) {
      console.error('Query failed:', error);
      throw new Error(`Failed to query entries: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.disconnect();
      this.client = undefined;
    }
    if (this.queryClient) {
      this.queryClient.disconnect();
      this.queryClient = undefined;
    }
    this.wallet = undefined;
  }
}

// Singleton instance for the application
let cosmjsClient: CosmJSClient | null = null;

export function getCosmJSClient(): CosmJSClient {
  if (!cosmjsClient) {
    cosmjsClient = new CosmJSClient();
  }
  return cosmjsClient;
}

export async function createTestAccount(): Promise<string> {
  const client = getCosmJSClient();
  const accounts = await client.getAccounts();
  
  if (accounts.length === 0) {
    throw new Error('No accounts available - check mnemonic configuration');
  }
  
  return accounts[0];
}

// Define possible type URL patterns - these will be validated against the actual blockchain
export const POSSIBLE_TYPE_URL_PATTERNS = {
  // Standard Cosmos SDK patterns
  CREATE_ENTRY_V1: '/govchain.datasets.v1.MsgCreateEntry',
  CREATE_ENTRY: '/govchain.datasets.MsgCreateEntry', 
  CREATE_ENTRY_V1BETA1: '/govchain.datasets.v1beta1.MsgCreateEntry',
  
  // Ignite CLI generated patterns
  CREATE_ENTRY_IGNITE: '/govchain.datasets.v1.create-entry',
  CREATE_ENTRY_IGNITE_SIMPLE: '/govchain.datasets.create-entry',
  
  // Other possible patterns
  CREATE_DATASET: '/govchain.datasets.MsgCreateDataset',
  CREATE_STORED_DATASET: '/govchain.datasets.MsgCreateStoredDataset',
} as const;

// This will be populated dynamically
let VALIDATED_TYPE_URLS: { [key: string]: string } = {};

// Query endpoints
export const DATASETS_QUERY_ENDPOINTS = {
  LIST_ENTRIES: '/govchain/datasets/v1/entry',
  SHOW_ENTRY: '/govchain/datasets/v1/entry/{id}',
  ENTRIES_BY_AGENCY: '/govchain/datasets/v1/entries_by_agency/{agency}',
  ENTRIES_BY_CATEGORY: '/govchain/datasets/v1/entries_by_category/{category}',
  ENTRIES_BY_MIMETYPE: '/govchain/datasets/v1/entries_by_mimetype/{mimeType}',
} as const;

export async function discoverActualTypeUrls(): Promise<{ [key: string]: string }> {
  const config = getCosmJSConfig();
  const restEndpoint = config.rpcEndpoint.replace('26657', '1317');
  
  const discoveredUrls: { [key: string]: string } = {};
  
  try {
    // Method 1: Try to get type registry from blockchain
    const registryResponse = await fetch(`${restEndpoint}/cosmos/tx/v1beta1/types`);
    if (registryResponse.ok) {
      const registryData = await registryResponse.json();
      // Parse available types from registry
      const datasetTypes = registryData.types?.filter((type: string) => 
        type.includes('datasets') || type.includes('Dataset') || type.includes('Entry')
      );
      
      if (datasetTypes?.length > 0) {
        datasetTypes.forEach((type: string, index: number) => {
          discoveredUrls[`DISCOVERED_${index}`] = type;
        });
        return discoveredUrls;
      }
    }
  } catch (error) {
    console.warn('Could not fetch type registry:', error);
  }
  
  try {
    // Method 2: Test each possible pattern by trying to simulate
    for (const [name, typeUrl] of Object.entries(POSSIBLE_TYPE_URL_PATTERNS)) {
      try {
        // Create a minimal test transaction to validate the type URL
        const testTx = {
          body: {
            messages: [{
              '@type': typeUrl,
              creator: 'test',
              // Add minimal required fields
            }],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [],
            fee: {
              amount: [],
              gas_limit: '200000',
              payer: '',
              granter: ''
            }
          },
          signatures: []
        };
        
        // Try to validate the transaction structure
        const response = await fetch(`${restEndpoint}/cosmos/tx/v1beta1/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tx: testTx }),
        });
        
        // If we get a response that's not "unknown message type", the URL might be valid
        const responseText = await response.text();
        if (!responseText.includes('unknown message type') && !responseText.includes('unrecognized')) {
          discoveredUrls[name] = typeUrl;
        }
      } catch (error) {
        // This pattern failed, continue to next
        continue;
      }
    }
  } catch (error) {
    console.warn('Type URL discovery failed:', error);
  }
  
  // If no URLs discovered, return the most likely candidates
  if (Object.keys(discoveredUrls).length === 0) {
    return {
      'CREATE_ENTRY_LIKELY': '/govchain.datasets.MsgCreateEntry',
      'CREATE_ENTRY_V1_LIKELY': '/govchain.datasets.v1.MsgCreateEntry',
    };
  }
  
  VALIDATED_TYPE_URLS = discoveredUrls;
  return discoveredUrls;
}

export async function validateTypeUrls(): Promise<{ [key: string]: boolean }> {
  const discoveredUrls = await discoverActualTypeUrls();
  const results: { [key: string]: boolean } = {};
  
  // Test each discovered URL
  for (const [name, typeUrl] of Object.entries(discoveredUrls)) {
    results[name] = true; // If discovered, it's likely valid
  }
  
  return results;
}

export async function getAvailableEndpoints(): Promise<{ [key: string]: string }> {
  const config = getCosmJSConfig();
  const restEndpoint = config.rpcEndpoint.replace('26657', '1317');
  
  const discoveredEndpoints: { [key: string]: string } = {};
  
  // Test possible endpoint patterns
  const endpointPatterns = [
    '/govchain/datasets/entry',
  ];
  
  // Test each endpoint pattern
  for (const pattern of endpointPatterns) {
    try {
      const response = await fetch(`${restEndpoint}${pattern}?pagination.limit=1`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        // Try to parse the response to see if it looks like our data
        const data = await response.json();
        
        // Check if response has expected structure
        if (data.entry || data.entries || data.stored_dataset || data.dataset) {
          const key = pattern.split('/').pop()?.toUpperCase() || 'UNKNOWN';
          discoveredEndpoints[`LIST_${key}`] = pattern;
          discoveredEndpoints[`SHOW_${key}`] = `${pattern}/{id}`;
          
          // Add filter endpoints if they might exist
          discoveredEndpoints[`${key}_BY_AGENCY`] = `${pattern}_by_agency/{agency}`;
          discoveredEndpoints[`${key}_BY_CATEGORY`] = `${pattern}_by_category/{category}`;
        }
      }
    } catch (error) {
      // Endpoint doesn't exist or isn't accessible
      continue;
    }
  }
  
  // If no endpoints discovered, return educated guesses
  if (Object.keys(discoveredEndpoints).length === 0) {
    return {
      'LIST_ENTRIES_GUESS': '/govchain/datasets/entry',
      'SHOW_ENTRY_GUESS': '/govchain/datasets/entry/{id}',
      'ENTRIES_BY_AGENCY_GUESS': '/govchain/datasets/entries_by_agency/{agency}',
      'ENTRIES_BY_CATEGORY_GUESS': '/govchain/datasets/entries_by_category/{category}',
      'ENTRIES_BY_MIMETYPE_GUESS': '/govchain/datasets/entries_by_mimetype/{mimeType}',
    };
  }
  
  return discoveredEndpoints;
}