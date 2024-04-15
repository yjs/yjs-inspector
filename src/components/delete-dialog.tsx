import { Path } from "@textea/json-viewer";
import { useYDoc } from "../state";
import { getHumanReadablePath } from "../utils";
import {
  getYTypeFromPath,
  getYTypeName,
  isYArray,
  isYMap,
  isYShape,
} from "../y-shape";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function DeleteDialog({
  value,
  path,
  open,
  onOpenChange,
}: {
  value: unknown;
  path: Path;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [yDoc] = useYDoc();
  const onConfirm = () => {
    const parent = getYTypeFromPath(yDoc, path.slice(0, -1));
    const key = path[path.length - 1];
    if (isYMap(parent)) {
      if (typeof key !== "string") {
        throw new Error(
          "Key must be a string, but got " + key + " of type " + typeof key,
        );
      }
      parent.delete(key);
    } else if (isYArray(parent)) {
      if (typeof key !== "number") {
        throw new Error(
          "Key must be a number, but got " + key + " of type " + typeof key,
        );
      }
      parent.delete(key);
    } else {
      console.error("Invalid parent type", parent);
      throw new Error("Invalid parent type");
    }
    onOpenChange(false);
  };
  const targetName = isYShape(value) ? getYTypeName(value) : "object";
  const humanReadablePath = getHumanReadablePath(path);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete&nbsp;
            <code className="rounded-md bg-secondary p-1 font-mono text-sm">
              {targetName}
            </code>
            &nbsp;from&nbsp;
            <code className="rounded-md bg-secondary p-1 font-mono text-sm">
              {humanReadablePath}
            </code>
            ?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
