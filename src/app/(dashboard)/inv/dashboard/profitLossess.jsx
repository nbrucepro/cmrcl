import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import Loader from "../../../(components)/common/Loader";
import { Card, Statistic } from "antd";
import { ArrowDownwardOutlined, ArrowUpwardOutlined } from "@mui/icons-material";
import { useAppSelector } from "../../redux";

const ProfitLossess = () => {
  const selectedMonth = useAppSelector((state) => state.global.selectedMonth);
  // const { data, isLoading, isError } = useGetDashboardMetricsQuery(selectedMonth);
  const { data, isLoading, isFetching, isError } = useGetDashboardMetricsQuery(
    { month: selectedMonth?.month, year: selectedMonth?.year },
    { refetchOnMountOrArgChange: true }
  );
  
  const salesData = data?.salesSummary || [];
  const purchaseData = data?.purchaseSummary || [];

  const products = data?.productsWithProfit || [];

  const profitOnSales = products.reduce((total, product) => {
    const variant = product.variants?.[0]; 
    if (!variant || product.soldCount <= 0) return total;
  
    const purchasePrice = variant.purchasePrice || 0;
    const sellingPrice = variant.sellingPrice || 0;
    const soldCount = product.soldCount || 0;
  
    const profit = (sellingPrice - purchasePrice) * soldCount;
    return total + profit;
  }, 0);
  
  
  const totalValueSum =
    salesData.reduce((acc, curr) => acc + curr.totalValue, 0) || 0;

  const totalPurchased =
    purchaseData.reduce((acc, curr) => acc + curr.totalPurchased, 0) || 0;

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
  const netProfit = profitOnSales ;

  return (
    <div className="row-span-3 mb-2 xl:row-span-2   rounded-2xl flex flex-col justify-between">
      {(isLoading || isFetching) ? (
        <div className="m-5"> <Loader /></div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Total Purchases"
              value={totalPurchased}
              precision={1}
              prefix="Rs"
            />
          </Card>

          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Total Sales"
              value={totalValueSum}
              precision={1}
              prefix="Rs"
            />
          </Card>

          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Profit on sold items"
              value={netProfit}
              precision={2}
              valueStyle={{
                color: netProfit >= 0 ? "#3f8600" : "#cf1322",
              }}
              prefix={
                netProfit >= 0 ? <span> <ArrowUpwardOutlined />Rs </span>:<span><ArrowDownwardOutlined />Rs</span>
              }
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
