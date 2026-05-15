import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  Clock,
  DollarSign,
  ChevronRight,
  Filter,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'month' | 'quarter' | 'year';

interface WorkOrderSample {
  id: string;
  client: string;
  rating: number;
  date: string;
}

interface Engineer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  position: string;
  orders: number;
  avgResponseTime: number;   // часы
  clientRating: number;      // 1-5
  revenue: number;           // руб
  score: number;             // 0-100
  prevScore: number;         // балл прошлого периода
  radarMetrics: {
    speed: number;
    quality: number;
    clients: number;
    complexity: number;
    punctuality: number;
    revenue: number;
  };
  monthlyOrders: { month: string; orders: number }[];
  bestOrders: WorkOrderSample[];
  worstOrders: WorkOrderSample[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  {
    id: 'e1',
    name: 'Козлов Михаил',
    initials: 'КМ',
    avatarColor: 'bg-blue-500',
    position: 'Инженер-монтажник',
    orders: 24,
    avgResponseTime: 2.1,
    clientRating: 4.9,
    revenue: 186000,
    score: 91,
    prevScore: 87,
    radarMetrics: { speed: 88, quality: 95, clients: 97, complexity: 85, punctuality: 93, revenue: 90 },
    monthlyOrders: [
      { month: 'Дек', orders: 20 },
      { month: 'Янв', orders: 22 },
      { month: 'Фев', orders: 21 },
      { month: 'Мар', orders: 25 },
      { month: 'Апр', orders: 23 },
      { month: 'Май', orders: 24 },
    ],
    bestOrders: [
      { id: 'WO-2026-000412', client: 'ТЦ Галерея', rating: 5, date: '12.05.2026' },
      { id: 'WO-2026-000389', client: 'Офис Алроса', rating: 5, date: '07.05.2026' },
      { id: 'WO-2026-000341', client: 'СберБанк', rating: 5, date: '01.05.2026' },
    ],
    worstOrders: [
      { id: 'WO-2026-000298', client: 'Кафе Восток', rating: 3, date: '18.04.2026' },
      { id: 'WO-2026-000276', client: 'ИП Романов', rating: 3, date: '10.04.2026' },
      { id: 'WO-2026-000251', client: 'Магазин Уют', rating: 4, date: '02.04.2026' },
    ],
  },
  {
    id: 'e2',
    name: 'Петров Сергей',
    initials: 'ПС',
    avatarColor: 'bg-emerald-500',
    position: 'Инженер по климату',
    orders: 19,
    avgResponseTime: 2.5,
    clientRating: 4.7,
    revenue: 152000,
    score: 82,
    prevScore: 79,
    radarMetrics: { speed: 80, quality: 88, clients: 90, complexity: 78, punctuality: 85, revenue: 80 },
    monthlyOrders: [
      { month: 'Дек', orders: 15 },
      { month: 'Янв', orders: 17 },
      { month: 'Фев', orders: 16 },
      { month: 'Мар', orders: 20 },
      { month: 'Апр', orders: 18 },
      { month: 'Май', orders: 19 },
    ],
    bestOrders: [
      { id: 'WO-2026-000405', client: 'Аптека Здоровье', rating: 5, date: '11.05.2026' },
      { id: 'WO-2026-000370', client: 'Ресторан Парус', rating: 5, date: '05.05.2026' },
      { id: 'WO-2026-000332', client: 'Фитнес Макс', rating: 5, date: '28.04.2026' },
    ],
    worstOrders: [
      { id: 'WO-2026-000290', client: 'ИП Сажин', rating: 3, date: '15.04.2026' },
      { id: 'WO-2026-000265', client: 'Склад Логист', rating: 3, date: '08.04.2026' },
      { id: 'WO-2026-000240', client: 'ООО Прима', rating: 3, date: '31.03.2026' },
    ],
  },
  {
    id: 'e3',
    name: 'Иванов Алексей',
    initials: 'ИА',
    avatarColor: 'bg-violet-500',
    position: 'Инженер по климату',
    orders: 16,
    avgResponseTime: 2.8,
    clientRating: 4.5,
    revenue: 124000,
    score: 74,
    prevScore: 76,
    radarMetrics: { speed: 72, quality: 80, clients: 83, complexity: 70, punctuality: 74, revenue: 68 },
    monthlyOrders: [
      { month: 'Дек', orders: 13 },
      { month: 'Янв', orders: 14 },
      { month: 'Фев', orders: 13 },
      { month: 'Мар', orders: 17 },
      { month: 'Апр', orders: 15 },
      { month: 'Май', orders: 16 },
    ],
    bestOrders: [
      { id: 'WO-2026-000398', client: 'Детский сад №4', rating: 5, date: '10.05.2026' },
      { id: 'WO-2026-000360', client: 'Клиника Мед', rating: 4, date: '04.05.2026' },
      { id: 'WO-2026-000320', client: 'Офис ГК Строй', rating: 4, date: '25.04.2026' },
    ],
    worstOrders: [
      { id: 'WO-2026-000285', client: 'ООО Ритм', rating: 2, date: '14.04.2026' },
      { id: 'WO-2026-000260', client: 'Магазин Техно', rating: 3, date: '07.04.2026' },
      { id: 'WO-2026-000235', client: 'ИП Грачёв', rating: 3, date: '30.03.2026' },
    ],
  },
  {
    id: 'e4',
    name: 'Сидоров Дмитрий',
    initials: 'СД',
    avatarColor: 'bg-amber-500',
    position: 'Инженер (стажёр)',
    orders: 11,
    avgResponseTime: 3.5,
    clientRating: 4.1,
    revenue: 74000,
    score: 58,
    prevScore: 53,
    radarMetrics: { speed: 60, quality: 65, clients: 70, complexity: 45, punctuality: 62, revenue: 50 },
    monthlyOrders: [
      { month: 'Дек', orders: 8 },
      { month: 'Янв', orders: 9 },
      { month: 'Фев', orders: 9 },
      { month: 'Мар', orders: 12 },
      { month: 'Апр', orders: 10 },
      { month: 'Май', orders: 11 },
    ],
    bestOrders: [
      { id: 'WO-2026-000390', client: 'Пекарня Хлеб', rating: 5, date: '09.05.2026' },
      { id: 'WO-2026-000350', client: 'Автосервис АС', rating: 4, date: '02.05.2026' },
      { id: 'WO-2026-000310', client: 'Салон Красоты', rating: 4, date: '23.04.2026' },
    ],
    worstOrders: [
      { id: 'WO-2026-000280', client: 'ТСЖ Радуга', rating: 2, date: '13.04.2026' },
      { id: 'WO-2026-000255', client: 'Аренда Плюс', rating: 2, date: '06.04.2026' },
      { id: 'WO-2026-000230', client: 'ООО Вектор', rating: 2, date: '29.03.2026' },
    ],
  },
  {
    id: 'e5',
    name: 'Новиков Андрей',
    initials: 'НА',
    avatarColor: 'bg-rose-500',
    position: 'Инженер по климату',
    orders: 21,
    avgResponseTime: 2.3,
    clientRating: 4.8,
    revenue: 168000,
    score: 86,
    prevScore: 88,
    radarMetrics: { speed: 85, quality: 90, clients: 93, complexity: 80, punctuality: 88, revenue: 85 },
    monthlyOrders: [
      { month: 'Дек', orders: 18 },
      { month: 'Янв', orders: 20 },
      { month: 'Фев', orders: 19 },
      { month: 'Мар', orders: 22 },
      { month: 'Апр', orders: 22 },
      { month: 'Май', orders: 21 },
    ],
    bestOrders: [
      { id: 'WO-2026-000410', client: 'БЦ Панорама', rating: 5, date: '12.05.2026' },
      { id: 'WO-2026-000385', client: 'Спортзал Атлет', rating: 5, date: '06.05.2026' },
      { id: 'WO-2026-000345', client: 'Офис Газпром', rating: 5, date: '29.04.2026' },
    ],
    worstOrders: [
      { id: 'WO-2026-000295', client: 'ООО Стандарт', rating: 3, date: '17.04.2026' },
      { id: 'WO-2026-000270', client: 'ТД Меркурий', rating: 4, date: '09.04.2026' },
      { id: 'WO-2026-000245', client: 'Типография', rating: 4, date: '01.04.2026' },
    ],
  },
  {
    id: 'e6',
    name: 'Орлов Кирилл',
    initials: 'ОК',
    avatarColor: 'bg-cyan-500',
    position: 'Инженер-монтажник',
    orders: 17,
    avgResponseTime: 2.6,
    clientRating: 4.6,
    revenue: 138000,
    score: 77,
    prevScore: 71,
    radarMetrics: { speed: 76, quality: 82, clients: 85, complexity: 72, punctuality: 78, revenue: 74 },
    monthlyOrders: [
      { month: 'Дек', orders: 14 },
      { month: 'Янв', orders: 15 },
      { month: 'Фев', orders: 15 },
      { month: 'Мар', orders: 18 },
      { month: 'Апр', orders: 16 },
      { month: 'Май', orders: 17 },
    ],
    bestOrders: [
      { id: 'WO-2026-000402', client: 'Школа №15', rating: 5, date: '11.05.2026' },
      { id: 'WO-2026-000375', client: 'ООО Синтез', rating: 5, date: '05.05.2026' },
      { id: 'WO-2026-000335', client: 'Кафе Лето', rating: 5, date: '27.04.2026' },
    ],
    worstOrders: [
      { id: 'WO-2026-000288', client: 'ИП Зайцев', rating: 3, date: '14.04.2026' },
      { id: 'WO-2026-000263', client: 'Мастерская ТВ', rating: 3, date: '07.04.2026' },
      { id: 'WO-2026-000238', client: 'СТО Мотор', rating: 4, date: '30.03.2026' },
    ],
  },
  {
    id: 'e7',
    name: 'Фёдоров Игорь',
    initials: 'ФИ',
    avatarColor: 'bg-indigo-500',
    position: 'Ведущий инженер',
    orders: 14,
    avgResponseTime: 1.9,
    clientRating: 4.8,
    revenue: 148000,
    score: 80,
    prevScore: 80,
    radarMetrics: { speed: 90, quality: 86, clients: 88, complexity: 92, punctuality: 82, revenue: 78 },
    monthlyOrders: [
      { month: 'Дек', orders: 12 },
      { month: 'Янв', orders: 13 },
      { month: 'Фев', orders: 12 },
      { month: 'Мар', orders: 15 },
      { month: 'Апр', orders: 14 },
      { month: 'Май', orders: 14 },
    ],
    bestOrders: [
      { id: 'WO-2026-000408', client: 'Завод Промтех', rating: 5, date: '12.05.2026' },
      { id: 'WO-2026-000380', client: 'ЦОД Серверный', rating: 5, date: '06.05.2026' },
      { id: 'WO-2026-000338', client: 'Лаборатория НИИ', rating: 5, date: '28.04.2026' },
    ],
    worstOrders: [
      { id: 'WO-2026-000292', client: 'Склад Авто', rating: 3, date: '16.04.2026' },
      { id: 'WO-2026-000268', client: 'Офис Регион', rating: 4, date: '09.04.2026' },
      { id: 'WO-2026-000243', client: 'Аптека Фарм', rating: 4, date: '01.04.2026' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = {
  month: 'Текущий месяц',
  quarter: 'Квартал',
  year: 'Год',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#6366f1'];

function getScoreBadge(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-700 border border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  return 'bg-red-100 text-red-700 border border-red-200';
}

function getScoreBar(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function formatRevenue(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)} тыс. ₽` : `${n} ₽`;
}

function renderStars(rating: number): JSX.Element {
  const full = Math.floor(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < full ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
    </span>
  );
}

// ─── Summary metrics ──────────────────────────────────────────────────────────

function computeSummary(engineers: Engineer[]) {
  const totalOrders = engineers.reduce((s, e) => s + e.orders, 0);
  const avgTime = engineers.reduce((s, e) => s + e.avgResponseTime, 0) / engineers.length;
  const avgRating = engineers.reduce((s, e) => s + e.clientRating, 0) / engineers.length;
  const totalRevenue = engineers.reduce((s, e) => s + e.revenue, 0);
  return { totalOrders, avgTime, avgRating, totalRevenue };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}

function MetricCard({ icon, label, value, sub, accent }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

interface EngineerRowProps {
  engineer: Engineer;
  selected: boolean;
  onClick: () => void;
}

function EngineerRow({ engineer, selected, onClick }: EngineerRowProps) {
  const delta = engineer.score - engineer.prevScore;
  const isUp = delta > 0;
  const isFlat = delta === 0;

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors ${
        selected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Avatar + Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${engineer.avatarColor}`}
          >
            {engineer.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{engineer.name}</p>
            <p className="text-xs text-gray-400">{engineer.position}</p>
          </div>
        </div>
      </td>

      {/* Orders */}
      <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">
        {engineer.orders}
      </td>

      {/* Avg response time */}
      <td className="px-4 py-3 text-sm text-gray-700 text-center">
        {engineer.avgResponseTime.toFixed(1)} ч
      </td>

      {/* Client rating */}
      <td className="px-4 py-3 text-center">{renderStars(engineer.clientRating)}</td>

      {/* Revenue */}
      <td className="px-4 py-3 text-sm text-gray-700 text-center">
        {formatRevenue(engineer.revenue)}
      </td>

      {/* Score */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-bold ${getScoreBadge(engineer.score)}`}
        >
          {engineer.score}
        </span>
        <div className="w-20 mx-auto mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getScoreBar(engineer.score)}`}
            style={{ width: `${engineer.score}%` }}
          />
        </div>
      </td>

      {/* Trend */}
      <td className="px-4 py-3 text-center">
        {isFlat ? (
          <span className="text-gray-400 text-xs">—</span>
        ) : isUp ? (
          <span className="flex items-center justify-center gap-1 text-green-600 text-xs font-medium">
            <TrendingUp size={14} />+{delta}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1 text-red-500 text-xs font-medium">
            <TrendingDown size={14} />{delta}
          </span>
        )}
      </td>

      {/* Detail arrow */}
      <td className="px-4 py-3 text-center">
        <ChevronRight size={16} className={selected ? 'text-blue-500' : 'text-gray-300'} />
      </td>
    </tr>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  engineer: Engineer;
}

function DetailPanel({ engineer }: DetailPanelProps) {
  const radarData = [
    { axis: 'Скорость', value: engineer.radarMetrics.speed },
    { axis: 'Качество', value: engineer.radarMetrics.quality },
    { axis: 'Клиенты', value: engineer.radarMetrics.clients },
    { axis: 'Сложность', value: engineer.radarMetrics.complexity },
    { axis: 'Пунктуальность', value: engineer.radarMetrics.punctuality },
    { axis: 'Выручка', value: engineer.radarMetrics.revenue },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${engineer.avatarColor}`}
        >
          {engineer.initials}
        </div>
        <div>
          <p className="font-bold text-gray-900">{engineer.name}</p>
          <p className="text-xs text-gray-500">{engineer.position}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full font-bold text-sm ${getScoreBadge(engineer.score)}`}>
          {engineer.score} / 100
        </span>
      </div>

      {/* Radar */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Профиль компетенций
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
            <Radar
              dataKey="value"
              stroke={engineer.avatarColor.replace('bg-', '#').replace('-500', '')}
              fill="#3b82f6"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly dynamics */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Динамика нарядов (6 мес.)
        </p>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={engineer.monthlyOrders}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="orders"
              name="Нарядов"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Best orders */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Топ-3 лучших нарядов
        </p>
        <div className="space-y-1.5">
          {engineer.bestOrders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-1.5"
            >
              <div>
                <p className="text-xs font-medium text-gray-800">{o.id}</p>
                <p className="text-xs text-gray-500">{o.client} · {o.date}</p>
              </div>
              {renderStars(o.rating)}
            </div>
          ))}
        </div>
      </div>

      {/* Worst orders */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Топ-3 худших нарядов
        </p>
        <div className="space-y-1.5">
          {engineer.worstOrders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-1.5"
            >
              <div>
                <p className="text-xs font-medium text-gray-800">{o.id}</p>
                <p className="text-xs text-gray-500">{o.client} · {o.date}</p>
              </div>
              {renderStars(o.rating)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Revenue bar chart ────────────────────────────────────────────────────────

interface RevenueChartProps {
  engineers: Engineer[];
}

function RevenueChart({ engineers }: RevenueChartProps) {
  const data = [...engineers]
    .sort((a, b) => b.revenue - a.revenue)
    .map((e) => ({ name: e.initials, revenue: e.revenue, fullName: e.name }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">Выручка по инженерам, ₽</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10 }}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}К`}
          />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={28} />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Выручка']}
            labelFormatter={(label: string) => {
              const eng = engineers.find((e) => e.initials === label);
              return eng ? eng.name : label;
            }}
          />
          <Bar dataKey="revenue" name="Выручка" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Revenue pie chart ────────────────────────────────────────────────────────

interface RevenuePieProps {
  engineers: Engineer[];
}

function RevenuePie({ engineers }: RevenuePieProps) {
  const data = engineers.map((e) => ({ name: e.initials, value: e.revenue }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">Доля выручки</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }: { name: string; percent: number }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Legend
            formatter={(value: string) => {
              const eng = engineers.find((e) => e.initials === value);
              return eng ? eng.name.split(' ')[0] : value;
            }}
            iconSize={10}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Tooltip formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PerformanceDashboard = () => {
  const [period, setPeriod] = useState<Period>('month');
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);

  const summary = computeSummary(ENGINEERS);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Icon name="Award" size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Дашборд эффективности инженеров</h2>
            <p className="text-sm text-gray-500">Аналитика производительности команды</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Period filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <Filter size={14} className="text-gray-400 ml-1 mr-0.5" />
            {(['month', 'quarter', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xs"
          >
            <Download size={14} />
            Экспорт
          </Button>
        </div>
      </div>

      {/* ── Summary metrics ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<Users size={20} className="text-blue-600" />}
          label="Всего нарядов"
          value={String(summary.totalOrders)}
          sub={`${ENGINEERS.length} инженеров`}
          accent="bg-blue-50"
        />
        <MetricCard
          icon={<Clock size={20} className="text-violet-600" />}
          label="Среднее время выезда"
          value={`${summary.avgTime.toFixed(1)} ч`}
          sub="Среднее по команде"
          accent="bg-violet-50"
        />
        <MetricCard
          icon={<Star size={20} className="text-amber-500" />}
          label="Оценка клиентов"
          value={summary.avgRating.toFixed(1)}
          sub="из 5.0 баллов"
          accent="bg-amber-50"
        />
        <MetricCard
          icon={<DollarSign size={20} className="text-emerald-600" />}
          label="Выручка за период"
          value={formatRevenue(summary.totalRevenue)}
          sub="По всей команде"
          accent="bg-emerald-50"
        />
      </div>

      {/* ── Main content ── */}
      <div className={`grid gap-6 ${selectedEngineer ? 'grid-cols-[1fr_340px]' : 'grid-cols-1'}`}>
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Engineers table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-gray-900 text-sm">Таблица инженеров</p>
              <p className="text-xs text-gray-400">Нажмите на строку для подробного анализа</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Инженер
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                      Нарядов
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                      Ср. время
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                      Оценка
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                      Выручка
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                      Балл эф-ти
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                      Тренд
                    </th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ENGINEERS.map((eng) => (
                    <EngineerRow
                      key={eng.id}
                      engineer={eng}
                      selected={selectedEngineer?.id === eng.id}
                      onClick={() =>
                        setSelectedEngineer(selectedEngineer?.id === eng.id ? null : eng)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Score legend */}
          <div className="flex items-center gap-6 px-1">
            <p className="text-xs text-gray-500 font-medium">Цветовая шкала балла:</p>
            {[
              { label: '≥ 80 — Отлично', cls: 'bg-green-100 text-green-700 border border-green-200' },
              { label: '60–79 — Норма', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
              { label: '< 60 — Требует внимания', cls: 'bg-red-100 text-red-700 border border-red-200' },
            ].map((item) => (
              <span key={item.label} className={`px-3 py-1 rounded-full text-xs font-medium ${item.cls}`}>
                {item.label}
              </span>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-6">
            <RevenueChart engineers={ENGINEERS} />
            <RevenuePie engineers={ENGINEERS} />
          </div>
        </div>

        {/* Right column — detail panel */}
        {selectedEngineer && (
          <div className="flex flex-col gap-4">
            <DetailPanel engineer={selectedEngineer} />
            <button
              onClick={() => setSelectedEngineer(null)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              Закрыть панель
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
