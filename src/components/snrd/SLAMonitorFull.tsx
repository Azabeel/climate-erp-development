import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type SLAStatus = 'green' | 'yellow' | 'red';
type SLALevel  = 'contract' | 'corporate';

interface SLAMetric {
  deadline: string;
  remainingPct: number;   // 0–100 (отрицательное = просрочено)
  remainingMin: number;   // минуты (отрицательное = просрочено)
  status: SLAStatus;
}

interface WorkOrder {
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
  assigned: boolean;
  escalated: boolean;
}

// ─── Mock Data: 20 нарядов ────────────────────────────────────────────────────

const WORK_ORDERS_RAW: WorkOrder[] = [
  // RED (нарушения)
  {
    id: 'wo1', orderNumber: 'WO-2026-000038', client: 'ТК Северный',
    engineer: 'Сидоров Д.М.', type: 'Замена компрессора',
    slaLevel: 'contract', priority: 'Аварийный', notified: true, assigned: true, escalated: false,
    ttr: { deadline: '11:00', remainingPct: -41, remainingMin: -247, status: 'red' },
    tto: { deadline: '11:30', remainingPct: -18, remainingMin: -128, status: 'red' },
    ttf: { deadline: '17:00', remainingPct: -1,  remainingMin: -7,   status: 'red' },
  },
  {
    id: 'wo2', orderNumber: 'WO-2026-000047', client: 'ТЦ Мираж',
    engineer: 'Козлов М.И.', type: 'Аварийный ремонт чиллера',
    slaLevel: 'contract', priority: 'Аварийный', notified: false, assigned: false, escalated: false,
    ttr: { deadline: '15:30', remainingPct: 8,  remainingMin: 23,  status: 'red' },
    tto: { deadline: '14:00', remainingPct: -16, remainingMin: -45, status: 'red' },
    ttf: { deadline: '18:00', remainingPct: 72, remainingMin: 173, status: 'green' },
  },
  {
    id: 'wo3', orderNumber: 'WO-2026-000062', client: 'АО ТрансСервис',
    engineer: 'Михайлов В.О.', type: 'Гарантийный ремонт VRF',
    slaLevel: 'corporate', priority: 'Аварийный', notified: true, assigned: true, escalated: true,
    ttr: { deadline: '12:00', remainingPct: -5,  remainingMin: -18,  status: 'red' },
    tto: { deadline: '13:00', remainingPct: 12,  remainingMin: 31,   status: 'red' },
    ttf: { deadline: '21:00', remainingPct: 65,  remainingMin: 381,  status: 'green' },
  },
  {
    id: 'wo4', orderNumber: 'WO-2026-000071', client: 'ООО МегаСтрой',
    engineer: 'Лебедев К.Р.', type: 'Аварийный выезд',
    slaLevel: 'contract', priority: 'Аварийный', notified: false, assigned: false, escalated: false,
    ttr: { deadline: '14:45', remainingPct: 5,  remainingMin: 11,  status: 'red' },
    tto: { deadline: '15:15', remainingPct: 14, remainingMin: 39,  status: 'red' },
    ttf: { deadline: '20:00', remainingPct: 60, remainingMin: 293, status: 'green' },
  },
  // YELLOW (предупреждения)
  {
    id: 'wo5', orderNumber: 'WO-2026-000051', client: 'ООО Сбербанк-Сервис',
    engineer: 'Петров С.А.', type: 'ТО плановое (кондиционеры)',
    slaLevel: 'contract', priority: 'Срочно', notified: true, assigned: true, escalated: false,
    ttr: { deadline: '16:45', remainingPct: 38, remainingMin: 98,  status: 'yellow' },
    tto: { deadline: '15:15', remainingPct: 25, remainingMin: 48,  status: 'yellow' },
    ttf: { deadline: '20:00', remainingPct: 74, remainingMin: 293, status: 'green' },
  },
  {
    id: 'wo6', orderNumber: 'WO-2026-000058', client: 'ГК Ромашка',
    engineer: 'Зайцев П.В.', type: 'Профилактика оборудования',
    slaLevel: 'corporate', priority: 'Высокий', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '16:00', remainingPct: 30, remainingMin: 72,  status: 'yellow' },
    tto: { deadline: '17:00', remainingPct: 45, remainingMin: 113, status: 'yellow' },
    ttf: { deadline: '22:00', remainingPct: 78, remainingMin: 413, status: 'green' },
  },
  {
    id: 'wo7', orderNumber: 'WO-2026-000066', client: 'ИП Романов С.С.',
    engineer: 'Орлов Г.Д.', type: 'Диагностика сплит-системы',
    slaLevel: 'corporate', priority: 'Срочно', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '15:50', remainingPct: 22, remainingMin: 53,  status: 'yellow' },
    tto: { deadline: '16:30', remainingPct: 40, remainingMin: 98,  status: 'yellow' },
    ttf: { deadline: '21:00', remainingPct: 70, remainingMin: 353, status: 'green' },
  },
  {
    id: 'wo8', orderNumber: 'WO-2026-000073', client: 'БЦ Горизонт',
    engineer: 'Соколов А.Н.', type: 'Замена фильтров фанкойлов',
    slaLevel: 'contract', priority: 'Высокий', notified: true, assigned: true, escalated: false,
    ttr: { deadline: '17:30', remainingPct: 48, remainingMin: 113, status: 'yellow' },
    tto: { deadline: '16:45', remainingPct: 35, remainingMin: 80,  status: 'yellow' },
    ttf: { deadline: '22:30', remainingPct: 80, remainingMin: 443, status: 'green' },
  },
  {
    id: 'wo9', orderNumber: 'WO-2026-000079', client: 'ТЦ Планета',
    engineer: 'Щербаков Н.А.', type: 'Заправка хладагента R-410A',
    slaLevel: 'contract', priority: 'Срочно', notified: false, assigned: false, escalated: false,
    ttr: { deadline: '17:00', remainingPct: 28, remainingMin: 64,  status: 'yellow' },
    tto: { deadline: '18:00', remainingPct: 55, remainingMin: 143, status: 'yellow' },
    ttf: { deadline: '23:00', remainingPct: 82, remainingMin: 473, status: 'green' },
  },
  // GREEN (норма)
  {
    id: 'wo10', orderNumber: 'WO-2026-000044', client: 'ИП Сидоров В.П.',
    engineer: 'Иванов А.К.', type: 'Диагностика мультизональной системы',
    slaLevel: 'corporate', priority: 'Высокий', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '17:00', remainingPct: 68, remainingMin: 113, status: 'green' },
    tto: { deadline: '16:00', remainingPct: 55, remainingMin: 73,  status: 'green' },
    ttf: { deadline: '21:00', remainingPct: 85, remainingMin: 353, status: 'green' },
  },
  {
    id: 'wo11', orderNumber: 'WO-2026-000055', client: 'БЦ Олимп',
    engineer: 'Новиков Р.С.', type: 'Плановое ТО центрального кондиционера',
    slaLevel: 'corporate', priority: 'Средний', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '18:30', remainingPct: 75, remainingMin: 203, status: 'green' },
    tto: { deadline: '18:00', remainingPct: 72, remainingMin: 173, status: 'green' },
    ttf: { deadline: '22:00', remainingPct: 88, remainingMin: 413, status: 'green' },
  },
  {
    id: 'wo12', orderNumber: 'WO-2026-000059', client: 'ТЦ Арена',
    engineer: 'Федотов И.Л.', type: 'Монтаж кассетного кондиционера',
    slaLevel: 'corporate', priority: 'Средний', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '19:00', remainingPct: 80, remainingMin: 233, status: 'green' },
    tto: { deadline: '18:30', remainingPct: 76, remainingMin: 203, status: 'green' },
    ttf: { deadline: '23:00', remainingPct: 90, remainingMin: 503, status: 'green' },
  },
  {
    id: 'wo13', orderNumber: 'WO-2026-000061', client: 'ООО ПромЛюкс',
    engineer: 'Захаров В.Т.', type: 'ТО плановое (охлаждение сервера)',
    slaLevel: 'contract', priority: 'Низкий', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '20:00', remainingPct: 85, remainingMin: 293, status: 'green' },
    tto: { deadline: '19:30', remainingPct: 82, remainingMin: 263, status: 'green' },
    ttf: { deadline: '23:30', remainingPct: 92, remainingMin: 533, status: 'green' },
  },
  {
    id: 'wo14', orderNumber: 'WO-2026-000064', client: 'Школа №45',
    engineer: 'Борисов С.К.', type: 'Профилактика вентиляции',
    slaLevel: 'corporate', priority: 'Низкий', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '21:00', remainingPct: 88, remainingMin: 353, status: 'green' },
    tto: { deadline: '20:00', remainingPct: 84, remainingMin: 293, status: 'green' },
    ttf: { deadline: '23:00', remainingPct: 91, remainingMin: 503, status: 'green' },
  },
  {
    id: 'wo15', orderNumber: 'WO-2026-000067', client: 'Поликлиника №3',
    engineer: 'Кузьмин Д.В.', type: 'Гарантийный ремонт (медицинский холодильник)',
    slaLevel: 'contract', priority: 'Средний', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '17:45', remainingPct: 62, remainingMin: 143, status: 'green' },
    tto: { deadline: '17:15', remainingPct: 58, remainingMin: 113, status: 'green' },
    ttf: { deadline: '22:15', remainingPct: 87, remainingMin: 428, status: 'green' },
  },
  {
    id: 'wo16', orderNumber: 'WO-2026-000070', client: 'ООО АвтоДеталь',
    engineer: 'Волков Н.П.', type: 'Монтаж промышленного чиллера',
    slaLevel: 'corporate', priority: 'Средний', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '19:30', remainingPct: 77, remainingMin: 218, status: 'green' },
    tto: { deadline: '19:00', remainingPct: 73, remainingMin: 188, status: 'green' },
    ttf: { deadline: '23:00', remainingPct: 89, remainingMin: 488, status: 'green' },
  },
  {
    id: 'wo17', orderNumber: 'WO-2026-000074', client: 'Гостиница Азимут',
    engineer: 'Тихонов А.В.', type: 'Замена теплообменника',
    slaLevel: 'contract', priority: 'Высокий', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '18:00', remainingPct: 71, remainingMin: 163, status: 'green' },
    tto: { deadline: '17:30', remainingPct: 66, remainingMin: 133, status: 'green' },
    ttf: { deadline: '22:00', remainingPct: 84, remainingMin: 383, status: 'green' },
  },
  {
    id: 'wo18', orderNumber: 'WO-2026-000076', client: 'ИП Федосеев К.П.',
    engineer: 'Крылов О.С.', type: 'Диагностика утечки хладагента',
    slaLevel: 'corporate', priority: 'Низкий', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '20:30', remainingPct: 86, remainingMin: 323, status: 'green' },
    tto: { deadline: '20:00', remainingPct: 82, remainingMin: 293, status: 'green' },
    ttf: { deadline: '23:30', remainingPct: 93, remainingMin: 563, status: 'green' },
  },
  {
    id: 'wo19', orderNumber: 'WO-2026-000081', client: 'Завод «Прогресс»',
    engineer: 'Антонов С.М.', type: 'ТО промышленной вентиляции',
    slaLevel: 'contract', priority: 'Средний', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '18:45', remainingPct: 74, remainingMin: 178, status: 'green' },
    tto: { deadline: '18:15', remainingPct: 70, remainingMin: 148, status: 'green' },
    ttf: { deadline: '22:45', remainingPct: 87, remainingMin: 458, status: 'green' },
  },
  {
    id: 'wo20', orderNumber: 'WO-2026-000085', client: 'ООО Агрохолодпром',
    engineer: 'Морозов Е.Г.', type: 'Замена компрессора холодильной камеры',
    slaLevel: 'corporate', priority: 'Высокий', notified: false, assigned: true, escalated: false,
    ttr: { deadline: '19:15', remainingPct: 76, remainingMin: 208, status: 'green' },
    tto: { deadline: '18:45', remainingPct: 72, remainingMin: 178, status: 'green' },
    ttf: { deadline: '23:15', remainingPct: 90, remainingMin: 518, status: 'green' },
  },
];

