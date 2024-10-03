import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useTasks } from "./TaskContext";

// Define Notification interface
interface Notification {
  id: number;
  taskId: number;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

// Define NotificationContext interface
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">
  ) => void;
  markAsRead: (id: number) => void;
  clearNotifications: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Simple function to generate notification ID
const generateNotificationId = () => Date.now();

// NotificationProvider Component
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { tasks } = useTasks();
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());

  // Add a new notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => {
      const newNotification: Notification = {
        ...notification,
        id: generateNotificationId(),
        createdAt: new Date(),
        isRead: false,
      };
      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  // Mark a notification as read
  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Check for reminders and create notifications
  const checkReminders = useCallback(() => {
    const now = new Date();
    tasks.forEach((task) => {
      if (task.remindOn) {
        const remindOn = new Date(task.remindOn);
        // Convert UTC time to local time
        const localRemindOn = new Date(
          remindOn.getTime() + remindOn.getTimezoneOffset() * 60000
        );
        if (
          localRemindOn > lastCheckTime &&
          localRemindOn <= now &&
          !task.isCompleted
        ) {
          addNotification({
            taskId: task.id,
            title: "Task Reminder",
            message: `It's time for: ${task.title}`,
          });
        }
      }
    });
    setLastCheckTime(now);
  }, [tasks, lastCheckTime, addNotification]);

  // Set up interval to check reminders
  useEffect(() => {
    const intervalId = setInterval(checkReminders, 5000); // Check every 5 seconds
    return () => clearInterval(intervalId);
  }, [checkReminders]);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Custom Hook to use the NotificationContext
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
