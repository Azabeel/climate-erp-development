import { useState } from 'react';
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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Моковые данные: 30 дней (апрель–май 2026) ───────────────────────────────

const generateDailyData = () => {
  const data = [];
  const start = new Date(2026, 3, 16); // 16 апреля
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const label = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const baseRevenue = 140000 + Math.round(Math.sin(i * 0.4) * 30000 + Math.random() * 20000);
    const margin = 32 + Math.round(Math.sin(i * 0.3) * 3 + Math.random() * 2);
    const sla = Math.min(100, 88 + Math.round(Math.sin(i * 0.5) * 4 + Math.random() * 3));
    data.push({ day: label, revenue: baseRevenue, margin, sla });
  }
  return data;
};

const DAILY_DATA = generateDailyData();

const WORKTYPE_WEEKLY = [
  { week: '18–24 апр', repair: 22, maintenance: 18, installation: 7, warranty: 4 },
  { week: '25 апр–1 мая', repair: 25, maintenance: 21, installation: 9, warranty: 5 },
  { week: '2–8 мая', repair: 19, maintenance: 16, installation: 6, warranty: 3 },
  { week: '9–15 мая', repair: 23, maintenance: 19, installation: 9, warranty: 6 },
];

const SLA_DAILY = DAILY_DATA.map(d => ({
  day: d.day,
  sla: d.sla,
}));

const SEGMENT_DATA = [
  { name: 'VIP-клиенты', value: 2150000, color: '#6366f1' },
  { name: 'Стандарт', value: 1890000, color: '#3b82f6' },
  { name: 'Разовые', value: 780000, color: '#93c5fd' },
];

const TOP_ENGINEERS = [
  { rank: 1, label: '1-е', name: 'Козлов М.А.', orders: 42, revenue: 618000, nps: 94, efficiency: 97 },
  { rank: 2, label: '2-е', name: 'Петров С.В.', orders: 38, revenue: 541000, nps: 91, efficiency: 92 },
  { rank: 3, label: '3-е', name: 'Иванов А.Н.', orders: 35, revenue: 498000, nps: 89, efficiency: 88 },
  { rank: 4, label: '4-е', name: 'Сидоров Д.К.', orders: 31, revenue: 443000, nps: 86, efficiency: 82 },
  { rank: 5, label: '5-е', name: 'Новиков Р.Е.', orders: 28, revenue: 401000, nps: 84, efficiency: 77 },
];

const ALERTS = [
  {
    id: 1,
    level: 'error',
    icon: 'AlertTriangle',
    title: 'Просроченные наряды',
    description: '7 нарядов просрочено по SLA. Требуется немедленное вмешательство диспетчера.',
    badge: '7 нарядов',
    badgeVariant: 'destructive' as const,
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
  },
  {
    id: 2,
    level: 'warning',
    icon: 'Package',
    title: 'Низкий остаток склада',
    description: 'R-410A: 2.3 кг (норма ≥ 10 кг). Фильтр-осушитель Daikin: 3 шт. (норма ≥ 10 шт.).',
    badge: '2 позиции',
    badgeVariant: 'secondary' as const,
    bg: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
  },
  {
    id: 3,
    level: 'orange',
    icon: 'Clock',
    title: 'SLA под угрозой',
    description: '12 нарядов в жёлтой зоне SLA (осталось <20% времени). Зона риска — инженеры Марьинский р-н.',
    badge: '12 нарядов',
    badgeVariant: 'secondary' as const,
    bg: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600',
    titleColor: 'text-orange-800',
  },
  {
    id: 4,
    level: 'neutral',
    icon: 'CalendarCheck',
    title: 'Плановое ТО не выполнено',
    description: '4 объекта по плану ТО на эту неделю не обслужены. Ближайший срок — 16.05.2026.',
    badge: '4 объекта',
    badgeVariant: 'outline' as const,
    bg: 'bg-gray-50 border-gray-200',
    iconColor: 'text-gray-500',
    titleColor: 'text-gray-800',
  },
  {
    id: 5,
    level: 'info',
    icon: 'Snowflake',
    title: 'Утечка хладагента',
    description: 'Объект ООО «Холод-Строй»: показатель утечки R-32 превысил 30%. Требуется внеплановая проверка.',
    badge: '1 объект',
    badgeVariant: 'secondary' as const,
    bg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
  },
];

