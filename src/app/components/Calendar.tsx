"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
  isBefore,
  isToday,
} from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/contexts/TaskContext";

export default function Calendar({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { tasks } = useTasks();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(addDays(monthEnd, 7));

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const weeks = [];
  let days = [];
  let day = startDate;

  const hasTasksOnDay = (date: Date) => {
    return tasks.some(
      (task) =>
        format(new Date(task.createdAt), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };

  const handleDateClick = (day: Date) => {
    const isPastDate = isBefore(day, new Date());

    if (isSameMonth(day, monthStart) && (!isPastDate || hasTasksOnDay(day))) {
      setSelectedDate(day);
    }
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day);
      const isPastDate = isBefore(cloneDay, new Date());
      const isTodayDate = isToday(cloneDay);

      days.push(
        <Button
          key={day.toString()}
          onClick={() => handleDateClick(cloneDay)}
          variant={isSameDay(day, selectedDate) ? "default" : "ghost"}
          className={`h-10 w-10 p-0 font-normal ${
            !isSameMonth(day, monthStart) ? "text-muted-foreground" : ""
          } ${isSameDay(day, selectedDate) ? "text-white" : ""}`}
          disabled={
            !isSameMonth(day, monthStart) || // Disable if not in current month
            (isPastDate && !hasTasksOnDay(cloneDay) && !isTodayDate) // Disable past dates without tasks or if not today
          }
        >
          {format(day, "d")}
        </Button>
      );
      day = addDays(day, 1);
    }
    weeks.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
    days = [];
  }

  const goToPreviousMonth = () =>
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  const goToNextMonth = () =>
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));

  return (
    <>
      <Card className="w-full h-full">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center justify-between space-x-6">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold pt-0.5 text-textPrimary">
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2 mt-6">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-textSecondary "
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid gap-2">{weeks}</div>
        </CardContent>
      </Card>
    </>
  );
}
