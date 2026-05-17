import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type SLALevel = 'critical' | 'urgent' | 'normal';
type EngineerStatus = 'free' | 'en_route' | 'on_site';
type OrderStatus = 'new' | 'assigned' | 'en_route' | 'on_site' | 'completed';
type IncomingSource = 'telegram' | 'avito' | 'email' | 'phone';

interface IncomingRequest {
  id: string;
  source: IncomingSource;
  client: string;
  address: string;
  workType: string;
  sla: SLALevel;
}

interface Engineer {
  id: string;
  name: string;
  status: EngineerStatus;
  phone: string;
  mapX: number;
  mapY: number;
  targetX?: number;
  targetY?: number;
  ordersCount: number;
}

interface WorkOrder {
  id: string;
  engineerId: string;
  engineerName: string;
  client: string;
  status: OrderStatus;
  startTime: string;
  address: string;
  description: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const INCOMING_REQUESTS: IncomingRequest[] = [
  { id: 'r1', source: 'telegram', client: 'Иванов А.П.', address: 'ул. Ленина, 45', workType: 'Ремонт кондиционера', sla: 'critical' },
  { id: 'r2', source: 'avito', client: 'ООО "ТехСервис"', address: 'пр. Мира, 12', workType: 'Техническое обслуживание', sla: 'urgent' },
  { id: 'r3', source: 'email', client: 'Петрова С.В.', address: 'ул. Садовая, 78', workType: 'Заправка хладагентом', sla: 'normal' },
  { id: 'r4', source: 'phone', client: 'ИП Сидоров', address: 'ул. Центральная, 3', workType: 'Монтаж сплит-системы', sla: 'urgent' },
  { id: 'r5', source: 'telegram', client: 'Кузнецова М.А.', address: 'пр. Победы, 55', workType: 'Диагностика', sla: 'normal' },
];

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Алексей Громов', status: 'free', phone: '+7 912 001 0101', mapX: 150, mapY: 200, ordersCount: 0 },
  { id: 'e2', name: 'Дмитрий Соколов', status: 'en_route', phone: '+7 912 002 0202', mapX: 420, mapY: 150, targetX: 560, targetY: 200, ordersCount: 3 },
  { id: 'e3', name: 'Михаил Карпов', status: 'on_site', phone: '+7 912 003 0303', mapX: 700, mapY: 320, targetX: 700, targetY: 320, ordersCount: 4 },
  { id: 'e4', name: 'Сергей Волков', status: 'free', phone: '+7 912 004 0404', mapX: 300, mapY: 380, ordersCount: 0 },
  { id: 'e5', name: 'Андрей Лебедев', status: 'on_site', phone: '+7 912 005 0505', mapX: 620, mapY: 420, targetX: 620, targetY: 420, ordersCount: 5 },
  { id: 'e6', name: 'Павел Новиков', status: 'free', phone: '+7 912 006 0606', mapX: 200, mapY: 320, ordersCount: 0 },
];

const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo001', engineerId: 'e2', engineerName: 'Дмитрий Соколов', client: 'Завод Стройком', status: 'en_route', startTime: '09:00', address: 'пр. Мира, 12', description: 'ТО чиллера Daikin' },
  { id: 'wo002', engineerId: 'e3', engineerName: 'Михаил Карпов', client: 'ТЦ Горизонт', status: 'on_site', startTime: '09:30', address: 'ул. Торговая, 1', description: 'Ремонт VRF системы' },
  { id: 'wo003', engineerId: 'e5', engineerName: 'Андрей Лебедев', client: 'Отель Марина', status: 'on_site', startTime: '10:00', address: 'наб. Речная, 8', description: 'Замена фреона R-410A' },
  { id: 'wo004', engineerId: 'e2', engineerName: 'Дмитрий Соколов', client: 'ООО АгроТех', status: 'assigned', startTime: '13:00', address: 'ул. Полевая, 34', description: 'Монтаж кондиционера' },
  { id: 'wo005', engineerId: 'e3', engineerName: 'Михаил Карпов', client: 'Банк Надёжный', status: 'assigned', startTime: '14:00', address: 'пл. Центральная, 2', description: 'Диагностика системы' },
  { id: 'wo006', engineerId: 'e5', engineerName: 'Андрей Лебедев', client: 'Склад Логис', status: 'new', startTime: '15:00', address: 'ул. Складская, 7', description: 'Заправка хладагентом' },
  { id: 'wo007', engineerId: 'e2', engineerName: 'Дмитрий Соколов', client: 'Иванов А.П.', status: 'completed', startTime: '08:00', address: 'ул. Ленина, 45', description: 'Чистка фильтров' },
  { id: 'wo008', engineerId: 'e5', engineerName: 'Андрей Лебедев', client: 'Петрова С.В.', status: 'completed', startTime: '08:30', address: 'ул. Садовая, 78', description: 'ТО сплит-системы' },
];

