import { LogIn, LogOut } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = {
  isCheckedIn?: boolean;
  isLoading?: boolean;
  handleToggle?: () => void | Promise<void>;
};

export default function CheckInOutButton({
  isCheckedIn,
  isLoading,
  handleToggle,
}: Props) {
  const onClick = async () => {
    if (handleToggle) {
      await handleToggle();
    }
  };

  return (
    <Button
      onClick={onClick}
      loading={isLoading}
      disabled={isLoading}
      size="md"
      className="w-full flex items-center justify-center gap-2"
      variant={isCheckedIn ? "outline" : "primary"}
    >
      {isCheckedIn ? (
        <LogOut className="w-4 h-4" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      <span className="truncate">{isCheckedIn ? "Check Out" : "Check In"}</span>
    </Button>
  );
}
