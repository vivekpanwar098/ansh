import useAuth from "@/features/auth/hooks/useAuth";
import { Calendar } from "lucide-react";

export default function GreetingCard() {
  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();

  const greeting =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
        ? "Good afternoon"
        : hour >= 17 && hour < 21
          ? "Good evening"
          : "Good night";

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const firstName = user?.name.trim().split(/\s+/)[0] || "there";

  return (
    <div className="bg-linear-to-r from-[#18A096] to-[#12544F] rounded-2xl p-4 sm:p-6 text-white flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center shadow-md">
      <div className="min-w-0 flex-1">
        <p className="text-xl sm:text-2xl leading-tight wrap-break-words">
          {greeting}, {firstName} 👋
        </p>
        <p className="mt-1 text-xs sm:text-sm text-white/80 leading-relaxed wrap-break-words">
          Here&apos;s what&apos;s happening across your organization today.
        </p>
      </div>
      <div className="bg-white text-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-sm w-fit self-start sm:self-auto whitespace-nowrap">
        <Calendar size={16} className="text-[#18A096] shrink-0" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
