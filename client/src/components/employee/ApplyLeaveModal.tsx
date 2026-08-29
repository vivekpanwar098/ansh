"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

export type LeaveFormValues = {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
};

type ApplyLeaveModalProps = {
  open: boolean;
  mode?: "apply" | "edit";
  initialValues?: Partial<LeaveFormValues>;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: LeaveFormValues) => Promise<void> | void;
};

const DEFAULT_VALUES: LeaveFormValues = {
  leaveType: "",
  startDate: "",
  endDate: "",
  reason: "",
};

const LEAVE_OPTIONS = ["Casual", "Sick", "Earned", "Other"];

export default function ApplyLeaveModal({
  open,
  mode = "apply",
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: ApplyLeaveModalProps) {
  const [formValues, setFormValues] = useState<LeaveFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LeaveFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLocked = loading || isSubmitting;

  useEffect(() => {
    if (!open) return;

    setFormValues({
      ...DEFAULT_VALUES,
      ...initialValues,
    });
    setErrors({});
    setIsSubmitting(false);
  }, [open, initialValues]);

  const title = useMemo(
    () => (mode === "edit" ? "Edit Leave Request" : "Apply for Leave"),
    [mode],
  );

  const validateForm = (values: LeaveFormValues) => {
    const nextErrors: Partial<Record<keyof LeaveFormValues, string>> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseDate = (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      date.setHours(0, 0, 0, 0);
      return date;
    };

    if (!values.leaveType.trim()) {
      nextErrors.leaveType = "Leave type is required.";
    }

    if (!values.startDate) {
      nextErrors.startDate = "Start date is required.";
    } else {
      const startDate = parseDate(values.startDate);
      if (startDate && startDate < today && mode === "apply") {
        nextErrors.startDate = "Start date cannot be before today.";
      }

      if (startDate && startDate < today && mode === "edit") {
        nextErrors.startDate =
          "Edited leave request cannot start before today.";
      }
    }

    if (!values.endDate) {
      nextErrors.endDate = "End date is required.";
    } else {
      const endDate = parseDate(values.endDate);
      if (endDate && endDate < today && mode === "edit") {
        nextErrors.endDate = "Edited leave request cannot end before today.";
      }
    }

    if (
      values.startDate &&
      values.endDate &&
      parseDate(values.startDate) &&
      parseDate(values.endDate) &&
      parseDate(values.startDate)! > parseDate(values.endDate)!
    ) {
      nextErrors.endDate =
        "End date must be greater than or equal to the start date.";
    }

    if (!values.reason.trim()) {
      nextErrors.reason = "Reason is required.";
    } else if (values.reason.trim().length > 200) {
      nextErrors.reason = "Reason must be 200 characters or less.";
    }

    return nextErrors;
  };

  const handleChange = (field: keyof LeaveFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
              <option key={option} value={option}>
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
              value={formValues.startDate}
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
              value={formValues.endDate}
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
