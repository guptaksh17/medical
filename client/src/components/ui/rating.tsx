import React from "react";
import { cn } from "@/lib/utils";
import { RatingProps } from "@/types";

export function Rating({ 
  value, 
  size = "md", 
  showValue = false,
  maxValue = 5
}: RatingProps) {
  // Calculate percentage filled (0-100)
  const percentage = (value / maxValue) * 100;
  
  // Determine size classes
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };
  
  return (
    <div className="flex items-center">
      <div className={cn("rating-stars", sizeClasses[size])}>
        <div>{"★".repeat(maxValue)}</div>
        <div className="filled-stars" style={{ width: `${percentage}%` }}>
          {"★".repeat(maxValue)}
        </div>
      </div>
      
      {showValue && (
        <div className={cn("ml-2 font-medium", sizeClasses[size])}>
          {value.toFixed(1)}
        </div>
      )}
    </div>
  );
}
