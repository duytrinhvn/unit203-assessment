import React, { createContext, useState, useContext } from "react";

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export default function AppProvider({ children }) {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
}
