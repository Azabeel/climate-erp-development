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
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

// ─── Моковые данные ────────────────────────────────────────────────────────────

// Спарклайн: 7 дней выручки
const REVENUE_SPARK = [
  { d: 'Пн', v: 1180000 },
  { d: 'Вт', v: 1340000 },
  { d: 'Ср', v: 1210000 },
  { d: 'Чт', v: 1520000 },
  { d: 'Пт', v: 1450000 },
  { d: 'Сб', v: 1100000 },
  { d: 'Вс', v: 440000 },
];

// Спарклайн: маржа 7 дней
const MARGIN_SPARK = [
  { d: 'Пн', v: 32.1 },
  { d: 'Вт', v: 33.5 },
  { d: 'Ср', v: 31.8 },
  { d: 'Чт', v: 35.2 },
  { d: 'Пт', v: 34.9 },
  { d: 'Сб', v: 33.0 },
  { d: 'Вс', v: 36.1 },
];

// Спарклайн: наряды 7 дней
const ORDERS_SPARK = [
  { d: 'Пн', v: 44 },
  { d: 'Вт', v: 51 },
  { d: 'Ср', v: 39 },
  { d: 'Чт', v: 57 },
  { d: 'Пт', v: 48 },
  { d: 'Сб', v: 30 },
  { d: 'Вс', v: 15 },
];

// ComposedChart: выручка + маржа 12 месяцев
const REVENUE_MARGIN_12M = [
  { month: 'Июн', revenue: 6.1, margin: 31.2 },
  { month: 'Июл', revenue: 5.8, margin: 30.5 },
  { month: 'Авг', revenue: 6.4, margin: 32.1 },
  { month: 'Сен', revenue: 7.2, margin: 33.4 },
  { month: 'Окт', revenue: 7.8, margin: 34.8 },
  { month: 'Ноя', revenue: 8.1, margin: 35.2 },
  { month: 'Дек', revenue: 7.4, margin: 33.9 },
  { month: 'Янв', revenue: 6.9, margin: 32.6 },
  { month: 'Фев', revenue: 7.5, margin: 33.1 },
  { month: 'Мар', revenue: 8.3, margin: 34.7 },
  { month: 'Апр', revenue: 8.9, margin: 35.8 },
  { month: 'Май', revenue: 9.24, margin: 34.0 },
];

// BarChart: нагрузка 8 инженеров (факт/план)
const TEAM_LOAD = [
  { name: 'Козлов М.', fact: 42, plan: 40 },
  { name: 'Петров С.', fact: 38, plan: 42 },
  { name: 'Иванов А.', fact: 35, plan: 38 },
  { name: 'Сидоров Д.', fact: 31, plan: 35 },
  { name: 'Новиков Р.', fact: 28, plan: 30 },
  { name: 'Захаров Е.', fact: 24, plan: 28 },
  { name: 'Морозов К.', fact: 19, plan: 25 },
  { name: 'Федоров Н.', fact: 14, plan: 20 },
];

// PieChart: типы работ (5 секторов)
const WORK_TYPES = [
  { name: 'Ремонт', value: 38, color: '#6366f1' },
  { name: 'ТО плановое', value: 27, color: '#3b82f6' },
  { name: 'Монтаж', value: 18, color: '#06b6d4' },
  { name: 'Гарантия', value: 9, color: '#10b981' },
  { name: 'Пусконаладка', value: 8, color: '#f59e0b' },
];

// LineChart SLA-тренд 30 дней (TTR/TTO/TTF)
const generateSLATrend = () => {
  const data = [];
  const base = new Date(2026, 3, 16);
  for (let i = 0; i < 30; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const label = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    data.push({
      day: label,
      TTR: Math.min(100, 88 + Math.round(Math.sin(i * 0.5) * 5 + Math.random() * 4)),
      TTO: Math.min(100, 91 + Math.round(Math.sin(i * 0.4) * 4 + Math.random() * 3)),
      TTF: Math.min(100, 94 + Math.round(Math.sin(i * 0.6) * 3 + Math.random() * 2)),
    });
  }
  return data;
};
const SLA_TREND = generateSLATrend();

