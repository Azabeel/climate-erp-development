import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'quarter' | 'year';

interface Technician {
  id: string;
  name: string;
  initials: string;
  role: string;
  orders: number;
  onTimePercent: number;
  rating: number;
  revenue: number;
  margin: number;
  score: number;
  radar: { subject: string; value: number }[];
  scoreHistory: { month: string; score: number }[];
  topOrders: { id: string; description: string; revenue: number; rating: number }[];
  nextTraining: string;
  achievements: string[];
}

interface Achievement {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  progress: number;
  target: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TECHNICIANS: Technician[] = [
  {
    id: 't1',
    name: 'Петров А.В.',
    initials: 'ПА',
    role: 'Старший инженер',
    orders: 47,
    onTimePercent: 97,
    rating: 4.9,
    revenue: 387000,
    margin: 38,
    score: 94,
    radar: [
      { subject: 'Скорость', value: 92 },
      { subject: 'Качество', value: 96 },
      { subject: 'SLA', value: 97 },
      { subject: 'Выручка', value: 95 },
      { subject: 'Оценка клиента', value: 98 },
      { subject: 'Сложность', value: 88 },
    ],
    scoreHistory: [
      { month: 'Июн', score: 84 }, { month: 'Июл', score: 86 }, { month: 'Авг', score: 88 },
      { month: 'Сен', score: 85 }, { month: 'Окт', score: 89 }, { month: 'Ноя', score: 91 },
      { month: 'Дек', score: 90 }, { month: 'Янв', score: 92 }, { month: 'Фев', score: 91 },
      { month: 'Мар', score: 93 }, { month: 'Апр', score: 93 }, { month: 'Май', score: 94 },
    ],
    topOrders: [
      { id: 'WO-2025-000312', description: 'Монтаж VRF-системы, ТЦ Меркурий', revenue: 84000, rating: 5 },
      { id: 'WO-2025-000287', description: 'Диагностика + чистка чиллера Daikin', revenue: 32000, rating: 5 },
      { id: 'WO-2025-000251', description: 'Гарантийный ремонт компрессора Mitsubishi', revenue: 0, rating: 5 },
    ],
    nextTraining: 'Refrigerant Handling R-32 — 22 мая 2026',
    achievements: ['best_month', 'orders_100', 'sla_pro', 'no_delays', 'client_favorite'],
  },
  {
    id: 't2',
    name: 'Козлов Д.М.',
    initials: 'КД',
    role: 'Инженер по климату',
    orders: 41,
    onTimePercent: 93,
    rating: 4.7,
    revenue: 298000,
    margin: 34,
    score: 87,
    radar: [
      { subject: 'Скорость', value: 88 },
      { subject: 'Качество', value: 90 },
      { subject: 'SLA', value: 93 },
      { subject: 'Выручка', value: 84 },
      { subject: 'Оценка клиента', value: 94 },
      { subject: 'Сложность', value: 82 },
    ],
    scoreHistory: [
      { month: 'Июн', score: 78 }, { month: 'Июл', score: 80 }, { month: 'Авг', score: 81 },
      { month: 'Сен', score: 79 }, { month: 'Окт', score: 83 }, { month: 'Ноя', score: 84 },
      { month: 'Дек', score: 84 }, { month: 'Янв', score: 85 }, { month: 'Фев', score: 86 },
      { month: 'Мар', score: 86 }, { month: 'Апр', score: 87 }, { month: 'Май', score: 87 },
    ],
    topOrders: [
      { id: 'WO-2025-000319', description: 'ТО приточно-вытяжной установки', revenue: 28000, rating: 5 },
      { id: 'WO-2025-000298', description: 'Замена компрессора Panasonic 24 кВт', revenue: 54000, rating: 4 },
      { id: 'WO-2025-000266', description: 'Пуско-наладка мультисплит системы', revenue: 18000, rating: 5 },
    ],
    nextTraining: 'Сложные системы VRF Mitsubishi — 10 июня 2026',
    achievements: ['orders_100', 'sla_pro', 'quick_start'],
  },
  {
    id: 't3',
    name: 'Морозова Е.К.',
    initials: 'МЕ',
    role: 'Инженер по климату',
    orders: 38,
    onTimePercent: 90,
    rating: 4.8,
    revenue: 261000,
    margin: 36,
    score: 82,
    radar: [
      { subject: 'Скорость', value: 79 },
      { subject: 'Качество', value: 91 },
      { subject: 'SLA', value: 90 },
      { subject: 'Выручка', value: 78 },
      { subject: 'Оценка клиента', value: 96 },
      { subject: 'Сложность', value: 75 },
    ],
    scoreHistory: [
      { month: 'Июн', score: 74 }, { month: 'Июл', score: 75 }, { month: 'Авг', score: 77 },
      { month: 'Сен', score: 76 }, { month: 'Окт', score: 78 }, { month: 'Ноя', score: 79 },
      { month: 'Дек', score: 80 }, { month: 'Янв', score: 80 }, { month: 'Фев', score: 81 },
      { month: 'Мар', score: 81 }, { month: 'Апр', score: 82 }, { month: 'Май', score: 82 },
    ],
    topOrders: [
      { id: 'WO-2025-000324', description: 'Сервисное обслуживание офисных кондиционеров', revenue: 45000, rating: 5 },
      { id: 'WO-2025-000307', description: 'Ремонт фанкойла, отель Гранд', revenue: 22000, rating: 5 },
      { id: 'WO-2025-000279', description: 'Заправка хладагентом R-410A, 5 блоков', revenue: 14000, rating: 4 },
    ],
    nextTraining: 'Клиентский сервис и деловая коммуникация — 5 мая 2026',
    achievements: ['client_favorite', 'no_delays'],
  },
  {
    id: 't4',
    name: 'Смирнов В.А.',
    initials: 'СВ',
    role: 'Инженер-монтажник',
    orders: 35,
    onTimePercent: 88,
    rating: 4.5,
    revenue: 224000,
    margin: 31,
    score: 78,
    radar: [
      { subject: 'Скорость', value: 85 },
      { subject: 'Качество', value: 82 },
      { subject: 'SLA', value: 88 },
      { subject: 'Выручка', value: 75 },
      { subject: 'Оценка клиента', value: 90 },
      { subject: 'Сложность', value: 70 },
    ],
    scoreHistory: [
      { month: 'Июн', score: 70 }, { month: 'Июл', score: 72 }, { month: 'Авг', score: 73 },
      { month: 'Сен', score: 74 }, { month: 'Окт', score: 75 }, { month: 'Ноя', score: 76 },
      { month: 'Дек', score: 76 }, { month: 'Янв', score: 77 }, { month: 'Фев', score: 77 },
      { month: 'Мар', score: 78 }, { month: 'Апр', score: 78 }, { month: 'Май', score: 78 },
    ],
    topOrders: [
      { id: 'WO-2025-000316', description: 'Монтаж кондиционеров, жилой комплекс', revenue: 62000, rating: 5 },
      { id: 'WO-2025-000290', description: 'Пуско-наладка приточной установки', revenue: 24000, rating: 4 },
      { id: 'WO-2025-000261', description: 'Чистка дренажной системы, 8 единиц', revenue: 12000, rating: 4 },
    ],
    nextTraining: 'Монтаж систем вентиляции — 28 мая 2026',
    achievements: ['quick_start'],
  },
  {
    id: 't5',
    name: 'Новиков И.С.',
    initials: 'НИ',
    role: 'Инженер по климату',
    orders: 31,
    onTimePercent: 85,
    rating: 4.3,
    revenue: 198000,
    margin: 29,
    score: 72,
    radar: [
      { subject: 'Скорость', value: 76 },
      { subject: 'Качество', value: 78 },
      { subject: 'SLA', value: 85 },
      { subject: 'Выручка', value: 68 },
      { subject: 'Оценка клиента', value: 86 },
      { subject: 'Сложность', value: 65 },
    ],
    scoreHistory: [
      { month: 'Июн', score: 64 }, { month: 'Июл', score: 66 }, { month: 'Авг', score: 67 },
      { month: 'Сен', score: 68 }, { month: 'Окт', score: 69 }, { month: 'Ноя', score: 70 },
      { month: 'Дек', score: 70 }, { month: 'Янв', score: 71 }, { month: 'Фев', score: 71 },
      { month: 'Мар', score: 72 }, { month: 'Апр', score: 72 }, { month: 'Май', score: 72 },
    ],
    topOrders: [
      { id: 'WO-2025-000320', description: 'Диагностика неисправности компрессора', revenue: 8000, rating: 4 },
      { id: 'WO-2025-000302', description: 'ТО сплит-систем, офисный центр', revenue: 31000, rating: 4 },
      { id: 'WO-2025-000274', description: 'Замена фильтров и дренажного насоса', revenue: 9500, rating: 5 },
    ],
    nextTraining: 'Диагностика холодильных систем — 15 июня 2026',
    achievements: [],
  },
  {
    id: 't6',
    name: 'Захарова О.П.',
    initials: 'ЗО',
    role: 'Инженер по климату',
    orders: 28,
    onTimePercent: 82,
    rating: 4.4,
    revenue: 175000,
    margin: 32,
    score: 68,
    radar: [
      { subject: 'Скорость', value: 70 },
      { subject: 'Качество', value: 80 },
      { subject: 'SLA', value: 82 },
      { subject: 'Выручка', value: 60 },
      { subject: 'Оценка клиента', value: 88 },
      { subject: 'Сложность', value: 58 },
    ],
    scoreHistory: [
      { month: 'Июн', score: 60 }, { month: 'Июл', score: 61 }, { month: 'Авг', score: 63 },
      { month: 'Сен', score: 63 }, { month: 'Окт', score: 64 }, { month: 'Ноя', score: 65 },
      { month: 'Дек', score: 65 }, { month: 'Янв', score: 66 }, { month: 'Фев', score: 67 },
      { month: 'Мар', score: 67 }, { month: 'Апр', score: 68 }, { month: 'Май', score: 68 },
    ],
    topOrders: [
      { id: 'WO-2025-000326', description: 'Обслуживание прецизионных кондиционеров', revenue: 42000, rating: 5 },
      { id: 'WO-2025-000300', description: 'Монтаж канального кондиционера Haier', revenue: 28000, rating: 4 },
      { id: 'WO-2025-000268', description: 'Замена хладагента R-22 → R-407C', revenue: 19000, rating: 4 },
    ],
    nextTraining: 'Безопасность при работе с хладагентами — 3 июня 2026',
    achievements: [],
  },
  {
    id: 't7',
    name: 'Кузнецов Р.О.',
    initials: 'КР',
    role: 'Стажёр',
    orders: 19,
    onTimePercent: 74,
    rating: 4.1,
    revenue: 98000,
    margin: 24,
    score: 55,
    radar: [
      { subject: 'Скорость', value: 60 },
      { subject: 'Качество', value: 65 },
      { subject: 'SLA', value: 74 },
      { subject: 'Выручка', value: 45 },
      { subject: 'Оценка клиента', value: 82 },
      { subject: 'Сложность', value: 40 },
    ],
    scoreHistory: [
      { month: 'Июн', score: 40 }, { month: 'Июл', score: 43 }, { month: 'Авг', score: 45 },
      { month: 'Сен', score: 46 }, { month: 'Окт', score: 48 }, { month: 'Ноя', score: 49 },
      { month: 'Дек', score: 50 }, { month: 'Янв', score: 51 }, { month: 'Фев', score: 52 },
      { month: 'Мар', score: 53 }, { month: 'Апр', score: 54 }, { month: 'Май', score: 55 },
    ],
    topOrders: [
      { id: 'WO-2025-000321', description: 'Чистка внутреннего блока сплит-системы', revenue: 5000, rating: 4 },
      { id: 'WO-2025-000304', description: 'Диагностика кондиционера Gree', revenue: 3500, rating: 4 },
      { id: 'WO-2025-000275', description: 'Заправка хладагента, 1 блок', revenue: 2800, rating: 5 },
    ],
    nextTraining: 'Базовый курс HVAC — 20 мая 2026',
    achievements: [],
  },
  {
    id: 't8',
    name: 'Тихонов Г.В.',
    initials: 'ТГ',
    role: 'Стажёр',
    orders: 14,
    onTimePercent: 68,
    rating: 3.9,
    revenue: 64000,
    margin: 20,
    score: 42,
    radar: [
      { subject: 'Скорость', value: 50 },
      { subject: 'Качество', value: 55 },
      { subject: 'SLA', value: 68 },
      { subject: 'Выручка', value: 35 },
      { subject: 'Оценка клиента', value: 78 },
      { subject: 'Сложность', value: 30 },
    ],
    scoreHistory: [
      { month: 'Июн', score: 28 }, { month: 'Июл', score: 30 }, { month: 'Авг', score: 33 },
      { month: 'Сен', score: 35 }, { month: 'Окт', score: 36 }, { month: 'Ноя', score: 37 },
      { month: 'Дек', score: 38 }, { month: 'Янв', score: 39 }, { month: 'Фев', score: 40 },
      { month: 'Мар', score: 40 }, { month: 'Апр', score: 41 }, { month: 'Май', score: 42 },
    ],
    topOrders: [
      { id: 'WO-2025-000318', description: 'Профилактика оборудования', revenue: 6500, rating: 4 },
      { id: 'WO-2025-000295', description: 'Чистка фильтров, жилой дом', revenue: 3000, rating: 4 },
      { id: 'WO-2025-000262', description: 'Устранение шума вентилятора', revenue: 4200, rating: 4 },
    ],
    nextTraining: 'Базовый курс HVAC — 20 мая 2026',
    achievements: [],
  },
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'best_month',
    label: 'Лучший месяца',
    icon: 'Trophy',
    color: 'text-yellow-500',
    description: 'Занял 1 место по итогам месяца',
    progress: 1,
    target: 1,
  },
  {
    id: 'orders_100',
    label: '100 нарядов',
    icon: 'ClipboardList',
    color: 'text-blue-500',
    description: '100 выполненных нарядов за карьеру',
    progress: 100,
    target: 100,
  },
  {
    id: 'sla_pro',
    label: 'SLA Pro',
    icon: 'ShieldCheck',
    color: 'text-green-500',
    description: '3 месяца подряд без нарушений SLA',
    progress: 3,
    target: 3,
  },
  {
    id: 'quick_start',
    label: 'Быстрый старт',
    icon: 'Zap',
    color: 'text-orange-500',
    description: '10 нарядов в первый месяц',
    progress: 10,
    target: 10,
  },
  {
    id: 'no_delays',
    label: 'Нет опозданий',
    icon: 'Clock',
    color: 'text-purple-500',
    description: 'Ни одного опоздания за квартал',
    progress: 90,
    target: 90,
  },
  {
    id: 'client_favorite',
    label: 'Клиентский фаворит',
    icon: 'Heart',
    color: 'text-pink-500',
    description: 'Средняя оценка 4.8+ за месяц',
    progress: 48,
    target: 48,
  },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'quarter', label: 'Квартал' },
  { key: 'year', label: 'Год' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score > 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

function scoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score > 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
}

