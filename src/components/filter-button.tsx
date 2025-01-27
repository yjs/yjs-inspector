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
} from "../state/index";
import {
  createFlattenFilterGroup,
  filterFnList,
  filterTheme,
  schema,
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
    <Dialog
      // Workaround https://github.com/shadcn-ui/ui/issues/235
      modal={false}
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
      <FilterSphereProvider theme={filterTheme} context={context}>
        <FilterDialog
          onConfirm={() => {
            setOpen(false);
            updateFilter();
          }}
          onReset={() => {
            reset();
          }}
        />
      </FilterSphereProvider>
    </Dialog>
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
    // See https://github.com/shadcn-ui/ui/issues/16
    <DialogContent className={"max-h-[90vh] max-w-xl overflow-y-auto"}>
      <DialogHeader>
        <DialogTitle>Filter</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-4 items-center gap-4">
        <FilterBuilder />
      </div>
      <DialogFooter className="relative">
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
        <span
          className="text-muted-foreground absolute bottom-0 left-0 text-xs opacity-70"
          style={{ marginLeft: 0 }}
        >
          Powered by&nbsp;
          <a
            href="https://github.com/lawvs/fn-sphere"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Filter Sphere
          </a>
        </span>
      </DialogFooter>
    </DialogContent>
  );
}
