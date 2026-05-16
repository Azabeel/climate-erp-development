import React, { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────

type Period = "2025" | "2026";

type RowKind = "income" | "expense" | "total";

interface BudgetRow {
  id: string;
  label: string;
  kind: RowKind;
  annualBudget: number;
  months: number[]; // 0=Jan … 4=May (fact)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtShort = (v: number): string => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}М`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}К`;
  return String(v);
};

const pctColor = (pct: number): string => {
  if (pct >= 90) return "text-green-600";
  if (pct >= 70) return "text-yellow-600";
  return "text-red-600";
};

// ─── Static data ─────────────────────────────────────────────────────────────

const MONTHS_SHORT = ["Янв", "Фев", "Мар", "Апр", "Май"];
// Plan vs Fact / Forecast for 12 months
const MONTHLY_CHART_DATA = [
  { month: "Янв", plan: 3_200_000, fact: 3_050_000, forecast: null },
  { month: "Фев", plan: 3_400_000, fact: 3_380_000, forecast: null },
  { month: "Мар", plan: 3_600_000, fact: 3_720_000, forecast: null },
  { month: "Апр", plan: 3_700_000, fact: 3_680_000, forecast: null },
  { month: "Май", plan: 3_800_000, fact: 3_870_000, forecast: null },
  { month: "Июн", plan: 3_900_000, fact: null, forecast: 3_750_000 },
  { month: "Июл", plan: 3_700_000, fact: null, forecast: 3_600_000 },
  { month: "Авг", plan: 3_500_000, fact: null, forecast: 3_400_000 },
  { month: "Сен", plan: 3_600_000, fact: null, forecast: 3_500_000 },
  { month: "Окт", plan: 3_800_000, fact: null, forecast: 3_700_000 },
  { month: "Ноя", plan: 3_500_000, fact: null, forecast: 3_400_000 },
  { month: "Дек", plan: 3_300_000, fact: null, forecast: 3_150_000 },
];

// Quarterly profit forecast
const QUARTERLY_DATA = [
  { quarter: "Q1 2026", factProfit: 1_850_000, planProfit: 2_000_000 },
  { quarter: "Q2 2026", factProfit: 1_920_000, planProfit: 2_100_000 },
  { quarter: "Q3 2026", factProfit: null, planProfit: 1_950_000 },
  { quarter: "Q4 2026", factProfit: null, planProfit: 2_200_000 },
];

const BREAKEVEN = 1_500_000;

// Initial budget rows
const makeRows = (): BudgetRow[] => [
  {
    id: "rev_repair",
    label: "Выручка от ремонтов",
    kind: "income",
    annualBudget: 16_800_000,
    months: [1_150_000, 1_280_000, 1_410_000, 1_390_000, 1_520_000],
  },
  {
    id: "rev_to",
    label: "Выручка от ТО",
    kind: "income",
    annualBudget: 10_800_000,
    months: [820_000, 840_000, 880_000, 950_000, 990_000],
  },
  {
    id: "rev_install",
    label: "Выручка от монтажей",
    kind: "income",
    annualBudget: 9_600_000,
    months: [550_000, 620_000, 780_000, 890_000, 1_050_000],
  },
  {
    id: "rev_sub",
    label: "Выручка от абонементов",
    kind: "income",
    annualBudget: 5_300_000,
    months: [420_000, 430_000, 440_000, 450_000, 460_000],
  },
  {
    id: "exp_eng_fot",
    label: "ФОТ инженеров",
    kind: "expense",
    annualBudget: 14_400_000,
    months: [1_180_000, 1_200_000, 1_220_000, 1_250_000, 1_280_000],
  },
  {
    id: "exp_off_fot",
    label: "ФОТ офиса",
    kind: "expense",
    annualBudget: 6_000_000,
    months: [490_000, 495_000, 500_000, 505_000, 510_000],
  },
  {
    id: "exp_materials",
    label: "Материалы и ЗИП",
    kind: "expense",
    annualBudget: 8_400_000,
    months: [650_000, 700_000, 780_000, 830_000, 920_000],
  },
  {
    id: "exp_fuel",
    label: "ГСМ и транспорт",
    kind: "expense",
    annualBudget: 1_800_000,
    months: [140_000, 145_000, 155_000, 160_000, 165_000],
  },
  {
    id: "exp_rent",
    label: "Аренда и коммунальные",
    kind: "expense",
    annualBudget: 2_400_000,
    months: [200_000, 200_000, 200_000, 200_000, 200_000],
  },
  {
    id: "exp_marketing",
    label: "Маркетинг",
    kind: "expense",
    annualBudget: 1_200_000,
    months: [95_000, 98_000, 105_000, 110_000, 115_000],
  },
  {
    id: "exp_other",
    label: "Прочие расходы",
    kind: "expense",
    annualBudget: 900_000,
    months: [72_000, 74_000, 76_000, 78_000, 80_000],
  },
];

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  iconBg: string;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon, label, value, sub, subColor, iconBg, iconColor,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon name={icon} size={18} className={iconColor} />
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {sub && (
      <div className={`text-sm font-medium ${subColor ?? "text-gray-500"}`}>
        {sub}
      </div>
    )}
  </div>
);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <div className="font-semibold text-gray-700 mb-2">{label}</div>
      {payload.map((entry: any) => (
        entry.value != null && (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ background: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold text-gray-800">
              {fmtShort(entry.value)} ₽
            </span>
          </div>
        )
      ))}
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

