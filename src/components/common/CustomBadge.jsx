import React from "react";
import { PiProhibitFill, PiSealCheckFill, PiSealWarningFill } from "react-icons/pi";

const CustomBadge = ({ variant = "success", icon, label, className }) => {
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
    <div className={`flex w-full gap-1 items-center !min-w-0 ${className}`}>
      <div className="flex-none">{icon || finalIcon}</div>
      <span className="truncate !min-w-0" title={label}>
        {label}
      </span>
    </div>
  );
};

export default CustomBadge;
