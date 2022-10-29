import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
} from "react";
import { LensContext, useLensUpdater } from "../hooks/lenses-hooks";

const Context = createContext<() => void>(() => {});

export const useRemoveHandler = () => useContext(Context);

export function ArrayRemoveHandler<T>({
  lens,
  idx,
  children,
}: {
  lens: LensContext<T[]>;
  idx: number;
  children: ReactNode;
}) {
  const update = useLensUpdater(lens);
  const handler = useCallback(
    () => update((arr) => [...arr.slice(0, idx), ...arr.slice(idx + 1)]),
    [idx]
  );
  return <Context.Provider value={handler}>{children}</Context.Provider>;
}