const BudgetPlanningFull: React.FC = () => {
  const [period, setPeriod] = useState<Period>("2026");
  const [rows, setRows] = useState<BudgetRow[]>(makeRows);

  // Derived totals
  const incomeRows = rows.filter((r) => r.kind === "income");
  const expenseRows = rows.filter((r) => r.kind === "expense");

  const totalIncomeBudget = incomeRows.reduce((s, r) => s + r.annualBudget, 0);
  const totalExpenseBudget = expenseRows.reduce((s, r) => s + r.annualBudget, 0);
  const profitBudget = totalIncomeBudget - totalExpenseBudget;

  const totalIncomeMonths = MONTHS_SHORT.map((_, mi) =>
    incomeRows.reduce((s, r) => s + (r.months[mi] ?? 0), 0)
  );
  const totalExpenseMonths = MONTHS_SHORT.map((_, mi) =>
    expenseRows.reduce((s, r) => s + (r.months[mi] ?? 0), 0)
  );
  const profitMonths = MONTHS_SHORT.map((_, mi) => totalIncomeMonths[mi] - totalExpenseMonths[mi]);

  const totalIncomeYTD = totalIncomeMonths.reduce((s, v) => s + v, 0);
  const totalExpenseYTD = totalExpenseMonths.reduce((s, v) => s + v, 0);
  const profitYTD = totalIncomeYTD - totalExpenseYTD;

  // Edit handler
  const handleCellChange = useCallback(
    (rowId: string, monthIdx: number, rawValue: string) => {
      const num = parseFloat(rawValue.replace(/\s/g, "")) || 0;
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? {
                ...r,
                months: r.months.map((v, i) => (i === monthIdx ? num : v)),
              }
            : r
        )
      );
    },
    []
  );

  const handleCellBlur = useCallback(() => {
    toast.success("Сохранено");
  }, []);

  // ─── Render rows ───────────────────────────────────────────────────────────

  const renderDataRow = (row: BudgetRow) => {
    const ytd = row.months.reduce((s, v) => s + v, 0);
    const pct = row.annualBudget > 0 ? Math.round((ytd / row.annualBudget) * 100) : 0;

    return (
      <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
        <td className="py-2 px-3 text-sm text-gray-700 min-w-[200px] sticky left-0 bg-white">
          {row.label}
        </td>
        <td className="py-2 px-3 text-sm text-gray-800 text-right font-medium whitespace-nowrap">
          {fmtShort(row.annualBudget)} ₽
        </td>
        {MONTHS_SHORT.map((_, mi) => (
          <td key={mi} className="py-1.5 px-2 text-right">
            <Input
              type="number"
              defaultValue={row.months[mi]}
              className="w-24 h-7 text-xs text-right px-2 py-0 border-gray-200 focus:border-blue-400"
              onBlur={(e) => {
                handleCellChange(row.id, mi, e.target.value);
                handleCellBlur();
              }}
            />
          </td>
        ))}
        <td className="py-2 px-3 text-sm text-right font-semibold text-gray-800 whitespace-nowrap">
          {fmtShort(ytd)} ₽
        </td>
        <td className="py-2 px-3 text-right">
          <span className={`text-sm font-bold ${pctColor(pct)}`}>{pct}%</span>
        </td>
      </tr>
    );
  };

  const renderTotalRow = (
    label: string,
    budget: number,
    monthTotals: number[],
    ytd: number,
    highlight?: string
  ) => {
    const pct = budget > 0 ? Math.round((ytd / budget) * 100) : 0;
    return (
      <tr className={`border-b border-gray-200 ${highlight ?? "bg-gray-50"}`}>
        <td className={`py-3 px-3 text-sm font-bold sticky left-0 ${highlight ?? "bg-gray-50"} text-gray-900`}>
          {label}
        </td>
        <td className="py-3 px-3 text-sm font-bold text-right text-gray-900 whitespace-nowrap">
          {fmtShort(budget)} ₽
        </td>
        {monthTotals.map((v, i) => (
          <td key={i} className="py-3 px-3 text-sm font-bold text-right text-gray-900 whitespace-nowrap">
            {fmtShort(v)} ₽
          </td>
        ))}
        <td className="py-3 px-3 text-sm font-bold text-right text-gray-900 whitespace-nowrap">
          {fmtShort(ytd)} ₽
        </td>
        <td className="py-3 px-3 text-right">
          <span className={`text-sm font-bold ${pctColor(pct)}`}>{pct}%</span>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Icon name="BarChart3" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Бюджетирование и финансовое планирование
            </h1>
            <p className="text-sm text-gray-500">
              Управление бюджетом, план-факт анализ, прогнозирование
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period switcher */}
          <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
            {(["2025", "2026"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 text-sm font-semibold transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => toast.success("Сохранение бюджета...", { description: "Данные сохранены" })}
          >
            <Icon name="Save" size={15} />
            Сохранить бюджет
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => toast.success("Экспорт в Excel", { description: "Файл budget_2026.xlsx загружается" })}
          >
            <Icon name="Download" size={15} />
            Экспорт Excel
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() =>
              toast.success("Бюджет утверждён", {
                description: `Бюджет на ${period} год утверждён и зафиксирован`,
              })
            }
          >
            <Icon name="CheckCircle" size={15} />
            Утвердить
          </Button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon="Target"
          label={`Бюджет ${period}`}
          value="42.5М ₽"
          sub="Утверждён советом директоров"
          subColor="text-gray-500"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          icon="TrendingUp"
          label="Факт YTD (янв–май)"
          value="18.7М ₽"
          sub="44% от годового плана"
          subColor="text-blue-600"
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          icon="AlertTriangle"
          label="Отклонение"
          value="-2.3М ₽"
          sub="−5.4% к плану"
          subColor="text-red-600"
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <MetricCard
          icon="Calendar"
          label="Прогноз года"
          value="38.2М ₽"
          sub="−10% к бюджету"
          subColor="text-orange-500"
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
      </div>

      {/* ── ComposedChart Plan vs Fact ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Icon name="BarChart2" size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">
              План vs Факт — {period} год (помесячно)
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />
              План
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
              Факт
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-orange-400 inline-block border-dashed" />
              Прогноз
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={MONTHLY_CHART_DATA} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}М`}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="plan" name="План" fill="#d1d5db" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="fact" name="Факт" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Line
              dataKey="forecast"
              name="Прогноз"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Budget Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <Icon name="Table" size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">
            Бюджет по статьям — {period} год
          </h2>
          <Badge variant="secondary" className="ml-auto text-xs">
            Янв–Май: редактируемые значения
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 min-w-[200px] sticky left-0 bg-gray-50">
                  Статья
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 whitespace-nowrap">
                  Бюджет год
                </th>
                {MONTHS_SHORT.map((m) => (
                  <th key={m} className="py-3 px-3 text-right text-xs font-semibold text-gray-600">
                    {m}
                  </th>
                ))}
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 whitespace-nowrap">
                  Факт YTD
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 whitespace-nowrap">
                  % вып.
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Income section */}
              <tr className="bg-blue-50/60">
                <td
                  colSpan={9}
                  className="py-2 px-3 text-xs font-bold text-blue-700 uppercase tracking-wide"
                >
                  Доходы
                </td>
              </tr>
              {incomeRows.map(renderDataRow)}
              {renderTotalRow(
                "ИТОГО Выручка",
                totalIncomeBudget,
                totalIncomeMonths,
                totalIncomeYTD,
                "bg-blue-50"
              )}

              {/* Expense section */}
              <tr className="bg-red-50/60">
                <td
                  colSpan={9}
                  className="py-2 px-3 text-xs font-bold text-red-700 uppercase tracking-wide"
                >
                  Расходы
                </td>
              </tr>
              {expenseRows.map(renderDataRow)}
              {renderTotalRow(
                "ИТОГО Расходы",
                totalExpenseBudget,
                totalExpenseMonths,
                totalExpenseYTD,
                "bg-red-50"
              )}

              {/* Profit row */}
              {renderTotalRow(
                "ПРИБЫЛЬ",
                profitBudget,
                profitMonths,
                profitYTD,
                "bg-green-50"
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AreaChart Quarterly Profit Forecast ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" size={18} className="text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Прогноз прибыли — {period} год (квартальный)
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-400 inline-block opacity-60" />
              Прибыль факт
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-blue-500 inline-block" />
              Прибыль план
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-orange-400 inline-block border-dashed border-t-2" />
              Точка безубыточности
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={QUARTERLY_DATA}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}М`}
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine
              y={BREAKEVEN}
              stroke="#f97316"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: "Точка безубыточности",
                position: "insideTopRight",
                fontSize: 11,
                fill: "#f97316",
              }}
            />
            <Area
              type="monotone"
              dataKey="factProfit"
              name="Прибыль факт"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="url(#profitGradient)"
              dot={{ r: 5, fill: "#22c55e", strokeWidth: 0 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="planProfit"
              name="Прибыль план"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Quarterly summary cards */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {QUARTERLY_DATA.map((q) => {
            const isFact = q.factProfit != null;
            const profit = isFact ? q.factProfit! : q.planProfit;
            const pctOfPlan = Math.round((profit / q.planProfit) * 100);
            return (
              <div
                key={q.quarter}
                className={`rounded-xl border p-3 flex flex-col gap-1 ${
                  isFact ? "border-green-200 bg-green-50/40" : "border-gray-100 bg-gray-50/40"
                }`}
              >
                <span className="text-xs font-semibold text-gray-600">{q.quarter}</span>
                <span className="text-base font-bold text-gray-900">
                  {fmtShort(profit)} ₽
                </span>
                <div className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className={`text-xs px-1.5 py-0 ${
                      isFact ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isFact ? "Факт" : "Прогноз"}
                  </Badge>
                  <span className={`text-xs font-medium ${pctColor(pctOfPlan)}`}>
                    {pctOfPlan}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icon name="Info" size={15} className="text-blue-500" />
          Последнее обновление: сегодня в 09:42 · Ответственный: Иванова А.В.
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              toast.success("Экспорт в Excel", {
                description: "Файл budget_2026.xlsx загружается",
              })
            }
          >
            <Icon name="Download" size={14} />
            Экспорт Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              toast.success("Бюджет сохранён", {
                description: "Все изменения зафиксированы в системе",
              })
            }
          >
            <Icon name="Save" size={14} />
            Сохранить бюджет
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() =>
              toast.success("Бюджет утверждён", {
                description: `Бюджет на ${period} год утверждён и зафиксирован`,
              })
            }
          >
            <Icon name="CheckCircle" size={14} />
            Утвердить бюджет
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanningFull;
