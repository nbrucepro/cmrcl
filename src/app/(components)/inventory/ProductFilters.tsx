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

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        mb: 3,
      }}
    >
   <Stack
  direction={{ xs: "column", md: "row" }}
  justifyContent="space-between"
  alignItems={{ xs: "stretch", md: "center" }}
  flexWrap="wrap"
  spacing={2}
  gap={2}
>
  {/* Left side */}
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    alignItems={{ xs: "stretch", sm: "center" }}
    width={{ xs: "100%", md: "48%" }}
  >
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
      <MenuItem value="b52d030f-1309-4099-bc85-b3d040fb9806">Lock</MenuItem>
      <MenuItem value="c25b2efb-ec58-4036-a38e-65e9c2c5bcfc">Door</MenuItem>
      <MenuItem value="4f6e9c17-2a92-4694-a689-ab2fdeb887c6">Mattress</MenuItem>
    </TextField>
  </Stack>

  {/* Right side */}
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={1.5}
    alignItems={{ xs: "stretch", sm: "center" }}
    justifyContent={{ md: "flex-end" }}
    width={{ xs: "100%", md: "48%" }}
  >
    <FormControl size="small" fullWidth>
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

    <Tooltip title="Download list">
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Download />}
        fullWidth
        onClick={() => onDownload(downloadType)}
      >
        Download
      </Button>
    </Tooltip>

    <Tooltip title="Reset filters">
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<RestartAlt />}
        fullWidth
        onClick={onReset}
      >
        Reset Filters
      </Button>
    </Tooltip>
  </Stack>
</Stack>


    </Paper>
  );
};

export default ProductFilters;
