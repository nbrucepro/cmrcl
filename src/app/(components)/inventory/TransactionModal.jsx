"use client";

import { useCategoryMap } from "@/lib/DoorConfig";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useState } from "react";

export default function TransactionModal({
  open,
  onClose,
  products,
  tType,
  onSubmit,
}) {
  const [transactionType, setTransactionType] = useState(tType || "sale");
  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    price: 0,
    amountPaid: 0,
    customerName: "",
    contactInfo: "",
    supplierName: "",
    dueDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasBalance, setHasBalance] = useState(false);
  const { reverseCategoryMap } = useCategoryMap();

  const handleSubmit = async () => {
    const product = products.find((p) => p.productId === form.productId);
    const newErrors = {};

    if (!form.productId) newErrors.productId = "Please select a product.";
    if (form.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0.";
    if (transactionType === "sale" && product && form.quantity > product.stock)
      newErrors.quantity = `Cannot sell more than available stock (${product.stock}).`;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      setLoading(true);
      await onSubmit(form, transactionType, hasBalance);
      onClose();
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {transactionType === "sale" ? "New Sale" : "New Purchase"}
      </DialogTitle>
      <DialogContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.8rem",
            padding: "1rem 0.5rem",
          }}
        >
          <FormControl
            fullWidth
            sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
          >
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              label="Transaction Type"
              disabled
            >
              <MenuItem value="sale">Sale</MenuItem>
              <MenuItem value="purchase">Purchase</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
          >
            <InputLabel>Product</InputLabel>
            <Select
              value={form.productId}
              label="Product"
              onChange={(e) => {
                const selectedId = e.target.value;
                const product = products.find(
                  (p) => p.productId === selectedId
                );
                setForm({
                  ...form,
                  productId: selectedId,
                  price: product
                    ? transactionType === "sale"
                      ? product?.variants[0]?.sellingPrice
                      : product?.variants[0]?.purchasePrice
                    : 0, // default to product price
                });

                setErrors({ ...errors, productId: "" });
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    overflowY: "auto",
                  },
                },
              }}
            >
              {/* {products.map((p) => (
              <MenuItem key={p.productId} value={p.productId}>
                {p.name} (Stock: {p?.variants[0]?.stockQuantity})
              </MenuItem>
            ))} */}
              {products.map((p) => {
                const categoryName = reverseCategoryMap[p.categoryId];
                const isMattress = categoryName
                  ?.toLowerCase()
                  .includes("mattress");
                const categoryPrefix = categoryName
                  ? categoryName.charAt(0).toUpperCase()
                  : "";
                const design =
                  p.variants?.[0]?.attributes?.find((a) => a.name === "Design")
                    ?.value || "";
                const size =
                  p.variants?.[0]?.attributes?.find((a) => a.name === "Size")
                    ?.value || "";
                const type =
                  p.variants?.[0]?.attributes?.find((a) => a.name === "Type")
                    ?.value || "";
                const height =
                  p.variants?.[0]?.attributes?.find((a) => a.name === "Height")
                    ?.value || "";

                const mattressAbbr = `M-${type}-${height?.replace(/\s*inch/i, '"')}`;

                const shortName = `${categoryPrefix}-${
                  design?.charAt(0)?.toUpperCase() || ""
                }-${size}`;
                const pname = categoryName ? shortName : p.name
                const displayName = isMattress
                ? mattressAbbr
                : pname;

                return (
                  <MenuItem key={p.productId} value={p.productId}>
                    {displayName} (Stock:{" "}
                    {p?.variants?.[0]?.stockQuantity ?? 0})
                  </MenuItem>
                );
              })}
            </Select>
            {errors.productId && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.productId}
              </p>
            )}
          </FormControl>

          <TextField
            type="number"
            label="Quantity"
            fullWidth
            value={form.quantity}
            error={!!errors.quantity}
            helperText={errors.quantity}
            // onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            onChange={(e) => {
              const qty = Number(e.target.value);
              let err = "";
              const product = products.find(
                (p) => p.productId === form.productId
              );

              if (!form.productId) err = "Select a product first.";
              else if (qty <= 0) err = "Quantity must be greater than 0.";
              else if (
                transactionType === "sale" &&
                product &&
                qty > product.stock
              )
                err = `Cannot sell more than available stock (${product.stock}).`;

              setErrors({ ...errors, quantity: err });
              setForm({ ...form, quantity: qty });
            }}
          />

          <TextField
            type="number"
            fullWidth
            label={transactionType === "sale" ? "Unit Price" : "Unit Cost"}
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />
          {transactionType === "sale" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasBalance}
                  onChange={(e) => setHasBalance(e.target.checked)}
                />
              }
              label="Customer still owes money?"
            />
          )}

          {hasBalance && (
            <>
              <TextField
                type="number"
                fullWidth
                label="Amount Paid"
                value={form.amountPaid}
                onChange={(e) =>
                  setForm({ ...form, amountPaid: Number(e.target.value) })
                }
                sx={{ mt: 1 }}
              />
              <TextField
                fullWidth
                type="text"
                label={
                  transactionType === "sale" ? "Customer Name" : "Supplier Name"
                }
                value={
                  transactionType === "sale"
                    ? form.customerName
                    : form.supplierName
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    [transactionType === "sale"
                      ? "customerName"
                      : "supplierName"]: e.target.value,
                  })
                }
                sx={{ mt: 1 }}
              />
              <TextField
                type="text"
                fullWidth
                label="Contact Info"
                value={form.contactInfo}
                onChange={(e) =>
                  setForm({ ...form, contactInfo: e.target.value })
                }
                sx={{ mt: 1 }}
              />
              <TextField
                type="date"
                fullWidth
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={form.dueDate || ""}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                sx={{ mt: 1 }}
              />
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                sx={{ mt: 1 }}
              />
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={loading && <CircularProgress size={18} />}
          disabled={
            loading ||
            !form.productId ||
            form.quantity <= 0 ||
            !!errors.quantity
          }
        >
          {loading
            ? transactionType === "sale"
              ? "Recording Sale..."
              : "Recording Purchase..."
            : transactionType === "sale"
            ? "Record Sale"
            : "Record Purchase"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
