// client/src/components/TransactionChart.jsx
import React from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

const TransactionChart = ({ dataPoints, type }) => {
  const primaryColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim() || "#f97316";

  const lineData = {
    labels: dataPoints.map((d) => d.label),
    datasets: [
      {
        label: "Pengeluaran",
        data: dataPoints.map((d) => d.value),
        borderColor: primaryColor,
        backgroundColor: primaryColor + "33",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: primaryColor,
      },
    ],
  };

  const pieData = {
    labels: dataPoints.map((d) => d.label),
    datasets: [
      {
        data: dataPoints.map((d) => d.value),
        backgroundColor: [
          primaryColor,
          primaryColor + "CC",
          primaryColor + "99",
          primaryColor + "66",
          primaryColor + "33",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === "pie",
        position: "bottom",
        labels: { color: "#9CA3AF", usePointStyle: true },
      },
    },
    scales:
      type === "line"
        ? { x: { grid: { display: false } }, y: { display: false } }
        : {},
  };

  return (
    <div className="h-64 w-full mt-4">
      {dataPoints.length > 0 ? (
        type === "line" ? (
          <Line data={lineData} options={options} />
        ) : (
          <Pie data={pieData} options={options} />
        )
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
          Belum ada data...
        </div>
      )}
    </div>
  );
};
export default TransactionChart;
