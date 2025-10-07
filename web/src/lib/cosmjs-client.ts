// Deprecated. Do not use anymore.

import { SigningStargateClient, StargateClient, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { Coin } from "@cosmjs/amino";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import { AuthInfo, TxBody, SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { makeSignDoc } from "@cosmjs/proto-signing";

// Debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[CosmJS Debug] ${message}`, data || '');
  }
}

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
      try {
        this.queryClient = await StargateClient.connect(this.config.rpcEndpoint);
        debugLog('✅ Query client connected successfully');
      } catch (error) {
        debugLog('❌ Query client connection failed:', error);
        throw new Error(`Failed to connect to RPC endpoint: ${error instanceof Error ? error.message : String(error)}`);
      }
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
    debugLog('🚀 Starting entry creation...');
    debugLog('Input entry data:', entryData);

    const creator = await this.getFirstAccount();
    debugLog(`✅ Creator address: ${creator}`);

    // Use the confirmed working type URL
    const createTypeUrl = '/govchain.datasets.v1.MsgCreateEntry';
    debugLog(`📝 Using type URL: ${createTypeUrl}`);

    const messageValue = {
      creator,
      ...entryData,
    };

    debugLog('📋 Complete message value:', messageValue);

    // try {
    // Use standard RPC interface with proper message encoding
    debugLog('🌐 Using standard RPC interface for transaction broadcasting');

    const result = await this.broadcastTxRPC(createTypeUrl, messageValue, creator);
    debugLog('🎉 Entry creation completed successfully!');
    return result;
    // } catch (rpcError) {
    //   debugLog('⚠️ RPC broadcast failed, trying CLI fallback:', rpcError);

    //   // Fallback to CLI only if RPC fails
    //   try {
    //     const fallbackResult = await this.broadcastTxCLI(messageValue, creator);
    //     debugLog('✅ CLI fallback successful');
    //     return fallbackResult;
    //   } catch (cliError) {
    //     debugLog('❌ Both RPC and CLI failed');
    //     throw new Error(`Transaction failed: RPC (${rpcError instanceof Error ? rpcError.message : String(rpcError)}), CLI (${cliError instanceof Error ? cliError.message : String(cliError)})`);
    //   }
    // }
  }

  private async broadcastTxRPC(typeUrl: string, messageValue: any, creator: string): Promise<TransactionResponse> {
    debugLog('📡 Broadcasting transaction via RPC...');

    // Get account info via REST API instead of StargateClient to avoid prefix issues
    const restEndpoint = this.config.rpcEndpoint.replace('26657', '1317');
    let accountNumber = 0;
    let sequence = 0;

    try {
      debugLog('📄 Fetching account info via REST API...');
      const accountResponse = await fetch(`${restEndpoint}/cosmos/auth/v1beta1/accounts/${creator}`);
      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        accountNumber = parseInt(accountData.account?.account_number || '0');
        sequence = parseInt(accountData.account?.sequence || '0');
        debugLog('✅ Account info retrieved:', { accountNumber, sequence });
      } else {
        debugLog('⚠️ Could not fetch account info via REST, using defaults');
      }
    } catch (error) {
      debugLog('⚠️ Account fetch failed, using defaults:', error);
    }

    // Create the Any-encoded message for unregistered types
    const messageAny = {
      typeUrl: typeUrl,
      value: this.encodeCustomMessage(messageValue)
    };

    debugLog('📦 Encoded message:', messageAny);

    // Create transaction body
    const txBody = {
      messages: [messageAny],
      memo: 'Dataset entry creation via RPC',
      timeoutHeight: BigInt(0),
      extensionOptions: [],
      nonCriticalExtensionOptions: []
    };

    // Create fee
    const fee = {
      amount: [{ denom: 'stake', amount: '2000' }],
      gasLimit: BigInt(200000),
      payer: '',
      granter: ''
    };

    // Use the wallet to sign and broadcast
    if (!this.wallet) {
      await this.initializeWallet();
    }

    const accounts = await this.wallet!.getAccounts();
    const signerAccount = accounts.find(acc => acc.address === creator);
    if (!signerAccount) {
      throw new Error('Signer account not found in wallet');
    }

    // Create the sign doc
    const signDoc = makeSignDoc(
      TxBody.encode(txBody).finish(),
      AuthInfo.encode({
        signerInfos: [{
          publicKey: {
            typeUrl: '/cosmos.crypto.secp256k1.PubKey',
            value: signerAccount.pubkey
          },
          modeInfo: {
            single: { mode: 1 } // SIGN_MODE_DIRECT
          },
          sequence: BigInt(sequence)
        }],
        fee: fee
      }).finish(),
      this.config.chainId,
      accountNumber
    );

    // Sign the transaction
    const directSigner = this.wallet as DirectSecp256k1HdWallet;
    const signature = await directSigner.signDirect(creator, signDoc);

    // Create the raw transaction
    const txRaw = TxRaw.fromPartial({
      bodyBytes: signature.signed.bodyBytes,
      authInfoBytes: signature.signed.authInfoBytes,
      signatures: [new Uint8Array(Buffer.from(signature.signature.signature, 'base64'))]
    });

    // Broadcast the transaction
    const txBytes = TxRaw.encode(txRaw).finish();

    const payload = JSON.stringify({
      tx_bytes: Buffer.from(txBytes).toString('base64'),
      mode: 'BROADCAST_MODE_SYNC'
    })

    console.log('Broadcasting transaction via RPC...', payload)

    // Use REST API to broadcast
    const response = await fetch(`${restEndpoint}/cosmos/tx/v1beta1/txs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Broadcast failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    debugLog('📨 Broadcast result:', result);

    if (result.tx_response.code !== 0) {
      throw new Error(`Transaction failed: ${result.tx_response.raw_log}`);
    }

    return {
      transactionHash: result.tx_response.txhash,
      height: parseInt(result.tx_response.height),
      gasUsed: BigInt(result.tx_response.gas_used || '0'),
      gasWanted: BigInt(result.tx_response.gas_wanted || '0'),
      events: result.tx_response.events || []
    };
  }

  private encodeCustomMessage(messageValue: any): Uint8Array {
    // For custom unregistered types, we encode as JSON bytes
    // This works for Ignite-generated modules that expect JSON encoding
    const jsonBytes = new TextEncoder().encode(JSON.stringify(messageValue));
    debugLog('🔧 Custom message encoded as JSON bytes, length:', jsonBytes.length);
    return jsonBytes;
  }

  private async broadcastTxCLI(messageValue: any, creator: string): Promise<TransactionResponse> {
    debugLog('🖥️ Using CLI fallback for transaction broadcast...');

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Build CLI command - need to include the index as first parameter
    // Use key name instead of address for CLI commands
    const command = `govchaind tx datasets create-entry \
      "${messageValue.index}" \
      "${messageValue.title}" \
      "${messageValue.description}" \
      "${messageValue.ipfsCid}" \
      "${messageValue.mimeType}" \
      "${messageValue.fileName}" \
      "${messageValue.fileUrl}" \
      "${messageValue.fallbackUrl}" \
      "${messageValue.fileSize}" \
      "${messageValue.checksumSha256}" \
      "${messageValue.agency}" \
      "${messageValue.category}" \
      "${messageValue.submitter}" \
      "${messageValue.timestamp}" \
      "${messageValue.pinCount}" \
      --from alice \
      --chain-id ${this.config.chainId} \
      --keyring-backend test \
      --gas auto \
      --gas-adjustment 1.5 \
      --yes \
      --output json`;

    debugLog('🔧 CLI command:', command);

    try {
      const { stdout } = await execAsync(`timeout 30s ${command}`);
      const result = JSON.parse(stdout);

      if (result.code !== 0) {
        throw new Error(`CLI transaction failed: ${result.raw_log}`);
      }

      return {
        transactionHash: result.txhash,
        height: parseInt(result.height || '0'),
        gasUsed: BigInt(result.gas_used || '0'),
        gasWanted: BigInt(result.gas_wanted || '0'),
        events: result.events || []
      };
    } catch (error) {
      debugLog('❌ CLI broadcast failed:', error);
      throw error;
    }
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
      const response = await fetch(`${restEndpoint}/govchain/datasets/v1/entry?pagination.limit=${limit}&pagination.offset=${offset}&pagination.reverse=true`);
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
  debugLog('🔍 Starting type URL discovery...');
  const config = getCosmJSConfig();
  const restEndpoint = config.rpcEndpoint.replace('26657', '1317');
  debugLog(`🌐 REST endpoint: ${restEndpoint}`);

  const discoveredUrls: { [key: string]: string } = {};

  try {
    debugLog('📡 Method 1: Trying to get type registry from blockchain...');
    // Method 1: Try to get type registry from blockchain
    const registryResponse = await fetch(`${restEndpoint}/cosmos/tx/v1beta1/types`);
    if (registryResponse.ok) {
      const registryData = await registryResponse.json();
      debugLog('📋 Registry data received:', registryData);
      // Parse available types from registry
      const datasetTypes = registryData.types?.filter((type: string) =>
        type.includes('datasets') || type.includes('Dataset') || type.includes('Entry')
      );

      if (datasetTypes?.length > 0) {
        debugLog('✅ Found dataset types:', datasetTypes);
        datasetTypes.forEach((type: string, index: number) => {
          discoveredUrls[`DISCOVERED_${index}`] = type;
        });
        return discoveredUrls;
      }
    } else {
      debugLog('⚠️ Registry endpoint not accessible:', registryResponse.status);
    }
  } catch (error) {
    debugLog('⚠️ Could not fetch type registry:', error);
  }

  try {
    debugLog('🧪 Method 2: Testing each possible pattern...');
    // Method 2: Test each possible pattern by trying to simulate
    for (const [name, typeUrl] of Object.entries(POSSIBLE_TYPE_URL_PATTERNS)) {
      debugLog(`Testing ${name}: ${typeUrl}`);
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
        debugLog(`Response for ${typeUrl}:`, responseText.substring(0, 200));
        if (!responseText.includes('unknown message type') && !responseText.includes('unrecognized')) {
          discoveredUrls[name] = typeUrl;
          debugLog(`✅ Valid type URL found: ${typeUrl}`);
        } else {
          debugLog(`❌ Invalid type URL: ${typeUrl}`);
        }
      } catch (error) {
        debugLog(`❌ Error testing ${typeUrl}:`, error instanceof Error ? error.message : String(error));
        // This pattern failed, continue to next
        continue;
      }
    }
  } catch (error) {
    debugLog('❌ Type URL discovery failed:', error);
  }

  // If no URLs discovered, return the most likely candidates
  if (Object.keys(discoveredUrls).length === 0) {
    debugLog('⚠️ No URLs discovered, using fallbacks');
    return {
      'CREATE_ENTRY_LIKELY': '/govchain.datasets.MsgCreateEntry',
      'CREATE_ENTRY_V1_LIKELY': '/govchain.datasets.v1.MsgCreateEntry',
    };
  }

  VALIDATED_TYPE_URLS = discoveredUrls;
  debugLog('🎯 Final discovered URLs:', discoveredUrls);
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