const ENGINEER_LOAD_DATA = ENGINEERS.map((e) => ({ name: e.name.split(' ')[0], нарядов: e.ordersCount }));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slaLabel(sla: SLALevel): string {
  return sla === 'critical' ? 'Критично' : sla === 'urgent' ? 'Срочно' : 'Норма';
}

function slaVariant(sla: SLALevel): 'destructive' | 'default' | 'secondary' {
  return sla === 'critical' ? 'destructive' : sla === 'urgent' ? 'default' : 'secondary';
}

function sourceIcon(source: IncomingSource): string {
  return source === 'telegram' ? 'Send' : source === 'avito' ? 'ShoppingBag' : source === 'email' ? 'Mail' : 'Phone';
}

function sourceColor(source: IncomingSource): string {
  return source === 'telegram' ? 'text-blue-500' : source === 'avito' ? 'text-yellow-600' : source === 'email' ? 'text-purple-500' : 'text-green-600';
}

function orderStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    new: 'Новый', assigned: 'Назначен', en_route: 'В пути', on_site: 'На объекте', completed: 'Завершён',
  };
  return map[status];
}

function orderStatusVariant(status: OrderStatus): 'destructive' | 'default' | 'secondary' | 'outline' {
  if (status === 'on_site') return 'destructive';
  if (status === 'en_route') return 'default';
  if (status === 'assigned') return 'secondary';
  if (status === 'completed') return 'outline';
  return 'secondary';
}