// Топ-5 клиентов (горизонтальный bar)
const TOP_CLIENTS = [
  { name: 'ООО «АрктикТех»', revenue: 1.82 },
  { name: 'ТЦ «Мегаплаза»', revenue: 1.54 },
  { name: 'ПАО «ХолодПром»', revenue: 1.31 },
  { name: 'ГК «СтройКлимат»', revenue: 0.98 },
  { name: 'ООО «Фриго-Сервис»', revenue: 0.74 },
];

// Критические наряды
const CRITICAL_ORDERS = [
  {
    id: 'WO-2026-003412',
    client: 'ООО «АрктикТех»',
    address: 'Ленинградский пр-т, 48',
    engineer: 'Козлов М.А.',
    sla: 96,
    status: 'IN_PROGRESS',
    priority: 'EMERGENCY',
    type: 'Ремонт',
    deadline: '16.05 14:00',
  },
  {
    id: 'WO-2026-003387',
    client: 'ТЦ «Мегаплаза»',
    address: 'Варшавское ш., 87',
    engineer: 'Петров С.В.',
    sla: 93,
    status: 'AWAITING_PARTS',
    priority: 'URGENT',
    type: 'ТО плановое',
    deadline: '16.05 16:30',
  },
  {
    id: 'WO-2026-003401',
    client: 'ПАО «ХолодПром»',
    address: 'Промышленная, 12',
    engineer: 'Иванов А.Н.',
    sla: 91,
    status: 'EN_ROUTE',
    priority: 'URGENT',
    type: 'Монтаж',
    deadline: '16.05 18:00',
  },
  {
    id: 'WO-2026-003358',
    client: 'ГК «СтройКлимат»',
    address: 'Митинская, 25к1',
    engineer: 'Сидоров Д.К.',
    sla: 90,
    status: 'ON_SITE',
    priority: 'NORMAL',
    type: 'Гарантия',
    deadline: '16.05 19:00',
  },
  {
    id: 'WO-2026-003344',
    client: 'ООО «Фриго-Сервис»',
    address: 'Бауманская, 7',
    engineer: 'Новиков Р.Е.',
    sla: 90,
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    type: 'Ремонт',
    deadline: '16.05 20:15',
  },
];

// Недавние события
const RECENT_EVENTS = [
  { id: 1, time: '09:41', icon: 'CheckCircle', color: 'text-green-600', bg: 'bg-green-50', text: 'Наряд WO-2026-003399 завершён — Козлов М.А.', sub: 'Ремонт Daikin VRV — ТЦ «Азбука»' },
  { id: 2, time: '09:28', icon: 'PlusCircle', color: 'text-blue-600', bg: 'bg-blue-50', text: 'Новый наряд WO-2026-003412 создан', sub: 'Аварийный вызов — ООО «АрктикТех»' },
  { id: 3, time: '09:15', icon: 'AlertTriangle', color: 'text-red-600', bg: 'bg-red-50', text: 'Нарушение SLA — WO-2026-003344', sub: 'Превышение TTR на 23 минуты' },
  { id: 4, time: '08:57', icon: 'Package', color: 'text-orange-600', bg: 'bg-orange-50', text: 'ЗИП получен на склад — 14 позиций', sub: 'Поставщик: ООО «КлиматКомплект»' },
  { id: 5, time: '08:44', icon: 'Star', color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Новая оценка NPS 10/10 — Иванов А.Н.', sub: 'Клиент: ТЦ «Мегаплаза»' },
  { id: 6, time: '08:30', icon: 'UserCheck', color: 'text-teal-600', bg: 'bg-teal-50', text: 'Захаров Е. начал рабочий день', sub: 'Старт из офиса — 12 нарядов в плане' },
  { id: 7, time: '08:12', icon: 'Snowflake', color: 'text-cyan-600', bg: 'bg-cyan-50', text: 'Утечка хладагента — превышение 32%', sub: 'Объект: ООО «Холод-Строй», R-32' },
  { id: 8, time: '07:55', icon: 'CalendarCheck', color: 'text-violet-600', bg: 'bg-violet-50', text: 'Авто-создан плановый наряд PPR', sub: 'Объект: Банк «Открытие», г. Москва' },
];

// Прогноз месяца
const FORECAST = [
  { label: 'Выручка', plan: 10.5, fact: 9.24, forecast: 10.1, unit: 'млн ₽' },
  { label: 'Нарядов', plan: 320, fact: 284, forecast: 311, unit: 'шт.' },
  { label: 'Новых клиентов', plan: 25, fact: 18, forecast: 22, unit: 'чел.' },
  { label: 'NPS', plan: 75, fact: 72, forecast: 74, unit: 'балл' },
];

// ─── Вспомогательные функции и константы ──────────────────────────────────────

const slaColor = (pct: number) => {
  if (pct >= 95) return 'text-red-700 bg-red-100';
  if (pct >= 90) return 'text-orange-700 bg-orange-100';
  return 'text-yellow-700 bg-yellow-100';
};

const statusLabel: Record<string, { label: string; cls: string }> = {
  IN_PROGRESS: { label: 'В работе', cls: 'bg-blue-100 text-blue-700' },
  AWAITING_PARTS: { label: 'Ожидание ЗИП', cls: 'bg-orange-100 text-orange-700' },
  EN_ROUTE: { label: 'В пути', cls: 'bg-cyan-100 text-cyan-700' },
  ON_SITE: { label: 'На объекте', cls: 'bg-violet-100 text-violet-700' },
};

const priorityDot: Record<string, string> = {
  EMERGENCY: 'bg-red-500',
  URGENT: 'bg-orange-400',
  NORMAL: 'bg-gray-400',
};

const PERIODS = ['Сегодня', 'Неделя', 'Месяц', 'Год'] as const;
type Period = (typeof PERIODS)[number];

// ─── Подкомпоненты ─────────────────────────────────────────────────────────────

const SectionTitle = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// Мини sparkline — area
const SparkArea = ({ data, dataKey, color }: { data: object[]; dataKey: string; color: string }) => (
  <ResponsiveContainer width="100%" height={48}>
    <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2}
        fill={`url(#spark-${color.replace('#', '')})`}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// Мини sparkline — bar
const SparkBar = ({ data, dataKey, color }: { data: object[]; dataKey: string; color: string }) => (
  <ResponsiveContainer width="100%" height={48}>
    <BarChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }} barSize={8}>
      <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
    </BarChart>
  </ResponsiveContainer>
);

