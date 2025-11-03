import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import React from "react";

const ViewInfo = ({ info }) => {
  return (
    <>
      {Object.entries(info).map(([key, value], index) => (
        <div
          key={key + index}
          className="flex w-full justify-between items-center border-b border-gray-100 last:border-b-0"
        >
          <Title level={5} className="m-0 my-2">
            {key[0].toUpperCase() + key.slice(1)}
          </Title>
          <Paragraph className="m-0 my-2">{value}</Paragraph>
        </div>
      ))}
    </>
  );
};

export default ViewInfo;
