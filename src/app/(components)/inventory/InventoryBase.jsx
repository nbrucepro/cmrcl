"use client";

import { useGetProductsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import Loader from "@/app/(components)/common/Loader";
import { useEffect, useState } from "react";
import TransactionModal from "@/app/(components)/inventory/TransactionModal";
import LogsTable from "@/app/(components)/inventory/LogsTable";
import toast from "react-hot-toast";
import { Button, TextField } from "@mui/material";
import { saveAs } from "file-saver";
import {
  FilterAlt,
  RestartAlt,
  Download,
  AddCircle,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";

export default function InventoryBase({
  title,
  endpoint,
  type,
  enableFilter = false,
}) {
  const { data: products, isError, isLoading, refetch } = useGetProductsQuery();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}api/products/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      const data = await res.json();
      setLogs(data);
      setFilteredLogs(data);
    } catch (err) {
      // toast.error(err.message || `Could not load ${endpoint}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (form, transactionType, hasBalance) => {
    const body =
      transactionType === "sale"
        ? {
            productId: form.productId,
            quantity: form.quantity,
            unitPrice: form.price,
          }
        : {
            productId: form.productId,
            quantity: form.quantity,
            unitCost: form.price,
          };

    try {
      const response = await fetch(`${API_URL}api/products/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Transaction failed");
      }

      const result = await response.json();
      if (hasBalance) {
        const balanceBody =
          transactionType === "sale"
            ? {
                saleId: result.saleId,
                customerName: form.customerName,
                contactInfo: form.contactInfo,
                amountDue: form.price * form.quantity,
                amountPaid: form.amountPaid,
                dueDate: form.dueDate,
                notes: form.notes,
              }
            : {
                purchaseId: result.purchaseId,
                supplierName: form.supplierName,
                contactInfo: form.contactInfo,
                amountDue: form.price * form.quantity,
                amountPaid: form.amountPaid,
                dueDate: form.dueDate,
                notes: form.notes,
              };
        await fetch(
          `${API_URL}api/products/${
            transactionType === "sale" ? "receivables" : "payables"
          }`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(balanceBody),
          }
        );
      }
      toast.success("Transaction successful!");
      refetch();
      fetchLogs();
      setModalOpen(false);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleFilter = () => {
    if (!fromDate || !toDate) return toast.error("Please select both dates");
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const filtered = logs.filter((log) => {
      const logDate = new Date(log.createdAt || log.date || log.purchaseDate);
      return logDate >= from && logDate <= to;
    });
    setFilteredLogs(filtered);
  };

  const handleReset = () => {
    setFilteredLogs(logs);
    setFromDate("");
    setToDate("");
  };

  const handleDownload = () => {
    if (!filteredLogs.length) return toast.error("No data to download");
    const headers = Object.keys(filteredLogs[0]);
    const csvRows = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        headers.map((h) => JSON.stringify(log[h] ?? "")).join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `${endpoint}_logs_${Date.now()}.csv`);
    toast.success("Download started");
  };
  useEffect(() => {
    if (fromDate && toDate) {
      handleFilter();
    }
  }, [fromDate, toDate]);
  

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader />
        <p className="mt-3 text-gray-500 text-sm animate-pulse">
          Loading {title.toLowerCase()} data...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => refetch()}
          startIcon={<RestartAlt />}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-3 sm:px-6 lg:px-2 pb-6 w-full overflow-x-hidden">
      <Header name={`${title}`} />
      {/* CONTROL BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 my-6 bg-white/70 backdrop-blur-md shadow-sm p-4 sm:p-6 rounded-2xl border border-gray-100 w-full">
        {/* Date Filters */}
        <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
           <TextField
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{minWidth: { xs: "100%", sm: 120 }}}
          />
          <TextField
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{minWidth: { xs: "100%", sm: 120 }}}
          />

          <Tooltip title="Reset Filters">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RestartAlt />}
              onClick={handleReset}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: "100%", sm: 120 },
                borderRadius: "12px",
                textTransform: "none",
                borderRadius: "12px",
                px: 2,
                py: 1,
                minWidth: 120,
                whiteSpace: "nowrap",
              }}
            >
              Reset Filters
            </Button>
          </Tooltip>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-end items-stretch gap-3 w-full lg:w-auto">
            <Tooltip title="Download CSV">
            <Button
              variant="outlined"
              color="success"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                px: 2,
                py: 1,
                minWidth: 120,
                whiteSpace: "nowrap",
              }}
            >
              Download
            </Button>
          </Tooltip>

          <Tooltip title="New Transaction">
            <Button
              variant="outlined"
              startIcon={<AddCircle />}
              onClick={() => setModalOpen(true)}
              sx={{
                background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "12px",
                px: 2,
                py: 1,
                minWidth: 120,
                whiteSpace: "nowrap",
                "&:hover": {
                  background: "linear-gradient(90deg, #1e40af, #1d4ed8)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              New Transaction
            </Button>
          </Tooltip>
        </div>
      </div>
      <LogsTable
        rows={enableFilter ? filteredLogs : logs}
        type={endpoint}
        loading={loading}
      />

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products || []}
        onSubmit={handleSubmit}
        tType={type}
      />
    </div>
  );
}
