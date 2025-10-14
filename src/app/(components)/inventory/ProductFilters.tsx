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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flex={1}
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
            <MenuItem value="2c81c619-b2b8-46ff-b4fb-aa729c54a491">Melamine</MenuItem>
            <MenuItem value="aa7970bf-1fab-4f4a-9679-29e612391ddf">Zrk</MenuItem>
            <MenuItem value="df248c6e-71b6-48bc-b3b5-c50f10ab39ca">Malaysian</MenuItem>
            <MenuItem value="c25b2efb-ec58-4036-a38e-65e9c2c5bcfc">Door</MenuItem>
            <MenuItem value="4f6e9c17-2a92-4694-a689-ab2fdeb887c6">Mattress</MenuItem>
            <MenuItem value="b52d030f-1309-4099-bc85-b3d040fb9806">Lock</MenuItem>
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
