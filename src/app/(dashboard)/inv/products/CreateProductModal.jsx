"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid"
import { Add, Delete } from "@mui/icons-material";
import { v4 } from "uuid";

const CreateProductModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    productId: v4(),
    name: "",
    description: "",
    price: 0,
    categoryId:"",
    stockQuantity: 0,
    rating: 0,
  });
  const doorTypes = ["Single Door", "Double Door", "Sliding Door", "French Door"];
  const lockTypes = ["Padlock", "Deadbolt", "Lever Handle", "Knob Lock"];
  
  const [variants, setVariants] = useState([
    {
      sku: "",
      purchasePrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      attributes: [      { name: "Length", value: 0 }, // ← input for length
      { name: "width", value: 0 }, ],
    },
  ]);
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.name.trim()) newErrors.name = "Type is required";
  
    variants.forEach((variant, vIndex) => {
      if (!variant.sku.trim())
        newErrors[`variant_sku_${vIndex}`] = "SKU is required";
      if (variant.stockQuantity < 0)
        newErrors[`variant_stockPrice_${vIndex}`] = "Variant stock cannot be negative";
        if (variant.purchasePrice <= 0)
        newErrors[`variant_purchasePrice_${vIndex}`] = "Purchase price must be greater than 0";
      if (variant.sellingPrice <= 0)
        newErrors[`variant_sellingPrice_${vIndex}`] = "Selling price must be greater than 0";
      
      variant.attributes.forEach((attr, aIndex) => {
        if (!attr.name.trim())
          newErrors[`attr_name_${vIndex}_${aIndex}`] = "Attribute name required";
        if (attr.value.trim<=0)
          newErrors[`attr_value_${vIndex}_${aIndex}`] = "Attribute value must be greater than 0";
      });
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  // 🔹 Input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stockQuantity" || name === "rating"
          ? parseFloat(value)
          : value,
    });
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...variants];
    updated[index][name] =
      name === "price" || name === "stockQuantity" ? parseFloat(value) : value;
    updated[index][name] =
      ["purchasePrice", "sellingPrice", "stockQuantity"].includes(name)
        ? parseFloat(value)
        : value;
    setVariants(updated);
  };

  const handleAttributeChange = (
    variantIndex,
    attrIndex,
    e
  ) => {
    const { name, value } = e.target;
    const updated = [...variants];
    updated[variantIndex].attributes[attrIndex][name] = value;
    setVariants(updated);
  };

  // 🔹 Add/remove variant or attribute
  const addVariant = () =>
    setVariants([
      ...variants,
      { sku: "", price: 0, stockQuantity: 0, attributes: [{ name: "", value: "" }] },
    ]);

  const removeVariant = (index) =>
    setVariants(variants.filter((_, i) => i !== index));

  const addAttribute = (variantIndex) => {
    const updated = [...variants];
    updated[variantIndex].attributes.push({ name: "", value: "" });
    setVariants(updated);
  };

  const removeAttribute = (variantIndex, attrIndex) => {
    const updated = [...variants];
    updated[variantIndex].attributes = updated[variantIndex].attributes.filter(
      (_, i) => i !== attrIndex
    );
    setVariants(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(errors)
    console.log(formData,variants,validateForm())
    if (!validateForm()) return;
    onCreate({ ...formData, variants });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{ "& .MuiDialog-paper": { borderRadius: 3,p:1 } }}
    >
      <DialogTitle variant="h6" textAlign="center" sx={{ fontWeight: 600 }}>
        Create New Product
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 , }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Grid container spacing={4}>
            {/* PRODUCT DETAILS */}
            <Grid item xs={12} sm={6}>
            <TextField
    select
    fullWidth
    label="Select Category"
    name="categoryId"
    value={formData.categoryId || ""}
    onChange={handleChange}
    SelectProps={{ native: true }}
    required
  >
    
    <option key="" value="Select Category">Select Category</option>
    <option value="b52d030f-1309-4099-bc85-b3d040fb9806">Lock</option>
    <option value="c25b2efb-ec58-4036-a38e-65e9c2c5bcfc">Door</option>
  </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
            <TextField
  select
  fullWidth
  label={`Type`}
  name="name"
  value={formData.name}
  error={!!errors.name}
  helperText={errors.name}
  onChange={handleChange}
  SelectProps={{ native: true }}
