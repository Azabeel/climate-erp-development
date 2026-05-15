import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

// ─── Типы ───────────────────────────────────────────────────────────────────

type Scenario = 'base' | 'optimistic' | 'pessimistic';
type IncomeStatus = 'expected' | 'overdue' | 'paid';
type ExpenseStatus = 'planned' | 'paid' | 'overdue';
type ExpenseCategory = 'Зарплата' | 'ЗИП' | 'Аренда' | 'Налоги' | 'Транспорт' | 'Прочее';

interface DayEntry {
  day: string;
  date: string;
  income: number;
  expense: number;
  balance: number;
  isFact: boolean;
}

interface IncomeLine {
  id: string;
  client: string;
  invoice: string;
  amount: number;
  dueDate: string;
  status: IncomeStatus;
}

interface ExpenseLine {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
}

interface ExpenseStructure {
  category: string;
  amount: number;
}

// ─── Моковые данные ──────────────────────────────────────────────────────────

const TODAY_INDEX = 14; // индекс «сегодня» в 90-дневном массиве

function generateDailyData(): DayEntry[] {
  const entries: DayEntry[] = [];
  const start = new Date('2026-05-01');
  let runningBalance = 3_480_000;

  for (let i = 0; i < 90; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const label = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    const isFact = i <= TODAY_INDEX;

    // Имитируем реальные паттерны HVAC-компании
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isSalaryDay = d.getDate() === 5 || d.getDate() === 20;
    const isTaxDay = d.getDate() === 28;

    const baseIncome = isWeekend ? 0 : Math.round(60_000 + Math.sin(i * 0.3) * 25_000 + Math.random() * 40_000);
    const baseExpense = isWeekend
      ? 0
      : isSalaryDay
      ? Math.round(380_000 + Math.random() * 20_000)
      : isTaxDay
      ? Math.round(180_000 + Math.random() * 15_000)
      : Math.round(30_000 + Math.sin(i * 0.2) * 12_000 + Math.random() * 25_000);

    runningBalance = runningBalance + baseIncome - baseExpense;

    entries.push({
      day: label,
      date: d.toISOString().slice(0, 10),
      income: baseIncome,
      expense: baseExpense,
      balance: Math.max(runningBalance, 0),
      isFact,
    });
  }
  return entries;
}

const BASE_DAILY_DATA = generateDailyData();

// Сценарные множители
const SCENARIO_MULTIPLIERS: Record<Scenario, { income: number; expense: number }> = {
  base: { income: 1.0, expense: 1.0 },
  optimistic: { income: 1.2, expense: 0.95 },
  pessimistic: { income: 0.85, expense: 1.1 },
};

const INCOME_ROWS: IncomeLine[] = [
  { id: '1', client: 'ООО «АрктикТех»', invoice: 'СФ-2026-0412', amount: 487_500, dueDate: '20.05.2026', status: 'paid' },
  { id: '2', client: 'ТЦ «Меридиан»', invoice: 'СФ-2026-0423', amount: 312_000, dueDate: '22.05.2026', status: 'overdue' },
  { id: '3', client: 'ПАО «СибирьНефть»', invoice: 'СФ-2026-0431', amount: 1_240_000, dueDate: '28.05.2026', status: 'expected' },
  { id: '4', client: 'ИП Кравченко А.В.', invoice: 'СФ-2026-0435', amount: 78_400, dueDate: '30.05.2026', status: 'expected' },
  { id: '5', client: 'ООО «ХолодПлюс»', invoice: 'СФ-2026-0438', amount: 654_000, dueDate: '03.06.2026', status: 'expected' },
  { id: '6', client: 'АО «ТехноМаркет»', invoice: 'СФ-2026-0440', amount: 195_600, dueDate: '05.06.2026', status: 'expected' },
  { id: '7', client: 'ООО «КлиматСервис»', invoice: 'СФ-2026-0444', amount: 88_200, dueDate: '10.06.2026', status: 'expected' },
  { id: '8', client: 'Жилой комплекс «Северный»', invoice: 'СФ-2026-0448', amount: 2_340_000, dueDate: '15.06.2026', status: 'expected' },
  { id: '9', client: 'ООО «БизнесЦентр»', invoice: 'СФ-2026-0452', amount: 456_800, dueDate: '20.06.2026', status: 'expected' },
  { id: '10', client: 'ПАО «РосАгро»', invoice: 'СФ-2026-0457', amount: 387_500, dueDate: '25.06.2026', status: 'overdue' },
];

