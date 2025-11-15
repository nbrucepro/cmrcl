"use client";

import React, { forwardRef } from "react";

const SaleBill = forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  const date = new Date(sale.date).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });  

  return (
    <div
      ref={ref}
      className="p-6 w-[350px] bg-white shadow-lg rounded-xl font-sans text-gray-800 border border-gray-200"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold tracking-wide text-blue-700">
          Dream Door
        </h1>
        <p className="text-xs text-gray-500">Your trusted store</p>
        <p className="text-xs text-gray-500 mb-1">---------------</p>
        <h2 className="text-lg font-semibold border-t border-b py-2 mt-2">
          Sales Receipt
        </h2>
      </div>

      {/* Sale Info */}
      <div className="text-sm mb-3 space-y-1">
        <div className="flex justify-between">
          <span className="font-medium">Receipt No:</span>
          <span>{sale.saleId.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Date:</span>
          <span>{date}</span>
        </div>
      </div>

      {/* Product Details */}
      <table className="w-full text-sm border-t border-b border-gray-300 my-3">
        <thead>
          <tr className="text-gray-700">
            <th className="text-left py-1">Product</th>
            <th className="text-center py-1">Quantity</th>
            <th className="text-right py-1">Price</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="py-1 font-medium">{sale.productName}</td>
            <td className="text-center py-1">{sale.quantity}</td>
            <td className="text-right py-1">Rs {sale?.totalAmount/sale?.quantity}</td>
            <td className="text-right py-1">
              Rs {(sale?.totalAmount).toFixed(2)}
            </td>
          </tr>
          {sale.guarantyValue && sale.guarantyUnit && (
          <tr>
            <td colSpan={4} className="text-xs text-gray-600 italic py-1">
              Warranty: {sale.guarantyValue} {sale.guarantyUnit}
            </td>
          </tr>
        )}
        </tbody>
      </table>

      {/* Attributes (optional) */}
      {sale.pAttributes?.some((a) => a.value) && (
        <div className="text-xs mb-3 bg-gray-50 p-2 rounded">
          <h3 className="font-semibold mb-1">Product Details:</h3>
          <ul className="space-y-0.5">
            {sale.pAttributes.map(
              (attr) =>
                attr.value && (
                  <li key={attr.id} className="flex justify-between">
                    <span className="text-gray-600">{attr.name}:</span>
                    <span className="font-medium text-gray-800">
                      {attr.value}
                    </span>
                  </li>
                )
            )}
          </ul>
        </div>
      )}

      {/* Totals */}
      <div className="text-sm space-y-1 mt-3">
        <div className="flex justify-between border-t border-gray-300 pt-2 font-semibold text-lg">
          <span>Total Amount:</span>
          <span>Rs {sale.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 text-center text-xs text-gray-500 border-t pt-3">
        <p>Thank you for shopping with us!</p>
        <p className="text-[10px] mt-1 text-gray-400">
          Powered by DreamDoor © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
});

SaleBill.displayName = "SaleBill";
export default SaleBill;
