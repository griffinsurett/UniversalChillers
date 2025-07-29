import React, { createContext, useContext } from 'react';

// shape of our context
const MenuContext = createContext({
  open: false,
  toggleOpen: () => {},
  close: () => {},
});

/**
 * Hook to access the menu context.
 * Usage: const { open, toggleOpen, close } = useMenuContext();
 */
export const useMenuContext = () => useContext(MenuContext);

/**
 * Provider component. Wrap your menu subtree in this.
 *
 * <MenuProvider id={checkboxId} value={{ open, toggleOpen, close }}>
 *   … your menu UI …
 * </MenuProvider>
 */
export function MenuProvider({ id, value, children }) {
  console.log(
    `[MenuProvider:${id}] Providing menu context → open=${value.open}`
  );
  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}
