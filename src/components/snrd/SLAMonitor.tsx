import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type SLAStatus = 'green' | 'yellow' | 'red';
type SLALevel = 'contract' | 'corporate';

interface SLAMetric {
  deadline: string;
  remainingPct: number; // 0-100 (can be negative = breached)
  remainingMin: number; // minutes (can be negative)
  status: SLAStatus;
}

interface SLAItem {
  id: string;
  orderNumber: string;
  client: string;
  engineer: string;
  type: string;
  slaLevel: SLALevel;
  priority: 'Аварийный' | 'Срочно' | 'Высокий' | 'Средний' | 'Низкий';
  ttr: SLAMetric;
  tto: SLAMetric;
  ttf: SLAMetric;
  notified: boolean;
  escalated: boolean;
}

interface ViolatorRow {
  client: string;
  violations: number;
  totalOrders: number;
  violationPct: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SLA_ITEMS_RAW: SLAItem[] = [
  // RED rows (worst first)
  {
    id: 's1', orderNumber: 'WO-2026-000038', client: 'ТК Северный',
    engineer: 'Сидоров Д.М.', type: 'Замена компрессора',
    slaLevel: 'contract', priority: 'Аварийный', notified: true, escalated: false,
    ttr: { deadline: '11:00', remainingPct: -41, remainingMin: -247, status: 'red' },
    tto: { deadline: '11:30', remainingPct: -18, remainingMin: -128, status: 'red' },
    ttf: { deadline: '17:00', remainingPct: -1,  remainingMin: -7,   status: 'red' },
  },
  {
    id: 's2', orderNumber: 'WO-2026-000047', client: 'ТЦ Мираж',
    engineer: 'Козлов М.И.', type: 'Аварийный ремонт',
    slaLevel: 'contract', priority: 'Аварийный', notified: false, escalated: false,
    ttr: { deadline: '15:30', remainingPct: 8,  remainingMin: 23,  status: 'red' },
    tto: { deadline: '14:00', remainingPct: -16, remainingMin: -45, status: 'red' },
    ttf: { deadline: '18:00', remainingPct: 72, remainingMin: 173, status: 'green' },
  },
  {
    id: 's3', orderNumber: 'WO-2026-000062', client: 'АО ТрансСервис',
    engineer: 'Михайлов В.О.', type: 'Гарантийный ремонт',
    slaLevel: 'corporate', priority: 'Аварийный', notified: true, escalated: true,
    ttr: { deadline: '12:00', remainingPct: -5,  remainingMin: -18,  status: 'red' },
    tto: { deadline: '13:00', remainingPct: 12,  remainingMin: 31,   status: 'red' },
    ttf: { deadline: '21:00', remainingPct: 65,  remainingMin: 381,  status: 'green' },
  },
  {
    id: 's4', orderNumber: 'WO-2026-000071', client: 'ООО МегаСтрой',
    engineer: 'Лебедев К.Р.', type: 'Аварийный выезд',
    slaLevel: 'contract', priority: 'Аварийный', notified: false, escalated: false,
    ttr: { deadline: '14:45', remainingPct: 5, remainingMin: 11, status: 'red' },
    tto: { deadline: '15:15', remainingPct: 14, remainingMin: 39, status: 'red' },
    ttf: { deadline: '20:00', remainingPct: 60, remainingMin: 293, status: 'green' },
  },
  // YELLOW rows
  {
    id: 's5', orderNumber: 'WO-2026-000051', client: 'ООО Сбербанк-Сервис',
    engineer: 'Петров С.А.', type: 'ТО плановое',
    slaLevel: 'contract', priority: 'Срочно', notified: true, escalated: false,
    ttr: { deadline: '16:45', remainingPct: 38, remainingMin: 98,  status: 'yellow' },
    tto: { deadline: '15:15', remainingPct: 25, remainingMin: 48,  status: 'yellow' },
    ttf: { deadline: '20:00', remainingPct: 74, remainingMin: 293, status: 'green' },
  },
  {
    id: 's6', orderNumber: 'WO-2026-000058', client: 'ГК Ромашка',
    engineer: 'Зайцев П.В.', type: 'Профилактика',
    slaLevel: 'corporate', priority: 'Высокий', notified: false, escalated: false,
    ttr: { deadline: '16:00', remainingPct: 30, remainingMin: 72,  status: 'yellow' },
    tto: { deadline: '17:00', remainingPct: 45, remainingMin: 113, status: 'yellow' },
    ttf: { deadline: '22:00', remainingPct: 78, remainingMin: 413, status: 'green' },
  },
  {
    id: 's7', orderNumber: 'WO-2026-000066', client: 'ИП Романов С.С.',
    engineer: 'Орлов Г.Д.', type: 'Диагностика',
    slaLevel: 'corporate', priority: 'Срочно', notified: false, escalated: false,
    ttr: { deadline: '15:50', remainingPct: 22, remainingMin: 53,  status: 'yellow' },
    tto: { deadline: '16:30', remainingPct: 40, remainingMin: 98,  status: 'yellow' },
    ttf: { deadline: '21:00', remainingPct: 70, remainingMin: 353, status: 'green' },
  },
  {
    id: 's8', orderNumber: 'WO-2026-000073', client: 'БЦ Горизонт',
    engineer: 'Соколов А.Н.', type: 'Замена фильтров',
    slaLevel: 'contract', priority: 'Высокий', notified: true, escalated: false,
    ttr: { deadline: '17:30', remainingPct: 48, remainingMin: 113, status: 'yellow' },
    tto: { deadline: '16:45', remainingPct: 35, remainingMin: 80,  status: 'yellow' },
    ttf: { deadline: '22:30', remainingPct: 80, remainingMin: 443, status: 'green' },
  },
  // GREEN rows
  {
    id: 's9', orderNumber: 'WO-2026-000044', client: 'ИП Сидоров В.П.',
    engineer: 'Иванов А.К.', type: 'Диагностика',
    slaLevel: 'corporate', priority: 'Высокий', notified: false, escalated: false,
    ttr: { deadline: '17:00', remainingPct: 68, remainingMin: 113, status: 'green' },
    tto: { deadline: '16:00', remainingPct: 55, remainingMin: 73,  status: 'green' },
    ttf: { deadline: '21:00', remainingPct: 85, remainingMin: 353, status: 'green' },
  },
  {
    id: 's10', orderNumber: 'WO-2026-000055', client: 'БЦ Олимп',
    engineer: 'Новиков Р.С.', type: 'Профилактика',
    slaLevel: 'corporate', priority: 'Средний', notified: false, escalated: false,
    ttr: { deadline: '18:30', remainingPct: 75, remainingMin: 203, status: 'green' },
    tto: { deadline: '18:00', remainingPct: 72, remainingMin: 173, status: 'green' },
    ttf: { deadline: '22:00', remainingPct: 88, remainingMin: 413, status: 'green' },
  },
  {
    id: 's11', orderNumber: 'WO-2026-000059', client: 'ТЦ Арена',
    engineer: 'Федотов И.Л.', type: 'Монтаж',
    slaLevel: 'corporate', priority: 'Средний', notified: false, escalated: false,
    ttr: { deadline: '19:00', remainingPct: 80, remainingMin: 233, status: 'green' },
    tto: { deadline: '18:30', remainingPct: 76, remainingMin: 203, status: 'green' },
    ttf: { deadline: '23:00', remainingPct: 90, remainingMin: 503, status: 'green' },
  },
  {
    id: 's12', orderNumber: 'WO-2026-000061', client: 'ООО ПромЛюкс',
    engineer: 'Захаров В.Т.', type: 'ТО плановое',
    slaLevel: 'contract', priority: 'Низкий', notified: false, escalated: false,
    ttr: { deadline: '20:00', remainingPct: 85, remainingMin: 293, status: 'green' },
    tto: { deadline: '19:30', remainingPct: 82, remainingMin: 263, status: 'green' },
    ttf: { deadline: '23:30', remainingPct: 92, remainingMin: 533, status: 'green' },
  },
  {
    id: 's13', orderNumber: 'WO-2026-000064', client: 'Школа №45',
    engineer: 'Борисов С.К.', type: 'Профилактика',
    slaLevel: 'corporate', priority: 'Низкий', notified: false, escalated: false,
    ttr: { deadline: '21:00', remainingPct: 88, remainingMin: 353, status: 'green' },
    tto: { deadline: '20:00', remainingPct: 84, remainingMin: 293, status: 'green' },
    ttf: { deadline: '23:00', remainingPct: 91, remainingMin: 503, status: 'green' },
  },
  {
    id: 's14', orderNumber: 'WO-2026-000067', client: 'Поликлиника №3',
    engineer: 'Кузьмин Д.В.', type: 'Гарантийный ремонт',
    slaLevel: 'contract', priority: 'Средний', notified: false, escalated: false,
    ttr: { deadline: '17:45', remainingPct: 62, remainingMin: 143, status: 'green' },
    tto: { deadline: '17:15', remainingPct: 58, remainingMin: 113, status: 'green' },
    ttf: { deadline: '22:15', remainingPct: 87, remainingMin: 428, status: 'green' },
  },
  {
    id: 's15', orderNumber: 'WO-2026-000070', client: 'ООО АвтоДеталь',
    engineer: 'Волков Н.П.', type: 'Монтаж',
    slaLevel: 'corporate', priority: 'Средний', notified: false, escalated: false,
    ttr: { deadline: '19:30', remainingPct: 77, remainingMin: 218, status: 'green' },
    tto: { deadline: '19:00', remainingPct: 73, remainingMin: 188, status: 'green' },
    ttf: { deadline: '23:00', remainingPct: 89, remainingMin: 488, status: 'green' },
  },
];

// Totals: GREEN=187, YELLOW=23, RED=8, total=218 (mock global counters)
const GLOBAL_GREEN = 187;
const GLOBAL_YELLOW = 23;
const GLOBAL_RED = 8;
const GLOBAL_TOTAL = 218;

// 30-day SLA compliance trend
const TREND_30D = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 82 + Math.sin(i * 0.4) * 4;
  const ttr = Math.round(Math.min(99, base + Math.random() * 3));
  const tto = Math.round(Math.min(99, base - 2 + Math.random() * 3));
  const ttf = Math.round(Math.min(99, base + 2 + Math.random() * 3));
  return { day: `${day}`, ttr, tto, ttf };
});

