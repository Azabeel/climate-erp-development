import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'Выполнен' | 'Активный' | 'В пути' | 'Новый';
type StockStatus = 'Достаточно' | 'Заканчивается' | 'Отсутствует';

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  address: string;
  type: string;
  time: string;
  status: OrderStatus;
  eta: string;
  distance: string;
  active?: boolean;
}

interface StockItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  status: StockStatus;
}

interface RoutePoint {
  label: string;
  address: string;
  distFrom: string;
  x: number;
  y: number;
  done: boolean;
}

interface Document {
  id: string;
  number: string;
  client: string;
  type: string;
  signed: boolean;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1',
    number: 'WO-2026-000521',
    client: 'ООО «АрктикТрейд»',
    address: 'ул. Гагарина, 15, оф. 207',
    type: 'Монтаж',
    time: '08:30 – 11:00',
    status: 'Выполнен',
    eta: '—',
    distance: '12 км',
  },
  {
    id: 'wo2',
    number: 'WO-2026-000524',
    client: 'Сидоров Дмитрий Игоревич',
    address: 'пр. Победы, 88, кв. 14',
    type: 'Монтаж',
    time: '11:30 – 14:00',
    status: 'Выполнен',
    eta: '—',
    distance: '8 км',
  },
  {
    id: 'wo3',
    number: 'WO-2026-000527',
    client: 'ИП Карпова Наталья',
    address: 'ул. Строителей, 3, кв. 56',
    type: 'Монтаж',
    time: '15:00 – 17:30',
    status: 'Активный',
    eta: '45 мин',
    distance: '5 км',
    active: true,
  },
  {
    id: 'wo4',
    number: 'WO-2026-000530',
    client: 'ООО «СибМаш»',
    address: 'Промышленная ул., 22, цех 4',
    type: 'Монтаж',
    time: '18:00 – 20:00',
    status: 'Новый',
    eta: '~2 ч 45 мин',
    distance: '24 км',
  },
];

const STOCK_ITEMS: StockItem[] = [
  { id: 's1',  name: 'Медная трубка 1/4" (бухта 50м)',    qty: 1,   unit: 'бухта', status: 'Достаточно'   },
  { id: 's2',  name: 'Медная трубка 3/8" (бухта 50м)',    qty: 0,   unit: 'бухта', status: 'Отсутствует'  },
  { id: 's3',  name: 'Теплоизоляция 9 мм (рулон)',        qty: 1,   unit: 'рул.',  status: 'Заканчивается'},
  { id: 's4',  name: 'Хладагент R-32 (баллон 10 кг)',     qty: 2,   unit: 'шт',    status: 'Достаточно'   },
  { id: 's5',  name: 'Крепёж настенный универсальный',    qty: 24,  unit: 'шт',    status: 'Достаточно'   },
  { id: 's6',  name: 'Дренажная трубка ø16 мм',           qty: 4,   unit: 'м',     status: 'Заканчивается'},
  { id: 's7',  name: 'Кабель ПВС 3×2,5 мм²',             qty: 12,  unit: 'м',     status: 'Достаточно'   },
  { id: 's8',  name: 'Автомат защиты 16А однополюс.',     qty: 0,   unit: 'шт',    status: 'Отсутствует'  },
];

const ROUTE_POINTS: RoutePoint[] = [
  { label: 'A', address: 'Офис / база',           distFrom: '—',     x: 80,  y: 40,  done: true  },
  { label: '1', address: 'ул. Гагарина, 15',      distFrom: '12 км', x: 200, y: 120, done: true  },
  { label: '2', address: 'пр. Победы, 88',        distFrom: '8 км',  x: 360, y: 80,  done: true  },
  { label: '3', address: 'ул. Строителей, 3',     distFrom: '14 км', x: 460, y: 210, done: false },
  { label: '4', address: 'Промышленная ул., 22',  distFrom: '24 км', x: 300, y: 330, done: false },
];

const WEEK_REVENUE = [
  { day: 'Пн', revenue: 18500 },
  { day: 'Вт', revenue: 22000 },
  { day: 'Ср', revenue: 15800 },
  { day: 'Чт', revenue: 27400 },
  { day: 'Пт', revenue: 19200 },
  { day: 'Сб', revenue: 0 },
  { day: 'Вс', revenue: 0 },
];

const MONTH_ORDERS = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  orders: Math.max(1, Math.round(3 + Math.sin(i * 0.5) * 1.5 + (i % 7 < 5 ? 1 : -1))),
}));

