import * as Y from "yjs";

/**
 * Convert a JSON-serializable value into Y.js types.
 * - Objects → Y.Map with keys/values recursively converted
 * - Arrays → Y.Array with elements recursively converted
 * - Primitives (string, number, boolean, null) → stored as-is in Y
 */
export function jsonToY(value: unknown): unknown {
  if (value === null) {
    return null;
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    const yArray = new Y.Array<unknown>();
    const converted = value.map((item) => jsonToY(item));
    yArray.push(converted);
    return yArray;
  }
  if (typeof value === "object" && value !== null && !(value instanceof Y.AbstractType)) {
    const yMap = new Y.Map<unknown>();
    for (const [k, v] of Object.entries(value)) {
      yMap.set(k, jsonToY(v));
    }
    return yMap;
  }
  return value;
}
