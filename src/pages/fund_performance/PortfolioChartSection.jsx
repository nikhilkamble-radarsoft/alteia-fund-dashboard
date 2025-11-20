import React, { useEffect, useState } from "react";
import RoiChart from "./RoiChart";
import { Segmented } from "antd";
import Field from "../../components/form/Field";

const startingYear = 1990;
const endingYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const months = [
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
];

const PortfolioChartSection = ({
  roiData,
  timeFilters = [],
  rangeFilters = [],
  activeRange,
  onChange,
  value, // { year, month, range, period }
  defaultValue, // { year, month, range, period }
}) => {
  // const periods = ["1D", "1W", "1M", "3M", "6M", "1Y", "YTD", "Max"];
  const periods = ["3M", "6M", "1Y", "3Y", "5Y", "Max"];
  // Controlled/uncontrolled setup
  const isRangeControlled = value?.range !== undefined;
  const isYearControlled = value?.year !== undefined;
  const isMonthControlled = value?.month !== undefined;

  const [rangeState, setRangeState] = useState(defaultValue?.range ?? activeRange ?? "1Y");
  const years = Array.from({ length: endingYear - startingYear + 1 }, (_, i) => startingYear + i);
  const [yearState, setYearState] = useState(defaultValue?.year ?? endingYear);
  const [monthState, setMonthState] = useState(defaultValue?.month ?? months[currentMonth]);

  const range = isRangeControlled ? value.range : rangeState;
  const year = isYearControlled ? value.year : yearState;
  const month = isMonthControlled ? value.month : monthState;

  const update = (patch) => {
    onChange?.(patch);
  };

  useEffect(() => {
    update({ range, year, month });
  }, [range, year, month]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h4 className="text-gray-800 text-base sm:text-lg font-semibold flex-1 text-center sm:text-left">
          Yearly ROI Performance
        </h4>
        <div className="flex flex-wrap gap-2 flex-1 justify-center sm:justify-end">
          <div className="flex items-center gap-2">
            {/* <Segmented
              options={["3 Months", "6 Months", "12 Months"]}
              value={period}
              onChange={(val) => {
                if (!isPeriodControlled) setPeriodState(val);
                update({ period: val });
              }}
              className="bg-gray-100"
              size="large"
            /> */}
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
                  allowClear={false}
                />
              </div>
              {/* <div className="w-[120px]">
                <Field
                  type="select"
                  options={months.map((m) => ({ value: m, label: m }))}
                  value={month}
                  onChange={(val) => {
                    if (!isMonthControlled) setMonthState(val);
                    update({ month: val });
                  }}
                  className="w-full"
                  allowClear={false}
                  disabled
                />
              </div> */}
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
                disabled
              />
            </div>
          </div>
        </div>

        <div className="px-1 sm:px-3 pb-2">
          <RoiChart
            title="Yearly ROI Performance"
            periods={periods}
            data={roiData}
            gradientColor="#8BC34A"
            lineColor="#558B2F"
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioChartSection;
