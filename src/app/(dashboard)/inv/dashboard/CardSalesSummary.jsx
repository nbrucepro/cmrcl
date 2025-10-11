import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp } from "lucide-react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Loader from "../../../(components)/common/Loader";
import { useAppSelector } from "../../redux";

const CardSalesSummary = () => {
  const selectedMonth = useAppSelector((state) => state.global.selectedMonth);
  const { data, isLoading, isFetching, isError } = useGetDashboardMetricsQuery(
    { month: selectedMonth.month, year: selectedMonth.year },
    { refetchOnMountOrArgChange: true }
  );
  const salesData = data?.salesSummary || [];

  const totalValueSum =data?.totalSales || 0;

  const averageChangePercentage =
    salesData.reduce((acc, curr, _, array) => {
      return acc + curr?.changePercentage / array.length;
    }, 0) || 0;

  const highestValueData = salesData.reduce((acc, curr) => {
    return acc.totalValue > curr.totalValue ? acc : curr;
  }, salesData[0] || {});

  const highestValueDate = highestValueData.date
  ? new Date(highestValueData.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    })
  : "N/A";


  if (isError) return null;
  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {(isFetching || isLoading) ? (
        <div className="m-5"> <Loader /></div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              Sales Summary
            </h2>
            <hr />
          </div>

          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="flex justify-between items-center mb-6 px-7 mt-5">
              <div className="text-lg font-medium">
                <p className="text-xs text-gray-400">Value</p>
                <span className="text-2xl font-extrabold">
                Rs{" "}
  {(totalValueSum / 1000).toLocaleString("en", {
    maximumFractionDigits: 2,
  })}
  k
                </span>
                <span className="text-green-500 text-sm ml-2">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {averageChangePercentage.toFixed(2)}%
                </span>
              </div>
              <button
                className="shadow-sm border border-gray-300 bg-white p-2 rounded"
              >
                Daily
              </button>
            </div>
            {/* CHART */}
            <ResponsiveContainer width="100%" height={350} className="px-7">
              <BarChart
                data={salesData}
                margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}/${String(
                      date.getFullYear()
                    ).slice(2)}`;                
                  }}
                  tick={{ fontSize: 12, dx: -1 }}
                />
                <YAxis
                  tickFormatter={(value) => {
                    return `Rs ${(value / 1000).toFixed(0)}k`;
                  }}
                  tick={{ fontSize: 12, dx: -1 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
  formatter={(value) => [`$ ${value.toLocaleString("en")}`]}
  labelFormatter={(label) => {
    const date = new Date(label);
    return `${date.getDate()}/${date.getMonth() + 1}/${String(
      date.getFullYear()
    ).slice(2)}`;
  }}
                />
                <Bar
                  dataKey="totalValue"
                  fill="#3182ce"
                  barSize={10}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* FOOTER */}
          <div>
            <hr />
            <div className="flex justify-between items-center mt-6 text-sm px-7 mb-4">
              <p>{salesData.length || 0} days</p>
              <p className="text-sm">
                Highest Sales Date:{" "}
                <span className="font-bold">{highestValueDate}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;
