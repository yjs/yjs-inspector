import { atom, Setter, useAtom } from "jotai";
import * as Y from "yjs";
import { atomWithListeners } from "./atom-with-listeners";
import { createUndoManager, undoManagerAtom } from "./undo";

const [uploadAtom, useUploadListener] = atomWithListeners(0);
const [downloadAtom, useDownloadListener] = atomWithListeners(0);
export { useDownloadListener, useUploadListener };

function connectStatusIndicator(yDoc: Y.Doc, set: Setter) {
  yDoc.on("beforeTransaction", (tr) => {
    // Cation: The origin will be overwritten by the UndoManager to `TRACK_ALL_ORIGINS`
    const origin = tr.origin;
    if (origin === null || origin instanceof Y.UndoManager) {
      set(uploadAtom, (prev) => prev + 1);
    } else {
      set(downloadAtom, (prev) => prev + 1);
    }
  });
}

const defaultYDoc = new Y.Doc();

export const yDocAtom = atom(defaultYDoc, (get, set, newDoc: Y.Doc) => {
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
