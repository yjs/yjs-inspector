import {
  createFilterGroup,
  createFilterTheme,
  createSingleFilter,
  defineTypedFn,
  FilterTheme,
  presetFilter,
  SingleFilter,
  useFilterRule,
  useRootRule,
  useView,
} from "@fn-sphere/filter";
import { CircleAlert, X } from "lucide-react";
import { ChangeEvent, useCallback } from "react";
import { z } from "zod";
import { isYText, isYXmlText } from "../y-shape";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MultiSelect } from "./ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const schema = z.object({
  type: z
    .union([
      z.literal("YText"),
      z.literal("YMap"),
      z.literal("YArray"),
      z.literal("YXmlElement"),
      z.literal("YXmlFragment"),
      z.literal("YAbstractType"),
      z.literal("YDoc"),
      z.literal("Object"),
      z.literal("Boolean"),
      z.literal("String"),
      z.literal("Number"),
      z.literal("Uint8Array"),
    ])
    .describe("Type"),
  key: z.string().describe("Key"),
  path: z.string().describe("Path"),
  value: z.unknown().describe("Value"),
});

export type YShapeItem = z.infer<typeof schema>;

const likeFn = defineTypedFn({
  name: "Likes",
  define: z.function().args(z.unknown(), z.string()).returns(z.boolean()),
  implement: (value, string) => {
    if (typeof value === "string") {
      return value.includes(string);
    }
    if (typeof value === "number") {
      return value.toString().includes(string);
    }
    if (isYText(value)) {
      return value.toString().includes(string);
    }
    if (isYXmlText(value)) {
      return value.toString().includes(string);
    }
    return false;
  },
});

export const filterFnList = [likeFn, ...presetFilter];

const componentsSpec = {
  Button: (props) => {
    return <Button variant="outline" {...props} />;
  },
  Input: ({ onChange, ...props }) => {
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
      },
      [onChange],
    );
    return <Input className="min-w-32" onChange={handleChange} {...props} />;
  },
  Select: ({ value, onChange, options = [], className, disabled }) => {
    const selectedIdx = options.findIndex((option) => option.value === value);
    const handleChange = useCallback(
      (value: string) => {
        const index = Number(value);
        onChange?.(options[index].value);
      },
      [options, onChange],
    );
    return (
      <Select
        value={String(selectedIdx)}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className="min-w-24">
          <SelectValue className={className} />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option, index) => (
            <SelectItem key={option.label} value={String(index)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
  MultipleSelect: ({ value = [], options = [], onChange }) => {
    const selectedIndices = value.map((val) =>
      String(options.findIndex((option) => option.value === val)),
    );
    const handleChange = useCallback(
      (newVal: string[]) => {
        const selectedOptions = Array.from(newVal, (option) => {
          const index = Number(option);
          const selectedOption = options[index];
          if (!selectedOption) return;
          return selectedOption.value;
        }).filter((i) => i !== undefined);
        onChange?.(selectedOptions);
      },
      [options, onChange],
    );

    return (
      <MultiSelect
        options={options.map((option, index) => ({
          label: option.label,
          value: String(index),
        }))}
        selected={selectedIndices}
        onChange={handleChange}
      />
    );
  },
} satisfies Partial<FilterTheme["components"]>;

export type SingleFilterRuleProps = {
  rule: SingleFilter;
};

export const createFlattenFilterGroup = () =>
  createFilterGroup({
    op: "or",
    conditions: [
      createFilterGroup({
        op: "and",
        conditions: [
          createSingleFilter({
            name: "Equals",
            path: ["type"],
          }),
        ],
      }),
    ],
  });

const SingleFilterView = ({ rule }: SingleFilterRuleProps) => {
  const {
    ruleState: { isLastRule, isValid, parentGroup },
    removeRule,
    appendRule,
  } = useFilterRule(rule);
  const { numberOfRules, getRootRule, updateRootRule } = useRootRule();
  const { Button: ButtonView } = useView("components");
  const { FieldSelect, FilterSelect, FilterDataInput } = useView("templates");
  const rootRule = getRootRule();

  const isLastRuleInGroup =
    isLastRule &&
    rootRule.conditions[rootRule.conditions.length - 1]?.id === parentGroup.id;

  return (
    <div className="flex items-center gap-2">
      <FieldSelect rule={rule} />
      <FilterSelect rule={rule} />
      <FilterDataInput rule={rule} />

      <ButtonView
        onClick={() => {
          appendRule();
        }}
      >
        And
      </ButtonView>
      {isLastRuleInGroup && (
        <ButtonView
          onClick={() => {
            rootRule.conditions.push(
              createFilterGroup({
                op: "and",
                conditions: [createSingleFilter()],
              }),
            );
            updateRootRule(rootRule);
          }}
        >
          Or
        </ButtonView>
      )}
      {isValid ? null : (
        <div className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <CircleAlert className="h-4 w-4" />
        </div>
      )}
      {numberOfRules > 1 && (
        <button
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={() => removeRule(true)}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const templatesSpec = {
  SingleFilter: SingleFilterView,
  FilterGroupContainer: ({ children }) => (
    <div className="flex flex-col items-start">{children}</div>
  ),
  RuleJoiner: ({ joinBetween: [before, after], parent }) => {
    const op = parent.op === "and" ? "And" : "Or";
    if (before.type === "Filter" && after.type === "Filter") {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="h-3 w-0.5 rounded-md bg-accent" />
          <Button variant="outline" size="sm" disabled>
            {op}
          </Button>
          <div className="h-3 w-0.5 rounded-md bg-accent" />
        </div>
      );
    }
    return (
      <Button variant="outline" size="sm" disabled className="my-4">
        {op}
      </Button>
    );
  },
} satisfies Partial<FilterTheme["templates"]>;

export const filterTheme = createFilterTheme({
  components: componentsSpec,
  templates: templatesSpec,
});
