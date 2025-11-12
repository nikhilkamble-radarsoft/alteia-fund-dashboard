import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const RoiChart = ({
  data = [],
  xDataKey = "month",
  yDataKey = "roi",
  height = 300,
  gradientColor = "linear-gradient(180deg, rgba(155, 205, 78, 0.4) 0%, rgba(155, 205, 78, 0) 100%)",
  lineColor = "#6DBD45",
}) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      return (
        <div className="bg-white px-3 py-2 rounded shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {dataPoint.payload[xDataKey]} — {Number(dataPoint.value).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg overflow-hidden">
        <ResponsiveContainer width="100%" height={height} className={"focus:border-none"}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 0 }}>
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
              tick={{ fill: "#9CA3AF", fontSize: 13 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide={true} />
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
  );
};

export default RoiChart;