// Шапочные счётчики
const TOTAL_ACTIVE = 47;
const TOTAL_GREEN  = 34;
const TOTAL_YELLOW = 9;
const TOTAL_RED    = 4;

// 30 дней SLA по зонам (AreaChart)
const AREA_TREND = Array.from({ length: 30 }, (_, i) => {
  const seed = Math.sin(i * 0.6) * 3 + Math.cos(i * 0.4) * 2;
  const green  = Math.round(Math.min(88, Math.max(65, 76 + seed)));
  const yellow = Math.round(Math.min(20, Math.max(6,  12 - seed * 0.3)));
  const red    = Math.round(Math.min(10, Math.max(2,   6 - seed * 0.2)));
  return { day: `${i + 1}`, green, yellow, red };
});

// Причины нарушений (PieChart)
const VIOLATION_CAUSES = [
  { name: 'Нет запчастей',        value: 35, color: '#ef4444' },
  { name: 'Инженер недоступен',   value: 25, color: '#f97316' },
  { name: 'Пробки',               value: 20, color: '#f59e0b' },
  { name: 'Сложный ремонт',       value: 15, color: '#8b5cf6' },
  { name: 'Прочее',               value: 5,  color: '#6b7280' },
];

// Топ-10 клиентов по SLA (BarChart горизонтальный — отсортирован по возрастанию)
const CLIENT_SLA_COMPLIANCE = [
  { client: 'Завод «Прогресс»',       compliance: 97 },
  { client: 'Гостиница Азимут',       compliance: 96 },
  { client: 'БЦ Олимп',              compliance: 95 },
  { client: 'Поликлиника №3',         compliance: 93 },
  { client: 'Школа №45',             compliance: 92 },
  { client: 'ИП Сидоров В.П.',        compliance: 89 },
  { client: 'ООО ПромЛюкс',          compliance: 86 },
  { client: 'ООО Сбербанк-Сервис',   compliance: 81 },
  { client: 'АО ТрансСервис',         compliance: 71 },
  { client: 'ТК Северный',            compliance: 57 },
].sort((a, b) => a.compliance - b.compliance);

