import { JsonViewer, Path } from "@textea/json-viewer";
import { useState } from "react";
import * as Y from "yjs";
import { yDataType } from "../data-types";
import { useConfig } from "../state/index";
import { getYTypeFromPath, isYArray, isYDoc, isYMap } from "../y-shape";
import { AddDataDialog } from "./add-data-dialog";
import { DeleteDialog } from "./delete-dialog";
import { useTheme } from "./theme-provider";

interface JsonViewerPanelProps {
  value: unknown;
  yDoc: Y.Doc;
  inspectDepth: number;
}

export function JsonViewerPanel({
  value,
  yDoc,
  inspectDepth,
}: JsonViewerPanelProps) {
  const { resolvedTheme } = useTheme();
  const [config] = useConfig();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [path, setPath] = useState<Path>([]);
  const [target, setTarget] = useState<unknown>(null);

  return (
    <>
      <JsonViewer
        className="p-2"
        value={value}
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
    </>
  );
}
