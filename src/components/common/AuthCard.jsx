import React from "react";
import AppLogo from "./AppLogo";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const AuthCard = ({
  title = "Complete Your SME Verification",
  description = "Seamlessly manage your business orders, buyers, and onboarding — all in one place.",
  logoStyles,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <AppLogo style={logoStyles} className="mb-4" />

      <Title level={3} className="!text-white mb-2 !leading-tight text-balance">
        {title}
      </Title>

      <Paragraph className="text-gray-400 text-[15px] max-w-[360px] leading-relaxed">
        {description}
      </Paragraph>
    </div>
  );
};

export default AuthCard;
