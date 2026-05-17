import { useState } from 'react';
import {
  AreaChart, Area, Bar, BarChart, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('ru-RU');
const fmtM = (n: number) => `${(n / 1_000_000).toFixed(2)} млн`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const MONTHS = [
  'Июн 25', 'Июл 25', 'Авг 25', 'Сен 25', 'Окт 25', 'Ноя 25',
  'Дек 25', 'Янв 26', 'Фев 26', 'Мар 26', 'Апр 26', 'Май 26',
];

const revenueData = MONTHS.map((month, i) => ({
  month,
  revenue: [2140, 2380, 2650, 2510, 2720, 2847, 2190, 2480, 2760, 3020, 3280, 3470][i] * 1000,
  profit:  [640,  730,  850,  800,  870,  924,  670,  790,  940, 1060, 1140, 1210][i] * 1000,
}));

const revenuePieData = [
  { name: 'ТО',       value: 28, color: '#6366f1' },
  { name: 'Монтаж',   value: 23, color: '#10b981' },
  { name: 'Ремонт',   value: 32, color: '#f59e0b' },
  { name: 'ЗИП',      value: 11, color: '#ec4899' },
  { name: 'Гарантия', value:  6, color: '#94a3b8' },
];

const expenseData = MONTHS.map((month, i) => ({
  month,
  ФОТ:     [620, 680, 730, 710, 780, 810, 640, 700, 760, 830, 900, 960][i] * 1000,
  ЗИП:     [280, 310, 345, 330, 360, 375, 295, 325, 355, 390, 420, 455][i] * 1000,
  ГСМ:     [ 95, 105, 118, 112, 122, 128,  98, 110, 120, 132, 143, 154][i] * 1000,
  Аренда:  [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120][i] * 1000,
  Прочее:  [ 85,  95, 107, 100, 110, 115,  90, 100, 110, 120, 130, 140][i] * 1000,
}));

const expenseItems = [
  { name: 'ФОТ + страховые',          amount: 810_000, pct: 42.1 },
  { name: 'Запасные части (ЗИП)',      amount: 375_000, pct: 19.5 },
  { name: 'Аренда офиса и склада',     amount: 120_000, pct:  6.2 },
  { name: 'ГСМ и транспорт',          amount: 128_000, pct:  6.7 },
  { name: 'Маркетинг и реклама',       amount:  95_000, pct:  4.9 },
  { name: 'Хладагенты (R-410A и др.)', amount:  87_000, pct:  4.5 },
  { name: 'Связь и интернет',          amount:  34_000, pct:  1.8 },
  { name: 'Инструмент и оснастка',     amount:  52_000, pct:  2.7 },
  { name: 'Командировочные',           amount:  41_000, pct:  2.1 },
  { name: 'Прочие расходы',            amount:  81_000, pct:  4.2 },
];

const marginData = MONTHS.map((month, i) => ({
  month,
  margin: [29.9, 30.7, 32.1, 31.9, 32.0, 32.4, 30.6, 31.9, 34.1, 35.1, 34.8, 34.9][i],
}));

const engineerMarginData = [
  { name: 'Петров А.В.',   revenue: 520_000, margin: 195_000, marginPct: 37.5 },
  { name: 'Иванов К.П.',   revenue: 484_000, margin: 174_000, marginPct: 35.9 },
  { name: 'Сидоров М.Н.',  revenue: 451_000, margin: 157_000, marginPct: 34.8 },
  { name: 'Козлов Р.Е.',   revenue: 412_000, margin: 140_000, marginPct: 34.0 },
  { name: 'Новиков Д.С.',  revenue: 384_000, margin: 129_000, marginPct: 33.6 },
  { name: 'Морозов В.А.',  revenue: 351_000, margin: 115_000, marginPct: 32.8 },
  { name: 'Алексеев И.О.', revenue: 324_000, margin: 104_000, marginPct: 32.1 },
  { name: 'Громов П.Г.',   revenue: 283_000, margin:  87_000, marginPct: 30.7 },
  { name: 'Барков С.Ю.',   revenue: 251_000, margin:  74_000, marginPct: 29.5 },
  { name: 'Волков Е.И.',   revenue: 228_000, margin:  65_000, marginPct: 28.5 },
];

const cashFlowData = MONTHS.map((month, i) => ({
  month,
  inflow:  [2310, 2540, 2790, 2620, 2850, 2960, 2250, 2580, 2840, 3110, 3390, 3600][i] * 1000,
  outflow: [1980, 2150, 2390, 2260, 2430, 2540, 1940, 2200, 2410, 2660, 2890, 3080][i] * 1000,
  balance: [ 330,  390,  400,  360,  420,  420,  310,  380,  430,  450,  500,  520][i] * 1000,
}));

const ACCOUNTS = [
  { name: 'Расчётный счёт (Сбербанк)',  balance: 3_840_000 },
  { name: 'Расчётный счёт (ВТБ)',       balance: 1_250_000 },
  { name: 'Касса',                      balance:   145_000 },
  { name: 'Депозит (резерв)',           balance: 2_000_000 },
];
const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balance, 0);

