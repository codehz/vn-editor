export const randomid = () => {
  return (Math.random() + 1).toString(36).substring(7);
};

export function compareByJson<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function arrayKeys(x: { key: string }[]): string[] {
  return x.map((i) => i.key);
}
