import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 'quarter' | 'half' | 'year';
type SortKey = 'deals' | 'revenue' | 'conversion' | 'avgDeal';
type SortDir = 'asc' | 'desc';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MONTHS_12 = [
  'Июн 25', 'Июл 25', 'Авг 25', 'Сен 25', 'Окт 25', 'Ноя 25',
  'Дек 25', 'Янв 26', 'Фев 26', 'Мар 26', 'Апр 26', 'Май 26',
];
const MONTHS_6 = MONTHS_12.slice(6);
const MONTHS_3 = MONTHS_12.slice(9);

const REVENUE_PLAN = [1950, 2100, 2400, 2300, 2700, 2600, 2100, 2400, 2700, 3000, 3200, 3600];
const REVENUE_FACT = [1820, 2050, 2310, 2180, 2640, 2490, 1980, 2250, 2580, 2910, 3150, 3470];

const CONVERSION = [21.4, 22.1, 23.5, 22.8, 24.2, 23.7, 22.0, 23.4, 24.8, 25.6, 26.1, 25.4];

// Services bar chart data (fixed, not filtered by period for simplicity)
const servicesSalesData = [
  { service: 'Монтаж',       revenue: 4820, deals: 62 },
  { service: 'Обслуживание', revenue: 7350, deals: 148 },
  { service: 'Ремонт',       revenue: 9410, deals: 215 },
  { service: 'Гарантия',     revenue: 1240, deals: 54 },
];

// PieChart: channels
const channelData = [
  { name: 'Сайт',           value: 34, color: '#6366f1' },
  { name: 'Avito',          value: 22, color: '#10b981' },
  { name: 'Рекомендации',   value: 28, color: '#f59e0b' },
  { name: 'Обзвон',         value: 16, color: '#ec4899' },
];

// Top managers (all data)
const ALL_MANAGERS = [
  { id: '1', name: 'Петров А.В.',    deals: 52, revenue: 3_840_000, conversion: 31.2, avgDeal: 73_846 },
  { id: '2', name: 'Иванова К.П.',   deals: 47, revenue: 3_520_000, conversion: 28.7, avgDeal: 74_894 },
  { id: '3', name: 'Сидоров М.Н.',   deals: 41, revenue: 3_190_000, conversion: 27.4, avgDeal: 77_805 },
  { id: '4', name: 'Козлова Р.Е.',   deals: 38, revenue: 2_840_000, conversion: 26.1, avgDeal: 74_737 },
  { id: '5', name: 'Новиков Д.С.',   deals: 35, revenue: 2_610_000, conversion: 25.8, avgDeal: 74_571 },
  { id: '6', name: 'Морозов В.А.',   deals: 30, revenue: 2_240_000, conversion: 24.3, avgDeal: 74_667 },
  { id: '7', name: 'Алексеев И.О.',  deals: 27, revenue: 2_010_000, conversion: 23.9, avgDeal: 74_444 },
  { id: '8', name: 'Громов П.Г.',    deals: 24, revenue: 1_780_000, conversion: 22.5, avgDeal: 74_167 },
  { id: '9', name: 'Кирилова Е.В.',  deals: 21, revenue: 1_520_000, conversion: 21.8, avgDeal: 72_381 },
  { id: '10', name: 'Зубов А.Н.',    deals: 18, revenue: 1_290_000, conversion: 20.4, avgDeal: 71_667 },
];

