"use client";

import dynamic from "next/dynamic";
import { useCategoryMap } from "@/lib/DoorConfig";
import Loader from "../common/Loader";
import { useMemo, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import SaleBill from "../../../components/SaleBill";
import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

const DataGrid = dynamic(
  () => import("@mui/x-data-grid").then((mod) => mod.DataGrid),
  {
    ssr: false,
    loading: () => (
      <>
        <Loader />
      </>
    ),
  }
);

export default function LogsTable({ rows, type, loading,onEditTransaction, onDeleteTransaction  }) {
  const { reverseCategoryMap } = useCategoryMap();
  const totalProfit = useMemo(() => {
    if (type !== "sales" || !rows) return 0;
    return rows.reduce((sum, row) => sum + (row.profit || 0), 0);
  }, [rows, type]);
  const totalSale = useMemo(() => {
    if (type !== "sales" || !rows) return 0;
    return rows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
  }, [rows, type]);
  const printRef = useRef();
  const [selectedSale, setSelectedSale] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Sales Bill",
    removeAfterPrint: true,
  });
  const columns = [
    {
      field: "categoryId",
      headerName: "Category",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => {
        const categoryName = reverseCategoryMap[row?.categoryId] || "";
        const fnm =
          categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        return fnm;
      },
    },
    {
      field: "productName",
      headerName: "Product Name",
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) => {
        const size =
          row?.pAttributes?.find((a) => a.name === "Size")?.value || "";
        return `${row?.productName || ""}${size ? ` ${size}"` : ""}`;
      },
    },
    { field: "quantity", headerName: "Quantity", flex: 0.6, minWidth: 100 },
    ...(type === "sales"
    ? [
        {
          field: "price",
          headerName: "Purchase Price",
          flex: 1,
          minWidth: 130,
          valueGetter: (_, row) => {
            const profit = row?.cost || 0;
            return "Rs " + profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          },
        },
      ]
    : []),
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) => {
        const amount = type === "sales" ? row?.totalAmount : row?.totalCost;
        return amount != null
          ? "Rs " +
              amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
          : "—";
      },
    },

    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 180,
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
    ...(type === "sales"
    ? [
        {
          field: "profit",
          headerName: "Profit",
          flex: 1,
          minWidth: 130,
          valueGetter: (_, row) => {
            const profit = row?.profit || 0;
            return "Rs " + profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          },
        },
      ]
    : []),
    {
      field: "actions",
      headerName: "Actions",
      // flex:0.8,
      width:100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row"
        spacing={0.3}
        alignItems="center"
        justifyContent="center"
        sx={{ width: "100%", height: "100%" }}>
          <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEditTransaction?.(params.row, type)} >
          <Edit fontSize="16" className="text-indigo-600"/>
          </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
          <IconButton
            size="small"
            
            onClick={() => {
              onDeleteTransaction(params.row, type);
            }}
          >
          <Delete fontSize={"16"} className="text-red-600" />
          </IconButton>
          </Tooltip>
          {type === "sales" && (
            <Tooltip title="print">
            <IconButton
              size="small"
              variant="outline"
              onClick={() => {
                setSelectedSale(params.row);
                setTimeout(handlePrint, 100);
              }}
            >
            <Printer size={16} className=" text-blue-600 border-blue-300 hover:bg-blue-50"/>
            </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];
  // if (type === "sales") {
  //   columns.splice(5, 0, {
  //     field: "profit",
  //     headerName: "Profit",
  //     flex: 1,
  //     minWidth: 130,
  //     valueGetter: (_, row) => {
  //       const profit = row?.profit;

  //       return (
  //         "Rs " +
  //         profit.toLocaleString(undefined, {
  //           minimumFractionDigits: 2,
  //           maximumFractionDigits: 2,
  //         })
  //       );
  //     },
  //   });
  //   columns.splice(7, 0, {
  //     field: "actions",
  //     headerName: "Actions",
  //     minWidth: 100,
  //     headerAlign:"center",
  //     renderCell: (params) => (
  //       <Button
  //         size="sm"
  //         variant="outline"
  //         onClick={() => {
  //           setSelectedSale(params.row);
  //           setTimeout(handlePrint, 100); 
  //         }}
  //         className="text-blue-600 border-blue-300 hover:bg-blue-50"
  //       >
  //         <Printer size={16} className="mr-1" /> Print
  //       </Button>
  //     ),
  //   });
  // }

  return (
    <div className="w-full overflow-x-auto bg-white shadow-sm rounded-2xl border border-gray-100 p-3 sm:p-5 mt-4">
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.purchaseId || row.saleId}
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
      <div style={{ display: "none" }}>
      <div ref={printRef}>
        <SaleBill sale={selectedSale} />
        </div>
      </div>
      {type === "sales" && (
        <div className="flex gap-3 justify-end items-center p-3 font-semibold text-gray-700 border-t border-gray-200 mt-2">
          <div>
            Total Sale:{" "}
            <span className="ml-2">
              Rs{" "}
              {totalSale.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {"|"}
          <div>
            Total Profit:{" "}
            <span className="ml-2">
              Rs{" "}
              {totalProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
