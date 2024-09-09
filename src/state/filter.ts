import { atom, useAtomValue, useSetAtom } from "jotai";
import { YShapeItem } from "../components/filter-sphere";
import { filterYDoc } from "../filter-map";
import { configAtom } from "./config";
import { yDocAtom } from "./ydoc";

const falseFn = () => false;

const filterPredicateAtom = atom<{ fn: (data: YShapeItem) => boolean }>({
  fn: falseFn,
});

export const useUpdateFilterPredicate = () => {
  const set = useSetAtom(filterPredicateAtom);
  return set;
};
const hasValidFilterRuleAtom = atom(false);
const filteredYDocAtom = atom((get) => {
  const hasValidFilterRule = get(hasValidFilterRuleAtom);
  if (!hasValidFilterRule) {
    return {};
  }
  const yDoc = get(yDocAtom);
  const predicate = get(filterPredicateAtom).fn;
  const filterMap = filterYDoc(yDoc, predicate);
  return filterMap;
});
const filterCountAtom = atom((get) => {
  const data = get(filteredYDocAtom);
  return Object.keys(data).length;
});

export const useSetHasValidFilterRule = () => {
  return useSetAtom(hasValidFilterRuleAtom);
};

export const useFilterMap = () => {
  return useAtomValue(filteredYDocAtom);
};

export const useFilterDataCount = () => {
  return useAtomValue(filterCountAtom);
};

export const useIsFilterEnabled = () => {
  const hasValidFilterRule = useAtomValue(hasValidFilterRuleAtom);
  const config = useAtomValue(configAtom);
  return config.parseYDoc && hasValidFilterRule;
};
