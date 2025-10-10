"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Divider,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";

const UpdateProductModal = ({ open, onClose, product, onUpdate }) => {
  const [formData, setFormData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId || "",
        rating: product.rating || 0,
      });
      setVariants(
        product.variants?.map((v) => ({
          variantId: v.variantId,
          sku: v.sku || "",
          purchasePrice: v.purchasePrice || 0,
          sellingPrice: v.sellingPrice || 0,
          stockQuantity: v.stockQuantity || 0,
          attributes: v.attributes || [],
        })) || []
      );
    }
  }, [product]);

  if (!formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...variants];
    updated[index][name] = [
      "purchasePrice",
      "sellingPrice",
      "stockQuantity",
    ].includes(name)
      ? parseFloat(value)
      : value;
    setVariants(updated);
  };

  const handleAttributeChange = (vIndex, aIndex, e) => {
    const { name, value } = e.target;
    const updated = [...variants];
    // clone the attribute object to avoid mutating read-only object
    const updatedAttribute = { ...updated[vIndex].attributes[aIndex], [name]: value };
    updated[vIndex].attributes = [...updated[vIndex].attributes]; // clone attributes array
    updated[vIndex].attributes[aIndex] = updatedAttribute; // set updated attribute
    setVariants(updated);
  };
  

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onUpdate({
        ...formData,
        productId: product.productId,
        variants,
      });
      onClose();
    } catch (err) {
        return err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 600 }}>Update Product</DialogTitle>
      <Divider />
      <DialogContent sx={{ mt: 2 }}>
        {/* Basic Info */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              SelectProps={{ native: true }}
            >
              <option value="">Select Category</option>
              <option value="b52d030f-1309-4099-bc85-b3d040fb9806">Lock</option>
              <option value="c25b2efb-ec58-4036-a38e-65e9c2c5bcfc">Door</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Rating"
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              inputProps={{ step: "0.1", min: 0, max: 5 }}
            />
          </Grid>
        </Grid>

        {/* Variants */}
        <Typography
          variant="h6"
          sx={{ mt: 5, mb: 1, fontWeight: 600, color: "text.primary" }}
        >
          Variants
        </Typography>

        {variants.map((variant, vIndex) => (
          <Box
            key={vIndex}
            sx={{
              mt: 2,
              mb: 3,
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              backgroundColor: "#fafafa",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={variant.sku}
                  onChange={(e) => handleVariantChange(vIndex, e)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  value={variant.purchasePrice}
                  onChange={(e) => handleVariantChange(vIndex, e)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Selling Price"
                  name="sellingPrice"
                  type="number"
                  value={variant.sellingPrice}
                  onChange={(e) => handleVariantChange(vIndex, e)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stockQuantity"
                  type="number"
                  value={variant.stockQuantity}
                  onChange={(e) => handleVariantChange(vIndex, e)}
                />
              </Grid>
            </Grid>

            {/* Attributes */}
            {variant.attributes?.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
                >
                  Attributes
                </Typography>

                {variant.attributes.map((attr, aIndex) => (
                  <Box
                    key={aIndex}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Attribute Name"
                      name="name"
                      value={attr.name}
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      fullWidth
                      label="Value"
                      name="value"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(vIndex, aIndex, e)}
                    />
                  </Box>
                ))}
              </>
            )}
          </Box>
        ))}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} />}
        >
          {loading ? "Updating..." : "Update Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateProductModal;
