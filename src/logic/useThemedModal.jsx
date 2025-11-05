import { useState, useCallback } from "react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import ThemedModal from "../components/modal/ThemedModal";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import successAnim from "../assets/success-animation.lottie";
import errorAnim from "../assets/error-animation.lottie";

/**
 * Hook for controlling ThemedModal programmatically
 *
 * Usage:
 * const { modal, showSuccess, showError, showCustom, closeModal } = useThemedModal();
 *
 * showSuccess("Item created!");
 * showError("Something went wrong");
 * showCustom({ title: "Confirm", content: "Are you sure?", buttons: [...] });
 *
 * return <>{modal}</>;
 */
export function useThemedModal() {
  const [visible, setVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    content: "",
    buttons: [],
    footerAlign: "center",
  });

  const closeModal = useCallback(() => setVisible(false), []);

  const handleClose = useCallback(() => {
    if (modalConfig.onOk) {
      modalConfig.onOk();
    }
    setVisible(false);
  }, [modalConfig]);

  const showCustom = useCallback(
    (config) => {
      setModalConfig({
        ...config,
        onClose: config.onClose || handleClose,
      });
      setVisible(true);
    },
    [handleClose]
  );

  const showSuccess = useCallback(
    (message, subMessage, options = {}) => {
      showCustom({
        title: options.title,
        content: (
          <div className="flex flex-col items-center justify-center">
            <DotLottieReact src={successAnim} loop autoplay />
            <Title level={3} className="text-light-primary text-center mt-5 mb-0">
              {message}
            </Title>
            <Paragraph className="mb-0 text-[16px] text-center text-[#828282]">
              {subMessage}
            </Paragraph>
          </div>
        ),
        ...(options.onOk && {
          buttons: [
            {
              text: options.onOkText || "OK",
              type: "primary",
              onClick: () => {
                closeModal();
                options.onOk?.();
              },
            },
          ],
        }),
        footerAlign: "center",
        onOk: options.onOk,
        ...options,
      });
    },
    [showCustom, closeModal]
  );

  const showError = useCallback(
    (message, subMessage, options = {}) => {
      showCustom({
        title: options.title,
        content: (
          <div className="flex flex-col items-center justify-center">
            <DotLottieReact src={errorAnim} loop autoplay />
            <Title level={3} className="text-light-primary text-center mt-5 mb-0">
              {message}
            </Title>
            <Paragraph className="mb-0 text-[16px] text-center text-[#828282]">
              {subMessage}
            </Paragraph>
          </div>
        ),
        ...(options.onOk && {
          buttons: [
            {
              text: options.onOkText || "OK",
              type: "primary",
              onClick: () => {
                closeModal();
                options.onOk?.();
              },
            },
          ],
        }),
        footerAlign: "center",
        onOk: options.onOk,
        ...options,
      });
    },
    [showCustom, closeModal]
  );

  const modal = <ThemedModal {...modalConfig} visible={visible} onClose={handleClose} />;

  return { modal, showSuccess, showError, showCustom, closeModal };
}
