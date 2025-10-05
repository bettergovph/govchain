import { NextRequest, NextResponse } from 'next/server';
import { getCosmJSClient, discoverActualTypeUrls, createTestAccount } from '@/lib/cosmjs-client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get('test') || 'all';

  const results = {
    timestamp: new Date().toISOString(),
    test: test,
    status: 'starting',
    details: {} as any,
    errors: [] as string[]
  };

  try {
    const client = getCosmJSClient();

    switch (test) {
      case 'connectivity':
        results.details = await testConnectivity(client);
        break;
      
      case 'wallet':
        results.details = await testWallet(client);
        break;
      
      case 'discovery':
        results.details = await testTypeUrlDiscovery();
        break;
      
      case 'simulation':
        results.details = await testSimulation(client);
        break;
      
      case 'all':
      default:
        results.details = {
          connectivity: await testConnectivity(client),
          wallet: await testWallet(client),
          discovery: await testTypeUrlDiscovery(),
          simulation: await testSimulation(client),
        };
        break;
    }

    results.status = 'completed';
  } catch (error) {
    results.status = 'error';
    results.errors.push(error instanceof Error ? error.message : String(error));
  }

  return NextResponse.json(results, { 
    status: results.status === 'error' ? 500 : 200 
  });
}

async function testConnectivity(client: any) {
  console.log('🔍 Testing connectivity...');
  const queryClient = await client.getQueryClient();
  
  const chainId = await queryClient.getChainId();
  const height = await queryClient.getHeight();
  
  return {
    test: 'connectivity',
    passed: true,
    chainId,
    height,
    message: `Connected to chain ${chainId} at height ${height}`
  };
}

async function testWallet(client: any) {
  console.log('🔍 Testing wallet...');
  const accounts = await client.getAccounts();
  const firstAccount = accounts.length > 0 ? accounts[0] : null;
  
  return {
    test: 'wallet',
    passed: accounts.length > 0,
    accountCount: accounts.length,
    firstAccount,
    message: firstAccount ? 
      `Wallet ready with account: ${firstAccount}` : 
      'No accounts available'
  };
}

async function testTypeUrlDiscovery() {
  console.log('🔍 Testing type URL discovery...');
  const discoveredUrls = await discoverActualTypeUrls();
  
  return {
    test: 'discovery',
    passed: Object.keys(discoveredUrls).length > 0,
    discoveredUrls,
    urlCount: Object.keys(discoveredUrls).length,
    message: `Discovered ${Object.keys(discoveredUrls).length} type URLs`
  };
}

async function testSimulation(client: any) {
  console.log('🔍 Testing transaction simulation...');
  
  try {
    // First, let's try a simpler approach - just test if we can execute the CLI command
    console.log('🧪 Method 1: Testing CLI command execution...');
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    // Create a test entry using CLI to verify the command works
    const testCommand = `govchaind tx datasets create-entry \
      "Test Entry CLI" \
      "Test description from CLI" \
      "QmTestCLI123" \
      "text/plain" \
      "test-cli.txt" \
      "https://example.com/test-cli.txt" \
      "https://fallback.com/test-cli.txt" \
      "100" \
      "clitest123" \
      "test-agency" \
      "test-category" \
      "govchain19rl4cm2hmr8afy4kldpxz3fka4jguq0ah9nh3f" \
      "${Date.now()}" \
      "0" \
      --from govchain19rl4cm2hmr8afy4kldpxz3fka4jguq0ah9nh3f \
      --chain-id govchain \
      --keyring-backend test \
      --dry-run \
      --output json`;
    
    try {
      const { stdout, stderr } = await execAsync(testCommand);
      console.log('✅ CLI command dry-run successful:', stdout);
      
      return {
        test: 'simulation',
        passed: true,
        method: 'cli-dry-run',
        message: 'CLI command dry-run successful - CosmJS simulation skipped due to unregistered type',
        cliOutput: stdout,
        cliError: stderr
      };
    } catch (cliError) {
      console.log('❌ CLI command failed:', cliError);
      
      // Fall back to CosmJS simulation test
      return await testCosmJSSimulation(client);
    }
  } catch (error) {
    return {
      test: 'simulation',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Both CLI and CosmJS simulation failed'
    };
  }
}

