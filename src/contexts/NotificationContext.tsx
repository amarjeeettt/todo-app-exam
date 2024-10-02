import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useTasks } from "./TaskContext";

// Types
interface Notification {
  id: number;
  taskId: number;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">
  ) => void;
  markAsRead: (id: number) => void;
  clearNotifications: () => void;
}

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const generateNotificationId = () => Date.now(); // Can be enhanced for uniqueness

// NotificationProvider Component
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { tasks } = useTasks();
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());

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

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

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

// Custom Hook
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
