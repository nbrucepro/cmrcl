import InventoryBase from "@/app/(components)/inventory/InventoryBase";

export default function SalesLogsPage() {
  return (
    <InventoryBase
      title="Sales Logs"
      endpoint="sales"
      type="sale"
      enableFilter={true}
    />
  );
}
