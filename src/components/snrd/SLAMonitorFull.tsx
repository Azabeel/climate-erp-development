import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type SLAStatus = 'green' | 'yellow' | 'red';

interface SLAMetric {
  deadline: string;
  remainingPct: number;
  remainingMin: number;
  status: SLAStatus;
}

interface WorkOrder {
  id: string;
  orderNumber: string;
  client: string;
  engineer: string;
  type: string;
  slaLevel: 'contract' | 'corporate';
  priority: 'Аварийный' | 'Срочно' | 'Высокий' | 'Средний' | 'Низкий';
  createdAt: string;
  ttr: SLAMetric;
  tto: SLAMetric;
  ttf: SLAMetric;
  notified: boolean;
  escalated: boolean;
}

interface ViolationRow {
  orderNumber: string;
  client: string;
  slaType: string;
  planned: string;
  actual: string;
  overMin: number;
  reason: string;
}

interface ContractRow {
  client: string;
  contract: string;
  slaLevel: string;
  totalOrders: number;
  completedPct: number;
  violations: number;
}

interface SLASettings {
  ttrHours: number;
  ttoHours: number;
  ttfHours: number;
  warnPct: number;
  notifyDispatcherYellow: boolean;
  notifyManagerRed: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

// Helper to make a SLAMetric
const mk = (dl: string, pct: number, min: number): SLAMetric => ({
  deadline: dl, remainingPct: pct, remainingMin: min,
  status: pct < 0 || min < 0 ? 'red' : pct < 20 ? 'red' : pct < 50 ? 'yellow' : 'green',
});

const ACTIVE_ORDERS: WorkOrder[] = [
  { id: 'wo1', orderNumber: 'WO-2026-000038', client: 'ТК Северный',        engineer: 'Сидоров Д.М.', type: 'Замена компрессора',       slaLevel: 'contract',  priority: 'Аварийный', createdAt: '09:15', notified: true,  escalated: false, ttr: mk('11:00', -41, -247), tto: mk('11:30', -18, -128), ttf: mk('17:00', -1, -7) },
  { id: 'wo2', orderNumber: 'WO-2026-000047', client: 'ТЦ Мираж',           engineer: 'Козлов М.И.',  type: 'Аварийный ремонт чиллера', slaLevel: 'contract',  priority: 'Аварийный', createdAt: '11:40', notified: false, escalated: false, ttr: mk('15:30', 8, 23),   tto: mk('14:00', -16, -45), ttf: mk('18:00', 72, 173) },
  { id: 'wo3', orderNumber: 'WO-2026-000062', client: 'АО ТрансСервис',     engineer: 'Михайлов В.О.', type: 'Гарантийный ремонт VRF',  slaLevel: 'corporate', priority: 'Аварийный', createdAt: '10:00', notified: true,  escalated: true,  ttr: mk('12:00', -5, -18),  tto: mk('13:00', 12, 31),  ttf: mk('21:00', 65, 381) },
  { id: 'wo4', orderNumber: 'WO-2026-000051', client: 'ООО Сбербанк-Сервис', engineer: 'Петров С.А.', type: 'ТО плановое',              slaLevel: 'contract',  priority: 'Срочно',   createdAt: '12:30', notified: true,  escalated: false, ttr: mk('16:45', 38, 98),  tto: mk('15:15', 25, 48),  ttf: mk('20:00', 74, 293) },
  { id: 'wo5', orderNumber: 'WO-2026-000058', client: 'ГК Ромашка',          engineer: 'Зайцев П.В.', type: 'Профилактика оборудования', slaLevel: 'corporate', priority: 'Высокий',  createdAt: '13:05', notified: false, escalated: false, ttr: mk('16:00', 30, 72),  tto: mk('17:00', 45, 113), ttf: mk('22:00', 78, 413) },
  { id: 'wo6', orderNumber: 'WO-2026-000066', client: 'ИП Романов С.С.',     engineer: 'Орлов Г.Д.',   type: 'Диагностика сплит-системы', slaLevel: 'corporate', priority: 'Срочно',   createdAt: '13:50', notified: false, escalated: false, ttr: mk('15:50', 22, 53),  tto: mk('16:30', 40, 98),  ttf: mk('21:00', 70, 353) },
  { id: 'wo7', orderNumber: 'WO-2026-000073', client: 'БЦ Горизонт',         engineer: 'Соколов А.Н.', type: 'Замена фильтров фанкойлов', slaLevel: 'contract',  priority: 'Высокий',  createdAt: '14:10', notified: true,  escalated: false, ttr: mk('17:30', 48, 113), tto: mk('16:45', 35, 80),  ttf: mk('22:30', 80, 443) },
  { id: 'wo8', orderNumber: 'WO-2026-000044', client: 'ИП Сидоров В.П.',     engineer: 'Иванов А.К.',  type: 'Диагностика мультизонал.',  slaLevel: 'corporate', priority: 'Высокий',  createdAt: '11:20', notified: false, escalated: false, ttr: mk('17:00', 68, 113), tto: mk('16:00', 55, 73),  ttf: mk('21:00', 85, 353) },
  { id: 'wo9', orderNumber: 'WO-2026-000055', client: 'БЦ Олимп',            engineer: 'Новиков Р.С.', type: 'ТО центрального кондиционера', slaLevel: 'corporate', priority: 'Средний', createdAt: '12:00', notified: false, escalated: false, ttr: mk('18:30', 75, 203), tto: mk('18:00', 72, 173), ttf: mk('22:00', 88, 413) },
  { id: 'wo10', orderNumber: 'WO-2026-000067', client: 'Поликлиника №3',     engineer: 'Кузьмин Д.В.', type: 'Гарантийный ремонт (холодильник)', slaLevel: 'contract', priority: 'Средний', createdAt: '13:00', notified: false, escalated: false, ttr: mk('17:45', 62, 143), tto: mk('17:15', 58, 113), ttf: mk('22:15', 87, 428) },
];

const VIOLATIONS_MONTH: ViolationRow[] = [
  { orderNumber: 'WO-2026-000038', client: 'ТК Северный',    slaType: 'TTR', planned: '11:00', actual: '15:07', overMin: 247, reason: 'Инженер недоступен' },
  { orderNumber: 'WO-2026-000038', client: 'ТК Северный',    slaType: 'TTO', planned: '11:30', actual: '13:38', overMin: 128, reason: 'Пробки' },
  { orderNumber: 'WO-2026-000047', client: 'ТЦ Мираж',       slaType: 'TTO', planned: '14:00', actual: '14:45', overMin: 45,  reason: 'Нет запчастей' },
  { orderNumber: 'WO-2026-000062', client: 'АО ТрансСервис', slaType: 'TTR', planned: '12:00', actual: '12:18', overMin: 18,  reason: 'Инженер недоступен' },
  { orderNumber: 'WO-2026-000021', client: 'ООО МегаСтрой',  slaType: 'TTF', planned: '18:00', actual: '21:30', overMin: 210, reason: 'Сложный ремонт' },
  { orderNumber: 'WO-2026-000015', client: 'ТК Северный',    slaType: 'TTR', planned: '10:00', actual: '12:40', overMin: 160, reason: 'Инженер недоступен' },
  { orderNumber: 'WO-2026-000009', client: 'ГК Ромашка',     slaType: 'TTO', planned: '14:30', actual: '15:12', overMin: 42,  reason: 'Пробки' },
  { orderNumber: 'WO-2026-000003', client: 'АО ТрансСервис', slaType: 'TTF', planned: '17:00', actual: '19:25', overMin: 145, reason: 'Нет запчастей' },
];

const TREND_30D = Array.from({ length: 30 }, (_, i) => {
  const base = 88 + Math.sin(i * 0.4) * 3;
  return {
    day: `${i + 1}`,
    ttr: Math.round(Math.min(99, base + Math.random() * 2.5)),
    tto: Math.round(Math.min(99, base - 1.5 + Math.random() * 2.5)),
    ttf: Math.round(Math.min(99, base + 1 + Math.random() * 2.5)),
  };
});

const CONTRACT_ROWS: ContractRow[] = [
  { client: 'БЦ Олимп',           contract: 'ДО-2025-0012', slaLevel: 'Корпоративный', totalOrders: 18, completedPct: 95, violations: 1 },
  { client: 'Поликлиника №3',      contract: 'ДО-2025-0034', slaLevel: 'Договорной',    totalOrders: 14, completedPct: 93, violations: 1 },
  { client: 'ИП Сидоров В.П.',     contract: 'ДО-2025-0041', slaLevel: 'Корпоративный', totalOrders: 11, completedPct: 91, violations: 1 },
  { client: 'ООО Сбербанк-Сервис', contract: 'ДО-2025-0057', slaLevel: 'Договорной',    totalOrders: 24, completedPct: 83, violations: 4 },
  { client: 'БЦ Горизонт',         contract: 'ДО-2025-0063', slaLevel: 'Договорной',    totalOrders: 21, completedPct: 81, violations: 4 },
  { client: 'ГК Ромашка',          contract: 'ДО-2025-0072', slaLevel: 'Корпоративный', totalOrders: 16, completedPct: 75, violations: 4 },
  { client: 'АО ТрансСервис',      contract: 'ДО-2025-0088', slaLevel: 'Договорной',    totalOrders: 31, completedPct: 71, violations: 9 },
  { client: 'ТК Северный',         contract: 'ДО-2025-0091', slaLevel: 'Договорной',    totalOrders: 28, completedPct: 57, violations: 12 },
];

const CONTRACT_BAR_DATA = CONTRACT_ROWS.map(r => ({ client: r.client.length > 18 ? r.client.slice(0, 18) + '…' : r.client, compliance: r.completedPct }))
  .sort((a, b) => a.compliance - b.compliance);

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const barColor = (pct: number) => pct >= 90 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#ef4444';

// ─── Sub-components ───────────────────────────────────────────────────────────

const MiniBar = ({ metric }: { metric: SLAMetric }) => {
  const pct = Math.max(0, Math.min(100, metric.remainingPct));
  const clr: Record<SLAStatus, string> = { green: 'bg-green-500', yellow: 'bg-yellow-400', red: 'bg-red-500' };
  const txt: Record<SLAStatus, string> = { green: 'text-green-600', yellow: 'text-yellow-600', red: 'text-red-600' };
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[72px]">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${clr[metric.status]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] font-semibold ${txt[metric.status]}`}>
        {metric.remainingMin < 0 ? `−${fmtMin(metric.remainingMin)}` : `${Math.round(pct)}%`}
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

const SLABadge = ({ status }: { status: SLAStatus }) => {
  const cfg: Record<SLAStatus, { cls: string; label: string; icon: string }> = {
    green:  { cls: 'bg-green-100 text-green-700 border-green-200', label: 'В норме',       icon: 'CheckCircle' },
    yellow: { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Предупреждение', icon: 'Clock' },
    red:    { cls: 'bg-red-100 text-red-700 border-red-200',       label: 'Нарушено',      icon: 'AlertTriangle' },
  };
  const { cls, label, icon } = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}>
      <Icon name={icon} size={10} />
      {label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SLAMonitorFull = () => {
  const [orders, setOrders]   = useState<WorkOrder[]>(sortedOrders(ACTIVE_ORDERS));
  const [lastRefresh, setLastRefresh] = useState('15:04');
  const [settings, setSettings] = useState<SLASettings>({
    ttrHours: 2,
    ttoHours: 4,
    ttfHours: 24,
    warnPct: 20,
    notifyDispatcherYellow: true,
    notifyManagerRed: true,
  });

  const handleRefresh = () => {
    const now = new Date();
    setLastRefresh(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    toast.success('Данные обновлены');
  };

  const handleOpenOrder = (orderNumber: string) => {
    toast.info(`Открытие наряда ${orderNumber}`);
  };

  const handleEscalate = (id: string, orderNumber: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, escalated: true, notified: true } : o));
    toast.error(`Эскалация по наряду ${orderNumber} выполнена`);
  };

  const handleNotify = (id: string, orderNumber: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, notified: true } : o));
    toast.success(`Уведомление по наряду ${orderNumber} отправлено`);
  };

  const redOrders    = orders.filter(o => worstStatus(o) === 'red');
  const yellowOrders = orders.filter(o => worstStatus(o) === 'yellow');
  const greenOrders  = orders.filter(o => worstStatus(o) === 'green');

  const alertOrders = [
    ...redOrders.slice(0, 3),
    ...yellowOrders.slice(0, 2),
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
            <Icon name="ShieldAlert" size={24} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мониторинг SLA в реальном времени</h1>
            <p className="text-sm text-gray-500">Контроль соглашений об уровне сервиса · обновлено в {lastRefresh}</p>
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

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { border: 'border-blue-200',   icon: 'TrendingUp',   iBg: 'bg-blue-100',   iCls: 'text-blue-600',   badgeCls: 'bg-blue-100 text-blue-700 border-blue-200',   badgeLabel: 'SLA выполнен',        value: '94.2%', sub: 'за текущий месяц',                 barBg: 'bg-blue-100',   barFg: 'bg-blue-500',   barW: '94.2%', note: 'цель: 95% · −0.8 п.п.',     noteCls: 'text-blue-500' },
          { border: 'border-red-200',    icon: 'XCircle',      iBg: 'bg-red-100',    iCls: 'text-red-600',    badgeCls: 'bg-red-100 text-red-700 border-red-200',       badgeLabel: 'Нарушений сегодня',   value: '2',     sub: 'наряда с нарушением SLA',      barBg: 'bg-red-100',    barFg: 'bg-red-500',    barW: '10%',   note: 'вчера: 3 нарушения',        noteCls: 'text-gray-400' },
          { border: 'border-yellow-200', icon: 'AlertTriangle', iBg: 'bg-yellow-100', iCls: 'text-yellow-600', badgeCls: 'bg-yellow-100 text-yellow-700 border-yellow-200', badgeLabel: 'В зоне риска',      value: '5',     sub: `нарядов · <${settings.warnPct}% SLA`, barBg: 'bg-yellow-100', barFg: 'bg-yellow-400', barW: '35%',   note: `${yellowOrders.length} в таблице`, noteCls: 'text-yellow-600' },
          { border: 'border-green-200',  icon: 'Clock',        iBg: 'bg-green-100',  iCls: 'text-green-600',  badgeCls: 'bg-green-100 text-green-700 border-green-200',  badgeLabel: 'Среднее TTR',         value: '1.8 ч', sub: 'среднее время реакции сегодня', barBg: 'bg-green-100',  barFg: 'bg-green-500',  barW: '90%',   note: 'норма: 2 ч · лучше на 10%', noteCls: 'text-green-600' },
        ].map(({ border, icon, iBg, iCls, badgeCls, badgeLabel, value, sub, barBg, barFg, barW, note, noteCls }) => (
          <div key={badgeLabel} className={`bg-white border ${border} rounded-xl p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${iBg} rounded-lg flex items-center justify-center`}>
                <Icon name={icon} size={20} className={iCls} />
              </div>
              <Badge className={`${badgeCls} hover:opacity-80`}>{badgeLabel}</Badge>
            </div>
            <p className={`text-3xl font-bold ${iCls}`}>{value}</p>
            <p className={`text-xs ${iCls} mt-1`}>{sub}</p>
            <div className={`mt-3 w-full h-1.5 ${barBg} rounded-full overflow-hidden`}>
              <div className={`h-full ${barFg} rounded-full`} style={{ width: barW }} />
            </div>
            <p className={`text-[10px] ${noteCls} mt-1`}>{note}</p>
          </div>
        ))}
      </div>

      {/* ── Alert Feed ── */}
      <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-red-50/60 border-b border-red-100">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon name="Siren" size={18} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 text-sm">Лента тревог — требуют действий</h3>
            <p className="text-xs text-red-600">{redOrders.length} нарушений · {yellowOrders.length} предупреждений</p>
          </div>
          <span className="text-xs text-red-500">обновление каждые 5 мин</span>
        </div>

        <div className="divide-y divide-gray-100">
          {alertOrders.map(order => {
            const ws = worstStatus(order);
            const critMetrics = [
              { label: 'TTR', m: order.ttr },
              { label: 'TTO', m: order.tto },
              { label: 'TTF', m: order.ttf },
            ].filter(x => x.m.status === ws || x.m.status === 'red');

            return (
              <div
                key={order.id}
                className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors ${
                  ws === 'red' ? 'border-l-4 border-red-500' : 'border-l-4 border-yellow-400'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    ws === 'red' ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-gray-900">{order.orderNumber}</span>
                      <span className="text-xs text-gray-700 font-medium">{order.client}</span>
                      <PriorityChip priority={order.priority} />
                      {ws === 'red'
                        ? <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-[10px] px-1.5 py-0">Нарушение SLA</Badge>
                        : <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100 text-[10px] px-1.5 py-0">Предупреждение</Badge>
                      }
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">
                      <Icon name="Wrench" size={10} className="inline mr-1 text-gray-400" />
                      {order.type}
                      <span className="mx-1.5 text-gray-300">·</span>
                      <Icon name="User" size={10} className="inline mr-1 text-gray-400" />
                      {order.engineer}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {critMetrics.map(({ label, m }) => (
                        <span
                          key={label}
                          className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                            m.status === 'red'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {label}: {m.remainingMin < 0
                            ? `просрочено на ${fmtMin(m.remainingMin)}`
                            : `осталось ${fmtMin(m.remainingMin)}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {ws === 'red' && !order.escalated && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => handleNotify(order.id, order.orderNumber)}
                    >
                      <Icon name="Bell" size={12} className="mr-1" />
                      Уведомить
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className={`h-8 text-xs text-white ${
                      ws === 'red'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                    onClick={() => handleOpenOrder(order.orderNumber)}
                  >
                    <Icon name="ExternalLink" size={12} className="mr-1" />
                    Открыть наряд
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="active">
        <TabsList className="w-full justify-start rounded-none border-b border-gray-200 h-auto bg-transparent px-0 gap-0">
          {[
            { value: 'active',    label: 'Активные',      icon: 'Activity' },
            { value: 'history',   label: 'История',        icon: 'History' },
            { value: 'contracts', label: 'По договорам',   icon: 'FileSignature' },
            { value: 'settings',  label: 'Настройки',      icon: 'Settings' },
          ].map(t => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex items-center gap-1.5 px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent text-gray-500 text-sm font-medium transition-colors"
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab: Активные ── */}
        <TabsContent value="active" className="mt-0 pt-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">Активные наряды с SLA-таймером</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{orders.length} нарядов</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                <Icon name="RefreshCw" size={13} className="mr-1.5" />
                Обновить
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs whitespace-nowrap">Наряд · Клиент</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs whitespace-nowrap">Тип · Инженер</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">Создан</th>
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
                    <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs">Статус SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => {
                    const ws = worstStatus(order);
                    const rowBg: Record<SLAStatus, string> = { red: 'bg-red-50/40', yellow: 'bg-yellow-50/30', green: '' };
                    const dotCls = ws === 'red' ? 'bg-red-500 animate-pulse' : ws === 'yellow' ? 'bg-yellow-400' : 'bg-green-500';
                    return (
                      <tr key={order.id} className={`hover:bg-gray-50/70 transition-colors ${rowBg[ws]}`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-start gap-2">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
                            <div>
                              <p className="font-mono text-xs font-semibold text-gray-800">{order.orderNumber}</p>
                              <p className="text-xs text-gray-600">{order.client}</p>
                              <PriorityChip priority={order.priority} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 max-w-[180px]">
                          <p className="text-xs font-medium text-gray-800 leading-tight">{order.type}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><Icon name="User" size={11} className="text-gray-400" />{order.engineer}</p>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{order.createdAt}</td>
                        <td className="px-4 py-2.5"><MiniBar metric={order.ttr} /></td>
                        <td className="px-4 py-2.5"><MiniBar metric={order.tto} /></td>
                        <td className="px-4 py-2.5"><MiniBar metric={order.ttf} /></td>
                        <td className="px-4 py-2.5 text-center">
                          <SLABadge status={ws} />
                          {order.escalated && <p className="mt-1 text-[10px] text-red-600 font-medium flex items-center justify-center gap-0.5"><Icon name="ChevronsUp" size={10} />Эскалирован</p>}
                          {ws !== 'green' && !order.escalated && (
                            <button className="mt-1 text-[10px] text-blue-600 hover:underline flex items-center justify-center gap-0.5 mx-auto"
                              onClick={() => handleEscalate(order.id, order.orderNumber)}>
                              <Icon name="ChevronsUp" size={10} />Эскалировать
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" /> {greenOrders.length} в норме
                <div className="w-2 h-2 rounded-full bg-yellow-400 ml-2" /> {yellowOrders.length} предупреждений
                <div className="w-2 h-2 rounded-full bg-red-500 ml-2" /> {redOrders.length} нарушений
              </span>
              <span className="text-xs text-gray-400">Автообновление каждые 30 сек</span>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: История ── */}
        <TabsContent value="history" className="mt-0 pt-5 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">% выполнения SLA за 30 дней</h3>
                <p className="text-xs text-gray-500 mt-0.5">Доля нарядов, закрытых в срок по каждой метрике</p>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-blue-500 inline-block rounded" />TTR</span>
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-emerald-500 inline-block rounded" />TTO</span>
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-violet-500 inline-block rounded" />TTF</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={TREND_30D} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
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

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Нарушения SLA за месяц</h3>
              <p className="text-xs text-gray-500 mt-0.5">{VIOLATIONS_MONTH.length} нарушений · детальный журнал</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Наряд','Клиент','Тип SLA','Плановое','Фактическое','Превышение','Причина'].map((h, i) => (
                    <th key={h} className={`px-4 py-2.5 text-gray-500 font-medium text-xs ${i < 2 || i === 6 ? 'text-left' : 'text-center'}`}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {VIOLATIONS_MONTH.map((row, idx) => {
                    const typeCls = row.slaType === 'TTR' ? 'bg-blue-100 text-blue-700' : row.slaType === 'TTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700';
                    return (
                      <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                        <td className="px-4 py-2.5"><span className="font-mono text-xs font-semibold text-gray-800">{row.orderNumber}</span></td>
                        <td className="px-4 py-2.5 text-xs text-gray-700">{row.client}</td>
                        <td className="px-4 py-2.5 text-center"><span className={`text-xs px-2 py-0.5 rounded font-semibold ${typeCls}`}>{row.slaType}</span></td>
                        <td className="px-4 py-2.5 text-center text-xs text-gray-600">{row.planned}</td>
                        <td className="px-4 py-2.5 text-center text-xs font-medium text-red-600">{row.actual}</td>
                        <td className="px-4 py-2.5 text-center"><span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">+{fmtMin(row.overMin)}</span></td>
                        <td className="px-4 py-2.5"><span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{row.reason}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: По договорам ── */}
        <TabsContent value="contracts" className="mt-0 pt-5 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-0.5">SLA% по клиентам с договорами</h3>
            <p className="text-xs text-gray-500 mb-4">Сортировка по возрастанию · цель 90%</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={CONTRACT_BAR_DATA}
                layout="vertical"
                margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" domain={[40, 100]} tick={{ fontSize: 10 }} unit="%" />
                <YAxis type="category" dataKey="client" tick={{ fontSize: 10 }} width={130} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <ReferenceLine x={90} stroke="#22c55e" strokeDasharray="4 3"
                  label={{ value: 'цель 90%', fontSize: 9, fill: '#22c55e', position: 'top' }} />
                <Bar dataKey="compliance" name="% выполнения SLA" radius={[0, 4, 4, 0]}
                  label={{ position: 'right', fontSize: 10 }}>
                  {CONTRACT_BAR_DATA.map(entry => (
                    <Cell key={entry.client} fill={barColor(entry.compliance)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Детализация по договорам</h3>
              <p className="text-xs text-gray-500 mt-0.5">{CONTRACT_ROWS.length} договоров с активным SLA-контролем</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">Клиент</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">Договор</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs">Уровень SLA</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs">Нарядов</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs">Выполнено %</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs">Нарушений</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CONTRACT_ROWS.map(row => {
                    const pctCls = row.completedPct >= 90 ? 'text-green-600' : row.completedPct >= 75 ? 'text-yellow-600' : 'text-red-600';
                    const vCls = row.violations > 5 ? 'text-red-600' : row.violations > 2 ? 'text-yellow-600' : 'text-green-600';
                    return (
                      <tr key={row.contract} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{row.client}</td>
                        <td className="px-4 py-2.5"><span className="font-mono text-xs text-gray-600">{row.contract}</span></td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.slaLevel === 'Договорной' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{row.slaLevel}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center text-xs text-gray-700">{row.totalOrders}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${row.completedPct}%`, backgroundColor: barColor(row.completedPct) }} />
                            </div>
                            <span className={`text-xs font-semibold w-10 text-right ${pctCls}`}>{row.completedPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center"><span className={`text-xs font-semibold ${vCls}`}>{row.violations}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Настройки ── */}
        <TabsContent value="settings" className="mt-0 pt-5">
          <div className="max-w-2xl space-y-5">

            {/* Корпоративные пороги TTR/TTO/TTF */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Timer" size={18} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Корпоративные пороги SLA</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Применяются когда у клиента нет индивидуального договора</p>
              {([
                { key: 'ttrHours' as const, label: 'TTR — Time to Respond', desc: 'Время первого ответа', color: 'text-blue-600', min: 1, max: 48 },
                { key: 'ttoHours' as const, label: 'TTO — Time to On-site', desc: 'Время прибытия инженера', color: 'text-emerald-600', min: 1, max: 48 },
                { key: 'ttfHours' as const, label: 'TTF — Time to Fix',     desc: 'Время устранения неисправности', color: 'text-violet-600', min: 1, max: 168 },
              ] as const).map(({ key, label, desc, color, min, max }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className={`text-sm font-semibold ${color}`}>{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center"
                      onClick={() => setSettings(p => ({ ...p, [key]: Math.max(min, p[key] - 1) }))}>
                      <Icon name="Minus" size={13} className="text-gray-600" />
                    </button>
                    <span className="w-16 text-center text-sm font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg py-1.5">{settings[key]} ч</span>
                    <button className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center"
                      onClick={() => setSettings(p => ({ ...p, [key]: Math.min(max, p[key] + 1) }))}>
                      <Icon name="Plus" size={13} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Порог предупреждения */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="AlertTriangle" size={18} className="text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Порог предупреждения YELLOW</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Переход в YELLOW зону когда осталось менее {settings.warnPct}% времени SLA</p>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Порог предупреждения (%)</p>
                  <p className="text-xs text-gray-500">При достижении — уведомить диспетчера один раз</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center"
                    onClick={() => setSettings(p => ({ ...p, warnPct: Math.max(5, p.warnPct - 5) }))}>
                    <Icon name="Minus" size={13} className="text-gray-600" />
                  </button>
                  <span className="w-16 text-center text-sm font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg py-1.5">{settings.warnPct}%</span>
                  <button className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center"
                    onClick={() => setSettings(p => ({ ...p, warnPct: Math.min(50, p.warnPct + 5) }))}>
                    <Icon name="Plus" size={13} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Уведомления */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Bell" size={18} className="text-orange-500" />
                <h3 className="font-semibold text-gray-900">Автоматические уведомления</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Настройка эскалаций при смене статуса SLA</p>
              {[
                { key: 'notifyDispatcherYellow' as const, icon: 'Clock', iconBg: 'bg-yellow-100', iconCls: 'text-yellow-600',
                  label: 'Уведомлять диспетчера при YELLOW', desc: 'Отправить уведомление один раз при переходе в жёлтую зону',
                  on: 'Уведомления диспетчеру при YELLOW включены', off: 'Уведомления диспетчеру при YELLOW отключены' },
                { key: 'notifyManagerRed' as const, icon: 'AlertOctagon', iconBg: 'bg-red-100', iconCls: 'text-red-600',
                  label: 'Уведомлять руководителя при RED', desc: 'Автоматическая эскалация руководителю при нарушении SLA',
                  on: 'Уведомления руководителю при RED включены', off: 'Уведомления руководителю при RED отключены' },
              ].map(({ key, icon, iconBg, iconCls, label, desc, on, off }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon name={icon} size={16} className={iconCls} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </div>
                  <Switch checked={settings[key]}
                    onCheckedChange={checked => {
                      setSettings(p => ({ ...p, [key]: checked }));
                      toast.success(checked ? on : off);
                    }} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm">Сбросить по умолчанию</Button>
              <Button size="sm" onClick={() => toast.success('Настройки SLA сохранены')}>
                <Icon name="Save" size={14} className="mr-1.5" />
                Сохранить
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SLAMonitorFull;
