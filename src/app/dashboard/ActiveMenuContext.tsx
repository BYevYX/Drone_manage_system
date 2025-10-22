// ActiveMenuContext.tsx
import { createContext, useContext } from 'react';

interface ActiveMenuContextType {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export const ActiveMenuContext = createContext<ActiveMenuContextType>({
  activeMenu: 'dashboard',
  setActiveMenu: () => {},
});

export const useActiveMenu = () => useContext(ActiveMenuContext);
