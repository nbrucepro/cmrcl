"use client";

import { useGetProductsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import Loader from "@/app/(components)/common/Loader";
import { useState } from "react";
import TransactionModal from "../../../(components)/inventory/TransactionModal";
import ProductTable from "../../../(components)/inventory/ProductTable";
import { Button } from "@mui/material";
import { RestartAlt } from "@mui/icons-material";

export default function InventoryPage() {
  const { data: products, isError, isLoading, refetch } = useGetProductsQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (form: any, transactionType: "sale" | "purchase") => {
    const endpoint = transactionType === "sale" ? "sales" : "purchases";
    const body =
      transactionType === "sale"
        ? { productId: form.productId, quantity: Number(form.quantity), unitPrice: Number(form.price) }
        : { productId: form.productId, quantity: Number(form.quantity), unitCost: Number(form.price) };

    await fetch(`${API_URL}api/products/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    refetch();
  };

  // if (isLoading) return <Loader />;
  if (isError) return (
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
    <div className="flex flex-col">
      <Header name="Inventory" />
    

      <ProductTable products={products || []} isLoading={isLoading} />

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products || []}
        onSubmit={handleSubmit}
        tType={"sale"}
      />
    </div>
  );
}
