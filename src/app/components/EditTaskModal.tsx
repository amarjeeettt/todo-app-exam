import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [isImportant, setIsImportant] = useState(task.isImportant);
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);

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
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="remindOn">Reminder (optional)</Label>
              <Input
                id="remindOn"
                type="time"
                value={remindOnTime}
                onChange={(e) => setRemindOnTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
