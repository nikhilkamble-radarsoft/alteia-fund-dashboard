import React from "react";

const CustomTag = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 rounded-full border border-primary text-primary h-[32px] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default CustomTag;
