import { defineDataType, JsonViewer, objectType } from "@textea/json-viewer";
import { Bug } from "lucide-react";
import * as Y from "yjs";
import { useYDoc } from "../state";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

const yMapType = defineDataType<object>({
  ...objectType,
  is(value) {
    return typeof value === "object" && value instanceof Y.Map;
  },
  PreComponent: ({ ...props }) => {
    const PreComponent = objectType.PreComponent!;
    return (
      <span>
        YMap <PreComponent {...props}></PreComponent>
      </span>
    );
  },
});

const yArrayType = defineDataType<object>({
  ...objectType,
  is(value) {
    return typeof value === "object" && value instanceof Y.Array;
  },
  PreComponent: ({ ...props }) => {
    const PreComponent = objectType.PreComponent!;
    return (
      <span>
        YArray <PreComponent {...props}></PreComponent>
      </span>
    );
  },
});

const yTextType = defineDataType<object>({
  ...objectType,
  is(value) {
    return typeof value === "object" && value instanceof Y.Text;
  },
  PreComponent: ({ ...props }) => {
    const PreComponent = objectType.PreComponent!;
    return (
      <span>
        YText <PreComponent {...props}></PreComponent>
      </span>
    );
  },
});

const valueTypes = [yMapType, yArrayType, yTextType];

export function PreviewPanel() {
  const { theme } = useTheme();
  const [yDoc] = useYDoc();
  yDoc.get;
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex">
        <h2 className="mb-4 flex-1 text-xl">YDoc</h2>
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

      <div className="flex-1 rounded-md">
        <JsonViewer
          className="p-2"
          value={yDoc}
          rootName="YDoc"
          theme={theme === "system" ? "auto" : theme}
          defaultInspectDepth={1}
          valueTypes={valueTypes}
        />
      </div>
    </div>
  );
}