function formatRevenue(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)} тыс.₽` : `${n}₽`;
}

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name={i < full ? 'Star' : half && i === full ? 'StarHalf' : 'Star'}
          size={12}
          className={i < full || (half && i === full) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600">{value.toFixed(1)}</span>
    </span>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PodiumCard({
  rank,
  technician,
  onSelect,
  selected,
}: {
  rank: 1 | 2 | 3;
  technician: Technician;
  onSelect: () => void;
  selected: boolean;
}) {
  const config = {
    1: {
      medal: 'Trophy',
      medalColor: 'text-yellow-500',
      ring: 'ring-2 ring-yellow-400',
      bg: 'bg-gradient-to-b from-yellow-50 to-white',
      height: 'pt-0',
      label: '🥇 1 место',
      labelColor: 'text-yellow-700 bg-yellow-100',
    },
    2: {
      medal: 'Medal',
      medalColor: 'text-slate-400',
      ring: 'ring-2 ring-slate-300',
      bg: 'bg-gradient-to-b from-slate-50 to-white',
      height: 'pt-4',
      label: '🥈 2 место',
      labelColor: 'text-slate-600 bg-slate-100',
    },
    3: {
      medal: 'Award',
      medalColor: 'text-amber-600',
      ring: 'ring-2 ring-amber-300',
      bg: 'bg-gradient-to-b from-amber-50 to-white',
      height: 'pt-8',
      label: '🥉 3 место',
      labelColor: 'text-amber-700 bg-amber-100',
    },
  }[rank];

  return (
    <button
      onClick={onSelect}
      className={`flex-1 flex flex-col items-center rounded-xl border p-4 cursor-pointer transition-all
        ${config.bg} ${config.height}
        ${selected ? config.ring + ' shadow-lg scale-[1.02]' : 'hover:shadow-md border-gray-200'}`}
    >
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-3 ${config.labelColor}`}>
        {config.label}
      </span>
      <div className="relative mb-2">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
          {technician.initials}
        </div>
        <Icon
          name={config.medal}
          size={18}
          className={`absolute -top-1 -right-1 ${config.medalColor}`}
        />
      </div>
      <div className="font-semibold text-gray-900 text-sm text-center">{technician.name}</div>
      <div className="text-xs text-gray-500 mb-2">{technician.role}</div>
      <div className={`text-2xl font-bold mb-1 ${scoreColor(technician.score).split(' ')[0]}`}>
        {technician.score}
      </div>
      <div className="text-xs text-gray-500 mb-2">баллов</div>
      <div className="w-full border-t pt-2 mt-1 grid grid-cols-2 gap-1 text-xs">
        <div className="text-center">
          <div className="font-semibold text-gray-800">{technician.orders}</div>
          <div className="text-gray-500">нарядов</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-800">{technician.rating}</div>
          <div className="text-gray-500">оценка</div>
        </div>
      </div>
      {rank === 1 && (
        <div className="mt-2 text-xs font-medium text-yellow-700">
          {formatRevenue(technician.revenue)}
        </div>
      )}
    </button>
  );
}

