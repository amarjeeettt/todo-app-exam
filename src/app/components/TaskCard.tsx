"use client";

import { useState } from "react";
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
            className="h-5 w-5 rounded-full border-2 border-blue-800 flex-shrink-0"
          />
        </div>
        <Card
          className={`flex-grow flex items-center py-3 px-4 ${
            checked ? "bg-blue-200" : "bg-blue-800 text-white"
          } rounded-full`}
        >
          <div className="w-8 flex-shrink-0" />
          <div className="flex-grow min-w-0 pr-4">
            <h3 className="text-lg font-semibold truncate">{title}</h3>
            <p className="text-sm opacity-70 truncate">
              {time
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
                    checked
                      ? "hover:bg-blue-300 text-blue-800"
                      : "hover:bg-blue-700 text-white"
                  }`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 rounded-lg shadow-lg">
                <div className="grid gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleImportantChange}
                    className="justify-start"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {important ? "Remove importance" : "Mark as important"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={handleEditTask}
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
