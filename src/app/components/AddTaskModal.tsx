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
import { Plus } from "lucide-react";
import { useTasks } from "@/contexts/TaskContext";
import { format, set } from "date-fns";

export default function TaskModal({
  open,
  setOpen,
  selectedDate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedDate: Date;
}) {
  const [title, setTitle] = useState("");
  const [remindTime, setRemindTime] = useState("");
  const { createTask } = useTasks();

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
      setTitle("");
      setRemindTime("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Task
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remindOn" className="text-right">
                Remind On
              </Label>
              <Input
                id="remindOn"
                type="time"
                value={remindTime}
                onChange={(e) => setRemindTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
