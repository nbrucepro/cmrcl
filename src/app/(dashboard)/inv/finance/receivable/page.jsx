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
import toast from "react-hot-toast";
import DeleteConfirmModal from "@/app/(components)/inventory/DeleteConfirmModal";
import { Delete, Payment, Visibility } from "@mui/icons-material";
import { useCategoryMap } from "@/lib/DoorConfig";

export default function ReceivablePage() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    payments: [],
  });
  const { reverseCategoryMap } = useCategoryMap();

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
      return;
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
        toast("Failed to record payment. Please try again.");
      }
    } catch (error) {
      return;
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
            {params.value.charAt(0).toUpperCase() + params.value.slice(1) ||
              "—"}
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
      renderCell: (params) => `Rwf ${params.row.sale.totalAmount.toFixed(2)}`,
    },
    {
      field: "amountPaid",
      headerName: "Paid",
      flex: 1,
      renderCell: (params) => `Rwf ${params.value.toFixed(2)}`,
    },
    {
      field: "balance",
      headerName: "Unpaid",
      flex: 1,
      // valueGetter: (params) => params.row.amountDue - params.row.amountPaid,
      renderCell: (params) => {
        const balance =
          params?.row?.sale?.totalAmount - params?.row?.amountPaid;

        return (
          <Typography color={balance > 0 ? "error.main" : "success.main"}>
            Rwf {balance > 0 ? balance.toFixed(2) : 0}
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
        params.value ? dayjs(params.value).format("YYYY-MM-DD") : "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2.8,
      minWidth: 400,
      sortable: false,
      renderCell: (params) => {
        const isPaid = params.row.status === "paid";

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "nowrap",
              overflowX: "auto",
              justifyContent: "start",
              // "&::-webkit-scrollbar": { display: "none" },
              gap: 0.5,
              flexWrap: "nowrap",
              //  overflow: "hidden",
            }}
          >
            {!isPaid && (
              <Tooltip title="Record Payment">
                <Button
                  startIcon={<Payment />}
                  variant="contained"
                  size="small"
                  color="primary"
                  sx={{
                    p: "2px 6px",
                    minWidth: "auto",
                    fontSize: "0.7rem",
                    borderRadius: 1.5,
                    "& .MuiButton-startIcon": { mr: 0.3 },
                  }}
                  onClick={() =>
                    setPayDialog({
                      open: true,
                      receivableId: params.row.receivableId,
                      amount: params.row.balance || 0,
                      method: "",
                      reference: "",
                      notes: "",
                    })
                  }
                >
                  Pay
                </Button>
              </Tooltip>
            )}

            <Tooltip title="View Details">
              <Button
                startIcon={<Visibility />}
                color="info"
                size="small"
                sx={{
                  p: "2px 6px",
                  minWidth: "auto",
                  fontSize: "0.7rem",
                  borderRadius: 1.5,
                  "& .MuiButton-startIcon": { mr: 0.3 },
                }}
                onClick={() =>
                  setDetailsDialog({
                    open: true,
                    payments: params.row.payments,
                  })
                }
              ></Button>
            </Tooltip>

            <Tooltip title="Delete Receivable">
              <Button
                startIcon={<Delete />}
                color="error"
                size="small"
                sx={{
                  p: "2px 6px",
                  minWidth: "auto",
                  fontSize: "0.7rem",
                  borderRadius: 1.5,
                  "& .MuiButton-startIcon": { mr: 0.3 },
                }}
                onClick={() => handleDeleteClick(params.row.receivableId)}
              ></Button>
            </Tooltip>
          </Box>
        );
      },
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
              overflowX: "auto",
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
              Total Due: <strong>Rwf {totalDue.toFixed(2)}</strong>
            </Typography>
            <Typography variant="subtitle1" color="success">
              Total Paid: <strong>Rwf {totalPaid.toFixed(2)}</strong>
            </Typography>
          </Box>
        </>
      )}

      {/* Summary Footer */}

      {/* Payment Dialog */}
      <Dialog
        open={payDialog.open}
        onClose={() =>
          setPayDialog({
            open: false,
            receivableId: null,
            amount: 0,
            method: "",
            reference: "",
            notes: "",
          })
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
            hidden={true}
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
            hidden={true}
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
              setPayDialog({
                open: false,
                receivableId: null,
                amount: 0,
                method: "",
                reference: "",
                notes: "",
              })
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
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, payments: [] })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent dividers>
          {detailsDialog.payments.length === 0 ? (
            <Typography>No payments found for this receivable.</Typography>
          ) : (
            detailsDialog.payments.map((p, index) => (
              <Box
                key={p.paymentId || index}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography variant="body2">
                  <strong>Amount:</strong> Rwf {p.amount.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong>{" "}
                  {dayjs(p.paymentDate).format("YYYY-MM-DD HH:mm")}
                </Typography>
                <Typography variant="body2">
                  <strong>Method:</strong> {p.method || "N/A"}
                </Typography>
                {p.reference && (
                  <Typography variant="body2">
                    <strong>Reference:</strong> {p.reference}
                  </Typography>
                )}
                {p.notes && (
                  <Typography variant="body2">
                    <strong>Notes:</strong> {p.notes}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDetailsDialog({ open: false, payments: [] })}
          >
            Close
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