function engineerStatusColor(status: EngineerStatus): string {
  return status === 'free' ? '#22c55e' : status === 'en_route' ? '#3b82f6' : '#f97316';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AssignModal({ request, onClose }: { request: IncomingRequest; onClose: () => void }) {
  const freeEngineers = ENGINEERS.filter((e) => e.status === 'free');

  function handleAssign(engineer: Engineer) {
    toast.success(`Наряд назначен инженеру ${engineer.name}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">Назначить инженера</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="X" size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Заявка: {request.client} — {request.workType}</p>
        <div className="space-y-2">
          {freeEngineers.map((eng) => (
            <button
              key={eng.id}
              onClick={() => handleAssign(eng)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Icon name="User" size={14} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium">{eng.name}</p>
                <p className="text-xs text-gray-400">Свободен</p>
              </div>
            </button>
          ))}
          {freeEngineers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Нет свободных инженеров</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CityMap() {
  const requestMarkers = [
    { x: 560, y: 200, label: 'r1' },
    { x: 380, y: 280, label: 'r2' },
    { x: 240, y: 140, label: 'r3' },
    { x: 480, y: 370, label: 'r4' },
    { x: 720, y: 160, label: 'r5' },
  ];

  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" style={{ background: '#f0f4f8' }}>
      {/* City grid background */}
      <rect x="0" y="0" width="900" height="500" fill="#e8edf2" />

      {/* Major roads */}
      <line x1="0" y1="250" x2="900" y2="250" stroke="#c8d0da" strokeWidth="12" />
      <line x1="450" y1="0" x2="450" y2="500" stroke="#c8d0da" strokeWidth="12" />
      <line x1="0" y1="125" x2="900" y2="125" stroke="#d4dae2" strokeWidth="6" />
      <line x1="0" y1="375" x2="900" y2="375" stroke="#d4dae2" strokeWidth="6" />
      <line x1="225" y1="0" x2="225" y2="500" stroke="#d4dae2" strokeWidth="6" />
      <line x1="675" y1="0" x2="675" y2="500" stroke="#d4dae2" strokeWidth="6" />

      {/* Road labels */}
      <text x="455" y="245" fill="#9aa5b4" fontSize="10" fontFamily="sans-serif">пр. Ленина</text>
      <text x="15" y="246" fill="#9aa5b4" fontSize="10" fontFamily="sans-serif">ул. Мира</text>

      {/* City blocks */}
      {[
        [30, 30, 170, 85], [250, 30, 170, 85], [480, 30, 170, 85], [700, 30, 170, 85],
        [30, 145, 170, 85], [250, 145, 170, 85], [480, 145, 170, 85], [700, 145, 170, 85],
        [30, 270, 170, 85], [250, 270, 170, 85], [480, 270, 170, 85], [700, 270, 170, 85],
        [30, 395, 170, 85], [250, 395, 170, 85], [480, 395, 170, 85], [700, 395, 170, 85],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#dce3eb" opacity="0.7" />
      ))}

      {/* Park area */}
      <rect x="480" y="270" width="170" height="85" rx="4" fill="#c6dfc3" opacity="0.8" />
      <text x="545" y="318" fill="#5a8a55" fontSize="10" fontFamily="sans-serif">Парк</text>

      {/* Route lines (engineers to targets) */}
      {ENGINEERS.filter((e) => e.targetX && e.targetY && e.status !== 'free').map((e) => (
        <line
          key={e.id}
          x1={e.mapX} y1={e.mapY}
          x2={e.targetX!} y2={e.targetY!}
          stroke={engineerStatusColor(e.status)}
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.7"
        />
      ))}

      {/* Request markers (red triangles) */}
      {requestMarkers.map((m) => (
        <g key={m.label} transform={`translate(${m.x}, ${m.y})`}>
          <polygon points="0,-10 8,6 -8,6" fill="#ef4444" opacity="0.9" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
        </g>
      ))}

      {/* Engineer markers (colored circles) */}
      {ENGINEERS.map((e) => (
        <g key={e.id} transform={`translate(${e.mapX}, ${e.mapY})`}>
          <circle cx="0" cy="0" r="14" fill={engineerStatusColor(e.status)} opacity="0.2" />
          <circle cx="0" cy="0" r="9" fill={engineerStatusColor(e.status)} />
          <text x="0" y="4" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
            {e.name.charAt(0)}
          </text>
          <text x="0" y="26" textAnchor="middle" fill="#374151" fontSize="8" fontFamily="sans-serif">
            {e.name.split(' ')[0]}
          </text>
        </g>
      ))}

      {/* Legend */}
      <rect x="14" y="438" width="260" height="52" rx="6" fill="white" opacity="0.88" />
      <circle cx="34" cy="452" r="6" fill="#22c55e" />
      <text x="45" y="456" fill="#374151" fontSize="9" fontFamily="sans-serif">Свободен</text>
      <circle cx="34" cy="468" r="6" fill="#3b82f6" />
      <text x="45" y="472" fill="#374151" fontSize="9" fontFamily="sans-serif">В пути</text>
      <circle cx="110" cy="452" r="6" fill="#f97316" />
      <text x="121" y="456" fill="#374151" fontSize="9" fontFamily="sans-serif">На объекте</text>
      <polygon points="148,462 156,478 140,478" fill="#ef4444" />
      <text x="161" y="472" fill="#374151" fontSize="9" fontFamily="sans-serif">Заявка</text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DispatchCenterFull() {
  const [assigningRequest, setAssigningRequest] = useState<IncomingRequest | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const freeCount = ENGINEERS.filter((e) => e.status === 'free').length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Центр диспетчеризации</h1>
          <p className="text-xs text-gray-500 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
            <Icon name="Plus" size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">Новых</span>
            <span className="text-sm font-bold text-blue-800">7</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100">
            <Icon name="Wrench" size={14} className="text-orange-600" />
            <span className="text-xs font-semibold text-orange-700">В работе</span>
            <span className="text-sm font-bold text-orange-800">12</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
            <Icon name="AlertTriangle" size={14} className="text-red-600" />
            <span className="text-xs font-semibold text-red-700">Просроченных</span>
            <span className="text-sm font-bold text-red-800">2</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
            <Icon name="Users" size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">Свободных</span>
            <span className="text-sm font-bold text-green-800">{freeCount}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left panel: incoming requests */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <Icon name="Inbox" size={15} className="text-indigo-500" />
            <span className="text-sm font-semibold text-gray-800">Входящие заявки</span>
            <Badge variant="secondary" className="ml-auto text-xs">{INCOMING_REQUESTS.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {INCOMING_REQUESTS.map((req) => (
              <div key={req.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon name={sourceIcon(req.source) as any} size={14} className={sourceColor(req.source)} />
                    <span className="text-xs text-gray-500 capitalize">{req.source}</span>
                  </div>
                  <Badge variant={slaVariant(req.sla)} className="text-[10px] px-1.5 py-0">{slaLabel(req.sla)}</Badge>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{req.client}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Icon name="MapPin" size={10} className="shrink-0" />
                  {req.address}
                </p>
                <p className="text-xs text-indigo-600 mt-0.5">{req.workType}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full h-7 text-xs"
                  onClick={() => setAssigningRequest(req)}
                >
                  <Icon name="UserCheck" size={12} className="mr-1" />
                  Назначить
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Center: SVG map */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center gap-2">
            <Icon name="Map" size={15} className="text-teal-500" />
            <span className="text-sm font-semibold text-gray-800">Карта города</span>
            <span className="text-xs text-gray-400 ml-auto">Инженеров: {ENGINEERS.length} · Заявок на карте: 5</span>
          </div>
          <div className="flex-1 p-3 overflow-hidden">
            <div className="h-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <CityMap />
            </div>
          </div>
        </div>

        {/* Right panel: active orders + chart */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden shrink-0">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <Icon name="ClipboardList" size={15} className="text-purple-500" />
            <span className="text-sm font-semibold text-gray-800">Наряды сегодня</span>
            <Badge variant="secondary" className="ml-auto text-xs">{WORK_ORDERS.length}</Badge>
          </div>

          {/* Order list */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {WORK_ORDERS.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  className={`w-full text-left px-3 py-2.5 hover:bg-purple-50 transition-colors ${selectedOrder?.id === order.id ? 'bg-purple-50 border-l-2 border-purple-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-gray-800 truncate max-w-[130px]">{order.engineerName.split(' ')[0]}</span>
                    <Badge variant={orderStatusVariant(order.status)} className="text-[10px] px-1.5 py-0">{orderStatusLabel(order.status)}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={10} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-400">{order.startTime}</span>
                    <span className="text-xs text-gray-600 truncate ml-1">{order.client}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Order detail */}
            {selectedOrder && (
              <div className="m-2 p-3 rounded-lg border border-purple-200 bg-purple-50 text-sm">
                <p className="font-semibold text-gray-800 mb-1">{selectedOrder.client}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                  <Icon name="MapPin" size={10} />
                  {selectedOrder.address}
                </p>
                <p className="text-xs text-gray-600 mb-2">{selectedOrder.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs"
                    onClick={() => toast.info(`Звоним инженеру ${selectedOrder.engineerName}`)}
                  >
                    <Icon name="Phone" size={11} className="mr-1" />
                    Позвонить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs"
                    onClick={() => toast.info(`Перенаправление наряда ${selectedOrder.id}`)}
                  >
                    <Icon name="ArrowRightLeft" size={11} className="mr-1" />
                    Передать
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Engineer load chart */}
          <div className="border-t border-gray-100 p-3 shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="BarChart2" size={13} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-700">Нагрузка инженеров</span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={ENGINEER_LOAD_DATA} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                  formatter={(value: number) => [value, 'Нарядов']}
                />
                <Bar dataKey="нарядов" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Assign modal */}
      {assigningRequest && (
        <AssignModal request={assigningRequest} onClose={() => setAssigningRequest(null)} />
      )}
    </div>
  );
}
