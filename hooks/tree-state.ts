import { useMemo, useState, useEffect, useCallback } from "react";

export type KeydArray<T extends Record<string, unknown>> = Array<
  T & { key: string }
>;
export type ResolvedType<T, S extends readonly string[]> = S extends []
  ? T
  : T extends Array<infer I extends { key: string }>
  ? S extends [string, ...infer Tail extends string[]]
    ? ResolvedType<I, Tail>
    : never
  : S extends [infer Head extends keyof T, ...infer Tail extends string[]]
  ? ResolvedType<T[Head], Tail>
  : never;

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

function rid() {
  return Math.random().toString(36).substring(2, 15);
}

export interface Tree<T> {
  value: T;
  on(keys: string[], callback: () => void): () => void;
  update<S extends string[]>(keys: S, only?: boolean): void;
  updateByPath<S extends string[]>(
    keys: S,
    value:
      | ResolvedType<T, S>
      | ((old: ResolvedType<T, S>) => ResolvedType<T, S>),
    only?: boolean
  ): void;
  getByPath<S extends string[]>(keys: S): ResolvedType<T, S>;
}

export class TreeRoot<T> implements Tree<T> {
  subscribers: Map<string, () => void> = new Map();
  value: T;
  constructor(input: T) {
    this.value = input;
  }

  on(keys: string[], callback: () => void) {
    const token = keys.join(".") + ".#" + rid();
    this.subscribers.set(token, callback);
    return () => this.subscribers.delete(token);
  }

  update<S extends string[]>(keys: S, only = false) {
    if (!keys.length) {
      for (const cb of this.subscribers.values()) {
        cb();
      }
    } else {
      const token = keys.join(".") + (only ? ".#" : ".");
      for (const [key, cb] of this.subscribers) {
        if (key.startsWith(token)) {
          cb();
        }
      }
    }
  }

  updateByPath<S extends string[]>(
    keys: S,
    value:
      | ResolvedType<T, S>
      | ((old: ResolvedType<T, S>) => ResolvedType<T, S>),
    only = false
  ) {
    if (keys.length === 0) {
      // @ts-ignore: optimize
      this.value = value instanceof Function ? value(this.value) : value;
      this.update([]);
    } else {
      let tmp: any = this.value;
      for (const key of keys.slice(0, -1)) {
        if (tmp === null || tmp === undefined) return;
        if (Array.isArray(tmp)) {
          tmp = tmp.find((x) => x.key === key);
        } else {
          tmp = tmp[key];
        }
      }
      if (tmp === null || tmp === undefined) return;
      const last = keys.at(-1);
      if (Array.isArray(tmp)) {
        const idx = tmp.findIndex((x) => x.key === last);
        tmp[idx] = value instanceof Function ? value(tmp[idx]) : value;
      } else {
        // @ts-ignore: too complex
        tmp[last] = value instanceof Function ? value(tmp[last]) : value;
      }
      this.update(keys, only);
    }
  }

  getByPath<S extends string[]>(keys: S): ResolvedType<T, S> {
    let tmp: any = this.value;
    for (const key of keys) {
      if (tmp === null || tmp === undefined) return undefined as never;
      if (Array.isArray(tmp)) {
        tmp = tmp.find((x) => x.key === key);
      } else {
        tmp = tmp[key];
      }
    }
    return tmp as ResolvedType<T, S>;
  }
}

export class SubTree<P, S extends string[]>
  implements Tree<ResolvedType<P, S>>
{
  parent: Tree<P>;
  path: S;
  constructor(parent: Tree<P>, path: S) {
    this.parent = parent;
    this.path = path;
  }
  get value(): ResolvedType<P, S> {
    return this.parent.getByPath(this.path);
  }
  set value(value: ResolvedType<P, S>) {
    this.parent.updateByPath(this.path, () => value);
  }
  on(keys: string[], callback: () => void) {
    return this.parent.on([...this.path, ...keys], callback);
  }
  update<Q extends string[]>(keys: Q, only = false): void {
    this.parent.update([...this.path, ...keys], only);
  }
  updateByPath<Q extends string[]>(
    keys: Q,
    value:
      | ResolvedType<ResolvedType<P, S>, Q>
      | ((
          old: ResolvedType<ResolvedType<P, S>, Q>
        ) => ResolvedType<ResolvedType<P, S>, Q>),
    only = false
  ): void {
    this.parent.updateByPath(
      [...this.path, ...keys] as any,
      value as any,
      only
    );
  }
  getByPath<Q extends string[]>(keys: Q): ResolvedType<ResolvedType<P, S>, Q> {
    return this.parent.getByPath([...this.path, ...keys]);
  }
}

