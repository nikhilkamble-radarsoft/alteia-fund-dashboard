import React from 'react'
import { Modal } from 'antd'
import CustomButton from '../form/CustomButton'

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
  footerAlign = 'center',
  ...rest
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={null}
      styles={{
        body: {
          padding: '24px 32px'
        },
        content: {
          backgroundColor: 'var(--color-modal-background)',
          color: 'var(--color-text)',
          borderRadius: '30px'
        }
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
            flex
            flex-wrap
            justify-${footerAlign.replace('flex-', '')} 
            gap-2
          `}
        >
          {buttons.map((btn, index) => {
            const { type, onClick, text, bgColor, color, icon, ...rest } = btn
            return (
              <CustomButton
                key={index}
                btnType={type || 'primary'}
                onClick={onClick}
                className={`flex items-center justify-center gap-1 whitespace-nowrap`}
                style={{
                  backgroundColor: bgColor || undefined,
                  color: color || '#fff'
                }}
                icon={icon}
                text={text}
                {...rest}
              />
            )
          })}
        </div>
      )}
    </Modal>
  )
}

export default ThemedModal
