import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'quarter';
type EngineerStatus = 'leader' | 'stable' | 'watch';

interface ClientReview {
  id: string;
  client: string;
  rating: number;
  comment: string;
  date: string;
}

interface EngineerFull {
  id: string;
  rank: number;
  name: string;
  initials: string;
  avatarColor: string;
  position: string;
  orders: number;
  revenue: number;
  marginPct: number;
  nps: number;
  timeOnSite: number;   // часов
  repeatCallPct: number; // %
  status: EngineerStatus;
  radarData: {
    speed: number;
    quality: number;
    nps: number;
    revenue: number;
    margin: number;
    orders: number;
  };
  weeklyOrders: { week: string; orders: number }[];
  workTypes: { type: string; count: number }[];
  reviews: ClientReview[];
}

interface AIRecommendation {
  id: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ENGINEERS: EngineerFull[] = [
  {
    id: 'e1',
    rank: 1,
    name: 'Козлов Михаил',
    initials: 'КМ',
    avatarColor: 'bg-blue-500',
    position: 'Инженер-монтажник',
    orders: 31,
    revenue: 248000,
    marginPct: 38.4,
    nps: 4.9,
    timeOnSite: 3.1,
    repeatCallPct: 1.8,
    status: 'leader',
    radarData: { speed: 92, quality: 96, nps: 97, revenue: 95, margin: 88, orders: 94 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 7 },
      { week: 'Нед 2', orders: 8 },
      { week: 'Нед 3', orders: 9 },
      { week: 'Нед 4', orders: 7 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 12 },
      { type: 'Ремонт', count: 9 },
      { type: 'ТО', count: 7 },
      { type: 'Диагностика', count: 3 },
    ],
    reviews: [
      { id: 'r1', client: 'ТЦ Галерея', rating: 5, comment: 'Всё сделал чисто и быстро, спасибо!', date: '12.05.2026' },
      { id: 'r2', client: 'Офис Алроса', rating: 5, comment: 'Профессионал своего дела, рекомендую.', date: '10.05.2026' },
      { id: 'r3', client: 'СберБанк', rating: 5, comment: 'Прибыл вовремя, объяснил всё понятно.', date: '07.05.2026' },
      { id: 'r4', client: 'Кафе Лето', rating: 5, comment: 'Отлично, за 40 минут решил проблему.', date: '04.05.2026' },
      { id: 'r5', client: 'БЦ Панорама', rating: 4, comment: 'Хорошая работа, небольшая задержка.', date: '01.05.2026' },
    ],
  },
  {
    id: 'e2',
    rank: 2,
    name: 'Новиков Андрей',
    initials: 'НА',
    avatarColor: 'bg-emerald-500',
    position: 'Инженер по климату',
    orders: 28,
    revenue: 224000,
    marginPct: 35.9,
    nps: 4.8,
    timeOnSite: 2.9,
    repeatCallPct: 2.1,
    status: 'leader',
    radarData: { speed: 88, quality: 91, nps: 95, revenue: 90, margin: 84, orders: 89 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 6 },
      { week: 'Нед 2', orders: 7 },
      { week: 'Нед 3', orders: 8 },
      { week: 'Нед 4', orders: 7 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 10 },
      { type: 'Ремонт', count: 8 },
      { type: 'ТО', count: 7 },
      { type: 'Диагностика', count: 3 },
    ],
    reviews: [
      { id: 'r1', client: 'БЦ Панорама', rating: 5, comment: 'Супер специалист, всё объяснил.', date: '11.05.2026' },
      { id: 'r2', client: 'Спортзал Атлет', rating: 5, comment: 'Очень доволен работой.', date: '09.05.2026' },
      { id: 'r3', client: 'Офис Газпром', rating: 5, comment: 'Сделал всё быстро и аккуратно.', date: '06.05.2026' },
      { id: 'r4', client: 'ООО Стандарт', rating: 4, comment: 'В целом доволен, немного задержался.', date: '03.05.2026' },
      { id: 'r5', client: 'ТД Меркурий', rating: 4, comment: 'Хорошая работа мастера.', date: '30.04.2026' },
    ],
  },
  {
    id: 'e3',
    rank: 3,
    name: 'Фёдоров Игорь',
    initials: 'ФИ',
    avatarColor: 'bg-violet-500',
    position: 'Ведущий инженер',
    orders: 22,
    revenue: 211000,
    marginPct: 42.1,
    nps: 4.8,
    timeOnSite: 2.4,
    repeatCallPct: 1.5,
    status: 'leader',
    radarData: { speed: 95, quality: 88, nps: 93, revenue: 87, margin: 96, orders: 76 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 5 },
      { week: 'Нед 2', orders: 6 },
      { week: 'Нед 3', orders: 6 },
      { week: 'Нед 4', orders: 5 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 5 },
      { type: 'Ремонт', count: 10 },
      { type: 'ТО', count: 4 },
      { type: 'Диагностика', count: 3 },
    ],
    reviews: [
      { id: 'r1', client: 'Завод Промтех', rating: 5, comment: 'Очень профессиональный специалист.', date: '12.05.2026' },
      { id: 'r2', client: 'ЦОД Серверный', rating: 5, comment: 'Отличная работа, быстро и чисто.', date: '08.05.2026' },
      { id: 'r3', client: 'Лаборатория НИИ', rating: 5, comment: 'Знает дело на отлично.', date: '05.05.2026' },
      { id: 'r4', client: 'Склад Авто', rating: 4, comment: 'Доволен результатом.', date: '02.05.2026' },
      { id: 'r5', client: 'Офис Регион', rating: 4, comment: 'Хороший мастер.', date: '28.04.2026' },
    ],
  },
  {
    id: 'e4',
    rank: 4,
    name: 'Петров Сергей',
    initials: 'ПС',
    avatarColor: 'bg-amber-500',
    position: 'Инженер по климату',
    orders: 24,
    revenue: 186000,
    marginPct: 31.2,
    nps: 4.6,
    timeOnSite: 3.3,
    repeatCallPct: 7.4,
    status: 'watch',
    radarData: { speed: 74, quality: 80, nps: 84, revenue: 76, margin: 70, orders: 82 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 5 },
      { week: 'Нед 2', orders: 6 },
      { week: 'Нед 3', orders: 7 },
      { week: 'Нед 4', orders: 6 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 8 },
      { type: 'Ремонт', count: 11 },
      { type: 'ТО', count: 3 },
      { type: 'Диагностика', count: 2 },
    ],
    reviews: [
      { id: 'r1', client: 'Аптека Здоровье', rating: 5, comment: 'Быстро и качественно.', date: '11.05.2026' },
      { id: 'r2', client: 'Ресторан Парус', rating: 4, comment: 'Хорошая работа.', date: '08.05.2026' },
      { id: 'r3', client: 'Фитнес Макс', rating: 3, comment: 'Пришлось вызвать повторно через неделю.', date: '05.05.2026' },
      { id: 'r4', client: 'ИП Сажин', rating: 3, comment: 'Не до конца разобрался с проблемой.', date: '02.05.2026' },
      { id: 'r5', client: 'Склад Логист', rating: 3, comment: 'Ремонт пришлось переделывать.', date: '28.04.2026' },
    ],
  },
  {
    id: 'e5',
    rank: 5,
    name: 'Орлов Кирилл',
    initials: 'ОК',
    avatarColor: 'bg-cyan-500',
    position: 'Инженер-монтажник',
    orders: 20,
    revenue: 162000,
    marginPct: 33.7,
    nps: 4.6,
    timeOnSite: 2.8,
    repeatCallPct: 2.9,
    status: 'stable',
    radarData: { speed: 80, quality: 84, nps: 85, revenue: 78, margin: 80, orders: 74 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 5 },
      { week: 'Нед 2', orders: 5 },
      { week: 'Нед 3', orders: 6 },
      { week: 'Нед 4', orders: 4 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 9 },
      { type: 'Ремонт', count: 5 },
      { type: 'ТО', count: 4 },
      { type: 'Диагностика', count: 2 },
    ],
    reviews: [
      { id: 'r1', client: 'Школа №15', rating: 5, comment: 'Всё сделано аккуратно.', date: '11.05.2026' },
      { id: 'r2', client: 'ООО Синтез', rating: 5, comment: 'Мастер с опытом.', date: '09.05.2026' },
      { id: 'r3', client: 'Кафе Лето', rating: 4, comment: 'В целом хорошо, немного шумно работал.', date: '06.05.2026' },
      { id: 'r4', client: 'ИП Зайцев', rating: 4, comment: 'Доволен работой.', date: '03.05.2026' },
      { id: 'r5', client: 'Мастерская ТВ', rating: 4, comment: 'Хорошо, спасибо.', date: '30.04.2026' },
    ],
  },
  {
    id: 'e6',
    rank: 6,
    name: 'Иванов Алексей',
    initials: 'ИА',
    avatarColor: 'bg-pink-500',
    position: 'Инженер по климату',
    orders: 18,
    revenue: 138000,
    marginPct: 29.8,
    nps: 4.4,
    timeOnSite: 3.6,
    repeatCallPct: 4.1,
    status: 'stable',
    radarData: { speed: 72, quality: 76, nps: 80, revenue: 68, margin: 72, orders: 70 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 4 },
      { week: 'Нед 2', orders: 5 },
      { week: 'Нед 3', orders: 5 },
      { week: 'Нед 4', orders: 4 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 6 },
      { type: 'Ремонт', count: 7 },
      { type: 'ТО', count: 4 },
      { type: 'Диагностика', count: 1 },
    ],
    reviews: [
      { id: 'r1', client: 'Детский сад №4', rating: 5, comment: 'Отличная работа!', date: '10.05.2026' },
      { id: 'r2', client: 'Клиника Мед', rating: 4, comment: 'Спасибо, всё работает.', date: '07.05.2026' },
      { id: 'r3', client: 'Офис ГК Строй', rating: 4, comment: 'Сделал нормально.', date: '04.05.2026' },
      { id: 'r4', client: 'ООО Ритм', rating: 3, comment: 'Немного затянул с ремонтом.', date: '01.05.2026' },
      { id: 'r5', client: 'Магазин Техно', rating: 3, comment: 'Не всё объяснил по итогам.', date: '28.04.2026' },
    ],
  },
  {
    id: 'e7',
    rank: 7,
    name: 'Смирнов Денис',
    initials: 'СД',
    avatarColor: 'bg-teal-500',
    position: 'Инженер по климату',
    orders: 16,
    revenue: 124000,
    marginPct: 30.5,
    nps: 4.5,
    timeOnSite: 3.1,
    repeatCallPct: 3.5,
    status: 'stable',
    radarData: { speed: 76, quality: 79, nps: 82, revenue: 70, margin: 74, orders: 66 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 4 },
      { week: 'Нед 2', orders: 4 },
      { week: 'Нед 3', orders: 4 },
      { week: 'Нед 4', orders: 4 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 5 },
      { type: 'Ремонт', count: 6 },
      { type: 'ТО', count: 3 },
      { type: 'Диагностика', count: 2 },
    ],
    reviews: [
      { id: 'r1', client: 'Аптека Фарм', rating: 5, comment: 'Профессионал!', date: '11.05.2026' },
      { id: 'r2', client: 'ТД Восток', rating: 4, comment: 'Всё хорошо, спасибо.', date: '08.05.2026' },
      { id: 'r3', client: 'Офис Прима', rating: 4, comment: 'Доволен.', date: '05.05.2026' },
      { id: 'r4', client: 'СТО Авто', rating: 4, comment: 'Работает аккуратно.', date: '02.05.2026' },
      { id: 'r5', client: 'Магазин Уют', rating: 4, comment: 'Хорошая работа.', date: '29.04.2026' },
    ],
  },
  {
    id: 'e8',
    rank: 8,
    name: 'Лебедев Руслан',
    initials: 'ЛР',
    avatarColor: 'bg-indigo-500',
    position: 'Инженер по климату',
    orders: 14,
    revenue: 108000,
    marginPct: 28.3,
    nps: 4.3,
    timeOnSite: 3.4,
    repeatCallPct: 5.2,
    status: 'stable',
    radarData: { speed: 70, quality: 74, nps: 78, revenue: 64, margin: 68, orders: 62 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 3 },
      { week: 'Нед 2', orders: 4 },
      { week: 'Нед 3', orders: 4 },
      { week: 'Нед 4', orders: 3 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 4 },
      { type: 'Ремонт', count: 6 },
      { type: 'ТО', count: 3 },
      { type: 'Диагностика', count: 1 },
    ],
    reviews: [
      { id: 'r1', client: 'ТЦ Радуга', rating: 4, comment: 'Нормально сделал.', date: '10.05.2026' },
      { id: 'r2', client: 'Склад Авто', rating: 4, comment: 'Справился с задачей.', date: '07.05.2026' },
      { id: 'r3', client: 'ИП Грачёв', rating: 3, comment: 'Немного дольше, чем обещали.', date: '04.05.2026' },
      { id: 'r4', client: 'ООО Вектор', rating: 3, comment: 'Пришлось уточнять детали повторно.', date: '01.05.2026' },
      { id: 'r5', client: 'Аренда Плюс', rating: 4, comment: 'В целом доволен.', date: '28.04.2026' },
    ],
  },
  {
    id: 'e9',
    rank: 9,
    name: 'Жуков Никита',
    initials: 'ЖН',
    avatarColor: 'bg-orange-500',
    position: 'Инженер (стажёр)',
    orders: 11,
    revenue: 76000,
    marginPct: 25.1,
    nps: 4.2,
    timeOnSite: 4.1,
    repeatCallPct: 8.9,
    status: 'watch',
    radarData: { speed: 58, quality: 64, nps: 72, revenue: 50, margin: 58, orders: 54 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 2 },
      { week: 'Нед 2', orders: 3 },
      { week: 'Нед 3', orders: 3 },
      { week: 'Нед 4', orders: 3 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 3 },
      { type: 'Ремонт', count: 5 },
      { type: 'ТО', count: 2 },
      { type: 'Диагностика', count: 1 },
    ],
    reviews: [
      { id: 'r1', client: 'Пекарня Хлеб', rating: 4, comment: 'Старается, молодой специалист.', date: '11.05.2026' },
      { id: 'r2', client: 'Автосервис АС', rating: 3, comment: 'Долго разбирался с неисправностью.', date: '08.05.2026' },
      { id: 'r3', client: 'Салон Красоты', rating: 3, comment: 'Пришлось звонить повторно.', date: '05.05.2026' },
      { id: 'r4', client: 'ТСЖ Радуга', rating: 3, comment: 'Неопытный, но старается.', date: '02.05.2026' },
      { id: 'r5', client: 'Аренда Плюс', rating: 2, comment: 'Ремонт не устранил проблему.', date: '29.04.2026' },
    ],
  },
  {
    id: 'e10',
    rank: 10,
    name: 'Сидоров Дмитрий',
    initials: 'СД',
    avatarColor: 'bg-rose-500',
    position: 'Инженер (стажёр)',
    orders: 9,
    revenue: 58000,
    marginPct: 22.6,
    nps: 4.0,
    timeOnSite: 4.5,
    repeatCallPct: 10.2,
    status: 'watch',
    radarData: { speed: 50, quality: 58, nps: 66, revenue: 42, margin: 50, orders: 46 },
    weeklyOrders: [
      { week: 'Нед 1', orders: 2 },
      { week: 'Нед 2', orders: 2 },
      { week: 'Нед 3', orders: 3 },
      { week: 'Нед 4', orders: 2 },
    ],
    workTypes: [
      { type: 'Монтаж', count: 2 },
      { type: 'Ремонт', count: 4 },
      { type: 'ТО', count: 2 },
      { type: 'Диагностика', count: 1 },
    ],
    reviews: [
      { id: 'r1', client: 'Магазин Продукты', rating: 4, comment: 'Справился, хотя долго.', date: '10.05.2026' },
      { id: 'r2', client: 'ИП Борисов', rating: 3, comment: 'Нужна помощь наставника.', date: '07.05.2026' },
      { id: 'r3', client: 'ООО Прима', rating: 3, comment: 'Не очень уверенно.', date: '04.05.2026' },
      { id: 'r4', client: 'ТСЖ Берёзка', rating: 2, comment: 'Пришлось вызвать снова.', date: '01.05.2026' },
      { id: 'r5', client: 'Школа №7', rating: 3, comment: 'Молодой, учится.', date: '28.04.2026' },
    ],
  },
];

