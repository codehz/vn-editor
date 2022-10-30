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
  on(keys: string[], callback: () => void): string;
  off(token: string): void;
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

  on(keys: string[], callback: () => void): string {
    const token = keys.join(".") + ".#" + rid();
    this.subscribers.set(token, callback);
    return token;
  }

  off(token: string) {
    return this.subscribers.delete(token);
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

class SubTree<T> implements Tree<T> {
  parent: Tree<any>;
  path: string[];
  constructor(parent: Tree<any>, path: string[]) {
    this.parent = parent;
    this.path = path;
  }
  get value() {
    return this.parent.getByPath(this.path);
  }
  set value(value) {
    this.parent.updateByPath(this.path, () => value);
  }
  on(keys: string[], callback: () => void): string {
    return this.parent.on([...this.path, ...keys], callback);
  }
  off(token: string): void {
    this.parent.off(token);
  }
  update<S extends string[]>(keys: S, only = false): void {
    this.parent.update([...this.path, ...keys], only);
  }
  updateByPath<S extends string[]>(
    keys: S,
    value:
      | ResolvedType<T, S>
      | ((old: ResolvedType<T, S>) => ResolvedType<T, S>),
    only = false
  ): void {
    this.parent.updateByPath([...this.path, ...keys] as any, value, only);
  }
  getByPath<S extends string[]>(keys: S): ResolvedType<T, S> {
    return this.parent.getByPath([...this.path, ...keys]);
  }
}

export function useSubTree<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): Tree<ResolvedType<T, S>> {
  return useMemo(() => new SubTree(root, path), [root, path]);
}

export function useTreeValue<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): ResolvedType<T, S> {
  const [value, setValue] = useState(() => root.getByPath(path));
  useEffect(() => {
    const token = root.on(path, () => setValue(root.getByPath(path)));
    return () => root.off(token);
  }, [root, path]);
  return value;
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

export type ArrayUpdater<T> = {
  insert(
    value: DistributiveOmit<T, "key"> & { key?: string },
    before?: string
  ): void;
  insertAfter(
    value: DistributiveOmit<T, "key"> & { key?: string },
    before?: string
  ): void;
  remove(key: string): T | undefined;
  update(value: string[] | ((input: T[]) => string[] | undefined)): void;
};

export function useTreeArrayKeys<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): string[] {
  const [keys, setKeys] = useState(
    () =>
      (root.getByPath(path) as any)?.map((x: { key: string }) => x.key) ?? []
  );
  useEffect(() => {
    const token = root.on(path, () =>
      setKeys(
        (root.getByPath(path) as any)?.map((x: { key: string }) => x.key) ?? []
      )
    );
    return () => root.off(token);
  }, [root, path]);
  return keys;
}

export function useTreeArrayUpdater<T, S extends string[]>(
  root: Tree<T>,
  ...path: S
): ArrayUpdater<ResolvedType<T, S>[number]> {
  return useMemo(
    () => ({
      insert(value: any, before?: string): void {
        root.updateByPath(
          path,
          (arr: any) => {
            const idx = before
              ? arr.findIndex((x: any) => x.key === before)
              : -1;
            if (idx < 0) arr.push({ key: rid(), ...value });
            else arr.splice(idx, 0, { key: rid(), ...value });
            return arr;
          },
          true
        );
      },
      insertAfter(value: any, after?: string): void {
        root.updateByPath(
          path,
          (arr: any) => {
            const idx = after ? arr.findIndex((x: any) => x.key === after) : -1;
            if (idx < 0) arr.unshift({ key: rid(), ...value });
            else arr.splice(idx + 1, 0, { key: rid(), ...value });
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
  useEffect(() => {
    const token = ctx.on([], update);
    return () => ctx.off(token);
  }, [ctx]);
  return value;
}
