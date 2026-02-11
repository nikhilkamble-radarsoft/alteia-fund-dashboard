import React, { useEffect, useState } from "react";
import PortfolioChartSection from "./PortfolioChartSection";
import CustomButton from "../../components/form/CustomButton";
import Field from "../../components/form/Field";
import { useNavigate } from "react-router-dom";
import useApi from "../../logic/useApi";
import { useTranslation } from "react-i18next";

export default function ROIOverview() {
  const { t } = useTranslation("table");
  const { callApi } = useApi();
  const [funds, setFunds] = useState([]);
  const navigate = useNavigate();

  const portfolioData = {
    // Included purely for translation context if you uncomment the metrics section later
    metrics: [
      {
        value: "9.4% YTD Growth",
        subtitle: t("roi.totalPortfolioROI"),
        color: "text-light-primary",
        desc: t("roi.metricsDesc1"),
        onView: () => {},
      },
      {
        value: "0.8% average per month",
        subtitle: t("roi.avgMonthlyROI"),
        color: "text-light-primary",
        desc: t("roi.metricsDesc2"),
        onView: () => {},
      },
      {
        value: "ROI Peaked at 12.4%",
        subtitle: t("roi.topPerformerMonth"),
        color: "text-light-primary",
        desc: t("roi.metricsDesc3"),
        onView: () => {},
      },
      {
        value: "ROI Dipped to 3.1%",
        subtitle: t("roi.toughestMonth"),
        color: "text-light-primary",
        desc: t("roi.metricsDesc4"),
        onView: () => {},
      },
    ],
    timeFilters: [
      t("roi.3Months"),
      t("roi.6Months"),
      t("roi.12Months"),
      "📅",
      "2025",
      "August ▼",
    ],
    rangeFilters: [t("roi.today"), t("roi.thisWeek"), t("roi.thisMonth"), t("roi.thisYear")],
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

  const fetchROIData = async () => {
    try {
      const params = { fund_id: selectedTrade };
      if (selectedFilters?.year) params.year = selectedFilters.year;

      const { response } = await callApi({
        url: "/admin/get-roi-list",
        params,
      });

      const rows = response?.data || [];
      const selectedFund = funds.find((f) => f._id === selectedTrade) || {};

      const makeDate = (monthName, yearStr) => {
        try {
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
          const fundValue = navUnit + (roiPercent / 100) * navUnit;

          return {
            ...item,
            // You might want to translate monthName here if 'item.month' is always English
            monthLabel: params.year ? monthName : `${monthName} ${yearStr}`,
            date: dt ? dt.getTime() : undefined,
            fundValue,
            roi: roiPercent,
          };
        })
        .sort((a, b) => {
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
                placeholder={t("roi.selectPortfolio")} // Fixed undefined placeholder
                className="w-full"
                allowClear={false}
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">{t("roi.portfolioHighlights")}</p>
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
              text={t("roi.addROI")}
              onClick={() => {
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

      {/* Metrics Section (Currently Commented out in source) */}
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
