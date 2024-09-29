"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface User {
  id: number;
  username: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_DURATION = 60 * 60 * 1000;

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("userSession");
  }, []);

  const login = useCallback((userData: User) => {
    const loginData = {
      user: userData,
      timestamp: new Date().getTime(),
    };
    setUser(userData);
    localStorage.setItem("userSession", JSON.stringify(loginData));
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
          const response = await fetch("/api/user");
          if (response.ok) {
            const userData = await response.json();
            login(userData);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    checkAuth();

    const intervalId = setInterval(checkSessionExpiration, 60000);

    return () => clearInterval(intervalId);
  }, [checkSessionExpiration, login]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
