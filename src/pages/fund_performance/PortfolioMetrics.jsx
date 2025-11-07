import React from "react";
import { Card, Button } from "antd";
import CustomButton from "../../components/form/CustomButton";

const MetricCard = ({ value, subtitle, desc, color = "text-black", onView }) => {
  return (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className={`text-xl font-bold ${color}`}>{value}</div>
          <div className="text-gray-500 text-xs">{subtitle}</div>
        </div>
        <CustomButton
          text="View"
          onClick={onView}
          noIcon={true}
          className="!px-4 text-sm"
          textClassName="!text-sm text-white"
        />
      </div>
      <p className="text-gray-400 text-xs">{desc}</p>
    </Card>
  );
};

const PortfolioMetrics = ({ metrics = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default PortfolioMetrics;
