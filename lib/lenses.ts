export type GenericLens<T, R> = {
  get(input: T): R;
  set(input: T, value: R): T;
  over(input: T, transform: (input: R) => R): T;
};

export type LensInput = string | number | GenericLens<any, any>;

export type LensType<T, S extends LensInput[]> = S extends []
  ? T
  : S extends [infer Head, ...infer Tail]
  ? Head extends keyof T
    ? Tail extends Array<string | number>
      ? LensType<T[Head], Tail>
      : never
    : Head extends { get: (whole: T) => infer R }
    ? R
    : never
  : never;

function merge<T extends object>(whole: T, part: Partial<T>): T {
  return Object.assign(
    Array.isArray(whole) ? [] : Object.create(null),
    whole,
    part
  );
}

const idlens = {
  get(whole: any) {
    return whole;
  },
  set(_whole: any, part: any) {
    return part;
  },
  over(whole: any, transform: (input: any) => any) {
    return transform(whole);
  },
};

export interface Lens<S extends LensInput[]> {
  get<T>(whole: T): LensType<T, S>;
  set<T>(whole: T, part: LensType<T, S>): T;
  over<T>(whole: T, transform: (input: LensType<T, S>) => LensType<T, S>): T;
}

export function lens<S extends LensInput[]>(...selectors: S): Lens<S> {
  return selectors.reduce(
    (prev: any, attr) =>
      typeof attr === "object"
        ? {
            get(whole: any) {
              return attr.get(prev.get(whole));
            },
            set(whole: any, part: any) {
              return prev.over(whole, (input: any) => attr.set(input, part));
            },
            over(whole: any, transform: (input: any) => any) {
              return prev.over(whole, (input: any) =>
                attr.over(input, transform)
              );
            },
          }
        : {
            get(whole: any) {
              return prev.get(whole)[attr];
            },
            set(whole: any, part: any) {
              return prev.over(whole, (input: any) =>
                merge(input, { [attr]: part })
              );
            },
            over(whole: any, transform: (input: any) => any) {
              return prev.over(whole, (input: any) =>
                merge(input, { [attr]: transform(input[attr]) })
              );
            },
          },
    idlens
  ) as any;
}
