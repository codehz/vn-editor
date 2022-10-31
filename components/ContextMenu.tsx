import { createContext, FC, ReactElement, ReactNode, useContext } from "react";

const ContextMenu = createContext((<></>) as ReactElement);

export const WithContextMenu: FC<{
  children: ReactNode;
  view: ReactElement;
}> = ({ view, children }) => {
  return (
    <ContextMenu.Provider value={view}>
      {children}
    </ContextMenu.Provider>
  );
};

export const useContextMenu = () => useContext(ContextMenu);
