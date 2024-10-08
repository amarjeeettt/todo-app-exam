"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/contexts/TaskContext";
import { format } from "date-fns";

export default function TaskModal({
  open,
  setOpen,
  selectedDate,
  disabled = false,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedDate: Date;
  disabled?: boolean;
}) {
  // State management for form inputs and UI
  const [title, setTitle] = useState("");
  const [remindTime, setRemindTime] = useState("");
  const [remindOn, setRemindOn] = useState(false);

  // Custom hooks for task management and notifications
  const { createTask, isLoading } = useTasks();
  const { toast } = useToast();

  // Handles form submission to create a new task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Format the creation date and calculate reminder time if set
      const formattedCreatedAt = format(selectedDate, "yyyy-MM-dd");
      let remindOnDate = null;

      if (remindTime) {
        // Convert local time to UTC for consistent storage
        const [hours, minutes] = remindTime.split(":").map(Number);
        const localDate = new Date(selectedDate);
        localDate.setHours(hours, minutes, 0, 0);
        remindOnDate = new Date(
          localDate.getTime() - localDate.getTimezoneOffset() * 60000
        );
      }

      // Call the createTask function from the context
      await createTask({
        title,
        createdAt: formattedCreatedAt,
        remindOn: remindOnDate ? remindOnDate.toISOString() : null,
        isImportant: false,
        isCompleted: false,
      });

      // Show success toast notification
      toast({
        title: "Task created",
        description: "Your new task has been successfully created.",
      });

      // Reset input fields and close modal
      setTitle("");
      setRemindTime("");
      setRemindOn(false);
      setOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);

      // Show error toast notification
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task. Please try again.",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full mt-4 sm:w-auto text-textPrimary"
            variant="outline"
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-4">
              {/* Task title input */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="title">Task</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {/* Reminder checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remindOn"
                  checked={remindOn}
                  onCheckedChange={(checked) => setRemindOn(checked as boolean)}
                  className={`${remindOn ? "text-white" : ""}`}
                />
                <Label htmlFor="remindOn">Set Reminder</Label>
              </div>
              {/* Animated reminder time input */}
              <AnimatePresence>
                {remindOn && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="remindTime">Remind On</Label>
                    <Input
                      id="remindTime"
                      type="time"
                      value={remindTime}
                      onChange={(e) => setRemindTime(e.target.value)}
                      disabled={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Submit button with loading state */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full text-white bg-secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </span>
                    Adding Task...
                  </>
                ) : (
                  "Add Task"
                )}
              </Button>
            </div>
          </motion.form>
        </DialogContent>
      </Dialog>
    </>
  );
}
