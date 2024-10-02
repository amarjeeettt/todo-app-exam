"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { TaskProvider } from "@/contexts/TaskContext";
import Calendar from "./components/Calendar";
import ProgressCard from "./components/ProgressCard";
import TaskDashboardCard from "./components/TaskDashboardCard";
import ToDoCard from "./components/ToDoCard";
import AuthModal from "./components/AuthModal";
import NotificationBell from "./components/NotificationBell";
import UserMenu from "./components/UserMenu";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function HomeClient() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useUser();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      setAuthModalOpen(false);
    }
  }, [user]);

  const handleLogout = () => {
    setAuthModalOpen(true); // Open the AuthModal when logging out
  };

  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} />
      <TaskProvider>
        <NotificationProvider>
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-6">
              <NotificationBell />
              <UserMenu onLogout={handleLogout} />
            </div>
          </div>
          <div className="flex flex-col gap-7 h-full md:flex-col lg:flex-row">
            <div className="order-2 md:order-2 lg:order-1 lg:w-1/3 flex flex-col gap-7">
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
        </NotificationProvider>
      </TaskProvider>
    </>
  );
}
