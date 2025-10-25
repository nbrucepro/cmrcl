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
  Paper,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  useGetCategoriesQuery,
  useGetDesignsByCategoryQuery,
  useGetAttributesByCategoryQuery,
} from "@/state/api";
import { v4 } from "uuid";
import {
  designOptions,
  mattressOptions,
  mattressHeights,
  categoryAttributes,
  categoryIdMap,
  useCategoryMap,
} from "../../../../lib/DoorConfig";

const CreateProductModal = ({ isOpen, onClose, onCreate }) => {
  // inside the component
  const [loading, setLoading] = useState(false);
  const [otherType, setOtherType] = useState(""); // new

  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  const { categoryMap, reverseCategoryMap, isLoading: categoryLoading } = useCategoryMap();

  const [formData, setFormData] = useState({
    productId: v4(),
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    stockQuantity: 0,
    rating: 0,
  });

  const { data: designs = [], isLoading: designsLoading } =
  useGetDesignsByCategoryQuery(formData.categoryId, {
    skip: !formData.categoryId,
  });

const { data: attributes = [], isLoading: attributesLoading } =
  useGetAttributesByCategoryQuery(formData.categoryId, {
    skip: !formData.categoryId,
  });
  
  const dynamicAttributes =
  attributes?.map((attr) => ({
    name: attr.name,
    value: "",
  })) || [];

  const doorTypes = [
    "Single Door",
    "Double Door",
    "Sliding Door",
    "French Door",
  ];
  const lockTypes = ["Handle lock"];

  const [variants, setVariants] = useState([
    {
      sku: "",
      purchasePrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      attributes: [
        { name: "Length", value: 0 }, // ← input for length
        { name: "width", value: 0 },
      ],
    },
  ]);
  const [errors, setErrors] = useState({});
  const resetForm = () => {
    setFormData({
      productId: v4(),
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      stockQuantity: 0,
      rating: 0,
    });
    setVariants([
      {
        sku: `SKU-${Date.now()}`,
        purchasePrice: 0,
        sellingPrice: 0,
        stockQuantity: 0,
        attributes: dynamicAttributes
      },
    ]);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId || formData.categoryId === "Select Category") {
      newErrors.categoryId = "Category is required";
    }
    if (!formData.name.trim() || formData.name === "Select Design") {
      newErrors.name = "Design is required";
    }
    if (formData.name === "Other") {
      if (!otherType.trim()) {
        newErrors.otherType = "Please specify the Design";
      }
    }

    variants.forEach((variant, vIndex) => {
      // if (!variant.sku.trim())
      //   newErrors[`variant_sku_${vIndex}`] = "SKU is required";
      if (variant.stockQuantity < 0)
        newErrors[`variant_stockQuantity_${vIndex}`] =
          "Stock can not be negative";
      if (variant.purchasePrice <= 0)
        newErrors[`variant_purchasePrice_${vIndex}`] =
          "Purchase price must be greater than 0";
      if (variant.sellingPrice <= 0)
        newErrors[`variant_sellingPrice_${vIndex}`] =
          "Selling price must be greater than 0";
      variant.attributes?.forEach((attr, aIndex) => {
        if (!attr.value?.toString().trim()) {
          newErrors[`attr_${attr.name}_${vIndex}_${aIndex}`] = `${attr.name} is required`;
        }
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
      [name]: ["price", "stockQuantity", "rating"].includes(name)
        ? parseFloat(value)
        : value,
    });

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (name === "categoryId") {
      const selectedCategory = categories.find((cat) => cat.categoryId === value);
      const categoryName = selectedCategory?.name?.toLowerCase();
      setVariants([
        {
          sku: `SKU-${Date.now()}`,
          purchasePrice: 0,
          sellingPrice: 0,
          stockQuantity: 0,
          attributes: dynamicAttributes,
        },
      ]);
    }
  };
  const getCategoryNameById = (id) => {
    const category = categories.find((cat) => cat.categoryId === id);
    return category ? category.name.toLowerCase() : "";
  };

  const handleDesignChange = (e) => {
    const { value } = e.target;
    handleChange(e);
  
    if (!formData.categoryId) return;
  
    // Create dynamic attributes from API
    const dynamicAttributes = attributes?.map((attr) => ({
      name: attr.name,
      value: "",
    })) || [];
  
    setVariants([
      {
        sku: `SKU-${Date.now()}`,
        purchasePrice: 0,
        sellingPrice: 0,
        stockQuantity: 0,
        attributes: [
          { name: "Design", value },
          ...dynamicAttributes.filter((a) => a.name !== "Design"),
        ],
      },
    ]);
  };
  

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...variants];
    updated[index][name] =
      name === "price" || name === "stockQuantity" ? parseFloat(value) : value;
    updated[index][name] = [
      "purchasePrice",
      "sellingPrice",
      "stockQuantity",
    ].includes(name)
      ? parseFloat(value)
      : value;
    setVariants(updated);
    const errorKey = `variant_${name}_${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleAttributeChange = (variantIndex, attrIndex, e) => {
    const { name, value } = e.target;
    const updated = [...variants];
    updated[variantIndex].attributes[attrIndex][name] = value;
    setVariants(updated);
    const attrName = updated[variantIndex].attributes[attrIndex].name;
    const errorKey = `attr_${attrName}_${variantIndex}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // 🔹 Add/remove variant or attribute
  const addVariant = () =>
    setVariants([
      ...variants,
      {
        sku: "",
        price: 0,
        stockQuantity: 0,
        attributes: [{ name: "", value: "" }],
      },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const finalFormData = {
      ...formData,
      // categoryId: categoryIdMap[formData.categoryId] || formData.categoryId,
      categoryId: categoryMap[formData.categoryId?.toLowerCase()] || formData.categoryId,

      name: formData.name === "Other" ? otherType : formData.name,
    };

    setLoading(true);
    try {
      await onCreate({ ...finalFormData, variants });
      onClose();
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={{ "& .MuiDialog-paper": { borderRadius: 3, p: 0, bgcolor: "#fff" } }}
    >
      <DialogTitle
        variant="h6"
        textAlign="center"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          fontWeight: 700,
          fontSize: "1.25rem",
          py: 2.5,
          color: "#111827",
          bgcolor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Create New Product
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 1 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              bgcolor: "#ffffff",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "#374151" }}
            >
              Product Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={{ xs: 1.5, sm: 2 }}>
              <Grid container spacing={{ xs: 3, sm: 3, md: 4 }}>
                {/* PRODUCT DETAILS */}
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Select Category"
                    name="categoryId"
                    value={formData.categoryId || ""}
                    onChange={handleChange}
                    error={!!errors.categoryId}
                    helperText={errors.categoryId}
                    SelectProps={{ native: true }}
                    required
                  >
                    <option key="" value="Select Category">
                      Select Category
                    </option>
                    {!isLoading &&
                      categories.map((category) => (
                        <option
                          key={category.categoryId}
                          value={category.categoryId}
                        >
                          {category.name.charAt(0).toUpperCase() +
                            category.name.slice(1)}
                        </option>
                      ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>

                  <TextField
                    select
                    fullWidth
                    label="Select Design"
                    name="name"
                    value={formData.name}
                    error={!!errors.name}
                    helperText={errors.name}
                    onChange={(e) => {
                      handleDesignChange(e);
                      if (e.target.value !== "Other") setOtherType("");
                    }}
                    SelectProps={{ native: true }}
                  >
                    <option key="Select Type" value="Select Design">
                      Select Design
                    </option>
                    {!designsLoading ?
                    (designs.map((design) => (
    <option key={design.designId} value={design.name}>
      {design.name}
    </option>
  ))
  ):(
  <>...</>)
}


                    {/* {(() => {
                      const categoryName = getCategoryNameById(
                        formData.categoryId
                      );
                      if (!categoryName) return null;

                      if (
                        ["malaysian", "melamine", "zrk"].includes(categoryName)
                      ) {
                        return Object.keys(
                          designOptions[categoryName] || {}
                        ).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ));
                      }

                      if (categoryName === "mattress") {
                        return mattressOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ));
                      }

                      if (categoryName === "lock") {
                        return ["Handle lock"].map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ));
                      }

                      if (categoryName === "door") {
                        return [
                          "Single Door",
                          "Double Door",
                          "Sliding Door",
                          "French Door",
                        ].map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ));
                      }

                      return null;
                    })()} */}
                  </TextField>

                  {formData.name === "Other" && (
                    <Box mt={2}>
                      <TextField
                        fullWidth
                        label="Specify Design Name"
                        value={otherType}
                        onChange={(e) => setOtherType(e.target.value)}
                        error={!!errors.otherType}
                        helperText={errors.otherType}
                        required
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Product Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    // minRows={3}
                    // maxRows={6}
                  />
                </Grid>

                <Grid className="hidden" item xs={12} sm={6}>
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
          </Paper>

          {/* Details SECTION */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              bgcolor: "#ffffff",
              "& .MuiTextField-root": { width: "100%" },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "#374151" }}
            >
              Design Details
            </Typography>

            {variants.map((variant, vIndex) => (
              <Box
                key={vIndex}
                sx={{
                  mt: 2,
                  p: 0,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                }}
              >
                <Grid container spacing={2}>
                  {/* <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="SKU"
                      name="sku"
                      value={variant.sku}
                      error={!!errors[`variant_sku_${vIndex}`]}
                      helperText={errors[`variant_sku_${vIndex}`]}
                      onChange={(e) => handleVariantChange(vIndex, e)}
                    />
                  </Grid> */}
                  <Grid item xs={12} sm={6} md={3}>
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
                  <Grid item xs={12} sm={6} md={3}>
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
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Stock Quantity"
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
                {formData.categoryId && (
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, my: 2, color: "#374151" }}
                  >
                    {`Attributes `}
                  </Typography>
                )}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                {variant.attributes.map((attr, aIndex) => (
  <Grid key={aIndex} item xs={12} sm={6} md={3}>
    <TextField
      fullWidth
      label={attr.name}
      name="value"
      value={attr.value}
      error={!!errors[`attr_${attr.name}_${vIndex}_${aIndex}`]}
      helperText={errors[`attr_${attr.name}_${vIndex}_${aIndex}`]}
      onChange={(e) => handleAttributeChange(vIndex, aIndex, e)}
      disabled={attr.name.toLowerCase() === "design"}
    />
  </Grid>
))}

                </Grid>


                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          bgcolor: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            color: "#374151",
            borderColor: "#d1d5db",
            "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={18} />}
        >
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProductModal;
