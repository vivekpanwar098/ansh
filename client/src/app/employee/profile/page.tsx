"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Camera,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  profileService,
  MyProfile,
} from "@/features/employee/services/profile.service";
import { AxiosError } from "axios";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";
import { formatDate, getTimeFromDate } from "@/lib/utils/time";

const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<{ message?: string }>;
  return (
    axiosErr.response?.data?.message ||
    `${fallback} (status: ${axiosErr.response?.status ?? "network error"})`
  );
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Edit name/phone ──
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Avatar ──
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getMyProfile();
      setProfile(data);
      setNameInput(data.name);
      setPhoneInput(data.phone ?? "");
    } catch {
      toast.error("Profile could not be loaded. Please retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const startEditing = () => {
    if (!profile) return;
    setNameInput(profile.name);
    setPhoneInput(profile.phone ?? "");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!profile) return;
    setNameInput(profile.name);
    setPhoneInput(profile.phone ?? "");
    setEditing(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!nameInput.trim()) {
      alert("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const updated = await profileService.updateMyProfile({
        name: nameInput.trim(),
        phone: phoneInput.trim(),
      });
      setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditing(false);
      window.location.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const { avatarUrl } = await profileService.uploadAvatar(file);
      setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
      window.location.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload avatar"));
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return <Loader label="Loading Profile..." />;
  }

  if (error && !profile) {
    return (
      <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
        {error}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div
        className="rounded-2xl p-6 text-white shadow-sm flex items-center gap-5"
        style={{
          background: "linear-gradient(135deg, #18A096 0%, #12544F 100%)",
        }}
      >
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 flex items-center justify-center">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-9 w-9 text-white/80" />
            )}
          </div>
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={avatarUploading}
            aria-label="Change avatar"
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white text-[#12544F] flex items-center justify-center shadow-md hover:bg-white/90 active:scale-95 transition-all disabled:opacity-60"
          >
            {avatarUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-sm text-white/85 mt-1">{profile.email}</p>
          <span className="inline-block mt-2 rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold capitalize">
            {profile.role}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Personal details ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Personal Details</h2>
          {!editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#18A096] hover:text-[#12544F] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-8 w-8 rounded-full flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                )}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" /> Name
            </label>
            {editing ? (
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/40"
              />
            ) : (
              <p className="font-medium text-slate-700">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <p className="font-medium text-slate-700">{profile.email}</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Phone
            </label>
            {editing ? (
              <input
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Add phone number"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/40"
              />
            ) : (
              <p className="font-medium text-slate-700">
                {profile.phone || (
                  <span className="text-slate-400">Not set</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Work details (employee only) ── */}
      {profile.role === "employee" && profile.workDetails && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Briefcase className="h-4.5 w-4.5" /> Work Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-slate-400 text-xs mb-1">Department</p>
              <p className="font-medium text-slate-700">
                {profile.workDetails.department}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Designation</p>
              <p className="font-medium text-slate-700">
                {profile.workDetails.designation}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Join Date</p>
              <p className="font-medium text-slate-700">
                {formatDate(new Date(profile.workDetails.joinDate))}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Status</p>
              <span
                className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${
                  profile.workDetails.isActive
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                    : "bg-gray-100 text-gray-500 border border-gray-200/50"
                }`}
              >
                {profile.workDetails.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {profile.todayAttendance && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-slate-400 text-xs mb-2">
                Today&apos;s Attendance
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                <span>
                  Status:{" "}
                  <span className="font-medium capitalize">
                    {profile.todayAttendance.status ?? "—"}
                  </span>
                </span>
                <span>
                  Check-in:{" "}
                  <span className="font-medium">
                    {getTimeFromDate(profile.todayAttendance.checkIn) ?? "—"}
                  </span>
                </span>
                <span>
                  Check-out:{" "}
                  <span className="font-medium">
                    {profile.todayAttendance.checkOut
                      ? getTimeFromDate(profile.todayAttendance.checkOut)
                      : "—"}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
