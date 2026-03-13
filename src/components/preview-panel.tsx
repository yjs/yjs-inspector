import { Bug, Download } from "lucide-react";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import YAML from "yaml";
import { useConfig, useFilterMap, useIsFilterEnabled, useYDoc } from "../state/index";
import { defaultYDoc } from "../state/ydoc";
import { yDocToPlainContent } from "../y-shape";
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
  const [config] = useConfig();

  const filterMap = useFilterMap();
  const filterEnable = useIsFilterEnabled();
  const inspectDepth = filterEnable ? 1 : 3;
  const jsonViewerValue = filterEnable ? filterMap : yDoc;

  useYDocUpdates(yDoc);

  const isDefaultYDoc = yDoc === defaultYDoc;
  const plainContent = isDefaultYDoc ? {} : yDocToPlainContent(yDoc);
  const jsonString = JSON.stringify(plainContent, (_, v) => (v === undefined ? null : v), 2);
  const yamlString = isDefaultYDoc ? "" : YAML.stringify(plainContent);

  const showExportRow = config.showJsonExport || config.showYamlExport;

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0">
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

      <div className="flex-1 overflow-auto rounded-md min-h-0">
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

      {showExportRow && (
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          {config.showJsonExport && (
            <div className="flex flex-col rounded-md border border-border bg-muted/30 overflow-hidden min-h-0">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/50">
                <h3 className="text-sm font-medium">JSON</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(jsonString, "ydoc.json", "application/json")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 min-h-[120px] overflow-auto p-3">
                <pre className="text-muted-foreground m-0 font-mono text-sm whitespace-pre-wrap break-words">
                  {jsonString}
                </pre>
              </div>
            </div>
          )}
          {config.showYamlExport && (
            <div className="flex flex-col rounded-md border border-border bg-muted/30 overflow-hidden min-h-0">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/50">
                <h3 className="text-sm font-medium">YAML</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(yamlString, "ydoc.yaml", "application/x-yaml")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 min-h-[120px] overflow-auto p-3">
                <pre className="text-muted-foreground m-0 font-mono text-sm whitespace-pre-wrap break-words">
                  {yamlString}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
