import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadSection from '@/components/UploadSection';
import SearchSection from '@/components/SearchSection';
import DatasetList from '@/components/DatasetList';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            GovChain Dataset Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload, discover, and access government datasets on the blockchain
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search & Browse</TabsTrigger>
            <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
            <TabsTrigger value="datasets">All Datasets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-6">
            <SearchSection />
          </TabsContent>
          
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
