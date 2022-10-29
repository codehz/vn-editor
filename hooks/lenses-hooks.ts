import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Lens, lens, LensInput, LensType } from "../lib/lenses";

const SUBSCRIBER = Symbol("subscriber");
const VALUE = Symbol("value");
const PARENT = Symbol("parent");
const PATH = Symbol("path");

export interface LensContext<T> {
  [VALUE]: T;
  [SUBSCRIBER]: Set<() => void>;
  toString(): string;
}

class PrimaryLensContext<T extends object> implements LensContext<T> {
  [VALUE]: T;
  readonly [SUBSCRIBER] = new Set<() => void>();
  constructor(value: T) {
    this[VALUE] = value;
  }
  toString(): string {
    return "(root)";
  }
}

class DeriveLensContext<T extends object, S extends LensInput[]>
  implements LensContext<LensType<T, S>>
{
  readonly [PARENT]: LensContext<T>;
  readonly [PATH]: Lens<S>;
  readonly [SUBSCRIBER]: Set<() => void>;
  #debug: string;
  constructor(parent: LensContext<T>, ...path: S) {
    this[PARENT] = parent;
    this[PATH] = lens(...path);
    this[SUBSCRIBER] = parent[SUBSCRIBER];
    this.#debug = path.join(".");
  }

  get [VALUE]() {
    return this[PATH].get(this[PARENT][VALUE]);
  }

  set [VALUE](value: LensType<T, S>) {
    this[PARENT][VALUE] = this[PATH].set(this[PARENT][VALUE], value);
  }

  toString() {
    return this[PARENT].toString() + "/" + this.#debug;
  }
}

export function createLens<T extends object>(defValue: T): LensContext<T> {
  return new PrimaryLensContext(defValue);
}

export function useDeriveLens<T extends object, S extends LensInput[]>(
  ctx: LensContext<T>,
  ...selectors: S
): LensContext<LensType<T, S>> {
  return useMemo(
    () => new DeriveLensContext(ctx, ...selectors),
    [ctx, selectors]
  );
}

export function useLensSnapshot<T, R = T>(
  ctx: LensContext<T>,
  pick: (input: T) => R = (a: T) => a as never,
  eq: (a: R, b: R) => boolean = (a, b) => a === b
): R {
  const [value, setValue] = useState(() => pick(ctx[VALUE]));
  const update = useCallback(
    () =>
      setValue((old) => {
        try {
          const latest = pick(ctx[VALUE]);
          if (!eq(old, latest)) return latest;
          return old;
        } catch {
          return old;
        }
      }),
    [ctx, pick, eq]
  );
  useEffect(() => update(), [ctx, pick]);
  useEffect(() => {
    const subs = ctx[SUBSCRIBER];
    subs.add(update);
    return () => void subs.delete(update);
  }, [ctx]);
  return value;
}

export function useLens<T, S extends LensInput[]>(
  ctx: LensContext<T>,
  ...selectors: S
) {
  const lenses = useMemo(() => lens(...selectors), [selectors]);
  const [value, setValue] = useState(() => lenses.get(ctx[VALUE]));
  const update = useCallback(
    () =>
      setValue((old) => {
        try {
          return lenses.get(ctx[VALUE]);
        } catch {
          return old;
        }
      }),
    [ctx, lenses]
  );
  useEffect(() => update(), [ctx, lenses]);
  useEffect(() => {
    const subs = ctx[SUBSCRIBER];
    subs.add(update);
    return () => void subs.delete(update);
  }, [ctx]);
  const set = useCallback(
    (value: SetStateAction<LensType<T, S>>) => {
      ctx[VALUE] =
        typeof value === "function"
          ? lenses.over(ctx[VALUE], value as any)
          : lenses.set(ctx[VALUE], value);
      ctx[SUBSCRIBER].forEach((f) => f());
    },
    [ctx, lenses]
  );
  return [value, set] as [
    LensType<T, S>,
    Dispatch<SetStateAction<LensType<T, S>>>
  ];
}

export function useLensUpdater<T, S extends LensInput[]>(
  ctx: LensContext<T>,
  ...selectors: S
) {
  const lenses = useMemo(() => lens(...selectors), [selectors]);
  return useCallback(
    (value: SetStateAction<LensType<T, S>>) => {
      ctx[VALUE] =
        typeof value === "function"
          ? lenses.over(ctx[VALUE], value as any)
          : lenses.set(ctx[VALUE], value);
      ctx[SUBSCRIBER].forEach((f) => f());
    },
    [ctx, lenses]
  );
}

export function inspectLens<T, S extends LensInput[]>(
  ctx: LensContext<T>,
  ...selectors: S
) {
  return lens(...selectors).get(ctx[VALUE]);
}
