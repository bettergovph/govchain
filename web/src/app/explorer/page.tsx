'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  Box,
  TrendingUp,
  Users,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Hash,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BlockchainStats {
  latestHeight: number;
  totalTransactions: number;
  chainId: string;
  validators: number;
  totalValidators: number;
  peerCount: number;
  blockTime: number;
  source?: string;
  uniqueAgencies?: number;
  uniqueCategories?: number;
  validatorDetails?: ValidatorInfo[];
}

interface ValidatorInfo {
  id: string;
  moniker: string;
  network: string;
  version: string;
  remote_ip: string;
  is_outbound: boolean;
  connection_status: any;
}

interface Transaction {
  txhash: string;
  height: string;
  code: number;
  timestamp: string;
  tx: {
    body: {
      messages: any[];
      memo: string;
    };
  };
  gas_used: string;
  gas_wanted: string;
}

interface Block {
  block: {
    header: {
      height: string;
      time: string;
      proposer_address: string;
    };
    data: {
      txs: string[];
    };
  };
  block_id: {
    hash: string;
  };
}

export default function ExplorerPage() {
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchBlocks();

    // Auto-refresh every 5 seconds for more real-time stats
    const interval = setInterval(() => {
      fetchStats();
      if (activeTab === 'transactions') {
        fetchTransactions();
      } else if (activeTab === 'blocks') {
        fetchBlocks();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, currentPage]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/explorer/stats');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Explorer stats received:', {
          totalTransactions: data.totalTransactions,
          source: data.source,
          uniqueAgencies: data.uniqueAgencies,
          uniqueCategories: data.uniqueCategories,
          rawData: data // Log full data for debugging
        });
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/explorer/transactions?page=${currentPage}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        console.log('Transaction data received:', data);
        console.log('Source:', data.source);
        console.log('Transaction count:', data.transactions?.length || 0);
        setTransactions(data.transactions || []);
      } else {
        console.error('Failed to fetch transactions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/explorer/blocks?page=${currentPage}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setBlocks(data.blocks || []);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Try to search for transaction hash or block height
    if (/^\d+$/.test(searchQuery)) {
      // It's a number, search for block
      setActiveTab('blocks');
      try {
        const response = await fetch(`/api/explorer/blocks?height=${searchQuery}`);
        if (response.ok) {
          const data = await response.json();
          setBlocks(data.blocks || []);
        }
      } catch (error) {
        console.error('Error searching block:', error);
      }
    } else {
      // It's a hash, redirect to transaction detail page
      window.location.href = `/explorer/tx/${searchQuery.trim()}`;
    }
  };

  const truncateHash = (hash: string, length = 8) => {
    if (!hash) return '';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };

  const getMessageType = (msg: any) => {
    if (!msg['@type']) return 'Unknown';
    const parts = msg['@type'].split('.');
    const msgType = parts[parts.length - 1].replace('Msg', '');

    // For dataset entries, show more descriptive type
    if (msgType === 'CreateEntry') {
      return 'Dataset Entry';
    }

    return msgType;
  };

  const getEntryTitle = (tx: Transaction) => {
    // If this is from entry data, show the title
    if ((tx as any).entry_data?.title) {
      return (tx as any).entry_data.title;
    }

    // Try to extract from message
    const msg = tx.tx?.body?.messages?.[0];
    if (msg?.title) {
      return msg.title;
    }

    return null;
  };

  const getEntryAgency = (tx: Transaction) => {
    // If this is from entry data, show the agency
    if ((tx as any).entry_data?.agency) {
      return (tx as any).entry_data.agency;
    }

    // Try to extract from message
    const msg = tx.tx?.body?.messages?.[0];
    if (msg?.agency) {
      return msg.agency;
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Blockchain Explorer
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time blockchain data and transaction monitoring
        </p>
      </div>

      {/* Search Bar */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction hash or block height..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:block">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Block</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{stats.latestHeight.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Current height</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dataset Entries</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTransactions !== undefined
                  ? stats.totalTransactions.toLocaleString()
                  : '0'
                }
              </div>
              <p className="text-xs text-muted-foreground">Total entries on chain</p>
              {stats.source && (
                <p className="text-xs text-blue-600">Source: {stats.source}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Validators (relax, this is a demo)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.validators}</div>
              <p className="text-xs text-muted-foreground">Securing the network</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chain ID</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.chainId || 'govchain'}</div>
              <p className="text-xs text-muted-foreground">Network identifier</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Transactions and Blocks */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-2xl h-auto sm:h-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="validators">Validators</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest transactions on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => {
                    const entryTitle = getEntryTitle(tx);
                    const entryAgency = getEntryAgency(tx);

                    return (
                      <Link
                        key={tx.txhash}
                        href={`/explorer/tx/${tx.txhash}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {tx.code === 0 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-mono text-sm">{truncateHash(tx.txhash)}</div>
                            {entryTitle && (
                              <div className="text-xs text-muted-foreground font-medium">
                                📄 {entryTitle}
                              </div>
                            )}
                            {entryAgency && (
                              <div className="text-xs text-blue-600">
                                🏛️ {entryAgency}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Block #{tx.height || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <Badge variant={tx.code === 0 ? 'default' : 'destructive'}>
                          {tx.code === 0 ? 'Success' : 'Failed'}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setActiveTab('transactions')}
                >
                  View All Transactions
                </Button>
              </CardContent>
            </Card>

            {/* Recent Blocks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Blocks</CardTitle>
                <CardDescription>Latest blocks produced</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blocks.slice(0, 5).map((block) => (
                    <div
                      key={block.block.header.height}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Box className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-semibold">Block #{block.block.header.height}</div>
                          <div className="text-xs text-muted-foreground">
                            {block.block.data.txs?.length || 0} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(block.block.header.time), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setActiveTab('blocks')}
                >
                  View All Blocks
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Transactions</CardTitle>
              <CardDescription>
                Dataset entries and their transaction details - showing data from
                <code className="bg-muted px-1 rounded text-sm">/govchain/datasets/v1/entry</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Tx Hash / Entry</TableHead>
                      <TableHead>Block</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.txhash} className="cursor-pointer hover:bg-accent">
                        <TableCell>
                          {tx.code === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <Link
                            href={`/explorer/tx/${tx.txhash}`}
                            className="text-primary hover:underline"
                          >
                            {truncateHash(tx.txhash)}
                          </Link>
                        </TableCell>
                        <TableCell>#{tx.height}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tx.tx?.body?.messages?.[0]
                              ? getMessageType(tx.tx.body.messages[0])
                              : 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{parseInt(tx.gas_used || '0').toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {tx.timestamp
                            ? formatDistanceToNow(new Date(tx.timestamp), {
                              addSuffix: true,
                            })
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {currentPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blocks</CardTitle>
              <CardDescription>All blocks on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Height</TableHead>
                      <TableHead>Block Hash</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Proposer</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocks.map((block) => (
                      <TableRow key={block.block.header.height}>
                        <TableCell className="font-semibold">
                          #{block.block.header.height}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {truncateHash(block.block_id.hash)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {block.block.data.txs?.length || 0} txs
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {truncateHash(block.block.header.proposer_address, 6)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(block.block.header.time), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {currentPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validators" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Network Validators
              </CardTitle>
              <CardDescription>
                Active validators and network peers securing the blockchain
                {stats && (
                  <span className="block mt-1 text-sm">
                    Total: {stats.totalValidators} validators • {stats.peerCount} connected peers
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.validatorDetails && stats.validatorDetails.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Validator</TableHead>
                        <TableHead>Node ID</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Connection</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.validatorDetails.map((validator, index) => (
                        <TableRow key={validator.id}>
                          <TableCell>
                            {validator.id === 'local-validator' ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Primary
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <Badge variant="secondary">
                                  Peer
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{validator.moniker}</div>
                              <div className="text-xs text-muted-foreground">
                                {validator.remote_ip}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {truncateHash(validator.id, 8)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{validator.network}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {validator.version}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">
                              {validator.id === 'local-validator' ? (
                                'Self'
                              ) : validator.is_outbound ? (
                                'Outbound'
                              ) : (
                                'Inbound'
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground">
                    No validator information available
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Network data is fetched from /net_info endpoint
                  </div>
                </div>
              )}

              {/* Validator Statistics */}
              {stats && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold">{stats.totalValidators}</div>
                          <div className="text-xs text-muted-foreground">Total Validators</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold">{stats.peerCount}</div>
                          <div className="text-xs text-muted-foreground">Connected Peers</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="text-2xl font-bold">~{stats.blockTime}s</div>
                          <div className="text-xs text-muted-foreground">Block Time</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
