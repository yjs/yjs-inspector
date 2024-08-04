import * as Y from "yjs";
import type { YShapeItem } from "./components/filter-sphere";
import { getYTypeName, isYAbstractType, parseYShape } from "./y-shape";

function isPureObject(input: unknown): input is Record<string, unknown> {
  return (
    null !== input && typeof input === "object" && input.constructor === Object
  );
}

/**
 * Recursively filter YDoc based on the predicate.
 *
 * Returns a set of Y.AbstractType or Y.Doc that satisfies the predicate.
 *
 * If the predicate returns true for a YShape , the YShape and all its parent will be included in the set.
 */
export function queryFilterSet(
  yDoc: Y.Doc,
  predicate: (data: YShapeItem) => boolean,
): Set<Y.AbstractType<unknown> | Y.Doc> {
  const accessed = new Set<Y.AbstractType<unknown> | Y.Doc>();
  const set = new Set<Y.AbstractType<unknown> | Y.Doc>();

  function traverseYDoc(
    yShape: Y.AbstractType<unknown> | Y.Doc,
    context: { key: string | number; path: (string | number)[] },
  ) {
    if (accessed.has(yShape)) {
      return false;
    }
    accessed.add(yShape);

    const parsedShape = parseYShape(yShape);
    let hasMatch = false;
    if (Array.isArray(parsedShape)) {
      const arr = parsedShape as unknown[];
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (isYAbstractType(element)) {
          const childResult = traverseYDoc(element, {
            key: index,
            path: [...context.path, index],
          });
          if (childResult) {
            set.add(yShape);
            hasMatch = true;
          }
        }
      }
    } else if (isPureObject(parsedShape)) {
      for (const key in parsedShape) {
        const value = parsedShape[key];
        if (isYAbstractType(value)) {
          const childResult = traverseYDoc(value, {
            key,
            path: [...context.path, key],
          });
          if (childResult) {
            set.add(yShape);
            hasMatch = true;
          }
        }
      }
    }
    if (hasMatch) {
      set.add(yShape);
      return true;
    }

    const item: YShapeItem = {
      path: context.path.join("."),
      type: getYTypeName(yShape),
      key: context.key.toString(),
      value: yShape,
    };

    const result = predicate(item);
    if (result) {
      set.add(yShape);
      return true;
    }
    return false;
  }

  traverseYDoc(yDoc, {
    key: "root",
    path: [],
  });
  return set;
}

export function removeMismatchedValues<T = unknown>(
  obj: T,
  matchSet: Set<Y.AbstractType<unknown> | Y.Doc>,
): T {
  if (isPureObject(obj)) {
    for (const key in obj) {
      const value = obj[key];
      if (matchSet.has(value as Y.AbstractType<unknown> | Y.Doc)) {
        continue;
      }
      delete obj[key];
    }
  }
  if (Array.isArray(obj)) {
    for (let index = 0; index < obj.length; index++) {
      const element = obj[index];
      if (matchSet.has(element as Y.AbstractType<unknown> | Y.Doc)) {
        continue;
      }
      obj.splice(index, 1);
      index--;
    }
  }
  return obj;
}
