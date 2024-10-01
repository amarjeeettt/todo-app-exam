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
import { format, set } from "date-fns";

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
  const [title, setTitle] = useState(task.title);
  const [remindOnTime, setRemindOnTime] = useState("");
  const [remindOn, setRemindOn] = useState(false);
  const [isImportant, setIsImportant] = useState(task.isImportant);
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const { toast } = useToast();

  useEffect(() => {
    setTitle(task.title);
    setIsImportant(task.isImportant);
    setIsCompleted(task.isCompleted);
    if (task.remindOn) {
      const remindOnDate = new Date(task.remindOn);
      setRemindOnTime(format(remindOnDate, "HH:mm"));
    } else {
      setRemindOnTime("");
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let remindOnDate = null;
      if (remindOnTime) {
        const [hours, minutes] = remindOnTime.split(":").map(Number);
        remindOnDate = set(selectedDate, {
          hours,
          minutes,
          seconds: 0,
          milliseconds: 0,
        });
      }

      await onUpdate({
        title,
        remindOn: remindOnDate
          ? format(remindOnDate, "yyyy-MM-dd'T'HH:mm:ss")
          : null,
        isImportant,
        isCompleted,
      });

      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      });

      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task. Please try again.",
      });
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
              <div className="flex flex-col space-y-2">
                <Label htmlFor="title">Task</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remindOn"
                  checked={remindOn}
                  onCheckedChange={(checked) => setRemindOn(checked as boolean)}
                  className={`${remindOn ? "text-white" : ""}`}
                />
                <Label htmlFor="remindOn">Set Reminder</Label>
              </div>
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
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full text-white bg-secondary">
                Save Changes
              </Button>
            </div>
          </motion.form>
        </DialogContent>
      </Dialog>
    </>
  );
}
