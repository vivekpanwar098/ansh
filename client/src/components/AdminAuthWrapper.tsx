"use client";

import useAuth from "@/features/auth/hooks/useAuth";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

export default function AdminAuthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthLoading, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user || user.role !== "admin") {
      router.replace("/login");
      toast.error("Please login as admin");
    }
  }, [isAuthReady, router, user]);

  if (!isAuthReady || isAuthLoading) return <Loader />;
  if (!user || user.role !== "admin") return null;

  return children;
}
