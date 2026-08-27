export type Payslip = {
  id: string;
  netSalary: string;
  status: "Paid" | "Pending";
  createdAt: Date;
};

type EmployeeMyPayslipPanelProps = {
  payslips: Payslip[];
};

export default function EmployeeMyPayslipPanel({
  payslips,
}: EmployeeMyPayslipPanelProps) {
  return (
    <div className="h-full w-full rounded-[22px] bg-white p-4 sm:p-5 shadow-[0_8px_18px_rgba(23,33,38,0.04)] flex flex-col">
      <h2 className="mb-4 text-base text-primary">My Payslips</h2>

      {payslips.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-secondary">
          No payslips available yet.
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {payslips.map((payslip) => {
            const formattedMonthYear = new Date(
              payslip.createdAt,
            ).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });

            return (
              <div
                key={payslip.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-gray-100 px-4 py-3 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary leading-tight">
                    {formattedMonthYear}
                  </p>
                  <p className="text-[14px] text-secondary">Net pay</p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <p className="text-xs font-semibold text-primary whitespace-nowrap">
                    {payslip.netSalary}
                  </p>

                  <span
                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs whitespace-nowrap ${
                      payslip.status === "Paid"
                        ? "border-[#4fc6b1] bg-[#dffef7] text-[#0f9b8a]"
                        : "border-[#f7d7a5] bg-[#fff4d6] text-[#c98a00]"
                    }`}
                  >
                    {payslip.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