// Мини trend line
const SparkLine = ({ data, dataKey, color }: { data: object[]; dataKey: string; color: string }) => (
  <ResponsiveContainer width="100%" height={48}>
    <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

// Gauge NPS — простая дуга через SVG
const NPSGauge = ({ value }: { value: number }) => {
  const max = 100;
  const pct = Math.min(value / max, 1);
  const r = 28;
  const cx = 36;
  const cy = 36;
  const circumference = Math.PI * r; // полукруг
  const dash = circumference * pct;
  const color = value >= 70 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="72" height="44" viewBox="0 0 72 44">
      {/* трек */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* значение */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
        {value}
      </text>
    </svg>
  );
};

// Карточка KPI с контентом-слотом
interface KPICardProps {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
  children?: React.ReactNode;
  redIndicator?: boolean;
}

const KPICard = ({
  label,
  value,
  delta,
  deltaPositive,
  icon,
  iconBg,
  iconColor,
  children,
  redIndicator,
}: KPICardProps) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
    <div className="flex items-start justify-between">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon name={icon} size={18} className={iconColor} />
      </div>
      <span
        className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          redIndicator
            ? 'bg-red-50 text-red-700'
            : deltaPositive
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}
      >
        <Icon
          name={deltaPositive && !redIndicator ? 'TrendingUp' : 'TrendingDown'}
          size={10}
        />
        {delta}
      </span>
    </div>
    <div>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
    {children && <div className="mt-1">{children}</div>}
  </div>
);

// ─── Главный компонент ────────────────────────────────────────────────────────

