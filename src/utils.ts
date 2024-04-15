import type { Path } from "@textea/json-viewer";
import * as Y from "yjs";

export async function fileToYDoc(file: File) {
  // TODO handle base64 encoding
  // https://docs.yjs.dev/api/document-updates#example-base64-encoding
  const yDocUpdate = new Uint8Array(await file.arrayBuffer());
  const newYDoc = new Y.Doc();
  // For debugging
  Y.logUpdate(yDocUpdate);
  Y.applyUpdate(newYDoc, yDocUpdate);
  return newYDoc;
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