// Pie data for current month statuses
const PIE_DATA = [
  { name: 'GREEN', value: 187, color: '#22c55e' },
  { name: 'YELLOW', value: 23,  color: '#f59e0b' },
  { name: 'RED',    value: 8,   color: '#ef4444' },
];

// Top violators by quarter
const TOP_VIOLATORS: ViolatorRow[] = [
  { client: 'ТК Северный',        violations: 12, totalOrders: 28, violationPct: 43 },
  { client: 'АО ТрансСервис',      violations: 9,  totalOrders: 31, violationPct: 29 },
  { client: 'ООО МегаСтрой',       violations: 7,  totalOrders: 19, violationPct: 37 },
  { client: 'ТЦ Мираж',            violations: 6,  totalOrders: 22, violationPct: 27 },
  { client: 'ИП Романов С.С.',      violations: 4,  totalOrders: 14, violationPct: 29 },
  { client: 'ООО Сбербанк-Сервис', violations: 3,  totalOrders: 24, violationPct: 13 },
];

// SLA compliance by work type
const SLA_BY_TYPE = [
  { type: 'Аварийный',     compliance: 74, target: 95 },
  { type: 'Гарантийный',   compliance: 88, target: 95 },
  { type: 'Замена',        compliance: 82, target: 90 },
  { type: 'ТО плановое',   compliance: 93, target: 95 },
  { type: 'Монтаж',        compliance: 96, target: 95 },
  { type: 'Профилактика',  compliance: 97, target: 95 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const worstStatus = (item: SLAItem): SLAStatus => {
  const statuses = [item.ttr.status, item.tto.status, item.ttf.status];
  if (statuses.includes('red')) return 'red';
  if (statuses.includes('yellow')) return 'yellow';
  return 'green';
};

const sortedItems = (items: SLAItem[]): SLAItem[] =>
  [...items].sort((a, b) => {
    const order: Record<SLAStatus, number> = { red: 0, yellow: 1, green: 2 };
    return order[worstStatus(a)] - order[worstStatus(b)];
  });

const formatRemaining = (min: number): string => {
  if (min < 0) return `−${Math.abs(min) < 60 ? `${Math.abs(min)} мин` : `${Math.floor(Math.abs(min) / 60)}ч ${Math.abs(min) % 60}м`}`;
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}ч ${m}м` : `${h} ч`;
};

const statusBarColor: Record<SLAStatus, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
};

const rowBg: Record<SLAStatus, string> = {
  red: 'bg-red-50/40',
  yellow: 'bg-yellow-50/30',
  green: '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MiniProgressBar = ({ metric }: { metric: SLAMetric }) => {
  const pct = Math.max(0, Math.min(100, metric.remainingPct));
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${statusBarColor[metric.status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${
        metric.status === 'red' ? 'text-red-600' :
        metric.status === 'yellow' ? 'text-yellow-600' : 'text-green-600'
      }`}>
        {metric.remainingMin < 0
          ? `−${formatRemaining(Math.abs(metric.remainingMin))}`
          : `${Math.round(pct)}% / ${formatRemaining(metric.remainingMin)}`}
      </span>
      <span className="text-[10px] text-gray-400">до {metric.deadline}</span>
    </div>
  );
};

