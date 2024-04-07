import { defineDataType, objectType, stringType } from "@textea/json-viewer";
import * as Y from "yjs";
import { Badge } from "./components/ui/badge";
import { useToast } from "./components/ui/use-toast";

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

const TypeLabel = ({
  value,
  children,
}: {
  value: unknown;
  children: string;
}) => {
  const { toast } = useToast();

  return (
    <Badge
      variant="outline"
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        console.log(value);
        toast({
          duration: 2000,
          description: "Check the console for the value",
        });
      }}
    >
      {children}
    </Badge>
  );
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
        <TypeLabel value={props.value}>YDoc</TypeLabel>&nbsp;
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
        <TypeLabel value={props.value}>YMap</TypeLabel>&nbsp;
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
        <TypeLabel value={props.value}>YArray</TypeLabel>&nbsp;
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
        <TypeLabel value={props.value}>YText</TypeLabel>&nbsp;
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

export const yTextStringType = defineDataType<object>({
  ...objectType,
  is(value) {
    return typeof value === "object" && value instanceof Y.Text;
  },
  PreComponent: ({ ...props }) => {
    const ObjPreComponent = objectType.PreComponent!;
    return (
      <span>
        <TypeLabel value={props.value}>YText</TypeLabel>&nbsp;
        <ObjPreComponent {...props}></ObjPreComponent>
      </span>
    );
  },
  Component: ({ value, prevValue, ...props }) => {
    const StrComponent = stringType.Component!;
    const yText = value as Y.Text;
    const string = yText.toString();

    const prevYText = prevValue as Y.Text | undefined;

    return (
      <span>
        <StrComponent
          value={string}
          prevValue={prevYText?.toString() ?? ""}
          {...props}
        ></StrComponent>
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

export const dataTypes = [
  yDocType,
  yMapType,
  yArrayType,
  yTextType,
  otherYType,
  yAbstractType,
];
