import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'quarter' | 'year';

// ─── Data ────────────────────────────────────────────────────────────────────

const monthlyData = [
  { month: 'Янв', revenue: 6200000, cost: 4100000, margin: 33.9 },
  { month: 'Фев', revenue: 6580000, cost: 4340000, margin: 34.1 },
  { month: 'Мар', revenue: 7100000, cost: 4650000, margin: 34.5 },
  { month: 'Апр', revenue: 7450000, cost: 4880000, margin: 34.5 },
  { month: 'Май', revenue: 7820000, cost: 5130000, margin: 34.4 },
  { month: 'Июн', revenue: 8150000, cost: 5330000, margin: 34.6 },
  { month: 'Июл', revenue: 8700000, cost: 5680000, margin: 34.7 },
  { month: 'Авг', revenue: 8490000, cost: 5540000, margin: 34.7 },
  { month: 'Сен', revenue: 8950000, cost: 5830000, margin: 34.9 },
  { month: 'Окт', revenue: 9240000, cost: 6098000, margin: 34.0 },
  { month: 'Ноя', revenue: 8780000, cost: 5790000, margin: 34.1 },
  { month: 'Дек', revenue: 8120000, cost: 5360000, margin: 34.0 },
];

const engineerMarginData = [
  { name: 'Петров А.С.',    orders: 42, revenue: 1240000, cost: 780000,  margin: 460000, marginPct: 37.1 },
  { name: 'Сидоров В.И.',  orders: 38, revenue: 1080000, cost: 680000,  margin: 400000, marginPct: 37.0 },
  { name: 'Козлов М.Р.',   orders: 35, revenue: 980000,  cost: 630000,  margin: 350000, marginPct: 35.7 },
  { name: 'Иванов Д.К.',   orders: 31, revenue: 870000,  cost: 570000,  margin: 300000, marginPct: 34.5 },
  { name: 'Новиков Е.П.',  orders: 28, revenue: 790000,  cost: 540000,  margin: 250000, marginPct: 31.6 },
  { name: 'Фёдоров И.Т.',  orders: 25, revenue: 680000,  cost: 490000,  margin: 190000, marginPct: 27.9 },
  { name: 'Морозов А.Г.',  orders: 19, revenue: 490000,  cost: 390000,  margin: 100000, marginPct: 20.4 },
  { name: 'Волков С.Д.',   orders: 14, revenue: 340000,  cost: 290000,  margin:  50000, marginPct: 14.7 },
];

const clientMarginData = [
  { client: 'ООО "МегаМолл"',      orders: 18, revenue: 1850000, marginPct: 38.4, trend: 'up' },
  { client: 'АО "ПромСтрой"',      orders: 14, revenue: 1420000, marginPct: 36.9, trend: 'up' },
  { client: 'ООО "НоваФарм"',      orders: 11, revenue: 1180000, marginPct: 35.2, trend: 'up' },
  { client: 'ООО "Альфа-Центр"',   orders: 9,  revenue: 960000,  marginPct: 34.8, trend: 'down' },
  { client: 'ПАО "СтройИнвест"',   orders: 12, revenue: 1320000, marginPct: 34.1, trend: 'up' },
  { client: 'ООО "ТехноСервис"',   orders: 8,  revenue: 780000,  marginPct: 32.7, trend: 'down' },
  { client: 'ЗАО "РосТех"',        orders: 7,  revenue: 650000,  marginPct: 31.5, trend: 'down' },
  { client: 'ИП Смирнов А.П.',     orders: 15, revenue: 480000,  marginPct: 30.2, trend: 'up' },
  { client: 'ООО "КлимаСити"',     orders: 6,  revenue: 420000,  marginPct: 28.8, trend: 'down' },
  { client: 'ООО "БизнесПлаза"',   orders: 5,  revenue: 380000,  marginPct: 26.4, trend: 'down' },
];

const revenueStructure = [
  { name: 'Ремонт',   value: 40, color: '#6366F1' },
  { name: 'ТО',       value: 25, color: '#10B981' },
  { name: 'Монтаж',   value: 20, color: '#F59E0B' },
  { name: 'ЗИП',      value: 10, color: '#3B82F6' },
  { name: 'Прочее',   value:  5, color: '#8B5CF6' },
];

