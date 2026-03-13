import {
  DataItemProps,
  defineDataType,
  stringType,
} from "@textea/json-viewer";
import { Pencil } from "lucide-react";
import { useYDocEdit } from "./components/ydoc-edit-context";
import { Button } from "./components/ui/button";
import { useConfig } from "./state/index";
import { getYTypeFromPath, isYArray, isYMap } from "./y-shape";

function isEditablePrimitive(value: unknown): value is string | number | boolean | null {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  );
}

const EditablePrimitiveComponent = ({
  value,
  prevValue,
  path,
  ...props
}: DataItemProps<string | number | boolean | null>) => {
  const editContext = useYDocEdit();
  const [config] = useConfig();
  const StrComponent = stringType.Component!;
  const displayValue = value === null ? "null" : String(value);

  const canEdit =
    config.editable &&
    config.parseYDoc &&
    editContext &&
    path.length >= 1 &&
    (() => {
      const parent = getYTypeFromPath(editContext.yDoc, path.slice(0, -1));
      return isYMap(parent) || isYArray(parent);
    })();

  return (
    <span className="inline-flex items-center gap-1">
      <StrComponent
        value={displayValue}
        prevValue={prevValue !== undefined && prevValue !== null ? String(prevValue) : undefined}
        path={path}
        {...props}
      />
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            editContext.openEditPrimitive(path, value);
          }}
          title="Edit value"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </span>
  );
};

export const editablePrimitiveType = defineDataType<string | number | boolean | null>({
  is: (value): value is string | number | boolean | null => isEditablePrimitive(value),
  Component: EditablePrimitiveComponent,
});