const DOCUMENTS: Document[] = [
  { id: 'd1', number: 'АВР-2026-000521', client: 'ООО «АрктикТрейд»',           type: 'Акт выполненных работ', signed: false },
  { id: 'd2', number: 'АВР-2026-000524', client: 'Сидоров Дмитрий Игоревич',    type: 'Акт выполненных работ', signed: false },
  { id: 'd3', number: 'WO-2026-000510',  client: 'ЗАО «КлиматСервис»',          type: 'Незакрытый наряд',      signed: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  Выполнен:  'bg-green-100 text-green-700',
  Активный:  'bg-blue-100 text-blue-700',
  'В пути':  'bg-amber-100 text-amber-700',
  Новый:     'bg-slate-100 text-slate-600',
};

const STOCK_STATUS_STYLE: Record<StockStatus, string> = {
  Достаточно:    'bg-green-100 text-green-700',
  Заканчивается: 'bg-amber-100 text-amber-700',
  Отсутствует:   'bg-red-100 text-red-700',
};

function nextAction(status: OrderStatus): { label: string; icon: string } {
  if (status === 'Новый')    return { label: 'Выехать',   icon: 'Car' };
  if (status === 'В пути')   return { label: 'Прибыл',    icon: 'MapPin' };
  if (status === 'Активный') return { label: 'Завершить', icon: 'CheckCircle' };
  return { label: 'Открыть', icon: 'ExternalLink' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, sub, color,
}: {
  icon: string; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <Card className="p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon name={icon as any} size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

function OrderCard({ order, onAction }: { order: WorkOrder; onAction: (o: WorkOrder) => void }) {
  const action = nextAction(order.status);
  return (
    <Card
      className={`p-4 mb-3 transition-shadow hover:shadow-md ${
        order.active ? 'border-2 border-blue-500 shadow-blue-100 shadow-md' : 'border border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-mono text-gray-400">{order.number}</span>
          {order.active && (
            <span className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-medium">
              Активный
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_STYLE[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-1">
        <Icon name="Clock" size={13} className="text-gray-400 shrink-0" />
        <span className="text-sm font-semibold text-gray-800">{order.time}</span>
        <span className="mx-1 text-gray-300">·</span>
        <Icon name="Wrench" size={13} className="text-gray-400 shrink-0" />
        <span className="text-sm text-gray-600">{order.type}</span>
      </div>

      <div className="flex items-start gap-1.5 mb-1">
        <Icon name="User" size={13} className="text-gray-400 shrink-0 mt-0.5" />
        <span className="text-sm text-gray-700">{order.client}</span>
      </div>

      <div className="flex items-start gap-1.5 mb-3">
        <Icon name="MapPin" size={13} className="text-gray-400 shrink-0 mt-0.5" />
        <span className="text-sm text-gray-500">{order.address}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Icon name="Navigation" size={12} /> {order.distance}
          </span>
          {order.status !== 'Выполнен' && (
            <span className="flex items-center gap-1">
              <Icon name="Timer" size={12} /> ETA: {order.eta}
            </span>
          )}
        </div>
        {order.status !== 'Выполнен' && (
          <Button size="sm" variant="outline" onClick={() => onAction(order)} className="text-xs">
            <Icon name={action.icon as any} size={13} className="mr-1" />
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}

function RouteMap() {
  const edges: [RoutePoint, RoutePoint, string][] = [
    [ROUTE_POINTS[0], ROUTE_POINTS[1], '12 км'],
    [ROUTE_POINTS[1], ROUTE_POINTS[2], '8 км'],
    [ROUTE_POINTS[2], ROUTE_POINTS[3], '14 км'],
    [ROUTE_POINTS[3], ROUTE_POINTS[4], '24 км'],
  ];

  // Current position between points 2 and 3 (index 2→3)
  const p2 = ROUTE_POINTS[2];
  const p3 = ROUTE_POINTS[3];
  const curX = (p2.x + p3.x) / 2 + 20;
  const curY = (p2.y + p3.y) / 2 - 10;

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 600 400" className="w-full border rounded-lg bg-slate-50" style={{ maxHeight: 340 }}>
        {/* Grid lines */}
        {[80, 160, 240, 320].map(y => (
          <line key={y} x1="30" y1={y} x2="570" y2={y} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {[100, 200, 300, 400, 500].map(x => (
          <line key={x} x1={x} y1="20" x2={x} y2="380" stroke="#e2e8f0" strokeWidth="1" />
        ))}

        {/* Route edges */}
        {edges.map(([from, to, dist], i) => {
          const done = from.done && to.done;
          const active = from.done && !to.done;
          return (
            <g key={i}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={done ? '#22c55e' : active ? '#3b82f6' : '#cbd5e1'}
                strokeWidth={active ? 3 : 2}
                strokeDasharray={active ? '8,4' : undefined}
              />
              <text
                x={(from.x + to.x) / 2 + 6}
                y={(from.y + to.y) / 2 - 6}
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {dist}
              </text>
            </g>
          );
        })}

        {/* Route point circles */}
        {ROUTE_POINTS.map(pt => (
          <g key={pt.label}>
            <circle
              cx={pt.x} cy={pt.y} r={18}
              fill={pt.done ? '#22c55e' : pt.label === '3' ? '#3b82f6' : '#e2e8f0'}
              stroke="white" strokeWidth="2"
            />
            <text
              x={pt.x} y={pt.y + 1}
              fontSize="12" fontWeight="bold"
              fill="white" textAnchor="middle" dominantBaseline="middle"
            >
              {pt.label}
            </text>
            <text
              x={pt.x + 24} y={pt.y + 1}
              fontSize="10" fill="#475569"
              dominantBaseline="middle"
            >
              {pt.address}
            </text>
            {pt.distFrom !== '—' && (
              <text x={pt.x - 24} y={pt.y - 22} fontSize="9" fill="#94a3b8" textAnchor="middle">
                {pt.distFrom}
              </text>
            )}
          </g>
        ))}

        {/* Current position pulsing marker */}
        <circle cx={curX} cy={curY} r={10} fill="#3b82f6" opacity="0.25">
          <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={curX} cy={curY} r={6} fill="#3b82f6" stroke="white" strokeWidth="2" />
        <text x={curX + 12} y={curY - 8} fontSize="10" fill="#3b82f6" fontWeight="bold">
          Вы здесь
        </text>
      </svg>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-green-500 rounded inline-block" /> Выполнено
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-blue-500 rounded inline-block" /> Текущий маршрут
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-slate-300 rounded inline-block" /> Предстоящий
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-700">Итого: 134 км</span>
      </div>
    </div>
  );
}

function StatisticsTab() {
  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">4.9★</p>
          <p className="text-xs text-gray-500 mt-1">Средний рейтинг</p>
          <Progress value={98} className="mt-2 h-1.5" />
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">94%</p>
          <p className="text-xs text-gray-500 mt-1">Выполнено в срок</p>
          <Progress value={94} className="mt-2 h-1.5" />
        </Card>
      </div>

      {/* Revenue by day */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Выручка за текущую неделю, ₽</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={WEEK_REVENUE} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}к`} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru')} ₽`, 'Выручка']} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Orders per day (30 days) */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Нарядов в день — последние 30 дней</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={MONTH_ORDERS}>
            <defs>
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip formatter={(v: number) => [v, 'Нарядов']} />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#ordersGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function DocumentsTab() {
  const [signed, setSigned] = useState<Set<string>>(new Set());

  const acts = DOCUMENTS.filter(d => d.type === 'Акт выполненных работ');
  const open  = DOCUMENTS.filter(d => d.type !== 'Акт выполненных работ');

  const handleSign = (doc: Document) => {
    setSigned(prev => new Set(prev).add(doc.id));
    toast.success(`Акт ${doc.number} подписан`, { description: doc.client });
  };

  const handleSend = (doc: Document) => {
    toast.success(`Акт ${doc.number} отправлен клиенту`, { description: doc.client });
  };

  return (
    <div className="space-y-5">
      {/* Acts */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Акты за сегодня
          <Badge variant="secondary" className="ml-2 text-xs">{acts.length}</Badge>
        </p>
        {acts.map(doc => (
          <Card key={doc.id} className="p-4 mb-3">
            <div className="flex items-start justify-between mb-1">
              <span className="text-xs font-mono text-gray-400">{doc.number}</span>
              {signed.has(doc.id)
                ? <Badge className="bg-green-100 text-green-700 text-xs">Подписан</Badge>
                : <Badge variant="secondary" className="text-xs">Ожидает подписи</Badge>
              }
            </div>
            <p className="text-sm text-gray-700 mb-3">{doc.client}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={signed.has(doc.id) ? 'outline' : 'default'}
                disabled={signed.has(doc.id)}
                onClick={() => handleSign(doc)}
                className="text-xs"
              >
                <Icon name="PenLine" size={13} className="mr-1" />
                {signed.has(doc.id) ? 'Подписан' : 'Подписать'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSend(doc)} className="text-xs">
                <Icon name="Send" size={13} className="mr-1" />
                Отправить клиенту
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Open orders */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Незакрытые наряды
          <Badge variant="destructive" className="ml-2 text-xs">{open.length}</Badge>
        </p>
        {open.map(doc => (
          <Card key={doc.id} className="p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="AlertTriangle" size={14} className="text-orange-500" />
              <span className="text-xs font-mono text-gray-500">{doc.number}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{doc.client}</p>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-orange-300"
              onClick={() => toast.info(`Наряд ${doc.number} открыт для редактирования`)}
            >
              <Icon name="ExternalLink" size={13} className="mr-1" />
              Открыть наряд
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function InstallerDashboardFull() {
  const [shiftStarted, setShiftStarted] = useState(true);
  const [activeTab, setActiveTab] = useState('route');
  const [stockFilter, setStockFilter] = useState<string>('all');

  const handleStartShift = () => {
    setShiftStarted(true);
    toast.success('День начат!', { description: 'GPS-трекинг активирован. Удачной смены, Алексей!' });
  };

  const handleEndShift = () => {
    setShiftStarted(false);
    toast.info('Смена завершена', { description: 'Трекинг остановлен. Пробег за день: 87 км.' });
  };

  const handleOrderAction = (order: WorkOrder) => {
    const action = nextAction(order.status);
    const messages: Record<string, string> = {
      Выехать:   `Выезд на ${order.address} зафиксирован`,
      Прибыл:    `Прибытие на объект подтверждено`,
      Завершить: `Наряд ${order.number} успешно завершён`,
    };
    toast.success(messages[action.label] ?? 'Действие выполнено', { description: order.client });
  };

  const filteredStock = stockFilter === 'all'
    ? STOCK_ITEMS
    : STOCK_ITEMS.filter(s => {
        if (stockFilter === 'low')    return s.status === 'Заканчивается';
        if (stockFilter === 'empty')  return s.status === 'Отсутствует';
        return true;
      });

  const completedCount = WORK_ORDERS.filter(o => o.status === 'Выполнен').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-4xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Добрый день, Алексей Петров!
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Icon name="Calendar" size={13} />
              18 мая 2026, понедельник
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-sm">
              <Icon name="Radio" size={13} className="mr-1.5 inline" />
              На смене
            </Badge>
            {shiftStarted ? (
              <Button size="sm" variant="outline" onClick={handleEndShift} className="text-red-600 border-red-200 hover:bg-red-50">
                <Icon name="LogOut" size={13} className="mr-1.5" />
                Завершить день
              </Button>
            ) : (
              <Button size="sm" onClick={handleStartShift} className="bg-green-600 hover:bg-green-700">
                <Icon name="Play" size={13} className="mr-1.5" />
                Начать день
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard icon="ClipboardList" label="Нарядов сегодня" value="4"    color="bg-blue-500"   />
        <KpiCard icon="CheckCircle"  label="Выполнено"        value={String(completedCount)} color="bg-green-500"  />
        <KpiCard icon="Timer"        label="Следующий через"  value="45 мин" sub="ул. Строителей, 3" color="bg-amber-500" />
        <KpiCard icon="Navigation"   label="Пробег"           value="87 км" sub="из 134 км" color="bg-purple-500" />
      </div>

      {/* ── Work Orders ────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Icon name="ClipboardList" size={16} />
            Мои наряды сегодня
          </h2>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{WORK_ORDERS.length} выполнено
          </Badge>
        </div>

        <div className="mb-3">
          <Progress value={(completedCount / WORK_ORDERS.length) * 100} className="h-2" />
        </div>

        {WORK_ORDERS.map(order => (
          <OrderCard key={order.id} order={order} onAction={handleOrderAction} />
        ))}
      </section>

      {/* ── Stock Section ──────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Icon name="Package" size={16} />
            Материалы и ЗИП (мобильный склад)
          </h2>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все позиции</SelectItem>
              <SelectItem value="low">Заканчивается</SelectItem>
              <SelectItem value="empty">Отсутствует</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="p-0 overflow-hidden mb-3">
          <div className="divide-y divide-gray-100">
            {filteredStock.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    {item.qty} {item.unit}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STOCK_STATUS_STYLE[item.status]}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => toast.info('Запрос на пополнение склада отправлен диспетчеру')}
          >
            <Icon name="RefreshCcw" size={13} className="mr-1.5" />
            Запросить пополнение
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => toast.success('Форма списания открыта')}
          >
            <Icon name="MinusCircle" size={13} className="mr-1.5" />
            Списать со склада
          </Button>
        </div>
      </section>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="route"      className="flex-1 text-xs">
            <Icon name="Map" size={13} className="mr-1" /> Маршрут
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex-1 text-xs">
            <Icon name="BarChart2" size={13} className="mr-1" /> Статистика
          </TabsTrigger>
          <TabsTrigger value="documents"  className="flex-1 text-xs">
            <Icon name="FileText" size={13} className="mr-1" /> Документы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="route">
          <Card className="p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Icon name="Map" size={15} />
              Маршрут дня — 5 точек
            </p>
            <RouteMap />
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsTab />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
