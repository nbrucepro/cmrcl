"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Stack,
  Collapse,
  Divider,
  Chip,
} from "@mui/material";
import {
  Edit,
  Delete,
  Download,
  AddCircle,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useCreateProductMutation, useGetProductsQuery,useUpdateProductMutation,useDeleteProductMutation } from "@/state/api";
import CreateProductModal from "./CreateProductModal";
import Header from "@/app/(components)/Header";
import Image from "next/image";
import Loader from "../../../(components)/common/Loader";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: products, isLoading, isError, refetch } =
    useGetProductsQuery(searchTerm);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = products;
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.categoryId === categoryFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [products, searchTerm, categoryFilter]);

  const handleCreateProduct = async (productData) => {
    await createProduct(productData);
    refetch();
  };

  const handleDownload = (product) => {
    const blob = new Blob([JSON.stringify(product, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${product.name || "product"}.json`;
    link.click();
  };

  const handleUpdate = async (productId) => {
      const name = prompt("Enter new name:");
      if (!name) return;
      await updateProduct({ id: productId, name }).unwrap();
      refetch();
  };
    
  const handleDelete = async (productId) => {
      if (!confirm("Are you sure you want to delete this product?")) return;
      await deleteProduct(productId).unwrap();
      refetch();
    };

  const columns = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography color="text.secondary" noWrap>
          {params.row.description || "—"}
        </Typography>
      ),
    },
    {
      field: "purchasePrice",
      headerName: "Purchase Price",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography color="text.secondary" noWrap>
          {params?.row?.variants[0]?.purchasePrice || "—"}
        </Typography>
      ),
    },
    {
      field: "sellingPrice",
      headerName: "Selling Price",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography color="text.secondary" noWrap>
          {params?.row?.variants[0]?.sellingPrice || "—"}
        </Typography>
      ),
    },
    {
      field: "stockQuantity",
      headerName: "Stock",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography color="text.secondary" noWrap>
          {params?.row?.variants[0]?.stockQuantity || "—"}
        </Typography>
      ),
    },
    {
      field: "variants",
      headerName: "Variants",
      width: 120,
      renderCell: (params) => params?.variants?.length || 0,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 140,
      renderCell: (params) =>
        new Date(params.row.createdAt).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleUpdate(params.row.productId)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(params.row.productId)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download JSON">
            <IconButton size="small" onClick={() => handleDownload(params.row)}>
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <Typography color="error" align="center" sx={{ mt: 4 }}>
        Network error reload!
      </Typography>
    );

  return (
    <Box sx={{ mx: "auto", width: "100%", pb: 6 }}>
      {/* HEADER */}
      <Box className="flex justify-between items-center mb-6">
        <Header name="Products Overview" />
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          onClick={() => setIsModalOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add Product
        </Button>
      </Box>

      {/* SEARCH & FILTER */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          mb: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          label="Search products"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />

        <TextField
          select
          label="Category"
          size="small"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="b52d030f-1309-4099-bc85-b3d040fb9806">Lock</MenuItem>
          <MenuItem value="c25b2efb-ec58-4036-a38e-65e9c2c5bcfc">Door</MenuItem>
        </TextField>
      </Paper>

      {/* MAIN TABLE */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <DataGrid
          autoHeight
          rows={filteredProducts || []}
          getRowId={(row) => row.productId}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#f9fafb",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": { borderBottom: "1px solid #eee" },
          }}
        />
      </Paper>

      {/* CREATE MODAL */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </Box>
  );
};

export default Products;
