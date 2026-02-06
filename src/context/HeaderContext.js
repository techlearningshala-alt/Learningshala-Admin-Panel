"use client";

import { createContext, useContext, useState } from "react";

const HeaderContext = createContext(null);

export function HeaderProvider({ children }) {
  const [actionButton, setActionButton] = useState(null);
  const [totalCount, setTotalCount] = useState(null);

  return (
    <HeaderContext.Provider value={{ actionButton, setActionButton, totalCount, setTotalCount }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    return { actionButton: null, setActionButton: () => {}, totalCount: null, setTotalCount: () => {} };
  }
  return context;
}
