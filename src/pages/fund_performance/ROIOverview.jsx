import React from "react";

// const ROIOverview = () => {
//   return <div>ROIOverview</div>;
// };

// export default ROIOverview;

import { Card } from "antd";
import PortfolioMetrics from "./PortfolioMetrics";
import PortfolioChartSection from "./PortfolioChartSection";

export default function PortfolioROI() {
  const portfolioData = {
    title: "Alteia Commodity Trade Fund SP ▲",
    roiData: [0, 2.1, 3.1, 4.8, 6.5, 8.9, 12.4, 11.8, 12.4, 11.9, 11.5, 12.1],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    metrics: [
      {
        value: "9.4% YTD Growth",
        subtitle: "Total Portfolio ROI",
        color: "text-green-600",
        desc: "Your portfolio's year-to-date return indicates steady growth.",
      },
      {
        value: "0.8% average per month",
        subtitle: "Average Monthly ROI",
        color: "text-green-600",
        desc: "Consistent monthly returns help build long-term wealth.",
      },
      {
        value: "ROI Peaked at 12.4%",
        subtitle: "Top Performer Month",
        color: "text-green-600",
        desc: "June delivered the highest return in the portfolio this year.",
      },
      {
        value: "ROI Dipped to 3.1%",
        subtitle: "Toughest Month",
        color: "text-green-600",
        desc: "February was the most challenging month, with reduced returns.",
      },
    ],
    timeFilters: ["3 Months", "6 Months", "12 Months", "📅", "2025", "August ▼"],
    rangeFilters: ["Today", "This Week", "This Month", "This Year"],
  };

  return (
    <div className="">
      {/* Header: Portfolio title + actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-4 mb-6 gap-4 md:gap-0">
        <div>
          <h3 className="text-cyan-900 text-lg sm:text-xl font-semibold mb-1">
            {portfolioData.title}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">Portfolio Highlights</p>
        </div>
      </div>

      {/* Metrics Section */}
      <PortfolioMetrics
        metrics={portfolioData.metrics}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      />

      {/* Chart Section */}
      <PortfolioChartSection
        roiData={portfolioData.roiData}
        months={portfolioData.months}
        timeFilters={portfolioData.timeFilters}
        rangeFilters={portfolioData.rangeFilters}
        className="mt-6"
      />
    </div>
  );
}
