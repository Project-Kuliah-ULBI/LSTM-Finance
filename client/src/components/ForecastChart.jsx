import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ForecastChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickMargin={10} />
          <YAxis
            tickFormatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(value) => [
              `Rp ${value.toLocaleString("id-ID")}`,
              "Pengeluaran",
            ]}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#2563eb"
            strokeWidth={3}
            dot={(props) => {
              const { payload } = props;
              return payload.isPrediction ? (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={6}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={2}
                />
              ) : null;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
