import React, { useEffect } from "react";
import { Modal } from "antd";
import CustomButton from "../form/CustomButton";

/**
 * buttons = [
 *   { text: "Delete", type: "primary", onClick: handleDelete, icon: <DeleteOutlined /> },
 *   { text: "Cancel", type: "secondary", onClick: handleClose }
 * ]
 */
const ThemedModal = ({
  title,
  content,
  visible = false,
  onClose,
  buttons = [],
  footerAlign = "center",
  styles = {},
  autoCloseTime = 0, // seconds
  ...rest
}) => {
  useEffect(() => {
    if (!visible) return;
    if (autoCloseTime > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, autoCloseTime * 1000);
      return () => clearTimeout(timer);
    }
  }, [autoCloseTime, visible]);

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={null}
      styles={{
        body: {
          // padding: "45px 20px",
          ...styles.body,
        },
        content: {
          backgroundColor: "var(--color-modal-background)",
          color: "var(--color-text)",
          borderRadius: "30px",
          padding: "40px 24px",
          ...styles.content,
        },
      }}
      closable={false}
      width={430}
      {...rest}
    >
      <div>{content}</div>

      {buttons.length > 0 && (
        <div
          className={`
            mt-3
            grid
            grid-cols-2
            gap-2
            w-full
            ${footerAlign === "right" ? "justify-end" : "justify-center"}
          `}
        >
          {buttons.map((btn, index) => {
            const { type, onClick, text, bgColor, color, icon, ...rest } = btn;
            return (
              <CustomButton
                key={index}
                btnType={type || "primary"}
                onClick={onClick}
                className={`flex items-center justify-center gap-1 whitespace-nowrap`}
                style={{
                  backgroundColor: bgColor || undefined,
                  color: color || "#fff",
                }}
                icon={icon}
                text={text}
                {...rest}
              />
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default ThemedModal;
