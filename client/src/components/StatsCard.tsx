import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

type StatsCardProps = {
  value?: string;
  title: string;
  description?: string;
  Icon: LucideIcon;
  growthValue?: string;
  growthType?: "positive" | "negative";
  iconColor?: string;
  iconBgColor?: string;
  showGrowth?: boolean;
};

export default function StatsCard({
  value = "0",
  title,
  description,
  Icon,
  showGrowth = false,
  growthValue = "0%",
  growthType = "positive",
  iconColor = "text-theme",
  iconBgColor = "bg-theme/10",
}: StatsCardProps) {
  const isPositive = growthType === "positive";
  const GrowthIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const growthTextColor = isPositive ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_10px_30px_rgba(23,33,38,0.06)] border border-[rgba(23,33,38,0.08)] flex items-start justify-between gap-3 sm:gap-4 w-full transition-all duration-200 hover:shadow-[0_12px_28px_rgba(23,33,38,0.1)]">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs tracking-[0.12em] text-secondary">
          {title}
        </p>
        <h3 className="text-base my-1 wrap-break-word text-primary">{value}</h3>
        {description ? (
          <p className="text-xs mb-2 wrap-break-word text-muted">
            {description}
          </p>
        ) : null}
        {showGrowth && (
          <span
            className={`inline-flex items-center gap-1 text-[10px]  ${growthTextColor} flex-wrap`}
            aria-label={isPositive ? "positive growth" : "negative growth"}
          >
            <GrowthIcon size={14} className="shrink-0" />
            <span>{growthValue}</span>
          </span>
        )}
      </div>

      <div
        className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconColor}`}
      >
        <Icon size={20} className={`sm:w-5.5 sm:h-5.5 ${iconColor}`} />
      </div>
    </div>
  );
}
