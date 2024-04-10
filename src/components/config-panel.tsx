import { Config, useConfig, useYDoc } from "../state";
import { fileToYDoc } from "../utils";
import { ExportButton } from "./export-button";
import { FullScreenDropZone } from "./full-screen-drop-zone";
import { LoadButton } from "./load-button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { useToast } from "./ui/use-toast";

export function ConfigPanel() {
  const [yDoc, setYDoc] = useYDoc();
  const { toast } = useToast();
  const [config, setConfig] = useConfig();

  return (
    <div className="flex w-64 flex-col gap-4">
      <h2 className="text-xl">Configure</h2>
      <LoadButton />

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
