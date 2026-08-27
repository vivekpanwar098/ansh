export default function Loader({
  label = "Loading...",
  size = "sm",
}: {
  label?: string;
  subLabel?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "h-9 w-9" : size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <div className="flex w-full items-center justify-center rounded-2xl bg-transparent p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`relative ${sizeClass}`}>
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-slate-200 border-t-theme" />
        </div>

        <div className="space-y-1">
          <p className="text-sm text-primary">{label}</p>
        </div>
      </div>
    </div>
  );
}
