import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
    value: number;
    max: number;
    className?: string;
}

export function Progress({ value, max, className }: ProgressProps) {
    const percentage = (value / max) * 100;

    return (
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div
                className={cn("h-full w-full flex-1 bg-primary transition-all", className)}
                style={{ transform: `translateX(${percentage}%)` }}
            />
        </div>
    );
}