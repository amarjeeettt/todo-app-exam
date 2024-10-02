"use client";

import React, { useState } from "react";
import { format, isToday, isFuture } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasks } from "@/contexts/TaskContext";
import AddTaskModal from "./AddTaskModal";
import TaskCard from "./TaskCard";
import TaskSkeleton from "./skeleton/TaskSkeleton";

export default function ToDoCard({ selectedDate }: { selectedDate: Date }) {
  const [open, setOpen] = useState(false);
  const { tasks, isLoading, deleteTask, updateTask } = useTasks();

  const isAddTaskAllowed = isToday(selectedDate) || isFuture(selectedDate);

  const todayTasks = tasks.filter(
    (task) =>
      new Date(task.createdAt).toDateString() === selectedDate.toDateString()
  );

  // Group tasks by importance and completion status
  const groupedTasks = [
    {
      label: "Important Active Tasks",
      tasks: todayTasks.filter((task) => !task.isCompleted && task.isImportant),
    },
    {
      label: "Active Tasks",
      tasks: todayTasks.filter(
        (task) => !task.isCompleted && !task.isImportant
      ),
    },
    {
      label: "Important Completed Tasks",
      tasks: todayTasks.filter((task) => task.isCompleted && task.isImportant),
    },
    {
      label: "Completed Tasks",
      tasks: todayTasks.filter((task) => task.isCompleted && !task.isImportant),
    },
  ];

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-col items-center justify-between space-y-0 pb-2">
          <motion.div
            className="text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CardTitle className="text-2xl font-bold text-textPrimary">
              {format(selectedDate, "EEEE")}
            </CardTitle>
            <p className="text-sm text-textSecondary">
              {format(selectedDate, "MMMM d")}
            </p>
          </motion.div>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <div className="flex justify-between items-center mt-6">
            <motion.h2
              className="text-2xl font-semibold text-textPrimary"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              To Do Tasks
            </motion.h2>
          </div>
          <AddTaskModal
            open={open}
            setOpen={setOpen}
            selectedDate={selectedDate}
            disabled={!isAddTaskAllowed}
          />
          <ScrollArea className="mt-4 overflow-hidden h-[33rem]">
            <AnimatePresence>
              <ul className="space-y-4">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TaskSkeleton />
                      </motion.li>
                    ))
                  : groupedTasks.map((group) => (
                      <React.Fragment key={group.label}>
                        {group.tasks.map((task, index) => (
                          <motion.li
                            key={task.id}
                            className="flex items-center justify-between w-full gap-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <TaskCard
                              id={task.id}
                              title={task.title}
                              time={
                                task.remindOn ? task.remindOn : "No reminder"
                              }
                              selectedDate={selectedDate}
                              remindOn={task.remindOn}
                              isImportant={task.isImportant}
                              isCompleted={task.isCompleted}
                              onDelete={deleteTask}
                              onUpdate={updateTask}
                            />
                          </motion.li>
                        ))}
                      </React.Fragment>
                    ))}
              </ul>
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
}
