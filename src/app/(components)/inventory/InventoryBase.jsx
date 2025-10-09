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
import { FilterAlt, RestartAlt, Download, AddCircle } from "@mui/icons-material";
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      const data = await res.json();
      setLogs(data);
      setFilteredLogs(data);
    } catch (err) {
      toast.error(err.message || `Could not load ${endpoint}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (form, transactionType) => {
    console.log(form)
    const body =
      transactionType === "sale"
        ? { productId: form.productId, quantity:form.quantity, unitPrice:form.price }
        : { productId: form.productId, quantity:form.quantity, unitCost:form.price };

    try {
      const response = await fetch(`${API_URL}api/products/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Transaction failed");
      }

      toast.success("Transaction successful!");
      refetch();
      fetchLogs();
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
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
      ...filteredLogs.map((log) => headers.map((h) => JSON.stringify(log[h] ?? "")).join(",")),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${endpoint}_logs_${Date.now()}.csv`);
    toast.success("Download started");
  };

  if (isError) return <div className="text-center text-red-500">Failed to fetch products</div>;

  return (
    <div className="flex flex-col">
    <Header name={`${title}`} />
      <div className="flex md:flex-row flex-col justify-between my-6">
      <div className="flex flex-wrap items-end gap-3">
  <TextField
    label="From"
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    size="small"
  />
  <TextField
    label="To"
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    size="small"
  />

  <Tooltip title="Filter">
    <Button variant="contained" color="primary" onClick={handleFilter}>
      <FilterAlt />
    </Button>
  </Tooltip>

  <Tooltip title="Reset">
    <Button variant="outlined" color="secondary" onClick={handleReset}>
      <RestartAlt />
    </Button>
  </Tooltip>
</div>

<div className="flex flex-wrap items-end gap-3 md:justify-end">
  <Tooltip title="Download">
    <Button
      variant="contained"
      color="success"
      onClick={handleDownload}
      className="w-full sm:w-auto"
    >
      <Download />
    </Button>
  </Tooltip>

  <Tooltip title="New Transaction">
    <Button
      onClick={() => setModalOpen(true)}
      className="bg-blue-600 text-white w-full sm:w-auto"
    >
      <AddCircle />
    </Button>
  </Tooltip>
</div>

        
      </div>

      <LogsTable rows={enableFilter ? filteredLogs : logs} type={endpoint} loading={loading} />

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