const costStructure = [
  { name: 'Материалы',  value: 1840000 },
  { name: 'Зарплата',   value: 2100000 },
  { name: 'ЗИП',        value: 980000  },
  { name: 'Топливо',    value: 420000  },
  { name: 'Накладные',  value: 758000  },
];

const quarterlyMargin = [
  { quarter: 'Q1 2024', actual: 31.2, target: 38 },
  { quarter: 'Q2 2024', actual: 32.8, target: 38 },
  { quarter: 'Q3 2024', actual: 33.5, target: 38 },
  { quarter: 'Q4 2024', actual: 34.4, target: 38 },
  { quarter: 'Q1 2025', actual: 34.9, target: 38 },
  { quarter: 'Q2 2025', actual: 35.6, target: 38 },
  { quarter: 'Q3 2025', actual: 36.1, target: 38 },
  { quarter: 'Q4 2025', actual: 34.0, target: 38 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)} млн ₽`
    : `${n.toLocaleString('ru-RU')} ₽`;

const fmtFull = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

const marginColor = (pct: number) => {
  if (pct >= 35) return 'bg-green-500';
  if (pct >= 20) return 'bg-yellow-500';
  return 'bg-red-500';
};

const marginBadgeVariant = (pct: number): 'default' | 'secondary' | 'destructive' => {
  if (pct >= 35) return 'default';
  if (pct >= 20) return 'secondary';
  return 'destructive';
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ComposedTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}:</span>
          <span className="font-medium">
            {entry.name === 'Маржа %' ? `${entry.value}%` : entry.value.toLocaleString('ru-RU') + ' ₽'}
          </span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
      <p className="text-gray-700">{payload[0].value}%</p>
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  sub: string;
  subPositive?: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const KpiCard = ({ title, value, sub, subPositive, icon, iconBg, iconColor }: KpiCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500 font-medium">{title}</span>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon name={icon} size={18} className={iconColor} />
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs mt-1 font-medium ${subPositive === false ? 'text-red-500' : subPositive ? 'text-green-600' : 'text-gray-500'}`}>
        {sub}
      </p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FinancialSummary = () => {
  const [period, setPeriod] = useState<Period>('month');

  const periods: { key: Period; label: string }[] = [
    { key: 'week',    label: 'Неделя'  },
    { key: 'month',   label: 'Месяц'   },
    { key: 'quarter', label: 'Квартал' },
    { key: 'year',    label: 'Год'     },
  ];

  const handleExport = () => {
    toast.success('Финансовый отчёт формируется', {
      description: 'PDF будет загружен через несколько секунд',
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Финансовая сводка</h1>
          <p className="text-sm text-gray-500 mt-0.5">Маржинальность, выручка и структура затрат</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period switcher */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p.key
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Icon name="Download" size={15} className="mr-1.5" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* ── KPI Cards (2 rows × 3) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Выручка"
          value="9 240 000 ₽"
          sub="↑ +18% к прошлому периоду"
          subPositive={true}
          icon="TrendingUp"
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <KpiCard
          title="Себестоимость"
          value="6 098 000 ₽"
          sub="↑ +12% к прошлому периоду"
          subPositive={false}
          icon="Package"
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <KpiCard
          title="Валовая прибыль"
          value="3 142 000 ₽"
          sub="Маржа 34.0%"
          icon="BarChart2"
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <KpiCard
          title="Материалы"
          value="1 840 000 ₽"
          sub="Доля в выручке: 20%"
          icon="Layers"
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <KpiCard
          title="Зарплата"
          value="2 100 000 ₽"
          sub="Доля в выручке: 22.7%"
          icon="Users"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <KpiCard
          title="EBITDA"
          value="2 450 000 ₽"
          sub="↑ +21% к прошлому периоду"
          subPositive={true}
          icon="Activity"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* ── ComposedChart: выручка + себестоимость + маржа% ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Динамика выручки и маржинальности</h2>
            <p className="text-xs text-gray-400 mt-0.5">12 месяцев</p>
          </div>
          <Badge variant="secondary">Год</Badge>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyData} margin={{ top: 4, right: 40, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={v => `${(v / 1_000_000).toFixed(1)}м`}
              width={52}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[28, 40]}
              tickFormatter={v => `${v}%`}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              width={40}
            />
            <Tooltip content={<ComposedTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="#6366F1" radius={[3, 3, 0, 0]} opacity={0.85} />
            <Bar yAxisId="left" dataKey="cost"    name="Себестоимость" fill="#F87171" radius={[3, 3, 0, 0]} opacity={0.75} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              name="Маржа %"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10B981' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Two-column: Pie + Horizontal Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* PieChart — структура выручки */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Структура выручки</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={revenueStructure}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueStructure.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {revenueStructure.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal BarChart — структура себестоимости */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Структура себестоимости</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              layout="vertical"
              data={costStructure}
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={v => `${(v / 1_000_000).toFixed(1)}м`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <Tooltip
                formatter={(v: number) => [fmtFull(v), 'Сумма']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="value" name="Сумма" radius={[0, 4, 4, 0]}>
                {costStructure.map((_, i) => (
                  <Cell
                    key={i}
                    fill={['#10B981', '#6366F1', '#3B82F6', '#F59E0B', '#8B5CF6'][i % 5]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── AreaChart — динамика маржи (2 года, 8 кварталов) ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Динамика маржинальности</h2>
            <p className="text-xs text-gray-400 mt-0.5">2 года · 8 кварталов · целевой показатель 38%</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-500 inline-block rounded" />
              Факт
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-red-400 inline-block rounded border-dashed border-t border-red-400" />
              Цель 38%
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={quarterlyMargin} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis domain={[28, 42]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#6b7280' }} width={40} />
            <Tooltip
              formatter={(v: number, name: string) => [`${v}%`, name === 'actual' ? 'Факт' : 'Цель']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <ReferenceLine y={38} stroke="#EF4444" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: '38%', position: 'right', fontSize: 11, fill: '#EF4444' }} />
            <Area
              type="monotone"
              dataKey="actual"
              name="actual"
              stroke="#6366F1"
              strokeWidth={2.5}
              fill="url(#marginGrad)"
              dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Таблица маржинальности по инженерам ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Маржинальность по инженерам</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info('Детальный отчёт открывается...')}
          >
            <Icon name="ExternalLink" size={14} className="mr-1.5" />
            Подробнее
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 pr-4 text-gray-500 font-medium">Инженер</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Нарядов</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Выручка</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Себестоимость</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Прибыль</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Маржа %</th>
                <th className="py-2.5 pl-3 text-gray-500 font-medium w-32">Прогресс</th>
              </tr>
            </thead>
            <tbody>
              {engineerMarginData.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-900">{row.name}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{row.orders}</td>
                  <td className="py-3 px-3 text-right text-gray-700">{fmt(row.revenue)}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{fmt(row.cost)}</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-900">{fmt(row.margin)}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge variant={marginBadgeVariant(row.marginPct)}>
                      {row.marginPct.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="py-3 pl-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${marginColor(row.marginPct)}`}
                          style={{ width: `${Math.min(row.marginPct / 50 * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{row.marginPct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Таблица маржинальности по клиентам (топ-10) ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Маржинальность по клиентам — Топ 10</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info('Открываем карточки клиентов...')}
          >
            <Icon name="Users" size={14} className="mr-1.5" />
            Все клиенты
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 pr-4 text-gray-500 font-medium">#</th>
                <th className="text-left py-2.5 pr-4 text-gray-500 font-medium">Клиент</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Нарядов</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Выручка</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Маржа %</th>
                <th className="text-center py-2.5 pl-3 text-gray-500 font-medium">Тренд</th>
              </tr>
            </thead>
            <tbody>
              {clientMarginData.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-gray-400 font-medium">{i + 1}</td>
                  <td className="py-3 pr-4 font-medium text-gray-900">{row.client}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{row.orders}</td>
                  <td className="py-3 px-3 text-right text-gray-700">{fmt(row.revenue)}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-semibold ${
                        row.marginPct >= 35 ? 'text-green-600' :
                        row.marginPct >= 20 ? 'text-yellow-600' : 'text-red-500'
                      }`}
                    >
                      {row.marginPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-center">
                    {row.trend === 'up' ? (
                      <Icon name="ArrowUp" size={16} className="text-green-500 mx-auto" />
                    ) : (
                      <Icon name="ArrowDown" size={16} className="text-red-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default FinancialSummary;
