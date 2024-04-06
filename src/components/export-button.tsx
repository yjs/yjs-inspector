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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
