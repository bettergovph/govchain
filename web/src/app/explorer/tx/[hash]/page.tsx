'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Hash,
  Box,
  Clock,
  Fuel,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TransactionDetail {
  tx_response: {
    txhash: string;
    height: string;
    code: number;
    timestamp: string;
    raw_log: string;
    gas_used: string;
    gas_wanted: string;
    tx: {
      body: {
        messages: any[];
        memo: string;
      };
      auth_info: {
        fee: {
          amount: any[];
          gas_limit: string;
        };
      };
    };
    events: any[];
    entry_data?: any; // Optional entry data for dataset transactions
  };
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hash) {
      fetchTransaction();
    }
  }, [hash]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);

      // First try to get the actual transaction from the blockchain
      const response = await fetch(`/api/explorer/transaction/${hash}`);

      if (response.ok) {
        const data = await response.json();
        setTransaction(data);
      } else {
        // If the transaction is not found, it might be an entry-based pseudo tx
        // Try to get it from our transaction list (which includes entry data)
        const txListResponse = await fetch('/api/explorer/transactions?limit=1000');

        if (txListResponse.ok) {
          const txListData = await txListResponse.json();
          const foundTx = txListData.transactions?.find((tx: any) => tx.txhash === hash);

          if (foundTx) {
            // Transform entry-based tx to match the expected format
            setTransaction({
              tx_response: {
                txhash: foundTx.txhash,
                height: foundTx.height,
                code: foundTx.code,
                timestamp: foundTx.timestamp,
                raw_log: foundTx.raw_log,
                gas_used: foundTx.gas_used,
                gas_wanted: foundTx.gas_wanted,
                tx: foundTx.tx,
                events: foundTx.events || [],
                entry_data: foundTx.entry_data // Include entry data for display
              }
            });
          } else {
            setTransaction(null);
          }
        } else {
          setTransaction(null);
        }
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMessageType = (msg: any) => {
    if (!msg['@type']) return 'Unknown';
    return msg['@type'];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12 text-muted-foreground">Loading transaction...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              Transaction not found
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tx = transaction.tx_response;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Hash className="h-8 w-8" />
          Transaction Details
        </h1>
        <p className="text-muted-foreground mt-2">
          View complete transaction information
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {tx.code === 0 ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  Transaction Success
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  Transaction Failed
                </>
              )}
            </CardTitle>
            <Badge variant={tx.code === 0 ? 'default' : 'destructive'} className="text-sm">
              Code: {tx.code}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Transaction Hash */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Transaction Hash</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                {tx.txhash}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(tx.txhash)}
              >
                {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Box className="h-4 w-4" />
                Block Height
              </div>
              <div className="text-lg font-semibold">#{tx.height}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timestamp
              </div>
              <div className="text-lg font-semibold">
                {tx.timestamp
                  ? formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })
                  : 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Gas Used / Wanted
              </div>
              <div className="text-lg font-semibold">
                {parseInt(tx.gas_used || '0').toLocaleString()} /{' '}
                {parseInt(tx.gas_wanted || '0').toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Memo
              </div>
              <div className="text-lg font-semibold">
                {tx.tx?.body?.memo || 'No memo'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dataset Entry Information */}
      {tx.entry_data && (
        <Card>
          <CardHeader>
            <CardTitle>Dataset Entry Details</CardTitle>
            <CardDescription>Information about the dataset entry created by this transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Title</div>
                <div className="font-semibold">{tx.entry_data.title || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Agency</div>
                <div className="font-semibold">{tx.entry_data.agency || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Category</div>
                <div className="font-semibold">{tx.entry_data.category || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">IPFS CID</div>
                <div className="font-mono text-sm">{tx.entry_data.ipfs_cid || 'N/A'}</div>
              </div>
              {tx.entry_data.description && (
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                  <div className="text-sm bg-muted p-2 rounded max-h-32 overflow-y-auto">
                    {tx.entry_data.description.length > 200
                      ? tx.entry_data.description.substring(0, 200) + '...'
                      : tx.entry_data.description}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Messages ({tx.tx?.body?.messages?.length || 0})</CardTitle>
          <CardDescription>Transaction messages and operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tx.tx?.body?.messages?.map((msg, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-sm">
                  Message #{index + 1}
                </Badge>
                <Badge>{getMessageType(msg)}</Badge>
              </div>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(msg, null, 2)}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fee Information */}
      {tx.tx?.auth_info?.fee && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Limit:</span>
                <span className="font-semibold">
                  {parseInt(tx.tx.auth_info.fee.gas_limit || '0').toLocaleString()}
                </span>
              </div>
              {tx.tx.auth_info.fee.amount?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    {tx.tx.auth_info.fee.amount.map((a: any) =>
                      `${a.amount} ${a.denom}`
                    ).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events */}
      {tx.events && tx.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Events ({tx.events.length})</CardTitle>
            <CardDescription>Transaction execution events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tx.events.map((event, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="font-semibold mb-2">{event.type}</div>
                  {event.attributes && (
                    <div className="space-y-1 text-sm">
                      {event.attributes.map((attr: any, attrIndex: number) => (
                        <div key={attrIndex} className="flex gap-2">
                          <span className="text-muted-foreground">{attr.key}:</span>
                          <span className="font-mono">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Log */}
      {tx.raw_log && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Log</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap">
              {tx.raw_log}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
