import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: {
    title?: string;
    remindOn?: string | null;
    isImportant?: boolean;
    isCompleted?: boolean;
  }) => Promise<void>;
  selectedDate: Date;
  task: {
    id: number;
    title: string;
    remindOn: string | null;
    isImportant: boolean;
    isCompleted: boolean;
  };
}

export default function EditTaskModal({
  isOpen,
  onClose,
  onUpdate,
  selectedDate,
  task,
}: EditTaskModalProps) {
  // State for form fields and loading status
  const [title, setTitle] = useState(task.title);
  const [remindOnTime, setRemindOnTime] = useState("");
  const [remindOn, setRemindOn] = useState(false);
  const [isImportant, setIsImportant] = useState(task.isImportant);
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update form state when task prop changes
  useEffect(() => {
    setTitle(task.title);
    setIsImportant(task.isImportant);
    setIsCompleted(task.isCompleted);

    if (task.remindOn) {
      const remindOnDate = new Date(task.remindOn);

      setRemindOnTime(
        `${String(remindOnDate.getUTCHours()).padStart(2, "0")}:${String(
          remindOnDate.getUTCMinutes()
        ).padStart(2, "0")}`
      );

      setRemindOn(true);
    } else {
      setRemindOnTime("");
      setRemindOn(false);
    }
  }, [task]);

  // Handles form submission to edit a new task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate reminder time if set
      let remindOnDate = null;

      if (remindOn && remindOnTime) {
        // Convert local time to UTC for consistent storage
        const [hours, minutes] = remindOnTime.split(":").map(Number);
        const localDate = new Date(selectedDate);
        localDate.setHours(hours, minutes, 0, 0);
        remindOnDate = new Date(
          localDate.getTime() - localDate.getTimezoneOffset() * 60000
        );
      }

      // Call the update function with new task data
      await onUpdate({
        title,
        remindOn: remindOnDate ? remindOnDate.toISOString() : null,
        isImportant,
        isCompleted,
      });

      // Show success toast notification
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      });

      onClose();
    } catch (error) {
      console.error("Error updating task:", error);

      // Show error toast notification
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
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
                    <Label htmlFor="remindOnTime">Remind On</Label>
                    <Input
                      id="remindOnTime"
                      type="time"
                      value={remindOnTime}
                      onChange={(e) => setRemindOnTime(e.target.value)}
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
                      {/* Loading spinner SVG */}
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
                    Updating Task...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </motion.form>
        </DialogContent>
      </Dialog>
    </>
  );
}
