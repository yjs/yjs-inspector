import * as Y from "yjs";
import type { YShapeItem } from "./components/filter-sphere";
import { getYTypeName, isYDoc, isYMap, isYShape, parseYShape } from "./y-shape";

type FilterType =
  | Y.Doc
  | Y.AbstractType<unknown>
  | Record<string, unknown>
  | boolean
  | string
  | number
  | Uint8Array;

function isPureObject(input: unknown): input is Record<string, unknown> {
  return (
    null !== input && typeof input === "object" && input.constructor === Object
  );
}

function isFilterableType(input: unknown): input is FilterType {
  const isShape = isYShape(input);
  return (
    isShape ||
    isPureObject(input) ||
    typeof input === "boolean" ||
    typeof input === "string" ||
    typeof input === "number" ||
    input instanceof Uint8Array
  );
}

function getFilterType(input: FilterType): YShapeItem["type"] {
  if (isYShape(input)) {
    return getYTypeName(input);
  }
  if (typeof input === "boolean") {
    return "Boolean";
  }
  if (typeof input === "string") {
    return "String";
  }
  if (typeof input === "number") {
    return "Number";
  }
  if (input instanceof Uint8Array) {
    return "Uint8Array";
  }
  return "Object";
}

/**
 * Recursively filter YDoc based on the predicate.
 */
export const filterYDoc = (
  yDoc: Y.Doc,
  predicate: (data: YShapeItem) => boolean,
) => {
  const selectedMap: Record<string, FilterType> = {};
  const accessed = new Set<FilterType>();

  function traverseYDoc(
    data: FilterType,
    context: { path: (string | number)[] },
  ) {
    if (accessed.has(data)) return false;
    accessed.add(data);

    const item: YShapeItem = {
      path: context.path.join("."),
      type: getFilterType(data),
      key: (context.path.at(-1) ?? "").toString(),
      value: data,
    };

    const result = predicate(item);
    if (result) {
      const path = context.path.join(".");
      if (path !== "root") {
        // Skip the root node
        selectedMap[path] = data;
      }
    }

    if (!isYShape(data)) {
      return;
    }
    const parsedShape = parseYShape(data, { showDelta: false });
    if (Array.isArray(parsedShape)) {
      const arr = parsedShape as unknown[];
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (isFilterableType(element)) {
          traverseYDoc(element, {
            path: [...context.path, index],
          });
        }
      }
    } else if ((isYDoc(data) || isYMap(data)) && isPureObject(parsedShape)) {
      for (const key in parsedShape) {
        const value = parsedShape[key];
        if (isFilterableType(value)) {
          traverseYDoc(value, {
            path: [...context.path, key],
          });
        }
      }
    }
  }

  traverseYDoc(yDoc, {
    path: ["root"],
  });

  return selectedMap;
};
