import { Calendar as CalendarPrimitive } from '@/components/ui/calendar-primitive'

interface CalendarProps {
    mode?: string;
    selected?: Date;
    onSelect?: (date: Date) => void;
    initialFocus?: boolean;
    className?: string;
}

export function Calendar({
    mode,
    selected,
    onSelect,
    initialFocus,
    className
}: CalendarProps) {
    return (
        <CalendarPrimitive
            mode={mode}
            selected={selected}
            onSelect={onSelect}
            initialFocus={initialFocus}
            className={className}
        />
    )
}
