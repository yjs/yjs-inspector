import type { Path } from "@textea/json-viewer";
import * as Y from "yjs";
import { getPathValue, or, unreachable } from "./utils";

/**
 * Guess AbstractType
 *
 * Don't use it in production!
 * See https://github.com/yjs/yjs/issues/563
 */
export function guessType(abstractType: Y.AbstractType<unknown>) {
  if (abstractType.constructor === Y.Array) {
    return Y.Array;
  }
  if (abstractType.constructor === Y.Map) {
    return Y.Map;
  }
  if (abstractType._map.size) {
    return Y.Map;
  }
  if (abstractType._length > 0) {
    const firstItem = abstractType._first;
    if (!firstItem) {
      console.error(
        "The length is greater than 0 but _first is not set",
        abstractType,
      );
      return Y.AbstractType;
    }

    // Try distinguish between Y.Text and Y.Array
    // Only check the first element, it's unreliable!
    if (
      firstItem.content instanceof Y.ContentString ||
      firstItem.content instanceof Y.ContentFormat
    ) {
      return Y.Text;
    }
    return Y.Array;
  }
  return Y.AbstractType;
}

export function getYTypeName(value: Y.Doc | Y.AbstractType<unknown>) {
  if (value instanceof Y.Doc) {
    return "YDoc";
  }
  if (value instanceof Y.Map) {
    return "YMap";
  }
  if (value instanceof Y.Array) {
    return "YArray";
  }
  if (value instanceof Y.Text) {
    return "YText";
  }
  if (value instanceof Y.XmlElement) {
    return "YXmlElement";
  }
  if (value instanceof Y.XmlFragment) {
    return "YXmlFragment";
  }
  if (value instanceof Y.AbstractType) {
    return "YAbstractType";
  }
  // return "Y." + value.constructor.name;
  console.error("Unknown Yjs type", value);
  throw new Error("Unknown Yjs type");
}

export function isYDoc(value: unknown): value is Y.Doc {
  return value instanceof Y.Doc;
}

export function isYMap(value: unknown): value is Y.Map<unknown> {
  return value instanceof Y.Map;
}

export function isYArray(value: unknown): value is Y.Array<unknown> {
  return value instanceof Y.Array;
}

export function isYText(value: unknown): value is Y.Text {
  return value instanceof Y.Text;
}

export function isYXmlElement(value: unknown): value is Y.XmlElement {
  return value instanceof Y.XmlElement;
}

export function isYXmlFragment(value: unknown): value is Y.XmlFragment {
  return value instanceof Y.XmlFragment;
}

export function isYXmlText(value: unknown): value is Y.XmlText {
  return value instanceof Y.XmlText;
}

/**
 * Check if the value is a Y.AbstractType.
 *
 * **Note: Y.Doc is not a Y.AbstractType.**
 *
 * See also {@link isYShape}
 */
export function isYAbstractType(
  value: unknown,
): value is Y.AbstractType<unknown> {
  return value instanceof Y.AbstractType;
}

/**
 * Check if the value is a Yjs type. It includes Y.Doc and Y.AbstractType.
 *
 * See also {@link isYAbstractType}
 */
export function isYShape(
  value: unknown,
): value is Y.AbstractType<unknown> | Y.Doc {
  return or(isYDoc, isYAbstractType)(value);
}

export function parseYShape(
  value: Y.AbstractType<unknown> | Y.Doc,
  { showDelta }: { showDelta: boolean } = { showDelta: true },
): unknown[] | Record<string, unknown> | string | Y.AbstractType<unknown> {
  if (isYDoc(value)) {
    const yDoc = value;
    const keys = Array.from(yDoc.share.keys());
    const obj = keys.reduce(
      (acc, key) => {
        const value = yDoc.get(key);
        const type = guessType(value);
        acc[key] = yDoc.get(key, type);
        return acc;
      },
      {} as Record<string, unknown>,
    );
    return obj;
  }

  if (isYMap(value)) {
    const yMap = value;
    const keys = Array.from(yMap.keys());
    const obj = keys.reduce(
      (acc, key) => {
        acc[key] = yMap.get(key);
        return acc;
      },
      {} as Record<string, unknown>,
    );
    return obj;
  }

  if (isYArray(value)) {
    const yArray = value;
    const arr = yArray.toArray();
    return arr;
  }

  if (isYText(value)) {
    if (showDelta) {
      return value.toDelta();
    }
    return value.toString();
  }

  if (isYXmlElement(value)) {
    return {
      nodeName: value.nodeName,
      attributes: value.getAttributes(),
      "toString()": value.toString(),
    };
  }

  if (isYXmlFragment(value)) {
    return value.toJSON();
  }

  if (isYXmlText(value)) {
    if (showDelta) {
      return value.toDelta();
    }
    return value.toString();
  }

  return value;
}

export const NATIVE_UNIQ_IDENTIFIER = "$yjs:internal:native$";

export function yShapeToJSON(
  value: any,
): object | string | number | boolean | null | undefined {
  if (!isYShape(value)) {
    return value;
  }
  const typeName = getYTypeName(value);

  if (isYDoc(value)) {
    const yDoc = value;
    const keys = Array.from(yDoc.share.keys());
    const obj = keys.reduce(
      (acc, key) => {
        const val = yDoc.get(key);
        const type = guessType(val);
        acc[key] = yShapeToJSON(yDoc.get(key, type));
        return acc;
      },
      {
        [NATIVE_UNIQ_IDENTIFIER]: typeName,
      } as Record<string, unknown>,
    );
    return obj;
  }
  if (isYMap(value)) {
    const yMap = value;
    const keys = Array.from(yMap.keys());
    const obj = keys.reduce(
      (acc, key) => {
        acc[key] = yShapeToJSON(yMap.get(key));
        return acc;
      },
      {
        [NATIVE_UNIQ_IDENTIFIER]: typeName,
      } as Record<string, unknown>,
    );
    return obj;
  }
  if (isYArray(value)) {
    return {
      [NATIVE_UNIQ_IDENTIFIER]: typeName,
      value: value.toArray().map((value) => yShapeToJSON(value)),
    };
  }
  if (isYText(value)) {
    return {
      [NATIVE_UNIQ_IDENTIFIER]: typeName,
      delta: value.toDelta(),
    };
  }
  if (isYXmlElement(value)) {
    return {
      [NATIVE_UNIQ_IDENTIFIER]: typeName,
      nodeName: value.nodeName,
      attributes: value.getAttributes(),
    };
  }
  if (isYXmlFragment(value)) {
    return {
      [NATIVE_UNIQ_IDENTIFIER]: typeName,
      value: value.toJSON(),
    };
  }
  if (isYAbstractType(value)) {
    console.error("Unsupported Yjs type: " + typeName, value);
    throw new Error("Unsupported Yjs type: " + typeName);
  }
  console.error("Unknown Yjs type", value);
  unreachable(value, "Unknown Yjs type");
}

export function getYTypeFromPath(yDoc: Y.Doc, path: Path): unknown {
  return getPathValue(yDoc, path, (obj: unknown, key) => {
    if (isYDoc(obj)) {
      const keyExists = obj.share.has(key + "");
      if (!keyExists) {
        return undefined;
      }
      return obj.get(key + "");
    }
    if (isYMap(obj)) {
      return obj.get(key + "");
    }
    if (isYArray(obj)) {
      if (typeof key !== "number") {
        console.error("Invalid key", path, key);
        return undefined;
      }
      return obj.get(key);
    }
    if (obj === undefined) {
      return undefined;
    }
    return (obj as any)[key];
  });
}
