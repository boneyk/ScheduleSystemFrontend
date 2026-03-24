import { createContext, ReactNode, useContext, useState } from 'react';

interface DropdownContextType {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return <DropdownContext.Provider value={{ activeId, setActiveId }}>{children}</DropdownContext.Provider>;
};

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdownContext должен использоваться с DropdownProvider');
  }
  return context;
};
