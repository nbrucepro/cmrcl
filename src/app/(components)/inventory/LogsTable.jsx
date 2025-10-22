"use client";

import dynamic from "next/dynamic";
import { useCategoryMap } from "@/lib/DoorConfig";
import Loader from "../common/Loader";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  { ssr: false, loading: () => <><Loader/></> }
);

export default function LogsTable({ rows, type,loading, }) {
  const { reverseCategoryMap } = useCategoryMap();

  const columns= [
    {
      field: "categoryId",
      headerName: "Category",
      flex: 1,
      minWidth: 120,
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
      minWidth: 150,
      valueGetter: (_, row) => {
        const size = row?.pAttributes?.find((a) => a.name === "Size")?.value || "";
        return `${row?.productName || ""}${size ? ` ${size}"` : ""}`;
      },      
    },
    { field: "quantity", headerName: "Quantity", flex: 0.6, minWidth: 100 },
    {
      field: "price",
      headerName: type === "sales" ? "Selling Price" : "Unit Cost",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => {
        const amount = type === "sales" ? row?.totalAmount / row?.quantity : row?.totalCost / row?.quantity;
        return amount != null ? "Rs " + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
      },
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) => {
        const amount = type === "sales" ? row?.totalAmount : row?.totalCost;
        return amount != null ? "Rs " + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
      },
    },
    
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 160,
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
    <div className="w-full overflow-x-auto bg-white shadow-sm rounded-2xl border border-gray-100 p-3 sm:p-5 mt-4">
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.purchaseId||row.saleId}
      loading={loading} 
      className="bg-white shadow rounded-lg border border-gray-200 mt-2 !text-gray-700"
      autoHeight
      disableRowSelectionOnClick
      sx={{
        fontSize: { xs: "0.8rem", sm: "0.9rem" },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#f9fafb",
          fontWeight: 600,
          color: "#374151",
          borderBottom: "1px solid #e5e7eb",
        },
        "& .MuiDataGrid-cell": {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#374151",
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "#f3f4f6",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "1px solid #e5e7eb",
        },
      }}
    />
    </div>
  );
}
