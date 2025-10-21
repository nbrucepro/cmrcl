"use client";

import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { useState } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetDesignsByCategoryQuery,
} from "@/state/api";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: categories = [], isLoading, refetch } = useGetCategoriesQuery();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: designs = [] } = useGetDesignsByCategoryQuery(selectedCategoryId ?? "", {
    skip: !selectedCategoryId,
  });
  
  console.log("designs",designs);
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [deleting, setDeleting] = useState(false);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      setSnackbar({
        open: true,
        message: "Category name is required",
        severity: "error",
      });
      return;
    }

    try {
      if (editId) {
        await updateCategory({ id: editId, name }).unwrap();
        setSnackbar({
          open: true,
          message: "Category updated successfully!",
          severity: "success",
        });
      } else {
        await createCategory({ name }).unwrap();
        setSnackbar({
          open: true,
          message: "Category created successfully!",
          severity: "success",
        });
      }
      setOpen(false);
      setName("");
      setEditId(null);
      refetch();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.data?.message || "Error saving category",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteDialog.id).unwrap();
      setSnackbar({
        open: true,
        message: "Category deleted successfully!",
        severity: "success",
      });
      setDeleteDialog({ open: false, id: null });
      refetch();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.data?.message || "Error deleting category",
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box p={6}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Categories
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <TextField
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Category
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box display="flex" justifyContent="center">
          <Table
            sx={{
              width: "50%",
              borderRadius: 2,
              boxShadow:2
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell hidden={true} sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cat, index) => (
                  <TableRow key={cat.categoryId} hover onClick={() => setSelectedCategoryId(cat.categoryId)} >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell hidden={true}>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditId(cat.categoryId);
                          setName(cat.name);
                          setOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          setDeleteDialog({ open: true, id: cat.categoryId })
                        }
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="dense"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={creating || updating}
            startIcon={
              (creating || updating) && (
                <CircularProgress size={18} color="inherit" />
              )
            }
          >
            {editId
              ? updating
                ? "Updating..."
                : "Update"
              : creating
              ? "Creating..."
              : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={
              deleting && <CircularProgress size={18} color="inherit" />
            }
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
