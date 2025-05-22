import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, max = 100, ...props }, ref) => {
  const percentage = value !== undefined ? (value / max) * 100 : 0;
  
  let progressColor = "bg-primary";
  
  if (percentage <= 25) {
    progressColor = "bg-red-500";
  } else if (percentage <= 50) {
    progressColor = "bg-amber-500";
  } else if (percentage <= 75) {
    progressColor = "bg-yellow-500";
  } else {
    progressColor = "bg-green-500";
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all", className)}
        style={{ transform: `translateX(${value ?? 0}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };