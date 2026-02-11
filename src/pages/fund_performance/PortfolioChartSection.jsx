import React, { useEffect, useMemo, useState } from "react";
import { Segmented } from "antd";
import Field from "../../components/form/Field";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

const START_YEAR = 1990;
const END_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth();

export const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

const MONTHS_ENGLISH = [
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

const PERIOD_KEYS = ["3M", "6M", "1Y", "3Y", "5Y", "Max"];

const xDataKey = "month";
const yDataKey = "fundValue";
const height = 300;
const gradientColor = "#8BC34A";
const lineColor = "#558B2F";

const PortfolioChartSection = ({ roiData, selectedFund, activeRange, onChange, value = {} }) => {
  const { t } = useTranslation();

  const fundStartYear = new Date(selectedFund?.start_date)?.getFullYear() || START_YEAR;
  const fundEndYear = new Date(selectedFund?.end_date)?.getFullYear() || END_YEAR;

  // Helper to translate "January" -> t("months.january")
  const translateMonth = (englishMonthName) => {
    if (!englishMonthName) return "";
    const lowerName = englishMonthName.toLowerCase().trim();
    return t(`months.${lowerName}`, englishMonthName); // Fallback to original if key missing
  };

  const years = useMemo(
    () => Array.from({ length: fundEndYear - fundStartYear + 1 }, (_, i) => fundStartYear + i),
    [fundStartYear, fundEndYear],
  );

  const [internal, setInternal] = useState(() => ({
    range: activeRange ?? "1Y",
    month: MONTHS_ENGLISH[CURRENT_MONTH],
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
      const fallbackYear = undefined;
      setInternal((prev) => ({ ...prev, year: fallbackYear }));
      onChange?.({ ...internal, year: fallbackYear });
    }
  }, [years]);

  const chartData = useMemo(() => {
    if (!Array.isArray(roiData)) return [];
    return roiData.map((r) => {
      // Translate the month part
      const translatedMonth = translateMonth(r.month);
      // Construct label: "يناير 2025" or just "يناير"
      const label = r.year ? `${translatedMonth} ${r.year}` : translatedMonth;

      return {
        month: label,
        originalMonth: r.month, // Keep original for reference if needed
        fundValue: r.fundValue,
        roi: r.roi,
        date: r.date,
      };
    });
  }, [roiData, t]); // Add 't' dependency so it updates on language switch

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];

      return (
        <div className="bg-white px-3 py-2 rounded shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {/* payload[xDataKey] contains the already translated label from chartData */}
            {dataPoint.payload[xDataKey]} — {Number(dataPoint.payload["roi"]).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const periodOptions = PERIOD_KEYS.map((key) => ({
    label: t(`roi.period_${key}`, key, { ns: "table" }),
    value: key,
  }));

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h4 className="text-gray-800 text-base sm:text-lg font-semibold flex-1 text-center sm:text-left">
          {t("roi.yearlyPerformance", { ns: "table" })}
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
                placeholder={t("roi.selectYear", { ns: "table" })}
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
                options={periodOptions}
                value={state.range}
                onChange={(val) => update({ range: val, period: val })}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="px-1 sm:px-3 pb-2">
          <div className="w-full ">
            <div className="bg-white rounded-lg w-full max-w-full overflow-hidden">
              <ResponsiveContainer height={height} className={"focus:border-none"}>
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor={gradientColor} stopOpacity={0.4} />
                      <stop offset="90%" stopColor={gradientColor} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey={xDataKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    interval="preserveStartEnd"
                    minTickGap={30}
                  />
                  <YAxis
                    dataKey={yDataKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: gradientColor, strokeWidth: 1, strokeDasharray: "3 3" }}
                  />
                  <Area
                    type="monotone"
                    dataKey={yDataKey}
                    stroke={lineColor}
                    strokeWidth={2}
                    fill="url(#colorRoi)"
                    dot={false}
                    activeDot={{ r: 5, fill: lineColor, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChartSection;
