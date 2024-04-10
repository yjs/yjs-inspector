import * as Y from "yjs";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Config, useConfig, useYDoc } from "../state";
import { ExportButton } from "./export-button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { FullScreenDropZone } from "./full-screen-drop-zone";
import { LoadButton } from "./load-button";
import { fileToYDoc } from "../utils";

export function ConfigPanel() {
  const [yDoc, setYDoc] = useYDoc();
  const { toast } = useToast();
  const [config, setConfig] = useConfig();

  return (
    <div className="flex w-64 flex-col gap-4">
      <h2 className="text-xl">Configure</h2>
      <Button
        onClick={async () => {
          yDoc.destroy();
          setYDoc(new Y.Doc());
          const handles = await window.showOpenFilePicker({
            startIn: "downloads",
          });
          const file = await handles[0].getFile();
          try {
            const newYDoc = await fileToYDoc(file);
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
      >
        Load YDoc
      </Button>

      <Select
        value={config.view}
        onValueChange={(value) => {
          setConfig({ ...config, view: value as Config["view"] });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select View" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"shared-types" satisfies Config["view"]}>
            Inspect Data
          </SelectItem>
          <SelectItem value={"ydoc" satisfies Config["view"]}>
            Inspect YDoc
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-delta"
          checked={config.showDelta}
          disabled={config.view !== "shared-types"}
          onCheckedChange={(checked) =>
            setConfig({
              ...config,
              showDelta: checked,
            })
          }
        />
        <Label htmlFor="show-delta">Show delta format for YText</Label>
      </div>

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
