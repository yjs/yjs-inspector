import { JsonViewer, Path } from "@textea/json-viewer";
import { useState } from "react";
import * as Y from "yjs";
import { editablePrimitiveType } from "../editable-primitive-type";
import { yDataType } from "../data-types";
import { useConfig } from "../state/index";
import { getYTypeFromPath, isYArray, isYDoc, isYMap } from "../y-shape";
import { AddDataDialog } from "./add-data-dialog";
import { DeleteDialog } from "./delete-dialog";
import { EditPrimitiveDialog } from "./edit-primitive-dialog";
import { useTheme } from "./theme-provider";
import { YDocEditProvider } from "./ydoc-edit-context";

function canDeleteParent(parent: unknown): boolean {
  return isYDoc(parent) || isYMap(parent) || isYArray(parent);
}

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
  const [editPrimitiveOpen, setEditPrimitiveOpen] = useState(false);
  const [editPrimitivePath, setEditPrimitivePath] = useState<Path>([]);
  const [editPrimitiveValue, setEditPrimitiveValue] = useState<unknown>(null);

  const openEditPrimitive = (editPath: Path, editValue: unknown) => {
    setEditPrimitivePath(editPath);
    setEditPrimitiveValue(editValue);
    setEditPrimitiveOpen(true);
  };

  return (
    <YDocEditProvider yDoc={yDoc} openEditPrimitive={openEditPrimitive}>
      <JsonViewer
        className="p-2"
        value={value}
        enableAdd={(_, value) => {
          return (
            config.editable &&
            config.parseYDoc &&
            (isYDoc(value) || isYMap(value) || isYArray(value))
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
          return canDeleteParent(parent);
        }}
        onDelete={(path, value) => {
          setTarget(value);
          setPath(path);
          setDeleteDialogOpen(true);
        }}
        displaySize={config.showSize}
        theme={resolvedTheme}
        defaultInspectDepth={inspectDepth}
        valueTypes={[yDataType, editablePrimitiveType]}
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
      <EditPrimitiveDialog
        key={editPrimitiveOpen ? editPrimitivePath.join(".") : "closed"}
        path={editPrimitivePath}
        value={editPrimitiveValue}
        yDoc={yDoc}
        open={editPrimitiveOpen}
        onOpenChange={setEditPrimitiveOpen}
      />
    </YDocEditProvider>
  );
}
