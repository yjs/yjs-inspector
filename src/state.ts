import { atom, useAtom } from "jotai";
import * as Y from "yjs";

const yDocAtom = atom(new Y.Doc());

export const useYDoc = () => {
  return useAtom(yDocAtom);
};

export type Config = {
  view: "ydoc" | "shared-types";
  showDelta: boolean;
  showSize: boolean;
};

const defaultConfig = {
  view: "shared-types",
  showDelta: true,
  showSize: true,
} satisfies Config;

const configAtom = atom<Config>(defaultConfig);

export const useConfig = () => {
  return useAtom(configAtom);
};
