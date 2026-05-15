import React, { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────

type ViewMode = "table" | "chart" | "forecast";
type RowType = "income" | "expense" | "total";

interface MonthData {
  plan: number;
  fact: number;
}

interface BudgetRow {
  id: string;
  label: string;
  type: RowType;
  months: MonthData[]; // 0=Jan … 4=May
}

interface Scenario {
  label: string;
  revenue: number;
  profit: number;
  margin: number;
  color: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const MONTH_LABELS = ["Янв", "Фев", "Мар", "Апр", "Май"];

const INITIAL_ROWS: BudgetRow[] = [
  {
    id: "rev_repair",
    label: "Выручка от ремонтов",
    type: "income",
    months: [
      { plan: 1_200_000, fact: 1_150_000 },
      { plan: 1_300_000, fact: 1_280_000 },
      { plan: 1_350_000, fact: 1_410_000 },
      { plan: 1_400_000, fact: 1_390_000 },
      { plan: 1_450_000, fact: 1_520_000 },
    ],
  },
  {
    id: "rev_service",
    label: "Выручка от ТО",
    type: "income",
    months: [
      { plan: 800_000, fact: 820_000 },
      { plan: 850_000, fact: 840_000 },
      { plan: 900_000, fact: 880_000 },
      { plan: 920_000, fact: 950_000 },
      { plan: 950_000, fact: 990_000 },
    ],
  },
  {
    id: "rev_install",
    label: "Выручка от монтажа",
    type: "income",
    months: [
      { plan: 600_000, fact: 550_000 },
      { plan: 650_000, fact: 670_000 },
      { plan: 700_000, fact: 720_000 },
      { plan: 750_000, fact: 710_000 },
      { plan: 800_000, fact: 830_000 },
    ],
  },
  {
    id: "rev_subscription",
    label: "Абонентские доходы",
    type: "income",
    months: [
      { plan: 300_000, fact: 310_000 },
      { plan: 310_000, fact: 315_000 },
      { plan: 320_000, fact: 325_000 },
      { plan: 330_000, fact: 335_000 },
      { plan: 340_000, fact: 348_000 },
    ],
  },
  {
    id: "exp_salary",
    label: "ЗП и надбавки",
    type: "expense",
    months: [
      { plan: 900_000, fact: 920_000 },
      { plan: 900_000, fact: 905_000 },
      { plan: 950_000, fact: 945_000 },
      { plan: 950_000, fact: 960_000 },
      { plan: 980_000, fact: 975_000 },
    ],
  },
  {
    id: "exp_tax",
    label: "ФСС/ПФР",
    type: "expense",
    months: [
      { plan: 270_000, fact: 276_000 },
      { plan: 270_000, fact: 271_500 },
      { plan: 285_000, fact: 283_500 },
      { plan: 285_000, fact: 288_000 },
      { plan: 294_000, fact: 292_500 },
    ],
  },
  {
    id: "exp_parts",
    label: "Запчасти и материалы",
    type: "expense",
    months: [
      { plan: 400_000, fact: 420_000 },
      { plan: 420_000, fact: 410_000 },
      { plan: 450_000, fact: 465_000 },
      { plan: 460_000, fact: 450_000 },
      { plan: 480_000, fact: 510_000 },
    ],
  },
  {
    id: "exp_fuel",
    label: "ГСМ",
    type: "expense",
    months: [
      { plan: 80_000, fact: 85_000 },
      { plan: 85_000, fact: 82_000 },
      { plan: 90_000, fact: 93_000 },
      { plan: 90_000, fact: 88_000 },
      { plan: 95_000, fact: 98_000 },
    ],
  },
  {
    id: "exp_rent",
    label: "Аренда",
    type: "expense",
    months: [
      { plan: 150_000, fact: 150_000 },
      { plan: 150_000, fact: 150_000 },
      { plan: 150_000, fact: 150_000 },
      { plan: 150_000, fact: 150_000 },
      { plan: 150_000, fact: 150_000 },
    ],
  },
  {
    id: "exp_ads",
    label: "Реклама",
    type: "expense",
    months: [
      { plan: 100_000, fact: 95_000 },
      { plan: 110_000, fact: 115_000 },
      { plan: 120_000, fact: 118_000 },
      { plan: 120_000, fact: 122_000 },
      { plan: 130_000, fact: 128_000 },
    ],
  },
  {
    id: "exp_other",
    label: "Прочие расходы",
    type: "expense",
    months: [
      { plan: 60_000, fact: 65_000 },
      { plan: 65_000, fact: 62_000 },
      { plan: 70_000, fact: 72_000 },
      { plan: 70_000, fact: 68_000 },
      { plan: 75_000, fact: 78_000 },
    ],
  },
];

const FORECAST_DATA = [
  { month: "Янв", plan: 2_900_000, fact: 2_830_000, min: 2_700_000, max: 2_960_000 },
  { month: "Фев", plan: 3_110_000, fact: 3_105_000, min: 2_950_000, max: 3_260_000 },
  { month: "Мар", plan: 3_270_000, fact: 3_330_000, min: 3_150_000, max: 3_480_000 },
  { month: "Апр", plan: 3_400_000, fact: 3_385_000, min: 3_220_000, max: 3_560_000 },
  { month: "Май", plan: 3_540_000, fact: 3_688_000, min: 3_490_000, max: 3_880_000 },
  { month: "Июн", plan: 3_700_000, fact: null, min: 3_520_000, max: 3_910_000 },
  { month: "Июл", plan: 3_800_000, fact: null, min: 3_580_000, max: 4_050_000 },
  { month: "Авг", plan: 3_900_000, fact: null, min: 3_650_000, max: 4_180_000 },
  { month: "Сен", plan: 4_000_000, fact: null, min: 3_720_000, max: 4_310_000 },
  { month: "Окт", plan: 4_200_000, fact: null, min: 3_900_000, max: 4_530_000 },
  { month: "Ноя", plan: 4_100_000, fact: null, min: 3_800_000, max: 4_430_000 },
  { month: "Дек", plan: 4_300_000, fact: null, min: 3_980_000, max: 4_650_000 },
];

const SCENARIOS: Scenario[] = [
  {
    label: "Оптимистичный",
    revenue: 46_500_000,
    profit: 9_800_000,
    margin: 21.1,
    color: "#22c55e",
  },
  {
    label: "Базовый",
    revenue: 42_800_000,
    profit: 7_950_000,
    margin: 18.6,
    color: "#3b82f6",
  },
  {
    label: "Пессимистичный",
    revenue: 38_200_000,
    profit: 5_400_000,
    margin: 14.1,
    color: "#ef4444",
  },
];

const EXPENSE_STRUCTURE = [
  { name: "ЗП и ПФР", value: 30, color: "#6366f1" },
  { name: "Запчасти", value: 22, color: "#f59e0b" },
  { name: "Аренда", value: 10, color: "#10b981" },
  { name: "ГСМ", value: 7, color: "#3b82f6" },
  { name: "Реклама", value: 8, color: "#ec4899" },
  { name: "Прочее", value: 23, color: "#8b5cf6" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(v);

const fmtShort = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)} тыс`;
  return String(v);
};

function calcTotals(rows: BudgetRow[]) {
  const incomeRows = rows.filter((r) => r.type === "income");
  const expenseRows = rows.filter((r) => r.type === "expense");

  const sumRow = (acc: MonthData[], r: BudgetRow): MonthData[] =>
    r.months.map((m, i) => ({
      plan: (acc[i]?.plan ?? 0) + m.plan,
      fact: (acc[i]?.fact ?? 0) + m.fact,
    }));

  const incomePlan = incomeRows.reduce(sumRow, Array(5).fill({ plan: 0, fact: 0 }));
  const expensePlan = expenseRows.reduce(sumRow, Array(5).fill({ plan: 0, fact: 0 }));

  const totalMonths: MonthData[] = incomePlan.map((inc, i) => ({
    plan: inc.plan - expensePlan[i].plan,
    fact: inc.fact - expensePlan[i].fact,
  }));

  const totalPlan = totalMonths.reduce((s, m) => s + m.plan, 0);
  const totalFact = totalMonths.reduce((s, m) => s + m.fact, 0);

  const totalIncomePlan = incomePlan.reduce((s, m) => s + m.plan, 0);
  const totalIncomeFact = incomePlan.reduce((s, m) => s + m.fact, 0);

  return { totalMonths, totalPlan, totalFact, totalIncomePlan, totalIncomeFact };
}

// ─── Sub-components ────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  sub,
  icon,
  positive,
  neutral,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  const color = neutral
    ? "text-blue-600"
    : positive === true
    ? "text-green-600"
    : "text-red-600";

  const bg = neutral
    ? "bg-blue-50"
    : positive === true
    ? "bg-green-50"
    : "bg-red-50";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <span className={`${bg} p-2 rounded-lg`}>
          <Icon name={icon} size={18} className={color} />
        </span>
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function EditableCell({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(value));

  const commit = () => {
    const parsed = parseInt(raw.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) onChange(parsed);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        className="w-full border border-blue-400 rounded px-1 py-0.5 text-xs text-right focus:outline-none"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
    );
  }

  return (
    <button
      className="group w-full text-right text-xs text-gray-700 hover:text-blue-600 flex items-center justify-end gap-1"
      onClick={() => {
        setRaw(String(value));
        setEditing(true);
      }}
    >
      {fmtShort(value)}
      <Icon
        name="Edit"
        size={11}
        className="opacity-0 group-hover:opacity-60 transition-opacity"
      />
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function BudgetPlanning() {
  const [view, setView] = useState<ViewMode>("table");
  const [rows, setRows] = useState<BudgetRow[]>(INITIAL_ROWS);
  const [approved, setApproved] = useState(false);

  const updatePlan = useCallback(
    (rowId: string, monthIdx: number, value: number) => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          const months = r.months.map((m, i) =>
            i === monthIdx ? { ...m, plan: value } : m
          );
          return { ...r, months };
        })
      );
    },
    []
  );

  const { totalMonths, totalPlan, totalFact, totalIncomePlan, totalIncomeFact } =
    calcTotals(rows);

  const yearBudget = rows
    .filter((r) => r.type === "income")
    .flatMap((r) => r.months)
    .reduce((s, m) => s + m.plan, 0) * 2.4; // extrapolate 5m → 12m

  const yearFact = totalIncomeFact;
  const deviation = yearFact - totalIncomePlan;
  const deviationPct =
    totalIncomePlan > 0 ? (deviation / totalIncomePlan) * 100 : 0;
  const forecast = totalIncomeFact * (12 / 5);

  // Chart data — plan vs fact revenue by month
  const revenueChartData = MONTH_LABELS.map((month, i) => {
    const incPlan = rows
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + r.months[i].plan, 0);
    const incFact = rows
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + r.months[i].fact, 0);
    return { month, plan: incPlan, fact: incFact };
  });

  const expenseChartData = MONTH_LABELS.map((month, i) => {
    const exp = rows
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + r.months[i].fact, 0);
    return { month, value: exp };
  });

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бюджетирование</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Финансовое планирование — 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => alert("Экспорт в Excel...")}
          >
            <Icon name="FileSpreadsheet" size={15} />
            Экспорт Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => alert("Формирование отчёта...")}
          >
            <Icon name="ChevronDown" size={15} />
            Сформировать отчёт
          </Button>
          <Button
            size="sm"
            className={`flex items-center gap-2 ${
              approved
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            onClick={() => setApproved((v) => !v)}
          >
            <Icon name="Check" size={15} />
            {approved ? "Бюджет утверждён" : "Утвердить бюджет"}
          </Button>
        </div>
      </div>

      {approved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm">
          <Icon name="Check" size={15} />
          Бюджет утверждён и зафиксирован. Редактирование заблокировано.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="Бюджет (план)"
          value={fmt(totalIncomePlan)}
          sub="Янв — Май 2026"
          icon="Target"
          neutral
        />
        <KpiCard
          title="Факт"
          value={fmt(totalIncomeFact)}
          sub="Янв — Май 2026"
          icon="DollarSign"
          positive={totalIncomeFact >= totalIncomePlan}
        />
        <KpiCard
          title="Отклонение"
          value={fmt(deviation)}
          sub={`${deviationPct >= 0 ? "+" : ""}${deviationPct.toFixed(1)}% от плана`}
          icon={deviation >= 0 ? "TrendingUp" : "TrendingDown"}
          positive={deviation >= 0}
        />
        <KpiCard
          title="Прогноз на год"
          value={fmt(forecast)}
          sub="Экстраполяция тренда"
          icon="BarChart3"
          positive={forecast >= yearBudget}
        />
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit shadow-sm">
        {(
          [
            { id: "table", label: "Таблица", icon: "FileSpreadsheet" },
            { id: "chart", label: "График", icon: "BarChart3" },
            { id: "forecast", label: "Прогноз", icon: "LineChart" },
          ] as { id: ViewMode; label: string; icon: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TABLE VIEW ─────────────────────────────────────────────────────── */}
      {view === "table" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-48 sticky left-0 bg-gray-50">
                  Статья
                </th>
                <th className="text-center px-2 py-3 font-semibold text-gray-600 w-20">
                  Тип
                </th>
                {MONTH_LABELS.map((m) => (
                  <th
                    key={m}
                    colSpan={2}
                    className="text-center px-2 py-3 font-semibold text-gray-600 border-l border-gray-100"
                  >
                    {m}
                  </th>
                ))}
                <th className="text-right px-3 py-3 font-semibold text-gray-600 border-l border-gray-200">
                  Итого план
                </th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">
                  Итого факт
                </th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">
                  Откл %
                </th>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="sticky left-0 bg-gray-50/50" />
                <th />
                {MONTH_LABELS.map((m) => (
                  <React.Fragment key={m}>
                    <th className="text-center py-1 text-gray-400 font-normal border-l border-gray-100">
                      план
                    </th>
                    <th className="text-center py-1 text-gray-400 font-normal">
                      факт
                    </th>
                  </React.Fragment>
                ))}
                <th />
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const totalP = row.months.reduce((s, m) => s + m.plan, 0);
                const totalF = row.months.reduce((s, m) => s + m.fact, 0);
                const pct =
                  totalP > 0
                    ? ((totalF - totalP) / totalP) * 100
                    : 0;
                const pctPos = row.type === "income" ? pct >= 0 : pct <= 0;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-2 text-gray-800 font-medium sticky left-0 bg-white">
                      {row.label}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          row.type === "income"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.type === "income" ? "Доход" : "Расход"}
                      </span>
                    </td>
                    {row.months.map((m, mi) => (
                      <React.Fragment key={mi}>
                        <td className="px-2 py-2 border-l border-gray-100">
                          {approved ? (
                            <span className="text-gray-700 text-xs block text-right">
                              {fmtShort(m.plan)}
                            </span>
                          ) : (
                            <EditableCell
                              value={m.plan}
                              onChange={(v) => updatePlan(row.id, mi, v)}
                            />
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className={`block text-right text-xs ${
                              row.type === "income"
                                ? m.fact >= m.plan
                                  ? "text-green-600"
                                  : "text-red-500"
                                : m.fact <= m.plan
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {fmtShort(m.fact)}
                          </span>
                        </td>
                      </React.Fragment>
                    ))}
                    <td className="px-3 py-2 text-right text-gray-700 font-medium border-l border-gray-200">
                      {fmtShort(totalP)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700">
                      {fmtShort(totalF)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${
                        pctPos ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {pct >= 0 ? "+" : ""}
                      {pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}

              {/* ИТОГО row */}
              <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                <td className="px-4 py-3 text-gray-900 sticky left-0 bg-gray-100">
                  ИТОГО
                </td>
                <td className="px-2 py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                    Прибыль
                  </span>
                </td>
                {totalMonths.map((m, i) => (
                  <React.Fragment key={i}>
                    <td className="px-2 py-3 text-right border-l border-gray-300 text-gray-800">
                      {fmtShort(m.plan)}
                    </td>
                    <td
                      className={`px-2 py-3 text-right ${
                        m.fact >= m.plan ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {fmtShort(m.fact)}
                    </td>
                  </React.Fragment>
                ))}
                <td className="px-3 py-3 text-right text-gray-900 border-l border-gray-300">
                  {fmtShort(totalPlan)}
                </td>
                <td
                  className={`px-3 py-3 text-right ${
                    totalFact >= totalPlan ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {fmtShort(totalFact)}
                </td>
                <td
                  className={`px-3 py-3 text-right ${
                    totalFact >= totalPlan ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {totalPlan > 0
                    ? `${((totalFact - totalPlan) / totalPlan) * 100 >= 0 ? "+" : ""}${(
                        ((totalFact - totalPlan) / totalPlan) *
                        100
                      ).toFixed(1)}%`
                    : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── CHART VIEW ─────────────────────────────────────────────────────── */}
      {view === "chart" && (
        <div className="grid grid-cols-2 gap-4">
          {/* Area chart — revenue plan vs fact */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Выручка: план vs факт
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="factGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}м`}
                />
                <Tooltip
                  formatter={(v: number) => fmt(v)}
                  labelStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="plan"
                  name="План"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#planGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="fact"
                  name="Факт"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#factGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart — expense structure */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Расходы по месяцам (факт)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={expenseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}м`}
                />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="value" name="Расходы" radius={[4, 4, 0, 0]}>
                  {expenseChartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`hsl(${220 + i * 8}, 70%, ${55 + i * 3}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Pie — expense structure */}
            <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">
              Структура расходов
            </h3>
            <div className="flex items-center gap-4">
              <PieChart width={130} height={130}>
                <Pie
                  data={EXPENSE_STRUCTURE}
                  cx={60}
                  cy={60}
                  innerRadius={35}
                  outerRadius={60}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {EXPENSE_STRUCTURE.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
              <div className="flex flex-col gap-1">
                {EXPENSE_STRUCTURE.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ background: d.color }}
                    />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-semibold text-gray-800">
                      {d.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FORECAST VIEW ──────────────────────────────────────────────────── */}
      {view === "forecast" && (
        <div className="flex flex-col gap-4">
          {/* Trend chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Тренд выручки с доверительным интервалом (90%)
              </h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-blue-500" />
                  план
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-green-500" />
                  факт
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-orange-400 border-dashed" />
                  интервал min/max
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={FORECAST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}м`}
                />
                <Tooltip
                  formatter={(v: number | null) =>
                    v !== null ? fmt(v) : "—"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="min"
                  name="Min (90%)"
                  stroke="#f97316"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="max"
                  name="Max (90%)"
                  stroke="#f97316"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="plan"
                  name="План"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="fact"
                  name="Факт"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Scenarios */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="AlertCircle" size={16} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                Сценарный анализ на 2026 год
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {SCENARIOS.map((sc) => (
                <div
                  key={sc.label}
                  className="rounded-xl border-2 p-4 flex flex-col gap-3"
                  style={{ borderColor: sc.color + "55" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: sc.color }}
                    />
                    <span
                      className="font-semibold text-sm"
                      style={{ color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Выручка</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {fmtShort(sc.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Прибыль</span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: sc.color }}
                      >
                        {fmtShort(sc.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Маржинальность
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: sc.color }}
                      >
                        {sc.margin}%
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-2 rounded-full mt-1"
                    style={{ background: sc.color + "33" }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        background: sc.color,
                        width: `${sc.margin * 4}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Assumptions */}
            <div className="mt-5 border-t border-gray-100 pt-4 grid grid-cols-3 gap-3">
              {[
                {
                  label: "Оптимистичный",
                  text: "Рост рынка +15%, расширение штата на 3 инженеров, успешный запуск абонентских пакетов",
                  color: "#22c55e",
                },
                {
                  label: "Базовый",
                  text: "Умеренный рост +8%, удержание ключевых клиентов, плановые инвестиции в рекламу",
                  color: "#3b82f6",
                },
                {
                  label: "Пессимистичный",
                  text: "Замедление рынка, потеря 2 крупных договоров, рост стоимости запчастей +20%",
                  color: "#ef4444",
                },
              ].map((s) => (
                <div key={s.label} className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-semibold" style={{ color: s.color }}>
                    {s.label}:{" "}
                  </span>
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
