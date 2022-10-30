import React, { ReactElement, ReactNode } from "react";
import { ResolvedType, Tree, useSubTree } from "../hooks/tree-state";

export function TreeProxy<
  T extends object,
  S extends T extends Array<{ key: string }> ? string : string & keyof T
>({
  tree,
  prop,
  children,
}: {
  tree: Tree<T>;
  prop: S;
  children: (tree: Tree<ResolvedType<T, [S]>>) => ReactElement;
}) {
  const derived = useSubTree(tree, prop);
  return children(derived);
}
