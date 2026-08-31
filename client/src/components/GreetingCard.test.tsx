import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GreetingCard from "./GreetingCard";
import { AuthContext } from "@/context/AuthContext";
import type { User } from "@/lib/types/user";

const user: User = {
  id: "1",
  name: "Jane Doe",
  role: "employee",
  email: "jane@example.com",
};

describe("GreetingCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the current greeting and date based on the time of day", () => {
    vi.setSystemTime(new Date("2026-08-26T09:30:00"));

    render(
      <AuthContext.Provider
        value={{
          user,
          login: async () => {},
          logout: async () => {},
          isAuthLoading: false,
          isAuthReady: true,
          updateAvatar: async () => {},
          updateProfile: async () => {},
        }}
      >
        <GreetingCard />
      </AuthContext.Provider>,
    );

    const expectedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date("2026-08-26T09:30:00"));

    expect(screen.getByText(/good morning/i)).toBeInTheDocument();
    expect(screen.getByText(/jane/i)).toBeInTheDocument();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });
});
