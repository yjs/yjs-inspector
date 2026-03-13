import type { Path } from "@textea/json-viewer";
import { fromBase64, fromHexString } from "lib0/buffer";
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
  {
    name: "base64",
    decode: async (file: File) => {
      const text = await file.text();
      return fromBase64(text);
    },
  },
  {
    name: "hex",
    decode: async (file: File) => {
      const text = await file.text();
      return fromHexString(text.trim());
    },
  },
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

export type PrimitiveHint = "string" | "number" | "boolean";

/**
 * Parse a raw string into a primitive value for YMap/YArray.
 * - With hint: respect type (string as-is, number via Number/JSON.parse, boolean via JSON.parse).
 * - Without hint: try JSON.parse (handles 123, "foo", true, false, null), fallback to string.
 */
export function parsePrimitiveValue(
  raw: string,
  hint?: PrimitiveHint,
): string | number | boolean | null {
  const trimmed = raw.trim();
  if (hint === "string") {
    return trimmed;
  }
  if (hint === "number") {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "number" && !Number.isNaN(parsed)) return parsed;
    const n = Number(trimmed);
    if (!Number.isNaN(n)) return n;
    throw new Error("Invalid number");
  }
  if (hint === "boolean") {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "boolean") return parsed;
    throw new Error("Invalid boolean (use true or false)");
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (
      typeof parsed === "string" ||
      typeof parsed === "number" ||
      typeof parsed === "boolean" ||
      parsed === null
    ) {
      return parsed;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
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

export const ExampleYDocUrl =
  "https://affine-reader.vercel.app/api/workspaces/af3478a2-9c9c-4d16-864d-bffa1eb10eb6/docs/-3bEQPBoOEkNH13ULW9Ed";
