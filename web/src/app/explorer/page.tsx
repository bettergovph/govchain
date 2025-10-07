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
  blockTime: number;
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

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchStats();
      if (activeTab === 'transactions') {
        fetchTransactions();
      } else if (activeTab === 'blocks') {
        fetchBlocks();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab, currentPage]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/explorer/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
      // It's a hash, search for transaction
      setActiveTab('transactions');
      // In a real implementation, you'd have a specific endpoint for this
      alert('Transaction hash search coming soon!');
    }
  };

  const truncateHash = (hash: string, length = 8) => {
    if (!hash) return '';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };

  const getMessageType = (msg: any) => {
    if (!msg['@type']) return 'Unknown';
    const parts = msg['@type'].split('.');
    return parts[parts.length - 1].replace('Msg', '');
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
      <Card>
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
              <Search className="h-4 w-4 mr-2" />
              Search
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
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Validators</CardTitle>
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
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
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
                  {transactions.slice(0, 5).map((tx) => (
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
                          <div className="text-xs text-muted-foreground">
                            Block #{tx.height}
                          </div>
                        </div>
                      </div>
                      <Badge variant={tx.code === 0 ? 'default' : 'destructive'}>
                        {tx.code === 0 ? 'Success' : 'Failed'}
                      </Badge>
                    </Link>
                  ))}
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
              <CardTitle>Transactions</CardTitle>
              <CardDescription>All transactions on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No transactions found</div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Tx Hash</TableHead>
                          <TableHead>Block</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Gas Used</TableHead>
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
                </>
              )}
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
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : blocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No blocks found</div>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
