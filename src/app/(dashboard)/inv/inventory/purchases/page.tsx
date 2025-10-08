"use client";

import { useGetProductsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import Loader from "@/app/(components)/common/Loader";
import { useEffect, useState } from "react";
import TransactionModal from "../../../../(components)/inventory/TransactionModal";
import LogsTable from "@/app/(components)/inventory/LogsTable";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const { data: products, isError, isLoading, refetch } = useGetProductsQuery();
  const [loading,setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}api/products/purchases`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch purchases");
      const data = await res.json();
      setLogs(data);
      setLoading(false);
    } catch (err: any) {
      toast.error(err.message || "Could not load purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleSubmit = async (form: any, transactionType: "sale" | "purchase") => {
    const endpoint = transactionType === "sale" ? "sales" : "purchases";
    const body =
      transactionType === "sale"
        ? { productId: form.productId, quantity: Number(form.quantity), unitPrice: Number(form.price) }
        : { productId: form.productId, quantity: Number(form.quantity), unitCost: Number(form.price) };

    try {
      const response = await fetch(`${API_URL}api/products/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Transaction failed");
      }

      toast.success("Transaction successful!");
      refetch();          // update products
      fetchPurchases();   // update purchase logs immediately
      setModalOpen(false); 
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // if (isLoading || loading) return <Loader />;
  if (isError) return <div className="text-center text-red-500">Failed to fetch products</div>;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-4">
        <Header name="Inventory" />
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          + New Transaction
        </button>
      </div>

      <LogsTable rows={logs} type="purchases" loading={loading} />

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products || []}
        onSubmit={handleSubmit}
        tType={"purchase"}
      />
    </div>
  );
}
