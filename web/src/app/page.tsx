import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import UploadSection from '@/components/UploadSection';
import SearchSection from '@/components/SearchSection';
import DatasetList from '@/components/DatasetList';
import { FileImage } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                GovChain Dataset Portal
              </h1>
              <p className="text-muted-foreground mt-2">
                Upload, discover, and access government datasets on the blockchain
              </p>
            </div>
            <Link href="/gallery">
              <Button variant="outline" className="gap-2">
                <FileImage className="h-4 w-4" />
                Image Gallery
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="datasets" className="w-full">
          <TabsList className="grid grid-cols-2 w-1/2">
            {/* <TabsTrigger value="search">Search</TabsTrigger> */}
            <TabsTrigger value="datasets">Browse</TabsTrigger>
            <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
          </TabsList>
          
          {/* <TabsContent value="search" className="mt-6">
            <SearchSection />
          </TabsContent> */}

          <TabsContent value="upload" className="mt-6">
            <UploadSection />
          </TabsContent>
          
          <TabsContent value="datasets" className="mt-6">
            <DatasetList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
