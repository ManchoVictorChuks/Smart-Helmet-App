import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
    value: number | null;
    className?: string;
}

export function Progress({ value, className }: ProgressProps) {
    return (
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div
                className={cn("h-full w-full flex-1 bg-primary transition-all", className)}
                style={{ transform: `translateX(${value ?? 0}%)` }}
            />
        </div>
    );
}