// Командный ComposedChart — 12 недель
const TEAM_CHART_DATA = [
  { week: 'Нед 1', revenue: 186000, nps: 4.6, sla: 91 },
  { week: 'Нед 2', revenue: 204000, nps: 4.7, sla: 93 },
  { week: 'Нед 3', revenue: 198000, nps: 4.5, sla: 90 },
  { week: 'Нед 4', revenue: 221000, nps: 4.8, sla: 95 },
  { week: 'Нед 5', revenue: 215000, nps: 4.7, sla: 94 },
  { week: 'Нед 6', revenue: 238000, nps: 4.9, sla: 96 },
  { week: 'Нед 7', revenue: 226000, nps: 4.8, sla: 95 },
  { week: 'Нед 8', revenue: 242000, nps: 4.9, sla: 97 },
  { week: 'Нед 9', revenue: 231000, nps: 4.7, sla: 94 },
  { week: 'Нед 10', revenue: 255000, nps: 4.8, sla: 96 },
  { week: 'Нед 11', revenue: 248000, nps: 4.9, sla: 95 },
  { week: 'Нед 12', revenue: 263000, nps: 5.0, sla: 98 },
];

const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'ai1',
    icon: 'AlertTriangle',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50 border-red-200',
    title: 'Высокий % повторных вызовов у Петрова',
    description: 'За последний месяц показатель повторных вызовов составил 7.4% — вдвое выше нормы (3.2%). Возможная причина: недиагностированные корневые неисправности.',
    action: 'Направить на дообучение по диагностике',
    priority: 'high',
  },
  {
    id: 'ai2',
    icon: 'Star',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50 border-amber-200',
    title: 'Козлов — кандидат в наставники',
    description: 'NPS 4.9/5 и минимальный процент повторных вызовов (1.8%) делают его лучшим кандидатом для наставничества над стажёрами Жуковым и Сидоровым.',
    action: 'Назначить наставником',
    priority: 'medium',
  },
  {
    id: 'ai3',
    icon: 'TrendingDown',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    title: 'Снижение загрузки в пятницу',
    description: 'Данные за 4 недели показывают падение нарядов в пятницу на 22% по сравнению со средой-четвергом. Это снижает недельную выручку на ~38 000 ₽.',
    action: 'Скорректировать расписание',
    priority: 'medium',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Неделя',
  month: 'Месяц',
  quarter: 'Квартал',
};

