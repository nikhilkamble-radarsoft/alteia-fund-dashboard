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
    <div className="flex flex-wrap gap-3 justify-between w-full items-center min-w-0">
      {/* Left Section */}
      <div className="flex gap-3 items-center min-w-0">
        {/* Back button */}
        {showIcon}

        <div className="flex flex-col justify-center h-full min-w-0 max-w-full">
          <Title
            title={title}
            level={titleLevel}
            className={`font-bold m-0 min-w-0 ${titleColor}`}
            ellipsis
          >
            {title}
          </Title>

          {subtitle && (
            <Paragraph
              title={subtitle}
              className={`mb-0 min-w-0 ${subtitleColor}`}
              ellipsis={{ rows: 1 }}
            >
              {subtitle}
            </Paragraph>
          )}
        </div>
      </div>

      {/* Right section - buttons */}
      {buttons?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {buttons?.map((button, idx) => (
            <div key={idx}>{button}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableTitle;
