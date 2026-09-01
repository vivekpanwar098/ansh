import api from "@/services/axios";

export interface WorkDetails {
  department: string;
  designation: string;
  joinDate: string;
  isActive: boolean;
}

export interface TodayAttendance {
  status?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  [key: string]: unknown;
}

export interface MyProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  workDetails: WorkDetails | null;
  todayAttendance: TodayAttendance | null;
}

export interface UpdatedProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  getMyProfile: async (): Promise<MyProfile> => {
    const res = await api.get<{ data: MyProfile }>("/profile");
    return res.data.data;
  },

  updateMyProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UpdatedProfile> => {
    const res = await api.patch<{ data: UpdatedProfile }>("/profile", payload);
    return res.data.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<{ data: { avatarUrl: string } }>(
      "/profile/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> => {
    const res = await api.patch<{ message: string }>(
      "/profile/password",
      payload,
    );
    return res.data;
  },
};
