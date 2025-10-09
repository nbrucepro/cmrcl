"use client";

import dynamic from "next/dynamic";
import { GridColDef } from "@mui/x-data-grid";
import Loader from "../common/Loader";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  { ssr: false, loading: () => <Loader /> }
);

const columns: GridColDef[] = [
  { field: "sku", headerName: "SKU", width: 120 },
  { field: "name", headerName: "Product Name", width: 180 },
  {
    field: "purchasePrice",
    headerName: "Purchase Price",
    flex: 1,
    type: "number",
    valueGetter: (_, row) => `$ ${row.purchasePrice || 0}`,
  },
  {
    field: "sellingPrice",
    headerName: "Selling Price",
    flex: 1,
    type: "number",
    valueGetter: (_, row) => `$ ${row.sellingPrice || 0}`,
  },
  {
    field: "stockQuantity",
    headerName: "Stock Quantity",
    flex: 1,
    type: "number",
    valueGetter: (_, row) => row.stockQuantity || 0,
  },
  // {
  //   field: "attributes",
  //   headerName: "Attributes",
  //   flex: 1,
  //   valueGetter: (_, row) =>
  //     row.attributes?.map((attr: any) => `${attr.name}: ${attr.value}`).join(", ") || "—",
  // },
];

export default function ProductTable({
  products,
  isLoading,
}: {
  products: any[];
  isLoading?: boolean;
}) {
  // flatten product variants
  const rows = products.flatMap((product) =>
    (product.variants || []).map((variant: any) => ({
      ...variant,
      name: product.name,
      rating: product.rating,
      productId: product.productId,
    }))
  );

  console.log(rows); // ✅ flattened data preview

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.variantId}
      loading={isLoading}
      checkboxSelection
      className="bg-white shadow rounded-lg border border-gray-200 mt-2 !text-gray-700"
    />
  );
}