const KPIDashboardFull = () => {
  const [period, setPeriod] = useState<Period>('Месяц');

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ══════════════════════════════════════════════════════════════
          ШАПКА
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Добрый день, Александр!</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            16 мая 2026 · АСУ СЦ «Сервис Климат»
            <span className="ml-3 inline-flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
              Обновлено 2 мин назад
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Icon name="Download" size={14} />
            Экспорт
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          РЯД 1 — 6 ОСНОВНЫХ KPI
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

        {/* 1. Выручка */}
        <KPICard
          label="Выручка"
          value="9.24 млн ₽"
          delta="+18%"
          deltaPositive={true}
          icon="CircleDollarSign"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        >
          <SparkArea data={REVENUE_SPARK} dataKey="v" color="#3b82f6" />
        </KPICard>

        {/* 2. Маржа */}
        <KPICard
          label="Маржинальность"
          value="34.0%"
          delta="+2.1 п.п."
          deltaPositive={true}
          icon="TrendingUp"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        >
          <SparkLine data={MARGIN_SPARK} dataKey="v" color="#10b981" />
        </KPICard>

        {/* 3. Нарядов */}
        <KPICard
          label="Нарядов выполнено"
          value="284"
          delta="+12%"
          deltaPositive={true}
          icon="Wrench"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        >
          <SparkBar data={ORDERS_SPARK} dataKey="v" color="#8b5cf6" />
        </KPICard>

        {/* 4. SLA — красный индикатор (падение) */}
        <KPICard
          label="SLA выполнение"
          value="94.2%"
          delta="-0.8%"
          deltaPositive={false}
          redIndicator={true}
          icon="ShieldCheck"
          iconBg="bg-red-50"
          iconColor="text-red-500"
        >
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2 rounded-full bg-red-400" style={{ width: '94.2%' }} />
            </div>
            <span className="text-xs font-semibold text-red-600">94.2%</span>
          </div>
        </KPICard>

        {/* 5. NPS с gauge */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-yellow-50">
              <Icon name="Star" size={18} className="text-yellow-500" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              <Icon name="TrendingUp" size={10} />
              +4
            </span>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">72</p>
            <p className="text-xs text-gray-500 mt-0.5">NPS клиентов</p>
          </div>
          <div className="flex justify-center mt-1">
            <NPSGauge value={72} />
          </div>
        </div>

        {/* 6. Новые клиенты */}
        <KPICard
          label="Новых клиентов"
          value="18"
          delta="+6"
          deltaPositive={true}
          icon="UserPlus"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        >
          <div className="flex items-end gap-1 h-12 mt-1">
            {[3, 2, 4, 2, 3, 2, 2].map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-teal-400 opacity-80"
                style={{ height: `${(v / 4) * 100}%` }}
              />
            ))}
          </div>
        </KPICard>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          РЯД 2 — ОСНОВНЫЕ ГРАФИКИ
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ComposedChart: Выручка и маржа 12 мес */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle
            title="Выручка и маржа"
            subtitle="12 месяцев, млн ₽ / %"
          />
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={REVENUE_MARGIN_12M} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRev12" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                yAxisId="rev"
                orientation="left"
                tick={{ fontSize: 11 }}
                tickFormatter={v => `${v}М`}
                width={40}
                domain={[0, 12]}
              />
              <YAxis
                yAxisId="margin"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickFormatter={v => `${v}%`}
                domain={[25, 45]}
                width={38}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'Выручка' ? [`${value} млн ₽`, name] : [`${value}%`, name]
                }
              />
              <Legend iconType="circle" iconSize={8} />
              <ReferenceLine
                yAxisId="margin"
                y={38}
                stroke="#f59e0b"
                strokeDasharray="5 3"
                label={{ value: 'Цель 38%', position: 'right', fontSize: 10, fill: '#f59e0b' }}
              />
              <Bar yAxisId="rev" dataKey="revenue" name="Выручка" fill="url(#gradRev12)" stroke="#3b82f6" strokeWidth={1} radius={[4, 4, 0, 0]} />
              <Line yAxisId="margin" type="monotone" dataKey="margin" name="Маржа %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* BarChart: Нагрузка команды (grouped) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle
            title="Нагрузка команды"
            subtitle="Факт / план нарядов — текущий период"
          />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={TEAM_LOAD}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
              barSize={9}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} domain={[0, 50]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={78} tickLine={false} />
              <Tooltip />
              <Legend iconType="square" iconSize={9} />
              <Bar dataKey="plan" name="План" fill="#e0e7ff" radius={[0, 4, 4, 0]} />
              <Bar dataKey="fact" name="Факт" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          РЯД 3 — АНАЛИТИКА (3 в ряд)
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* PieChart: типы работ */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle title="Типы работ" subtitle="Структура нарядов, %" />
          <div className="flex flex-col items-center gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={WORK_TYPES}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {WORK_TYPES.map((entry, index) => (
                    <Cell key={`cell-wt-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, 'Доля']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5">
              {WORK_TYPES.map(wt => (
                <div key={wt.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: wt.color }} />
                    {wt.name}
                  </span>
                  <span className="font-semibold text-gray-800">{wt.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LineChart: SLA тренд 30 дней (TTR/TTO/TTF) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle title="SLA тренд" subtitle="30 дней — TTR / TTO / TTF, %" />
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={SLA_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={5} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[80, 100]}
                tickFormatter={v => `${v}%`}
                width={36}
              />
              <Tooltip formatter={(v: number, name: string) => [`${v}%`, name]} />
              <Legend iconType="circle" iconSize={8} />
              <ReferenceLine
                y={100}
                stroke="#6b7280"
                strokeDasharray="4 2"
                label={{ value: '100%', position: 'right', fontSize: 9, fill: '#6b7280' }}
              />
              <Line type="monotone" dataKey="TTR" name="TTR" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="TTO" name="TTO" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="TTF" name="TTF" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BarChart горизонтальный: Топ-5 клиентов */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <SectionTitle title="Топ-5 клиентов" subtitle="По выручке, млн ₽" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={TOP_CLIENTS}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => `${v}М`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v} млн ₽`, 'Выручка']} />
              <Bar dataKey="revenue" name="Выручка" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                {TOP_CLIENTS.map((_, i) => (
                  <Cell
                    key={`cell-tc-${i}`}
                    fill={['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'][i]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          РЯД 4 — ОПЕРАТИВНАЯ СВОДКА
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Критические наряды */}
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <SectionTitle
              title="Критические наряды"
              subtitle="SLA ≥ 90% — требуют контроля"
              action={
                <Badge variant="destructive" className="text-xs">
                  5 нарядов
                </Badge>
              }
            />
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs min-w-[460px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Наряд</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Клиент</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Инженер</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">SLA</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Срок</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {CRITICAL_ORDERS.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[order.priority]}`} />
                        <span className="font-mono text-gray-700 font-medium">{order.id.slice(-6)}</span>
                      </div>
                      <span className={`mt-0.5 inline-flex text-xs px-1.5 py-0.5 rounded-full font-medium ${statusLabel[order.status]?.cls}`}>
                        {statusLabel[order.status]?.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-gray-800 font-medium leading-tight">{order.client}</p>
                      <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[100px]">{order.address}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{order.engineer}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold ${slaColor(order.sla)}`}>
                        {order.sla}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{order.deadline}</td>
                    <td className="px-3 py-3">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600 hover:text-blue-700">
                        <Icon name="ExternalLink" size={13} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Недавние события */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <SectionTitle title="Недавние события" subtitle="Последние 8 событий системы" />
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[340px] pr-1">
            {RECENT_EVENTS.map(evt => (
              <div key={evt.id} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${evt.bg}`}>
                  <Icon name={evt.icon} size={13} className={evt.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-tight">{evt.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{evt.sub}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{evt.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Прогноз месяца */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <SectionTitle title="Прогноз месяца" subtitle="Май 2026 — план / факт / прогноз" />
          <div className="space-y-5 flex-1">
            {FORECAST.map(f => {
              const factPct = Math.min((f.fact / f.plan) * 100, 100);
              const forecastPct = Math.min((f.forecast / f.plan) * 100, 100);
              const isOnTrack = f.forecast >= f.plan * 0.95;
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{f.label}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOnTrack ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                      {isOnTrack ? 'В норме' : 'Риск'}
                    </span>
                  </div>
                  {/* Факт */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 w-14 shrink-0">Факт</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${factPct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-20 text-right shrink-0">
                      {f.fact} {f.unit}
                    </span>
                  </div>
                  {/* Прогноз */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 w-14 shrink-0">Прогноз</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${isOnTrack ? 'bg-green-400' : 'bg-orange-400'}`}
                        style={{ width: `${forecastPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-20 text-right shrink-0">
                      {f.forecast} {f.unit}
                    </span>
                  </div>
                  {/* План (target line) */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-14 shrink-0">План</span>
                    <div className="flex-1 h-px bg-gray-300 border-dashed" style={{ backgroundImage: 'repeating-linear-gradient(to right, #d1d5db 0, #d1d5db 6px, transparent 6px, transparent 12px)' }} />
                    <span className="text-xs text-gray-500 w-20 text-right shrink-0">
                      {f.plan} {f.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default KPIDashboardFull;
