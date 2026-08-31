"use client";

import useAuth from "@/features/auth/hooks/useAuth";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

export default function EmployeeAuthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthLoading, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user || user.role !== "employee") {
      router.replace("/login");
      toast.error("Please login as employee");
    }
  }, [isAuthReady, router, user]);

  if (!isAuthReady || isAuthLoading) return <Loader />;
  if (!user || user.role !== "employee") return null;

  return children;
}
