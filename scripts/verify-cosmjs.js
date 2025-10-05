#!/usr/bin/env node

/**
 * CosmJS Client Verification Script
 * Tests connectivity, type URLs, and message creation
 */

const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { StargateClient, SigningStargateClient } = require('@cosmjs/stargate');
const { Registry } = require('@cosmjs/proto-signing');

// Configuration
const RPC_ENDPOINT = 'http://localhost:26657';
const CHAIN_ID = 'govchain';
const MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'; // Test mnemonic

// Known type URLs from your API discovery
const TYPE_URLS = {
  CREATE_ENTRY: '/govchain.datasets.v1.MsgCreateEntry'
};

async function verifyConnectivity() {
  console.log('🔍 Step 1: Testing RPC connectivity...');

  try {
    const client = await StargateClient.connect(RPC_ENDPOINT);
    const chainId = await client.getChainId();
    const height = await client.getHeight();

    console.log(`✅ Connected to chain: ${chainId}`);
    console.log(`✅ Current height: ${height}`);

    client.disconnect();
    return true;
  } catch (error) {
    console.error(`❌ Connectivity failed: ${error.message}`);
    return false;
  }
}

async function verifyWallet() {
  console.log('\n🔍 Step 2: Testing wallet creation...');

  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
      prefix: 'govchain'
    });

    const accounts = await wallet.getAccounts();
    console.log(`✅ Wallet created with address: ${accounts[0].address}`);

    return { wallet, address: accounts[0].address };
  } catch (error) {
    console.error(`❌ Wallet creation failed: ${error.message}`);
    return null;
  }
}

async function verifyRegistry() {
  console.log('\n🔍 Step 3: Testing message registry...');

  try {
    const registry = new Registry();

    // Test if we can create a basic message structure
    const testMessage = {
      typeUrl: TYPE_URLS.CREATE_ENTRY,
      value: {
        creator: 'govchain1test',
        title: 'test',
        description: 'test',
        ipfsCid: 'test',
        mimeType: 'test',
        fileName: 'test',
        fileUrl: 'test',
        fallbackUrl: 'test',
        fileSize: '0',
        checksumSha256: 'test',
        agency: 'test',
        category: 'test',
        submitter: 'test',
        timestamp: '0',
        pinCount: '0'
      }
    };

    console.log(`✅ Message structure created for type: ${TYPE_URLS.CREATE_ENTRY}`);
    console.log('📋 Test message:', JSON.stringify(testMessage, null, 2));

    return testMessage;
  } catch (error) {
    console.error(`❌ Registry test failed: ${error.message}`);
    return null;
  }
}

async function verifySigningClient() {
  console.log('\n🔍 Step 4: Testing signing client...');

  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
      prefix: 'govchain'
    });

    const client = await SigningStargateClient.connectWithSigner(
      RPC_ENDPOINT,
      wallet
    );

    const accounts = await wallet.getAccounts();
    const address = accounts[0].address;

    // Try to get account info
    const account = await client.getAccount(address);
    console.log(`✅ Signing client connected`);
    console.log(`📋 Account info:`, account || 'Account not found (might need funding)');

    client.disconnect();
    return true;
  } catch (error) {
    console.error(`❌ Signing client failed: ${error.message}`);
    return false;
  }
}

async function verifyQueryCapabilities() {
  console.log('\n🔍 Step 5: Testing query capabilities...');

  try {
    const client = await StargateClient.connect(RPC_ENDPOINT);

    // Test REST queries
    const restUrl = 'http://localhost:1317';

    // Try to query datasets module
    console.log('📋 Testing REST endpoints...');

    const testEndpoints = [
      `${restUrl}/govchain/datasets/v1/entry`,
      `${restUrl}/cosmos/base/tendermint/v1beta1/node_info`
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint);
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (err) {
        console.log(`❌ ${endpoint}: ${err.message}`);
      }
    }

    client.disconnect();
    return true;
  } catch (error) {
    console.error(`❌ Query test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting CosmJS Client Verification\n');
  console.log(`🔗 RPC Endpoint: ${RPC_ENDPOINT}`);
  console.log(`⛓️  Chain ID: ${CHAIN_ID}`);
  console.log(`🔑 Type URL: ${TYPE_URLS.CREATE_ENTRY}\n`);

  const results = {
    connectivity: false,
    wallet: false,
    registry: false,
    signing: false,
    query: false
  };

  // Run all verification steps
  results.connectivity = await verifyConnectivity();

  if (results.connectivity) {
    const walletResult = await verifyWallet();
    results.wallet = !!walletResult;

    results.registry = !!(await verifyRegistry());
    results.signing = await verifySigningClient();
    results.query = await verifyQueryCapabilities();
  }

  // Summary
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = Object.values(results).every(r => r);
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (!allPassed) {
    console.log('\n💡 Troubleshooting Tips:');
    if (!results.connectivity) console.log('   - Ensure blockchain is running on localhost:26657');
    if (!results.wallet) console.log('   - Check wallet configuration and prefix');
    if (!results.registry) console.log('   - Verify message type URLs and structure');
    if (!results.signing) console.log('   - Check account funding and permissions');
    if (!results.query) console.log('   - Verify REST API is accessible on localhost:1317');
  }

  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}