"use client";

import { useMemo, useState } from "react";
import { PencilLine, Trash2 } from "lucide-react";
import LeaveModal, {
  LeaveFormValues,
} from "@/components/employee/LeaveRequestModal";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import api from "@/services/axios";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/time";

export type LeaveRequest = {
  id: string;
  leaveType: "casual" | "sick" | "earned" | "other";
  from: Date;
  to: Date;
  days: number;
  status: "pending" | "rejected" | "approved" | "cancelled";
  reason: string;
  approver: string;
};

type EmployeeLeaveRequestTableProps = {
  leaves: LeaveRequest[];
  updateLeaveRequest: (leaveReq: LeaveRequest) => void;
  addLeaveRequest: (leaveReq: LeaveRequest) => void;
  removeLeaveRequest: (leaveId: string) => void;
};

const statusClasses: Record<LeaveRequest["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-700",
  approved: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-200 text-slate-700",
};

export default function EmployeeLeaveRequestTable({
  leaves,
  updateLeaveRequest,
  addLeaveRequest,
  removeLeaveRequest,
}: EmployeeLeaveRequestTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"apply" | "edit">("apply");
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedLeave = useMemo(
    () => leaves.find((leave) => leave.id === selectedLeaveId) ?? null,
    [leaves, selectedLeaveId],
  );

  const openApplyModal = () => {
    setModalMode("apply");
    setSelectedLeaveId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (leave: LeaveRequest) => {
    setModalMode("edit");
    setSelectedLeaveId(leave.id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSelectedLeaveId(null);
  };

  const editLeaveReq = async (
    leaveId: string,
    leaveDetails: LeaveFormValues,
  ) => {
    try {
      const res = await api.patch(
        `/employee/me/leaves/${leaveId}`,
        leaveDetails,
      );
      const updatedLeaveReq: LeaveRequest = {
        id: res.data.data._id,
        leaveType: res.data.data.leaveType,
        from: res.data.data.startDate,
        to: res.data.data.endDate,
        days: res.data.data.totalDays,
        approver: res.data.data.approver || "-",
        status: res.data.data.status,
        reason: res.data.data.reason,
      };
      updateLeaveRequest(updatedLeaveReq);
      toast.success("Leave request updated successfully");
    } catch {
      toast.error("Something went wrong! Failed to edit leave request");
    }
  };

  const applyForLeave = async (leaveDetails: LeaveFormValues) => {
    try {
      const res = await api.post(`/employee/me/leaves`, leaveDetails);
      const newLeaveReq: LeaveRequest = {
        id: res.data.data._id,
        leaveType: res.data.data.leaveType,
        from: res.data.data.startDate,
        to: res.data.data.endDate,
        days: res.data.data.totalDays,
        approver: res.data.data.approver || "-",
        status: res.data.data.status,
        reason: res.data.data.reason,
      };
      addLeaveRequest(newLeaveReq);
      toast.success("Leave request sent successfully");
    } catch {
      toast.error("Something went wrong! Failed to send leave request");
    }
  };

  const cancleLeaveRequest = async (leaveId: string) => {
    try {
      if (!confirm("Click ok to continue cancle leave request!")) return;
      await api.delete(`/employee/me/leaves/${leaveId}`);
      removeLeaveRequest(leaveId);
    } catch {
      toast.error("Failed to cancle leave request");
    }
  };

  const handleSubmit = async (values: LeaveFormValues) => {
    setIsSubmitting(true);

    try {
      if (modalMode === "apply") {
        await applyForLeave(values);
      } else if (selectedLeave) {
        await editLeaveReq(selectedLeave.id, values);
      }
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setSelectedLeaveId(null);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[rgba(23,33,38,0.08)] bg-white shadow-[0_10px_30px_rgba(23,33,38,0.04)]">
        <div className="flex items-center justify-end p-3 sm:p-4">
          <button
            type="button"
            onClick={openApplyModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1aa6a2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#169295]"
          >
            Request for leave
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className="max-h-105 overflow-y-auto overflow-x-auto">
          <Table className="min-w-205">
            <THead>
              <TR>
                <TH className="text-left text-primary">Leave type</TH>
                <TH className="text-left text-primary">From</TH>
                <TH className="text-left text-primary">To</TH>
                <TH className="text-left text-primary">Days</TH>
                <TH className="text-left text-primary">Status</TH>
                <TH className="text-left text-primary">Reason</TH>
                <TH className="text-left text-primary">Approver</TH>
                <TH className="text-right text-primary">Action</TH>
              </TR>
            </THead>

            <TBody>
              {leaves.map((leave) => (
                <TR key={leave.id}>
                  <TD className="font-medium">{leave.leaveType}</TD>
                  <TD>{formatDate(new Date(leave.from))}</TD>
                  <TD>{formatDate(new Date(leave.to))}</TD>
                  <TD>{leave.days}</TD>
                  <TD>
                    <span
                      className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${statusClasses[leave.status]}`}
                    >
                      {leave.status}
                    </span>
                  </TD>
                  <TD>{leave.reason}</TD>
                  <TD>{leave.approver}</TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        aria-label={`Edit ${leave.leaveType} leave request`}
                        onClick={() => openEditModal(leave)}
                        className="rounded-md border border-slate-200 p-2 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        <PencilLine size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${leave.leaveType} leave request`}
                        className="rounded-md border border-slate-200 p-2 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => cancleLeaveRequest(leave.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </div>

      <LeaveModal
        open={isModalOpen}
        mode={modalMode}
        loading={isSubmitting}
        initialValues={
          selectedLeave
            ? {
                leaveType: selectedLeave.leaveType,
                startDate: selectedLeave.from,
                endDate: selectedLeave.to,
                reason: selectedLeave.reason,
              }
            : undefined
        }
        onClose={handleModalClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}
