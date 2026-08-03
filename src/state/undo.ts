import { atom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import * as Y from "yjs";

const TRACK_ALL_ORIGINS = Symbol();

export function createUndoManager(doc: Y.Doc) {
  const undoManager = new Y.UndoManager([], {
    doc,
    trackedOrigins: new Set([TRACK_ALL_ORIGINS]),
  });
  const updateScope = (d: Y.Doc) => {
    // The UndoManager can only track shared types that are created
    // See https://discuss.yjs.dev/t/global-document-undo-manager/2555
    const keys = Array.from(d.share.keys());
    if (!keys.length) return;
    const scope = keys.map((key) => d.get(key));
    undoManager.addToScope(scope);
    // undoManager.addTrackedOrigin(origin);
  };
  const beforeTransactionCallback = (transaction: Y.Transaction) => {
    // Try to track all origins
    // Workaround for https://github.com/yjs/yjs/issues/624
    // @ts-expect-error backup origin
    transaction.__origin = transaction.origin;
    transaction.origin = TRACK_ALL_ORIGINS;
    // Track all shared types before running UndoManager.afterTransactionHandler
    updateScope(transaction.doc);
  };

  // see https://github.com/yjs/yjs/blob/7422b18e87cb41ac675c17ea09dfa832253b6cd2/src/utils/UndoManager.js#L268
  doc.on("beforeTransaction", beforeTransactionCallback);

  // Fix undo manager not tracking subdocs
  // doc.on("subdocs", ({ added }) => {
  //   for (const subDoc of added) {
  //     subDoc.on("beforeTransaction", beforeTransactionCallback);
  //   }
  // });
  return undoManager;
}

const defaultUndoManager = createUndoManager(new Y.Doc());
export const undoManagerAtom = atom<Y.UndoManager>(defaultUndoManager);

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
