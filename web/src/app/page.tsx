import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadSection from '@/components/UploadSection';
import DatasetList from '@/components/DatasetList';

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          GovChain Dataset Portal
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload, discover, and access government datasets on the blockchain
        </p>
      </div>

      <Tabs defaultValue="datasets" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="datasets">Browse Datasets</TabsTrigger>
          <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <UploadSection />
        </TabsContent>
        
        <TabsContent value="datasets" className="mt-6">
          <DatasetList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
