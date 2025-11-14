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
import { usePathname } from "next/navigation";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onDownload,
  onReset,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  onDownload: (type: string) => void;
  onReset: () => void;
}) => {
  const [downloadType, setDownloadType] = React.useState("excel");

  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const pathname = usePathname();
  const showDateFilters = pathname !== "/inv/products";

  const fromDayjs = fromDate ? dayjs(fromDate) : null;
  const toDayjs = toDate ? dayjs(toDate) : null;

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        mb: 3,
        background: (theme: any) =>
          theme.palette.mode === "dark" ? "#1e1e1e" : "#f9fafb",
      }}
    >
      <Stack
        direction="row"
        flexWrap="wrap"
        rowGap={2}
        columnGap={3}
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Left side */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flex={1}
          sx={{ minWidth: "250px" }}
        >
          <TextField
            label="Search products"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
          <TextField
            select
            label="Category"
            size="small"
            fullWidth
            value={categoryFilter}
            onChange={(e: any) => setCategoryFilter(e.target.value)}
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
          {showDateFilters && (
            <>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={"en-gb"}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <DatePicker
                    label="From Date"
                    value={fromDayjs}
                    onChange={(newValue: Dayjs | null) => {
                      setFromDate(
                        newValue ? newValue.format("YYYY-MM-DD") : ""
                      );
                    }}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: 170,
                          "& .MuiInputBase-root": {
                            height: 34, // smaller overall height
                            fontSize: "0.75rem", // text smaller
                            paddingRight: "4px",
                          },
                          "& .MuiInputBase-input": {
                            padding: "4px 8px", // shrink internal padding
                          },
                          "& .MuiSvgIcon-root": {
                            fontSize: 18, // shrink calendar icon
                          },
                        },
                      },
                    }}
                  />

                  <DatePicker
                    label="To Date"
                    value={toDayjs}
                    onChange={(newValue: Dayjs | null) => {
                      setToDate(newValue ? newValue.format("YYYY-MM-DD") : "");
                    }}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: 170,
                          "& .MuiInputBase-root": {
                            height: 34, // smaller overall height
                            fontSize: "0.75rem", // text smaller
                            paddingRight: "4px",
                          },
                          "& .MuiInputBase-input": {
                            padding: "4px 8px", // shrink internal padding
                          },
                          "& .MuiSvgIcon-root": {
                            fontSize: 18, // shrink calendar icon
                          },
                        },
                      },
                    }}
                  />
                </Stack>
              </LocalizationProvider>
            </>
          )}
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
          sx={{
            width: { xs: "100%", md: "auto" },
            "& button, & .MuiFormControl-root": {
              width: { xs: "100%", sm: "auto" },
            },
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150, display: "none" }}>
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
