import React from "react";
import { Button } from "antd";
import { IoAdd } from "react-icons/io5";
import { PiPlus } from "react-icons/pi";
import { LuPlus } from "react-icons/lu";

const CustomButton = ({
  type = "button",
  btnType = "primary",
  onClick,
  children,
  size = "middle",
  width = "w-full",
  className = "",
  showIcon = false,
  icon = <LuPlus strokeWidth={3} />,
  text = "",
  loading = false,
  disabled = false,
  ...rest
}) => {
  let bgClass;
  let textClasses;

  switch (btnType) {
    case "primary":
      bgClass = "bg-primary";
      textClasses = "text-white";
      break;
    case "secondary":
      bgClass = "bg-light-primary";
      textClasses = "text-primary";
      break;
    default:
      bgClass = "bg-primary";
      textClasses = "text-primary";
  }

  if (!text && !children && !showIcon) {
    return null;
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      size={size}
      disabled={disabled || loading}
      loading={loading}
      className={`${bgClass} shadow-none font-semibold px-[14px] py-[10px] h-[38px] disabled:bg-[#CECECE] flex items-center justify-center gap-2 text-white rounded-lg ${width} ${className}`}
      {...rest}
    >
      {showIcon && icon}
      {text && typeof text === "string" ? (
        <span className={textClasses}>{text}</span>
      ) : (
        text || children
      )}
    </Button>
  );
};

export default CustomButton;