const STATUS_CONFIG: Record<EngineerStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  leader: { label: 'Лидер', variant: 'default' },
  stable: { label: 'Стабильный', variant: 'secondary' },
  watch: { label: 'На контроле', variant: 'destructive' },
};

const RANK_MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function formatRevenue(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)} млн ₽`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)} тыс. ₽`;
  return `${n} ₽`;
}

function npsColor(nps: number): string {
  if (nps >= 4.7) return 'text-green-600 font-semibold';
  if (nps >= 4.4) return 'text-amber-600 font-semibold';
  return 'text-red-600 font-semibold';
}

function repeatCallColor(pct: number): string {
  if (pct <= 3) return 'text-green-600 font-semibold';
  if (pct <= 6) return 'text-amber-600 font-semibold';
  return 'text-red-600 font-semibold';
}

function marginColor(pct: number): string {
  if (pct >= 35) return 'text-green-600 font-semibold';
  if (pct >= 28) return 'text-amber-600 font-semibold';
  return 'text-red-600 font-semibold';
}

function renderStars(rating: number): JSX.Element {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}>
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface TeamMetricProps {
  iconName: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  suffix?: string;
  sub?: string;
}

function TeamMetric({ iconName, iconBg, iconColor, label, value, suffix, sub }: TeamMetricProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon name={iconName} size={22} className={iconColor} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value}
          {suffix && <span className="text-base font-normal text-gray-400 ml-1">{suffix}</span>}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Engineer Detail Panel ────────────────────────────────────────────────────

