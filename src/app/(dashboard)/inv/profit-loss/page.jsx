"use client";

import { useState, useEffect } from "react";
import { Card, Statistic, DatePicker, Button, message } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import Loader from "@/app/(components)/common/Loader";

const { RangePicker } = DatePicker;

export default function ProfitLossPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      const [start, end] = dateRange;
      const startDate = start.format("YYYY-MM-DD");
      const endDate = end.format("YYYY-MM-DD");

      const token = localStorage.getItem("token");
      if (!token) {
        message.error("You are not logged in");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/products/profits-losses`,
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setData(res.data);
    } catch (error) {
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  return (
    <div className="p-2 bg-gray-50 ">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        {/* <h1 className="text-2xl font-bold text-gray-800 ">
          Profit & Loss Report
        </h1> */}

        <div className="hidden gap-3 mt-3 sm:mt-0">
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            allowClear={false}
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchProfitLoss}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Total Sales"
              value={data.totalSales}
              precision={2}
              prefix="$"
            />
          </Card>

          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Total Purchases"
              value={data.totalPurchases}
              precision={2}
              prefix="$"
            />
          </Card>
{/* 
          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Total Expenses"
              value={data.totalExpenses}
              precision={2}
              prefix="$"
            />
          </Card> */}

          <Card variant="outlined" className="shadow-sm">
            <Statistic
              title="Net Profit"
              value={data.netProfit}
              precision={2}
              valueStyle={{
                color: data.netProfit >= 0 ? "#3f8600" : "#cf1322",
              }}
              prefix={
                data.netProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
              }
              suffix="$"
            />
          </Card>
        </div>
      ) : (
        <div className="text-center mt-10 text-gray-500">
          <Loader/>
        </div>
      )}
    </div>
  );
}