// ─── Вспомогательные функции ──────────────────────────────────────────────────

const formatMoney = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2).replace(/\.?0+$/, '')} млн ₽`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} тыс. ₽`;
  return `${v} ₽`;
};

const formatMoneyShort = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}М`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return `${v}`;
};

// ─── Компоненты ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
  unit?: string;
}

const MetricCard = ({ label, value, delta, deltaPositive, icon, iconBg, iconColor, unit }: MetricCardProps) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon name={icon} size={20} className={iconColor} />
      </div>
      <span
        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          deltaPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}
      >
        <Icon name={deltaPositive ? 'TrendingUp' : 'TrendingDown'} size={11} />
        {delta}
      </span>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-base font-medium text-gray-500 ml-1">{unit}</span>}
      </p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-4">
    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

const rankColors: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  2: 'bg-gray-100 text-gray-700 border-gray-300',
  3: 'bg-orange-100 text-orange-800 border-orange-300',
};

// ─── Главный компонент ────────────────────────────────────────────────────────

const PERIODS = ['Сегодня', 'Неделя', 'Месяц', 'Квартал', 'Год'] as const;
type Period = (typeof PERIODS)[number];

const KPIDashboard = () => {
  const [period, setPeriod] = useState<Period>('Месяц');
  const [lastUpdated] = useState('15.05.2026, 09:47');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ── Верхняя панель ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Icon name="LayoutDashboard" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">KPI Дашборд руководителя</h1>
            <p className="text-xs text-gray-400">АСУ СЦ «Сервис Климат» · Обновлено: {lastUpdated}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Переключатель периода */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Кнопка обновить */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <Icon
              name="RefreshCw"
              size={14}
              className={refreshing ? 'animate-spin' : ''}
            />
            Обновить
          </Button>
        </div>
      </div>

      {/* ── Секция 1: Ключевые метрики (6 карточек) ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label="Выручка"
          value="4 820 000 ₽"
          delta="+12%"
          deltaPositive={true}
          icon="CircleDollarSign"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          label="Маржинальность"
          value="34.2%"
          delta="+1.8%"
          deltaPositive={true}
          icon="TrendingUp"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          label="Нарядов выполнено"
          value="312"
          delta="+8%"
          deltaPositive={true}
          icon="Wrench"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <MetricCard
          label="Среднее TTR"
          value="1.8 ч"
          delta="-0.3 ч"
          deltaPositive={true}
          icon="Timer"
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <MetricCard
          label="NPS клиентов"
          value="72"
          delta="+4"
          deltaPositive={true}
          icon="Star"
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        {/* Инженеры в работе — нейтральная карточка */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-50">
              <Icon name="Users" size={20} className="text-teal-600" />
            </div>
            <Badge variant="secondary" className="text-xs">из 24</Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">18</p>
            <p className="text-sm text-gray-500 mt-0.5">Инженеров в работе</p>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-1.5 bg-teal-500 rounded-full" style={{ width: `${(18 / 24) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* ── Секция 2: Графики 2×2 ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* AreaChart: Выручка и маржа по дням (30 дней) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle
            title="Выручка и маржинальность"
            subtitle="Динамика за 30 дней"
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={DAILY_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                interval={4}
                tickLine={false}
              />
              <YAxis
                yAxisId="rev"
                orientation="left"
                tick={{ fontSize: 10 }}
                tickFormatter={formatMoneyShort}
                width={48}
              />
              <YAxis
                yAxisId="margin"
                orientation="right"
                tick={{ fontSize: 10 }}
                tickFormatter={v => `${v}%`}
                domain={[20, 50]}
                width={36}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'Выручка' ? [formatMoney(value), name] : [`${value}%`, name]
                }
              />
              <Legend iconType="circle" iconSize={8} />
              <Area
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                name="Выручка"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradRevenue)"
                dot={false}
              />
              <Area
                yAxisId="margin"
                type="monotone"
                dataKey="margin"
                name="Маржа %"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradMargin)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* BarChart: Нарядов по типу работ по неделям */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle
            title="Наряды по типу работ"
            subtitle="По неделям, штук"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WORKTYPE_WEEKLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Legend iconType="square" iconSize={10} />
              <Bar dataKey="repair" name="Ремонт" stackId="a" fill="#6366f1" />
              <Bar dataKey="maintenance" name="ТО" stackId="a" fill="#3b82f6" />
              <Bar dataKey="installation" name="Монтаж" stackId="a" fill="#06b6d4" />
              <Bar dataKey="warranty" name="Гарантия" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LineChart: SLA соблюдение % по дням */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle
            title="Соблюдение SLA"
            subtitle="% нарядов в норме за 30 дней"
          />
          {/* Легенда зон */}
          <div className="flex items-center gap-4 mb-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-400 inline-block" />
              <span className="text-gray-500">&gt;90% — норма</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-400 inline-block" />
              <span className="text-gray-500">70–90% — риск</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-400 inline-block" />
              <span className="text-gray-500">&lt;70% — нарушение</span>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={SLA_DAILY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[60, 100]}
                tickFormatter={v => `${v}%`}
                width={36}
              />
              <Tooltip formatter={(v: number) => [`${v}%`, 'SLA']} />
              {/* Зелёная зона >90 */}
              <defs>
                <linearGradient id="slaGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="sla"
                name="SLA %"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const color =
                    payload.sla >= 90 ? '#22c55e' : payload.sla >= 70 ? '#f59e0b' : '#ef4444';
                  return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={color} stroke="white" strokeWidth={1.5} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PieChart: Распределение выручки по сегментам клиентов */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle
            title="Выручка по сегментам клиентов"
            subtitle="За текущий период"
          />
          <div className="flex items-center gap-4 h-[210px]">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie
                  data={SEGMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {SEGMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [formatMoney(v), 'Выручка']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {SEGMENT_DATA.map(seg => {
                const total = SEGMENT_DATA.reduce((s, x) => s + x.value, 0);
                const pct = Math.round((seg.value / total) * 100);
                return (
                  <div key={seg.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-gray-700">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: seg.color }}
                        />
                        {seg.name}
                      </span>
                      <span className="font-semibold text-gray-900">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: seg.color }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatMoney(seg.value)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Секция 3: Топ-5 инженеров ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <SectionTitle
            title="Топ-5 инженеров"
            subtitle="По выручке за текущий период"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Место</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Инженер</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Нарядов</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Выручка</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">NPS</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[140px]">Эффективность</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TOP_ENGINEERS.map(eng => (
                <tr key={eng.rank} className="hover:bg-gray-50 transition-colors">
                  {/* Ранг */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${
                        rankColors[eng.rank] ?? 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      {eng.label}
                    </span>
                  </td>
                  {/* Имя */}
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-gray-900">{eng.name}</span>
                  </td>
                  {/* Нарядов */}
                  <td className="px-4 py-3.5 text-right text-gray-700 font-medium">{eng.orders}</td>
                  {/* Выручка */}
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                    {formatMoney(eng.revenue)}
                  </td>
                  {/* NPS */}
                  <td className="px-4 py-3.5 text-right">
                    <Badge
                      variant={eng.nps >= 90 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {eng.nps}
                    </Badge>
                  </td>
                  {/* Эффективность — progress bar */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            eng.efficiency >= 90
                              ? 'bg-green-500'
                              : eng.efficiency >= 80
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${eng.efficiency}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                        {eng.efficiency}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Секция 4: Алерты ────────────────────────────────────────────────── */}
      <div>
        <SectionTitle
          title="Активные алерты"
          subtitle="Требуют внимания руководителя"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ALERTS.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 flex items-start gap-3 ${alert.bg}`}
            >
              <div className={`mt-0.5 shrink-0 ${alert.iconColor}`}>
                <Icon name={alert.icon} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className={`text-sm font-semibold ${alert.titleColor}`}>{alert.title}</p>
                  <Badge variant={alert.badgeVariant} className="text-xs shrink-0">
                    {alert.badge}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KPIDashboard;
