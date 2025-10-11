"use client";

import dynamic from "next/dynamic";
import { GridColDef } from "@mui/x-data-grid";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  { ssr: false, loading: () => <p>...</p> }
);

export default function LogsTable({ rows, type,loading, }: { rows: any[]; type: "sales" | "purchases";loading?:boolean }) {
  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 90 },
    { field: "productName", headerName: "Product", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    {
      field: "price",
      headerName: type === "sales" ? "Selling Price" : "Unit Cost",
      flex: 1,
      valueGetter: (_, row) => {
        const amount = type === "sales" ? row?.totalAmount / row?.quantity : row?.totalCost / row?.quantity;
        return amount != null ? "Rs " + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
      },
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      valueGetter: (_, row) => {
        const amount = type === "sales" ? row?.totalAmount : row?.totalCost;
        return amount != null ? "Rs " + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
      },
    },
    
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      valueGetter: (_, row) => {
        const date = new Date(row?.date);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    
  ];
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.purchaseId||row.saleId}
      loading={loading} 
      className="bg-white shadow rounded-lg border border-gray-200 mt-2 !text-gray-700"
    />
  );
}
