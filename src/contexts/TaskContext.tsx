"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";

interface Task {
  id: number;
  title: string;
  createdAt: Date;
  remindOn: Date | null;
  isCompleted: boolean;
  isImportant: boolean;
}

type CreateTaskData = Omit<Task, "id" | "userID">;
type UpdateTaskData = Partial<Omit<Task, "id" | "userID" | "createdAt">>;

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (id: number, updates: UpdateTaskData) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const fetchTasks = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data: Task[] = await response.json();
          const parsedData = data.map((task) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            remindOn: task.remindOn ? new Date(task.remindOn) : null,
          }));
          setTasks(parsedData);
        } else {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  const createTask = useCallback(async (taskData: CreateTaskData) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedTaskData = {
        ...taskData,
        createdAt: new Date(taskData.createdAt).toISOString(),
        remindOn: taskData.remindOn
          ? new Date(taskData.remindOn).toISOString()
          : null,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedTaskData),
      });

      if (response.ok) {
        const newTask: Task = await response.json();
        setTasks((prevTasks) => [...prevTasks, newTask]);
      } else {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Error creating task:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTask = useCallback(
    async (id: number, updates: UpdateTaskData) => {
      setError(null);

      // Optimistic UI update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      );

      try {
        const formattedUpdates = {
          ...updates,
          remindOn: updates.remindOn
            ? new Date(updates.remindOn).toISOString()
            : null,
        };

        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedUpdates),
        });

        if (response.ok) {
          const updatedTask: Task = await response.json();
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === id ? { ...task, ...updatedTask } : task
            )
          );
        } else {
          throw new Error(`Failed to update task: ${response.statusText}`);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        console.error("Error updating task:", error);
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: number) => {
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      } else {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Error deleting task:", error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const contextValue = useMemo(
    () => ({
      tasks,
      isLoading,
      error,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
    }),
    [tasks, isLoading, error, fetchTasks, createTask, updateTask, deleteTask]
  );

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
