"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarGrid from "@/components/CalendarGrid";
import ClientList from "@/components/ClientList";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getClientsByDateRange, getEligibility } from "@/lib/apiClient";
import type { ClientRecord } from "@/lib/dynamodb";
import type { EligibilityResult } from "@/lib/apiClient";
import "./calendar.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [clientsByDate, setClientsByDate] = useState<Record<string, ClientRecord[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [eligibilityMap, setEligibilityMap] = useState<Record<string, EligibilityResult | null>>({});

  const loadMonth = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setSelectedDay(null);

    const m = String(month + 1).padStart(2, "0");
    const lastDay = new Date(year, month + 1, 0).getDate();
    const start = `${year}-${m}-01`;
    const end = `${year}-${m}-${String(lastDay).padStart(2, "0")}`;

    try {
      const clients = await getClientsByDateRange(start, end);

      const grouped: Record<string, ClientRecord[]> = {};
      for (const client of clients) {
        const key = client.lastHelpedDate;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(client);
      }
      setClientsByDate(grouped);

      const eligMap: Record<string, EligibilityResult | null> = {};
      await Promise.all(
        clients.map(async (client) => {
          try {
            eligMap[client.clientId] = await getEligibility(client.clientId);
          } catch {
            eligMap[client.clientId] = null;
          }
        })
      );
      setEligibilityMap(eligMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calendar data.");
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function handleDayClick(day: number) {
    setSelectedDay(selectedDay === day ? null : day);
  }

  const selectedDateKey = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;
  const selectedClients = selectedDateKey ? clientsByDate[selectedDateKey] ?? [] : [];

  return (
    <div className="calendar-page">
      <h1 className="calendar-title">Calendar</h1>

      <div className="calendar-nav">
        <button className="calendar-nav-btn" onClick={prevMonth}>
          <ChevronLeft size={20} />
        </button>
        <span className="calendar-nav-label">
          {MONTH_NAMES[month]} {year}
        </span>
        <button className="calendar-nav-btn" onClick={nextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && error && <p className="calendar-error">{error}</p>}

      {!isLoading && !error && (
        <>
          <CalendarGrid
            year={year}
            month={month}
            clientsByDate={clientsByDate}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
          />

          {selectedDay !== null && (
            <div className="calendar-day-detail">
              <h2>
                {MONTH_NAMES[month]} {selectedDay}, {year}
              </h2>
              {selectedClients.length === 0 ? (
                <p className="calendar-no-clients">No clients helped on this day.</p>
              ) : (
                <ClientList clients={selectedClients} eligibilityMap={eligibilityMap} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
