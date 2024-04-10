import * as Y from "yjs";

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
  return Y.AbstractType;
}

export function getYTypeName(value: Y.AbstractType<unknown>) {
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
  // if (value instanceof Y.AbstractType) {
  //   return "YAbstractType";
  // }
  // return "Y." + value.constructor.name;
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

export function isYAbstractType(value: unknown): value is Y.XmlFragment {
  return value instanceof Y.AbstractType;
}

export function parseYType(
  value: Y.AbstractType<unknown>,
  { showDelta }: { showDelta: boolean } = { showDelta: true },
): object | string {
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

  return value;
}
