import { JsonViewer, Path } from "@textea/json-viewer";
import { Bug } from "lucide-react";
import { useEffect, useState } from "react";
import { yDataType } from "../data-types";
import { useConfig, useFilterMap, useIsFilterEnable, useYDoc } from "../state";
import { getYTypeFromPath, isYArray, isYDoc, isYMap } from "../y-shape";
import { AddDataDialog } from "./add-data-dialog";
import { DeleteDialog } from "./delete-dialog";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function PreviewPanel() {
  const { resolvedTheme } = useTheme();
  const [yDoc] = useYDoc();
  const [config] = useConfig();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [path, setPath] = useState<Path>([]);
  const [target, setTarget] = useState<unknown>(null);

  const filterMap = useFilterMap();
  const filterEnable = useIsFilterEnable();
  const inspectDepth = filterEnable ? 1 : 3;
  const jsonViewerValue = filterEnable ? filterMap : yDoc;

  const [, setCount] = useState(0);
  useEffect(() => {
    if (!yDoc) {
      return;
    }
    const callback = () => {
      // Force re-render
      setCount((count) => count + 1);
    };
    yDoc.on("update", callback);
    return () => {
      yDoc.off("update", callback);
    };
  }, [yDoc]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex content-center gap-4">
        <h2 className="mb-4 flex-1 text-xl">Inspect</h2>

        <Button variant="secondary" size="sm" asChild>
          <a
            href="https://github.com/yjs/yjs/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Bug className="mr-2 h-4 w-4" />
            Report issue
          </a>
        </Button>
      </div>

      <div className="flex-1 overflow-auto rounded-md">
        {/* See https://viewer.textea.io/apis */}
        <JsonViewer
          className="p-2"
          value={jsonViewerValue}
          // editable={true}
          enableAdd={(_, value) => {
            return (
              config.editable &&
              config.parseYDoc &&
              // TODO support YArray/YText
              (isYDoc(value) || isYMap(value))
            );
          }}
          onAdd={(path) => {
            const target = getYTypeFromPath(yDoc, path);
            if (!target) {
              console.error("Invalid target", path, target);
              return;
            }
            setTarget(target);
            setPath(path);
            setAddDialogOpen(true);
          }}
          enableDelete={(path) => {
            if (!config.editable || !config.parseYDoc) {
              return false;
            }
            const parent = getYTypeFromPath(yDoc, path.slice(0, -1));
            return isYMap(parent) || isYArray(parent);
          }}
          onDelete={(path, value) => {
            setTarget(value);
            setPath(path);
            setDeleteDialogOpen(true);
          }}
          displaySize={config.showSize}
          theme={resolvedTheme}
          defaultInspectDepth={inspectDepth}
          valueTypes={[yDataType]}
        />
      </div>
      <AddDataDialog
        target={target}
        path={path}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
      <DeleteDialog
        value={target}
        path={path}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
