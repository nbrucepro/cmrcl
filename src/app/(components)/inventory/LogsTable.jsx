'use client';

import dynamic from 'next/dynamic';
import { useCategoryMap } from '@/lib/DoorConfig';
import Loader from '../common/Loader';
import { useMemo, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import SaleBill from '../../../components/SaleBill';
import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const DataGrid = dynamic(
	() => import('@mui/x-data-grid').then((mod) => mod.DataGrid),
	{
		ssr: false,
		loading: () => (
			<>
				<Loader />
			</>
		),
	},
);

export default function LogsTable({
	rows,
	type,
	loading,
	onEditTransaction,
	onDeleteTransaction,
}) {
	const { reverseCategoryMap } = useCategoryMap();
	const printLogsRef = useRef();

	const handlePrintLogs = () => {
		setTimeout(() => {
			handlePrintLogsFn();
		}, 100);
	};

	const handlePrintLogsFn = useReactToPrint({
		contentRef: printLogsRef,
		documentTitle: `${type}_logs_filtered`,
	});

	const totalProfit = useMemo(() => {
		if (type !== 'sales' || !rows) return 0;
		return rows.reduce((sum, row) => sum + (row.profit || 0), 0);
	}, [rows, type]);

	const totalSale = useMemo(() => {
		if (type !== 'sales' || !rows) return 0;
		return rows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
	}, [rows, type]);

	const printRef = useRef();
	const [selectedSale, setSelectedSale] = useState(null);

	const handlePrint = useReactToPrint({
		contentRef: printRef,
		documentTitle: 'Sales Bill',
		removeAfterPrint: true,
	});
	const columns = [
		{
			field: 'categoryId',
			headerName: 'Category',
			flex: 1,
			minWidth: 120,
			valueGetter: (_, row) => {
				const categoryName = reverseCategoryMap[row?.categoryId] || '';
				const fnm =
					categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
				return fnm;
			},
		},
		{
			field: 'productName',
			headerName: 'Product Name',
			flex: 1,
			minWidth: 150,
			valueGetter: (_, row) => {
				const size =
					row?.pAttributes?.find((a) => a.name === 'Size')?.value || '';
				return `${row?.productName || ''}${size ? ` ${size}"` : ''}`;
			},
		},
		{ field: 'quantity', headerName: 'Quantity', flex: 0.6, minWidth: 100 },
		...(type === 'sales'
			? [
					{
						field: 'price',
						headerName: 'Purchase Price',
						flex: 1,
						minWidth: 130,
						valueGetter: (_, row) => {
							const profit = row?.cost || 0;
							return (
								'Rs ' +
								profit.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})
							);
						},
					},
			  ]
			: []),
		{
			field: 'totalAmount',
			headerName: 'Total Amount',
			flex: 1,
			minWidth: 130,
			valueGetter: (_, row) => {
				const amount = type === 'sales' ? row?.totalAmount : row?.totalCost;
				return amount != null
					? 'Rs ' +
							amount.toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})
					: '—';
			},
		},

		{
			field: 'date',
			headerName: 'Date',
			flex: 1,
			minWidth: 180,
			valueGetter: (_, row) => {
				const date = new Date(row?.date);
				if (isNaN(date.getTime())) return 'Invalid Date';
				return date.toLocaleString(undefined, {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				});
			},
		},
		{
			field: 'guaranty',
			headerName: 'Guaranty Info',
			flex: 1,
			minWidth: 180,
			valueGetter: (_, row) => {
				const guarantyUnit = row?.guarantyUnit;
				const guarantyValue = Number(row?.guarantyValue);
				if (guarantyValue <= 0) return '-';
				return guarantyValue + ' ' + guarantyUnit;
			},
		},
		...(type === 'sales'
			? [
					{
						field: 'profit',
						headerName: 'Profit',
						flex: 1,
						minWidth: 130,
						valueGetter: (_, row) => {
							const profit = row?.profit || 0;
							return (
								'Rs ' +
								profit.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})
							);
						},
					},
			  ]
			: []),
		{
			field: 'actions',
			headerName: 'Actions',
			width: 100,
			sortable: false,
			renderCell: (params) => (
				<Stack
					direction="row"
					spacing={0.3}
					alignItems="center"
					justifyContent="center"
					sx={{ width: '100%', height: '100%' }}
				>
					<Tooltip title="Edit">
						<IconButton
							size="small"
							onClick={() => onEditTransaction?.(params.row, type)}
						>
							<Edit
								fontSize="16"
								className="text-indigo-600"
							/>
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete">
						<IconButton
							size="small"
							onClick={() => {
								onDeleteTransaction(params.row, type);
							}}
						>
							<Delete
								fontSize={'16'}
								className="text-red-600"
							/>
						</IconButton>
					</Tooltip>
					{type === 'sales' && (
						<Tooltip title="print">
							<IconButton
								size="small"
								variant="outline"
								onClick={() => {
									setSelectedSale(params.row);
									setTimeout(handlePrint, 100);
								}}
							>
								<Printer
									size={16}
									className=" text-blue-600 border-blue-300 hover:bg-blue-50"
								/>
							</IconButton>
						</Tooltip>
					)}
				</Stack>
			),
		},
	];

	return (
		<>
			<div className="w-full overflow-x-auto bg-white shadow-sm rounded-2xl border border-gray-100 p-3 sm:p-5 mt-4">
				<div className="flex justify-end mb-3">
					<Tooltip title="Print Filtered Logs">
						<Button
							variant="outlined"
							startIcon={<Printer />}
							onClick={handlePrintLogs}
							sx={{
								textTransform: 'none',
								borderRadius: 2,
								fontWeight: 500,
							}}
						>
							Print Logs
						</Button>
					</Tooltip>
				</div>

				<DataGrid
					rows={rows}
					columns={columns}
					getRowId={(row) => row.purchaseId || row.saleId}
					loading={loading}
					className="bg-white shadow rounded-lg border border-gray-200 mt-2 !text-gray-700"
					autoHeight
					disableRowSelectionOnClick
					sx={{
						fontSize: { xs: '0.8rem', sm: '0.9rem' },
						'& .MuiDataGrid-columnHeaders': {
							backgroundColor: '#f9fafb',
							fontWeight: 600,
							color: '#374151',
							borderBottom: '1px solid #e5e7eb',
						},
						'& .MuiDataGrid-cell': {
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							color: '#374151',
						},
						'& .MuiDataGrid-row:hover': {
							backgroundColor: '#f3f4f6',
						},
						'& .MuiDataGrid-footerContainer': {
							borderTop: '1px solid #e5e7eb',
						},
					}}
				/>
				<div style={{ display: 'none' }}>
					<div ref={printRef}>
						<SaleBill sale={selectedSale} />
					</div>
				</div>
				{type === 'sales' && (
					<div className="flex gap-3 justify-end items-center p-3 font-semibold text-gray-700 border-t border-gray-200 mt-2">
						<div>
							Total Sale:{' '}
							<span className="ml-2">
								Rs{' '}
								{totalSale.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
						</div>
						{'|'}
						<div>
							Total Profit:{' '}
							<span className="ml-2">
								Rs{' '}
								{totalProfit.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
						</div>
					</div>
				)}
			</div>
			<div style={{ display: 'none' }}>
				<div
					ref={printLogsRef}
					style={{
						fontFamily: "'Inter', sans-serif",
						padding: '30px',
						color: '#111',
						width: '100%',
					}}
				>
					{/* HEADER */}
					<div style={{ textAlign: 'center', marginBottom: '25px' }}>
						<h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '1px' }}>
							{type.toUpperCase()} LOG REPORT
						</h1>
						<p style={{ marginTop: '5px', color: '#555' }}>
							Printed on: {new Date().toLocaleString()}
						</p>
					</div>

					{/* TABLE */}
					<table
						style={{
							width: '100%',
							borderCollapse: 'collapse',
							marginTop: '20px',
							fontSize: '14px',
						}}
					>
						<thead>
							<tr>
								{columns
									.filter((c) => c.field !== 'actions')
									.map((col) => (
										<th
											key={col.field}
											style={{
												backgroundColor: '#f2f2f2',
												padding: '12px 8px',
												borderBottom: '2px solid #ddd',
												textAlign: 'left',
												fontWeight: 600,
											}}
										>
											{col.headerName}
										</th>
									))}
							</tr>
						</thead>

						<tbody>
							{rows?.map((row, i) => (
								<tr
									key={i}
									style={{
										backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff',
									}}
								>
									{columns
										.filter((c) => c.field !== 'actions')
										.map((col) => (
											<td
												key={col.field}
												style={{
													padding: '10px 8px',
													borderBottom: '1px solid #eee',
												}}
											>
												{col.valueGetter
													? col.valueGetter(null, row)
													: row[col.field] ?? ''}
											</td>
										))}
								</tr>
							))}
						</tbody>
					</table>

					{/* FOOTER */}
					<div
						style={{
							marginTop: '40px',
							textAlign: 'center',
							fontSize: '13px',
							color: '#555',
						}}
					>
						<p>Powered by DreamDoor © {new Date().getFullYear()}</p>
					</div>
				</div>
			</div>
		</>
	);
}
