import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import * as Y from "yjs";
import { useYDoc } from "../state";
import { yShapeToJSON } from "../y-shape";

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton() {
  const [yDoc] = useYDoc();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            const encodeUpdate = Y.encodeStateAsUpdate(yDoc);
            const blob = new Blob([encodeUpdate], {
              type: "application/octet-stream",
            });
            downloadFile(blob, "ydoc-update");
          }}
        >
          encodeStateAsUpdate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const encodedStateVector = Y.encodeStateVector(yDoc);
            const blob = new Blob([encodedStateVector], {
              type: "application/octet-stream",
            });
            downloadFile(blob, "ydoc-state-vector");
          }}
        >
          encodeStateVector
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const snapshot = Y.snapshot(yDoc);
            const encodedSnapshot = Y.encodeSnapshot(snapshot);
            const blob = new Blob([encodedSnapshot], {
              type: "application/octet-stream",
            });
            downloadFile(blob, "ydoc-snapshot");
          }}
        >
          Snapshot
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const json = yShapeToJSON(yDoc);
            const jsonStr = JSON.stringify(json, null, 2);
            const blob = new Blob([jsonStr], {
              type: "application/json",
            });
            downloadFile(blob, "ydoc-json");
          }}
        >
          JSON(unofficial)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
