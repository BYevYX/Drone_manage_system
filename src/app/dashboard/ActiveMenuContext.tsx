// ActiveMenuContext.tsx
import { createContext, useContext } from 'react';

export const ActiveMenuContext = createContext({
  activeMenu: 'client/dashboard',
  setActiveMenu: (val: string) => {},
});

export const useActiveMenu = () => useContext(ActiveMenuContext);
