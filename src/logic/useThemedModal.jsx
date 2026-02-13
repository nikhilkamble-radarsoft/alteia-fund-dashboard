import { useState, useCallback } from "react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import ThemedModal from "../components/modal/ThemedModal";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import successAnim from "../assets/success-animation.lottie";
import successAnimJson from "../assets/success-animation.json";
import errorAnim from "../assets/error-animation.lottie";
import { FormField } from "../components/form/Field";
import { Form } from "antd";
import FormBuilder from "../components/form/FormBuilder";
import { useTranslation } from "react-i18next";

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
  const [confirmForm] = Form.useForm();
  const { t } = useTranslation("form");

  const commonStyles = {
    content: {
      padding: "24px 32px",
    },
  };

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
        styles: {
          ...commonStyles,
          ...config.styles,
        },
      });
      setVisible(true);
    },
    [handleClose],
  );

  const showSuccess = useCallback(
    (message, subMessage, options = {}) => {
      showCustom({
        title: options.title,
        content: (
          <div className="flex flex-col items-center justify-center ">
            <DotLottieReact src={successAnim} loop autoplay />
            <Title level={3} className="text-light-primary text-center mt-5 mb-0">
              {message}
            </Title>
            <Paragraph className="mb-0 text-[16px] text-center text-[#828282]">
              {subMessage}
            </Paragraph>
          </div>
        ),
        ...(options.onOk &&
          options.onOkText && {
            buttons: [
              {
                text: options.onOkText,
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
    [showCustom, closeModal],
  );

  const showError = useCallback(
    (message, subMessage, options = {}) => {
      showCustom({
        title: options.title,
        content: (
          <div className="flex flex-col items-center justify-center">
            <DotLottieReact src={errorAnim} loop autoplay />
            <Title level={3} className="text-danger text-center mt-5 mb-0">
              {message}
            </Title>
            <Paragraph className="mb-0 text-[16px] text-center text-[#828282]">
              {subMessage}
            </Paragraph>
          </div>
        ),
        ...(options.onOk &&
          options.onOkText && {
            buttons: [
              {
                text: options.onOkText,
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
    [showCustom, closeModal],
  );

  const showConfirm = useCallback(
    ({
      title,
      message,
      subMessage,
      variant = "success",
      fields = [],
      initialValues,
      confirmText,
      cancelText,
      onConfirm,
      twoColumn = false,
      showAnimation = true,
      multiLanguage = false,
      destroyOnHidden = true,
      ...options
    } = {}) => {
      const finalConfirmText = confirmText || t("common.confirm");
      const finalCancelText = cancelText || t("common.cancel");
      const isSuccess = variant === "success";

      setModalConfig({
        title,
        buttons: [],
        destroyOnHidden,
        content: (
          <div className="flex flex-col justify-center">
            {showAnimation && (
              <div className="mb-5 flex justify-center">
                <DotLottieReact src={isSuccess ? successAnim : errorAnim} loop autoplay />
              </div>
            )}
            <div className="flex flex-col items-center justify-center mb-8">
              {message && (
                <Title
                  level={3}
                  className={`${isSuccess ? "text-light-primary" : "text-danger"} text-center mb-0`}
                >
                  {message}
                </Title>
              )}
              {subMessage && (
                <Paragraph className="mb-0 text-[16px] text-center text-[#828282]">
                  {subMessage}
                </Paragraph>
              )}
            </div>
            <FormBuilder
              formConfig={fields}
              initialValues={initialValues}
              multiLanguage={multiLanguage}
              twoColumn={twoColumn}
              submitText={finalConfirmText}
              cancelText={finalCancelText}
              onFinish={async (values) => {
                if (onConfirm) {
                  try {
                    const shouldClose = await Promise.resolve(onConfirm(values));

                    if (shouldClose || shouldClose === undefined) {
                      confirmForm.resetFields();
                      closeModal();
                    }
                  } catch (error) {
                    console.error("Confirmation failed:", error);
                  }
                } else {
                  confirmForm.resetFields();
                  closeModal();
                }
              }}
              onCancel={closeModal}
            />
          </div>
        ),
        ...options,
      });
      setVisible(true);
    },
    [closeModal, t],
  );

  const modal = <ThemedModal {...modalConfig} visible={visible} onClose={handleClose} />;

  return { modal, showSuccess, showError, showCustom, showConfirm, closeModal };
}
