"use client";

import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { TaskProvider } from "@/contexts/TaskContext";
import Calendar from "./components/Calendar";
import ProgressCard from "./components/ProgressCard";
import TaskDashboardCard from "./components/TaskDashboardCard";
import ToDoCard from "./components/ToDoCard";
import AuthModal from "./components/AuthModal";

export default function HomeClient() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useUser();

  return (
    <>
      <AuthModal isOpen={!user} />
      <TaskProvider>
        <div className="flex flex-col gap-8 h-full md:flex-col lg:flex-row">
          <div className="order-2 md:order-2 lg:order-1 lg:w-1/3 flex flex-col gap-8">
            <Calendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            <ProgressCard />
            <TaskDashboardCard />
          </div>
          <div className="order-1 md:order-1 lg:order-2 lg:w-2/3">
            <ToDoCard selectedDate={selectedDate} />
          </div>
        </div>
      </TaskProvider>
    </>
  );
}