// Top clients
const TOP_CLIENTS = [
  { rank: 1,  name: 'ООО «АгроХолдинг»',     revenue: 2_840_000, deals: 38, channel: 'Рекомендации', contract: 'Договорной' },
  { rank: 2,  name: 'ТЦ «Галактика»',         revenue: 2_520_000, deals: 31, channel: 'Сайт',         contract: 'Абонемент' },
  { rank: 3,  name: 'Завод «Металлург»',       revenue: 2_180_000, deals: 27, channel: 'Обзвон',       contract: 'Договорной' },
  { rank: 4,  name: 'БЦ «Олимп»',             revenue: 1_940_000, deals: 24, channel: 'Рекомендации', contract: 'Абонемент' },
  { rank: 5,  name: 'Гипермаркет «Магнит»',   revenue: 1_720_000, deals: 22, channel: 'Сайт',         contract: 'Корпоративный' },
  { rank: 6,  name: 'ООО «СтройГрупп»',       revenue: 1_480_000, deals: 19, channel: 'Avito',        contract: 'Разовый' },
  { rank: 7,  name: 'ТЦ «Арена»',             revenue: 1_310_000, deals: 17, channel: 'Рекомендации', contract: 'Абонемент' },
  { rank: 8,  name: 'Завод «Прибор»',         revenue: 1_140_000, deals: 15, channel: 'Обзвон',       contract: 'Договорной' },
  { rank: 9,  name: 'ООО «ТехноСтрой»',       revenue:   980_000, deals: 13, channel: 'Сайт',         contract: 'Разовый' },
  { rank: 10, name: 'Санаторий «Лесной»',     revenue:   850_000, deals: 11, channel: 'Avito',        contract: 'Договорной' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} тыс`;
  return String(n);
}

function fmtRub(n: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
}

function contractBadge(type: string): string {
  if (type === 'Абонемент')     return 'border-indigo-400 text-indigo-700 bg-indigo-50';
  if (type === 'Договорной')    return 'border-green-400 text-green-700 bg-green-50';
  if (type === 'Корпоративный') return 'border-blue-400 text-blue-700 bg-blue-50';
  return 'border-gray-400 text-gray-600 bg-gray-50';
}

function channelBadge(ch: string): string {
  if (ch === 'Рекомендации') return 'border-amber-400 text-amber-700 bg-amber-50';
  if (ch === 'Avito')        return 'border-emerald-400 text-emerald-700 bg-emerald-50';
  if (ch === 'Сайт')         return 'border-indigo-400 text-indigo-700 bg-indigo-50';
  return 'border-pink-400 text-pink-700 bg-pink-50';
}

function rankLabel(r: number): string {
  if (r === 1) return '🥇';
  if (r === 2) return '🥈';
  if (r === 3) return '🥉';
  return String(r);
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value} тыс ₽</strong>
        </p>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConversionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-muted-foreground mb-1">{label}</p>
      <p style={{ color: '#6366f1' }}>Конверсия: <strong>{payload[0]?.value}%</strong></p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ServicesTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.name === 'Выручка' ? `${p.value} тыс ₽` : `${p.value} шт`}</strong>
        </p>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieTooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-border rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold" style={{ color: item.payload.color }}>{item.name}</p>
      <p className="text-muted-foreground">Доля: <strong>{item.value}%</strong></p>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ icon, label, value, change, positive, iconBg, iconColor }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon name={icon} size={20} className={iconColor} />
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
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

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <Icon name="ChevronsUpDown" size={14} className="text-muted-foreground ml-1" />;
  return dir === 'asc'
    ? <Icon name="ChevronUp" size={14} className="text-indigo-600 ml-1" />
    : <Icon name="ChevronDown" size={14} className="text-indigo-600 ml-1" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesAnalyticsFull() {
  const [period, setPeriod] = useState<Period>('year');
  const [manager, setManager] = useState<string>('all');
  const [channel, setChannel] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Derived data based on filters ─────────────────────────────────────────
  const months = period === 'year' ? MONTHS_12 : period === 'half' ? MONTHS_6 : MONTHS_3;
  const startIdx = period === 'year' ? 0 : period === 'half' ? 6 : 9;

  const revenueData = months.map((month, i) => ({
    month,
    'Факт': REVENUE_FACT[startIdx + i],
    'План': REVENUE_PLAN[startIdx + i],
  }));

  const conversionData = months.map((month, i) => ({
    month,
    'Конверсия': CONVERSION[startIdx + i],
  }));

  // Filtered channel pie data
  const pieData = channel === 'all'
    ? channelData
    : channelData.filter(d => d.name === channel);

  // KPI aggregates
  const totalRevenueFact = REVENUE_FACT.slice(startIdx).reduce((s, v) => s + v, 0);
  const totalRevenuePlan = REVENUE_PLAN.slice(startIdx).reduce((s, v) => s + v, 0);
  const planPct = Math.round((totalRevenueFact / totalRevenuePlan) * 100);
  const avgConversion = (CONVERSION.slice(startIdx).reduce((s, v) => s + v, 0) / months.length).toFixed(1);
  const totalDeals = ALL_MANAGERS.reduce((s, m) => s + m.deals, 0);
  const totalRevAll = ALL_MANAGERS.reduce((s, m) => s + m.revenue, 0);
  const avgDeal = Math.round(totalRevAll / totalDeals);

  // Managers table (filtered + sorted)
  const filteredManagers = useMemo(() => {
    let list = manager === 'all' ? ALL_MANAGERS : ALL_MANAGERS.filter(m => m.id === manager);
    list = [...list].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === 'asc' ? diff : -diff;
    });
    return list;
  }, [manager, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function handleExport() {
    toast.success('Отчёт формируется...', {
      description: 'Файл будет доступен для скачивания через несколько секунд.',
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Аналитика продаж</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Выручка, конверсия, каналы и эффективность менеджеров
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2 self-start sm:self-auto">
          <Icon name="Download" size={16} />
          Экспорт
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Icon name="Filter" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Фильтры:</span>

            <Select value={period} onValueChange={v => setPeriod(v as Period)}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarter">Квартал (3 мес)</SelectItem>
                <SelectItem value="half">Полугодие (6 мес)</SelectItem>
                <SelectItem value="year">Год (12 мес)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger className="w-48 h-8 text-sm">
                <SelectValue placeholder="Менеджер" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все менеджеры</SelectItem>
                {ALL_MANAGERS.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue placeholder="Канал" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все каналы</SelectItem>
                {channelData.map(c => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(period !== 'year' || manager !== 'all' || channel !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-sm gap-1 text-muted-foreground"
                onClick={() => { setPeriod('year'); setManager('all'); setChannel('all'); }}
              >
                <Icon name="X" size={14} />
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon="TrendingUp"
          label="Выручка за период"
          value={`${fmt(totalRevenueFact * 1000)} ₽`}
          change={`${planPct}% от плана`}
          positive={planPct >= 95}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <KpiCard
          icon="Handshake"
          label="Новых сделок"
          value={String(totalDeals)}
          change="+18 vs пред."
          positive={true}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <KpiCard
          icon="Percent"
          label="Конверсия"
          value={`${avgConversion}%`}
          change="+1.8 п.п."
          positive={true}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <KpiCard
          icon="Banknote"
          label="Средний чек"
          value={fmtRub(avgDeal)}
          change="+4.2%"
          positive={true}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />
      </div>

      {/* ── Revenue Plan vs Fact ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Icon name="AreaChart" size={18} className="text-indigo-500" />
            Выручка: план vs факт (тыс ₽)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradFact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPlan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={48} />
              <Tooltip content={<RevenueTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone" dataKey="План"
                stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 3"
                fill="url(#gradPlan)"
              />
              <Area
                type="monotone" dataKey="Факт"
                stroke="#6366f1" strokeWidth={2.5}
                fill="url(#gradFact)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Services BarChart + Channel PieChart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Icon name="BarChart2" size={18} className="text-emerald-500" />
              Продажи по услугам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={servicesSalesData}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={52} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={36} />
                <Tooltip content={<ServicesTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="deals" name="Сделок" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Icon name="PieChart" size={18} className="text-amber-500" />
              Каналы привлечения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {channelData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground flex-1">{item.name}</span>
                    <span className="text-sm font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Conversion LineChart ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Icon name="TrendingUp" size={18} className="text-pink-500" />
            Динамика конверсии воронки (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={conversionData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[18, 30]} width={36} />
              <Tooltip content={<ConversionTooltip />} />
              <Line
                type="monotone" dataKey="Конверсия"
                stroke="#6366f1" strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Top Managers Table ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Icon name="Users" size={18} className="text-indigo-500" />
            Топ-10 менеджеров
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Менеджер</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('deals')}
                >
                  <span className="flex items-center">
                    Сделок
                    <SortIcon active={sortKey === 'deals'} dir={sortDir} />
                  </span>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('revenue')}
                >
                  <span className="flex items-center">
                    Выручка
                    <SortIcon active={sortKey === 'revenue'} dir={sortDir} />
                  </span>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('conversion')}
                >
                  <span className="flex items-center">
                    Конверсия
                    <SortIcon active={sortKey === 'conversion'} dir={sortDir} />
                  </span>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort('avgDeal')}
                >
                  <span className="flex items-center">
                    Средний чек
                    <SortIcon active={sortKey === 'avgDeal'} dir={sortDir} />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManagers.map((m, idx) => (
                <TableRow key={m.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-center text-base">
                    {rankLabel(idx + 1)}
                  </TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.deals}</TableCell>
                  <TableCell className="font-semibold">{fmt(m.revenue)} ₽</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        m.conversion >= 28
                          ? 'border-green-400 text-green-700 bg-green-50'
                          : m.conversion >= 24
                          ? 'border-amber-400 text-amber-700 bg-amber-50'
                          : 'border-gray-300 text-gray-600 bg-gray-50'
                      }
                    >
                      {m.conversion}%
                    </Badge>
                  </TableCell>
                  <TableCell>{fmtRub(m.avgDeal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Top Clients Table ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Icon name="Building2" size={18} className="text-emerald-500" />
            Топ-10 клиентов по выручке
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Выручка</TableHead>
                <TableHead>Сделок</TableHead>
                <TableHead>Канал</TableHead>
                <TableHead>Договор</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_CLIENTS.map(c => (
                <TableRow key={c.rank} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-center text-base">
                    {rankLabel(c.rank)}
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-semibold">{fmt(c.revenue)} ₽</TableCell>
                  <TableCell>{c.deals}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={channelBadge(c.channel)}>
                      {c.channel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={contractBadge(c.contract)}>
                      {c.contract}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
