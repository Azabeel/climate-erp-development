import { useState } from 'react';
import {
  AreaChart, Area, Bar,
  PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Line,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 'week' | 'month' | 'quarter' | 'year';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MONTHS_12 = [
  'Июн 25', 'Июл 25', 'Авг 25', 'Сен 25', 'Окт 25', 'Ноя 25',
  'Дек 25', 'Янв 26', 'Фев 26', 'Мар 26', 'Апр 26', 'Май 26',
];

// ComposedChart: Revenue + Margin
const revenueMarginData = MONTHS_12.map((month, i) => ({
  month,
  revenue: [1820, 2050, 2310, 2180, 2640, 2490, 1980, 2250, 2580, 2910, 3150, 3470][i],
  margin: [31.2, 32.4, 33.1, 32.8, 34.0, 33.5, 31.8, 33.2, 34.4, 34.9, 35.3, 34.8][i],
}));

// AreaChart: Work orders by type (stacked)
const ordersTypeData = MONTHS_12.map((month, i) => ({
  month,
  Ремонт:  [62, 71, 80, 74, 92, 85, 65, 76, 89, 102, 112, 118][i],
  ТО:      [28, 32, 36, 34, 41, 38, 30, 35, 40, 46, 51, 54][i],
  Монтаж:  [15, 18, 22, 20, 25, 23, 18, 21, 24, 28, 31, 34][i],
  Гарантия: [9, 10, 11, 10, 13, 12, 9, 11, 12, 14, 15, 16][i],
}));

// PieChart: Top clients by revenue
const topClientsPie = [
  { name: 'ООО «АгроХолдинг»',    value: 840, color: '#6366f1' },
  { name: 'ТЦ «Галактика»',       value: 720, color: '#10b981' },
  { name: 'Завод «Металлург»',     value: 615, color: '#f59e0b' },
  { name: 'БЦ «Олимп»',           value: 530, color: '#ec4899' },
  { name: 'Остальные',             value: 765, color: '#94a3b8' },
];

// Top-8 engineers table
const topEngineers = [
  { rank: 1,  name: 'Петров А.В.',    revenue: '520 тыс ₽', orders: 52, margin: 37.4, nps: 96 },
  { rank: 2,  name: 'Иванов К.П.',    revenue: '484 тыс ₽', orders: 48, margin: 35.9, nps: 94 },
  { rank: 3,  name: 'Сидоров М.Н.',   revenue: '451 тыс ₽', orders: 45, margin: 34.8, nps: 93 },
  { rank: 4,  name: 'Козлов Р.Е.',    revenue: '412 тыс ₽', orders: 41, margin: 34.1, nps: 91 },
  { rank: 5,  name: 'Новиков Д.С.',   revenue: '384 тыс ₽', orders: 38, margin: 33.5, nps: 90 },
  { rank: 6,  name: 'Морозов В.А.',   revenue: '351 тыс ₽', orders: 35, margin: 32.8, nps: 88 },
  { rank: 7,  name: 'Алексеев И.О.',  revenue: '324 тыс ₽', orders: 32, margin: 32.1, nps: 87 },
  { rank: 8,  name: 'Громов П.Г.',    revenue: '283 тыс ₽', orders: 28, margin: 30.7, nps: 84 },
];

// Top-8 clients table
const topClients = [
  { rank: 1, name: 'ООО «АгроХолдинг»',     revenue: '840 тыс ₽', sites: 8, nps: 94, contract: 'Договорной' },
  { rank: 2, name: 'ТЦ «Галактика»',        revenue: '720 тыс ₽', sites: 5, nps: 91, contract: 'Абонемент' },
  { rank: 3, name: 'Завод «Металлург»',      revenue: '615 тыс ₽', sites: 3, nps: 88, contract: 'Договорной' },
  { rank: 4, name: 'БЦ «Олимп»',            revenue: '530 тыс ₽', sites: 4, nps: 93, contract: 'Абонемент' },
  { rank: 5, name: 'Гипермаркет «Магнит»',  revenue: '482 тыс ₽', sites: 6, nps: 86, contract: 'Корпоративный' },
  { rank: 6, name: 'ООО «СтройГрупп»',      revenue: '421 тыс ₽', sites: 2, nps: 82, contract: 'Разовый' },
  { rank: 7, name: 'ТЦ «Арена»',            revenue: '394 тыс ₽', sites: 3, nps: 90, contract: 'Абонемент' },
  { rank: 8, name: 'Завод «Прибор»',        revenue: '362 тыс ₽', sites: 2, nps: 85, contract: 'Договорной' },
];

// Heat Map: 7 days × 12 hours (09-20)
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const HOURS = Array.from({ length: 12 }, (_, i) => `${9 + i}:00`);

const heatmapData: number[][] = [
  // Each row is an hour, each column is a day
  [2, 1, 2, 1, 1, 0, 0],  // 09:00
  [3, 3, 4, 3, 3, 1, 0],  // 10:00
  [5, 4, 5, 5, 4, 2, 1],  // 11:00
  [4, 5, 4, 4, 5, 2, 1],  // 12:00
  [3, 3, 3, 4, 3, 1, 0],  // 13:00
  [4, 4, 5, 4, 4, 2, 1],  // 14:00
  [5, 5, 4, 5, 4, 3, 1],  // 15:00
  [4, 4, 3, 4, 3, 2, 0],  // 16:00
  [3, 3, 4, 3, 3, 1, 0],  // 17:00
  [2, 2, 2, 2, 2, 1, 0],  // 18:00
  [1, 1, 1, 1, 1, 0, 0],  // 19:00
  [0, 0, 1, 0, 0, 0, 0],  // 20:00
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function heatCellStyle(val: number): { bg: string; text: string } {
  if (val === 0) return { bg: '#f0fdf4', text: '#15803d' };
  if (val === 1) return { bg: '#d1fae5', text: '#065f46' };
  if (val === 2) return { bg: '#fef9c3', text: '#713f12' };
  if (val === 3) return { bg: '#fed7aa', text: '#7c2d12' };
  if (val === 4) return { bg: '#fecaca', text: '#7f1d1d' };
  return { bg: '#991b1b', text: '#ffffff' };  // 5+
}

function contractBadgeColor(type: string): string {
  if (type === 'Абонемент')    return 'border-indigo-400 text-indigo-700 bg-indigo-50';
  if (type === 'Договорной')   return 'border-green-400 text-green-700 bg-green-50';
  if (type === 'Корпоративный') return 'border-blue-400 text-blue-700 bg-blue-50';
  return 'border-gray-400 text-gray-600 bg-gray-50';
}

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

// ─── Metric Cards ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  iconBg: string;
  iconColor: string;
}

function MetricCard({ icon, label, value, change, positive, iconBg, iconColor }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon name={icon} size={20} className={iconColor} />
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            positive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}>
            {change}
          </span>
        </div>
        <p className="text-2xl font-bold mt-3 tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueMarginTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name === 'Выручка' ? `${p.value} тыс ₽` : `${p.value}%`}
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboardFull() {
  const [period, setPeriod] = useState<Period>('year');

  const periods: { key: Period; label: string }[] = [
    { key: 'week',    label: 'Неделя' },
    { key: 'month',   label: 'Месяц' },
    { key: 'quarter', label: 'Квартал' },
    { key: 'year',    label: 'Год' },
  ];

  const handleDownloadPdf = () => {
    toast.success('Формируется PDF-отчёт', {
      description: 'Файл будет готов через несколько секунд и скачается автоматически.',
    });
  };

  const handleExportExcel = () => {
    toast.success('Экспорт в Excel запущен', {
      description: 'Таблица с данными за выбранный период будет скачана.',
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Аналитический дашборд</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            АСУ СЦ «Сервис Климат» · Отчётный период: Июнь 2025 — Май 2026
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-2">
            <Icon name="FileDown" size={15} />
            Скачать PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
            <Icon name="Sheet" size={15} />
            Экспорт Excel
          </Button>
        </div>
      </div>

      {/* ── Period switcher ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              period === p.key
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── 5 Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          icon="TrendingUp"
          label="Выручка"
          value="3.47 млн ₽"
          change="+18%"
          positive={true}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <MetricCard
          icon="ClipboardList"
          label="Нарядов"
          value="847"
          change="+12%"
          positive={true}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
        />
        <MetricCard
          icon="ShieldCheck"
          label="Закрыто в SLA"
          value="94.3%"
          change="-1.2%"
          positive={false}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <MetricCard
          icon="Star"
          label="NPS"
          value="78"
          change="+5"
          positive={true}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />
        <MetricCard
          icon="Percent"
          label="Маржа"
          value="34.8%"
          change="+2.1%"
          positive={true}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* ── 3 Charts Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Chart 1: ComposedChart — Revenue + Margin */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Выручка и маржа</CardTitle>
            <p className="text-xs text-muted-foreground">Bar — выручка (тыс ₽), Line — маржа (%)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={revenueMarginData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[28, 40]}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<RevenueMarginTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Выручка"
                  fill="#6366f1"
                  radius={[3, 3, 0, 0]}
                  opacity={0.85}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="margin"
                  name="Маржа"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: AreaChart — Orders by type (stacked) */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Наряды по типам</CardTitle>
            <p className="text-xs text-muted-foreground">Ремонт / ТО / Монтаж / Гарантия</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={ordersTypeData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRepair" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="gradMaint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="gradInstall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="gradWarranty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number, name: string) => [v, name]}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Ремонт"   stackId="1" stroke="#6366f1" fill="url(#gradRepair)"   strokeWidth={1.5} />
                <Area type="monotone" dataKey="ТО"       stackId="1" stroke="#10b981" fill="url(#gradMaint)"    strokeWidth={1.5} />
                <Area type="monotone" dataKey="Монтаж"   stackId="1" stroke="#f59e0b" fill="url(#gradInstall)"  strokeWidth={1.5} />
                <Area type="monotone" dataKey="Гарантия" stackId="1" stroke="#ec4899" fill="url(#gradWarranty)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: PieChart — Top clients */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Топ клиенты</CardTitle>
            <p className="text-xs text-muted-foreground">Доля выручки, тыс ₽</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={topClientsPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {topClientsPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} тыс ₽`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5 mt-1">
              {topClientsPie.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground truncate flex-1">{item.name}</span>
                  <span className="font-semibold tabular-nums">{item.value} тыс</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2 Tables Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Table 1: Top-8 Engineers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon name="Users" size={16} className="text-indigo-500" />
              Топ-8 инженеров
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-10 pl-4">#</TableHead>
                  <TableHead>Инженер</TableHead>
                  <TableHead className="text-right">Выручка</TableHead>
                  <TableHead className="text-right">Нарядов</TableHead>
                  <TableHead className="text-right">Маржа</TableHead>
                  <TableHead className="text-right pr-4">NPS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEngineers.map((eng) => (
                  <TableRow key={eng.rank} className="hover:bg-muted/20">
                    <TableCell className="pl-4 font-medium text-sm">
                      {rankMedal(eng.rank)}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{eng.name}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{eng.revenue}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{eng.orders}</TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold ${
                        eng.margin >= 35 ? 'text-green-700' : eng.margin >= 33 ? 'text-blue-700' : 'text-orange-600'
                      }`}>
                        {eng.margin}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <span className={`text-sm font-semibold ${
                        eng.nps >= 93 ? 'text-green-700' : eng.nps >= 88 ? 'text-blue-700' : 'text-muted-foreground'
                      }`}>
                        {eng.nps}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Table 2: Top-8 Clients */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon name="Building2" size={16} className="text-emerald-500" />
              Топ-8 клиентов
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-10 pl-4">#</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead className="text-right">Выручка</TableHead>
                  <TableHead className="text-right">Объектов</TableHead>
                  <TableHead className="text-right">NPS</TableHead>
                  <TableHead className="pr-4">Договор</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((client) => (
                  <TableRow key={client.rank} className="hover:bg-muted/20">
                    <TableCell className="pl-4 font-medium text-sm">
                      {rankMedal(client.rank)}
                    </TableCell>
                    <TableCell className="font-medium text-sm max-w-[150px] truncate">
                      {client.name}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{client.revenue}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{client.sites}</TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold ${
                        client.nps >= 91 ? 'text-green-700' : client.nps >= 85 ? 'text-blue-700' : 'text-muted-foreground'
                      }`}>
                        {client.nps}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4">
                      <Badge
                        variant="outline"
                        className={`text-xs ${contractBadgeColor(client.contract)}`}
                      >
                        {client.contract}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Heat Map: Load by hour × day ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon name="Activity" size={16} className="text-rose-500" />
                Тепловая карта загрузки
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Среднее кол-во активных нарядов в разрезе дня недели и часа
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {[
                { label: '0', bg: '#f0fdf4', text: '#15803d' },
                { label: '1', bg: '#d1fae5', text: '#065f46' },
                { label: '2', bg: '#fef9c3', text: '#713f12' },
                { label: '3', bg: '#fed7aa', text: '#7c2d12' },
                { label: '4', bg: '#fecaca', text: '#7f1d1d' },
                { label: '5+', bg: '#991b1b', text: '#ffffff' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: item.bg, color: item.text }}
                  >
                    {item.label}
                  </span>
                </span>
              ))}
              <span className="text-muted-foreground">нарядов</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[520px]">
            {/* SVG Grid */}
            <svg
              width="100%"
              viewBox={`0 0 ${7 * 64 + 56} ${12 * 44 + 32}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Day headers */}
              {DAYS.map((day, di) => (
                <text
                  key={day}
                  x={56 + di * 64 + 28}
                  y={18}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill="#64748b"
                >
                  {day}
                </text>
              ))}

              {/* Rows */}
              {HOURS.map((hour, hi) => {
                const rowY = 32 + hi * 44;
                return (
                  <g key={hour}>
                    {/* Hour label */}
                    <text
                      x={50}
                      y={rowY + 22}
                      textAnchor="end"
                      fontSize={11}
                      fill="#94a3b8"
                    >
                      {hour}
                    </text>

                    {/* Day cells */}
                    {DAYS.map((_, di) => {
                      const val = heatmapData[hi][di];
                      const { bg, text } = heatCellStyle(val);
                      const cellX = 56 + di * 64;
                      return (
                        <g key={di}>
                          <rect
                            x={cellX + 2}
                            y={rowY + 2}
                            width={60}
                            height={40}
                            rx={6}
                            ry={6}
                            fill={bg}
                          />
                          <text
                            x={cellX + 32}
                            y={rowY + 26}
                            textAnchor="middle"
                            fontSize={14}
                            fontWeight={700}
                            fill={text}
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
        <Icon name="CheckCircle2" size={14} className="text-green-500 shrink-0" />
        Данные обновлены: сегодня в 07:30 · Период: Июнь 2025 — Май 2026 · Все цифры в рублях
      </div>
    </div>
  );
}
