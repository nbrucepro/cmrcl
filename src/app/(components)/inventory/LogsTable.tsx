"use client";

import dynamic from "next/dynamic";
import { GridColDef } from "@mui/x-data-grid";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  { ssr: false, loading: () => <p>...</p> }
);

export default function LogsTable({ rows, type,loading, }: { rows: any[]; type: "sales" | "purchases";loading?:boolean }) {
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "productName", headerName: "Product", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    {
      field: "price",
      headerName: type === "sales" ? "Unit Price" : "Unit Cost",
      flex: 1,
      valueGetter: (_, row) => `Frw ${row.price}`,
    },
    { field: "date", headerName: "Date", flex: 1 },
  ];
console.log(loading)
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      loading={loading} 
      className="bg-white shadow rounded-lg border border-gray-200 mt-2 !text-gray-700"
    />
  );
}
