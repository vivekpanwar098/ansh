"use client";

import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import EmployeeLeaveRequestTable, {
  LeaveRequest,
} from "@/components/employee/EmployeeLeaveRequestTable";
import Loader from "@/components/ui/Loader";
import api from "@/services/axios";
import {
  CalendarDays,
  Check,
  Clock3,
  PlaneTakeoff,
  UserCheck,
  UserRoundX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AttendanceStats = {
  absent: number;
  present: number;
  halfDay: number;
  onLeave: number;
};

type LeavesStats = {
  total: number;
  used: number;
  remaining: number;
  pendingRequests: number;
};

export default function AttendancePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    absent: 0,
    present: 0,
    halfDay: 0,
    onLeave: 0,
  });
  const [leaveStats, setLeavesStats] = useState<LeavesStats>({
    total: 0,
    used: 0,
    remaining: 0,
    pendingRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateLeaveRequest = (leaveReq: LeaveRequest) => {
    setLeaveRequests((prev) => {
      return prev.map((l) => {
        if (leaveReq.id === l.id) {
          return leaveReq;
        }
        return l;
      });
    });
  };

  const removeLeaveRequest = (leaveId: string) => {
    setLeaveRequests((prev) => {
      return prev.filter((l) => l.id !== leaveId);
    });
  };

  const getPageData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/employee/me/attendance-summary");

      setLeaveRequests(res.data.data.leaves);
      setLeavesStats(res.data.data.leave);
      setAttendanceStats(res.data.data.attendance);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void getPageData();
  }, []);

  const attendanceStatsArr = [
    {
      value: attendanceStats.present,
      title: "Present",
      description: "This Month",
      Icon: UserCheck,
      iconColor: "text-emerald-500",
      iconBgColor: "bg-emerald-100",
    },
    {
      value: attendanceStats.absent,
      title: "Absent",
      description: "This Month",
      Icon: UserRoundX,
      iconColor: "text-red-500",
      iconBgColor: "bg-red-100",
    },
    {
      value: attendanceStats.halfDay,
      title: "Half Day",
      description: "This Month",
      Icon: Clock3,
      iconColor: "text-amber-500",
      iconBgColor: "bg-amber-100",
    },
    {
      value: attendanceStats.onLeave,
      title: "On Leave",
      description: "This Month",
      Icon: PlaneTakeoff,
      iconColor: "text-violet-500",
      iconBgColor: "bg-violet-100",
    },
  ];

  const leavesStatsArr = [
    {
      value: leaveStats.total,
      title: "Total Leave",
      Icon: UserCheck,
      iconColor: "text-emerald-500",
      iconBgColor: "bg-emerald-100",
    },
    {
      value: leaveStats.used,
      title: "Used Leave",
      Icon: Check,
      iconColor: "text-green-500",
      iconBgColor: "bg-green-100",
    },
    {
      value: leaveStats.remaining,
      title: "Remaining",
      Icon: Clock3,
      iconColor: "text-sky-500",
      iconBgColor: "bg-sky-100",
    },
    {
      value: leaveStats.pendingRequests,
      title: "Pending Requests",
      Icon: CalendarDays,
      iconColor: "text-red-500",
      iconBgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <section className="space-y-4">
            <PageHeader title="My Attendance" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {attendanceStatsArr.map(
                ({
                  value,
                  title,
                  description,
                  Icon,
                  iconColor,
                  iconBgColor,
                }) => (
                  <StatsCard
                    key={title}
                    value={value}
                    title={title}
                    description={description}
                    Icon={Icon}
                    iconColor={iconColor}
                    iconBgColor={iconBgColor}
                    showGrowth={false}
                  />
                ),
              )}
            </div>
          </section>

          <section className="space-y-4">
            <PageHeader title="My Leaves" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {leavesStatsArr.map(
                ({ value, title, Icon, iconColor, iconBgColor }) => (
                  <StatsCard
                    key={title}
                    value={value}
                    title={title}
                    Icon={Icon}
                    iconColor={iconColor}
                    iconBgColor={iconBgColor}
                    showGrowth={false}
                  />
                ),
              )}
            </div>

            <EmployeeLeaveRequestTable
              leaves={leaveRequests}
              updateLeaveRequest={updateLeaveRequest}
              addLeaveRequest={(leaveReq: LeaveRequest) =>
                setLeaveRequests((prev) => [leaveReq, ...prev])
              }
              removeLeaveRequest={removeLeaveRequest}
            />
          </section>
        </>
      )}
    </div>
  );
}
