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
import {
  categoryAttributes,
  categoryIdMap,
  designOptions,
  mattressOptions,
  useCategoryMap,
} from "@/lib/DoorConfig";

const UpdateProductModal = ({ open, onClose, product, onUpdate }) => {
  const [formData, setFormData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  // const { data: categories = [], isLoading: loadingCategories } = useGetCategoriesQuery();
  const {
    categoryMap,
    categories,
    isLoading: loadingCategories,
    reverseCategoryMap,
  } = useCategoryMap();

  const MALAYSIAN = categoryMap["malaysian"];
  const MELAMINE = categoryMap["melamine"];
  const ZRK = categoryMap["zrk"];
  const MATTRESS = categoryMap["mattress"];
  const LOCK = categoryMap["lock"];
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId || "",
        rating: product.rating || 0,
      });

      // ✅ Normalize variants (same logic as CreateModal)
      setVariants(
        product.variants?.map((v) => ({
          variantId: v.variantId,
          sku: v.sku || "",
          purchasePrice: v.purchasePrice || 0,
          sellingPrice: v.sellingPrice || 0,
          stockQuantity: v.stockQuantity || 0,
          attributes: v.attributes || [],
        })) || [
          {
            sku: "",
            purchasePrice: 0,
            sellingPrice: 0,
            stockQuantity: 0,
            attributes: [],
          },
        ]
      );
    }
  }, [product]);

  if (!formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "categoryId") {
      if (value === LOCK) {
        // Lock → no dimension attributes
        setVariants([
          {
            sku: "",
            purchasePrice: 0,
            sellingPrice: 0,
            stockQuantity: 0,
            attributes: [],
          },
        ]);
      } else {
        // All others → start with default attributes
        setVariants([
          {
            sku: "",
            purchasePrice: 0,
            sellingPrice: 0,
            stockQuantity: 0,
            attributes: [
              { name: "Width", value: 0 },
              { name: "Length", value: 0 },
            ],
          },
        ]);
      }
    }
  };
  const handleDesignChange = (e) => {
    const { value } = e.target;
    handleChange(e); // update formData

    if (!formData.categoryId) return;
    if (
      ["malaysian", "melamine", "zrk"].includes(
        reverseCategoryMap[formData.categoryId]
      )
    ) {
      const categoryKey = reverseCategoryMap[formData.categoryId];
      const sizeOptions = designOptions[categoryKey]?.[value] || [];
      const extraAttrs = categoryAttributes[categoryKey] || [];

      setVariants([
        {
          sku: "",
          purchasePrice: 0,
          sellingPrice: 0,
          stockQuantity: 0,
          attributes: [
            { name: "Design", value },
            { name: "Size", value: "" },
            ...extraAttrs
              .filter((a) => !["Design", "Size"].includes(a.name))
              .map((a) => ({ name: a.name, value: a.defaultValue || "" })),
          ],
          sizeOptions,
        },
      ]);
    }

    // ✅ Mattress
    else if (formData.categoryId === MATTRESS) {
      const extraAttrs = categoryAttributes["mattress"] || [];
      setVariants([
        {
          sku: "",
          purchasePrice: 0,
          sellingPrice: 0,
          stockQuantity: 0,
          attributes: [
            { name: "Type", value },
            { name: "Height", value: mattressHeights[0] || "" },
            ...extraAttrs.map((a) => ({
              name: a.name,
              value: a.defaultValue || "",
            })),
          ],
        },
      ]);
    }

    // ✅ Lock / Other
    else {
      const categoryKey = reverseCategoryMap[formData.categoryId];
      const extraAttrs = categoryAttributes[categoryKey] || [];

      setVariants([
        {
          sku: "",
          purchasePrice: 0,
          sellingPrice: 0,
          stockQuantity: 0,
          attributes: extraAttrs.map((a) => ({
            name: a.name,
            value: a.defaultValue || "",
          })),
        },
      ]);
    }
  };

  if (name === "categoryId" || name === "name") {
    let attributes = [];

    if (name === "categoryId") {
      // reset design when category changes
      setFormData((prev) => ({ ...prev, name: "" }));
    }

    if (formData.categoryId === MATTRESS) {
      attributes = mattressHeights.map((h) => ({
        name: "Height",
        value: h,
      }));
    } else if (
      [
        categoryMap["malaysian"],
        categoryMap["melamine"],
        categoryMap["zrk"],
      ].includes(formData.categoryId)
    ) {
      const designSizes =
        designOptions[formData.categoryId]?.[formData.name] || [];
      attributes = designSizes.map((s) => ({
        name: "Size",
        value: s,
      }));
    }

    setVariants([
      {
        sku: "",
        purchasePrice: 0,
        sellingPrice: 0,
        stockQuantity: 0,
        attributes,
      },
    ]);
  }

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
    const updatedAttribute = {
      ...updated[vIndex].attributes[aIndex],
      [name]: value,
    };
    updated[vIndex].attributes = [...updated[vIndex].attributes]; // clone attributes array
    updated[vIndex].attributes[aIndex] = updatedAttribute; // set updated attribute
    setVariants(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const finalFormData = {
        ...formData,
        // categoryId: categoryIdMap[formData.categoryId] || formData.categoryId,
        categoryId:
          categoryMap[formData.categoryId?.toLowerCase()] ||
          formData.categoryId,
      };
      await onUpdate({
        ...finalFormData,
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
  const designKey = reverseCategoryMap[formData.categoryId];
  const availableDesigns = designKey
    ? Object.keys(designOptions[designKey] || {})
    : [];
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"
    PaperProps={{
      sx: {
        width: "100%",
        maxWidth: "1000px",
        m: 2,
        p:2 
      },
    }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Update Product</DialogTitle>
      <Divider />
      <DialogContent   sx={{
    mt: 2,
    width: "100%",
    p: 1,
    "& .MuiGrid-container": { width: "100%", m: 0 },
    "& .MuiGrid-item": { display: "flex" },
    "& .MuiTextField-root": { flex: 1 },
  }}>
        {/* Basic Info */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
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
              {loadingCategories ? (
                <option disabled>Loading...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                  </option>
                ))
              )}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label={"Select Design"}
              name="name"
              value={formData.name}
              onChange={handleDesignChange}
              SelectProps={{ native: true }}
            >
              <option value="Select Design">Select Design{categoryMap["mattress"]}</option>

              {[MALAYSIAN, MELAMINE, ZRK, MATTRESS, LOCK].includes(
                formData.categoryId
              )
                ? Object.keys(
                    designOptions[reverseCategoryMap[formData.categoryId]] || {}
                  ).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))
                : formData.categoryId === categoryMap["mattress"]
                ? mattressOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                : null}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Variants */}
        <Typography
          variant="h6"
          sx={{ mt: 5, mb: 1, fontWeight: 600, color: "text.primary" }}
        >
          Details
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
              <Grid item xs={12} sm={6} md={4} lg={3}>

                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={variant.sku}
                  onChange={(e) => handleVariantChange(vIndex, e)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>

                <TextField
                  fullWidth
                  label="Purchase Price"
                  type="number"
                  name="purchasePrice"
                  value={variant.purchasePrice}
                  onChange={(e) => handleVariantChange(vIndex, e)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>

                <TextField
                  fullWidth
                  label="Selling Price"
                  type="number"
                  name="sellingPrice"
                  value={variant.sellingPrice}
                  onChange={(e) => handleVariantChange(vIndex, e)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>

                <TextField
                  fullWidth
                  label="Stock Quantity"
                  type="number"
                  name="stockQuantity"
                  value={variant.stockQuantity}
                  onChange={(e) => handleVariantChange(vIndex, e)}
                />
              </Grid>
            </Grid>

            {variant.attributes?.length > 0 && (
              <>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, my: 2, color: "#374151" }}
                >
                  Attributes
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {variant.attributes.map((attr, aIndex) => (
                    <Grid key={aIndex} item xs={12} sm={6} md={3}>
                      {attr.name === "Size" && variants[vIndex].sizeOptions ? (
                        <TextField
                          select
                          fullWidth
                          label="Select Size(inch)"
                          name="value"
                          value={attr.value}
                          onChange={(e) =>
                            handleAttributeChange(vIndex, aIndex, e)
                          }
                          SelectProps={{ native: true }}
                        >
                          <option value="">Select Size</option>
                          {variants[vIndex].sizeOptions.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          fullWidth
                          label={`${attr.name} Value`}
                          name="value"
                          value={attr.value}
                          onChange={(e) =>
                            handleAttributeChange(vIndex, aIndex, e)
                          }
                          disabled
                        />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
            <Divider sx={{ my: 2 }} />
          </Box>
        ))}
      </DialogContent>

      <Divider />
      <DialogActions
        sx={{
          p: 2.5,
          bgcolor: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={onClose}
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
          onClick={handleSubmit}
          variant="contained"
          color="primary"
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
