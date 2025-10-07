"use client";

import Header from "@/app/(components)/Header";
import Loader from "@/app/(components)/common/Loader";
import LogsTable from "@/app/(components)/inventory/LogsTable";
import { useEffect, useState } from "react";

export default function SalesPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_URL}api/products/sales`)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <Header name="Sales Logs" />
      <LogsTable rows={logs} type="sales" />
    </div>
  );
}
