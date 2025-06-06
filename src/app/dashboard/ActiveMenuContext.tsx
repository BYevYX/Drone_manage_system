// ActiveMenuContext.tsx
import { createContext, useContext } from 'react';



export const ActiveMenuContext = createContext({
  activeMenu: 'dashboard',
  setActiveMenu: (val: string) => {},
});

export const useActiveMenu = () => useContext(ActiveMenuContext);
