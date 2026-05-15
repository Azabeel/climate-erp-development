import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type ActiveTab = 'budget' | 'forecast' | 'profitloss' | 'cashflow';
type PeriodType = 'month' | 'quarter' | 'ytd';

// ─── Budget Data ────────────────────────────────────────────────────────────

interface BudgetItem {
  name: string;
  group: 'income' | 'expense';
  planned: number[];  // 12 months
  actual: (number | null)[];  // Jan–May filled, rest null
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const BUDGET_ITEMS: BudgetItem[] = [
  {
    name: 'Ремонт',
    group: 'income',
    planned: [1200000, 1200000, 1400000, 1400000, 1500000, 1500000, 1600000, 1600000, 1500000, 1400000, 1300000, 1100000],
    actual: [1150000, 1280000, 1420000, 1390000, 1510000, null, null, null, null, null, null, null],
  },
  {
    name: 'ТО',
    group: 'income',
    planned: [600000, 600000, 700000, 700000, 800000, 900000, 900000, 800000, 700000, 700000, 650000, 600000],
    actual: [580000, 620000, 690000, 720000, 810000, null, null, null, null, null, null, null],
  },
  {
    name: 'Монтаж',
    group: 'income',
    planned: [400000, 400000, 500000, 600000, 700000, 800000, 800000, 700000, 600000, 500000, 400000, 300000],
    actual: [380000, 410000, 520000, 610000, 695000, null, null, null, null, null, null, null],
  },
  {
    name: 'ЗИП',
    group: 'income',
    planned: [300000, 300000, 320000, 350000, 380000, 400000, 400000, 380000, 350000, 330000, 300000, 280000],
    actual: [310000, 295000, 330000, 360000, 375000, null, null, null, null, null, null, null],
  },
  {
    name: 'Абонементы',
    group: 'income',
    planned: [180000, 180000, 180000, 200000, 200000, 220000, 220000, 220000, 200000, 200000, 180000, 180000],
    actual: [180000, 180000, 190000, 200000, 205000, null, null, null, null, null, null, null],
  },
  {
    name: 'ФОТ',
    group: 'expense',
    planned: [850000, 850000, 850000, 900000, 900000, 950000, 950000, 950000, 900000, 900000, 880000, 880000],
    actual: [855000, 852000, 858000, 905000, 910000, null, null, null, null, null, null, null],
  },
  {
    name: 'ЗИП закупка',
    group: 'expense',
    planned: [200000, 200000, 220000, 240000, 260000, 280000, 280000, 260000, 240000, 220000, 200000, 180000],
    actual: [210000, 195000, 225000, 248000, 255000, null, null, null, null, null, null, null],
  },
  {
    name: 'Аренда',
    group: 'expense',
    planned: [120000, 120000, 120000, 120000, 120000, 120000, 120000, 120000, 120000, 120000, 120000, 120000],
    actual: [120000, 120000, 120000, 120000, 120000, null, null, null, null, null, null, null],
  },
  {
    name: 'Транспорт',
    group: 'expense',
    planned: [80000, 80000, 90000, 100000, 110000, 120000, 120000, 110000, 100000, 90000, 85000, 80000],
    actual: [78000, 83000, 95000, 105000, 112000, null, null, null, null, null, null, null],
  },
  {
    name: 'Реклама',
    group: 'expense',
    planned: [60000, 60000, 70000, 80000, 80000, 90000, 90000, 80000, 70000, 70000, 60000, 50000],
    actual: [55000, 62000, 68000, 82000, 79000, null, null, null, null, null, null, null],
  },
  {
    name: 'Прочее',
    group: 'expense',
    planned: [50000, 50000, 55000, 60000, 65000, 70000, 70000, 65000, 60000, 55000, 52000, 50000],
    actual: [48000, 53000, 57000, 63000, 67000, null, null, null, null, null, null, null],
  },
];

// ─── Forecast Data ───────────────────────────────────────────────────────────

const FORECAST_DATA = [
  { month: 'Янв', fact: 2600000, forecast: null, type: 'fact' },
  { month: 'Фев', fact: 2785000, forecast: null, type: 'fact' },
  { month: 'Мар', fact: 3150000, forecast: null, type: 'fact' },
  { month: 'Апр', fact: 3280000, forecast: null, type: 'fact' },
  { month: 'Май', fact: 3595000, forecast: null, type: 'fact' },
  { month: 'Июн', fact: null, forecast: 3720000, type: 'forecast' },
  { month: 'Июл', fact: null, forecast: 3850000, type: 'forecast' },
  { month: 'Авг', fact: null, forecast: 3780000, type: 'forecast' },
  { month: 'Сен', fact: null, forecast: 3550000, type: 'forecast' },
  { month: 'Окт', fact: null, forecast: 3420000, type: 'forecast' },
  { month: 'Ноя', fact: null, forecast: 3180000, type: 'forecast' },
  { month: 'Дек', fact: null, forecast: 2960000, type: 'forecast' },
];

const SCENARIOS = [
  { label: 'Оптимистичный', annual: 44800000, color: 'text-green-600 bg-green-50 border-green-200', growth: '+18%' },
  { label: 'Базовый', annual: 41270000, color: 'text-blue-600 bg-blue-50 border-blue-200', growth: '+9%' },
  { label: 'Пессимистичный', annual: 36500000, color: 'text-red-600 bg-red-50 border-red-200', growth: '-4%' },
];

// ─── P&L Data ────────────────────────────────────────────────────────────────

interface PLLine {
  label: string;
  value: number;
  prevValue: number;
  bold?: boolean;
  indent?: boolean;
  separator?: boolean;
}

const PL_LINES_MONTH: PLLine[] = [
  { label: 'Выручка от ремонта', value: 1510000, prevValue: 1390000, indent: true },
  { label: 'Выручка от ТО', value: 810000, prevValue: 720000, indent: true },
  { label: 'Выручка от монтажа', value: 695000, prevValue: 610000, indent: true },
  { label: 'Продажа ЗИП', value: 375000, prevValue: 360000, indent: true },
  { label: 'Абонементы', value: 205000, prevValue: 200000, indent: true },
  { label: 'Валовая выручка', value: 3595000, prevValue: 3280000, bold: true, separator: true },
  { label: 'Себестоимость ЗИП', value: -255000, prevValue: -248000, indent: true },
  { label: 'Прямые расходы', value: -112000, prevValue: -105000, indent: true },
  { label: 'Валовая прибыль', value: 3228000, prevValue: 2927000, bold: true, separator: true },
  { label: 'ФОТ', value: -910000, prevValue: -905000, indent: true },
  { label: 'Аренда', value: -120000, prevValue: -120000, indent: true },
  { label: 'Реклама', value: -79000, prevValue: -82000, indent: true },
  { label: 'Прочие расходы', value: -67000, prevValue: -63000, indent: true },
  { label: 'EBITDA', value: 2052000, prevValue: 1757000, bold: true, separator: true },
  { label: 'Амортизация', value: -45000, prevValue: -45000, indent: true },
  { label: 'EBIT', value: 2007000, prevValue: 1712000, bold: true },
  { label: 'Проценты по кредитам', value: -18000, prevValue: -18000, indent: true },
  { label: 'Чистая прибыль', value: 1989000, prevValue: 1694000, bold: true, separator: true },
];

// ─── Cash Flow Data ──────────────────────────────────────────────────────────

const CASHFLOW_DATA = [
  { month: 'Янв', operating: 1800000, investing: -250000, financing: 0, balance: 4200000 },
  { month: 'Фев', operating: 1950000, investing: -100000, financing: 0, balance: 6050000 },
  { month: 'Мар', operating: 2300000, investing: -180000, financing: -500000, balance: 7670000 },
  { month: 'Апр', operating: 2400000, investing: -60000, financing: 0, balance: 10010000 },
  { month: 'Май', operating: 2650000, investing: -90000, financing: 0, balance: 12570000 },
  { month: 'Июн', operating: 2720000, investing: -200000, financing: 0, balance: 15090000 },
  { month: 'Июл', operating: 2800000, investing: -150000, financing: -600000, balance: 17140000 },
  { month: 'Авг', operating: 2750000, investing: -80000, financing: 0, balance: 19810000 },
  { month: 'Сен', operating: 2600000, investing: -120000, financing: 0, balance: 22290000 },
  { month: 'Окт', operating: 2500000, investing: -50000, financing: 0, balance: 24740000 },
  { month: 'Ноя', operating: 2300000, investing: -200000, financing: 0, balance: 26840000 },
  { month: 'Дек', operating: 2150000, investing: -300000, financing: -1000000, balance: 27690000 },
];

const UPCOMING_PAYMENTS = [
  { date: '16 мая', description: 'Оплата поставщику ЗИП — ООО МАКСклимат', amount: 185000, type: 'payable' },
  { date: '20 мая', description: 'Поступление от ТЦ Планета', amount: 480000, type: 'receivable' },
  { date: '22 мая', description: 'Аренда офиса и склада', amount: 120000, type: 'payable' },
  { date: '25 мая', description: 'Поступление от Отель Центральный', amount: 520000, type: 'receivable' },
  { date: '28 мая', description: 'ФОТ — аванс за май', amount: 455000, type: 'payable' },
  { date: '30 мая', description: 'Поступление от Клиника Здоровье', amount: 290000, type: 'receivable' },
  { date: '03 июн', description: 'Налоги и страховые взносы', amount: 320000, type: 'payable' },
  { date: '05 июн', description: 'Поступление от Завод Техмаш', amount: 750000, type: 'receivable' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('ru-RU');
}

function fmtShort(n: number): string {
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}М`;
  if (Math.abs(n) >= 1000) return `${Math.round(n / 1000)}к`;
  return String(n);
}

function cellColor(actual: number | null, planned: number): string {
  if (actual === null) return 'text-gray-400';
  if (actual >= planned) return 'text-green-600 font-medium';
  if (actual < planned * 0.9) return 'text-red-600 font-medium';
  return 'text-gray-600';
}

function varianceArrow(value: number, prev: number) {
  const diff = value - prev;
  const pct = prev !== 0 ? Math.round((diff / Math.abs(prev)) * 100) : 0;
  if (diff > 0) return <span className="text-green-600 text-xs">▲ {pct}%</span>;
  if (diff < 0) return <span className="text-red-600 text-xs">▼ {Math.abs(pct)}%</span>;
  return <span className="text-gray-400 text-xs">— 0%</span>;
}

const tooltipStyle = { fontSize: 12, borderRadius: 8 };

// ─── Sub-components ──────────────────────────────────────────────────────────

function BudgetTab() {
  const incomeItems = BUDGET_ITEMS.filter((i) => i.group === 'income');
  const expenseItems = BUDGET_ITEMS.filter((i) => i.group === 'expense');

  function rowTotals(items: BudgetItem[], mIdx: number) {
    const planned = items.reduce((s, i) => s + i.planned[mIdx], 0);
    const actual = items.reduce((s, i) => s + (i.actual[mIdx] ?? 0), 0);
    const hasActual = items.some((i) => i.actual[mIdx] !== null);
    return { planned, actual: hasActual ? actual : null };
  }

  function renderRow(item: BudgetItem, idx: number) {
    return (
      <tr key={idx} className="border-b hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-gray-700 sticky left-0 bg-white whitespace-nowrap">
          {item.name}
        </td>
        {MONTHS.map((_, mIdx) => {
          const p = item.planned[mIdx];
          const a = item.actual[mIdx];
          return (
            <td key={mIdx} className="px-2 py-2 text-right text-xs min-w-[80px]">
              <div className="text-gray-500">{fmtShort(p)}</div>
              {a !== null && (
                <div className={cellColor(a, p)}>{fmtShort(a)}</div>
              )}
            </td>
          );
        })}
      </tr>
    );
  }

  function renderTotalRow(label: string, items: BudgetItem[]) {
    return (
      <tr className="bg-gray-100 border-b font-semibold">
        <td className="px-3 py-2 text-sm text-gray-800 sticky left-0 bg-gray-100">{label}</td>
        {MONTHS.map((_, mIdx) => {
          const { planned, actual } = rowTotals(items, mIdx);
          return (
            <td key={mIdx} className="px-2 py-2 text-right text-xs">
              <div className="text-gray-600">{fmtShort(planned)}</div>
              {actual !== null && (
                <div className={cellColor(actual, planned)}>{fmtShort(actual)}</div>
              )}
            </td>
          );
        })}
      </tr>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Бюджет 2026</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Редактирование бюджета открыто')}>
            Редактировать
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Экспорт в Excel запущен')}>
            Экспорт Excel
          </Button>
          <Button size="sm" onClick={() => toast.success('Статья добавлена')}>
            + Добавить статью
          </Button>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 inline-block rounded" /> Плановый</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 inline-block rounded" /> Факт ≥ план</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 inline-block rounded" /> Факт &lt; 90% плана</span>
      </div>

      <div className="overflow-auto rounded-lg border bg-white shadow-sm">
        <table className="text-sm w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 min-w-[140px]">Статья</th>
              {MONTHS.map((m, i) => (
                <th key={i} className="px-2 py-3 text-right font-medium text-gray-600 min-w-[80px]">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={13} className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 uppercase tracking-wide">
                ДОХОДЫ
              </td>
            </tr>
            {incomeItems.map((item, i) => renderRow(item, i))}
            {renderTotalRow('Итого доходы', incomeItems)}
            <tr>
              <td colSpan={13} className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 uppercase tracking-wide">
                РАСХОДЫ
              </td>
            </tr>
            {expenseItems.map((item, i) => renderRow(item, i))}
            {renderTotalRow('Итого расходы', expenseItems)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ForecastTab() {
  // Bridge point: last fact connects to first forecast
  const chartData = FORECAST_DATA.map((d) => ({
    month: d.month,
    fact: d.fact,
    forecast: d.fact !== null ? d.fact : d.forecast, // bridge
    isForecast: d.type === 'forecast',
  }));

  // Patch bridge: May has both fact and forecast for continuity
  const bridgeIdx = chartData.findIndex((d) => d.isForecast);
  if (bridgeIdx > 0) {
    chartData[bridgeIdx - 1] = {
      ...chartData[bridgeIdx - 1],
      forecast: chartData[bridgeIdx - 1].fact,
    };
  }

  const mae = 87000;
  const mape = 2.4;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        {SCENARIOS.map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">{s.label}</div>
            <div className="text-2xl font-bold">{fmtShort(s.annual)} ₽</div>
            <div className="text-sm font-medium mt-1">{s.growth} к 2025</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Факт vs Прогноз выручки</h3>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-8 h-0.5 bg-blue-500 inline-block" /> Факт
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-8 h-0.5 bg-orange-400 inline-block border-dashed border-t border-orange-400" /> Прогноз
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
            <defs>
              <linearGradient id="gradFact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmtShort(v)} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${fmt(value)} ₽`, '']}
            />
            <Area
              type="monotone"
              dataKey="fact"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradFact)"
              name="Факт"
              connectNulls
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#fb923c"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#gradForecast)"
              name="Прогноз"
              connectNulls
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">MAE (ср. абс. ошибка)</div>
          <div className="text-2xl font-bold text-gray-900">{fmt(mae)} ₽</div>
          <div className="text-xs text-gray-400 mt-1">по последним 3 месяцам</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">MAPE (ср. % ошибки)</div>
          <div className="text-2xl font-bold text-gray-900">{mape}%</div>
          <div className="text-xs text-gray-400 mt-1">точность модели прогнозирования</div>
        </div>
      </div>
    </div>
  );
}