function DetailPanel({ technician }: { technician: Technician }) {
  const earned = ACHIEVEMENTS.filter((a) => technician.achievements.includes(a.id));

  return (
    <div className="w-80 min-w-[320px] flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
      {/* Header */}
      <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg">
          {technician.initials}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{technician.name}</div>
          <div className="text-sm text-gray-500">{technician.role}</div>
          <Badge variant={scoreBadgeVariant(technician.score)} className="mt-1 text-xs">
            {technician.score} баллов
          </Badge>
        </div>
      </div>

      {/* Radar */}
      <div className="bg-white rounded-xl border p-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">Профиль компетенций</div>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={technician.radar}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
            <Radar
              name={technician.name}
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
            />
            <Tooltip formatter={(v: number) => [`${v}`, 'Балл']} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl border p-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">Динамика балла (12 мес.)</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={technician.scoreHistory} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
            <Tooltip formatter={(v: number) => [`${v}`, 'Балл']} />
            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top orders */}
      <div className="bg-white rounded-xl border p-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">Топ-3 наряда</div>
        <div className="flex flex-col gap-2">
          {technician.topOrders.map((o) => (
            <div key={o.id} className="rounded-lg bg-gray-50 p-2">
              <div className="flex justify-between items-start gap-1">
                <div className="text-xs font-mono text-indigo-600">{o.id}</div>
                <StarRating value={o.rating} />
              </div>
              <div className="text-xs text-gray-700 mt-0.5 leading-tight">{o.description}</div>
              {o.revenue > 0 && (
                <div className="text-xs text-gray-500 mt-0.5">{formatRevenue(o.revenue)}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next training */}
      <div className="bg-white rounded-xl border p-4">
        <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <Icon name="BookOpen" size={14} className="text-indigo-500" />
          Следующее обучение
        </div>
        <div className="text-xs text-gray-600">{technician.nextTraining}</div>
      </div>

      {/* Achievements */}
      {earned.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">Достижения</div>
          <div className="flex flex-wrap gap-2">
            {earned.map((a) => (
              <div
                key={a.id}
                title={a.description}
                className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 text-xs border"
              >
                <Icon name={a.icon} size={12} className={a.color} />
                <span className="text-gray-700">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TechnicianScorecardFull() {
  const [period, setPeriod] = useState<Period>('month');
  const [selectedId, setSelectedId] = useState<string | null>(TECHNICIANS[0].id);

  const sorted = [...TECHNICIANS].sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3) as [Technician, Technician, Technician];
  const selectedTech = TECHNICIANS.find((t) => t.id === selectedId) ?? null;

  // Bar chart data
  const barData = sorted.map((t) => ({
    name: t.name.split(' ')[0] + ' ' + (t.name.split(' ')[1]?.[0] ?? '') + '.',
    Нарядов: t.orders,
    'Выручка (тыс.)': Math.round(t.revenue / 1000),
    Балл: t.score,
  }));

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="BarChart3" size={22} className="text-indigo-600" />
            Скорборд инженеров
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">KPI и рейтинг сотрудников сервисного центра</p>
        </div>
        {/* Period switcher */}
        <div className="flex items-center bg-white rounded-lg border p-1 gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-7"
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <div className="bg-white rounded-xl border p-5">
        <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Icon name="Trophy" size={16} className="text-yellow-500" />
          Топ-3 инженера — {PERIODS.find((p) => p.key === period)?.label}
        </div>
        <div className="flex gap-4 items-end">
          {/* 2nd place left, 1st center, 3rd right */}
          <PodiumCard
            rank={2}
            technician={top3[1]}
            onSelect={() => setSelectedId(top3[1].id)}
            selected={selectedId === top3[1].id}
          />
          <PodiumCard
            rank={1}
            technician={top3[0]}
            onSelect={() => setSelectedId(top3[0].id)}
            selected={selectedId === top3[0].id}
          />
          <PodiumCard
            rank={3}
            technician={top3[2]}
            onSelect={() => setSelectedId(top3[2].id)}
            selected={selectedId === top3[2].id}
          />
        </div>
      </div>

      {/* Main content: table + detail panel */}
      <div className="flex gap-4 items-start">
        {/* Table */}
        <div className="flex-1 bg-white rounded-xl border overflow-hidden min-w-0">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <Icon name="Users" size={16} className="text-indigo-500" />
            <span className="font-semibold text-sm text-gray-700">Все инженеры</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {TECHNICIANS.length} чел.
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-2 w-8">#</th>
                  <th className="text-left px-4 py-2">Инженер</th>
                  <th className="text-center px-3 py-2">Нарядов</th>
                  <th className="text-center px-3 py-2">Вовремя</th>
                  <th className="text-center px-3 py-2">Оценка</th>
                  <th className="text-right px-3 py-2">Выручка</th>
                  <th className="text-center px-3 py-2">Маржа</th>
                  <th className="text-center px-3 py-2">Балл</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((tech, idx) => {
                  const isSelected = selectedId === tech.id;
                  return (
                    <tr
                      key={tech.id}
                      onClick={() => setSelectedId(isSelected ? null : tech.id)}
                      className={`border-b cursor-pointer transition-colors last:border-0
                        ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                            {tech.initials}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 whitespace-nowrap">{tech.name}</div>
                            <div className="text-xs text-gray-500">{tech.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-800">{tech.orders}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`text-xs font-semibold ${
                            tech.onTimePercent >= 90
                              ? 'text-green-600'
                              : tech.onTimePercent >= 75
                              ? 'text-yellow-600'
                              : 'text-red-500'
                          }`}
                        >
                          {tech.onTimePercent}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StarRating value={tech.rating} />
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-gray-800 whitespace-nowrap">
                        {formatRevenue(tech.revenue)}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-gray-600">{tech.margin}%</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${scoreColor(tech.score)}`}
                        >
                          {tech.score}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selectedTech && <DetailPanel technician={selectedTech} />}
      </div>

      {/* Bar chart comparison */}
      <div className="bg-white rounded-xl border p-5">
        <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Icon name="BarChart2" size={16} className="text-indigo-500" />
          Сравнение инженеров
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="Нарядов" fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="left" dataKey="Выручка (тыс.)" fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="Балл" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gamification */}
      <div className="bg-white rounded-xl border p-5">
        <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <Icon name="Award" size={16} className="text-purple-500" />
          Достижения и геймификация
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Разблокируй бейджи — выполняй KPI и развивайся профессионально
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = selectedTech?.achievements.includes(a.id) ?? false;
            const pct = Math.min(100, Math.round((a.progress / a.target) * 100));
            return (
              <div
                key={a.id}
                className={`flex flex-col items-center rounded-xl border p-3 transition-all
                  ${unlocked ? 'bg-gradient-to-b from-purple-50 to-white border-purple-200 shadow-sm' : 'bg-gray-50 opacity-60'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${unlocked ? 'bg-purple-100' : 'bg-gray-200'}`}
                >
                  <Icon name={a.icon} size={20} className={unlocked ? a.color : 'text-gray-400'} />
                </div>
                <div className="text-xs font-semibold text-center text-gray-800 mb-1">{a.label}</div>
                <div className="text-[10px] text-gray-500 text-center mb-2 leading-tight">
                  {a.description}
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${unlocked ? 'bg-purple-500' : 'bg-gray-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 mt-1">{pct}%</div>
              </div>
            );
          })}
        </div>

        {/* Next level progress */}
        {selectedTech && (
          <div className="mt-5 bg-indigo-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Icon name="TrendingUp" size={20} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-indigo-800">
                {selectedTech.name} — прогресс к уровню «Эксперт»
              </div>
              <div className="mt-1.5 h-2 bg-indigo-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, selectedTech.score)}%` }}
                />
              </div>
              <div className="text-xs text-indigo-600 mt-1">
                {selectedTech.score}/100 баллов — необходимо 90 для следующего уровня
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
