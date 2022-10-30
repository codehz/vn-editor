import { createContext, FC, ReactNode, useContext } from "react";

const AccessoryContext = createContext((<></>) as ReactNode);

export const WithAccessoryContext: FC<{
  children: ReactNode;
  view: ReactNode;
}> = ({ view, children }) => {
  const parent = useAccessoryContext();
  return (
    <AccessoryContext.Provider
      value={
        <>
          {parent}
          {view}
        </>
      }
    >
      {children}
    </AccessoryContext.Provider>
  );
};

export const WithCleanAccessoryContext: FC<{
  children: ReactNode;
  view: ReactNode;
}> = ({ view, children }) => {
  return (
    <AccessoryContext.Provider value={<>{view}</>}>
      {children}
    </AccessoryContext.Provider>
  );
};

export const useAccessoryContext = () => useContext(AccessoryContext);