const StatusChip = ({ status, label }: { status: SLAStatus; label: string }) => {
  const cfg: Record<SLAStatus, string> = {
    green:  'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red:    'bg-red-100 text-red-700 border-red-200',
  };
  const icon: Record<SLAStatus, string> = {
    green: 'CheckCircle', yellow: 'Clock', red: 'AlertTriangle',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg[status]}`}>
      <Icon name={icon[status]} size={10} />
      {label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: SLAItem['priority'] }) => {
  const cfg: Record<string, string> = {
    Аварийный: 'bg-red-100 text-red-700',
    Срочно:    'bg-orange-100 text-orange-700',
    Высокий:   'bg-amber-100 text-amber-700',
    Средний:   'bg-blue-100 text-blue-700',
    Низкий:    'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cfg[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SLAMonitor = () => {
  const [items, setItems] = useState<SLAItem[]>(sortedItems(SLA_ITEMS_RAW));
  const [filterStatus, setFilterStatus] = useState<'all' | SLAStatus>('all');
  const [lastRefreshed, setLastRefreshed] = useState('15:04');

  const filtered = filterStatus === 'all'
    ? items
    : items.filter(i => worstStatus(i) === filterStatus);

  const handleNotify = (id: string, orderNum: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notified: true } : i));
    // Using browser alert as toast substitute (real project would use sonner/toast)
    console.log(`Уведомление по ${orderNum} отправлено`);
  };

  const handleEscalate = (id: string, orderNum: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, escalated: true, notified: true } : i));
    console.log(`Эскалация по ${orderNum}`);
  };

  const handleRefresh = () => {
    const now = new Date();
    setLastRefreshed(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`);
  };

  // Counts within the visible 15 rows
  const redCount   = items.filter(i => worstStatus(i) === 'red').length;
  const yellowCount = items.filter(i => worstStatus(i) === 'yellow').length;
  const greenCount  = items.filter(i => worstStatus(i) === 'green').length;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Icon name="ShieldAlert" size={22} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SLA Монитор</h1>
            <p className="text-sm text-gray-500">Контроль соглашений об уровне обслуживания · обновлено в {lastRefreshed}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <Icon name="RefreshCw" size={14} className="mr-1.5" />
            Обновить
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={14} className="mr-1.5" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* ── 4 KPI Counters ── */}
      <div className="grid grid-cols-4 gap-4">
        {/* GREEN */}
        <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle2" size={20} className="text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">В норме</Badge>
          </div>
          <p className="text-3xl font-bold text-green-700">{GLOBAL_GREEN}</p>
          <p className="text-xs text-green-600 mt-1">нарядов · &gt;50% времени</p>
          <div className="mt-3 w-full h-1.5 bg-green-100 rounded-full">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round(GLOBAL_GREEN / GLOBAL_TOTAL * 100)}%` }} />
          </div>
          <p className="text-[10px] text-green-600 mt-1">{Math.round(GLOBAL_GREEN / GLOBAL_TOTAL * 100)}% от всех активных</p>
        </div>

        {/* YELLOW */}
        <div className="bg-white border border-yellow-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-yellow-600" />
            </div>
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Предупреждение</Badge>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{GLOBAL_YELLOW}</p>
          <p className="text-xs text-yellow-600 mt-1">нарядов · 20–50% времени</p>
          <div className="mt-3 w-full h-1.5 bg-yellow-100 rounded-full">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.round(GLOBAL_YELLOW / GLOBAL_TOTAL * 100)}%` }} />
          </div>
          <p className="text-[10px] text-yellow-600 mt-1">{Math.round(GLOBAL_YELLOW / GLOBAL_TOTAL * 100)}% от всех активных</p>
        </div>

        {/* RED */}
        <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="XCircle" size={20} className="text-red-600" />
            </div>
            <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Нарушено</Badge>
          </div>
          <p className="text-3xl font-bold text-red-600">{GLOBAL_RED}</p>
          <p className="text-xs text-red-600 mt-1">нарядов · &lt;20% или просрочено</p>
          <div className="mt-3 w-full h-1.5 bg-red-100 rounded-full">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.round(GLOBAL_RED / GLOBAL_TOTAL * 100)}%` }} />
          </div>
          <p className="text-[10px] text-red-600 mt-1">{Math.round(GLOBAL_RED / GLOBAL_TOTAL * 100)}% от всех активных</p>
        </div>

        {/* TOTAL */}
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={20} className="text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Всего активных</Badge>
          </div>
          <p className="text-3xl font-bold text-blue-700">{GLOBAL_TOTAL}</p>
          <p className="text-xs text-blue-600 mt-1">нарядов в работе</p>
          <div className="mt-3 flex gap-1">
            <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${GLOBAL_GREEN / GLOBAL_TOTAL * 100}%` }} />
            <div className="h-1.5 bg-yellow-400 rounded-full" style={{ width: `${GLOBAL_YELLOW / GLOBAL_TOTAL * 100}%` }} />
            <div className="h-1.5 bg-red-500 rounded-full" style={{ width: `${GLOBAL_RED / GLOBAL_TOTAL * 100}%` }} />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">мониторинг каждые 5 минут</p>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* 30-day trend */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Тренд соблюдения SLA (30 дней)</h3>
              <p className="text-xs text-gray-500 mt-0.5">% нарядов, закрытых в срок по каждой метрике</p>
            </div>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" />TTR</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" />TTO</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-500 inline-block" />TTF</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_30D} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} domain={[70, 100]} unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="ttr" stroke="#3b82f6" strokeWidth={2} dot={false} name="TTR" />
              <Line type="monotone" dataKey="tto" stroke="#10b981" strokeWidth={2} dot={false} name="TTO" />
              <Line type="monotone" dataKey="ttf" stroke="#8b5cf6" strokeWidth={2} dot={false} name="TTF" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Статусы за месяц</h3>
          <p className="text-xs text-gray-500 mb-3">Распределение нарядов по SLA-статусам</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                dataKey="value" paddingAngle={3}>
                {PIE_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v} нарядов`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </span>
                <span className="font-semibold text-gray-800">{d.value} нар.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Orders Table ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Активные наряды · SLA контроль</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {filtered.length} из {items.length}
            </span>
          </div>

          {/* Quick filter */}
          <div className="flex items-center gap-2">
            <Icon name="SlidersHorizontal" size={14} className="text-gray-400" />
            {(['all', 'red', 'yellow', 'green'] as const).map(f => {
              const labels: Record<string, string> = { all: 'Все', red: 'Нарушения', yellow: 'Предупреждения', green: 'В норме' };
              const counts: Record<string, number> = { all: items.length, red: redCount, yellow: yellowCount, green: greenCount };
              const colors: Record<string, string> = {
                all:    filterStatus === 'all'    ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                red:    filterStatus === 'red'    ? 'bg-red-600 text-white'  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                yellow: filterStatus === 'yellow' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                green:  filterStatus === 'green'  ? 'bg-green-600 text-white'  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              };
              return (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${colors[f]}`}>
                  {labels[f]} ({counts[f]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Наряд · Клиент</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">Тип · Инженер</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">
                  <span className="text-blue-600 font-semibold">TTR</span>
                  <span className="block text-[10px] font-normal text-gray-400">Time to Respond</span>
                </th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">
                  <span className="text-emerald-600 font-semibold">TTO</span>
                  <span className="block text-[10px] font-normal text-gray-400">Time to On-site</span>
                </th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">
                  <span className="text-violet-600 font-semibold">TTF</span>
                  <span className="block text-[10px] font-normal text-gray-400">Time to Fix</span>
                </th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Уровень SLA</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => {
                const ws = worstStatus(item);
                return (
                  <tr key={item.id}
                    className={`hover:bg-gray-50/70 transition-colors ${rowBg[ws]}`}>

                    {/* Order / Client */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${ws === 'red' ? 'bg-red-500 animate-pulse' : ws === 'yellow' ? 'bg-yellow-400' : 'bg-green-500'}`} />
                        <div>
                          <p className="font-mono text-xs font-semibold text-gray-800">{item.orderNumber}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{item.client}</p>
                          <PriorityBadge priority={item.priority} />
                        </div>
                      </div>
                    </td>

                    {/* Type / Engineer */}
                    <td className="px-4 py-3">
                      <p className="text-gray-800 text-xs font-medium">{item.type}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Icon name="User" size={11} className="text-gray-400" />
                        {item.engineer}
                      </p>
                    </td>

                    {/* TTR */}
                    <td className="px-4 py-3">
                      <MiniProgressBar metric={item.ttr} />
                    </td>

                    {/* TTO */}
                    <td className="px-4 py-3">
                      <MiniProgressBar metric={item.tto} />
                    </td>

                    {/* TTF */}
                    <td className="px-4 py-3">
                      <MiniProgressBar metric={item.ttf} />
                    </td>

                    {/* SLA Level */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.slaLevel === 'contract'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.slaLevel === 'contract' ? 'Договорной' : 'Корпоративный'}
                      </span>
                      {item.escalated && (
                        <span className="block mt-1 text-[10px] text-red-600 font-medium flex items-center justify-center gap-0.5">
                          <Icon name="ChevronsUp" size={10} />Эскалирован
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-end gap-1.5">
                        {ws !== 'green' && !item.notified && (
                          <Button size="sm" variant="outline"
                            className="text-xs h-7 px-2"
                            onClick={() => handleNotify(item.id, item.orderNumber)}>
                            <Icon name="Bell" size={11} className="mr-1" />
                            Уведомить
                          </Button>
                        )}
                        {ws === 'red' && !item.escalated && (
                          <Button size="sm"
                            className="text-xs h-7 px-2 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleEscalate(item.id, item.orderNumber)}>
                            <Icon name="ChevronsUp" size={11} className="mr-1" />
                            Эскалировать
                          </Button>
                        )}
                        {item.notified && ws !== 'green' && (
                          <StatusChip status="yellow" label="Уведомлён" />
                        )}
                        {ws === 'green' && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Icon name="CheckCircle" size={12} className="text-green-500" />
                            В норме
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Icon name="CheckCircle2" size={40} className="mx-auto mb-3 text-green-400" />
              <p className="text-gray-500 font-medium">Нарушений SLA нет</p>
              <p className="text-gray-400 text-sm mt-1">Все наряды выполняются в срок</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Section: Top Violators + SLA by Type ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Top violators table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Топ нарушителей SLA</h3>
            <p className="text-xs text-gray-500 mt-0.5">Клиенты с наибольшим % нарушений за квартал</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-xs">Клиент</th>
                <th className="text-center px-4 py-2.5 text-gray-500 font-medium text-xs">Нарушений</th>
                <th className="text-center px-4 py-2.5 text-gray-500 font-medium text-xs">Нарядов</th>
                <th className="text-right px-4 py-2.5 text-gray-500 font-medium text-xs">% нарушений</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TOP_VIOLATORS.map((row, idx) => (
                <tr key={row.client} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-5 h-5 rounded flex items-center justify-center ${
                        idx === 0 ? 'bg-red-100 text-red-700' :
                        idx === 1 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{idx + 1}</span>
                      <span className="text-xs text-gray-800 font-medium">{row.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-xs font-semibold text-red-600">{row.violations}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-xs text-gray-600">{row.totalOrders}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.violationPct >= 35 ? 'bg-red-500' : row.violationPct >= 25 ? 'bg-yellow-400' : 'bg-green-500'}`}
                          style={{ width: `${row.violationPct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${row.violationPct >= 35 ? 'text-red-600' : row.violationPct >= 25 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {row.violationPct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SLA by work type bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">SLA по типам работ</h3>
          <p className="text-xs text-gray-500 mb-4">Фактическое vs целевое соблюдение SLA, %</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={SLA_BY_TYPE}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={82} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="compliance" name="Фактический %" radius={[0, 3, 3, 0]}>
                {SLA_BY_TYPE.map((entry) => (
                  <Cell
                    key={entry.type}
                    fill={entry.compliance >= entry.target ? '#22c55e' : entry.compliance >= entry.target - 10 ? '#f59e0b' : '#ef4444'}
                  />
                ))}
              </Bar>
              <Bar dataKey="target" name="Целевой %" fill="#dbeafe" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SLAMonitor;
