import { defineDataType, objectType } from "@textea/json-viewer";
import * as Y from "yjs";
import { Badge } from "./components/ui/badge";

/**
 * Guess AbstractType
 *
 * Don't use it in production!
 * See https://github.com/yjs/yjs/issues/563
 */
function guessType(abstractType: Y.AbstractType<any>) {
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

const TypeLabel = ({ children }: { children: string }) => {
  return <Badge variant="outline">{children}</Badge>;
};

const yDocType = defineDataType<object>({
  ...objectType,
  is(value) {
    return typeof value === "object" && value instanceof Y.Doc;
  },
  PreComponent: ({ ...props }) => {
    const ObjPreComponent = objectType.PreComponent!;
    return (
      <span>
        <TypeLabel>YDoc</TypeLabel>&nbsp;
        <ObjPreComponent {...props}></ObjPreComponent>
      </span>
    );
  },
  Component: ({ value, ...props }) => {
    const ObjComponent = objectType.Component!;
    const yDoc = value as Y.Doc;
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
    return (
      <span>
        <ObjComponent value={obj} {...props}></ObjComponent>
      </span>
    );
  },
});

const yMapType = defineDataType<object>({
  ...objectType,
  is(value) {
    return typeof value === "object" && value instanceof Y.Map;
  },
  PreComponent: ({ ...props }) => {
    const ObjPreComponent = objectType.PreComponent!;
    return (
      <span>
        <TypeLabel>YMap</TypeLabel>&nbsp;
        <ObjPreComponent {...props}></ObjPreComponent>
      </span>
    );
  },
  Component: ({ value, ...props }) => {
    const ObjComponent = objectType.Component!;
    const yMap = value as Y.Map<unknown>;
    const keys = Array.from(yMap.keys());
    const obj = keys.reduce(
      (acc, key) => {
        acc[key] = yMap.get(key);
        return acc;
      },
      {} as Record<string, unknown>,
    );
    return (
      <span>
        <ObjComponent value={obj} {...props}></ObjComponent>
      </span>
    );
  },
});

const yArrayType = defineDataType<object>({
  ...objectType,
  is(value) {
    return typeof value === "object" && value instanceof Y.Array;
  },
  PreComponent: ({ ...props }) => {
    const ObjPreComponent = objectType.PreComponent!;
    return (
      <span>
        <TypeLabel>YArray</TypeLabel>&nbsp;
        <ObjPreComponent {...props}></ObjPreComponent>
      </span>
    );
  },
  Component: ({ value, ...props }) => {
    const ObjComponent = objectType.Component!;
    const yArray = value as Y.Array<unknown>;
    const obj = yArray.toArray();

    return (
      <span>
        <ObjComponent value={obj} {...props}></ObjComponent>
      </span>
    );
  },
});

const yTextType = defineDataType<object>({
  ...objectType,
  is(value) {
    return typeof value === "object" && value instanceof Y.Text;
  },
  PreComponent: ({ ...props }) => {
    const ObjPreComponent = objectType.PreComponent!;
    return (
      <span>
        <TypeLabel>YText</TypeLabel>&nbsp;
        <ObjPreComponent {...props}></ObjPreComponent>
      </span>
    );
  },
  Component: ({ value, ...props }) => {
    const ObjComponent = objectType.Component!;
    const yText = value as Y.Text;
    const delta = yText.toDelta();

    return (
      <span>
        <ObjComponent value={delta} {...props}></ObjComponent>
      </span>
    );
  },
});

const otherYType = defineDataType<object>({
  ...objectType,
  is(value) {
    return (
      typeof value === "object" &&
      (value instanceof Y.XmlElement ||
        value instanceof Y.XmlFragment ||
        value instanceof Y.XmlText)
    );
  },
  PreComponent: ({ ...props }) => {
    const ObjPreComponent = objectType.PreComponent!;
    return (
      <span>
        {props.value.constructor.name}&nbsp;
        <ObjPreComponent {...props}></ObjPreComponent>
      </span>
    );
  },
});

const yAbstractType = defineDataType<object>({
  ...objectType,
  is(value) {
    return (
      typeof value === "object" &&
      value instanceof Y.AbstractType &&
      !(value instanceof Y.Doc) &&
      !(value instanceof Y.Map) &&
      !(value instanceof Y.Array) &&
      !(value instanceof Y.Text)
    );
  },
  PreComponent: ({ ...props }) => {
    const ObjPreComponent = objectType.PreComponent!;
    return (
      <span>
        {props.value.constructor.name}&nbsp;
        <ObjPreComponent {...props}></ObjPreComponent>
      </span>
    );
  },
});

export const valueTypes = [
  yDocType,
  yMapType,
  yArrayType,
  yTextType,
  otherYType,
  yAbstractType,
];