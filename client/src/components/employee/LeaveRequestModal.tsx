"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import { formatForInput, parseDateInput } from "@/lib/utils/time";

//Form data
export type LeaveFormValues = {
  leaveType: string;
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
};

type ApplyLeaveModalProps = {
  open: boolean;
  mode?: "apply" | "edit";
  initialValues?: LeaveFormValues;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: LeaveFormValues) => Promise<void> | void;
};

const DEFAULT_VALUES: LeaveFormValues = {
  leaveType: "",
  startDate: null,
  endDate: null,
  reason: "",
};

const LEAVE_OPTIONS = ["Casual", "Sick", "Earned", "Other"];

export default function LeaveRequestModal({
  open,
  mode = "apply",
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: ApplyLeaveModalProps) {
  const [formValues, setFormValues] = useState<LeaveFormValues>(
    initialValues || DEFAULT_VALUES,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof LeaveFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLocked = loading || isSubmitting;

  const title = useMemo(
    () => (mode === "edit" ? "Edit Leave Request" : "Apply for Leave"),
    [mode],
  );

  const validateForm = (values: LeaveFormValues) => {
    const nextErrors: Partial<Record<keyof LeaveFormValues, string>> = {};

    if (!values.leaveType.trim()) {
      nextErrors.leaveType = "Leave type is required.";
    }

    if (!values.startDate) {
      nextErrors.startDate = "Start date is required.";
    }

    if (!values.endDate) {
      nextErrors.endDate = "End date is required.";
    }

    // Disallow selecting dates earlier than today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = parseDateInput(
      values.startDate as unknown as string | Date | null | undefined,
    );
    const end = parseDateInput(
      values.endDate as unknown as string | Date | null | undefined,
    );

    if (start && start < today) {
      nextErrors.startDate = "Start date cannot be earlier than today.";
    }

    if (end && end < today) {
      nextErrors.endDate = "End date cannot be earlier than today.";
    }

    if (start && end && start > end) {
      nextErrors.endDate = "End date must be after the start date.";
    }

    if (!values.reason.trim()) {
      nextErrors.reason = "Reason is required.";
    } else if (values.reason.trim().length > 200) {
      nextErrors.reason = "Reason must be 200 characters or less.";
    }

    return nextErrors;
  };

  const updateField = <K extends keyof LeaveFormValues>(
    field: K,
    value: LeaveFormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }) as LeaveFormValues);
  };

  const handleChange = (field: keyof LeaveFormValues, value: string) => {
    if (field === "startDate" || field === "endDate") {
      const parsed = value ? new Date(value) : null;
      updateField(field as "startDate" | "endDate", parsed);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }

    updateField(
      field as Exclude<keyof LeaveFormValues, "startDate" | "endDate">,
      value as LeaveFormValues[typeof field],
    );
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formValues,
        leaveType: formValues.leaveType.trim(),
        reason: formValues.reason.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitLocked ? undefined : onClose}
      title={title}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="leaveType"
            className="text-sm font-medium text-primary"
          >
            Leave Type
          </label>
          <select
            id="leaveType"
            value={formValues.leaveType}
            onChange={(event) => handleChange("leaveType", event.target.value)}
            disabled={submitLocked}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary outline-none transition focus:border-theme focus:ring-2 focus:ring-theme/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">Select leave type</option>
            {LEAVE_OPTIONS.map((option) => (
              <option key={option} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
          {errors.leaveType && (
            <p className="text-xs text-red-600">{errors.leaveType}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="startDate"
              className="text-sm font-medium text-primary"
            >
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={formatForInput(formValues.startDate)}
              onChange={(event) =>
                handleChange("startDate", event.target.value)
              }
              disabled={submitLocked}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary outline-none transition focus:border-theme focus:ring-2 focus:ring-theme/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
            {errors.startDate && (
              <p className="text-xs text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="endDate"
              className="text-sm font-medium text-primary"
            >
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={formatForInput(formValues.endDate)}
              onChange={(event) => handleChange("endDate", event.target.value)}
              disabled={submitLocked}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary outline-none transition focus:border-theme focus:ring-2 focus:ring-theme/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
            {errors.endDate && (
              <p className="text-xs text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reason" className="text-sm font-medium text-primary">
            Reason
          </label>
          <textarea
            id="reason"
            rows={4}
            maxLength={200}
            value={formValues.reason}
            onChange={(event) => handleChange("reason", event.target.value)}
            disabled={submitLocked}
            placeholder="Add a short reason for this leave request"
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary outline-none transition focus:border-theme focus:ring-2 focus:ring-theme/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <div className="flex items-center justify-between gap-3 text-xs text-secondary">
            {errors.reason ? (
              <span className="text-red-600">{errors.reason}</span>
            ) : (
              <span>Maximum 200 characters</span>
            )}
            <span>{formValues.reason.length}/200</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitLocked}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-secondary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLocked}
            className="rounded-lg bg-[#1aa6a2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#169295] disabled:cursor-not-allowed disabled:bg-[#7ec7c2]"
          >
            {submitLocked
              ? mode === "edit"
                ? "Saving..."
                : "Submitting..."
              : mode === "edit"
                ? "Save Changes"
                : "Submit Leave"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
