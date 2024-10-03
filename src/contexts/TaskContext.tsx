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

// Define Task interface and related types
interface Task {
  id: number;
  title: string;
  createdAt: string;
  remindOn: string | null;
  isCompleted: boolean;
  isImportant: boolean;
}

type CreateTaskData = Omit<Task, "id" | "userID">;
type UpdateTaskData = Partial<Omit<Task, "id" | "userID" | "createdAt">>;

// Define TaskContext interface
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

  // Fetch tasks from the API
  const fetchTasks = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data: Task[] = await response.json();
          setTasks(data);
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

  // Create a new task
  const createTask = useCallback(async (taskData: CreateTaskData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
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

  // Update an existing task
  const updateTask = useCallback(
    async (id: number, updates: UpdateTaskData) => {
      setError(null);

      // Optimistically update the task
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      );

      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
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
        // Revert the optimistic update on error
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          )
        );
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        console.error("Error updating task:", error);
      }
    },
    []
  );

  // Delete a task
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

  // Fetch tasks when the component mounts or user changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Memoize the context value to prevent unnecessary re-renders
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

// Custom hook to use the TaskContext
export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
