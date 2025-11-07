const variantStyles = {
  success: {
    bgColor: "#28A7451A",
    textColor: "#000000",
    dotColor: "#009F10",
  },
  pending: {
    bgColor: "#FFF7E6",
    textColor: "#000000",
    dotColor: "#FFA500",
  },
  danger: {
    bgColor: "#FDECEC",
    textColor: "#000000",
    dotColor: "#FF0000",
  },
  upcoming: {
    bgColor: "#1E90FF1A",
    textColor: "#000000",
    dotColor: "#0077B6",
  },
  primary: {
    bgColor: "#a3343424",
    textColor: "#A33434",
    dotColor: "#A33434",
  },
};

export const CustomDot = ({ color, size = 6, className }) => {
  return (
    <span
      className={`block rounded-full ring-2 ring-white border-gray-300 ${className}`}
      style={{
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
    />
  );
};

const CustomTag = ({ variant = "success", text, customColors, divClassName, dotClassName }) => {
  const { bgColor: customBg, textColor: customText, dotColor: customDot } = customColors || {};
  const {
    bgColor: variantBg,
    textColor: variantText,
    dotColor: variantDot,
  } = variantStyles[variant] || variantStyles.success;
  const finalBg = customBg || variantBg;
  const finalText = customText || variantText;
  const finalDot = customDot || variantDot;

  if (!text) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center px-3 py-1 text-sm rounded-lg ${divClassName}`}
      style={{ backgroundColor: finalBg, color: finalText }}
    >
      <CustomDot color={finalDot} className={`mr-1 ${dotClassName}`} />
      {text}
    </div>
  );
};

export default CustomTag;
