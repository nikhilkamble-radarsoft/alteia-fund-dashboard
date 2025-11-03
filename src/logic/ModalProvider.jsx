import React, { createContext, useContext } from "react";
import { useThemedModal } from "./useThemedModal";

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const modalControls = useThemedModal();

  return (
    <ModalContext.Provider value={modalControls}>
      {children}
      {modalControls.modal}
    </ModalContext.Provider>
  );
};

export const useGlobalModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useGlobalModal must be used inside <ModalProvider>");
  }
  return ctx;
};
