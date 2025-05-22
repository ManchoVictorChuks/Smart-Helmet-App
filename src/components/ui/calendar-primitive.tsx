import * as React from "react"
import { DayPicker } from "react-day-picker"

interface CalendarPrimitiveProps {
    mode?: "single" | "range" | "multiple";
    selected?: Date;
    onSelect?: (date: Date) => void;
    initialFocus?: boolean;
    className?: string;
}

export function Calendar({
    mode = "single",
    selected,
    onSelect,
    initialFocus,
    className,
}: CalendarPrimitiveProps) {
    return (
        <DayPicker
            mode={mode}
            selected={selected}
            onSelect={onSelect as any}
            initialFocus={initialFocus}
            className={className}
        />
    )
}
