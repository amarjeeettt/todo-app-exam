"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthModal({ isOpen }: { isOpen: boolean }) {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Login error: ", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Register error: ", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-[425px] bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome</DialogTitle>
          <DialogDescription className="text-gray-400">
            Login or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-sm font-medium">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="text-sm font-medium">
              Register
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-300"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="John Doe"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        username: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-300"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <motion.div
                className="mt-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Login
                </Button>
              </motion.div>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-300"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="John Doe"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        username: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="register-password"
                    className="text-sm font-medium text-gray-300"
                  >
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <motion.div
                className="mt-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Register
                </Button>
              </motion.div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
