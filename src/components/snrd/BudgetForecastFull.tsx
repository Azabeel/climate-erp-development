import { useState } from 'react';
import {
  AreaChart, Area, Bar, BarChart, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('ru-RU');
const fmtM = (n: number) => `${(n / 1_000_000).toFixed(1)} млн`;

const execBadge = (pct: number) => {
  if (pct >= 95) return <Badge className="bg-green-100 text-green-700">{pct}%</Badge>;
  if (pct >= 80) return <Badge className="bg-yellow-100 text-yellow-700">{pct}%</Badge>;
  return <Badge className="bg-red-100 text-red-700">{pct}%</Badge>;
};

// ─── Static data ──────────────────────────────────────────────────────────────
const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const INCOME_PLAN  = [1_400_000, 1_500_000, 1_700_000, 1_800_000, 2_000_000, 2_100_000, 1_800_000, 1_600_000, 1_500_000, 1_700_000, 1_900_000, 2_000_000];
const INCOME_FACT  = [1_380_000, 1_520_000, 1_650_000, 1_810_000, 1_980_000, 2_060_000, null, null, null, null, null, null];

const incomeData = MONTHS_SHORT.map((month, i) => ({
  month,
  план: INCOME_PLAN[i],
  факт: INCOME_FACT[i] ?? undefined,
  pct: INCOME_FACT[i] ? Math.round((INCOME_FACT[i]! / INCOME_PLAN[i]) * 100) : null,
}));

const incomeTotals = {
  plan: INCOME_PLAN.reduce((a, b) => a + b, 0),
  fact: INCOME_FACT.filter(Boolean).reduce((a, b) => a! + b!, 0) as number,
};

const INCOME_TABLE_ROWS = MONTHS_SHORT.slice(0, 6).map((month, i) => {
  const plan = INCOME_PLAN[i];
  const fact = INCOME_FACT[i]!;
  const pct = Math.round((fact / plan) * 100);
  const diff = fact - plan;
  return { month, plan, fact, pct, diff };
});

// Expenses
const EXPENSE_MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
const expenseData = [
  { month: 'Янв', ФОТ: 520_000, Материалы: 180_000, ЗИП: 140_000, Топливо: 85_000, Аренда: 120_000, Прочее: 65_000 },
  { month: 'Фев', ФОТ: 535_000, Материалы: 195_000, ЗИП: 155_000, Топливо: 90_000, Аренда: 120_000, Прочее: 70_000 },
  { month: 'Мар', ФОТ: 550_000, Материалы: 210_000, ЗИП: 170_000, Топливо: 95_000, Аренда: 120_000, Прочее: 72_000 },
  { month: 'Апр', ФОТ: 545_000, Материалы: 220_000, ЗИП: 175_000, Топливо: 100_000, Аренда: 120_000, Прочее: 68_000 },
  { month: 'Май', ФОТ: 560_000, Материалы: 230_000, ЗИП: 180_000, Топливо: 105_000, Аренда: 120_000, Прочее: 75_000 },
  { month: 'Июн', ФОТ: 570_000, Материалы: 240_000, ЗИП: 185_000, Топливо: 110_000, Аренда: 120_000, Прочее: 78_000 },
];

const EXPENSE_COLORS = {
  ФОТ: '#6366f1', Материалы: '#10b981', ЗИП: '#f59e0b',
  Топливо: '#ef4444', Аренда: '#8b5cf6', Прочее: '#94a3b8',
};

const expenseItems = [
  { label: 'ФОТ', plan: 3_400_000, fact: 3_280_000, trend: 'down' },
  { label: 'Материалы', plan: 1_400_000, fact: 1_275_000, trend: 'down' },
  { label: 'ЗИП', plan: 1_100_000, fact: 1_005_000, trend: 'down' },
  { label: 'Топливо', plan: 650_000, fact: 585_000, trend: 'down' },
  { label: 'Аренда', plan: 720_000, fact: 720_000, trend: 'flat' },
  { label: 'Прочее', plan: 480_000, fact: 428_000, trend: 'down' },
  { label: 'Маркетинг', plan: 250_000, fact: 270_000, trend: 'up' },
  { label: 'IT и ПО', plan: 180_000, fact: 162_000, trend: 'down' },
];

const expensePieData = expenseItems.map(e => ({ name: e.label, value: e.fact }));
const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#94a3b8','#ec4899','#06b6d4'];

// P&L
const plData = [
  { month: 'Янв', revenue: 1_380_000, cogs: 924_600, opex: 220_000 },
  { month: 'Фев', revenue: 1_520_000, cogs: 1_009_800, opex: 235_000 },
  { month: 'Мар', revenue: 1_650_000, cogs: 1_089_900, opex: 250_000 },
  { month: 'Апр', revenue: 1_810_000, cogs: 1_188_600, opex: 248_000 },
  { month: 'Май', revenue: 1_980_000, cogs: 1_287_000, opex: 265_000 },
  { month: 'Июн', revenue: 2_060_000, cogs: 1_339_000, opex: 278_000 },
].map(r => {
  const gross = r.revenue - r.cogs;
  const grossPct = Math.round((gross / r.revenue) * 100);
  const ebitda = gross - r.opex;
  const ebitdaPct = Math.round((ebitda / r.revenue) * 100);
  return { ...r, gross, grossPct, ebitda, ebitdaPct };
});

const plSummary = [
  { label: 'Выручка', cur: 10_400_000, prev: 9_200_000 },
  { label: 'Себестоимость', cur: 6_839_000, prev: 6_120_000 },
  { label: 'Валовая прибыль', cur: 3_561_000, prev: 3_080_000 },
  { label: 'GP%', cur: 34, prev: 33, isPercent: true },
  { label: 'Операционные расходы', cur: 1_496_000, prev: 1_340_000 },
  { label: 'EBITDA', cur: 2_065_000, prev: 1_740_000 },
  { label: 'EBITDA%', cur: 20, prev: 19, isPercent: true },
];

// Forecast
const FORECAST_BASE = [
  { month: 'Июл', base: 1_960_000, opt: 2_200_000, pes: 1_720_000 },
  { month: 'Авг', base: 2_050_000, opt: 2_320_000, pes: 1_790_000 },
  { month: 'Сен', base: 2_180_000, opt: 2_480_000, pes: 1_880_000 },
  { month: 'Окт', base: 2_300_000, opt: 2_640_000, pes: 1_970_000 },
  { month: 'Ноя', base: 2_420_000, opt: 2_780_000, pes: 2_060_000 },
  { month: 'Дек', base: 2_580_000, opt: 2_980_000, pes: 2_200_000 },
];

const ASSUMPTIONS = [
  'Сохранение текущей доли рынка в B2B-сегменте (≥60% выручки)',
  'Рост среднего чека на ТО и монтаж на 7–10% в IV квартале',
  'Штат инженеров: не менее 14 человек, коэффициент загрузки ≥78%',
  'Курс USD/RUB в диапазоне 88–94 ₽ (влияет на стоимость ЗИП)',
  'Ввод модуля CRM — рост конверсии лидов с 34% до 42% к декабрю',
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function KPICard({
  title, value, sub, progress, icon, iconColor,
}: {
  title: string; value: string; sub: string; progress: number;
  icon: string; iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
          <div className={`p-2 rounded-lg bg-opacity-10 ${iconColor}`}>
            <Icon name={icon} size={20} className={iconColor} />
          </div>
        </div>
        {progress > 0 && <Progress value={progress} className="h-1.5" />}
      </CardContent>
    </Card>
  );
}

// ─── Income Tab ───────────────────────────────────────────────────────────────
function IncomeTab() {
  const totalPct = Math.round((incomeTotals.fact / (incomeTotals.plan * 6 / 12)) * 100);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">План vs Факт по месяцам</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={incomeData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `${(v / 1_000_000).toFixed(1)}М`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${fmt(v)} ₽`]} />
              <Legend />
              <Bar dataKey="факт" name="Факт" fill="#6366f1" radius={[3,3,0,0]} />
              <Line dataKey="план" name="План" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Детализация по месяцам</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Месяц</TableHead>
                <TableHead className="text-right">План ₽</TableHead>
                <TableHead className="text-right">Факт ₽</TableHead>
                <TableHead className="text-center">Выполнение</TableHead>
                <TableHead className="text-right">Отклонение</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INCOME_TABLE_ROWS.map(r => (
                <TableRow key={r.month}>
                  <TableCell>{r.month}</TableCell>
                  <TableCell className="text-right">{fmt(r.plan)}</TableCell>
                  <TableCell className="text-right">{fmt(r.fact)}</TableCell>
                  <TableCell className="text-center">{execBadge(r.pct)}</TableCell>
                  <TableCell className={`text-right ${r.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {r.diff >= 0 ? '+' : ''}{fmt(r.diff)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/40">
                <TableCell>Итого (6 мес.)</TableCell>
                <TableCell className="text-right">{fmt(INCOME_TABLE_ROWS.reduce((a, r) => a + r.plan, 0))}</TableCell>
                <TableCell className="text-right">{fmt(incomeTotals.fact)}</TableCell>
                <TableCell className="text-center">{execBadge(totalPct)}</TableCell>
                <TableCell className={`text-right ${incomeTotals.fact - INCOME_TABLE_ROWS.reduce((a,r) => a+r.plan,0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {fmt(incomeTotals.fact - INCOME_TABLE_ROWS.reduce((a,r) => a+r.plan,0))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────
function ExpensesTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm font-medium">Структура расходов по месяцам</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={expenseData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `${(v/1_000_000).toFixed(1)}М`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${fmt(v)} ₽`]} />
                <Legend />
                {(Object.keys(EXPENSE_COLORS) as (keyof typeof EXPENSE_COLORS)[]).map(k => (
                  <Bar key={k} dataKey={k} stackId="a" fill={EXPENSE_COLORS[k]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Доля статей</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {expensePieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [fmtM(v)]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Статьи расходов (план/факт)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Статья</TableHead>
                <TableHead className="text-right">План ₽</TableHead>
                <TableHead className="text-right">Факт ₽</TableHead>
                <TableHead className="text-center">Выполнение</TableHead>
                <TableHead className="text-center">Тренд</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseItems.map(e => {
                const pct = Math.round((e.fact / e.plan) * 100);
                return (
                  <TableRow key={e.label}>
                    <TableCell className="font-medium">{e.label}</TableCell>
                    <TableCell className="text-right">{fmt(e.plan)}</TableCell>
                    <TableCell className="text-right">{fmt(e.fact)}</TableCell>
                    <TableCell className="text-center">{execBadge(pct)}</TableCell>
                    <TableCell className="text-center">
                      {e.trend === 'up' && <Icon name="TrendingUp" size={16} className="text-red-500 inline" />}
                      {e.trend === 'down' && <Icon name="TrendingDown" size={16} className="text-green-500 inline" />}
                      {e.trend === 'flat' && <Icon name="Minus" size={16} className="text-gray-400 inline" />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── P&L Tab ──────────────────────────────────────────────────────────────────
function PLTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">P&L сводная таблица</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Показатель</TableHead>
                  <TableHead className="text-right">2025 ₽</TableHead>
                  <TableHead className="text-right">2024 ₽</TableHead>
                  <TableHead className="text-right">YoY %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plSummary.map(r => {
                  const yoy = r.prev ? Math.round(((r.cur - r.prev) / r.prev) * 100) : 0;
                  const isBold = r.label === 'Валовая прибыль' || r.label === 'EBITDA';
                  return (
                    <TableRow key={r.label} className={isBold ? 'font-semibold bg-muted/30' : ''}>
                      <TableCell>{r.label}</TableCell>
                      <TableCell className="text-right">
                        {r.isPercent ? `${r.cur}%` : fmt(r.cur)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {r.isPercent ? `${r.prev}%` : fmt(r.prev)}
                      </TableCell>
                      <TableCell className={`text-right ${yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {yoy >= 0 ? '+' : ''}{yoy}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">EBITDA и EBITDA% по месяцам</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={plData} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tickFormatter={v => `${(v/1_000_000).toFixed(1)}М`} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number, name: string) =>
                    name === 'EBITDA%' ? [`${v}%`, name] : [`${fmt(v)} ₽`, name]
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="ebitda" name="EBITDA" fill="#10b981" radius={[3,3,0,0]} />
                <Line yAxisId="right" dataKey="ebitdaPct" name="EBITDA%" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Месячный P&L (факт)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Месяц</TableHead>
                <TableHead className="text-right">Выручка</TableHead>
                <TableHead className="text-right">Себест.</TableHead>
                <TableHead className="text-right">Вал. прибыль</TableHead>
                <TableHead className="text-right">GP%</TableHead>
                <TableHead className="text-right">EBITDA</TableHead>
                <TableHead className="text-right">EBITDA%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plData.map(r => (
                <TableRow key={r.month}>
                  <TableCell>{r.month}</TableCell>
                  <TableCell className="text-right">{fmt(r.revenue)}</TableCell>
                  <TableCell className="text-right">{fmt(r.cogs)}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">{fmt(r.gross)}</TableCell>
                  <TableCell className="text-right">{r.grossPct}%</TableCell>
                  <TableCell className="text-right text-indigo-600 font-medium">{fmt(r.ebitda)}</TableCell>
                  <TableCell className="text-right">{r.ebitdaPct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Forecast Tab ─────────────────────────────────────────────────────────────
function ForecastTab() {
  const [scenario, setScenario] = useState('base');

  const displayData = FORECAST_BASE.map(r => ({
    month: r.month,
    прогноз: scenario === 'opt' ? r.opt : scenario === 'pes' ? r.pes : r.base,
    оптимистичный: r.opt,
    пессимистичный: r.pes,
  }));

  const handleUpdate = () => {
    toast.success('Прогноз обновлён', { description: 'Данные пересчитаны на основе актуальных показателей' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Сценарий:</span>
        <Select value={scenario} onValueChange={setScenario}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base">Базовый</SelectItem>
            <SelectItem value="opt">Оптимистичный</SelectItem>
            <SelectItem value="pes">Пессимистичный</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Прогноз выручки — Июл–Дек 2025</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={displayData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOpt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `${(v/1_000_000).toFixed(1)}М`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${fmt(v)} ₽`]} />
              <Legend />
              <Area dataKey="оптимистичный" stroke="#10b981" fill="url(#gradOpt)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Area dataKey="пессимистичный" stroke="#ef4444" fill="url(#gradPes)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Area dataKey="прогноз" stroke="#6366f1" fill="url(#gradBase)" strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Базовый', value: '13.6 млн', sub: 'Июл–Дек 2025', color: 'border-indigo-300 bg-indigo-50' },
          { label: 'Оптимистичный', value: '15.4 млн', sub: '+13% к базовому', color: 'border-green-300 bg-green-50' },
          { label: 'Пессимистичный', value: '11.6 млн', sub: '−15% к базовому', color: 'border-red-300 bg-red-50' },
        ].map(s => (
          <Card key={s.label} className={`border-2 ${s.color}`}>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value} ₽</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Ключевые допущения</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {ASSUMPTIONS.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Icon name="CheckCircle" size={15} className="text-indigo-500 mt-0.5 shrink-0" />
                {a}
              </li>
            ))}
          </ul>
          <Button onClick={handleUpdate} className="mt-5 gap-2">
            <Icon name="RefreshCw" size={15} />
            Обновить прогноз
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BudgetForecastFull() {
  const [year, setYear] = useState('2025');

  const handleExport = () =>
    toast.success('Экспорт запущен', { description: 'Файл Excel будет готов через несколько секунд' });

  const handleEdit = () =>
    toast.info('Режим редактирования', { description: 'Введите плановые показатели и нажмите «Сохранить»' });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Бюджет и прогнозы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Финансовое планирование и план-фактный анализ</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleEdit}>
            <Icon name="Pencil" size={15} />
            Редактировать бюджет
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Icon name="Download" size={15} />
            Экспорт
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Выручка (факт / план)"
          value="18.4 млн ₽"
          sub="план 20 млн ₽ · 92% выполнено"
          progress={92}
          icon="TrendingUp"
          iconColor="text-indigo-500"
        />
        <KPICard
          title="Расходы (факт / план)"
          value="13.2 млн ₽"
          sub="план 14 млн ₽ · 94% бюджета"
          progress={94}
          icon="CreditCard"
          iconColor="text-amber-500"
        />
        <KPICard
          title="Прибыль"
          value="5.2 млн ₽"
          sub="маржа 28% · +18% к прошлому году"
          progress={0}
          icon="BadgeDollarSign"
          iconColor="text-green-500"
        />
        <KPICard
          title="Прогноз на год"
          value="22.1 млн ₽"
          sub="базовый сценарий · выручка"
          progress={0}
          icon="BarChart2"
          iconColor="text-purple-500"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="income">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="income">Доходы</TabsTrigger>
          <TabsTrigger value="expenses">Расходы</TabsTrigger>
          <TabsTrigger value="pl">P&amp;L</TabsTrigger>
          <TabsTrigger value="forecast">Прогноз</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-6"><IncomeTab /></TabsContent>
        <TabsContent value="expenses" className="mt-6"><ExpensesTab /></TabsContent>
        <TabsContent value="pl" className="mt-6"><PLTab /></TabsContent>
        <TabsContent value="forecast" className="mt-6"><ForecastTab /></TabsContent>
      </Tabs>
    </div>
  );
}
