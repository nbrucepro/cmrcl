"use client";

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
} from "@mui/material";
import { useState } from "react";

export default function TransactionModal({
  open,
  onClose,
  products,
  tType,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  products: any[];
  tType:any;
  onSubmit: (form: any, type: "sale" | "purchase") => void;
}) {
  const [transactionType, setTransactionType] = useState<"sale" | "purchase">(
    tType || "sale"
  );
  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    price: 0,
  });
  const [errors, setErrors] = useState<{ quantity?: string; productId?: string }>({});
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    const product = products.find((p) => p.productId === form.productId);
    const newErrors: any = {};
  
    if (!form.productId) newErrors.productId = "Please select a product.";
    if (form.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0.";
    if (
      transactionType === "sale" &&
      product &&
      form.quantity > product.stock
    )
      newErrors.quantity = `Cannot sell more than available stock (${product.stock}).`;
  
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      setLoading(true);
      await onSubmit(form, transactionType);
      onClose();
    } finally {
      setLoading(false);
    }
  };
console.log(products)
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {transactionType === "sale" ? "New Sale" : "New Purchase"}
      </DialogTitle>
      <DialogContent>
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>

        <FormControl fullWidth>
          <InputLabel>Transaction Type</InputLabel>
          <Select
            value={transactionType}
            onChange={(e) =>
              setTransactionType(e.target.value as "sale" | "purchase")
            }
          >
            <MenuItem value="sale">Sale</MenuItem>
            <MenuItem value="purchase">Purchase</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Product</InputLabel>
          <Select
            value={form.productId}
            // onChange={(e) => setForm({ ...form, productId: e.target.value })}
            onChange={(e) => {
              const selectedId = e.target.value;
              const product = products.find((p) => p.productId === selectedId);
              setForm({
                ...form,
                productId: selectedId,
                price: product ?  (transactionType === "sale" ? product?.variants[0]?.sellingPrice : product?.variants[0]?.purchasePrice) : 0, // default to product price
              });
              
            setErrors({ ...errors, productId: "" });
            }}
          >
            {products.map((p) => (
              <MenuItem key={p.productId} value={p.productId}>
                {p.name} (Stock: {p?.variants[0]?.stockQuantity})
              </MenuItem>
            ))}
          </Select>
          {errors.productId && (
          <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.productId}</p>
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
            const product = products.find((p) => p.productId === form.productId);
        
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
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        </div>
        </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}   
          disabled={loading || !form.productId || form.quantity <= 0 || !!errors.quantity}>
          {loading
    ? (transactionType === "sale" ? "Recording Sale..." : "Recording Purchase...")
    : (transactionType === "sale" ? "Record Sale" : "Record Purchase")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