export function useSubTree<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): SubTree<T, S> {
  return useMemo(() => new SubTree(root, path), [root, path]);
}

function useFlip() {
  const [flip, setFlip] = useState(false);
  return [flip, () => setFlip((x) => !x)] as const;
}

export function useTreeValue<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): ResolvedType<T, S> {
  const [face, flip] = useFlip();
  useEffect(() => root.on(path, flip), [root, path]);
  return useMemo(() => root.getByPath(path), [root, path, face]);
}

export function useTreeUpdater<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): (
  value: ResolvedType<T, S> | ((old: ResolvedType<T, S>) => ResolvedType<T, S>)
) => void {
  return useCallback(
    (
      newvalue:
        | ResolvedType<T, S>
        | ((old: ResolvedType<T, S>) => ResolvedType<T, S>)
    ) => root.updateByPath(path, newvalue),
    [root, path]
  );
}

export type InsertPlace =
  | { before: string }
  | { after: string }
  | { head: true }
  | undefined;

export type ArrayUpdater<T> = {
  insert(
    value: DistributiveOmit<T, "key"> & { key?: string },
    place?: InsertPlace
  ): void;
  remove(key: string): T | undefined;
  update(value: string[] | ((input: T[]) => string[] | undefined)): void;
};

export function useTreeArrayKeys<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): string[] {
  const [face, flip] = useFlip();
  useEffect(() => root.on(path, flip), [root, path]);
  return useMemo(
    () =>
      (root.getByPath(path) as any)?.map((x: { key: string }) => x.key) ?? [],
    [root, path, face]
  );
}

export function useTreeArrayUpdater<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): ArrayUpdater<ResolvedType<T, S>[number]> {
  return useMemo(
    () => ({
      insert(value: any, place?: InsertPlace): void {
        root.updateByPath(
          path,
          (arr: any) => {
            const newitem = { key: rid(), ...value };
            if (place) {
              if ("before" in place) {
                const idx = arr.findIndex((x: any) => x.key === place.before);
                if (idx < 0) arr.push(newitem);
                else arr.splice(idx, 0, newitem);
              } else if ("after" in place) {
                const idx = arr.findIndex((x: any) => x.key === place.after);
                if (idx < 0) arr.unshift(newitem);
                else arr.splice(idx + 1, 0, newitem);
              } else if ("head" in place) {
                arr.unshift(newitem);
              } else {
                throw new Error("invalid place: " + JSON.stringify(place));
              }
            } else {
              arr.push(newitem);
            }
            return arr;
          },
          true
        );
      },
      remove(key: string): any {
        root.updateByPath(
          path,
          (arr: any) => {
            const idx = arr.findIndex((x: any) => x.key === key);
            if (idx >= 0) arr.splice(idx, 1);
            return arr;
          },
          true
        );
      },
      update(updater) {
        root.updateByPath(
          path,
          (arr: any) => {
            const order = updater instanceof Function ? updater(arr) : updater;
            if (order === undefined) return arr;
            const mapped = new Map(arr.map((x: { key: string }) => [x.key, x]));
            arr.length = 0;
            for (const key of order) {
              arr.push(mapped.get(key));
            }
            return arr;
          },
          true
        );
      },
    }),
    [root, path]
  );
}

export function useTreeSnapshot<T, R = T>(
  ctx: Tree<T>,
  pick: (input: T) => R = (a: T) => a as never,
  eq: (a: R, b: R) => boolean = (a, b) => a === b
): R {
  const [value, setValue] = useState(() => pick(ctx.value));
  const update = useCallback(
    () =>
      setValue((old) => {
        try {
          const latest = pick(ctx.value);
          if (!eq(old, latest)) return latest;
          return old;
        } catch {
          return old;
        }
      }),
    [ctx, pick, eq]
  );
  useEffect(() => update(), [ctx, pick]);
  useEffect(() => ctx.on([], update), [ctx]);
  return value;
}
