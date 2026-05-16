import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Priority = 'emergency' | 'urgent' | 'normal';

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  address: string;
  type: string;
  priority: Priority;
  slaDeadline: string;
  slaRemainingMinutes: number;
  mapX: number;
  mapY: number;
}

interface Engineer {
  id: string;
  name: string;
  initials: string;
  status: 'free' | 'busy' | 'finishing';
  currentOrders: number;
  mapX: number;
  mapY: number;
  phone: string;
}

interface CandidateScore {
  engineer: Engineer;
  distanceKm: number;
  etaMinutes: number;
  scores: {
    sla: number;
    geo: number;
    workload: number;
    skills: number;
  };
  total: number;
}

interface AssignedRoute {
  orderId: string;
  engineerId: string;
  animating: boolean;
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Иванов Алексей', initials: 'ИА', status: 'free', currentOrders: 1, mapX: 180, mapY: 140, phone: '+7 901 123-45-67' },
  { id: 'e2', name: 'Петров Дмитрий', initials: 'ПД', status: 'finishing', currentOrders: 2, mapX: 340, mapY: 200, phone: '+7 902 234-56-78' },
  { id: 'e3', name: 'Сидоров Марат', initials: 'СМ', status: 'free', currentOrders: 0, mapX: 520, mapY: 160, phone: '+7 903 345-67-89' },
  { id: 'e4', name: 'Козлов Олег', initials: 'КО', status: 'busy', currentOrders: 3, mapX: 620, mapY: 280, phone: '+7 904 456-78-90' },
  { id: 'e5', name: 'Новиков Игорь', initials: 'НИ', status: 'free', currentOrders: 1, mapX: 240, mapY: 340, phone: '+7 905 567-89-01' },
  { id: 'e6', name: 'Морозов Виктор', initials: 'МВ', status: 'finishing', currentOrders: 2, mapX: 460, mapY: 380, phone: '+7 906 678-90-12' },
  { id: 'e7', name: 'Волков Андрей', initials: 'ВА', status: 'free', currentOrders: 0, mapX: 150, mapY: 420, phone: '+7 907 789-01-23' },
  { id: 'e8', name: 'Лебедев Павел', initials: 'ЛП', status: 'busy', currentOrders: 2, mapX: 580, mapY: 440, phone: '+7 908 890-12-34' },
  { id: 'e9', name: 'Соколов Денис', initials: 'СД', status: 'free', currentOrders: 1, mapX: 360, mapY: 480, phone: '+7 909 901-23-45' },
  { id: 'e10', name: 'Попов Сергей', initials: 'ПС', status: 'free', currentOrders: 0, mapX: 700, mapY: 360, phone: '+7 910 012-34-56' },
];

const INITIAL_ORDERS: WorkOrder[] = [
  {
    id: 'wo-1', number: 'WO-2026-000341',
    client: 'ООО «АрктикСтрой»',
    address: 'ул. Тверская, 15, оф. 301',
    type: 'Ремонт VRF-системы',
    priority: 'emergency',
    slaDeadline: '10:30',
    slaRemainingMinutes: 47,
    mapX: 310, mapY: 170,
  },
  {
    id: 'wo-2', number: 'WO-2026-000342',
    client: 'Иванов Сергей Петрович',
    address: 'Ленинградский пр., 18, кв. 55',
    type: 'Техническое обслуживание',
    priority: 'urgent',
    slaDeadline: '13:00',
    slaRemainingMinutes: 137,
    mapX: 210, mapY: 260,
  },
  {
    id: 'wo-3', number: 'WO-2026-000343',
    client: 'ТЦ «Галактика»',
    address: 'Варшавское шоссе, 87',
    type: 'Установка кондиционера',
    priority: 'normal',
    slaDeadline: '17:00',
    slaRemainingMinutes: 257,
    mapX: 390, mapY: 430,
  },
  {
    id: 'wo-4', number: 'WO-2026-000344',
    client: 'Клиника «Медикор»',
    address: 'ул. Профсоюзная, 56',
    type: 'Заправка хладагентом',
    priority: 'urgent',
    slaDeadline: '11:45',
    slaRemainingMinutes: 82,
    mapX: 480, mapY: 300,
  },
  {
    id: 'wo-5', number: 'WO-2026-000345',
    client: 'ООО «ТехноЛогик»',
    address: 'Новый Арбат, 21',
    type: 'Диагностика чиллера',
    priority: 'normal',
    slaDeadline: '16:00',
    slaRemainingMinutes: 195,
    mapX: 270, mapY: 200,
  },
  {
    id: 'wo-6', number: 'WO-2026-000346',
    client: 'Петрова Анна Владимировна',
    address: 'ул. Мира, 33, кв. 12',
    type: 'Плановое ТО',
    priority: 'normal',
    slaDeadline: '18:00',
    slaRemainingMinutes: 312,
    mapX: 660, mapY: 200,
  },
  {
    id: 'wo-7', number: 'WO-2026-000347',
    client: 'Бизнес-центр «Сатурн»',
    address: 'Краснопресненская наб., 12',
    type: 'Аварийный выезд',
    priority: 'emergency',
    slaDeadline: '09:15',
    slaRemainingMinutes: 28,
    mapX: 160, mapY: 310,
  },
  {
    id: 'wo-8', number: 'WO-2026-000348',
    client: 'Школа №1547',
    address: 'ул. Академика Янгеля, 3',
    type: 'Гарантийный ремонт',
    priority: 'urgent',
    slaDeadline: '14:30',
    slaRemainingMinutes: 178,
    mapX: 560, mapY: 490,
  },
];

