"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp, TrendingDown } from "lucide-react";
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

const CardPurchaseSummary = () => {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();
  const purchaseData = data?.purchaseSummary || [];
  const [timeframe, setTimeframe] = useState("daily");

  // Calculate totals and insights
  const totalPurchased =
    purchaseData.reduce((acc, curr) => acc + curr.totalPurchased, 0) || 0;

  const avgChangePercentage =
    purchaseData.reduce((acc, curr, _, arr) => acc + curr.changePercentage! / arr.length, 0) || 0;

  const highestPurchaseData = purchaseData.reduce((acc, curr) => {
    return acc.totalPurchased > curr.totalPurchased ? acc : curr;
  }, purchaseData[0] || {});

  const highestPurchaseDate = highestPurchaseData.date
  ? new Date(highestPurchaseData.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    })
  : "N/A";


  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    {/* <img
      src="/images/error-state.svg"
      alt="Error illustration"
      className="w-48 mb-4 opacity-80"
    /> */}
    <h2 className="text-lg font-semibold text-red-600 mb-2">
      Oops! Couldn’t load data
    </h2>
    <p className="text-gray-500 mb-4 max-w-md">
      Something went wrong while fetching logs data. Please check your
      internet connection or try again.
    </p>
  </div>
    )

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">
          <Loader />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              Purchase Summary
            </h2>
            <hr />
          </div>

          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="flex justify-between items-center mb-6 px-7 mt-5">
              <div className="text-lg font-medium">
                <p className="text-xs text-gray-400">Total Purchased Value</p>
                <span className="text-2xl font-extrabold">
                  Rs{" "}
                  {(totalPurchased / 1000).toLocaleString("en", {
                    maximumFractionDigits: 2,
                  })}
                  k
                </span>
                <span
                  className={`ml-2 text-sm ${
                    avgChangePercentage >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {avgChangePercentage >= 0 ? (
                    <TrendingUp className="inline w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="inline w-4 h-4 mr-1" />
                  )}
                  {avgChangePercentage.toFixed(2)}%
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
                data={purchaseData}
                margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="" vertical={false} />
                <XAxis
                dataKey="date"
                tick={{ fontSize: 12, dx: -1 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}/${String(
                    date.getUTCFullYear()
                  ).slice(2)}`;
                }}
              />

               <YAxis
                tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, dx: -1 }}
                tickLine={false}
                axisLine={false}
              />

<Tooltip
  formatter={(value: number) => [`$ ${value.toLocaleString("en")}`]}
  labelFormatter={(label) => {
    const date = new Date(label);
    return `${date.getDate()}/${date.getMonth() + 1}/${String(
      date.getFullYear()
    ).slice(2)}`;
  }}
/>

                <Bar
                  dataKey="totalPurchased"
                  fill="#10b981" // green tone for purchase
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
              <p>{purchaseData.length || 0} days</p>
              <p className="text-sm">
                Highest Purchase Date:{" "}
                <span className="font-bold">{highestPurchaseDate}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;
