"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Tooltip,
  Stack,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Loader from "@/app/(components)/common/Loader";
import dayjs from "dayjs";
import { reverseCategoryMap } from "@/lib/DoorConfig";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@/app/(components)/inventory/DeleteConfirmModal";

export default function ReceivablePage() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

  const [payDialog, setPayDialog] = useState({
    open: false,
    receivableId: null,
    amount: 0,
    method: "", // Payment method
    reference: "", // Optional transaction ID
    notes: "", // Optional notes
  });

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}api/products/receivables`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setList(data);
      setFilteredList(data);
    } catch (error) {
      console.error("Failed to fetch receivables:", error);
    }
    setLoading(false);
  }

  async function handleRecordPayment() {
    if (!payDialog.amount || payDialog.amount <= 0)
      return toast("Enter valid payment amount");
    setPayLoading(true);
    try {
      const res = await fetch(
        `${API_URL}api/products/receivables/${payDialog.receivableId}/pay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentAmount: Number(payDialog.amount) }),
        }
      );

      if (res.ok) {
        setPayDialog({
          open: false,
          receivableId: null,
          amount: 0,
          method: "",
          reference: "",
          notes: "",
        });
        await fetchData();
      } else {
        console.error("Payment failed:", await res.text());
        toast("Failed to record payment. Please try again.");
      }
    } catch (error) {
      console.error("Error recording payment:", error);
    } finally {
      setPayLoading(false);
    }
  }
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      await fetch(`${API_URL}api/products/receivables/${selectedItem}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      setDeleteOpen(false);
    } catch (err) {
      setDeleteOpen(false);
    }
  };

  // --- Enhanced Columns ---
  const columns = [
    {
      field: "customerName",
      headerName: "Customer",
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={`Contact: ${params.row.contactInfo || "N/A"}`}>
          <Typography>
            {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          </Typography>
        </Tooltip>
      ),
    },
    // { field: "saleId", headerName: "Sale ID", flex: 1 },
    {
      field: "product",
      headerName: "Product Info",
      flex: 3,
      minWidth: 280,
      renderCell: (params) => {
        const p = params.row.sale?.product;
        if (!p) return "-";
        const variant = p.variants?.[0];
        const size = variant?.attributes?.find((a) => a.name === "Size")?.value;
        const category = reverseCategoryMap[p?.categoryId];
        const fnm = category.charAt(0).toUpperCase() + category.slice(1);
        return (
          <Stack spacing={0.3}>
            <Typography fontWeight="bold">
              {p.name} {`"${size}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fnm}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: "amountDue",
      headerName: "Tota Amount",
      flex: 1,
      renderCell: (params) => `Rs ${params.row.sale.totalAmount.toFixed(2)}`,
    },
    {
      field: "amountPaid",
      headerName: "Paid",
      flex: 1,
      renderCell: (params) => `Rs ${params.value.toFixed(2)}`,
    },
    {
      field: "balance",
      headerName: "Unpaid",
      flex: 1,
      // valueGetter: (params) => params.row.amountDue - params.row.amountPaid,
      renderCell: (params) => {
        const balance = params?.row?.sale?.totalAmount - params?.row?.amountPaid ;
        console.log(balance)
        return (
          <Typography color={balance > 0 ? "error.main" : "success.main"}>
            Rs {balance.toFixed(2) || "-"}
          </Typography>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const statusColor =
          params.value === "paid"
            ? "success"
            : params.value === "partial"
            ? "warning"
            : "error";
        return <Chip label={params.value.toUpperCase()} color={statusColor} />;
      },
    },
    {
      field: "createdAt",
      headerName: "Sale date",
      flex: 1,
      renderCell: (params) => dayjs(params.value).format("YYYY-MM-DD HH:mm"),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params) =>
        params.value ? dayjs(params.value).format("YYYY-MM-DD") : "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              setPayDialog({
                open: true,
                receivableId: params.row.receivableId,
                amount: params.row.amountDue,
                method: "",     // explicitly controlled
                reference: "",
                notes: "",
              })
            }
          >
            Pay
          </Button>
          <Button
            size="small"
            color="error"
            variant="text"
            onClick={() => handleDeleteClick(params.row.receivableId)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  // --- Filter/Search logic ---
  useEffect(() => {
    const filtered = list.filter((item) =>
      item.customerName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredList(filtered);
  }, [search, list]);

  const totalDue = useMemo(
    () => list.reduce((sum, r) => sum + r.amountDue, 0),
    [list]
  );
  const totalPaid = useMemo(
    () => list.reduce((sum, r) => sum + r.amountPaid, 0),
    [list]
  );

  return (
    <Box className="p-6">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Receivables
        </Typography>
        <TextField
          label="Search Customer"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {loading ? (
        <Loader />
      ) : (
       <>
        <Box
          sx={{
            height: { xs: 420, md: 600 },
            "& .MuiDataGrid-root": {
              border: "none",
              minWidth: "100%",
            },
            "& .MuiDataGrid-columnHeaders": {
              fontWeight: "bold",
              backgroundColor: "#f9fafb",
              whiteSpace: "nowrap",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              //  justifyContent: "center",
              //  textAlign: "center",
              lineHeight: 1.4,
              whiteSpace: "normal", // allow wrapping
              wordBreak: "break-word", // break long words
              overflow: "visible",
            },
            "& .MuiDataGrid-cellContent": {
              overflow: "visible !important",
              textOverflow: "unset !important",
              whiteSpace: "normal !important",
            },
            "& .MuiDataGrid-virtualScroller": {
              overflowX: "auto",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#fafafa",
            },
          }}
        >
          <DataGrid
            autoHeight
            rows={filteredList}
            columns={columns.map((col) => ({
              ...col,
              flex: col.flex || 1,
              minWidth: 140, // prevent squishing
            }))}
            getRowId={(row) => row.receivableId}
            disableRowSelectionOnClick
            density="comfortable"
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        </Box>
              <Box
              mt={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1">
                Total Due: <strong>Rs {totalDue.toFixed(2)}</strong>
              </Typography>
              <Typography variant="subtitle1" color="success">
                Total Paid: <strong>Rs {totalPaid.toFixed(2)}</strong>
              </Typography>
            </Box>
        </>
      )}

      {/* Summary Footer */}

      {/* Payment Dialog */}
      <Dialog
        open={payDialog.open}
        onClose={() =>
          setPayDialog({ open: false, receivableId: null, amount: 0, method: "",reference: "", notes: "", })
        }
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Payment Amount"
            type="number"
            fullWidth
            margin="normal"
            value={payDialog.amount}
            onChange={(e) =>
              setPayDialog({ ...payDialog, amount: e.target.value })
            }
          />

          <TextField
            select
            label="Payment Method"
            fullWidth
            margin="normal"
            value={payDialog.method || ""}
            onChange={(e) =>
              setPayDialog({ ...payDialog, method: e.target.value })
            }
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          <TextField
            label="Reference / Transaction ID"
            fullWidth
            margin="normal"
            value={payDialog.reference}
            onChange={(e) =>
              setPayDialog({ ...payDialog, reference: e.target.value })
            }
          />

          <TextField
            label="Notes"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={payDialog.notes}
            onChange={(e) =>
              setPayDialog({ ...payDialog, notes: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setPayDialog({ open: false, receivableId: null, amount: 0, method: "",reference: "", notes: "", })
  
            }
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRecordPayment}
            disabled={payLoading}
          >
            {payLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmModal
  open={deleteOpen}
  onClose={() => setDeleteOpen(false)}
  onDelete={handleConfirmDelete}
  itemName={"Receivable"}
/>
    </Box>
  );
}
