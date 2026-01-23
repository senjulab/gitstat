import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-5 animate-spin text-[#999]", className)}
      {...props}
    />
  );
}

export { Spinner };
