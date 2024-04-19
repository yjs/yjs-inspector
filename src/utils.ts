import type { Path } from "@textea/json-viewer";
import * as Y from "yjs";

const decoders = [
  {
    name: "binary update",
    decode: async (file: File) => {
      return new Uint8Array(await file.arrayBuffer());
    },
  },
  {
    name: "binary string",
    decode: async (file: File) => {
      const text = await file.text();
      // Parse binary string
      // `Buffer.from(encodeUpdate).toString("binary")`
      return Uint8Array.from(text, (c) => c.charCodeAt(0));
    },
  },
  // TODO handle base64 encoding
  // https://docs.yjs.dev/api/document-updates#example-base64-encoding
];

export async function fileToYDoc(file: File) {
  for (const decoder of decoders) {
    try {
      const yDocUpdate = await decoder.decode(file);
      const newYDoc = new Y.Doc();
      Y.applyUpdate(newYDoc, yDocUpdate);
      Y.logUpdate(yDocUpdate);
      return newYDoc;
    } catch (error) {
      console.warn(`Failed to decode ${decoder.name}`, error);
    }
  }
  throw new Error("Failed to decode file");
}

export function getPathValue<T = object, R = object>(
  obj: T,
  path: Path,
  getter: (obj: T, key: string | number) => unknown = (obj, key) =>
    (obj as any)[key],
) {
  return path.reduce(
    (acc, key) => getter(acc, key) as any,
    obj,
  ) as unknown as R;
}

export const and =
  <T extends (...args: any[]) => boolean>(...fnArray: NoInfer<T>[]) =>
  (...args: Parameters<T>) =>
    fnArray.every((fn) => fn(...args));

export const or =
  <T extends (...args: any[]) => boolean>(...fnArray: NoInfer<T>[]) =>
  (...args: Parameters<T>) =>
    fnArray.some((fn) => fn(...args));

export function getHumanReadablePath(path: Path) {
  return ["root", ...path].join(".");
}

/**
 * This function should never be called. If it is called, it means that the
 * code has reached a point that should be unreachable.
 *
 * @example
 * ```ts
 * function f(val: 'a' | 'b') {
 *  if (val === 'a') {
 *   return 1;
 * } else if (val === 'b') {
 *  return 2;
 * }
 * unreachable(val);
 * ```
 */
export function unreachable(
  _val: never,
  message = "Unreachable code reached",
): never {
  throw new Error(message);
}
