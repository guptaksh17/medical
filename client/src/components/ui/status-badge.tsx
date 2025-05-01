import React from "react";
import { cn } from "@/lib/utils";
import { StatusBadgeProps } from "@/types";

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusClasses = () => {
    switch (status) {
      case "Pending":
        return "bg-orange-50 text-orange-600";
      case "Confirmed":
        return "bg-green-50 text-green-600";
      case "Cancelled":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };
  
  return (
    <span 
      className={cn(
        "px-2 py-1 text-xs rounded-full whitespace-nowrap",
        getStatusClasses(),
        className
      )}
    >
      {status}
    </span>
  );
}
