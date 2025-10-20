"use client";
import React from "react";
import {
  Paper,
  TextField,
  MenuItem,
  Button,
  Stack,
  Tooltip,
  Divider,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Download, RestartAlt } from "@mui/icons-material";
import { useGetCategoriesQuery } from "@/state/api";

const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  onDownload,
  onReset,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  onDownload: (type: string) => void;
  onReset: () => void;
}) => {
  const [downloadType, setDownloadType] = React.useState("excel");

  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 4,
        mb: 3,
        background: (theme) =>
          theme.palette.mode === "dark" ? "#1e1e1e" : "#f9fafb",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
      >
        {/* Left side */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flex={1}>
          <TextField
            label="Search products"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TextField
            select
            label="Category"
            size="small"
            fullWidth
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {isLoading && <MenuItem disabled>Loading...</MenuItem>}

            {!isLoading &&
              categories.map((category) => (
                <MenuItem key={category.categoryId} value={category.categoryId}>
                  {category.name.charAt(0).toUpperCase() +
                    category.name.slice(1)}
                </MenuItem>
              ))}
          </TextField>
        </Stack>

        {/* Divider for medium screens and above */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: "none", md: "block" },
            mx: 2,
            borderColor: "divider",
          }}
        />

        {/* Right side */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent={{ xs: "stretch", md: "flex-end" }}
          alignItems="center"
          flexShrink={0}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Download as</InputLabel>
            <Select
              value={downloadType}
              label="Download as"
              onChange={(e) => setDownloadType(e.target.value)}
            >
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={() => onDownload(downloadType)}
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Download
          </Button>

          <Tooltip title="Reset Filters">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RestartAlt />}
              onClick={onReset}
              sx={{
                px: 3,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Reset
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ProductFilters;
