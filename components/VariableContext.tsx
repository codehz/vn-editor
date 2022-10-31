import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { SubTree, Tree } from "../hooks/tree-state";
import { Variable } from "../lib/types";

export type VariableDescriptor = {
  key: string;
  name: string;
  get(): Tree<Variable>;
};

export type VariableSection = {
  title: string;
  tree: Tree<Variable[]>;
};

const VariableContext = createContext({
  list: [] as VariableSection[],
  find(key: string): [string, SubTree<Variable[], [string]>] | undefined {
    return undefined;
  },
});

export const useVariableContext = () => useContext(VariableContext);

export const WithVariableContext: FC<{
  name: string;
  tree: Tree<Variable[]>;
  children: ReactNode;
}> = ({ name, tree, children }) => {
  const parent = useVariableContext();
  const value = useMemo(
    () => ({
      list: [
        ...parent.list,
        {
          title: name,
          tree,
        },
      ],
      find(key: string): [string, SubTree<Variable[], [string]>] | undefined {
        const found = new SubTree<Variable[], [string]>(tree, [key]);
        if (found.value) return [name, found];
        return parent.find(key);
      },
    }),
    [parent, name, tree]
  );
  return (
    <VariableContext.Provider value={value}>
      {children}
    </VariableContext.Provider>
  );
};
