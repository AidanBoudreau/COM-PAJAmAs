"use client";

import CalendarDayCell from "./CalendarDayCell";
import type { ClientRecord } from "@/lib/dynamodb";
import "./CalendarGrid.css";

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  clientsByDate: Record<string, ClientRecord[]>;
  selectedDay: number | null;
  onDayClick: (day: number) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
  year,
  month,
  clientsByDate,
  selectedDay,
  onDayClick,
}: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  function dateKey(day: number): string {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }

  return (
    <div className="cal-grid-wrapper">
      <div className="cal-grid">
        {DAY_NAMES.map((name) => (
          <div key={name} className="cal-header">
            {name}
          </div>
        ))}
        {cells.map((day, idx) => (
          <CalendarDayCell
            key={idx}
            day={day}
            isToday={isCurrentMonth && day === today.getDate()}
            clients={day ? clientsByDate[dateKey(day)] ?? [] : []}
            isSelected={day === selectedDay}
            onClick={() => day && onDayClick(day)}
          />
        ))}
      </div>
    </div>
  );
}
