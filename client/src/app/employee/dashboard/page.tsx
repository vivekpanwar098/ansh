"use client";

import StatsCard from "@/components/StatsCard";
import RecentAnnouncementsPanel, {
  Announcement,
} from "@/components/RecentAnnouncementsPanel";
import EmployeeMyPayslipPanel, {
  Payslip,
} from "@/components/EmployeeMyPayslipPanel";
import EmployeeRecentReportTable, {
  Report,
} from "@/components/EmployeeRecentReportTable";
import { CheckCheck, Clock3, WalletCards } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api from "@/services/axios";
import { toast } from "sonner";
import GreetingCard from "@/components/GreetingCard";
import Loader from "@/components/ui/Loader";

type Stats = {
  today: {
    status: "not-checked-in" | "checked-in" | "checked-out";
  };
  leave: {
    remaining: number;
    total: number;
  };
  pendingReq: {
    count: number;
    type: number;
  };
};

export default function EmployeeDashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>({
    today: {
      status: "not-checked-in",
    },
    leave: {
      remaining: 0,
      total: 0,
    },
    pendingReq: {
      count: 0,
      type: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/employee/me/dashboard");
      setPayslips(res.data.data.payslips);
      setAnnouncements(res.data.data.recentAnnouncements);
      setReports(res.data.data.recentReports);
      setStats({
        today: res.data.data.today,
        leave: res.data.data.leaveBalance,
        pendingReq: res.data.data.pendingRequests,
      });
    } catch {
      toast.error("Something went wrong! Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getDashboardData();
  }, [getDashboardData]);
  return (
    <>
      <GreetingCard />
      {isLoading ? (
        <Loader label="Loading dashboard..." />
      ) : (
        <>
          {/* Dashboard stats section  */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatsCard
              key={"today"}
              title="Today's status"
              value={stats?.today.status}
              Icon={CheckCheck}
            />
            <StatsCard
              key={"leave"}
              title="Leave balance"
              value={String(stats?.leave.remaining)}
              description={"Total: " + String(stats?.leave.total)}
              Icon={Clock3}
            />
            <StatsCard
              key={"pending-requests"}
              title="Pending requests"
              value={String(stats?.pendingReq.count)}
              Icon={WalletCards}
            />
          </section>

          {/* Recent announcements and recent payslip section  */}
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] items-stretch">
            <div className="h-full">
              <RecentAnnouncementsPanel announcements={announcements} />
            </div>
            <div className="h-full">
              <EmployeeMyPayslipPanel payslips={payslips} />
            </div>
          </section>

          {/* Recent report section  */}
          <section className="mt-6 rounded-2xl border border-[rgba(23,33,38,0.08)] bg-white p-3 sm:p-5 shadow-[0_10px_30px_rgba(23,33,38,0.04)]">
            <h2 className="mb-4 text-base text-primary">Recent Report</h2>
            <EmployeeRecentReportTable reports={reports} />
          </section>
        </>
      )}
    </>
  );
}
