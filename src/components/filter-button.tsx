import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { Filter } from "lucide-react";
import { useState } from "react";
import { queryFilterSet } from "../filter-set";
import { useConfig, useFilterSet, useYDoc } from "../state";
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
  const [yDoc] = useYDoc();
  const [, setFilterSet] = useFilterSet();
  const { context, getPredicate } = useFilterSphere({
    schema,
    defaultRule: createFlattenFilterGroup(),
  });
  const [countOfRule, setCountOfRule] = useState(0);

  const handleClick = () => {
    setOpen(true);
    return;
  };

  const updateFilter = () => {
    const predicate = getPredicate();
    let count = 0;
    const filterSet = queryFilterSet(yDoc, (data) => {
      console.log("data", data);
      const ret = predicate(data);
      if (ret) {
        count++;
      }
      return ret;
    });
    setCountOfRule(count);
    setFilterSet(filterSet);
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
          Filter {countOfRule > 0 ? `(${countOfRule})` : ""}
        </Button>
        <FilterDialog
          onConfirm={() => {
            setOpen(false);
            updateFilter();
          }}
        />
      </Dialog>
    </FilterSphereProvider>
  );
}

function FilterDialog({ onConfirm }: { onConfirm: () => void }) {
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
