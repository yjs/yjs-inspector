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
import { getYTypeName, isYShape, parseYShape } from "./y-shape";

const TypeLabel = ({ value }: { value: unknown }) => {
  const typeName = getYTypeName(value as Y.AbstractType<unknown>);
  return (
    <Badge
      variant="outline"
      className="mr-1 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        // This logs is expected to be used for user debugging
        // Do not remove this log!
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
  if (!config.parseYDoc) {
    if (typeof value === "string") {
      throw new Error("YDoc should not be a string");
    }
    return (
      <span>
        <TypeLabel value={value} />
        <ObjPreComponent
          value={value as object}
          prevValue={prevValue as object}
          {...props}
        ></ObjPreComponent>
      </span>
    );
  }
  const parsedValue = parseYShape(value as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  const parsedPrevValue = parseYShape(prevValue as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  if (typeof parsedValue === "string") {
    return <TypeLabel value={value} />;
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

  if (!config.parseYDoc) {
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

  const parsedValue = parseYShape(value as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  const parsedPrevValue = parseYShape(prevValue as Y.AbstractType<unknown>, {
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

  if (!config.parseYDoc) {
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

  const parsedValue = parseYShape(value as Y.AbstractType<unknown>, {
    showDelta: config.showDelta,
  });
  const parsedPrevValue = parseYShape(prevValue as Y.AbstractType<unknown>, {
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
  is: isYShape,
  PreComponent: YTypePreComponent,
  PostComponent: YTypePostComponent,
  Component: YTypeComponent,
});