// Candidates per order (top-3 engineers)
const CANDIDATES: Record<string, CandidateScore[]> = {
  'wo-1': [
    {
      engineer: ENGINEERS[0],
      distanceKm: 3.2, etaMinutes: 14,
      scores: { sla: 95, geo: 88, workload: 80, skills: 100 },
      total: 73,
    },
    {
      engineer: ENGINEERS[1],
      distanceKm: 6.8, etaMinutes: 28,
      scores: { sla: 90, geo: 68, workload: 60, skills: 90 },
      total: 68,
    },
    {
      engineer: ENGINEERS[2],
      distanceKm: 11.4, etaMinutes: 41,
      scores: { sla: 88, geo: 45, workload: 100, skills: 80 },
      total: 61,
    },
  ],
  'wo-2': [
    {
      engineer: ENGINEERS[4],
      distanceKm: 4.5, etaMinutes: 19,
      scores: { sla: 72, geo: 82, workload: 90, skills: 85 },
      total: 73,
    },
    {
      engineer: ENGINEERS[1],
      distanceKm: 7.1, etaMinutes: 31,
      scores: { sla: 70, geo: 65, workload: 60, skills: 90 },
      total: 68,
    },
    {
      engineer: ENGINEERS[8],
      distanceKm: 9.8, etaMinutes: 38,
      scores: { sla: 68, geo: 55, workload: 80, skills: 70 },
      total: 61,
    },
  ],
  'wo-3': [
    {
      engineer: ENGINEERS[5],
      distanceKm: 2.1, etaMinutes: 10,
      scores: { sla: 60, geo: 95, workload: 70, skills: 75 },
      total: 73,
    },
    {
      engineer: ENGINEERS[8],
      distanceKm: 4.3, etaMinutes: 18,
      scores: { sla: 58, geo: 80, workload: 80, skills: 70 },
      total: 68,
    },
    {
      engineer: ENGINEERS[3],
      distanceKm: 8.6, etaMinutes: 34,
      scores: { sla: 55, geo: 55, workload: 40, skills: 90 },
      total: 61,
    },
  ],
  'wo-4': [
    {
      engineer: ENGINEERS[2],
      distanceKm: 5.7, etaMinutes: 23,
      scores: { sla: 80, geo: 75, workload: 100, skills: 85 },
      total: 73,
    },
    {
      engineer: ENGINEERS[9],
      distanceKm: 6.2, etaMinutes: 26,
      scores: { sla: 78, geo: 72, workload: 100, skills: 75 },
      total: 68,
    },
    {
      engineer: ENGINEERS[4],
      distanceKm: 10.1, etaMinutes: 39,
      scores: { sla: 75, geo: 50, workload: 90, skills: 80 },
      total: 61,
    },
  ],
  'wo-5': [
    {
      engineer: ENGINEERS[6],
      distanceKm: 7.3, etaMinutes: 29,
      scores: { sla: 65, geo: 70, workload: 100, skills: 90 },
      total: 73,
    },
    {
      engineer: ENGINEERS[0],
      distanceKm: 4.1, etaMinutes: 17,
      scores: { sla: 62, geo: 85, workload: 80, skills: 75 },
      total: 68,
    },
    {
      engineer: ENGINEERS[3],
      distanceKm: 12.0, etaMinutes: 44,
      scores: { sla: 60, geo: 40, workload: 40, skills: 95 },
      total: 61,
    },
  ],
  'wo-6': [
    {
      engineer: ENGINEERS[9],
      distanceKm: 3.8, etaMinutes: 16,
      scores: { sla: 55, geo: 88, workload: 100, skills: 80 },
      total: 73,
    },
    {
      engineer: ENGINEERS[3],
      distanceKm: 5.4, etaMinutes: 22,
      scores: { sla: 52, geo: 78, workload: 40, skills: 90 },
      total: 68,
    },
    {
      engineer: ENGINEERS[2],
      distanceKm: 8.9, etaMinutes: 36,
      scores: { sla: 50, geo: 58, workload: 100, skills: 85 },
      total: 61,
    },
  ],
  'wo-7': [
    {
      engineer: ENGINEERS[6],
      distanceKm: 1.8, etaMinutes: 9,
      scores: { sla: 98, geo: 92, workload: 100, skills: 85 },
      total: 73,
    },
    {
      engineer: ENGINEERS[4],
      distanceKm: 5.5, etaMinutes: 22,
      scores: { sla: 95, geo: 74, workload: 90, skills: 80 },
      total: 68,
    },
    {
      engineer: ENGINEERS[1],
      distanceKm: 9.2, etaMinutes: 37,
      scores: { sla: 92, geo: 52, workload: 60, skills: 90 },
      total: 61,
    },
  ],
  'wo-8': [
    {
      engineer: ENGINEERS[7],
      distanceKm: 2.4, etaMinutes: 11,
      scores: { sla: 75, geo: 90, workload: 70, skills: 90 },
      total: 73,
    },
    {
      engineer: ENGINEERS[5],
      distanceKm: 6.0, etaMinutes: 25,
      scores: { sla: 72, geo: 70, workload: 70, skills: 85 },
      total: 68,
    },
    {
      engineer: ENGINEERS[8],
      distanceKm: 7.8, etaMinutes: 33,
      scores: { sla: 70, geo: 62, workload: 80, skills: 75 },
      total: 61,
    },
  ],
};

