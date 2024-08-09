import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { Filter } from "lucide-react";
import { useState } from "react";
import {
  useConfig,
  useFilterCount,
  useIsFilterEnable,
  useUpdateFilterPredicate,
} from "../state";
import { createFlattenFilterGroup, schema, themeSpec } from "./filter-sphere";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function FilterButton() {
  const [config] = useConfig();
  const [open, setOpen] = useState(false);
  const updateFilterPredicate = useUpdateFilterPredicate();
  const filterEnable = useIsFilterEnable();
  const countOfFilterData = useFilterCount();
  const { getPredicate, reset, context } = useFilterSphere({
    schema,
    defaultRule: createFlattenFilterGroup(),
  });

  const handleClick = () => {
    setOpen(true);
    return;
  };

  const updateFilter = () => {
    const predicate = getPredicate();
    updateFilterPredicate({ fn: predicate });
  };

  return (
    <FilterSphereProvider theme={themeSpec} context={context}>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (open) {
            return;
          }
          updateFilter();
        }}
      >
        <Button
          variant="secondary"
          disabled={!config.parseYDoc}
          onClick={handleClick}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter {filterEnable ? `(${countOfFilterData})` : ""}
        </Button>
        <FilterDialog
          onConfirm={() => {
            setOpen(false);
            updateFilter();
          }}
          onReset={() => {
            reset();
          }}
        />
      </Dialog>
    </FilterSphereProvider>
  );
}

function FilterDialog({
  onConfirm,
  onReset,
}: {
  onConfirm: () => void;
  onReset: () => void;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Filter</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-4 items-center gap-4">
        <FilterBuilder />
      </div>
      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => {
            onReset();
          }}
        >
          Reset
        </Button>
        <Button
          onClick={() => {
            onConfirm();
          }}
        >
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
