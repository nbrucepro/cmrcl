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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  Delete,
  Download,
  AddCircle,
  ExpandMore,
  ExpandLess,
  RestartAlt,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import {
  useCreateProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/state/api";
import CreateProductModal from "./CreateProductModal";
import UpdateProductModal from "./UpdateProductModal";
import Header from "@/app/(components)/Header";
import Image from "next/image";
import Loader from "../../../(components)/common/Loader";
import toast from "react-hot-toast";
import ProductFilters from "@/app/(components)/inventory/ProductFilters";

// Map category IDs to their readable names
const categoryMap = {
  "b52d030f-1309-4099-bc85-b3d040fb9806": "Lock",
  "c25b2efb-ec58-4036-a38e-65e9c2c5bcfc": "Door",
  "4f6e9c17-2a92-4694-a689-ab2fdeb887c6": "Mattress",
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useGetProductsQuery(searchTerm);
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
      filtered = filtered.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const skuMatch = p.variants?.some((v) =>
          v.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return nameMatch || skuMatch;
      });
    }    
    return filtered;
  }, [products, searchTerm, categoryFilter]);

  const handleCreateProduct = async (productData) => {
    try {
      await createProduct(productData).unwrap();
      toast.success(" Product created successfully!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || " Failed to create product");
    }
  };

  const [editProduct, setEditProduct] = useState(null);

  const handleUpdate = (product) => {
    setEditProduct(product);
  };

  const handleUpdateSave = async (updatedData) => {
    try {
      await updateProduct({
        id: updatedData.productId,
        data: updatedData,
      }).unwrap();
      toast.success("Product updated successfully!");
      setEditProduct(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteId).unwrap();
      toast.success("🗑️ Product deleted successfully!");
      setDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || " Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDownload = (format) => {
    if (!filteredProducts?.length) {
      toast.error("No products available to download!");
      return;
    }

    // Define headers and map rows
    const headers = [
      "SKU",
      "Category",
      "Name",
      "Description",
      "Purchase Price",
      "Selling Price",
      "Stock",
      "Created At",
    ];
    const rows = filteredProducts.map((p) => [
      p.variants?.[0]?.sku || "—",
      categoryMap[p.categoryId] || "—",
      p.name || "—",
      p.description || "—",
      p.variants?.[0]?.purchasePrice || "—",
      p.variants?.[0]?.sellingPrice || "—",
      p.variants?.[0]?.stockQuantity || "—",
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    let blob;
    let filename = `products_${new Date().toISOString().slice(0, 10)}`;

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\n");
      blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      filename += ".csv";
    } else if (format === "excel") {
      const tsvContent = [
        headers.join("\t"),
        ...rows.map((r) => r.join("\t")),
      ].join("\n");
      blob = new Blob([tsvContent], { type: "application/vnd.ms-excel" });
      filename += ".xls";
    } else if (format === "pdf") {
      const pdfContent = `
  Products Report\n\n${headers.join(" | ")}\n${rows
        .map((r) => r.join(" | "))
        .join("\n")}
      `;
      blob = new Blob([pdfContent], { type: "application/pdf" });
      filename += ".pdf";
    } else {
      toast.error("Unsupported format selected!");
      return;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  console.log(products);

  const columns = [
    {
      field: "sku",
      headerName: "Sku Id",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params?.row?.variants[0]?.sku || "—",
    },
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Typography color="text.primary" noWrap>
          {categoryMap[params?.row?.categoryId]}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography color="text.primary text.center" noWrap>
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
        <Typography color="text.primary" noWrap>
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
        <Typography color="text.primary" noWrap>
          {params?.row?.variants[0]?.sellingPrice || "—"}
        </Typography>
      ),
    },
    {
      field: "stockQuantity",
      headerName: "Stock",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Typography color="text.primary" noWrap>
          {params?.row?.variants[0]?.stockQuantity || "—"}
        </Typography>
      ),
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
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleUpdate(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <span>
              <IconButton
                color="error"
                size="small"
                onClick={() => setDeleteId(params.row.productId)}
                disabled={isDeleting && deleteId === params.row.productId}
              >
                {isDeleting && deleteId === params.row.productId ? (
                  <CircularProgress size={18} color="error" />
                ) : (
                  <Delete fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* <img
        src="/images/error-state.svg"
        alt="Error illustration"
        className="w-48 mb-4 opacity-80"
      /> */}
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Oops! Couldn’t load data
        </h2>
        <p className="text-gray-500 mb-4 max-w-md">
          Something went wrong while fetching logs data. Please check your
          internet connection or try again.
        </p>
        <Button
          variant="contained"
          color="primary"
          onClick={() => refetch()}
          startIcon={<RestartAlt />}
        >
          Retry
        </Button>
      </div>
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
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onDownload={(format) => handleDownload(format)}
        onReset={() => {
          setSearchTerm("");
          setCategoryFilter("all");
          refetch();
        }}
      />

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
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-cellContent": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          }}
        />
      </Paper>

      {/* CREATE MODAL */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
      <UpdateProductModal
        open={Boolean(editProduct)}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onUpdate={handleUpdateSave}
      />
      <Dialog
        open={Boolean(deleteId)}
        onClose={() => !isDeleting && setDeleteId(null)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={18} /> : <Delete />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
