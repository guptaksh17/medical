import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatsCardProps } from "@/types";

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-neutral-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className={`mt-4 text-xs flex items-center ${trend.positive ? 'text-success' : 'text-warning'}`}>
          {trend.positive ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </Card>
  );
}