// ─── Tooltip components ───────────────────────────────────────────────────────
type TPayload = { name: string; value: number; color: string; fill?: string };

const RubleTooltip = ({
  active, payload, label,
}: { active?: boolean; payload?: TPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm min-w-[160px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color ?? p.fill }} />
            <span className="text-gray-500">{p.name}</span>
          </span>
          <span className="font-semibold text-gray-900">{fmt(p.value)} ₽</span>
        </div>
      ))}
    </div>
  );
};

const PctTooltip = ({
  active, payload, label,
}: { active?: boolean; payload?: TPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="font-bold text-gray-900">{payload[0].value}%</p>
    </div>
  );
};

const PieTooltip = ({
  active, payload,
}: { active?: boolean; payload?: TPayload[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{payload[0].name}: {payload[0].value}%</p>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  change: string;
  positive: boolean;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ icon, label, value, sub, change, positive, iconBg, iconColor }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            <p className={`text-xs mt-2 flex items-center gap-1 font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
              <Icon name={positive ? 'TrendingUp' : 'TrendingDown'} size={12} />
              {change} к прошлому периоду
            </p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon name={icon} size={20} className={iconColor} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sort state for engineers table ───────────────────────────────────────────
type SortKey = 'revenue' | 'margin' | 'marginPct';

// ─── Main component ───────────────────────────────────────────────────────────
export default function FinanceDashboardFull() {
  const [period, setPeriod] = useState('month');
  const [sortKey, setSortKey] = useState<SortKey>('marginPct');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedEngineers = [...engineerMarginData].sort((a, b) =>
    sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <Icon name="ChevronsUpDown" size={12} className="text-gray-400 inline ml-1" />;
    return <Icon name={sortAsc ? 'ChevronUp' : 'ChevronDown'} size={12} className="text-indigo-500 inline ml-1" />;
  }

  function handleExport(label: string) {
    toast.success(`Экспорт «${label}» запущен`, {
      description: 'Файл будет готов через несколько секунд',
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Финансовый дашборд</h2>
          <p className="text-gray-500 text-sm mt-0.5">Выручка, расходы, маржа и движение денежных средств</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Текущий месяц</SelectItem>
              <SelectItem value="quarter">Квартал</SelectItem>
              <SelectItem value="half">Полугодие</SelectItem>
              <SelectItem value="year">Год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => handleExport('Дашборд')}>
            <Icon name="Download" size={14} className="mr-1.5" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard icon="TrendingUp"  label="Выручка"          value="₽ 2 847 000"  change="+4.7%"  positive={true}  iconBg="bg-blue-50"   iconColor="text-blue-600" />
        <KpiCard icon="Layers"      label="Себестоимость"    value="₽ 1 923 000"  change="+3.9%"  positive={false} iconBg="bg-orange-50" iconColor="text-orange-500" />
        <KpiCard icon="Wallet"      label="Валовая прибыль"  value="₽ 924 000"    sub="32.4% маржа" change="+0.5%" positive={true}  iconBg="bg-green-50"  iconColor="text-green-600" />
        <KpiCard icon="BarChart3"   label="Маржа %"          value="32.4 %"       sub="цель: 33%" change="+0.5 пп" positive={true}  iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <KpiCard icon="CreditCard"  label="Дебиторка"        value="₽ 456 000"    sub="просроч. 12%" change="-8.2%" positive={true}  iconBg="bg-purple-50" iconColor="text-purple-600" />
        <KpiCard icon="ArrowLeftRight" label="ДДС (сальдо)"  value="₽ 420 000"   sub="май 2026"  change="+14.3%" positive={true}  iconBg="bg-teal-50"   iconColor="text-teal-600" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Выручка</TabsTrigger>
          <TabsTrigger value="expenses">Расходы</TabsTrigger>
          <TabsTrigger value="margin">Маржинальность</TabsTrigger>
          <TabsTrigger value="cashflow">ДДС</TabsTrigger>
        </TabsList>

        {/* ── Выручка ── */}
        <TabsContent value="revenue" className="space-y-4 mt-0">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport('Выручка')}>
              <Icon name="FileDown" size={14} className="mr-1.5" />
              Экспорт
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-800">
                  Выручка и прибыль по месяцам (12 мес.)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickFormatter={v => `${(v / 1_000_000).toFixed(1)}М`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickFormatter={v => `${(v / 1_000_000).toFixed(1)}М`}
                    />
                    <Tooltip content={<RubleTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="profit"
                      name="Прибыль"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: '#10b981', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-800">
                  Структура выручки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenuePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {revenuePieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-1">
                  {revenuePieData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-gray-600 flex-1">{item.name}</span>
                      <Progress value={item.value} className="w-20 h-1.5" />
                      <span className="font-semibold text-gray-800 w-8 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Расходы ── */}
        <TabsContent value="expenses" className="space-y-4 mt-0">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport('Расходы')}>
              <Icon name="FileDown" size={14} className="mr-1.5" />
              Экспорт
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-800">
                  Расходы по статьям (12 мес.)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={expenseData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickFormatter={v => `${(v / 1_000_000).toFixed(1)}М`}
                    />
                    <Tooltip content={<RubleTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="ФОТ"    fill="#6366f1" stackId="a" />
                    <Bar dataKey="ЗИП"    fill="#10b981" stackId="a" />
                    <Bar dataKey="ГСМ"    fill="#f59e0b" stackId="a" />
                    <Bar dataKey="Аренда" fill="#ec4899" stackId="a" />
                    <Bar dataKey="Прочее" fill="#94a3b8" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-800">
                  Топ-10 статей расходов
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5 text-xs">Статья</TableHead>
                      <TableHead className="text-right text-xs">Сумма</TableHead>
                      <TableHead className="text-right pr-5 text-xs">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseItems.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-5 py-2 text-xs text-gray-700 leading-snug">{item.name}</TableCell>
                        <TableCell className="text-right py-2 text-xs font-medium text-gray-900 whitespace-nowrap">
                          {fmt(item.amount)} ₽
                        </TableCell>
                        <TableCell className="text-right pr-5 py-2">
                          <Badge variant="outline" className="text-xs font-semibold">
                            {item.pct}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50 border-t-2 border-gray-200">
                      <TableCell className="pl-5 py-2.5 text-xs font-bold text-gray-800">Итого</TableCell>
                      <TableCell className="text-right py-2.5 text-xs font-bold text-gray-900">
                        {fmt(expenseItems.reduce((s, x) => s + x.amount, 0))} ₽
                      </TableCell>
                      <TableCell className="text-right pr-5 py-2.5 text-xs font-bold text-gray-700">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Маржинальность ── */}
        <TabsContent value="margin" className="space-y-4 mt-0">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport('Маржинальность')}>
              <Icon name="FileDown" size={14} className="mr-1.5" />
              Экспорт
            </Button>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">
                Маржа % по месяцам (12 мес.)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={marginData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis
                    domain={[27, 37]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip content={<PctTooltip />} />
                  {/* Reference lines for zones */}
                  <ReferenceLine y={33} stroke="#10b981" strokeDasharray="4 3" strokeOpacity={0.7}
                    label={{ value: 'Цель 33%', position: 'right', fontSize: 11, fill: '#10b981' }} />
                  <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 3" strokeOpacity={0.7}
                    label={{ value: 'Мин 30%', position: 'right', fontSize: 11, fill: '#f59e0b' }} />
                  <Area
                    type="monotone"
                    dataKey="margin"
                    name="Маржа %"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#marginGrad)"
                    dot={{ fill: '#10b981', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {/* Legend zones */}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-green-400 inline-block" />
                  &gt;33% — норма
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-yellow-400 inline-block" />
                  30–33% — допустимо
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-red-400 inline-block" />
                  &lt;30% — критично
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">
                Маржинальность по инженерам (топ-10)
              </CardTitle>
              <span className="text-xs text-gray-400">Нажмите заголовок для сортировки</span>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5 text-xs w-8">#</TableHead>
                    <TableHead className="text-xs">Инженер</TableHead>
                    <TableHead
                      className="text-right text-xs cursor-pointer hover:text-indigo-600 select-none"
                      onClick={() => toggleSort('revenue')}
                    >
                      Выручка <SortIcon k="revenue" />
                    </TableHead>
                    <TableHead
                      className="text-right text-xs cursor-pointer hover:text-indigo-600 select-none"
                      onClick={() => toggleSort('margin')}
                    >
                      Прибыль <SortIcon k="margin" />
                    </TableHead>
                    <TableHead
                      className="text-right pr-5 text-xs cursor-pointer hover:text-indigo-600 select-none"
                      onClick={() => toggleSort('marginPct')}
                    >
                      Маржа % <SortIcon k="marginPct" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEngineers.map((eng, i) => (
                    <TableRow key={eng.name} className="hover:bg-gray-50">
                      <TableCell className="pl-5 py-2.5 text-xs text-gray-400 font-medium">{i + 1}</TableCell>
                      <TableCell className="py-2.5 text-sm font-medium text-gray-800">{eng.name}</TableCell>
                      <TableCell className="text-right py-2.5 text-sm text-gray-700">{fmt(eng.revenue)} ₽</TableCell>
                      <TableCell className="text-right py-2.5 text-sm text-green-700 font-semibold">{fmt(eng.margin)} ₽</TableCell>
                      <TableCell className="text-right pr-5 py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold ${
                            eng.marginPct >= 35 ? 'border-green-400 text-green-700 bg-green-50' :
                            eng.marginPct >= 31 ? 'border-yellow-400 text-yellow-700 bg-yellow-50' :
                            'border-red-300 text-red-600 bg-red-50'
                          }`}
                        >
                          {eng.marginPct.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ДДС ── */}
        <TabsContent value="cashflow" className="space-y-4 mt-0">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport('ДДС')}>
              <Icon name="FileDown" size={14} className="mr-1.5" />
              Экспорт
            </Button>
          </div>

          {/* Account balances */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACCOUNTS.map(acc => (
              <Card key={acc.name}>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1 leading-snug">{acc.name}</p>
                  <p className="text-lg font-bold text-gray-900">{fmtM(acc.balance)}</p>
                  <p className="text-xs text-gray-400">{fmt(acc.balance)} ₽</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-semibold text-gray-800">
                  Движение денежных средств (12 мес.)
                </CardTitle>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Текущий остаток на счетах:</span>
                  <span className="font-bold text-gray-900 text-sm">{fmt(totalBalance)} ₽</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={cashFlowData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={v => `${(v / 1_000_000).toFixed(1)}М`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={v => `${(v / 1_000).toFixed(0)}К`}
                  />
                  <Tooltip content={<RubleTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="inflow"  name="Поступления" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar yAxisId="left" dataKey="outflow" name="Платежи"     fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.75} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="balance"
                    name="Сальдо"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Поступления (май)</p>
                  <p className="text-lg font-bold text-green-600">{fmtM(3_600_000)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Платежи (май)</p>
                  <p className="text-lg font-bold text-red-500">{fmtM(3_080_000)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Сальдо (май)</p>
                  <p className="text-lg font-bold text-indigo-600">{fmtM(520_000)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
