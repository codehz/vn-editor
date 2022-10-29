import React, { ReactElement, ReactNode } from "react";
import { LensContext, useDeriveLens } from "../hooks/lenses-hooks";
import { LensInput, LensType } from "../lib/lenses";

export function LensProxy<
  T extends object,
  S extends LensInput[]
>({
  lens,
  props,
  children,
}: {
  lens: LensContext<T>;
  props: S;
  children: (lens: LensContext<LensType<T, S>>) => ReactElement;
}) {
  const derived = useDeriveLens(lens, ...props);
  return children(derived);
}
