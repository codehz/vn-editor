import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
} from "react";
import { Tree, useTreeArrayUpdater } from "../hooks/tree-state";

const Context = createContext<() => void>(() => {});

export const useRemoveHandler = () => useContext(Context);

export function ArrayRemoveHandler<T>({
  lens,
  id,
  children,
}: {
  lens: Tree<T[]>;
  id: string;
  children: ReactNode;
}) {
  const updater = useTreeArrayUpdater(lens);
  const handler = useCallback(() => updater.remove(id), [id]);
  return <Context.Provider value={handler}>{children}</Context.Provider>;
}
