import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp } from "lucide-react";
import React, { useState } from "react";
import Loader from "../../../(components)/common/Loader";
import { Card, Statistic } from "antd";
import { ArrowDownwardOutlined, ArrowUpwardOutlined } from "@mui/icons-material";

const ProfitLossess = () => {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();

  const salesData = data?.salesSummary || [];
  const purchaseData = data?.purchaseSummary || [];

  const totalValueSum =
    salesData.reduce((acc:any, curr:any) => acc + curr.totalValue, 0) || 0;

  const totalPurchased =
    purchaseData.reduce((acc:any, curr:any) => acc + curr.totalPurchased, 0) || 0;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">

      <h2 className="text-lg font-semibold text-red-600 mb-2">
        Oops! Couldn’t load data
      </h2>
      <p className="text-gray-500 mb-4 max-w-md">
        Something went wrong while fetching logs data. Please check your
        internet connection or try again.
      </p>
    </div>
    );
  }
  const netProfit = totalValueSum-totalPurchased ;

  return (
    <div className="row-span-3 mb-2 xl:row-span-2   rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5"> <Loader /></div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Total Purchases"
              value={totalPurchased}
              precision={1}
              prefix="$"
            />
          </Card>

          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Total Sales"
              value={totalValueSum}
              precision={1}
              prefix="$"
            />
          </Card>

          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Net Profit"
              value={netProfit}
              precision={2}
              valueStyle={{
                color: netProfit >= 0 ? "#3f8600" : "#cf1322",
              }}
              prefix={
                netProfit >= 0 ? <ArrowUpwardOutlined /> : <ArrowDownwardOutlined />
              }
              suffix="$"
            />
          </Card>
        </div>
          <div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLossess;
