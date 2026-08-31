"use client";

import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { WalletCards, CreditCard, Percent, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/axios";
import Loader from "@/components/ui/Loader";

type CardDataType = {
  month: number;
  year: number;
  netSalary: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
};

type EarningsType = {
  total: number;
  hra: number;
  basicSalary: number;
  bonus: number;
  other: number;
};

type DeductionType = {
  total: number;
  pf: number;
  tax: number;
  leave: number;
  other: number;
};

type Payslip = {
  id: string;
  month: number;
  year: number;
  grossSalary: number;
  paymentDate: Date;
  deductions: number;
  netSalary: number;
  status: string;
};

const COLORS = ["#18a096", "#60c5b4", "#9be3d9", "#e6f6f4", "#f6b26b"];

export default function EmployeePayroll() {
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<CardDataType>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    netSalary: 0,
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
  });
  const [earnings, setEarnings] = useState<EarningsType>({
    total: 0,
    hra: 0,
    basicSalary: 0,
    bonus: 0,
    other: 0,
  });
  const [deductions, setDeductions] = useState<DeductionType>({
    total: 0,
    pf: 0,
    tax: 0,
    leave: 0,
    other: 0,
  });

  const [payslips, setPayslips] = useState<Payslip[]>([]);

  const getPageData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/payroll/me/overview");
      setCardData(
        res.data.data.current || {
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
          netSalary: 0,
          basicSalary: 0,
          allowances: 0,
          deductions: 0,
        },
      );
      setEarnings(
        res.data.data.earnings || {
          total: 0,
          hra: 0,
          basicSalary: 0,
          bonus: 0,
          other: 0,
        },
      );
      setDeductions(
        res.data.data.deductions || {
          total: 0,
          pf: 0,
          tax: 0,
          leave: 0,
          other: 0,
        },
      );
      setPayslips(res.data.data.payslipHistory);
    } catch {
      toast.error("Failed to fetch page data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void getPageData();
  }, []);

  const currMonthYear = new Date(
    cardData?.year,
    cardData?.month - 1,
  ).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const earningsChart = Object.keys(earnings).map((key, i) => ({
    name: key,
    value: earnings[key as keyof EarningsType],
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <>
      <PageHeader title="My Payroll" />

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <section aria-labelledby="overview" className="mb-6 mt-6">
            <div id="overview" className="sr-only">
              Overview
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Net Salary"
                value={`₹ ${cardData.netSalary}`}
                description={currMonthYear}
                Icon={WalletCards}
                showGrowth={false}
              />
              <StatsCard
                title="Basic Salary"
                value={`₹ ${cardData.basicSalary}`}
                description={currMonthYear}
                Icon={CreditCard}
                showGrowth={false}
              />
              <StatsCard
                title="Allowances"
                value={`₹ ${cardData.allowances}`}
                description={currMonthYear}
                Icon={Percent}
                showGrowth={false}
              />
              <StatsCard
                title="Deductions"
                value={`₹ ${cardData.deductions}`}
                description={currMonthYear}
                Icon={FileText}
                showGrowth={false}
              />
            </div>
          </section>

          <section
            aria-labelledby="current-month"
            className="bg-white rounded-lg shadow p-4 mb-6"
          >
            <h2 id="current-month" className="sr-only">
              Current Month Salary
            </h2>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-1/3">
                <h3 className="font-semibold mb-3">Earnings</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {Object.keys(earnings).map((key) => (
                    <li key={key} className="flex justify-between">
                      <span className="uppercase">{key}</span>
                      <span className="font-medium">
                        {earnings[key as keyof EarningsType]}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between border-t pt-2 mt-2 font-semibold">
                    <span>Total Earnings</span>
                    <span>₹ {earnings.total}</span>
                  </li>
                </ul>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-md h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={earningsChart}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        label
                      />
                      <Tooltip />
                      <Legend position="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-sm text-gray-500">Net Salary</div>
                  <div className="text-lg font-semibold">
                    ₹ {earnings.total.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="lg:w-1/3">
                <h3 className="font-semibold mb-3">Deductions</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {Object.keys(deductions).map((key) => (
                    <li key={key} className="flex justify-between">
                      <span className="uppercase">{key}</span>
                      <span className="font-medium">
                        {deductions[key as keyof DeductionType]}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between border-t pt-2 mt-2 font-semibold text-red-600">
                    <span>Total Deductions</span>
                    <span>₹ {deductions.total.toLocaleString()}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="payslip-history"
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="payslip-history" className="font-semibold">
                Payslip History
              </h2>
            </div>

            {payslips.length === 0 ? (
              <div className="flex min-h-30 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-secondary">
                No payslips available yet.
              </div>
            ) : (
              <Table className="min-w-full text-sm">
                <THead>
                  <TR className="text-left text-gray-500">
                    <TH className="py-2 pr-6">Month</TH>
                    <TH className="py-2 pr-6">Gross Salary</TH>
                    <TH className="py-2 pr-6">Deductions</TH>
                    <TH className="py-2 pr-6">Net Salary</TH>
                    <TH className="py-2 pr-6">Status</TH>
                    {/* <TH className="py-2">Action</TH> */}
                  </TR>
                </THead>
                <TBody>
                  {payslips.map((h) => (
                    <TR key={h.month}>
                      <TD className="py-3 pr-6">{h.month}</TD>
                      <TD className="py-3 pr-6">
                        ₹ {h.grossSalary.toLocaleString()}
                      </TD>
                      <TD className="py-3 pr-6">
                        ₹ {h.deductions.toLocaleString()}
                      </TD>
                      <TD className="py-3 pr-6">
                        ₹ {h.netSalary.toLocaleString()}
                      </TD>
                      <TD
                        className={`py-3 pr-6 ${h.status === "Paid" ? "text-green-600" : "text-amber-500"}`}
                      >
                        {h.status}
                      </TD>
                      {/* <TD className="py-3">
                        <button className="bg-emerald-600 text-white px-3 py-1 rounded text-sm">
                          Download
                        </button>
                      </TD> */}
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </section>
        </>
      )}
    </>
  );
}
