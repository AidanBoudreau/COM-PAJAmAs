"use client";

import type { ClientRecord } from "@/lib/dynamodb";

interface CalendarDayCellProps {
  day: number | null;
  isToday: boolean;
  clients: ClientRecord[];
  isSelected: boolean;
  onClick: () => void;
}

export default function CalendarDayCell({
  day,
  isToday,
  clients,
  isSelected,
  onClick,
}: CalendarDayCellProps) {
  if (day === null) {
    return <div className="cal-day empty" />;
  }

  const hasClients = clients.length > 0;

  let className = "cal-day";
  if (isToday) className += " today";
  if (isSelected) className += " selected";
  if (hasClients) className += " has-clients";

  return (
    <button className={className} onClick={onClick}>
      <span className="cal-day-number">{day}</span>
      {hasClients && <span className="cal-day-dot">{clients.length}</span>}
    </button>
  );
}
