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
import moment from "moment";
import { isToday, isFuture } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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

  const isEditTaskAllowed = isToday(selectedDate) || isFuture(selectedDate);

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
      <motion.div
        className="flex items-center space-x-3 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        layout
      >
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={checked}
            onCheckedChange={handleCheckedChange} // Use the new handler
            className="h-5 w-5 rounded-full border-2 border-blue-800 flex-shrink-0 data-[state=checked]:bg-white data-[state=checked]:text-blue-800"
            disabled={!isEditTaskAllowed}
          />
        </div>
        <Card
          className={`flex-grow flex items-center py-3 px-4 ${
            checked ? "bg-disable text-textDisable" : "bg-primary text-white"
          } rounded-lg`}
        >
          <motion.div layout className="flex-grow min-w-0 pr-4">
            <motion.h3
              className={`text-lg font-semibold truncate ${
                checked ? "line-through" : ""
              }`}
              layout="position"
            >
              {title}
            </motion.h3>
            <motion.p className="text-sm opacity-70 truncate" layout="position">
              {time && !isNaN(new Date(time).getTime())
                ? moment(time).local().format("hh:mm A") // Convert to local time and format
                : "No reminder"}
            </motion.p>
          </motion.div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <AnimatePresence>
              {important && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Star className="h-5 w-5 fill-current" />
                </motion.div>
              )}
            </AnimatePresence>
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
                <motion.div
                  className="grid gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    onClick={handleImportantChange}
                    className="justify-start"
                    disabled={isCompleted || !isEditTaskAllowed}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {important ? "Remove importance" : "Mark as important"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={handleEditTask}
                    disabled={isCompleted || !isEditTaskAllowed}
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
                </motion.div>
              </PopoverContent>
            </Popover>
          </div>
        </Card>
      </motion.div>
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
