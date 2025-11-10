import React, { useEffect, useState } from "react";

import { Segmented } from "antd";
import PortfolioMetrics from "./PortfolioMetrics";
import PortfolioChartSection from "./PortfolioChartSection";
import CustomButton from "../../components/form/CustomButton";
import Field from "../../components/form/Field";
import { useNavigate } from "react-router-dom";
import useApi from "../../logic/useApi";

export default function ROIOverview() {
  const { callApi } = useApi();
  const [funds, setFunds] = useState([]);
  const navigate = useNavigate();
  const portfolioData = {
    roiData: [0, 2.1, 3.1, 4.8, 6.5, 8.9, 12.4, 11.8, 12.4, 11.9, 11.5, 12.1],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    metrics: [
      {
        value: "9.4% YTD Growth",
        subtitle: "Total Portfolio ROI",
        color: "text-light-primary",
        desc: "Your portfolio's year-to-date return indicates steady growth.",
        onView: () => {},
      },
      {
        value: "0.8% average per month",
        subtitle: "Average Monthly ROI",
        color: "text-light-primary",
        desc: "Consistent monthly returns help build long-term wealth.",
        onView: () => {},
      },
      {
        value: "ROI Peaked at 12.4%",
        subtitle: "Top Performer Month",
        color: "text-light-primary",
        desc: "June delivered the highest return in the portfolio this year.",
        onView: () => {},
      },
      {
        value: "ROI Dipped to 3.1%",
        subtitle: "Toughest Month",
        color: "text-light-primary",
        desc: "February was the most challenging month, with reduced returns.",
        onView: () => {},
      },
    ],
    timeFilters: ["3 Months", "6 Months", "12 Months", "📅", "2025", "August ▼"],
    rangeFilters: ["Today", "This Week", "This Month", "This Year"],
  };

  // Trades dropdown options (replace with real trades list when available)
  const tradeOptions = [
    { value: "alteia_sp", label: "Alteia Commodity Trade Fund SP" },
    { value: "growth_sp", label: "Alteia Growth Fund SP" },
  ];

  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedTrade, setSelectedTrade] = useState(null);

  const fetchFunds = async () => {
    try {
      const { response } = await callApi({
        url: "/admin/get-trade-list",
        method: "post",
        data: {},
      });
      setFunds(response.data || []);
    } catch (error) {
      console.error("Error fetching funds:", error);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  return (
    <div className="">
      {/* Header: Portfolio title + actions */}
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 mb-6">
        <div className="flex flex-wrap flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="w-full md:w-auto">
            <div className="min-w-[260px] w-full md:min-w-[360px]">
              <Field
                type="select"
                options={funds?.map((fund) => ({ value: fund._id, label: fund.title }))}
                value={selectedTrade || funds?.[0]?._id}
                onChange={setSelectedTrade}
                placeholder={portfolioData.title}
                className="w-full"
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Portfolio Highlights</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Segmented
              size="large"
              options={["Portfolio highlights", "ROI table"]}
              className="bg-gray-100"
            />
            <CustomButton
              text="Add ROI"
              onClick={() => {
                navigate(`/roi/update/${selectedTrade || funds?.[0]?._id}`, {
                  state: selectedFilters,
                });
              }}
              width="w-fit"
            />
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <PortfolioMetrics metrics={portfolioData.metrics} />

      {/* Chart Section */}
      <PortfolioChartSection
        roiData={portfolioData.roiData}
        months={portfolioData.months}
        timeFilters={portfolioData.timeFilters}
        rangeFilters={portfolioData.rangeFilters}
        value={selectedFilters}
        onChange={(patch) => setSelectedFilters((prev) => ({ ...prev, ...patch }))}
        className="mt-6"
      />
    </div>
  );
}