>
<option key="Select Type" value="Select Type">Select Type</option>
  {formData.categoryId === "c25b2efb-ec58-4036-a38e-65e9c2c5bcfc"
    ? doorTypes.map((type) => <option key={type} value={type}>{type}</option>)
    : formData.categoryId === "b52d030f-1309-4099-bc85-b3d040fb9806"
    ? lockTypes.map((type) => <option key={type} value={type}>{type}</option>)
    : null}
</TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Product Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rating"
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                inputProps={{ step: "0.1", min: "0", max: "5" }}
              />
            </Grid>
          </Grid>
          </Box>
          {/* VARIANTS SECTION */}
          <Typography variant="h6" sx={{ mt: 4, fontWeight: 600 }}>
            Variants
          </Typography>

          {variants.map((variant, vIndex) => (
            <Box
              key={vIndex}
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
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
                    error={!!errors[`variant_sku_${vIndex}`]}
                    helperText={errors[`variant_sku_${vIndex}`]}
                    onChange={(e) => handleVariantChange(vIndex, e)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Purchase Price"
                    type="number"
                    name="purchasePrice"
                    value={variant.purchasePrice}
                    error={!!errors[`variant_purchasePrice_${vIndex}`]}
                    helperText={errors[`variant_purchasePrice_${vIndex}`]}
                    onChange={(e) => handleVariantChange(vIndex, e)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Selling Price"
                    type="number"
                    name="sellingPrice"
                    value={variant.sellingPrice}
                    error={!!errors[`variant_sellingPrice_${vIndex}`]}
                    helperText={errors[`variant_sellingPrice_${vIndex}`]}
                    onChange={(e) => handleVariantChange(vIndex, e)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Variant Stock"
                    type="number"
                    name="stockQuantity"
                    value={variant.stockQuantity}
                    error={!!errors[`variant_stockQuantity_${vIndex}`]}
                    helperText={errors[`variant_stockQuantity_${vIndex}`]}
                    onChange={(e) => handleVariantChange(vIndex, e)}
                  />
                </Grid>
              </Grid>

              {/* ATTRIBUTES */}
              {formData.categoryId == "door" && (
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 500 }}>
                Attributes
              </Typography>
              )}

              {variant.attributes.map((attr, aIndex) => (
                <Grid container spacing={2} key={aIndex} alignItems="center" sx={{ mt: 1 }}>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Attribute Name"
                      name="name"
                      value={attr.name}
                      error={!!errors[`attr_name_${vIndex}_${aIndex}`]}
                      helperText={errors[`attr_name_${vIndex}_${aIndex}`]}
                      onChange={(e) => handleAttributeChange(vIndex, aIndex, e)}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Value"
                      name="value"
                      value={attr.value}
                      error={!!errors[`attr_value_${vIndex}_${aIndex}`]}
                      helperText={errors[`attr_value_${vIndex}_${aIndex}`]}
                      onChange={(e) => handleAttributeChange(vIndex, aIndex, e)}
                    />
                  </Grid>
                  {/* <Grid item xs={2}>
                    <IconButton
                      color="error"
                      onClick={() => removeAttribute(vIndex, aIndex)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid> */}
                </Grid>
              ))}

              {/* <Button
                startIcon={<Add />}
                onClick={() => addAttribute(vIndex)}
                sx={{ mt: 1 }}
              >
                Add Attribute
              </Button> */}

              <Divider sx={{ my: 2 }} />
                {variants?.length > 1 && (

                  <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => removeVariant(vIndex)}
                  >
                Remove Variant
              </Button>
                )} 
            </Box>
          ))}

          <Button
            variant="contained"
            color="success"
            startIcon={<Add />}
            onClick={addVariant}
            sx={{ mt: 3 }}
          >
            Add Variant
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
          Create Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProductModal;