function PLTab() {
  const [period, setPeriod] = useState<PeriodType>('month');

  const periodLabel: Record<PeriodType, string> = {
    month: 'Май 2026',
    quarter: 'Q2 2026',
    ytd: 'Янв–Май 2026',
  };

  const multiplier: Record<PeriodType, number> = { month: 1, quarter: 3, ytd: 5 };
  const m = multiplier[period];

  const revenue = 3595000 * m;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Отчёт о прибылях и убытках</h2>
        <div className="flex border rounded-lg overflow-hidden text-sm">
          {(['month', 'quarter', 'ytd'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 transition-colors ${
                period === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'month' ? 'Месяц' : p === 'quarter' ? 'Квартал' : 'YTD'}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">Период: <strong>{periodLabel[period]}</strong></div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/2">Статья</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Сумма, ₽</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">% выручки</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Δ к пред. периоду</th>
            </tr>
          </thead>
          <tbody>
            {PL_LINES_MONTH.map((line, i) => {
              const val = line.value * m;
              const prev = line.prevValue * m;
              const pctRev = revenue > 0 ? ((Math.abs(val) / revenue) * 100).toFixed(1) : '—';
              return (
                <>
                  {line.separator && i > 0 && (
                    <tr key={`sep-${i}`}><td colSpan={4} className="h-px bg-gray-200" /></tr>
                  )}
                  <tr
                    key={i}
                    className={`border-b ${line.bold ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <td
                      className={`px-4 py-2.5 text-gray-800 ${line.indent ? 'pl-8 text-gray-600' : ''} ${line.bold ? 'font-semibold' : ''}`}
                    >
                      {line.label}
                    </td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${val < 0 ? 'text-red-600' : 'text-gray-900'} ${line.bold ? 'font-semibold' : ''}`}>
                      {val < 0 ? `(${fmt(Math.abs(val))})` : fmt(val)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500 text-xs">{pctRev}%</td>
                    <td className="px-4 py-2.5 text-right">{varianceArrow(val, prev)}</td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CashFlowTab() {
  const dso = 38;
  const dpo = 22;
  const ccc = dso - dpo;

  const totalReceivable = UPCOMING_PAYMENTS.filter((p) => p.type === 'receivable').reduce(
    (s, p) => s + p.amount, 0
  );
  const totalPayable = UPCOMING_PAYMENTS.filter((p) => p.type === 'payable').reduce(
    (s, p) => s + p.amount, 0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* KPI metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">DSO (дней)</div>
          <div className="text-3xl font-bold text-blue-600">{dso}</div>
          <div className="text-xs text-gray-400 mt-1">Дни оборота дебиторки</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">DPO (дней)</div>
          <div className="text-3xl font-bold text-purple-600">{dpo}</div>
          <div className="text-xs text-gray-400 mt-1">Дни оборота кредиторки</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">CCC (дней)</div>
          <div className={`text-3xl font-bold ${ccc > 30 ? 'text-red-600' : 'text-green-600'}`}>{ccc}</div>
          <div className="text-xs text-gray-400 mt-1">Цикл конверсии денег</div>
        </div>
      </div>

      {/* Cash flows bar chart */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Денежные потоки по месяцам</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={CASHFLOW_DATA} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmtShort(v)} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${fmt(value)} ₽`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="operating" name="Операционный" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="investing" name="Инвестиционный" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="financing" name="Финансовый" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Running balance */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Накопленный остаток денежных средств</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={CASHFLOW_DATA} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmtShort(v)} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${fmt(value)} ₽`, 'Остаток']}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
              name="Остаток"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Upcoming payments */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Ближайшие 30 дней — платежи</h3>
          <div className="flex gap-4 text-xs">
            <span className="text-green-600 font-medium">
              Поступления: {fmt(totalReceivable)} ₽
            </span>
            <span className="text-red-600 font-medium">
              Выплаты: {fmt(totalPayable)} ₽
            </span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs text-gray-600">
              <th className="px-4 py-2 text-left font-medium">Дата</th>
              <th className="px-4 py-2 text-left font-medium">Описание</th>
              <th className="px-4 py-2 text-right font-medium">Сумма, ₽</th>
              <th className="px-4 py-2 text-center font-medium">Тип</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {UPCOMING_PAYMENTS.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{p.date}</td>
                <td className="px-4 py-2.5 text-gray-800">{p.description}</td>
                <td className={`px-4 py-2.5 text-right font-medium tabular-nums ${p.type === 'receivable' ? 'text-green-600' : 'text-red-600'}`}>
                  {p.type === 'receivable' ? '+' : '−'}{fmt(p.amount)}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.type === 'receivable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.type === 'receivable' ? 'Поступление' : 'Выплата'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const TABS: { key: ActiveTab; label: string }[] = [
  { key: 'budget', label: 'Бюджет' },
  { key: 'forecast', label: 'Прогноз' },
  { key: 'profitloss', label: 'P&L' },
  { key: 'cashflow', label: 'Денежный поток' },
];

export default function FinancialPlanning() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('budget');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Финансовое планирование</h1>
          <p className="text-sm text-gray-500">Бюджет, прогнозы, P&L и денежный поток</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b px-6 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'forecast' && <ForecastTab />}
        {activeTab === 'profitloss' && <PLTab />}
        {activeTab === 'cashflow' && <CashFlowTab />}
      </div>
    </div>
  );
}