// Критические наряды для секции уведомлений (5 шт.)
const CRITICAL_ORDERS = WORK_ORDERS_RAW.filter(o =>
  o.ttr.status === 'red' || o.tto.status === 'red'
).slice(0, 5);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const worstStatus = (o: WorkOrder): SLAStatus => {
  const s = [o.ttr.status, o.tto.status, o.ttf.status];
  if (s.includes('red'))    return 'red';
  if (s.includes('yellow')) return 'yellow';
  return 'green';
};

const sortedOrders = (list: WorkOrder[]): WorkOrder[] =>
  [...list].sort((a, b) => {
    const ord: Record<SLAStatus, number> = { red: 0, yellow: 1, green: 2 };
    return ord[worstStatus(a)] - ord[worstStatus(b)];
  });

const fmtMin = (min: number): string => {
  const abs = Math.abs(min);
  if (abs < 60) return `${abs} мин`;
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m > 0 ? `${h}ч ${m}м` : `${h} ч`;
};

const statusBarCls: Record<SLAStatus, string> = {
  green:  'bg-green-500',
  yellow: 'bg-yellow-400',
  red:    'bg-red-500',
};

const rowBgCls: Record<SLAStatus, string> = {
  red:    'bg-red-50/50',
  yellow: 'bg-yellow-50/40',
  green:  '',
};

