import type { Path } from "@textea/json-viewer";
import { createContext, use } from "react";
import type * as Y from "yjs";

type YDocEditContextValue = {
  yDoc: Y.Doc;
  openEditPrimitive: (path: Path, value: unknown) => void;
};

const YDocEditContext = createContext<YDocEditContextValue | null>(null);

export function YDocEditProvider({
  yDoc,
  openEditPrimitive,
  children,
}: {
  yDoc: Y.Doc;
  openEditPrimitive: (path: Path, value: unknown) => void;
  children: React.ReactNode;
}) {
  return (
    <YDocEditContext value={{ yDoc, openEditPrimitive }}>
      {children}
    </YDocEditContext>
  );
}

export function useYDocEdit() {
  return use(YDocEditContext);
}
