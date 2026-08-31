import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import EmployeePayroll from "./page";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Pie: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const api = await import("@/services/axios");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("EmployeePayroll", () => {
  it("shows an empty-state message when there are no payslips", async () => {
    vi.spyOn(api.default, "get").mockResolvedValue({
      data: {
        data: {
          current: {
            month: 8,
            year: 2026,
            netSalary: 0,
            basicSalary: 0,
            allowances: 0,
            deductions: 0,
          },
          earnings: {
            total: 0,
            hra: 0,
            basicSalary: 0,
            bonus: 0,
            other: 0,
          },
          deductions: {
            total: 0,
            pf: 0,
            tax: 0,
            leave: 0,
            other: 0,
          },
          payslipHistory: [],
        },
      },
    });

    render(<EmployeePayroll />);

    await waitFor(() => {
      expect(
        screen.getByText("No payslips available yet."),
      ).toBeInTheDocument();
    });
  });
});