const statusTextCls: Record<SLAStatus, string> = {
  green:  'text-green-600',
  yellow: 'text-yellow-600',
  red:    'text-red-600',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MiniBar = ({ metric }: { metric: SLAMetric }) => {
  const pct = Math.max(0, Math.min(100, metric.remainingPct));
  const label = metric.remainingMin < 0
    ? `−${fmtMin(metric.remainingMin)}`
    : `${Math.round(pct)}%`;
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[72px]">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${statusBarCls[metric.status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[11px] font-semibold ${statusTextCls[metric.status]}`}>
        {label}
      </span>
      <span className="text-[10px] text-gray-400">до {metric.deadline}</span>
    </div>
  );
};

const PriorityChip = ({ priority }: { priority: WorkOrder['priority'] }) => {
  const cls: Record<string, string> = {
    Аварийный: 'bg-red-100 text-red-700',
    Срочно:    'bg-orange-100 text-orange-700',
    Высокий:   'bg-amber-100 text-amber-700',
    Средний:   'bg-blue-100 text-blue-700',
    Низкий:    'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  );
};

// Простой toast через временное состояние
let _toastClear: ReturnType<typeof setTimeout> | null = null;

// ─── Main Component ───────────────────────────────────────────────────────────

const SLAMonitorFull = () => {
  const [orders, setOrders]     = useState<WorkOrder[]>(sortedOrders(WORK_ORDERS_RAW));
  const [filter, setFilter]     = useState<'all' | SLAStatus>('all');
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'info' } | null>(null);
  const [lastRefresh, setLastRefresh] = useState('15:04');

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    if (_toastClear) clearTimeout(_toastClear);
    _toastClear = setTimeout(() => setToast(null), 3200);
  };

  const handleRefresh = () => {
    const now = new Date();
    setLastRefresh(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
    showToast('Данные обновлены', 'info');
  };

  const handleNotifyClient = (id: string, orderNum: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, notified: true } : o));
    showToast(`Уведомление клиенту по наряду ${orderNum} отправлено`);
  };

  const handleAssign = (id: string, orderNum: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, assigned: true } : o));
    showToast(`Наряд ${orderNum} передан диспетчеру для назначения`, 'info');
  };

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || worstStatus(o) === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.orderNumber.toLowerCase().includes(q) ||
      o.client.toLowerCase().includes(q) || o.engineer.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const redCount    = orders.filter(o => worstStatus(o) === 'red').length;
  const yellowCount = orders.filter(o => worstStatus(o) === 'yellow').length;
  const greenCount  = orders.filter(o => worstStatus(o) === 'green').length;

  const complianceBarFill = (v: number) =>
    v >= 90 ? '#22c55e' : v >= 75 ? '#f59e0b' : '#ef4444';

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen relative">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
          <Icon name={toast.type === 'success' ? 'CheckCircle' : 'Info'} size={16} />
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
            <Icon name="ShieldAlert" size={24} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SLA Монитор (расширенный)</h1>
            <p className="text-sm text-gray-500">
              Контроль соглашений об уровне обслуживания · обновлено в {lastRefresh} · мониторинг каждые 5 мин
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <Icon name="RefreshCw" size={14} className="mr-1.5" />
            Обновить
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={14} className="mr-1.5" />
            Экспорт CSV
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="FileText" size={14} className="mr-1.5" />
            Отчёт PDF
          </Button>
        </div>
      </div>

      {/* ── 4 счётчика ── */}
      <div className="grid grid-cols-4 gap-4">

        {/* Всего активных */}
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={20} className="text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Всего активных</Badge>
          </div>
          <p className="text-3xl font-bold text-blue-700">{TOTAL_ACTIVE}</p>
          <p className="text-xs text-blue-600 mt-1">нарядов в работе сейчас</p>
          <div className="mt-3 flex gap-0.5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500"  style={{ width: `${TOTAL_GREEN  / TOTAL_ACTIVE * 100}%` }} />
            <div className="bg-yellow-400" style={{ width: `${TOTAL_YELLOW / TOTAL_ACTIVE * 100}%` }} />
            <div className="bg-red-500"    style={{ width: `${TOTAL_RED    / TOTAL_ACTIVE * 100}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">зел. / жёл. / кр.</p>
        </div>

        {/* Зелёная зона */}
        <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle2" size={20} className="text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">В норме</Badge>
          </div>
          <p className="text-3xl font-bold text-green-700">{TOTAL_GREEN}</p>
          <p className="text-xs text-green-600 mt-1">нарядов · остаток &gt;30% времени</p>
          <div className="mt-3 w-full h-1.5 bg-green-100 rounded-full">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${TOTAL_GREEN / TOTAL_ACTIVE * 100}%` }} />
          </div>
          <p className="text-[10px] text-green-600 mt-1.5">{Math.round(TOTAL_GREEN / TOTAL_ACTIVE * 100)}% от всех активных</p>
        </div>

        {/* Жёлтая зона */}
        <div className="bg-white border border-yellow-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-yellow-600" />
            </div>
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Предупреждение</Badge>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{TOTAL_YELLOW}</p>
          <p className="text-xs text-yellow-600 mt-1">нарядов · остаток 10–30% времени</p>
          <div className="mt-3 w-full h-1.5 bg-yellow-100 rounded-full">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${TOTAL_YELLOW / TOTAL_ACTIVE * 100}%` }} />
          </div>
          <p className="text-[10px] text-yellow-600 mt-1.5">{Math.round(TOTAL_YELLOW / TOTAL_ACTIVE * 100)}% от всех активных</p>
        </div>

        {/* Красная зона */}
        <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="XCircle" size={20} className="text-red-600" />
            </div>
            <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 animate-pulse">Нарушено</Badge>
          </div>
          <p className="text-3xl font-bold text-red-600">{TOTAL_RED}</p>
          <p className="text-xs text-red-600 mt-1">нарядов · просрочено или &lt;10%</p>
          <div className="mt-3 w-full h-1.5 bg-red-100 rounded-full">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${TOTAL_RED / TOTAL_ACTIVE * 100}%` }} />
          </div>
          <p className="text-[10px] text-red-600 mt-1.5">{Math.round(TOTAL_RED / TOTAL_ACTIVE * 100)}% от всех активных</p>
        </div>
      </div>

      {/* ── График SLA по времени (AreaChart 30 дней) ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Динамика SLA по зонам (30 дней)</h3>
            <p className="text-xs text-gray-500 mt-0.5">% нарядов в зелёной / жёлтой / красной зоне ежедневно</p>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-green-400 inline-block" />Норма</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-yellow-400 inline-block" />Предупреждение</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-red-400 inline-block" />Нарушение</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={AREA_TREND} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="gGreen"  x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gYellow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
            <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: '100%', fontSize: 10, fill: '#94a3b8' }} />
            <Area type="monotone" dataKey="green"  name="Норма"         stroke="#22c55e" strokeWidth={2} fill="url(#gGreen)"  />
            <Area type="monotone" dataKey="yellow" name="Предупреждение" stroke="#f59e0b" strokeWidth={2} fill="url(#gYellow)" />
            <Area type="monotone" dataKey="red"    name="Нарушение"     stroke="#ef4444" strokeWidth={2} fill="url(#gRed)"    />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Диаграммы: Причины + Рейтинг клиентов ── */}
      <div className="grid grid-cols-5 gap-5">

        {/* PieChart — причины нарушений */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Причины нарушений SLA</h3>
          <p className="text-xs text-gray-500 mb-3">За последние 30 дней, % от общего числа нарушений</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={VIOLATION_CAUSES}
                  cx="50%" cy="50%"
                  innerRadius={44} outerRadius={70}
                  dataKey="value" paddingAngle={3}
                >
                  {VIOLATION_CAUSES.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {VIOLATION_CAUSES.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-gray-700 truncate">{c.name}</span>
                      <span className="text-[11px] font-semibold text-gray-800 ml-1">{c.value}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.value}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BarChart горизонтальный — рейтинг клиентов */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Рейтинг SLA по клиентам</h3>
          <p className="text-xs text-gray-500 mb-3">Топ-10 клиентов · % соблюдения SLA · сортировка по возрастанию</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={CLIENT_SLA_COMPLIANCE}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" domain={[40, 100]} tick={{ fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="client" tick={{ fontSize: 10 }} width={140} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <ReferenceLine x={90} stroke="#22c55e" strokeDasharray="4 3"
                label={{ value: 'цель 90%', fontSize: 9, fill: '#22c55e', position: 'top' }} />
              <Bar dataKey="compliance" name="% соблюдения SLA" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10 }}>
                {CLIENT_SLA_COMPLIANCE.map(entry => (
                  <Cell key={entry.client} fill={complianceBarFill(entry.compliance)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Таблица активных нарядов ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Шапка таблицы с фильтром и поиском */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Активные наряды · SLA контроль</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {filtered.length} из {orders.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Поиск */}
            <div className="relative">
              <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по наряду, клиенту, инженеру..."
                className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-300 w-56"
              />
            </div>
            {/* Фильтры по зонам */}
            {(['all', 'red', 'yellow', 'green'] as const).map(f => {
              const labels: Record<string, string> = { all: 'Все', red: 'Нарушения', yellow: 'Предупреждения', green: 'В норме' };
              const counts: Record<string, number> = { all: orders.length, red: redCount, yellow: yellowCount, green: greenCount };
              const active: Record<string, string> = {
                all:    'bg-gray-800 text-white',
                red:    'bg-red-600 text-white',
                yellow: 'bg-yellow-500 text-white',
                green:  'bg-green-600 text-white',
              };
              const inactive = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
              const cls = filter === f ? active[f] : inactive;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cls}`}>
                  {labels[f]} ({counts[f]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Таблица */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs whitespace-nowrap">Наряд · Клиент</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs whitespace-nowrap">Тип · Инженер</th>
                <th className="text-center px-4 py-3 text-xs">
                  <span className="text-blue-600 font-semibold">TTR</span>
                  <span className="block text-[10px] font-normal text-gray-400">Time to Respond</span>
                </th>
                <th className="text-center px-4 py-3 text-xs">
                  <span className="text-emerald-600 font-semibold">TTO</span>
                  <span className="block text-[10px] font-normal text-gray-400">Time to On-site</span>
                </th>
                <th className="text-center px-4 py-3 text-xs">
                  <span className="text-violet-600 font-semibold">TTF</span>
                  <span className="block text-[10px] font-normal text-gray-400">Time to Fix</span>
                </th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs">Уровень SLA</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => {
                const ws = worstStatus(order);
                return (
                  <tr key={order.id} className={`hover:bg-gray-50/70 transition-colors ${rowBgCls[ws]}`}>

                    {/* Наряд / Клиент */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          ws === 'red' ? 'bg-red-500 animate-pulse' :
                          ws === 'yellow' ? 'bg-yellow-400' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-mono text-xs font-semibold text-gray-800">{order.orderNumber}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{order.client}</p>
                          <PriorityChip priority={order.priority} />
                        </div>
                      </div>
                    </td>

                    {/* Тип / Инженер */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-xs font-medium text-gray-800 leading-tight">{order.type}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Icon name="User" size={11} className="text-gray-400" />
                        {order.engineer}
                      </p>
                    </td>

                    {/* TTR */}
                    <td className="px-4 py-3"><MiniBar metric={order.ttr} /></td>

                    {/* TTO */}
                    <td className="px-4 py-3"><MiniBar metric={order.tto} /></td>

                    {/* TTF */}
                    <td className="px-4 py-3"><MiniBar metric={order.ttf} /></td>

                    {/* SLA уровень */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.slaLevel === 'contract'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {order.slaLevel === 'contract' ? 'Договорной' : 'Корпоративный'}
                      </span>
                      {order.escalated && (
                        <p className="mt-1 text-[10px] text-red-600 font-medium flex items-center justify-center gap-0.5">
                          <Icon name="ChevronsUp" size={10} />Эскалирован
                        </p>
                      )}
                    </td>

                    {/* Действия */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-end gap-1.5">
                        {ws === 'green' && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Icon name="CheckCircle" size={12} className="text-green-500" />
                            В норме
                          </span>
                        )}
                        {ws !== 'green' && !order.notified && (
                          <Button size="sm" variant="outline"
                            className="text-xs h-7 px-2"
                            onClick={() => handleNotifyClient(order.id, order.orderNumber)}>
                            <Icon name="Bell" size={11} className="mr-1" />
                            Уведомить
                          </Button>
                        )}
                        {ws !== 'green' && order.notified && (
                          <span className="text-[11px] text-yellow-600 flex items-center gap-1">
                            <Icon name="BellRing" size={11} />
                            Уведомлён
                          </span>
                        )}
                        {ws === 'red' && !order.escalated && (
                          <Button size="sm"
                            className="text-xs h-7 px-2 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleAssign(order.id, order.orderNumber)}>
                            <Icon name="ChevronsUp" size={11} className="mr-1" />
                            Эскалировать
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <Icon name="CheckCircle2" size={44} className="mx-auto mb-3 text-green-400" />
              <p className="text-gray-500 font-semibold">Нет нарядов в выбранной зоне</p>
              <p className="text-gray-400 text-sm mt-1">Попробуйте изменить фильтр или поисковый запрос</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Секция критических уведомлений ── */}
      <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-red-100 bg-red-50/40 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon name="Siren" size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">Критические наряды — требуют немедленных действий</h3>
            <p className="text-xs text-red-600 mt-0.5">Нарушение или менее 10% времени SLA · {CRITICAL_ORDERS.length} нарядов</p>
          </div>
        </div>
        <div className="divide-y divide-red-100">
          {CRITICAL_ORDERS.map(order => {
            const critMetrics = [
              { label: 'TTR', m: order.ttr },
              { label: 'TTO', m: order.tto },
              { label: 'TTF', m: order.ttf },
            ].filter(x => x.m.status === 'red');
            return (
              <div key={order.id} className="flex items-center justify-between px-5 py-4 hover:bg-red-50/30 transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-gray-800">{order.orderNumber}</span>
                      <span className="text-xs text-gray-600">{order.client}</span>
                      <PriorityChip priority={order.priority} />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.slaLevel === 'contract' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {order.slaLevel === 'contract' ? 'Договорной' : 'Корпоративный'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      <Icon name="User" size={10} className="inline mr-1 text-gray-400" />
                      {order.engineer} · {order.type}
                    </p>
                    <div className="flex gap-3 mt-1.5 flex-wrap">
                      {critMetrics.map(({ label, m }) => (
                        <span key={label} className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                          {label}: {m.remainingMin < 0 ? `просрочено на ${fmtMin(m.remainingMin)}` : `осталось ${fmtMin(m.remainingMin)}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => handleNotifyClient(order.id, order.orderNumber)}
                  >
                    <Icon name="Bell" size={12} className="mr-1" />
                    Уведомить клиента
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleAssign(order.id, order.orderNumber)}
                  >
                    <Icon name="UserCheck" size={12} className="mr-1" />
                    Назначить
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LineChart TTR/TTO/TTF тренд ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Тренд соблюдения по метрикам (30 дней)</h3>
            <p className="text-xs text-gray-500 mt-0.5">% нарядов, закрытых в срок по каждой метрике SLA</p>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-blue-500 inline-block rounded" />TTR</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-emerald-500 inline-block rounded" />TTO</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-violet-500 inline-block rounded" />TTF</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={Array.from({ length: 30 }, (_, i) => {
              const b = 82 + Math.sin(i * 0.4) * 4;
              return {
                day: `${i + 1}`,
                ttr: Math.round(Math.min(99, b + Math.random() * 3)),
                tto: Math.round(Math.min(99, b - 2 + Math.random() * 3)),
                ttf: Math.round(Math.min(99, b + 2 + Math.random() * 3)),
              };
            })}
            margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
            <YAxis tick={{ fontSize: 10 }} domain={[70, 100]} unit="%" />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <ReferenceLine y={95} stroke="#22c55e" strokeDasharray="4 3"
              label={{ value: 'цель 95%', fontSize: 9, fill: '#22c55e' }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="ttr" stroke="#3b82f6" strokeWidth={2} dot={false} name="TTR" />
            <Line type="monotone" dataKey="tto" stroke="#10b981" strokeWidth={2} dot={false} name="TTO" />
            <Line type="monotone" dataKey="ttf" stroke="#8b5cf6" strokeWidth={2} dot={false} name="TTF" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default SLAMonitorFull;
