"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Star, MoreHorizontal, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditTaskModal from "./EditTaskModal";

interface TaskCardProps {
  id: number;
  title: string;
  time?: string;
  selectedDate: Date;
  remindOn: string | null;
  isImportant?: boolean;
  isCompleted?: boolean;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (
    id: number,
    updates: {
      title?: string;
      remindOn?: string | null;
      isImportant?: boolean;
      isCompleted?: boolean;
    }
  ) => Promise<void>;
}

export default function TaskCard({
  id,
  title,
  time,
  selectedDate,
  remindOn,
  isImportant,
  isCompleted,
  onDelete,
  onUpdate,
}: TaskCardProps) {
  const [checked, setChecked] = useState(isCompleted);
  const [important, setImportant] = useState(isImportant);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get the current date
  const today = new Date();

  // Strip out the time from dates to compare only the date part
  const isPastTask = selectedDate.toDateString() < today.toDateString(); // Check if the task date is before today

  const handleImportantChange = async () => {
    const newImportant = !important;
    setImportant(newImportant);
    try {
      await onUpdate(id, { isImportant: newImportant });
    } catch (error) {
      console.error("Failed to update task importance:", error);
      // Revert the importance state if the update fails
      setImportant(!newImportant);
    }
  };

  const handleCheckedChange = async (value: boolean | "indeterminate") => {
    if (typeof value === "boolean") {
      setChecked(value);
      try {
        await onUpdate(id, { isCompleted: value });
      } catch (error) {
        console.error("Failed to update task completion status:", error);
        setChecked(!value);
      }
    }
  };

  const handleEditTask = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (updates: {
    title?: string;
    remindOn?: string | null;
    isImportant?: boolean;
    isCompleted?: boolean;
  }) => {
    try {
      await onUpdate(id, updates);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-3 w-full">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={checked}
            onCheckedChange={handleCheckedChange} // Use the new handler
            className="h-5 w-5 rounded-full border-2 border-blue-800 flex-shrink-0 data-[state=checked]:bg-white data-[state=checked]:text-blue-800"
            disabled={isPastTask}
          />
        </div>
        <Card
          className={`flex-grow flex items-center py-3 px-4 ${
            checked ? "bg-disable text-textDisable" : "bg-primary text-white"
          } rounded-lg`}
        >
          <div className="w-8 flex-shrink-0" />
          <div className="flex-grow min-w-0 pr-4">
            <h3
              className={`text-lg font-semibold truncate ${
                checked ? "line-through" : ""
              }`}
            >
              {title}
            </h3>
            <p className="text-sm opacity-70 truncate">
              {time && !isNaN(new Date(time).getTime())
                ? new Date(time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {important && <Star className="h-5 w-5 fill-current" />}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 p-0 rounded-full ${
                    checked ? "hover:bg-[#8AB3C8]" : "hover:bg-[#003A50]"
                  }`}
                >
                  <MoreHorizontal
                    className={`h-5 w-5 ${
                      checked ? "text-textDisable" : "text-white"
                    }`}
                  />
                  <span className="sr-only">Open menu</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 rounded-lg shadow-lg">
                <div className="grid gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleImportantChange}
                    className="justify-start"
                    disabled={isCompleted || isPastTask}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {important ? "Remove importance" : "Mark as important"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={handleEditTask}
                    disabled={isCompleted || isPastTask}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit task
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleDeleteTask}
                  >
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    Delete task
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </Card>
      </div>
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateTask}
        selectedDate={selectedDate}
        task={{
          id,
          title,
          remindOn,
          isImportant: !!important,
          isCompleted: !!checked,
        }}
      />
    </>
  );
}
