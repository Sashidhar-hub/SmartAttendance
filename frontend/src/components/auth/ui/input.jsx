import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={
        "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none " +
        "focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] " +
        className
      }
      {...props}
    />
  );
}
