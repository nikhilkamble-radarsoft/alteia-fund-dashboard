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

  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [roiData, setROIData] = useState([]);

  const fetchFunds = async () => {
    try {
      const { response } = await callApi({
        url: "/admin/get-trade-list",
        method: "post",
        data: {},
      });
      setFunds(response.data || []);
      setSelectedTrade(response.data?.[0]?._id);
    } catch (error) {
      console.error("Error fetching funds:", error);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  // ROIOverview.js — replace fetchROIData with this
  const fetchROIData = async () => {
    try {
      // build params: include year only when selectedFilters.year is truthy
      const params = { fund_id: selectedTrade };
      if (selectedFilters?.year) params.year = selectedFilters.year;

      const { response } = await callApi({
        url: "/admin/get-roi-list",
        params,
      });

      const rows = response?.data || [];
      const selectedFund = funds.find((f) => f._id === selectedTrade) || {};

      // Helper to turn "January" + "2025" into a Date object (first day of month)
      const makeDate = (monthName, yearStr) => {
        // Use JS to parse, fallback if invalid
        try {
          // e.g. new Date('January 1, 2025') -> month index
          const d = new Date(`${monthName} 1, ${yearStr}`);
          if (isNaN(d)) return null;
          return d;
        } catch {
          return null;
        }
      };

      const navUnit = Number(selectedFund?.nav_unit || 0);

      const updatedData = rows
        .map((item) => {
          const monthName = item.month;
          const yearStr = item.year;
          const dt = makeDate(monthName, yearStr);
          const roiPercent = Number(item.max_roi || 0);
          const fundValue = navUnit + (roiPercent / 100) * navUnit; // preserve previous logic
          return {
            ...item,
            monthLabel: params.year ? monthName : `${monthName} ${yearStr}`, // e.g. "September 2025"
            date: dt ? dt.getTime() : undefined, // timestamp for sorting
            fundValue,
            roi: roiPercent,
          };
        })
        .sort((a, b) => {
          // Put undefined dates at the end
          if (a.date === undefined) return 1;
          if (b.date === undefined) return -1;
          return a.date - b.date;
        });

      setROIData(updatedData);
    } catch (error) {
      console.error("Error fetching funds:", error);
    }
  };

  useEffect(() => {
    if (selectedTrade) {
      fetchROIData();
    }
  }, [selectedTrade, selectedFilters]);

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
                allowClear={false}
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Portfolio Highlights</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* <Segmented
              size="large"
              options={["Portfolio highlights", "ROI table"]}
              className="bg-gray-100"
              disabled
            /> */}
            <CustomButton
              showIcon
              text="Add ROI"
              onClick={() => {
                // navigate(`/roi/update/${selectedTrade || funds?.[0]?._id}`, {
                //   state: { ...selectedFilters, fund: funds.find((fund) => fund._id === selectedTrade) },
                // });
                navigate(`/roi/update`, {
                  state: {
                    ...selectedFilters,
                    fund: funds.find((fund) => fund._id === selectedTrade),
                  },
                });
              }}
              width="w-fit"
              disabled={!selectedTrade}
            />
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      {/* <PortfolioMetrics metrics={portfolioData.metrics} /> */}

      {/* Chart Section */}
      <PortfolioChartSection
        roiData={roiData}
        selectedFund={funds.find((fund) => fund._id === selectedTrade)}
        timeFilters={portfolioData.timeFilters}
        rangeFilters={portfolioData.rangeFilters}
        value={selectedFilters}
        onChange={(patch) => setSelectedFilters((prev) => ({ ...prev, ...patch }))}
        className="mt-6"
      />
    </div>
  );
}
