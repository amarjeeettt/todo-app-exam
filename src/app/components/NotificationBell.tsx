import React from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";

// Utility function for formatting dates
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

// NotificationItem Component to display individual notifications
const NotificationItem: React.FC<{
  notification: {
    id: number;
    title: string;
    message: string;
    createdAt: Date;
    isRead: boolean;
  };
  markAsRead: (id: number) => void; // Function to mark notification as read
}> = ({ notification, markAsRead }) => {
  return (
    <div
      key={notification.id}
      className={`p-2 rounded-md transition-colors ${
        notification.isRead
          ? "bg-gray-50"
          : "bg-blue-50 border-l-4 border-secondary"
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <h5 className="font-medium text-gray-800">{notification.title}</h5>
      <p className="text-sm text-gray-600">{notification.message}</p>
      <small className="text-gray-400">
        {formatDate(notification.createdAt)}
      </small>
    </div>
  );
};

// NotificationBell Component for displaying the bell icon and notification list
export default function NotificationBell() {
  const { notifications, markAsRead, clearNotifications } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length; // Count unread notifications

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-transparent border-none p-0 cursor-pointer relative"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </motion.button>
      </PopoverTrigger>
      <AnimatePresence>
        <PopoverContent
          className="w-64 sm:w-80 max-w-xs mx-4 sm:mx-0 shadow-lg rounded-lg"
          asChild
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-4 rounded-lg"
          >
            <h4 className="font-semibold text-gray-800 mb-2">Notifications</h4>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No new notifications.</p>
            ) : (
              <div className="flex flex-col space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    markAsRead={markAsRead}
                  />
                ))}
                <button
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={clearNotifications}
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        </PopoverContent>
      </AnimatePresence>
    </Popover>
  );
}