const EXPENSE_ROWS: ExpenseLine[] = [
  { id: '1', category: 'Зарплата', description: 'ФОТ — аванс (1–15 мая)', amount: 820_000, date: '05.05.2026', status: 'paid' },
  { id: '2', category: 'Аренда', description: 'Аренда офиса и склада', amount: 185_000, date: '10.05.2026', status: 'paid' },
  { id: '3', category: 'ЗИП', description: 'Запчасти — поставщик «КлиматОпт»', amount: 342_000, date: '18.05.2026', status: 'planned' },
  { id: '4', category: 'Зарплата', description: 'ФОТ — зарплата (16–31 мая)', amount: 920_000, date: '20.05.2026', status: 'planned' },
  { id: '5', category: 'Налоги', description: 'НДС за I кв. 2026', amount: 480_000, date: '28.05.2026', status: 'planned' },
  { id: '6', category: 'Транспорт', description: 'ГСМ + лизинг авто', amount: 128_000, date: '31.05.2026', status: 'planned' },
  { id: '7', category: 'ЗИП', description: 'Хладагенты R-410A, R-32', amount: 215_000, date: '05.06.2026', status: 'planned' },
  { id: '8', category: 'Прочее', description: 'Инструмент, спецодежда', amount: 30_000, date: '10.06.2026', status: 'planned' },
];

const EXPENSE_STRUCTURE: ExpenseStructure[] = [
  { category: 'Зарплата', amount: 1_740_000 },
  { category: 'ЗИП и материалы', amount: 557_000 },
  { category: 'Аренда', amount: 185_000 },
  { category: 'Налоги', amount: 480_000 },
  { category: 'Транспорт / ГСМ', amount: 128_000 },
  { category: 'Прочее', amount: 30_000 },
];

// ─── Форматирование ──────────────────────────────────────────────────────────

const formatRub = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);

const formatK = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} М ₽`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} К ₽`;
  return `${v} ₽`;
};

// ─── Вспомогательные компоненты ──────────────────────────────────────────────

const StatusBadge = ({ status }: { status: IncomeStatus | ExpenseStatus }) => {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    expected: { label: 'Ожидается', variant: 'secondary' },
    overdue: { label: 'Просрочен', variant: 'destructive' },
    paid: { label: 'Оплачен', variant: 'default' },
    planned: { label: 'Запланирован', variant: 'outline' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'secondary' };
  return <Badge variant={variant}>{label}</Badge>;
};