interface DetailPanelProps {
  engineer: EngineerFull;
  onClose: () => void;
}

function DetailPanel({ engineer, onClose }: DetailPanelProps) {
  const radarPoints = [
    { axis: 'Скорость', value: engineer.radarData.speed },
    { axis: 'Качество', value: engineer.radarData.quality },
    { axis: 'NPS', value: engineer.radarData.nps },
    { axis: 'Выручка', value: engineer.radarData.revenue },
    { axis: 'Маржа', value: engineer.radarData.margin },
    { axis: 'Нарядов', value: engineer.radarData.orders },
  ];

  const statusCfg = STATUS_CONFIG[engineer.status];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${engineer.avatarColor}`}
        >
          {engineer.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{engineer.name}</p>
          <p className="text-xs text-gray-500 truncate">{engineer.position}</p>
        </div>
        <Badge variant={statusCfg.variant} className="text-xs flex-shrink-0">
          {statusCfg.label}
        </Badge>
        <button
          onClick={onClose}
          className="ml-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          title="Закрыть"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">
        {/* Radar */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Профиль инженера
          </p>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radarPoints}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Radar
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly orders line */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Динамика нарядов (4 недели)
          </p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={engineer.weeklyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                name="Нарядов"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Work types bar */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Типы работ
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={engineer.workTypes} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={72} />
              <Tooltip />
              <Bar dataKey="count" name="Нарядов" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reviews */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Последние отзывы клиентов
          </p>
          <div className="flex flex-col gap-2">
            {engineer.reviews.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-800">{r.client}</p>
                  <div className="flex items-center gap-1.5">
                    {renderStars(r.rating)}
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <Button
            size="sm"
            className="w-full justify-center gap-2"
            onClick={() =>
              toast.success(`Задача поставлена инженеру ${engineer.name}`, {
                description: 'Задача будет отображена в его личном кабинете',
              })
            }
          >
            <Icon name="ClipboardList" size={14} />
            Поставить задачу
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={() =>
              toast(`Запланирована беседа с ${engineer.name}`, {
                description: 'Уведомление отправлено руководителю',
                icon: '💬',
              })
            }
          >
            <Icon name="MessageSquare" size={14} />
            Провести беседу
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Recommendation Card ───────────────────────────────────────────────────

function AICard({ rec }: { rec: AIRecommendation }) {
  return (
    <div className={`border rounded-xl p-4 flex flex-col gap-3 ${rec.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon name={rec.icon} size={16} className={rec.iconColor} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{rec.title}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            rec.priority === 'high'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {rec.priority === 'high' ? 'Высокий' : 'Средний'}
        </span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{rec.description}</p>
      <button
        className="self-start text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        onClick={() =>
          toast(`Действие: ${rec.action}`, {
            description: 'Запрос направлен ответственному сотруднику',
            icon: '🤖',
          })
        }
      >
        <Icon name="ArrowRight" size={12} />
        {rec.action}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PerformanceDashboardFull = () => {
  const [period, setPeriod] = useState<Period>('month');
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerFull | null>(null);

  const handleRowClick = (eng: EngineerFull) => {
    setSelectedEngineer((prev) => (prev?.id === eng.id ? null : eng));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Icon name="BarChart2" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Дашборд эффективности команды</h1>
            <p className="text-sm text-gray-500">Сводная аналитика по инженерам · «Сервис Климат»</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            {(['week', 'month', 'quarter'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => toast.success('Отчёт сформирован', { description: 'Файл будет загружен автоматически' })}
          >
            <Icon name="Download" size={14} />
            Экспорт
          </Button>
        </div>
      </div>

      {/* ── Team metrics ── */}
      <div className="grid grid-cols-4 gap-4">
        <TeamMetric
          iconName="Star"
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Средний NPS команды"
          value="4.7"
          suffix="/ 5 ⭐"
          sub="Оценка клиентов за период"
        />
        <TeamMetric
          iconName="CheckCircle"
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Выполнено в срок"
          value="94.3"
          suffix="%"
          sub="Соблюдение SLA"
        />
        <TeamMetric
          iconName="Clock"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Среднее время наряда"
          value="2.8"
          suffix="ч"
          sub="Время на объекте"
        />
        <TeamMetric
          iconName="RefreshCcw"
          iconBg="bg-red-50"
          iconColor="text-red-500"
          label="Повторных вызовов"
          value="3.2"
          suffix="%"
          sub="Ниже нормы — хорошо"
        />
      </div>

      {/* ── Main content area ── */}
      <div className="flex gap-5">

        {/* ── Left: table + team chart ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Engineers table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-gray-900 text-sm">ТОП-10 инженеров</p>
              <p className="text-xs text-gray-400">Нажмите строку для детальной карточки</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10 text-center">#</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Инженер</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Нарядов</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Выручка</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Маржа%</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">NPS</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Время на выезде</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Повт. вызовы</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ENGINEERS.map((eng) => (
                    <tr
                      key={eng.id}
                      onClick={() => handleRowClick(eng)}
                      className={`cursor-pointer transition-colors ${
                        selectedEngineer?.id === eng.id
                          ? 'bg-blue-50 border-l-2 border-l-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3 text-center">
                        {RANK_MEDALS[eng.rank] ? (
                          <span className="text-base">{RANK_MEDALS[eng.rank]}</span>
                        ) : (
                          <span className="text-xs font-semibold text-gray-500">{eng.rank}</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${eng.avatarColor}`}
                          >
                            {eng.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm leading-tight">{eng.name}</p>
                            <p className="text-xs text-gray-400">{eng.position}</p>
                          </div>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gray-900">{eng.orders}</span>
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        {formatRevenue(eng.revenue)}
                      </td>

                      {/* Margin */}
                      <td className={`px-4 py-3 text-center ${marginColor(eng.marginPct)}`}>
                        {eng.marginPct.toFixed(1)}%
                      </td>

                      {/* NPS */}
                      <td className={`px-4 py-3 text-center ${npsColor(eng.nps)}`}>
                        {eng.nps.toFixed(1)}
                      </td>

                      {/* Time on site */}
                      <td className="px-4 py-3 text-center text-gray-700">
                        {eng.timeOnSite.toFixed(1)} ч
                      </td>

                      {/* Repeat calls */}
                      <td className={`px-4 py-3 text-center ${repeatCallColor(eng.repeatCallPct)}`}>
                        {eng.repeatCallPct.toFixed(1)}%
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3 text-center">
                        <Badge variant={STATUS_CONFIG[eng.status].variant} className="text-xs">
                          {STATUS_CONFIG[eng.status].label}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-5">
              <p className="text-xs text-gray-500 font-medium">Цветовая индикация:</p>
              <span className="flex items-center gap-1.5 text-xs text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Хороший показатель
              </span>
              <span className="flex items-center gap-1.5 text-xs text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Требует внимания
              </span>
              <span className="flex items-center gap-1.5 text-xs text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                Критический уровень
              </span>
            </div>
          </div>

          {/* Team ComposedChart */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 text-sm">Динамика команды за 12 недель</p>
              <p className="text-xs text-gray-400">Выручка · NPS · % выполнения SLA</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={TEAM_CHART_DATA} margin={{ top: 4, right: 48, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis
                  yAxisId="revenue"
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}К`}
                  tick={{ fontSize: 10 }}
                  width={42}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  width={36}
                  domain={[4, 5.2]}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') return [`${value.toLocaleString('ru-RU')} ₽`, 'Выручка'];
                    if (name === 'nps') return [value.toFixed(1), 'NPS'];
                    if (name === 'sla') return [`${value}%`, 'SLA выполнение'];
                    return [value, name];
                  }}
                />
                <Legend
                  formatter={(value: string) => {
                    const labels: Record<string, string> = {
                      revenue: 'Выручка',
                      nps: 'NPS клиентов',
                      sla: 'Выполнение SLA %',
                    };
                    return labels[value] ?? value;
                  }}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar yAxisId="revenue" dataKey="revenue" fill="#bfdbfe" radius={[3, 3, 0, 0]} name="revenue" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="nps"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#f59e0b' }}
                  name="nps"
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="sla"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 3, fill: '#10b981' }}
                  name="sla"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Right column: detail panel + AI ── */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-5">

          {/* Engineer detail card or placeholder */}
          {selectedEngineer ? (
            <DetailPanel
              engineer={selectedEngineer}
              onClose={() => setSelectedEngineer(null)}
            />
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon name="User" size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">Выберите инженера</p>
              <p className="text-xs text-gray-400">Нажмите на строку таблицы для просмотра детальной карточки</p>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                <Icon name="Sparkles" size={14} className="text-purple-600" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">Рекомендации ИИ</p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {AI_RECOMMENDATIONS.map((rec) => (
                <AICard key={rec.id} rec={rec} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboardFull;
