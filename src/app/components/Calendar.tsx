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
import { AnimatePresence, motion } from "framer-motion";
import { useTasks } from "@/contexts/TaskContext";

export default function Calendar({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // State to track the current month
  const [direction, setDirection] = useState(0); // Direction of month transition
  const { tasks } = useTasks(); // Fetch tasks from context

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(addDays(monthEnd, 7));

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Check if there are tasks on a given date
  const hasTasksOnDay = (date: Date) => {
    return tasks.some(
      (task) =>
        format(new Date(task.createdAt), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };

  // Handle date click event to select a date
  const handleDateClick = (day: Date) => {
    const isPastDate = isBefore(day, new Date());

    if (
      isSameMonth(day, monthStart) && // Ensure the date is in the current month
      (isToday(day) || !isPastDate || hasTasksOnDay(day)) // Allow selecting today, future dates, or dates with tasks
    ) {
      setSelectedDate(day);
    }
  };

  // Render weeks of the calendar
  const renderWeeks = () => {
    const weeks = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day); // Clone the current day to avoid mutating
        const isPastDate = isBefore(cloneDay, new Date()); // Check if the cloned day is in the past
        const isTodayDate = isToday(cloneDay); // Check if the cloned day is today

        days.push(
          <div
            key={day.toString()} // Unique key for each day
            className="h-10 flex items-center justify-center"
          >
            <Button
              onClick={() => handleDateClick(cloneDay)}
              variant={isSameDay(day, selectedDate) ? "default" : "ghost"}
              className={`h-8 w-8 p-0 font-normal ${
                !isSameMonth(day, monthStart) ? "text-muted-foreground" : ""
              } ${isSameDay(day, selectedDate) ? "text-white" : ""}`}
              disabled={
                !isSameMonth(day, monthStart) ||
                (isPastDate && !hasTasksOnDay(cloneDay) && !isTodayDate)
              }
            >
              {format(day, "d")}
            </Button>
          </div>
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
    return weeks;
  };

  const goToPreviousMonth = () => {
    setDirection(-1);
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    setDirection(1);
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  // Variants for animation transitions
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000, // Slide in from the right or left
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000, // Slide out to the right or left
      opacity: 0,
    }),
  };

  return (
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
      <CardContent className="pb-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 mt-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-textSecondary h-10 flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>
        {/* Calendar grid with animation */}
        <div className="relative overflow-hidden" style={{ height: "240px" }}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentMonth.toString()}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute w-full"
            >
              {renderWeeks()}
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
