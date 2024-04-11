import {
  DataItemProps,
  defineDataType,
  objectType,
  stringType,
} from "@textea/json-viewer";
import { ComponentType } from "react";
import * as Y from "yjs";
import { Badge } from "./components/ui/badge";
import { toast } from "./components/ui/use-toast";
import { useConfig } from "./state";
import { getYTypeName, isYType, parseYType } from "./y-type";

const TypeLabel = ({ value }: { value: unknown }) => {
  const typeName = getYTypeName(value as Y.AbstractType<unknown>);
  return (
    <Badge
      variant="outline"
      className="mr-1 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        console.log(value);
        toast({
          duration: 2000,
          description: "Check the console for the value",
        });
      }}
    >
      {typeName}
    </Badge>
  );
};

const YTypePreComponent = ({
  value,
  prevValue,
  ...props
}: DataItemProps<unknown>) => {
  const ObjPreComponent = objectType.PreComponent!;
  const [config] = useConfig();
  const parsedValue = parseYType(value as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  const parsedPrevValue = parseYType(prevValue as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  if (typeof parsedValue === "string") {
    return null;
  }
  return (
    <span>
      <TypeLabel value={value} />
      <ObjPreComponent
        value={parsedValue as object}
        prevValue={parsedPrevValue as object}
        {...props}
      ></ObjPreComponent>
    </span>
  );
};

const YTypeComponent: ComponentType<DataItemProps<any>> = ({
  value,
  prevValue,
  ...props
}: DataItemProps<object>) => {
  const StrComponent = stringType.Component!;
  const ObjComponent = objectType.Component!;
  const [config] = useConfig();
  const inspectedYDoc = config.view === "ydoc";
  if (inspectedYDoc) {
    if (typeof value === "string") {
      throw new Error("YDoc should not be a string");
    }
    return (
      <ObjComponent
        value={value}
        prevValue={prevValue}
        {...props}
      ></ObjComponent>
    );
  }

  const parsedValue = parseYType(value as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  const parsedPrevValue = parseYType(prevValue as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  if (typeof parsedValue === "string") {
    return (
      <StrComponent
        value={parsedValue}
        prevValue={parsedPrevValue as string}
        {...props}
      ></StrComponent>
    );
  }

  return (
    <ObjComponent
      value={parsedValue}
      prevValue={parsedPrevValue as object}
      {...props}
    ></ObjComponent>
  );
};

const YTypePostComponent: ComponentType<DataItemProps<any>> = ({
  value,
  prevValue,
  ...props
}: DataItemProps<object>) => {
  const ObjPostComponent = objectType.PostComponent!;
  const [config] = useConfig();
  const inspectedYDoc = config.view === "ydoc";

  if (inspectedYDoc) {
    if (typeof value === "string") {
      throw new Error("YDoc should not be a string");
    }
    return (
      <ObjPostComponent
        value={value}
        prevValue={prevValue as object}
        {...props}
      ></ObjPostComponent>
    );
  }

  const parsedValue = parseYType(value as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  const parsedPrevValue = parseYType(prevValue as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  if (typeof parsedValue === "string") {
    return null;
  }

  return (
    <ObjPostComponent
      value={parsedValue}
      prevValue={parsedPrevValue as object}
      {...props}
    ></ObjPostComponent>
  );
};

export const yDataType = defineDataType<unknown>({
  is: isYType,
  PreComponent: YTypePreComponent,
  PostComponent: YTypePostComponent,
  Component: YTypeComponent,
});
