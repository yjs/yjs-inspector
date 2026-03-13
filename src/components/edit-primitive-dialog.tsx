import { Path } from "@textea/json-viewer";
import { useState } from "react";
import * as Y from "yjs";
import { getHumanReadablePath, parsePrimitiveValue, type PrimitiveHint } from "../utils";
import { getYTypeFromPath, isYArray, isYMap } from "../y-shape";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "./ui/use-toast";

function isPrimitive(value: unknown): value is string | number | boolean | null {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  );
}

export function EditPrimitiveDialog({
  path,
  value,
  yDoc,
  open,
  onOpenChange,
}: {
  path: Path;
  value: unknown;
  yDoc: Y.Doc;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [inputValue, setInputValue] = useState(() =>
    value === null ? "null" : String(value),
  );
  const [hint, setHint] = useState<PrimitiveHint | "auto">("auto");

  const parent = path.length > 0 ? getYTypeFromPath(yDoc, path.slice(0, -1)) : null;
  const key = path.length > 0 ? path[path.length - 1] : undefined;
  const canEdit =
    parent &&
    key !== undefined &&
    (isYMap(parent) || isYArray(parent)) &&
    (isYMap(parent) ? typeof key === "string" : typeof key === "number");

  const handleSave = () => {
    if (!canEdit || parent === null || key === undefined) {
      toast({
        variant: "destructive",
        description: "Cannot edit this value",
        duration: 2000,
      });
      return;
    }
    try {
      const parsed =
        inputValue.trim() === "null"
          ? null
          : parsePrimitiveValue(inputValue, hint === "auto" ? undefined : hint);
      if (isYMap(parent)) {
        parent.set(key as string, parsed);
      } else {
        const index = key as number;
        parent.delete(index);
        parent.insert(index, [parsed]);
      }
      onOpenChange(false);
    } catch (e) {
      toast({
        variant: "destructive",
        description: e instanceof Error ? e.message : "Invalid value",
        duration: 2000,
      });
    }
  };

  const humanPath = getHumanReadablePath(path);

  if (!isPrimitive(value) && value !== null) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setInputValue(value === null ? "null" : String(value));
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit value</DialogTitle>
          <DialogDescription>
            Edit primitive at&nbsp;
            <code className="bg-secondary rounded-md p-1 font-mono text-sm">
              {humanPath}
            </code>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-primitive-input">Value</Label>
            <Input
              id="edit-primitive-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-primitive-hint">Interpret as</Label>
            <Select value={hint} onValueChange={(v) => setHint(v as PrimitiveHint | "auto")}>
              <SelectTrigger id="edit-primitive-hint">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (JSON parse)</SelectItem>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