// Hours chart data (24h)
const HOURS_DATA = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}`,
  auto: h >= 8 && h <= 20 ? Math.round(Math.random() * 8 + (h >= 9 && h <= 18 ? 4 : 1)) : 0,
  manual: h >= 8 && h <= 20 ? Math.round(Math.random() * 4 + 1) : 0,
}));

// ─────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; color: string; dotColor: string }> = {
  emergency: { label: 'Аварийный', color: 'bg-red-100 text-red-700 border-red-200', dotColor: 'bg-red-500' },
  urgent: { label: 'Срочный', color: 'bg-orange-100 text-orange-700 border-orange-200', dotColor: 'bg-orange-500' },
  normal: { label: 'Обычный', color: 'bg-slate-100 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' },
};

function SlaTimer({ minutes }: { minutes: number }) {
  const [remaining, setRemaining] = useState(minutes);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(remaining / 60);
  const mins = remaining % 60;
  const isRed = remaining < 60;
  const isYellow = remaining >= 60 && remaining < 120;

  return (
    <span
      className={`font-mono text-xs font-semibold tabular-nums ${
        isRed ? 'text-red-600' : isYellow ? 'text-orange-500' : 'text-slate-500'
      }`}
    >
      {isRed && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse" />}
      {hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`}
    </span>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-slate-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium text-slate-700">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function SmartDispatchFull() {
  const [orders] = useState<WorkOrder[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('wo-1');
  const [assignedRoutes, setAssignedRoutes] = useState<AssignedRoute[]>([]);
  const [assignedOrderIds, setAssignedOrderIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssigningAll, setIsAssigningAll] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;
  const candidates = selectedOrderId ? (CANDIDATES[selectedOrderId] ?? []) : [];

  const filteredOrders = orders.filter((o) => {
    if (assignedOrderIds.has(o.id)) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      o.client.toLowerCase().includes(q) ||
      o.number.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q)
    );
  });

  const assignOrder = useCallback(
    (orderId: string, candidate: CandidateScore) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      // Animate route line
      const route: AssignedRoute = {
        orderId,
        engineerId: candidate.engineer.id,
        animating: true,
      };
      setAssignedRoutes((prev) => [...prev.filter((r) => r.orderId !== orderId), route]);

      setTimeout(() => {
        setAssignedRoutes((prev) =>
          prev.map((r) => (r.orderId === orderId ? { ...r, animating: false } : r))
        );
        setAssignedOrderIds((prev) => new Set([...prev, orderId]));
        if (selectedOrderId === orderId) {
          const remaining = orders.filter(
            (o) => !assignedOrderIds.has(o.id) && o.id !== orderId
          );
          setSelectedOrderId(remaining[0]?.id ?? null);
        }
      }, 1500);

      toast.success(`Наряд ${order.number} назначен инженеру ${candidate.engineer.name}`, {
        description: `Время в пути: ~${candidate.etaMinutes} мин · Скор: ${candidate.total}/100`,
        duration: 4000,
      });
    },
    [orders, selectedOrderId, assignedOrderIds]
  );

  const autoAssignOne = useCallback(
    (orderId: string) => {
      const topCandidate = CANDIDATES[orderId]?.[0];
      if (!topCandidate) return;
      assignOrder(orderId, topCandidate);
    },
    [assignOrder]
  );

  const assignAll = useCallback(async () => {
    setIsAssigningAll(true);
    const pending = filteredOrders;
    for (let i = 0; i < pending.length; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 400 * i));
      autoAssignOne(pending[i].id);
    }
    setIsAssigningAll(false);
    toast.success(`Автоназначение завершено: ${pending.length} нарядов распределено`, {
      description: 'Среднее время назначения: 0.8 мин',
      duration: 5000,
    });
  }, [filteredOrders, autoAssignOne]);

  // Build SVG route lines
  const routeLines = assignedRoutes.map((route) => {
    const order = INITIAL_ORDERS.find((o) => o.id === route.orderId);
    const engineer = ENGINEERS.find((e) => e.id === route.engineerId);
    if (!order || !engineer) return null;
    return { order, engineer, animating: route.animating };
  });

  const assignedCount = assignedOrderIds.size;
  const totalCount = INITIAL_ORDERS.length;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Icon name="Zap" size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">Умный диспетчер</h1>
              <p className="text-xs text-slate-500 mt-0.5">Авто-назначение нарядов</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block animate-pulse" />
              ИИ активен
            </Badge>
            <Badge className="bg-slate-100 text-slate-600 text-xs">
              {assignedCount}/{totalCount} назначено
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Icon name="Clock" size={13} />
          <span>Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* ── Main 3-column layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ════════════════════════════════════════
            LEFT: Pending queue (350px)
        ════════════════════════════════════════ */}
        <div className="w-[350px] shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-hidden">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="ListTodo" size={14} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">Ожидают назначения</span>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-1.5">
                  {filteredOrders.length}
                </Badge>
              </div>
              <Button
                size="sm"
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                onClick={assignAll}
                disabled={isAssigningAll || filteredOrders.length === 0}
              >
                {isAssigningAll ? (
                  <>
                    <Icon name="Loader2" size={11} className="mr-1 animate-spin" />
                    Назначаю...
                  </>
                ) : (
                  <>
                    <Icon name="Zap" size={11} className="mr-1" />
                    Назначить всё
                  </>
                )}
              </Button>
            </div>
            <div className="relative">
              <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск по клиенту, номеру..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-7 text-xs"
              />
            </div>
          </div>

          {/* Order list */}
          <div className="flex-1 overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Icon name="CheckCircle2" size={32} className="text-green-400" />
                <span className="text-sm font-medium text-slate-500">Все наряды назначены</span>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const cfg = priorityConfig[order.priority];
                const isSelected = selectedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Row 1: number + priority + SLA */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-slate-700">{order.number}</span>
                      <div className="flex items-center gap-2">
                        <SlaTimer minutes={order.slaRemainingMinutes} />
                        <Badge className={`text-[10px] px-1.5 py-0 ${cfg.color}`}>
                          <span className={`w-1 h-1 rounded-full mr-1 inline-block ${cfg.dotColor}`} />
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                    {/* Row 2: client */}
                    <div className="text-xs font-medium text-slate-800 mb-0.5 truncate">{order.client}</div>
                    {/* Row 3: address */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                      <Icon name="MapPin" size={10} className="shrink-0" />
                      <span className="truncate">{order.address}</span>
                    </div>
                    {/* Row 4: type + action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Icon name="Wrench" size={10} className="shrink-0" />
                        <span className="truncate max-w-[140px]">{order.type}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[11px] px-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          autoAssignOne(order.id);
                        }}
                      >
                        <Icon name="Zap" size={9} className="mr-1" />
                        Авто
                      </Button>
                    </div>
                    {/* SLA deadline */}
                    <div className="text-[10px] text-slate-400 mt-1">
                      SLA до: {order.slaDeadline}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════
            CENTER: SVG Map + Stats
        ════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative bg-slate-100 overflow-hidden">
            <svg
              viewBox="0 0 800 580"
              className="w-full h-full"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {/* Map background */}
              <rect width="800" height="580" fill="#f1f5f9" />

              {/* Road grid — mimics Moscow ring roads */}
              {/* МКАД outer ring */}
              <ellipse cx="400" cy="290" rx="360" ry="255" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              {/* TTK middle ring */}
              <ellipse cx="400" cy="290" rx="220" ry="155" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              {/* Garden ring */}
              <ellipse cx="400" cy="290" rx="110" ry="80" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              {/* Kremlin center */}
              <ellipse cx="400" cy="290" rx="30" ry="22" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
              <text x="400" y="294" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">
                Кремль
              </text>

              {/* Major arteries */}
              {[
                [400, 35, 400, 545],
                [40, 290, 760, 290],
                [130, 90, 670, 490],
                [130, 490, 670, 90],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#e2e8f0" strokeWidth="2.5"
                />
              ))}

              {/* Ring labels */}
              <text x="762" y="294" fontSize="9" fill="#94a3b8">МКАД</text>
              <text x="622" y="294" fontSize="9" fill="#94a3b8">ТТК</text>
              <text x="512" y="294" fontSize="9" fill="#94a3b8">СК</text>

              {/* ── Assigned route lines ── */}
              {routeLines.map((route, i) => {
                if (!route) return null;
                return (
                  <line
                    key={i}
                    x1={route.engineer.mapX}
                    y1={route.engineer.mapY}
                    x2={route.order.mapX}
                    y2={route.order.mapY}
                    stroke="#3b82f6"
                    strokeWidth={route.animating ? 2.5 : 1.5}
                    strokeDasharray={route.animating ? 'none' : '6 4'}
                    opacity={route.animating ? 1 : 0.4}
                    className={route.animating ? 'animate-pulse' : ''}
                  />
                );
              })}

              {/* ── Suggested route lines (dashed grey) for selected order ── */}
              {selectedOrder && candidates.map((c, i) => (
                <line
                  key={`route-${i}`}
                  x1={c.engineer.mapX}
                  y1={c.engineer.mapY}
                  x2={selectedOrder.mapX}
                  y2={selectedOrder.mapY}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  opacity={i === 0 ? 0.7 : 0.3}
                />
              ))}

              {/* ── Work order stars (waiting = orange) ── */}
              {INITIAL_ORDERS.map((order) => {
                const isAssigned = assignedOrderIds.has(order.id);
                const isSelected = selectedOrderId === order.id;
                const cfg = priorityConfig[order.priority];

                if (isAssigned) {
                  // Show as small green check
                  return (
                    <g key={order.id} transform={`translate(${order.mapX}, ${order.mapY})`}>
                      <circle r="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" />
                      <text textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#16a34a">✓</text>
                    </g>
                  );
                }

                // Star shape
                const starPath = (cx: number, cy: number, r: number, ir: number) => {
                  const pts: string[] = [];
                  for (let i = 0; i < 10; i++) {
                    const angle = (Math.PI / 5) * i - Math.PI / 2;
                    const radius = i % 2 === 0 ? r : ir;
                    pts.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
                  }
                  return pts.join(' ');
                };

                const dotColor = cfg.dotColor.replace('bg-', '');
                const fillMap: Record<string, string> = {
                  'red-500': '#ef4444',
                  'orange-500': '#f97316',
                  'slate-400': '#94a3b8',
                };
                const fill = fillMap[dotColor] ?? '#f97316';

                return (
                  <g
                    key={order.id}
                    transform={`translate(${order.mapX}, ${order.mapY})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    {isSelected && (
                      <circle r="18" fill="none" stroke={fill} strokeWidth="2" opacity="0.4" className="animate-ping" />
                    )}
                    <polygon
                      points={starPath(0, 0, 10, 4.5)}
                      fill={fill}
                      stroke="white"
                      strokeWidth={isSelected ? 2 : 1.5}
                      opacity={isSelected ? 1 : 0.85}
                    />
                    {/* Label */}
                    <rect x="-22" y="12" width="44" height="13" rx="3" fill="white" opacity="0.9" />
                    <text x="0" y="22" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">
                      {order.number.slice(-3)}
                    </text>
                  </g>
                );
              })}

              {/* ── Engineer circles (blue) ── */}
              {ENGINEERS.map((eng) => {
                const statusColor = eng.status === 'free' ? '#22c55e' : eng.status === 'finishing' ? '#f59e0b' : '#ef4444';
                return (
                  <g key={eng.id} transform={`translate(${eng.mapX}, ${eng.mapY})`}>
                    <circle r="14" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#1d4ed8" fontWeight="700">
                      {eng.initials}
                    </text>
                    {/* Status dot */}
                    <circle cx="9" cy="-9" r="4" fill={statusColor} stroke="white" strokeWidth="1.5" />
                    {/* Name label */}
                    <rect x="-28" y="16" width="56" height="13" rx="3" fill="white" opacity="0.9" />
                    <text x="0" y="26" textAnchor="middle" fontSize="7.5" fill="#374151">
                      {eng.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* ── Legend ── */}
              <g transform="translate(16, 16)">
                <rect width="160" height="78" rx="6" fill="white" opacity="0.92" />
                <text x="10" y="16" fontSize="9" fill="#64748b" fontWeight="600">ЛЕГЕНДА</text>
                {/* Engineer */}
                <circle cx="20" cy="32" r="7" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="20" y="35" textAnchor="middle" fontSize="6" fill="#1d4ed8" fontWeight="700">ИА</text>
                <text x="32" y="35" fontSize="9" fill="#374151">Инженер</text>
                {/* Order star */}
                <polygon
                  points="20,-4 22,2 28,2 23,6 25,12 20,8 15,12 17,6 12,2 18,2"
                  transform="translate(0, 38)"
                  fill="#f97316" stroke="white" strokeWidth="1"
                />
                <text x="32" y="51" fontSize="9" fill="#374151">Ожидает назначения</text>
                {/* Status dots */}
                <circle cx="15" cy="64" r="4" fill="#22c55e" />
                <text x="24" y="67" fontSize="8" fill="#374151">Свободен</text>
                <circle cx="65" cy="64" r="4" fill="#f59e0b" />
                <text x="74" y="67" fontSize="8" fill="#374151">Завершает</text>
                <circle cx="120" cy="64" r="4" fill="#ef4444" />
                <text x="129" y="67" fontSize="8" fill="#374151">Занят</text>
              </g>
            </svg>
          </div>

          {/* ── Bottom stats bar ── */}
          <div className="bg-white border-t border-slate-200 px-5 py-3 shrink-0">
            <div className="flex items-stretch gap-6">
              {/* KPI metrics */}
              <div className="flex gap-5">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Ср. время (вручную)</div>
                  <div className="text-lg font-bold text-slate-700">4.2 <span className="text-xs font-normal">мин</span></div>
                </div>
                <div className="flex items-center">
                  <Icon name="ArrowRight" size={16} className="text-slate-300" />
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Ср. время (авто)</div>
                  <div className="text-lg font-bold text-blue-600">0.8 <span className="text-xs font-normal">мин</span></div>
                </div>
                <div className="flex items-end pb-1">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Icon name="TrendingDown" size={10} className="mr-1" />
                    −73%
                  </Badge>
                </div>
              </div>

              <div className="w-px bg-slate-100" />

              {/* Chart */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-700">Назначения по часам</span>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />Авто</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-300 inline-block" />Вручную</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={HOURS_DATA} barSize={6} barGap={1}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 8, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      interval={2}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                      formatter={(val: number, name: string) => [val, name === 'auto' ? 'Авто' : 'Вручную']}
                      labelFormatter={(l) => `${l}:00`}
                    />
                    <Bar dataKey="auto" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="manual" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT: Top-3 candidates (300px)
        ════════════════════════════════════════ */}
        <div className="w-[300px] shrink-0 flex flex-col bg-white border-l border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                {selectedOrder ? 'ТОП-3 кандидата' : 'Выберите наряд'}
              </span>
            </div>
            {selectedOrder && (
              <div className="mt-1.5 text-[11px] text-slate-500 truncate">
                Для: <span className="font-medium text-slate-700">{selectedOrder.number}</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {!selectedOrder ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 px-4 text-center">
                <Icon name="MousePointerClick" size={28} />
                <span className="text-sm">Кликните на наряд слева или на карте</span>
              </div>
            ) : candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Icon name="UserX" size={28} />
                <span className="text-sm">Нет доступных инженеров</span>
              </div>
            ) : (
              <div className="p-3 flex flex-col gap-3">
                {candidates.map((c, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const statusLabel: Record<string, string> = {
                    free: 'Свободен',
                    finishing: 'Завершает',
                    busy: 'Занят',
                  };
                  const statusColor: Record<string, string> = {
                    free: 'text-green-600 bg-green-50',
                    finishing: 'text-orange-600 bg-orange-50',
                    busy: 'text-red-600 bg-red-50',
                  };

                  return (
                    <div
                      key={c.engineer.id}
                      className={`rounded-xl border p-3 ${
                        idx === 0
                          ? 'border-blue-200 bg-blue-50/40'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Candidate header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                            {c.engineer.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{medals[idx]}</span>
                              <span className="text-xs font-semibold text-slate-800 leading-none">
                                {c.engineer.name}
                              </span>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 inline-block font-medium ${statusColor[c.engineer.status]}`}>
                              {statusLabel[c.engineer.status]}
                            </span>
                          </div>
                        </div>
                        {/* Total score */}
                        <div className="text-right">
                          <div className={`text-lg font-bold leading-none ${idx === 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                            {c.total}
                          </div>
                          <div className="text-[10px] text-slate-400">/100</div>
                        </div>
                      </div>

                      {/* ETA */}
                      <div className="flex items-center gap-3 mb-2.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Icon name="Navigation" size={10} />
                          {c.distanceKm} км
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={10} />
                          ~{c.etaMinutes} мин
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Briefcase" size={10} />
                          {c.engineer.currentOrders} нар.
                        </span>
                      </div>

                      {/* Score breakdown */}
                      <div className="flex flex-col gap-1.5 mb-2.5">
                        <ScoreBar label="SLA (40%)" value={c.scores.sla} color="bg-red-400" />
                        <ScoreBar label="Расстояние (30%)" value={c.scores.geo} color="bg-orange-400" />
                        <ScoreBar label="Загрузка (20%)" value={c.scores.workload} color="bg-blue-400" />
                        <ScoreBar label="Серт. (10%)" value={c.scores.skills} color="bg-purple-400" />
                      </div>

                      {/* Assign button */}
                      <Button
                        size="sm"
                        className={`w-full h-7 text-xs ${
                          idx === 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                        onClick={() => {
                          if (!selectedOrderId) return;
                          assignOrder(selectedOrderId, c);
                        }}
                      >
                        <Icon name="UserCheck" size={11} className="mr-1.5" />
                        Назначить {c.engineer.name.split(' ')[0]}
                      </Button>
                    </div>
                  );
                })}

                {/* Scoring weights info */}
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon name="Info" size={11} className="text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Веса скоринга</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                    {[
                      { label: 'SLA критичность', weight: '40%', color: 'text-red-500' },
                      { label: 'Геопозиция', weight: '30%', color: 'text-orange-500' },
                      { label: 'Загрузка', weight: '20%', color: 'text-blue-500' },
                      { label: 'Сертификаты', weight: '10%', color: 'text-purple-500' },
                    ].map((w) => (
                      <div key={w.label} className="flex items-center justify-between">
                        <span>{w.label}</span>
                        <span className={`font-bold ${w.color}`}>{w.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
