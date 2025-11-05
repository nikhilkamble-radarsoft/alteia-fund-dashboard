import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { FiChevronLeft } from "react-icons/fi";
import CustomButton from "../form/CustomButton";

const TableTitle = ({
  title,
  subtitle,
  buttons,
  showIcon = false,
  titleColor = "text-primary",
  subtitleColor = "text-text-secondary",
  titleLevel = 5,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-between w-full items-center">
      {/* Left Section */}
      <div className="flex gap-3 items-center">
        {/* Back button */}
        {showIcon}

        <div className="flex flex-col justify-center h-full max-w-[175px] sm:max-w-full">
          <Title level={titleLevel} className={`font-bold m-0 truncate min-w-0 ${titleColor}`}>
            {title}
          </Title>

          {subtitle && (
            <Paragraph className={`mb-0 truncate min-w-0 ${subtitleColor}`}>{subtitle}</Paragraph>
          )}
        </div>
      </div>

      {/* Right section - buttons */}
      <div className="flex flex-wrap gap-2">
        {buttons?.map((button, idx) => (
          <div key={idx}>{button}</div>
        ))}
      </div>
    </div>
  );
};

export default TableTitle;
