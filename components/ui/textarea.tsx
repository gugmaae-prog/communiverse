import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex h-[120px] w-full resize-none border-0 bg-transparent px-0 py-2 font-sans text-base font-normal leading-4 text-black outline-none placeholder:text-black/35",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
