import { FileText, RotateCw } from "lucide-react";
import { useCallback, useState } from "react";
import { useYDoc } from "../state/index";
import { ExampleYDocUrl, fileToYDoc } from "../utils";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

export function EmptyState() {
  const [, setYDoc] = useYDoc();
  const [loading, setLoading] = useState(false);

  const handleLoadExample = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(ExampleYDocUrl);
      if (!resp.ok) {
        throw new Error("Failed to fetch YDoc");
      }
      const newYDoc = await fileToYDoc(new File([await resp.blob()], "ydoc"));
      setYDoc(newYDoc);
      toast({
        title: "Success",
        description: "Example document loaded successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load example document",
      });
    } finally {
      setLoading(false);
    }
  }, [setYDoc]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 rounded-lg border-2 border-dashed p-8 text-center">
      <div className="bg-muted rounded-full p-6">
        <FileText className="text-muted-foreground h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">No Yjs Document Loaded</h3>
        <p className="text-muted-foreground max-w-md">
          Import a yjs document by uploading a file or connect to online ydoc
        </p>
      </div>
      <Button onClick={handleLoadExample} size="lg" disabled={loading}>
        {loading && <RotateCw className="mr-2 h-4 w-4 animate-spin" />}
        Try Example Document
      </Button>
    </div>
  );
}
