"use client";

import { User } from "@/lib/types/user";
import api from "@/services/axios";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
  isAuthReady: boolean;
  updateAvatar: (data: FormData) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
};

const DefaultAuthContextValue: AuthContextType = {
  user: null,
  login: async () => {},
  logout: async () => {},
  isAuthLoading: false,
  isAuthReady: false,
  updateAvatar: async () => {},
  updateProfile: async () => {},
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
    getProfile();
  }, []);

  const updateProfile = async (userData: { name?: string; phone?: string }) => {
    try {
      const res = await api.patch("/profile", userData);
      const newUser: User = {
        id: res.data.data.id,
        name: res.data.data.name,
        profileImage: res.data.data.avatarUrl,
        role: res.data.data.role,
        email: res.data.data.email,
        employeeId: res.data.data.employeeId,
      };
      setUser(newUser);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const updateAvatar = async (data: FormData) => {
    try {
      const res = await api.patch("/profile/avatar", data, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });
      setUser((prev) => ({
        ...(prev as User),
        profileImage: res.data.data.avatarUrl,
      }));
      toast.success("Profile image updated successfully");
    } catch {
      toast.error("Failed to update avatar");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      const res = await api.post("/auth/signin", {
        email,
        password,
      });
      setUser(res.data.user);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthLoading,
        isAuthReady,
        updateProfile,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
