import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-6 w-full border-0 bg-transparent px-0 py-0 font-sans text-base font-normal leading-4 text-black outline-none placeholder:text-black/35",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
