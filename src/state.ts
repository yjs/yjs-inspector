import { atom, useAtom } from "jotai";
import * as Y from "yjs";

const yDocAtom = atom(new Y.Doc());

export const useYDoc = () => {
  return useAtom(yDocAtom);
};