const SummaryCard = ({
  title,
  value,
  sub,
  icon,
  color,
  bg,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: string;
  color: string;
  bg: string;
}) => (
  <div className={`rounded-xl border p-5 ${bg}`}>
    <div className="flex items-start justify-between mb-3">
      <span className="text-sm font-medium text-gray-600">{title}</span>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color} bg-white/60`}>
        <Icon name={icon} size={18} />
      </div>
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

// ─── Кастомный tooltip для основного графика ─────────────────────────────────

const MainTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{formatK(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Основной компонент ──────────────────────────────────────────────────────

const CashFlow = () => {
  const [scenario, setScenario] = useState<Scenario>('base');
  const [incomeFilter, setIncomeFilter] = useState<IncomeStatus | 'all'>('all');
  const [expenseFilter, setExpenseFilter] = useState<ExpenseStatus | 'all'>('all');

  // Применяем сценарный множитель к прогнозным данным
  const chartData = useMemo(() => {
    const { income: iMult, expense: eMult } = SCENARIO_MULTIPLIERS[scenario];
    let balance = 3_480_000;
    return BASE_DAILY_DATA.map((d) => {
      const income = d.isFact ? d.income : Math.round(d.income * iMult);
      const expense = d.isFact ? d.expense : Math.round(d.expense * eMult);
      balance = balance + income - expense;
      return {
        ...d,
        income,
        expense,
        balance: Math.max(balance, 0),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  // Разбиваем на факт / прогноз для разной прозрачности (берём каждый 3-й день для читаемости)
  const sparseChart = chartData.filter((_, i) => i % 3 === 0 || i === TODAY_INDEX);

  const todayLabel = sparseChart.find((d) => d.isFact && sparseChart[sparseChart.indexOf(d) + 1]?.isFact === false)?.day
    ?? sparseChart[Math.floor(TODAY_INDEX / 3)]?.day;

  // Итоги за 30 дней
  const next30 = chartData.slice(TODAY_INDEX, TODAY_INDEX + 30);
  const totalIncome30 = next30.reduce((s, d) => s + d.income, 0);
  const totalExpense30 = next30.reduce((s, d) => s + d.expense, 0);
  const forecastBalance = 3_480_000 + totalIncome30 - totalExpense30;
  const balanceDelta = ((forecastBalance - 3_480_000) / 3_480_000) * 100;

  // Фильтры таблиц
  const filteredIncome = incomeFilter === 'all' ? INCOME_ROWS : INCOME_ROWS.filter((r) => r.status === incomeFilter);
  const filteredExpense = expenseFilter === 'all' ? EXPENSE_ROWS : EXPENSE_ROWS.filter((r) => r.status === expenseFilter);

  // Легенда сценариев
  const scenarios: { key: Scenario; label: string; icon: string; color: string }[] = [
    { key: 'base', label: 'Базовый', icon: 'Minus', color: 'bg-blue-600 text-white' },
    { key: 'optimistic', label: 'Оптимистичный (+20%)', icon: 'TrendingUp', color: 'bg-green-600 text-white' },
    { key: 'pessimistic', label: 'Пессимистичный (−15%)', icon: 'TrendingDown', color: 'bg-red-500 text-white' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* ── Заголовок ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Icon name="TrendingUp" size={22} className="text-emerald-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Прогноз денежного потока</h2>
            <p className="text-gray-500 text-sm mt-0.5">Cash Flow · 90 дней · АСУ СЦ «Сервис Климат»</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Icon name="Download" size={15} className="mr-1.5" />
            Экспорт
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="RefreshCw" size={15} className="mr-1.5" />
            Обновить
          </Button>
        </div>
      </div>

      {/* ── 4 карточки итогов ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Остаток на счету"
          value={formatRub(3_480_000)}
          sub="Актуально на сегодня"
          icon="Wallet"
          color="text-blue-700"
          bg="bg-blue-50 border-blue-200"
        />
        <SummaryCard
          title="Ожидаемые поступления"
          value={formatRub(totalIncome30)}
          sub={`Следующие 30 дней · ${scenario !== 'base' ? scenarios.find(s => s.key === scenario)?.label : 'Базовый сценарий'}`}
          icon="ArrowDownCircle"
          color="text-emerald-700"
          bg="bg-emerald-50 border-emerald-200"
        />
        <SummaryCard
          title="Ожидаемые расходы"
          value={formatRub(totalExpense30)}
          sub="Следующие 30 дней"
          icon="ArrowUpCircle"
          color="text-red-600"
          bg="bg-red-50 border-red-200"
        />
        <SummaryCard
          title="Прогнозный остаток"
          value={formatRub(forecastBalance)}
          sub={`${balanceDelta >= 0 ? '+' : ''}${balanceDelta.toFixed(0)}% к текущему`}
          icon="BarChart2"
          color="text-violet-700"
          bg="bg-violet-50 border-violet-200"
        />
      </div>

      {/* ── Мини-спарклайн тренда баланса (AreaChart) ────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Icon name="Activity" size={17} className="text-emerald-600" />
            Тренд остатка на счету · факт 15 дней
          </h3>
          <span className="text-xs text-gray-400">Нарастающим итогом</span>
        </div>
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart
            data={chartData.filter((d) => d.isFact)}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} interval={2} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={(v) => formatK(v)} axisLine={false} tickLine={false} width={64} />
            <Tooltip formatter={(v: number) => [formatRub(v), 'Остаток']} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            <Area type="monotone" dataKey="balance" name="Остаток" stroke="#10b981" strokeWidth={2} fill="url(#balanceGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Переключатель сценариев ───────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <span className="text-sm font-semibold text-gray-700 mr-1">Сценарный анализ:</span>
          {scenarios.map((s) => (
            <button
              key={s.key}
              onClick={() => setScenario(s.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                scenario === s.key
                  ? s.color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon name={s.icon} size={14} />
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Оптимистичный: +20% к доходам, −5% к расходам. Пессимистичный: −15% к доходам, +10% к расходам.
        </p>
      </div>

      {/* ── Основной ComposedChart — 90 дней ─────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Денежный поток: факт и прогноз</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Столбцы — поступления / расходы · Линия — кумулятивный остаток · Пунктир — сегодня
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
              Поступления
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
              Расходы
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-8 h-0.5 bg-emerald-500 inline-block" />
              Остаток
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={sparseChart} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval={4}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="bar"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v) => formatK(v)}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <YAxis
              yAxisId="line"
              orientation="right"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v) => formatK(v)}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<MainTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            />
            {todayLabel && (
              <ReferenceLine
                x={todayLabel}
                yAxisId="bar"
                stroke="#6366f1"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: 'Сегодня', position: 'top', fill: '#6366f1', fontSize: 10 }}
              />
            )}
            {/* Факт-поступления */}
            <Bar
              yAxisId="bar"
              dataKey="income"
              name="Поступления"
              fill="#3b82f6"
              opacity={0.85}
              radius={[2, 2, 0, 0]}
              maxBarSize={12}
            />
            {/* Факт-расходы */}
            <Bar
              yAxisId="bar"
              dataKey="expense"
              name="Расходы"
              fill="#f87171"
              opacity={0.75}
              radius={[2, 2, 0, 0]}
              maxBarSize={12}
            />
            {/* Кумулятивный остаток */}
            <Line
              yAxisId="line"
              type="monotone"
              dataKey="balance"
              name="Остаток"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Таблица поступлений ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Icon name="ArrowDownCircle" size={17} className="text-emerald-600" />
            Ожидаемые поступления
          </h3>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'expected', 'overdue', 'paid'] as const).map((f) => (
              <Button
                key={f}
                variant={incomeFilter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncomeFilter(f)}
              >
                {{ all: 'Все', expected: 'Ожидается', overdue: 'Просрочен', paid: 'Оплачен' }[f]}
              </Button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Клиент</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Счёт №</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Сумма</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Срок оплаты</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncome.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-gray-800 font-medium">{row.client}</td>
                  <td className="py-2.5 px-3 text-gray-500 font-mono text-xs">{row.invoice}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-gray-900">{formatRub(row.amount)}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{row.dueDate}</td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
              {filteredIncome.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Нет строк по выбранному фильтру</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={2} className="py-2.5 px-3 text-sm font-semibold text-gray-700">Итого:</td>
                <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                  {formatRub(filteredIncome.reduce((s, r) => s + r.amount, 0))}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Таблица расходов ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Icon name="ArrowUpCircle" size={17} className="text-red-500" />
            Плановые расходы
          </h3>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'planned', 'paid', 'overdue'] as const).map((f) => (
              <Button
                key={f}
                variant={expenseFilter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExpenseFilter(f)}
              >
                {{ all: 'Все', planned: 'Запланирован', paid: 'Оплачен', overdue: 'Просрочен' }[f]}
              </Button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Категория</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Описание</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Сумма</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Дата</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpense.map((row) => {
                const catColor: Record<ExpenseCategory, string> = {
                  Зарплата: 'bg-blue-100 text-blue-700',
                  ЗИП: 'bg-orange-100 text-orange-700',
                  Аренда: 'bg-purple-100 text-purple-700',
                  Налоги: 'bg-red-100 text-red-700',
                  Транспорт: 'bg-teal-100 text-teal-700',
                  Прочее: 'bg-gray-100 text-gray-600',
                };
                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${catColor[row.category]}`}>
                        {row.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">{row.description}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900">{formatRub(row.amount)}</td>
                    <td className="py-2.5 px-3 text-center text-gray-600">{row.date}</td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                );
              })}
              {filteredExpense.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Нет строк по выбранному фильтру</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={2} className="py-2.5 px-3 text-sm font-semibold text-gray-700">Итого:</td>
                <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                  {formatRub(filteredExpense.reduce((s, r) => s + r.amount, 0))}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Структура расходов — горизонтальный BarChart ──────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Icon name="PieChart" size={17} className="text-violet-600" />
          Структура расходов по категориям
        </h3>
        <p className="text-xs text-gray-500 mb-4">Плановые расходы на ближайшие 30 дней в разрезе категорий</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            layout="vertical"
            data={[...EXPENSE_STRUCTURE].sort((a, b) => b.amount - a.amount)}
            margin={{ top: 0, right: 80, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v) => formatK(v)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12, fill: '#374151' }}
              axisLine={false}
              tickLine={false}
              width={130}
            />
            <Tooltip
              formatter={(value: number) => [formatRub(value), 'Сумма']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="amount" name="Сумма" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {EXPENSE_STRUCTURE.map((_entry, index) => {
                const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#94a3b8'];
                return (
                  <rect
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-3">
          {[...EXPENSE_STRUCTURE]
            .sort((a, b) => b.amount - a.amount)
            .map((item) => {
              const total = EXPENSE_STRUCTURE.reduce((s, e) => s + e.amount, 0);
              const pct = ((item.amount / total) * 100).toFixed(0);
              return (
                <div key={item.category} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="font-medium">{item.category}:</span>
                  <span>{formatK(item.amount)}</span>
                  <span className="text-gray-400">({pct}%)</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* ── LineChart: сравнение балансов по сценариям (30 дней) ─────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Icon name="GitBranch" size={17} className="text-blue-600" />
          Сравнение сценариев · динамика остатка (30 дней)
        </h3>
        <p className="text-xs text-gray-500 mb-4">Прогноз кумулятивного остатка по каждому сценарию</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={chartData.slice(TODAY_INDEX, TODAY_INDEX + 30).filter((_, i) => i % 2 === 0).map((d, i, arr) => {
              const base = 3_480_000;
              const sumUpTo = (mult: { income: number; expense: number }) =>
                arr.slice(0, i + 1).reduce((s, x) => s + Math.round(x.income * mult.income) - Math.round(x.expense * mult.expense), base);
              return {
                day: d.day,
                base: sumUpTo(SCENARIO_MULTIPLIERS.base),
                optimistic: sumUpTo(SCENARIO_MULTIPLIERS.optimistic),
                pessimistic: sumUpTo(SCENARIO_MULTIPLIERS.pessimistic),
              };
            })}
            margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={4} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => formatK(v)} axisLine={false} tickLine={false} width={72} />
            <Tooltip formatter={(v: number) => [formatRub(v), '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="base" name="Базовый" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="optimistic" name="Оптимистичный" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="pessimistic" name="Пессимистичный" stroke="#f87171" strokeWidth={2} dot={false} strokeDasharray="2 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Сравнение сценариев — мини-карточки ──────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Icon name="Layers" size={17} className="text-blue-600" />
          Сравнение сценариев · прогнозный остаток через 30 дней
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {scenarios.map((s) => {
            const mult = SCENARIO_MULTIPLIERS[s.key];
            const projIncome = next30.reduce((sum, d) => sum + (d.isFact ? d.income : Math.round(d.income * mult.income)), 0);
            const projExpense = next30.reduce((sum, d) => sum + (d.isFact ? d.expense : Math.round(d.expense * mult.expense)), 0);
            const projBalance = 3_480_000 + projIncome - projExpense;
            const delta = ((projBalance - 3_480_000) / 3_480_000) * 100;
            const isActive = scenario === s.key;

            return (
              <button
                key={s.key}
                onClick={() => setScenario(s.key)}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  isActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon name={s.icon} size={16} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                  <span className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{s.label}</span>
                  {isActive && <Badge variant="default" className="ml-auto text-xs">Активен</Badge>}
                </div>
                <p className={`text-xl font-bold ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>
                  {formatRub(projBalance)}
                </p>
                <p className={`text-xs mt-1 ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {delta >= 0 ? '+' : ''}{delta.toFixed(0)}% к текущему
                </p>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Поступления</span>
                    <span className="text-emerald-600 font-medium">{formatK(projIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Расходы</span>
                    <span className="text-red-500 font-medium">{formatK(projExpense)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
