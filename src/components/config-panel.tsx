import { Redo, Undo } from "lucide-react";
import { useConfig, useUndoManager, useYDoc } from "../state";
import { fileToYDoc } from "../utils";
import { ConnectButton } from "./connect-button";
import { ExportButton } from "./export-button";
import { FilterButton } from "./filter-button";
import { FullScreenDropZone } from "./full-screen-drop-zone";
import { LoadButton } from "./load-button";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useToast } from "./ui/use-toast";

export function ConfigPanel() {
  const [yDoc, setYDoc] = useYDoc();
  const { toast } = useToast();
  const [config, setConfig] = useConfig();
  const { undoManager, canRedo, canUndo, undoStackSize, redoStackSize } =
    useUndoManager();

  return (
    <div className="flex w-64 flex-col gap-4">
      <h2 className="text-xl">Configure</h2>
      <LoadButton />
      <ConnectButton />

      <div className="flex items-center space-x-2">
        <Switch
          id="parse-y-doc-switch"
          checked={config.parseYDoc}
          onCheckedChange={(checked) =>
            setConfig({
              ...config,
              parseYDoc: checked,
            })
          }
        />
        <Label htmlFor="parse-y-doc-switch">Parse YDoc</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-delta"
          checked={config.showDelta}
          disabled={!config.parseYDoc}
          onCheckedChange={(checked) =>
            setConfig({
              ...config,
              showDelta: checked,
            })
          }
        />
        <Label htmlFor="show-delta">Show delta format for YText</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-size"
          checked={config.showSize}
          onCheckedChange={(checked) =>
            setConfig({
              ...config,
              showSize: checked,
            })
          }
        />
        <Label htmlFor="show-size">Show item size</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="editable-switch"
          disabled={!config.parseYDoc}
          checked={config.editable}
          onCheckedChange={(checked) =>
            setConfig({
              ...config,
              editable: checked,
            })
          }
        />
        <Label htmlFor="editable-switch">Editable</Label>
      </div>

      {config.editable && (
        <div className="flex items-center space-x-2">
          <Button
            className="flex-1"
            variant="outline"
            disabled={!canUndo}
            onClick={() => {
              if (!undoManager.canUndo()) {
                console.warn("Cannot undo", undoManager);
                return;
              }
              undoManager.undo();
            }}
          >
            <Undo className="mr-2 h-4 w-4" />
            Undo({undoStackSize})
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            disabled={!canRedo}
            onClick={() => {
              if (!undoManager.canRedo()) {
                console.warn("Cannot redo", undoManager);
                return;
              }
              undoManager.redo();
            }}
          >
            <Redo className="mr-2 h-4 w-4" />
            Redo({redoStackSize})
          </Button>
        </div>
      )}
      <FilterButton />

      <ExportButton />

      <FullScreenDropZone
        text="Drop YDoc file to load"
        onDrop={async (fileList) => {
          if (!fileList.length) {
            console.error("No files dropped");
            return;
          }
          if (fileList.length > 1) {
            console.warn(
              "Multiple files dropped, only the first file will be loaded",
            );
          }
          const file = fileList[0];
          try {
            const newYDoc = await fileToYDoc(file);
            yDoc.destroy();
            setYDoc(newYDoc);
          } catch (error) {
            console.error(error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load YDoc",
            });
          }
        }}
      />
    </div>
  );
}
