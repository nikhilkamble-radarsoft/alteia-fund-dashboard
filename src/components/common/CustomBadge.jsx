import React from "react";
import { PiProhibitFill, PiSealCheckFill, PiSealWarningFill } from "react-icons/pi";

const CustomBadge = ({ variant = "success", icon, label }) => {
  let finalIcon;
  const iconSize = 20;

  switch (variant) {
    case "success":
      finalIcon = <PiSealCheckFill className="text-light-primary" size={iconSize} />;
      break;
    case "danger":
      finalIcon = <PiProhibitFill className="text-danger" size={iconSize} />;
      break;
    case "warning":
      finalIcon = <PiSealWarningFill className="text-warning" size={iconSize} />;
      break;
    default:
      break;
  }

  return (
    <div className="flex whitespace-nowrap gap-1 items-center">
      {icon || finalIcon} {label}
    </div>
  );
};

export default CustomBadge;
