import { JsonViewer, Path } from "@textea/json-viewer";
import { Bug } from "lucide-react";
import { useEffect, useState } from "react";
import { yDataType } from "../data-types";
import { useConfig, useYDoc } from "../state";
import { getYTypeFromPath, isYDoc, isYMap, isYText } from "../y-type";
import { AddDataDialog } from "./add-data-dialog";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function PreviewPanel() {
  const { theme, systemPreferenceTheme } = useTheme();
  const [yDoc] = useYDoc();
  const [config] = useConfig();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<Path>([]);
  const [target, setTarget] = useState<unknown>(null);

  const [, setCount] = useState(0);
  useEffect(() => {
    if (!yDoc) {
      return;
    }
    yDoc.on("update", () => {
      // Force re-render
      setCount((count) => count + 1);
    });
  }, [yDoc]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex content-center gap-4">
        <h2 className="mb-4 flex-1 text-xl">Inspect</h2>

        <Button variant="secondary" size="sm" asChild>
          <a
            href="https://github.com/lawvs/ydoc-playground/issues/new"
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
          value={yDoc}
          // editable={true}
          enableAdd={(_, value) => {
            return (
              config.editable &&
              config.view === "shared-types" &&
              // TODO support YArray/YText
              (isYDoc(value) || isYText(value) || isYMap(value))
            );
          }}
          enableDelete={true}
          onAdd={(path) => {
            const target = getYTypeFromPath(yDoc, path);
            if (!target) {
              console.error("Invalid target", path, target);
              return;
            }
            setTarget(target);
            setPath(path);
            setOpen(true);
          }}
          onDelete={() => {}}
          displaySize={config.showSize}
          theme={theme === "system" ? systemPreferenceTheme : theme}
          defaultInspectDepth={2}
          valueTypes={[yDataType]}
        />
      </div>
      <AddDataDialog
        target={target}
        path={path}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
