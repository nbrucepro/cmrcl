"use client";

import { useGetProductsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import Loader from "@/app/(components)/common/Loader";
import { useState } from "react";
import TransactionModal from "../../../(components)/inventory/TransactionModal";
import ProductTable from "../../../(components)/inventory/ProductTable";

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
  if (isError) return <div className="text-center text-red-500">Failed to fetch products</div>;

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
