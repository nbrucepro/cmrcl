"use client";

import { useGetProductsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import Loader from "@/app/(components)/common/Loader";
import { useEffect, useState } from "react";
import TransactionModal from "@/app/(components)/inventory/TransactionModal";
import LogsTable from "@/app/(components)/inventory/LogsTable";
import toast from "react-hot-toast";
import { Button, TextField } from "@mui/material";
import { saveAs } from "file-saver";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import {
	FilterAlt,
	RestartAlt,
	Download,
	AddCircle,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import ProductFilters from "./ProductFilters";
import DeleteConfirmModal from "./DeleteConfirmModal";
import SaleBill from "@/components/SaleBill";

export default function InventoryBase({
	title,
	endpoint,
	type,
	enableFilter = false,
}) {
	const { data: products, isError, isLoading, refetch } = useGetProductsQuery();
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("create");
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [logs, setLogs] = useState([]);
	const [filteredLogs, setFilteredLogs] = useState([]);
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const printRef = useRef(null);
	const [selectedSale, setSelectedSale] = useState(null);

	const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
	const token = localStorage.getItem("token");

	const handlePrint = useReactToPrint({
		contentRef: printRef,
		content: () => printRef.current,
		documentTitle: "Sales Bill",
		removeAfterPrint: true,
	});

	useEffect(() => {
		if (selectedSale && printRef.current) {
			const timer = setTimeout(() => {
				handlePrint();
			}, 300);

			return () => clearTimeout(timer);
		}
	}, [selectedSale]);

	const fetchLogs = async () => {
		try {
			setLoading(true);
			const res = await fetch(`${API_URL}api/products/${endpoint}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
			const data = await res.json();
			setLogs(data);
			setFilteredLogs(data);
		} catch (err) {
			// toast.error(err.message || `Could not load ${endpoint}`);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
	}, []);
	const handleDeleteTransaction = async (id) => {
		try {
			const res = await fetch(`${API_URL}api/products/${endpoint}/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!res.ok) throw new Error("Failed to delete transaction");
			toast.success("Transaction deleted!");
			fetchLogs();
		} catch (err) {
			toast.error("Error deleting transaction");
		}
	};

	const handleSubmit = async (
		form,
		transactionType,
		hasBalance,
		mode = "create",
		initialData = null,
	) => {
		const body =
			transactionType === "sale"
				? {
						productId: form.productId,
						quantity: form.quantity,
						unitPrice: form.price,
						guarantyUnit:form.guarantyUnit,
						guarantyValue:form.guarantyValue,

				  }
				: {
						productId: form.productId,
						quantity: form.quantity,
						unitCost: form.price,
				  };

		try {
			const url =
				mode === "edit"
					? `${API_URL}api/products/${endpoint}/${
							initialData?.saleId || initialData?.purchaseId
					  }`
					: `${API_URL}api/products/${endpoint}`;

			const method = mode === "edit" ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errData = await response.json();
				if (errData.message === "Not enough stock available") {
					toast.error("Not enough stock available for this product.");
				} else {
					toast.error("Something went wrong. Please try again.");
				}
				setModalOpen(false);
			}

			const result = await response.json();
			if (hasBalance) {
				const balanceBody =
					transactionType === "sale"
						? {
								saleId: result.saleId,
								customerName: form.customerName,
								contactInfo: form.contactInfo,
								amountDue: form.price * form.quantity,
								amountPaid: form.amountPaid,
								dueDate: form.dueDate,
								notes: form.notes,
						  }
						: {
								purchaseId: result.purchaseId,
								supplierName: form.supplierName,
								contactInfo: form.contactInfo,
								amountDue: form.price * form.quantity,
								amountPaid: form.amountPaid,
								dueDate: form.dueDate,
								notes: form.notes,
						  };
				await fetch(
					`${API_URL}api/products/${
						transactionType === "sale" ? "receivables" : "payables"
					}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(balanceBody),
					},
				);
			}
			toast.success("Transaction successful!");
			// Auto-print only for sales
			if (transactionType === "sale" && modalMode == "create") {
				setSelectedSale(result);
			} 
			
			setModalOpen(false);
		} catch (err) {
			setModalOpen(false);
		} finally {
			fetchLogs()
		}
	};

	const handleReset = () => {
		setFilteredLogs(logs);
		setFromDate("");
		setToDate("");
	};

	const handleDownload = () => {
		if (!filteredLogs.length) return toast.error("No data to download");
		const headers = Object.keys(filteredLogs[0]);
		const csvRows = [
			headers.join(","),
			...filteredLogs.map((log) =>
				headers.map((h) => JSON.stringify(log[h] ?? "")).join(","),
			),
		];
		const blob = new Blob([csvRows.join("\n")], {
			type: "text/csv;charset=utf-8;",
		});
		saveAs(blob, `${endpoint}_logs_${Date.now()}.csv`);
		toast.success("Download started");
	};

	useEffect(() => {
		let filtered = [...logs];

		// Date filter
		if (fromDate && toDate) {
			const from = new Date(fromDate);
			const to = new Date(toDate);
			// Include full day
			filtered = filtered.filter((log) => {
				const logDate = new Date(log.createdAt || log.date || log.purchaseDate);
				const logDay = new Date(
					logDate.getFullYear(),
					logDate.getMonth(),
					logDate.getDate(),
				);
				const fromDay = new Date(
					from.getFullYear(),
					from.getMonth(),
					from.getDate(),
				);
				const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());
				return logDay >= fromDay && logDay <= toDay;
			});
		}

		// Product name search
		if (searchTerm.trim()) {
			filtered = filtered.filter((log) =>
				log.productName?.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		// Category filter
		if (categoryFilter !== "all" && categoryFilter) {
			filtered = filtered.filter(
				(log) =>
					log.categoryId === categoryFilter ||
					log.categoryName === categoryFilter,
			);
		}

		setFilteredLogs(filtered);
	}, [logs, fromDate, toDate, searchTerm, categoryFilter]);

	if (isLoading || loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<Loader />
				<p className="mt-3 text-gray-500 text-sm animate-pulse">
					Loading {title.toLowerCase()} data...
				</p>
			</div>
		);
	}

	if (isError) {
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
	}

	return (
		<div className="flex flex-col px-3 sm:px-6 lg:px-2 pb-6 w-full overflow-x-hidden">
			<div className="flex justify-between">
				<Header name={`${title}`} />
				<Tooltip title="New Transaction">
					<Button
						variant="outlined"
						startIcon={<AddCircle />}
						onClick={() => {
							setModalMode("create");
							setModalOpen(true);
						}}
						sx={{
							background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
							color: "white",
							textTransform: "none",
							fontWeight: 600,
							borderRadius: "12px",
							px: 2,
							py: 1,
							minWidth: 120,
							whiteSpace: "nowrap",
							"&:hover": {
								background: "linear-gradient(90deg, #1e40af, #1d4ed8)",
							},
							transition: "all 0.2s ease-in-out",
						}}
					>
						New Transaction
					</Button>
				</Tooltip>
			</div>

			{/* CONTROL BAR */}
			<div className="mt-6">
				<ProductFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					categoryFilter={categoryFilter}
					setCategoryFilter={setCategoryFilter}
					fromDate={fromDate}
					setFromDate={setFromDate}
					toDate={toDate}
					setToDate={setToDate}
					onDownload={() => handleDownload()}
					onReset={handleReset}
				/>
			</div>

			<LogsTable
				rows={enableFilter ? filteredLogs : logs}
				type={endpoint}
				loading={loading}
				onEditTransaction={(row) => {
					setSelectedTransaction(row);
					setModalMode("edit");
					setModalOpen(true);
				}}
				onDeleteTransaction={(row) => {
					setSelectedTransaction(row);
					setDeleteModalOpen(true);
				}}
			/>

			<TransactionModal
				open={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setSelectedTransaction(null);
					setModalMode("create");
				}}
				products={products || []}
				onSubmit={handleSubmit}
				tType={type}
				mode={modalMode}
				initialData={selectedTransaction}
				onDelete={handleDeleteTransaction}
			/>

			<DeleteConfirmModal
				open={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				itemName={selectedTransaction?.productName}
				onDelete={async () => {
					await handleDeleteTransaction(
						selectedTransaction?.saleId || selectedTransaction?.purchaseId,
					);
					setDeleteModalOpen(false);
				}}
			/>
			<div style={{ display: "none" }}>
				<div ref={printRef}>
					<SaleBill sale={selectedSale} />
				</div>
			</div>
		</div>
	);
}
