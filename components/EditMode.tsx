import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const Context = createContext<[object | null, (value: object | null) => void]>([
  null,
  () => {},
]);

export const useEditMode = (cleanup?: () => void) => {
  const atom = useRef(false);
  const [current, setEditMode] = useContext(Context);
  const update = useCallback(
    (value: boolean) => setEditMode(value ? atom : null),
    [setEditMode]
  );
  useEffect(() => {
    if (atom === current) {
      atom.current = true;
    } else if (atom.current && atom !== current) {
      atom.current = false;
      cleanup?.();
    }
  }, [cleanup]);
  return [atom === current, update] as const;
};

export const EditModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const value = useState<object | null>(null);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useNestedEditModeProvider = () => {
  const [focusWithin, setFocusWithin] = useState(false);
  const Factory = useCallback(function NestedEditModeProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [current, setCurrent] = useContext(Context);
    const [inner, setInner] = useState<object | null>();
    const setNested = useCallback((value: object | null) => {
      setCurrent(value);
      setInner(value);
    }, []);
    const state = inner == current && inner !== null;
    useEffect(() => setFocusWithin(state), [state]);
    return (
      <Context.Provider value={[current, setNested]}>
        {children}
      </Context.Provider>
    );
  },
  []);
  return [focusWithin, Factory] as const;
};
