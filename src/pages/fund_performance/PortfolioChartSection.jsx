import React, { useEffect, useMemo, useState } from "react";
import RoiChart from "./RoiChart";
import { Segmented } from "antd";
import Field from "../../components/form/Field";

const START_YEAR = 1990;
const END_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth();

export const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

const MONTHS = [
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

const PERIODS = ["3M", "6M", "1Y", "3Y", "5Y", "Max"];

const PortfolioChartSection = ({ roiData, selectedFund, activeRange, onChange, value = {} }) => {
  const fundStartYear = new Date(selectedFund?.start_date)?.getFullYear() || START_YEAR;
  const fundEndYear = new Date(selectedFund?.end_date)?.getFullYear() || END_YEAR;

  const years = useMemo(
    () => Array.from({ length: fundEndYear - fundStartYear + 1 }, (_, i) => fundStartYear + i),
    [fundStartYear, fundEndYear]
  );

  const [internal, setInternal] = useState(() => ({
    range: activeRange ?? "1Y",
    year: years.at(-1),
    month: MONTHS[CURRENT_MONTH],
  }));

  const state = {
    range: value.range ?? internal.range,
    year: value.year ?? internal.year,
    month: value.month ?? internal.month,
  };

  const update = (patch) => {
    setInternal((prev) => ({ ...prev, ...patch }));
    onChange?.({ ...state, ...patch });
  };

  useEffect(() => {
    onChange?.(state);
  }, [state.range, state.year, state.month]);

  useEffect(() => {
    if (!years.includes(internal.year)) {
      const fallbackYear = years[years.length - 1];
      setInternal((prev) => ({
        ...prev,
        year: fallbackYear,
      }));
      onChange?.({ ...internal, year: fallbackYear });
    }
  }, [years]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h4 className="text-gray-800 text-base sm:text-lg font-semibold flex-1 text-center sm:text-left">
          Yearly ROI Performance
        </h4>

        <div className="flex flex-wrap gap-2 flex-1 justify-center sm:justify-end">
          <div className="flex items-center gap-2">
            <div className="w-[100px]">
              <Field
                type="select"
                options={years.map((y) => ({ value: y, label: y }))}
                value={state.year}
                onChange={(val) => update({ year: val })}
                className="w-full"
                allowClear={false}
              />
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
                options={PERIODS}
                value={state.range}
                onChange={(val) => update({ range: val, period: val })}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="px-1 sm:px-3 pb-2">
          <RoiChart
            title="Yearly ROI Performance"
            periods={PERIODS}
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
