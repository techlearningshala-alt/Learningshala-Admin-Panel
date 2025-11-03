"use client";

import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export const Select = SelectPrimitive.Root;

export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`flex justify-between items-center border rounded px-3 py-2 w-full ${className || ""}`}
    {...props}
  >
    {children}
    <ChevronDown className="w-4 h-4" />
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={`bg-white border rounded shadow-md mt-1 ${className || ""}`}
    {...props}
  >
    {children}
  </SelectPrimitive.Content>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100 data-[disabled]:opacity-50 ${className || ""}`}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator>
      <Check className="w-4 h-4" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";
