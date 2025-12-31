import { Bug } from "lucide-react";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { useFilterMap, useIsFilterEnabled, useYDoc } from "../state/index";
import { defaultYDoc } from "../state/ydoc";
import { EmptyState } from "./empty-state";
import { JsonViewerPanel } from "./json-viewer-panel";
import { Button } from "./ui/button";

function useYDocUpdates(yDoc: Y.Doc) {
  const [, setCount] = useState(0);

  useEffect(() => {
    const callback = () => {
      // Force re-render
      setCount((count) => count + 1);
    };
    yDoc.on("update", callback);
    yDoc.on("subdocs", ({ added }) => {
      for (const subDoc of added) {
        subDoc.on("update", callback);
      }
    });
    return () => {
      yDoc.off("update", callback);
      yDoc.off("subdocs", callback);
      yDoc.subdocs.forEach((subDoc) => {
        subDoc.off("update", callback);
      });
    };
  }, [yDoc]);
}

export function PreviewPanel() {
  const [yDoc] = useYDoc();

  const filterMap = useFilterMap();
  const filterEnable = useIsFilterEnabled();
  const inspectDepth = filterEnable ? 1 : 3;
  const jsonViewerValue = filterEnable ? filterMap : yDoc;

  useYDocUpdates(yDoc);

  const isDefaultYDoc = yDoc === defaultYDoc;

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
        {isDefaultYDoc ? (
          <EmptyState />
        ) : (
          <JsonViewerPanel
            value={jsonViewerValue}
            yDoc={yDoc}
            inspectDepth={inspectDepth}
          />
        )}
      </div>
    </div>
  );
}
