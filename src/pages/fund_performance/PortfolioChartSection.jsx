import React, { useEffect, useState } from "react";
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
  onChange,
  value, // { year, month, range, period }
  defaultValue, // { year, month, range, period }
}) => {
  const periods = ["Today", "This Week", "This Month", "This Year"];
  // Controlled/uncontrolled setup
  const isPeriodControlled = value?.period !== undefined;
  const isRangeControlled = value?.range !== undefined;
  const isYearControlled = value?.year !== undefined;
  const isMonthControlled = value?.month !== undefined;

  const [periodState, setPeriodState] = useState(defaultValue?.period ?? "12 Months");
  const [rangeState, setRangeState] = useState(defaultValue?.range ?? activeRange ?? "This Year");
  const years = Array.from({ length: endingYear - startingYear + 1 }, (_, i) => startingYear + i);
  const [yearState, setYearState] = useState(defaultValue?.year ?? endingYear);
  const [monthState, setMonthState] = useState(defaultValue?.month ?? "August");

  const period = isPeriodControlled ? value.period : periodState;
  const range = isRangeControlled ? value.range : rangeState;
  const year = isYearControlled ? value.year : yearState;
  const month = isMonthControlled ? value.month : monthState;

  const update = (patch) => {
    onChange?.(patch);
  };

  useEffect(() => {
    update({ period, range, year, month });
  }, [period, range, year, month]);

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
              onChange={(val) => {
                if (!isPeriodControlled) setPeriodState(val);
                update({ period: val });
              }}
              className="bg-gray-100"
            />
            <div className="flex items-center gap-2">
              <div className="w-[100px]">
                <Field
                  type="select"
                  options={years.map((y) => ({ value: y, label: y }))}
                  value={year}
                  onChange={(val) => {
                    if (!isYearControlled) setYearState(val);
                    update({ year: val });
                  }}
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
                  onChange={(val) => {
                    if (!isMonthControlled) setMonthState(val);
                    update({ month: val });
                  }}
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
                  if (!isRangeControlled) setRangeState(val);
                  update({ range: val, period: val });
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
