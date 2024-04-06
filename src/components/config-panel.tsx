import * as Y from "yjs";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useYDoc } from "../state";
import { ExportButton } from "./export-button";

export function ConfigPanel() {
  const [yDoc, setYDoc] = useYDoc();
  const { toast } = useToast();
  return (
    <div className="flex w-64 flex-col gap-2">
      <h2 className="text-xl">Configure</h2>
      <Button
        onClick={async () => {
          yDoc.destroy();
          setYDoc(new Y.Doc());
          const handles = await window.showOpenFilePicker({
            startIn: "downloads",
          });
          const file = await handles[0].getFile();
          // TODO handle base64 encoding
          // https://docs.yjs.dev/api/document-updates#example-base64-encoding
          const yDocUpdate = new Uint8Array(await file.arrayBuffer());
          const newYDoc = new Y.Doc();
          try {
            Y.logUpdate(yDocUpdate);
            Y.applyUpdate(newYDoc, yDocUpdate);
            setYDoc(newYDoc);
            console.log(newYDoc);
          } catch (error) {
            console.error(error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load YDoc",
            });
          }
        }}
      >
        {yDoc ? "Reselect YDoc" : "Select YDoc"}
      </Button>

      <ExportButton />
    </div>
  );
}
