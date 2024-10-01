"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";

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
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const { user } = useUser();

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

  const createTask = async (taskData: CreateTaskData) => {
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
  };

  const updateTask = async (id: number, updates: UpdateTaskData) => {
    setError(null);

    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
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
  };

  const deleteTask = async (id: number) => {
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
      console.error("Error creating task:", error);
    }
  };

  const fetchTasksIfStale = useCallback(() => {
    const now = Date.now();
    if (user && now - lastFetchTime > 30 * 60 * 1000) {
      // 5 minutes
      fetchTasks();
      setLastFetchTime(now);
    }
  }, [user, lastFetchTime, fetchTasks]);

  useEffect(() => {
    fetchTasksIfStale(); // Fetch immediately if stale
    const intervalId = setInterval(fetchTasksIfStale, 1800000); // Check every 30 minutes
    return () => clearInterval(intervalId);
  }, [fetchTasksIfStale]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
