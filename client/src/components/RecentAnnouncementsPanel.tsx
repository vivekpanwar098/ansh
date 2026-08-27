import { formatRelativeTime } from "@/lib/utils/time";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

export type Announcement = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  type?: "warning" | "success" | "info";
};

type RecentAnnouncementsPanelProps = {
  announcements: Announcement[];
};

export default function RecentAnnouncementsPanel({
  announcements,
}: RecentAnnouncementsPanelProps) {
  return (
    <div className="h-full rounded-2xl bg-white p-4 sm:p-5 lg:p-6 border border-[rgba(23,33,38,0.08)] shadow-[0_10px_30px_rgba(23,33,38,0.04)] w-full flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base text-primary leading-tight">
          Recent Announcements
        </h2>
        <button
          type="button"
          className="text-xs text-primary hover:text-theme transition-colors"
        >
          View All
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-secondary">
          No announcements yet.
        </div>
      ) : (
        <ul className="space-y-4 sm:space-y-5 flex-1">
          {announcements.map((announcement) => {
            const type = announcement.type ?? "info";

            const Icon =
              type === "warning"
                ? AlertTriangle
                : type === "success"
                  ? CheckCircle2
                  : Info;

            const iconContainerClass =
              type === "warning"
                ? "bg-yellow-100"
                : type === "success"
                  ? "bg-emerald-100"
                  : "bg-violet-100";

            const iconClass =
              type === "warning"
                ? "text-yellow-700"
                : type === "success"
                  ? "text-emerald-700"
                  : "text-violet-700";

            return (
              <li
                key={announcement.id}
                className="flex items-start gap-3 sm:gap-4"
              >
                <div
                  className={`mt-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full shrink-0 ${iconContainerClass}`}
                >
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconClass}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-primary leading-snug wrap-break-word">
                      {announcement.title}
                    </h3>
                    <span className="shrink-0 text-xs font-medium text-muted mt-0.5">
                      {formatRelativeTime(announcement.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-secondary leading-relaxed wrap-break-word">
                    {announcement.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
