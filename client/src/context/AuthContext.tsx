"use client";

import { User } from "@/lib/types/user";
import api from "@/services/axios";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
  isAuthReady: boolean;
  toggleCheckIn: () => Promise<void>;
};

const DefaultAuthContextValue: AuthContextType = {
  user: null,
  login: async () => {},
  logout: async () => {},
  isAuthLoading: false,
  isAuthReady: false,
  toggleCheckIn: async () => {},
};
export const AuthContext = createContext<AuthContextType>(
  DefaultAuthContextValue,
);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  const getProfile = async () => {
    setIsAuthLoading(true);
    try {
      const res = await api.get("/profile");
      const newUser: User = {
        id: res.data.data.id,
        name: res.data.data.name,
        profileImage: res.data.data.avatarUrl,
        role: res.data.data.role,
        email: res.data.data.email,
        employeeId: res.data.data.employeeId,
        isCheckedIn: res.data.data.todayAttendance.status === "checked-in",
      };
      setUser(newUser);
    } catch {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    // Run once on mount to determine whether the user session exists.
    if (!user) {
      getProfile();
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      const res = await api.post("/auth/signin", {
        email,
        password,
      });
      const newUser: User = {
        id: res.data.user.id,
        name: res.data.user.name,
        profileImage: res.data.user.avatarUrl,
        role: res.data.user.role,
        email: res.data.user.email,
        employeeId: res.data.user.employeeId,
        isCheckedIn: res.data.user.todayAttendance.status === "checked-in",
      };
      setUser(newUser);
      if (res.data.user?.role === "employee")
        router.push("/employee/dashboard");
      if (res.data.user?.role === "admin") router.push("/admin/dashboard");
      toast.success(`Welcome back ${res.data.user.name.split(" ")[0]}`);
    } catch {
      toast.error("Incorrect email or password");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsAuthLoading(true);
      await api.post("/auth/logout");
    } catch {
    } finally {
      setUser(null);
      setIsAuthLoading(false);
    }
  };

  const toggleCheckIn = async () => {
    if (
      !confirm(
        "You can check-in once in a day. Once checked-out you can't check-in again. Click OK to continue!",
      )
    )
      return;
    try {
      if (user?.isCheckedIn) {
        await api.post("/employee/me/attendance", { status: "present" });
        setUser((prev) => ({ ...(prev as User), isCheckedIn: false }));
        toast.success("You have checked-in successfully");
      } else {
        await api.post("/employee/me/attendance", { status: "present" });
        setUser((prev) => ({ ...(prev as User), isCheckedIn: true }));
        toast.success("You have checked-out successfully");
      }
      window.location.reload();
    } catch (err) {
      if (err instanceof AxiosError) toast.error(err.response?.data.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthLoading,
        isAuthReady,
        toggleCheckIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
