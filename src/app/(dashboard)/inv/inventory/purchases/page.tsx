import InventoryBase from "@/app/(components)/inventory/InventoryBase";

export default function PurchaseLogsPage() {
  return (
    <InventoryBase
      title="Purchase Logs"
      endpoint="purchases"
      type="purchase"
      enableFilter={true}
    />
  );
}
