import {
  createFilterGroup,
  createSingleFilter,
  FilterThemeInput,
  SingleFilter,
  ThemeSpec,
  useFilterRule,
  useRootRule,
  useView,
} from "@fn-sphere/filter";
import { CircleAlert, X } from "lucide-react";
import { ChangeEvent, useCallback } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  value: z.unknown(),
});

export type YShapeItem = z.infer<typeof schema>;

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
        <SelectTrigger>
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
} satisfies Partial<ThemeSpec["components"]>;

export type SingleFilterRuleProps = {
  rule: SingleFilter;
};

export const createFlattenFilterGroup = () =>
  createFilterGroup({
    op: "or",
    conditions: [
      createFilterGroup({
        op: "and",
        conditions: [createSingleFilter()],
      }),
    ],
  });

const SingleFilterView = ({ rule }: SingleFilterRuleProps) => {
  const {
    ruleState: { isLastRule, isValid },
    removeRule,
    appendRule,
  } = useFilterRule(rule);
  const { numberOfRules, getRootRule, updateRootRule } = useRootRule();
  const { Button: ButtonView } = useView("components");
  const { FieldSelect, FilterSelect, FilterDataInput } = useView("templates");

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
      {isLastRule && (
        <ButtonView
          onClick={() => {
            const rootRule = getRootRule();
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
  FilterGroupContainer: ({ children }) => <div>{children}</div>,
} satisfies Partial<ThemeSpec["templates"]>;

export const themeSpec: FilterThemeInput = {
  components: componentsSpec,
  templates: templatesSpec,
};
