import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { Tree } from "../hooks/tree-state";
import { Variable } from "../lib/types";

export type VariableDescriptor = {
  key: string;
  name: string;
  get(): Tree<Variable>;
};

export type VariableSection = {
  title: string;
  data: VariableDescriptor[];
};

const VariableContext = createContext({
  list(): VariableSection[] {
    return [];
  },
  find(key: string): [string, Tree<Variable>] | undefined {
    return undefined;
  },
});

export const useVariableContext = () => useContext(VariableContext);

export const WithVariableContext: FC<{
  name: string;
  list(): VariableDescriptor[];
  children: ReactNode;
}> = ({ name, list, children }) => {
  const parent = useVariableContext();
  const value = useMemo(
    () => ({
      list(): VariableSection[] {
        return [
          ...parent.list(),
          {
            title: name,
            data: list(),
          },
        ];
      },
      find(key: string): [string, Tree<Variable>] | undefined {
        const found = list()
          .find((x) => x.key === key)
          ?.get();
        if (found) return [name, found];
        return parent.find(key);
      },
    }),
    [parent, name, list]
  );
  return (
    <VariableContext.Provider value={value}>
      {children}
    </VariableContext.Provider>
  );
};
