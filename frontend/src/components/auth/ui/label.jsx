import React from "react";

export function Label({ className = "", children, ...props }) {
  return (
    <label
      className={"block text-sm font-medium text-[#111827] " + className}
      {...props}
    >
      {children}
    </label>
  );
}
