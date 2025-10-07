import { NextResponse } from 'next/server';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';
const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'http://localhost:26657';

/**
 * Debug endpoint to test various blockchain queries
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    endpoints: {
      rpc: BLOCKCHAIN_RPC,
      api: BLOCKCHAIN_API,
    },
    tests: {},
  };

  // Test 1: RPC Status
  try {
    const statusResponse = await fetch(`${BLOCKCHAIN_RPC}/status`);
    results.tests.rpcStatus = {
      success: statusResponse.ok,
      status: statusResponse.status,
    };
    if (statusResponse.ok) {
      const data = await statusResponse.json();
      results.tests.rpcStatus.latestHeight = data.result?.sync_info?.latest_block_height;
      results.tests.rpcStatus.chainId = data.result?.node_info?.network;
    }
  } catch (error) {
    results.tests.rpcStatus = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 2: Get latest block
  try {
    const blockResponse = await fetch(`${BLOCKCHAIN_RPC}/block`);
    results.tests.latestBlock = {
      success: blockResponse.ok,
      status: blockResponse.status,
    };
    if (blockResponse.ok) {
      const data = await blockResponse.json();
      results.tests.latestBlock.height = data.result?.block?.header?.height;
      results.tests.latestBlock.txCount = data.result?.block?.data?.txs?.length || 0;
      results.tests.latestBlock.hasTxs = (data.result?.block?.data?.txs?.length || 0) > 0;
    }
  } catch (error) {
    results.tests.latestBlock = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 3: Query transactions via REST API
  try {
    const txsResponse = await fetch(`${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs?pagination.limit=5`);
    results.tests.restApiTxs = {
      success: txsResponse.ok,
      status: txsResponse.status,
    };
    if (txsResponse.ok) {
      const data = await txsResponse.json();
      results.tests.restApiTxs.txCount = data.tx_responses?.length || 0;
      results.tests.restApiTxs.total = data.pagination?.total || 0;
      results.tests.restApiTxs.hasTxs = (data.tx_responses?.length || 0) > 0;
      if (data.tx_responses?.length > 0) {
        results.tests.restApiTxs.sampleTx = {
          hash: data.tx_responses[0].txhash,
          height: data.tx_responses[0].height,
        };
      }
    } else {
      const errorText = await txsResponse.text();
      results.tests.restApiTxs.errorBody = errorText.substring(0, 200);
    }
  } catch (error) {
    results.tests.restApiTxs = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 4: Query transactions by event (tx.height)
  try {
    const latestHeight = results.tests.rpcStatus?.latestHeight || 100;
    const eventQuery = `tx.height=${latestHeight}`;
    const eventResponse = await fetch(
      `${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs?events=${encodeURIComponent(eventQuery)}`
    );
    results.tests.eventQueryTxs = {
      success: eventResponse.ok,
      status: eventResponse.status,
      query: eventQuery,
    };
    if (eventResponse.ok) {
      const data = await eventResponse.json();
      results.tests.eventQueryTxs.txCount = data.tx_responses?.length || 0;
      results.tests.eventQueryTxs.hasTxs = (data.tx_responses?.length || 0) > 0;
    }
  } catch (error) {
    results.tests.eventQueryTxs = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Test 5: Check if there are any transactions in recent blocks
  try {
    const latestHeight = results.tests.rpcStatus?.latestHeight || 100;
    let txFoundInBlocks = false;
    let blockWithTx = null;

    for (let h = latestHeight; h > Math.max(1, latestHeight - 20); h--) {
      const blockResponse = await fetch(`${BLOCKCHAIN_RPC}/block?height=${h}`);
      if (blockResponse.ok) {
        const blockData = await blockResponse.json();
        const txCount = blockData.result?.block?.data?.txs?.length || 0;
        if (txCount > 0) {
          txFoundInBlocks = true;
          blockWithTx = h;
          break;
        }
      }
    }

    results.tests.recentBlockScan = {
      success: true,
      blocksScanned: 20,
      txFoundInBlocks,
      blockWithTx,
    };
  } catch (error) {
    results.tests.recentBlockScan = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Summary
  results.summary = {
    rpcWorking: results.tests.rpcStatus?.success || false,
    restApiWorking: results.tests.restApiTxs?.success || false,
    txIndexWorking: (results.tests.restApiTxs?.hasTxs || false) || (results.tests.eventQueryTxs?.hasTxs || false),
    txsExistInBlocks: results.tests.recentBlockScan?.txFoundInBlocks || false,
    recommendation: '',
  };

  if (!results.summary.rpcWorking) {
    results.summary.recommendation = 'RPC endpoint is not accessible. Check BLOCKCHAIN_NODE env variable.';
  } else if (!results.summary.restApiWorking) {
    results.summary.recommendation = 'REST API endpoint is not accessible. Check BLOCKCHAIN_API env variable.';
  } else if (!results.summary.txsExistInBlocks) {
    results.summary.recommendation = 'No transactions found in recent blocks. The chain might be new or idle.';
  } else if (!results.summary.txIndexWorking) {
    results.summary.recommendation = 'Transactions exist but indexing is not working. Use block scanning method.';
  } else {
    results.summary.recommendation = 'Everything looks good! Transactions should be visible.';
  }

  return NextResponse.json(results, { status: 200 });
}

export const dynamic = 'force-dynamic';
