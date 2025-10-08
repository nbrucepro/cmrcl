"use client";

import dynamic from "next/dynamic";
import { GridColDef } from "@mui/x-data-grid";
import Loader from "../common/Loader";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  { ssr: false, loading: () => <Loader/> }
);

const columns: GridColDef[] = [
  { field: "productId", headerName: "ID", width: 90 },
  { field: "name", headerName: "Product Name", width: 200 },
  {
    field: "price",
    headerName: "Price",
    flex: 1,
    type: "number",
    valueGetter: (_, row) => `Frw ${row.price}`,
  },
  {
    field: "rating",
    headerName: "Rating",
    flex: 1,
    type: "number",
    valueGetter: (_, row) => (row.rating ? row.rating : "N/A"),
  },
  {
    field: "stockQuantity",
    headerName: "Stock Quantity",
    flex: 1,
    type: "number",
  },
];

export default function ProductTable({ products,isLoading }: { products: any[],isLoading?:boolean }) {
 console.log(isLoading)
  return (
    <DataGrid
      rows={products}
      columns={columns}
      getRowId={(row) => row.productId}
      loading={isLoading}
      checkboxSelection
      className="bg-white shadow rounded-lg border border-gray-200 mt-2 !text-gray-700"
    />
  );
}
