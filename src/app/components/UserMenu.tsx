import React from "react";
import { User, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { motion, AnimatePresence } from "framer-motion";

// LogoutButton Component
const LogoutButton: React.FC = () => {
  const { logout, isLoading } = useUser();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={handleLogout}
        disabled={isLoading}
      >
        <LogOut className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-sm sm:text-base">
          {isLoading ? "Logging out..." : "Logout"}
        </span>
      </Button>
    </motion.div>
  );
};

// UserMenu Component
export default function UserMenu() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-transparent border-none p-0 cursor-pointer"
        >
          <User className="h-5 w-5" /> {/* Display user icon */}
        </motion.button>
      </PopoverTrigger>
      <AnimatePresence>
        <PopoverContent className="w-32 sm:w-48 max-w-xs mx-4 sm:mx-0" asChild>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid gap-2 sm:gap-4">
              <LogoutButton /> {/* Display the logout button */}
            </div>
          </motion.div>
        </PopoverContent>
      </AnimatePresence>
    </Popover>
  );
}
