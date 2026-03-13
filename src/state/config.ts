import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Config = {
  parseYDoc: boolean;
  showDelta: boolean;
  showSize: boolean;
  editable: boolean;
  showJsonExport: boolean;
  showYamlExport: boolean;
};
const defaultConfig = {
  parseYDoc: true,
  showDelta: true,
  showSize: true,
  editable: false,
  showJsonExport: false,
  showYamlExport: false,
} satisfies Config;

export const configAtom = atomWithStorage<Config>(
  "yjs-playground-config",
  defaultConfig,
);

export const useConfig = () => {
  return useAtom(configAtom);
};