async function testCosmJSSimulation(client: any) {
  console.log('🧪 Method 2: Testing CosmJS simulation...');
  
  try {
    const signingClient = await client.getSigningClient();
    const creator = await client.getFirstAccount();
    
    // Create a minimal test message using your confirmed type URL
    const testMessage = {
      typeUrl: '/govchain.datasets.v1.MsgCreateEntry',
      value: {
        creator: creator,
        index: 'test-' + Date.now(),
        title: 'Test Entry',
        description: 'Test description for simulation',
        ipfsCid: 'QmTestHash',
        mimeType: 'text/plain',
        fileName: 'test.txt',
        fileUrl: 'https://example.com/test.txt',
        fallbackUrl: 'https://fallback.com/test.txt',
        fileSize: '100',
        checksumSha256: 'abcd1234',
        agency: 'test-agency',
        category: 'test-category',
        submitter: creator,
        timestamp: Date.now().toString(),
        pinCount: '0',
      },
    };

    // Try to simulate the transaction
    const gasEstimation = await signingClient.simulate(creator, [testMessage], "Test simulation");
    
    return {
      test: 'simulation',
      passed: true,
      method: 'cosmjs',
      gasEstimation,
      message: `CosmJS simulation successful. Gas needed: ${gasEstimation}`,
      testMessage: {
        typeUrl: testMessage.typeUrl,
        creator: testMessage.value.creator,
        title: testMessage.value.title
      }
    };
  } catch (error) {
    return {
      test: 'simulation',
      passed: false,
      method: 'cosmjs',
      error: error instanceof Error ? error.message : String(error),
      message: 'CosmJS simulation failed - this indicates type URL or message structure issues'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-test-entry':
        return await handleTestEntryCreation(data);
      
      case 'validate-message':
        return await handleMessageValidation(data);
      
      case 'test-rpc-broadcast':
        return await handleRPCBroadcastTest(data);
      
      default:
        return NextResponse.json(
          { error: 'Unknown action', availableActions: ['create-test-entry', 'validate-message', 'test-rpc-broadcast'] },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

async function handleTestEntryCreation(data: any) {
  console.log('🧪 Creating test entry...');
  
  const client = getCosmJSClient();
  
  const testEntryData = {
    index: `test-entry-${Date.now()}`,
    title: data?.title || 'Test Entry from API',
    description: data?.description || 'Test description created via API',
    ipfsCid: data?.ipfsCid || 'QmTestHash123',
    mimeType: data?.mimeType || 'application/json',
    fileName: data?.fileName || 'test-api.json',
    fileUrl: data?.fileUrl || 'https://example.com/test-api.json',
    fallbackUrl: data?.fallbackUrl || 'https://fallback.com/test-api.json',
    fileSize: (data?.fileSize || 500).toString(),
    checksumSha256: data?.checksumSha256 || 'def567890abcdef',
    agency: data?.agency || 'test-api-agency',
    category: data?.category || 'test-api-category',
    submitter: '', // Will be set by createEntry
    timestamp: Date.now().toString(),
    pinCount: '0',
  };

  try {
    const result = await client.createEntry(testEntryData);
    
    return NextResponse.json({
      success: true,
      message: 'Test entry created successfully!',
      result: {
        transactionHash: result.transactionHash,
        height: result.height,
        gasUsed: result.gasUsed.toString(),
        gasWanted: result.gasWanted.toString()
      },
      testData: testEntryData
    });
  } catch (error) {
    console.error('Test entry creation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      testData: testEntryData
    }, { status: 500 });
  }
}

async function handleMessageValidation(data: any) {
  console.log('🔍 Validating message structure...');
  
  try {
    const client = getCosmJSClient();
    const creator = await client.getFirstAccount();
    
    const message = {
      typeUrl: data.typeUrl || '/govchain.datasets.v1.MsgCreateEntry',
      value: {
        creator: creator,
        index: data.index || `validate-${Date.now()}`,
        title: data.title || 'Validation Test',
        description: data.description || 'Message validation test',
        ipfsCid: data.ipfsCid || 'QmValidateHash',
        mimeType: data.mimeType || 'text/plain',
        fileName: data.fileName || 'validate.txt',
        fileUrl: data.fileUrl || 'https://example.com/validate.txt',
        fallbackUrl: data.fallbackUrl || 'https://fallback.com/validate.txt',
        fileSize: (data.fileSize || 100).toString(),
        checksumSha256: data.checksumSha256 || 'validate123',
        agency: data.agency || 'validate-agency',
        category: data.category || 'validate-category',
        submitter: creator,
        timestamp: Date.now().toString(),
        pinCount: '0',
      },
    };

    // Try to validate without broadcasting
    const signingClient = await client.getSigningClient();
    const gasEstimation = await signingClient.simulate(creator, [message], "Validation test");
    
    return NextResponse.json({
      valid: true,
      message: 'Message structure is valid',
      gasEstimation,
      validatedMessage: message
    });
  } catch (error) {
    return NextResponse.json({
      valid: false,
      error: error instanceof Error ? error.message : String(error),
      suggestion: 'Check type URL and message field structure'
    }, { status: 400 });
  }
}

async function handleRPCBroadcastTest(data: any) {
  console.log('🚀 Testing RPC broadcast method...');
  
  const client = getCosmJSClient();
  
  const testEntryData = {
    index: `rpc-test-${Date.now()}`,
    title: data?.title || 'RPC Test Entry',
    description: data?.description || 'Testing direct RPC broadcast',
    ipfsCid: data?.ipfsCid || 'QmRPCTest123',
    mimeType: data?.mimeType || 'text/plain',
    fileName: data?.fileName || 'rpc-test.txt',
    fileUrl: data?.fileUrl || 'https://example.com/rpc-test.txt',
    fallbackUrl: data?.fallbackUrl || 'https://fallback.com/rpc-test.txt',
    fileSize: (data?.fileSize || 200).toString(),
    checksumSha256: data?.checksumSha256 || 'rpctest456',
    agency: data?.agency || 'rpc-test-agency',
    category: data?.category || 'rpc-test-category',
    submitter: '', // Will be set by createEntry
    timestamp: Date.now().toString(),
    pinCount: '0',
  };

  try {
    console.log('📡 Attempting RPC broadcast...');
    const result = await client.createEntry(testEntryData);
    
    return NextResponse.json({
      success: true,
      method: 'rpc',
      message: 'RPC broadcast successful!',
      result: {
        transactionHash: result.transactionHash,
        height: result.height,
        gasUsed: result.gasUsed.toString(),
        gasWanted: result.gasWanted.toString()
      },
      testData: testEntryData
    });
  } catch (error) {
    console.error('RPC broadcast test failed:', error);
    
    // Check if it was an RPC failure that fell back to CLI
    const errorMessage = error instanceof Error ? error.message : String(error);
    const usedFallback = errorMessage.includes('CLI fallback');
    
    return NextResponse.json({
      success: false,
      method: usedFallback ? 'cli-fallback' : 'rpc',
      error: errorMessage,
      testData: testEntryData,
      note: usedFallback ? 'RPC failed but CLI fallback may have been attempted' : 'Pure RPC failure'
    }, { status: 500 });
  }
}