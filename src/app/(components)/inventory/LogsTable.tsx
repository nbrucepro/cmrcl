"use client";

import dynamic from "next/dynamic";
import { GridColDef } from "@mui/x-data-grid";
import { reverseCategoryMap } from "@/lib/DoorConfig";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  { ssr: false, loading: () => <p>...</p> }
);

export default function LogsTable({ rows, type,loading, }: { rows: any[]; type: "sales" | "purchases";loading?:boolean }) {
  console.log(rows)

  const columns: GridColDef[] = [
    {
      field: "categoryId",
      headerName: "Category",
      flex: 1,
      valueGetter: (_, row) => {
        const categoryName = reverseCategoryMap[row?.categoryId] || "";
        const fnm = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        return fnm;
      },
    },
    {
      field: "productName",
      headerName: "Product Name",
      flex: 1,
      valueGetter: (_, row) => {
        const size = row?.pAttributes?.find((a: any) => a.name === "Size")?.value || "";
        return `${row?.productName || ""}${size ? ` ${size}"` : ""}`;
      },      
    },
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
