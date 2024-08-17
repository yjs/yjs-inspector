import {
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { Filter } from "lucide-react";
import { useState } from "react";
import {
  useConfig,
  useFilterDataCount,
  useIsFilterEnabled,
  useSetHasValidFilterRule,
  useUpdateFilterPredicate,
} from "../state";
import {
  createFlattenFilterGroup,
  filterFnList,
  schema,
  themeSpec,
} from "./filter-sphere";
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
  const { predicate, validRuleCount, reset, context } = useFilterSphere({
    schema,
    filterFnList,
    defaultRule: createFlattenFilterGroup(),
  });
  const isFilterEnabled = useIsFilterEnabled();
  const setHasValidFilterRule = useSetHasValidFilterRule();
  const countOfFilterData = useFilterDataCount();

  const handleClick = () => {
    setOpen(true);
    return;
  };

  const updateFilter = () => {
    updateFilterPredicate({ fn: predicate });
    setHasValidFilterRule(validRuleCount > 0);
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
          variant={isFilterEnabled ? "default" : "secondary"}
          disabled={!config.parseYDoc}
          onClick={handleClick}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter {isFilterEnabled ? `(${countOfFilterData})` : ""}
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
      <span className="absolute bottom-2 left-2 text-xs text-muted-foreground opacity-70">
        Powered by&nbsp;
        <a
          href="https://www.npmjs.com/package/@fn-sphere/filter"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Filter Sphere
        </a>
      </span>
    </DialogContent>
  );
}
