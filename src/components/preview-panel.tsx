import { JsonViewer } from "@textea/json-viewer";
import { Bug } from "lucide-react";
import { yDataType } from "../data-types";
import { useConfig, useYDoc } from "../state";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function PreviewPanel() {
  const { theme, systemPreferenceTheme } = useTheme();
  const [yDoc] = useYDoc();
  const [config] = useConfig();

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
          // enableAdd={true}
          // enableDelete={true}
          displaySize={config.showSize}
          theme={theme === "system" ? systemPreferenceTheme : theme}
          defaultInspectDepth={2}
          valueTypes={[yDataType]}
        />
      </div>
    </div>
  );
}
