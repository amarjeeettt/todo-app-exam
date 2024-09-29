"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasks } from "@/contexts/TaskContext";
import AddTaskModal from "./AddTaskModal";
import TaskCard from "./TaskCard";
import TaskSkeleton from "./skeleton/TaskSkeleton";

export default function ToDoCard({ selectedDate }: { selectedDate: Date }) {
  const [open, setOpen] = useState(false);
  const { tasks, isLoading, deleteTask, updateTask } = useTasks();

  const todayTasks = tasks.filter(
    (task) =>
      new Date(task.createdAt).toDateString() === selectedDate.toDateString()
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-col items-center justify-between space-y-0 pb-2">
        <div className="text-center">
          <CardTitle className="text-2xl font-bold">
            {format(selectedDate, "EEEE")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, "MMMM d")}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <div className="flex justify-between items-center mt-6">
          <h2 className="text-xl font-semibold text-primary">To Do Tasks</h2>
        </div>
        <AddTaskModal
          open={open}
          setOpen={setOpen}
          selectedDate={selectedDate}
        />
        <ScrollArea className="mt-4 overflow-y-auto h-[33rem]">
          <ul className="space-y-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <li key={index}>
                    <TaskSkeleton />
                  </li>
                ))
              : todayTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between w-full gap-2"
                  >
                    <TaskCard
                      id={task.id}
                      title={task.title}
                      time={task.remindOn ? task.remindOn : "No reminder"}
                      selectedDate={selectedDate}
                      remindOn={task.remindOn}
                      isImportant={task.isImportant}
                      isCompleted={task.isCompleted}
                      onDelete={deleteTask}
                      onUpdate={updateTask}
                    />
                  </li>
                ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
