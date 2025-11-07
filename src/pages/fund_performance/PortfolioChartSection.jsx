import React, { useState } from "react";
import RoiChart from "./RoiChart";
import { Segmented } from "antd";
import Field from "../../components/form/Field";

const startingYear = 2000;
const endingYear = new Date().getFullYear();

const PortfolioChartSection = ({
  roiData,
  months,
  timeFilters = [],
  rangeFilters = [],
  activeRange = "This Year",
  onRangeChange,
}) => {
  const periods = ["Today", "This Week", "This Month", "This Year"];
  const [period, setPeriod] = useState("12 Months");
  const [range, setRange] = useState(activeRange || "This Year");
  const years = Array.from({ length: endingYear - startingYear + 1 }, (_, i) => startingYear + i);
  const [year, setYear] = useState(endingYear);
  const [month, setMonth] = useState("August");

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h4 className="text-gray-800 text-base sm:text-lg font-semibold flex-1 text-center sm:text-left">
          Yearly ROI Performance
        </h4>
        <div className="flex flex-wrap gap-2 flex-1 justify-center sm:justify-end">
          <div className="flex items-center gap-2">
            <Segmented
              options={["3 Months", "6 Months", "12 Months"]}
              value={period}
              onChange={(val) => setPeriod(val)}
              className="bg-gray-100"
            />
            <div className="flex items-center gap-2">
              <div className="w-[100px]">
                <Field
                  type="select"
                  options={years.map((y) => ({ value: y, label: y }))}
                  value={year}
                  onChange={setYear}
                  className="w-full"
                  selectProps={{ allowClear: false }}
                />
              </div>
              <div className="w-[120px]">
                <Field
                  type="select"
                  options={[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((m) => ({ value: m, label: m }))}
                  value={month}
                  onChange={setMonth}
                  className="w-full"
                  selectProps={{ allowClear: false }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2" />

      <div className="w-full rounded-xl border border-gray-200 bg-white">
        <div className="px-3 sm:px-4">
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="w-full">
              <Segmented
                block
                size="large"
                options={periods}
                value={range}
                onChange={(val) => {
                  setRange(val);
                  onRangeChange?.(val);
                }}
              />
            </div>
          </div>
        </div>

        <div className="px-1 sm:px-3 pb-2">
          <RoiChart
            title="Yearly ROI Performance"
            periods={periods}
            data={[
              { month: "Jan", roi: 7.5 },
              { month: "Feb", roi: 8.2 },
              { month: "Mar", roi: 9.5 },
              { month: "Apr", roi: 8.8 },
              { month: "May", roi: 10.2 },
              { month: "Jun", roi: 9.8 },
              { month: "Jul", roi: 11.0 },
              { month: "Aug", roi: 10.5 },
              { month: "Sep", roi: 12.3 },
              { month: "Oct", roi: 11.7 },
              { month: "Nov", roi: 13.0 },
              { month: "Dec", roi: 12.5 },
            ]}
            xDataKey="month"
            yDataKey="roi"
            gradientColor="#8BC34A"
            lineColor="#558B2F"
            height={280}
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioChartSection;
