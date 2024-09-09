import { atom, Setter, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { atomWithListeners } from "./atom-with-listeners";
import { YShapeItem } from "./components/filter-sphere";
import { filterYDoc } from "./filter-map";

const TRACK_ALL_ORIGINS = Symbol();

function createUndoManager(doc: Y.Doc) {
  const undoManager = new Y.UndoManager([], {
    doc,
    trackedOrigins: new Set([TRACK_ALL_ORIGINS]),
  });
  const updateScope = () => {
    // The UndoManager can only track shared types that are created
    // See https://discuss.yjs.dev/t/global-document-undo-manager/2555
    const keys = Array.from(doc.share.keys());
    if (!keys.length) return;
    const scope = keys.map((key) => doc.get(key));
    undoManager.addToScope(scope);
    // undoManager.addTrackedOrigin(origin);
  };
  // see https://github.com/yjs/yjs/blob/7422b18e87cb41ac675c17ea09dfa832253b6cd2/src/utils/UndoManager.js#L268
  doc.on("beforeTransaction", (transaction) => {
    // Try to track all origins
    // Workaround for https://github.com/yjs/yjs/issues/624
    // @ts-expect-error backup origin
    transaction.__origin = transaction.origin;
    transaction.origin = TRACK_ALL_ORIGINS;
    // Track all shared types before running UndoManager.afterTransactionHandler
    updateScope();
  });
  return undoManager;
}

const [uploadAtom, useUploadListener] = atomWithListeners(0);
const [downloadAtom, useDownloadListener] = atomWithListeners(0);
export { useDownloadListener, useUploadListener };

function connectStatusIndicator(yDoc: Y.Doc, set: Setter) {
  yDoc.on("beforeTransaction", (tr) => {
    // Cation: The origin will be overwritten by the UndoManager to `TRACK_ALL_ORIGINS`
    const origin = tr.origin;
    console.log("origin", origin, tr);
    if (origin === null || origin instanceof Y.UndoManager) {
      set(uploadAtom, (prev) => prev + 1);
    } else {
      set(downloadAtom, (prev) => prev + 1);
    }
  });
}

const defaultYDoc = new Y.Doc();
const defaultUndoManager = createUndoManager(defaultYDoc);

const undoManagerAtom = atom<Y.UndoManager>(defaultUndoManager);

const yDocAtom = atom(defaultYDoc, (get, set, newDoc: Y.Doc) => {
  if (newDoc === get(yDocAtom)) return;
  get(undoManagerAtom).destroy();
  connectStatusIndicator(newDoc, set);
  const undoManager = createUndoManager(newDoc);
  set(undoManagerAtom, undoManager);
  get(yDocAtom).destroy();
  set(yDocAtom, newDoc);
});

export const useYDoc = () => {
  return useAtom(yDocAtom);
};

export const useUndoManager = () => {
  const undoManager = useAtomValue(undoManagerAtom);
  const [state, setState] = useState({
    canUndo: undoManager.canUndo(),
    canRedo: undoManager.canRedo(),
    undoStackSize: undoManager.undoStack.length,
    redoStackSize: undoManager.redoStack.length,
  });

  // TODO use useSyncExternalStore
  useEffect(() => {
    const callback = () => {
      setState({
        canUndo: undoManager.canUndo(),
        canRedo: undoManager.canRedo(),
        undoStackSize: undoManager.undoStack.length,
        redoStackSize: undoManager.redoStack.length,
      });
    };
    callback();

    undoManager.on("stack-item-added", callback);
    undoManager.on("stack-item-popped", callback);
    return () => {
      undoManager.off("stack-item-added", callback);
      undoManager.off("stack-item-popped", callback);
    };
  }, [undoManager]);

  return {
    undoManager,
    ...state,
  };
};

export type Config = {
  parseYDoc: boolean;
  showDelta: boolean;
  showSize: boolean;
  editable: boolean;
};

const defaultConfig = {
  parseYDoc: true,
  showDelta: true,
  showSize: true,
  editable: false,
} satisfies Config;

const configAtom = atomWithStorage<Config>(
  "yjs-playground-config",
  defaultConfig,
);

export const useConfig = () => {
  return useAtom(configAtom);
};

const falseFn = () => false;
const filterPredicateAtom = atom<{ fn: (data: YShapeItem) => boolean }>({
  fn: falseFn,
});

export const useUpdateFilterPredicate = () => {
  const set = useSetAtom(filterPredicateAtom);
  return set;
};

const hasValidFilterRuleAtom = atom(false);

const filteredYDocAtom = atom((get) => {
  const hasValidFilterRule = get(hasValidFilterRuleAtom);
  if (!hasValidFilterRule) {
    return {};
  }
  const yDoc = get(yDocAtom);
  const predicate = get(filterPredicateAtom).fn;
  const filterMap = filterYDoc(yDoc, predicate);
  return filterMap;
});

const filterCountAtom = atom((get) => {
  const data = get(filteredYDocAtom);
  return Object.keys(data).length;
});

export const useSetHasValidFilterRule = () => {
  return useSetAtom(hasValidFilterRuleAtom);
};

export const useFilterMap = () => {
  return useAtomValue(filteredYDocAtom);
};

export const useFilterDataCount = () => {
  return useAtomValue(filterCountAtom);
};

export const useIsFilterEnabled = () => {
  const hasValidFilterRule = useAtomValue(hasValidFilterRuleAtom);
  const config = useAtomValue(configAtom);
  return config.parseYDoc && hasValidFilterRule;
};
