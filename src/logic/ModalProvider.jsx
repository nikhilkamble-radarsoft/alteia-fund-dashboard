import React, { createContext, useContext } from "react";
import { useThemedModal } from "./useThemedModal";
import { useMediaQuery } from "react-responsive";
import { inProdMode } from "../utils/constants";

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const modalControls = useThemedModal();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <ModalContext.Provider value={{ ...modalControls, isMobile }}>
      {children}
      {modalControls.modal}
    </ModalContext.Provider>
  );
};

export const useGlobalModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx && !inProdMode) {
    throw new Error("useGlobalModal must be used inside <ModalProvider>");
  }
  return ctx;
};
