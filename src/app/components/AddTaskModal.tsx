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
import { format, set } from "date-fns";

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
  const [title, setTitle] = useState("");
  const [remindTime, setRemindTime] = useState("");
  const [remindOn, setRemindOn] = useState(false);
  const { createTask } = useTasks();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedCreatedAt = format(selectedDate, "yyyy-MM-dd");
      let remindOnDate = null;
      if (remindTime) {
        const [hours, minutes] = remindTime.split(":").map(Number);
        remindOnDate = set(selectedDate, {
          hours,
          minutes,
          seconds: 0,
          milliseconds: 0,
        });
      }

      await createTask({
        title,
        createdAt: formattedCreatedAt,
        remindOn: remindOnDate
          ? format(remindOnDate, "yyyy-MM-dd'T'HH:mm:ss")
          : null,
        isImportant: false,
        isCompleted: false,
      });

      toast({
        title: "Task created",
        description: "Your new task has been successfully created.",
      });

      setTitle("");
      setRemindTime("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
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
                    <Label htmlFor="remindTime">Remind On</Label>
                    <Input
                      id="remindTime"
                      type="time"
                      value={remindTime}
                      onChange={(e) => setRemindTime(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full text-white bg-secondary">
                Add Task
              </Button>
            </div>
          </motion.form>
        </DialogContent>
      </Dialog>
    </>
  );
}
