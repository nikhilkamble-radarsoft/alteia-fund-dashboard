import React from "react";
import { Card } from "antd";
import CustomButton from "../../components/form/CustomButton";

const MetricCard = ({ value, subtitle, desc, color = "text-black", onView }) => {
  return (
    <Card
      className="!border-0.5 border-[#E1E1E1] !p-0 bg-[linear-gradient(206.23deg,_#DBFFC9_-73.67%,_#FFFFFF_83.49%)] rounded-lg w-full"
      classNames={{ body: "p-3" }}
    >
      <div className="flex justify-between items-start mb-2 gap-1">
        <div>
          <div className={`text-base sm:text-lg font-semibold ${color}`}>{value}</div>
          <div className="text-gray-500 text-sm">{subtitle}</div>
        </div>
        <CustomButton text="View" onClick={onView} width="" />
      </div>
      <p className="text-sm">{desc}</p>
    </Card>
  );
};

const PortfolioMetrics = ({ metrics = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div key={index} className="min-h-[110px] flex">
          <MetricCard {...metric} />
        </div>
      ))}
    </div>
  );
};

export default PortfolioMetrics;
