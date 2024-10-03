"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Define user and context types
interface User {
  id: number;
  username: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Set session duration to 1 hour
const SESSION_DURATION = 60 * 60 * 1000;

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      localStorage.removeItem("userSession");
    } catch (err) {
      console.error("Logout error:", err);
      setError("An error occurred during logout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Store user session in localStorage
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            user: userData,
            timestamp: new Date().getTime(),
          })
        );
      } else {
        throw new Error("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Store user session in localStorage
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            user: userData,
            timestamp: new Date().getTime(),
          })
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkSessionExpiration = useCallback(() => {
    const storedSession = localStorage.getItem("userSession");
    if (storedSession) {
      const { user, timestamp } = JSON.parse(storedSession);
      const now = new Date().getTime();
      if (now - timestamp > SESSION_DURATION) {
        logout();
        return false;
      } else {
        setUser(user);
        return true;
      }
    }
    return false;
  }, [logout]);

  useEffect(() => {
    const checkAuth = async () => {
      const sessionValid = checkSessionExpiration();
      if (!sessionValid) {
        try {
          // Attempt to fetch user data if session is invalid
          const response = await fetch("/api/user");
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem(
              "userSession",
              JSON.stringify({
                user: userData,
                timestamp: new Date().getTime(),
              })
            );
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    checkAuth();

    // Set up interval to check session expiration every minute
    const intervalId = setInterval(checkSessionExpiration, 60000);

    return () => clearInterval(intervalId);
  }, [checkSessionExpiration]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
