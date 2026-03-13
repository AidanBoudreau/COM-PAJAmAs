"use client";

import { useMemo, useState } from "react";
import { clients } from "@/components/data/clients";
import { MoveRight, MoveLeft, ChevronRight, ChevronLeft } from 'lucide-react';

import "./calendar.css";

type AssistEntry = {
  name: string;
  amount: number;
  date: string;
};

function normalizeDate(dateString: string) {
  const parsed = new Date(dateString);

  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateKey(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const assists: AssistEntry[] = useMemo(() => {
    return clients
      .map((client) => {
        const normalizedDate = normalizeDate(client.lastAssisted);

        if (!normalizedDate) return null;

        return {
          name: client.name,
          amount: client.totalReceived,
          date: normalizedDate,
        };
      })
      .filter((entry): entry is AssistEntry => entry !== null);
  }, []);

  const assistMap = useMemo(() => {
    const map = new Map<string, AssistEntry[]>();

    for (const entry of assists) {
      if (!map.has(entry.date)) {
        map.set(entry.date, []);
      }
      map.get(entry.date)!.push(entry);
    }

    return map;
  }, [assists]);

  const calendarCells: (number | null)[] = [];

  for (let i = 0; i < startingWeekday; i++) {
    calendarCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const selectedEntries = selectedDate ? assistMap.get(selectedDate) || [] : [];
  const selectedTotal = selectedEntries.reduce((sum, entry) => sum + entry.amount, 0);

  function goToPreviousMonth() {
    setSelectedDate(null);
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setSelectedDate(null);
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  return (
    <div className="schedule-page">
      <div className="schedule-card">
        <div className="schedule-header">
          <div>
            <h1 className="schedule-title">Schedule</h1>
            <p className="schedule-subtitle">
              View assisted clients by day and see total received.
            </p>
          </div>
        </div>

        <div className="schedule-content">
          <div className="calendar-panel">
            <div className="calendar-topbar">
              <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
                ←
              </button>
              <h2 className="calendar-month">{monthLabel(currentMonth)}</h2>
              <button className="calendar-nav-btn" onClick={goToNextMonth}>
                →
              </button>
            </div>

            <div className="calendar-grid weekday-row">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="calendar-grid">
              {calendarCells.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="calendar-cell empty" />;
                }

                const dateKey = formatDateKey(year, month, day);
                const hasAssist = assistMap.has(dateKey);
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    key={dateKey}
                    className={`calendar-cell day-cell ${
                      hasAssist ? "has-assist" : ""
                    } ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedDate(dateKey)}
                  >
                    <span className="day-number">{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="details-panel">
            <h3 className="details-title">Day Details</h3>

            {!selectedDate && (
              <div className="details-empty">
                Select a green day to view who was helped and how much was received.
              </div>
            )}

            {selectedDate && selectedEntries.length === 0 && (
              <div className="details-empty">
                No one was assisted on {selectedDate}.
              </div>
            )}

            {selectedDate && selectedEntries.length > 0 && (
              <>
                <div className="details-date">{selectedDate}</div>

                <div className="details-list">
                  {selectedEntries.map((entry, index) => (
                    <div className="details-item" key={`${entry.name}-${index}`}>
                      <div>
                        <div className="details-name">{entry.name}</div>
                        <div className="details-label">Assisted client</div>
                      </div>
                      <div className="details-amount">
                        {entry.amount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="details-total">
                  <span>Total Given</span>
                  <strong>
                    {selectedTotal.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </strong>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}