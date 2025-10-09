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

  const handleSubmit = () => {
    console.log(form)
    onSubmit(form, transactionType);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {transactionType === "sale" ? "New Sale" : "New Purchase"}
      </DialogTitle>
      <DialogContent className="space-y-4">
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
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            {products.map((p) => (
              <MenuItem key={p.productId} value={p.productId}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="number"
          label="Quantity"
          fullWidth
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
        />

        <TextField
          type="number"
          fullWidth
          label={transactionType === "sale" ? "Unit Price" : "Unit Cost"}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {transactionType === "sale" ? "Record Sale" : "Record Purchase"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
