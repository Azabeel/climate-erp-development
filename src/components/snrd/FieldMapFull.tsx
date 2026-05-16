import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type EngineerStatus = 'on_site' | 'en_route' | 'break' | 'available';
type OrderPriority = 'normal' | 'urgent' | 'emergency';
type LayerKey = 'engineers' | 'orders' | 'routes';

interface Engineer {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: EngineerStatus;
  currentOrderId: string | null;
  nextOrderId: string | null;
  nextOrderTime: string | null;
  phone: string;
  distanceKm: number;
  svgX: number;
  svgY: number;
}

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  address: string;
  type: string;
  priority: OrderPriority;
  engineerId: string | null;
  scheduledTime: string;
  svgX: number;
  svgY: number;
}

interface MapEvent {
  id: string;
  text: string;
  time: string;
  icon: string;
  color: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  {
    id: 'e1', name: 'Козлов Михаил', initials: 'КМ', role: 'Ведущий инженер',
    status: 'on_site', currentOrderId: 'wo1', nextOrderId: 'wo5', nextOrderTime: '15:30',
    phone: '+7 916 234-56-78', distanceKm: 47.2, svgX: 195, svgY: 148,
  },
  {
    id: 'e2', name: 'Петров Сергей', initials: 'ПС', role: 'Инженер',
    status: 'en_route', currentOrderId: 'wo2', nextOrderId: null, nextOrderTime: null,
    phone: '+7 903 345-67-89', distanceKm: 31.8, svgX: 530, svgY: 220,
  },
  {
    id: 'e3', name: 'Иванов Кирилл', initials: 'ИК', role: 'Инженер',
    status: 'available', currentOrderId: null, nextOrderId: 'wo6', nextOrderTime: '14:00',
    phone: '+7 925 456-78-90', distanceKm: 12.5, svgX: 420, svgY: 370,
  },
  {
    id: 'e4', name: 'Сидоров Николай', initials: 'СН', role: 'Инженер',
    status: 'en_route', currentOrderId: 'wo3', nextOrderId: null, nextOrderTime: null,
    phone: '+7 977 567-89-01', distanceKm: 58.3, svgX: 660, svgY: 125,
  },
  {
    id: 'e5', name: 'Фролов Алексей', initials: 'ФА', role: 'Старший инженер',
    status: 'break', currentOrderId: null, nextOrderId: 'wo7', nextOrderTime: '14:45',
    phone: '+7 985 678-90-12', distanceKm: 22.1, svgX: 145, svgY: 420,
  },
  {
    id: 'e6', name: 'Морозов Дмитрий', initials: 'МД', role: 'Инженер',
    status: 'on_site', currentOrderId: 'wo4', nextOrderId: null, nextOrderTime: null,
    phone: '+7 999 123-45-67', distanceKm: 39.7, svgX: 310, svgY: 270,
  },
  {
    id: 'e7', name: 'Орлов Павел', initials: 'ОП', role: 'Инженер',
    status: 'en_route', currentOrderId: 'wo8', nextOrderId: null, nextOrderTime: null,
    phone: '+7 901 234-56-78', distanceKm: 18.4, svgX: 580, svgY: 390,
  },
  {
    id: 'e8', name: 'Белов Андрей', initials: 'БА', role: 'Инженер',
    status: 'available', currentOrderId: null, nextOrderId: null, nextOrderTime: null,
    phone: '+7 915 987-65-43', distanceKm: 5.2, svgX: 780, svgY: 300,
  },
];

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1', number: 'WO-2026-000112', client: 'ТЦ Мираж',
    address: 'ул. Ленина, 45', type: 'Аварийный ремонт', priority: 'emergency',
    engineerId: 'e1', scheduledTime: '13:00', svgX: 230, svgY: 110,
  },
  {
    id: 'wo2', number: 'WO-2026-000108', client: 'Сбербанк офис',
    address: 'пр. Победы, 12', type: 'ТО плановое', priority: 'normal',
    engineerId: 'e2', scheduledTime: '11:30', svgX: 570, svgY: 175,
  },
  {
    id: 'wo3', number: 'WO-2026-000115', client: 'Гипермаркет Лента',
    address: 'Северное ш., 5', type: 'Установка', priority: 'normal',
    engineerId: 'e4', scheduledTime: '15:10', svgX: 700, svgY: 85,
  },
  {
    id: 'wo4', number: 'WO-2026-000103', client: 'Медцентр Здоровье',
    address: 'ул. Врачей, 3', type: 'Гарантийный ремонт', priority: 'urgent',
    engineerId: 'e6', scheduledTime: '10:00', svgX: 355, svgY: 230,
  },
  {
    id: 'wo5', number: 'WO-2026-000120', client: 'БЦ Горизонт',
    address: 'ул. Садовая, 88', type: 'Диагностика', priority: 'normal',
    engineerId: null, scheduledTime: '15:30', svgX: 160, svgY: 195,
  },
  {
    id: 'wo6', number: 'WO-2026-000117', client: 'Ресторан Арагви',
    address: 'пл. Советская, 1', type: 'Ремонт', priority: 'urgent',
    engineerId: null, scheduledTime: '14:00', svgX: 460, svgY: 335,
  },
  {
    id: 'wo7', number: 'WO-2026-000121', client: 'Школа №14',
    address: 'ул. Школьная, 5', type: 'ТО', priority: 'normal',
    engineerId: null, scheduledTime: '14:45', svgX: 110, svgY: 375,
  },
  {
    id: 'wo8', number: 'WO-2026-000118', client: 'Офисный центр Альфа',
    address: 'ул. Центральная, 10', type: 'Замена фреона', priority: 'urgent',
    engineerId: 'e7', scheduledTime: '13:45', svgX: 620, svgY: 345,
  },
];

const EVENTS: MapEvent[] = [
  { id: 'ev1', text: 'Иванов прибыл на объект', time: '13:42', icon: 'MapPin', color: 'text-green-600' },
  { id: 'ev2', text: 'Козлов завершил наряд WO-000112', time: '13:35', icon: 'CheckCircle', color: 'text-blue-600' },
  { id: 'ev3', text: 'Новая аварийная заявка ТЦ Мираж', time: '13:28', icon: 'AlertTriangle', color: 'text-red-600' },
  { id: 'ev4', text: 'Петров выехал на объект', time: '13:15', icon: 'Navigation', color: 'text-yellow-600' },
  { id: 'ev5', text: 'Морозов завершил наряд WO-000103', time: '13:07', icon: 'CheckCircle', color: 'text-blue-600' },
  { id: 'ev6', text: 'Фролов ушёл на перерыв', time: '12:58', icon: 'Coffee', color: 'text-gray-500' },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<EngineerStatus, string> = {
  on_site: '#ef4444',
  en_route: '#f59e0b',
  break: '#9ca3af',
  available: '#22c55e',
};

const STATUS_LABEL: Record<EngineerStatus, string> = {
  on_site: 'На выезде',
  en_route: 'В пути',
  break: 'Перерыв',
  available: 'Свободен',
};

const STATUS_BADGE_CLASS: Record<EngineerStatus, string> = {
  on_site: 'bg-red-100 text-red-700',
  en_route: 'bg-yellow-100 text-yellow-700',
  break: 'bg-gray-100 text-gray-600',
  available: 'bg-green-100 text-green-700',
};

const PRIORITY_COLOR: Record<OrderPriority, string> = {
  normal: '#3b82f6',
  urgent: '#f97316',
  emergency: '#ef4444',
};

const PRIORITY_LABEL: Record<OrderPriority, string> = {
  normal: 'Обычный',
  urgent: 'Срочный',
  emergency: 'Аварийный',
};

// ─── Star path helper ─────────────────────────────────────────────────────────

function starPath(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return points.join(' ');
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FieldMapFull() {
  const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    engineers: true,
    orders: true,
    routes: true,
  });

  const selectedEngineer = selectedEngineerId
    ? ENGINEERS.find(e => e.id === selectedEngineerId) ?? null
    : null;

  const currentOrder = selectedEngineer?.currentOrderId
    ? WORK_ORDERS.find(o => o.id === selectedEngineer.currentOrderId) ?? null
    : null;

  const nextOrder = selectedEngineer?.nextOrderId
    ? WORK_ORDERS.find(o => o.id === selectedEngineer.nextOrderId) ?? null
    : null;

  function toggleLayer(key: LayerKey) {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleEngineerClick(id: string) {
    setSelectedEngineerId(prev => (prev === id ? null : id));
  }

  function handleAssign() {
    toast.success('Открыта форма назначения нового наряда');
  }

  function handleContact() {
    const eng = selectedEngineer;
    if (eng) toast.info(`Звонок: ${eng.phone}`);
  }

  // Metrics
  const onSiteCount = ENGINEERS.filter(e => e.status === 'on_site').length;
  const enRouteCount = ENGINEERS.filter(e => e.status === 'en_route').length;
  const activeCount = onSiteCount + enRouteCount;
  const activeOrders = WORK_ORDERS.filter(o => o.engineerId !== null).length;
  const avgLoad = Math.round((activeCount / ENGINEERS.length) * 100);
  const newOrders = WORK_ORDERS.filter(o => o.engineerId === null).length;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left panel ── */}
        <div className="w-[280px] bg-white border-r flex flex-col overflow-hidden flex-shrink-0">

          {/* Metrics */}
          <div className="px-4 py-3 border-b bg-gradient-to-br from-blue-50 to-white">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Сводка</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-600 rounded-xl p-3 text-white">
                <p className="text-2xl font-bold leading-none">{activeCount}</p>
                <p className="text-xs mt-1 text-blue-200 leading-tight">Инженеров на выезде</p>
              </div>
              <div className="bg-white border rounded-xl p-3">
                <p className="text-2xl font-bold text-gray-800 leading-none">{activeOrders}</p>
                <p className="text-xs mt-1 text-gray-500 leading-tight">Нарядов активных</p>
              </div>
              <div className="bg-white border rounded-xl p-3">
                <p className="text-2xl font-bold text-green-600 leading-none">{avgLoad}%</p>
                <p className="text-xs mt-1 text-gray-500 leading-tight">Средняя загрузка</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <p className="text-2xl font-bold text-orange-600 leading-none">{newOrders}</p>
                <p className="text-xs mt-1 text-orange-500 leading-tight">Новых заявок</p>
              </div>
            </div>
          </div>

          {/* Engineer list */}
          <div className="flex-1 overflow-y-auto">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b bg-gray-50 sticky top-0">
              Инженеры
            </p>
            {ENGINEERS.map(eng => {
              const order = eng.currentOrderId
                ? WORK_ORDERS.find(o => o.id === eng.currentOrderId)
                : null;
              const isSelected = selectedEngineerId === eng.id;
              return (
                <button
                  key={eng.id}
                  onClick={() => handleEngineerClick(eng.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-100 transition-colors
                    ${isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: STATUS_COLOR[eng.status] }}
                    >
                      {eng.initials}
                    </div>
                    {(eng.status === 'on_site' || eng.status === 'en_route') && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ backgroundColor: STATUS_COLOR[eng.status] }}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium text-gray-800 truncate">{eng.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE_CLASS[eng.status]}`}>
                        {STATUS_LABEL[eng.status]}
                      </span>
                    </div>
                    {order && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{order.client}</p>
                    )}
                    {eng.nextOrderTime && (
                      <p className="text-xs text-blue-500 mt-0.5">
                        Следующий в {eng.nextOrderTime}
                      </p>
                    )}
                    {!order && !eng.nextOrderTime && (
                      <p className="text-xs text-gray-400 mt-0.5">Нарядов нет</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SVG Map ── */}
        <div className="flex-1 bg-slate-100 flex flex-col min-w-0 overflow-hidden">

          {/* Layer controls */}
          <div className="bg-white border-b px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500 mr-1">Слои:</span>
            {(Object.entries(layers) as [LayerKey, boolean][]).map(([key, active]) => {
              const label = key === 'engineers' ? 'Инженеры' : key === 'orders' ? 'Наряды' : 'Маршруты';
              return (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className={`px-3 py-1 text-xs rounded-full font-medium border transition-colors ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* SVG map */}
          <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
            <svg
              viewBox="0 0 900 600"
              className="w-full h-full rounded-xl shadow-inner"
              style={{ maxHeight: '100%', background: '#dde3ea' }}
            >
              {/* ── Background ── */}
              <rect x="0" y="0" width="900" height="600" fill="#dde3ea" rx="12" />

              {/* ── City blocks ── */}
              {[
                [30, 20, 95, 65], [145, 15, 110, 55], [275, 22, 85, 60],
                [380, 10, 105, 78], [505, 18, 90, 58], [615, 25, 80, 52], [715, 18, 95, 65],
                [28, 115, 105, 90], [150, 108, 140, 98], [308, 112, 95, 82],
                [422, 103, 165, 108], [605, 110, 100, 85], [720, 108, 88, 80],
                [22, 238, 112, 95], [150, 232, 135, 92], [302, 228, 98, 102],
                [420, 238, 155, 88], [595, 235, 105, 95], [715, 232, 92, 90],
                [25, 355, 118, 52], [165, 355, 105, 52], [290, 355, 130, 52],
                [440, 355, 148, 52], [605, 352, 100, 55], [718, 350, 95, 58],
                [25, 430, 120, 55], [165, 432, 98, 50], [285, 428, 135, 55],
                [440, 430, 145, 52], [605, 425, 100, 58], [718, 428, 90, 55],
              ].map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} fill="#c8d0da" rx="3" opacity="0.7" />
              ))}

              {/* ── МКАД — outer ring ── */}
              <ellipse cx="450" cy="300" rx="420" ry="275"
                fill="none" stroke="#b0bec5" strokeWidth="9" />
              <ellipse cx="450" cy="300" rx="420" ry="275"
                fill="none" stroke="#d0d8e4" strokeWidth="6" />

              {/* ── ТТК — middle ring ── */}
              <ellipse cx="450" cy="295" rx="290" ry="185"
                fill="none" stroke="#b8c4d0" strokeWidth="7" />
              <ellipse cx="450" cy="295" rx="290" ry="185"
                fill="none" stroke="#d8e2ea" strokeWidth="5" />

              {/* ── Садовое кольцо ── */}
              <ellipse cx="450" cy="295" rx="170" ry="105"
                fill="none" stroke="#c4ced8" strokeWidth="5" />
              <ellipse cx="450" cy="295" rx="170" ry="105"
                fill="none" stroke="#dde6ee" strokeWidth="3" />

              {/* ── Радиальные дороги ── */}
              {/* Ленинградка */}
              <line x1="450" y1="25" x2="440" y2="295" stroke="#b0bec5" strokeWidth="7" />
              <line x1="450" y1="25" x2="440" y2="295" stroke="#cfd8dc" strokeWidth="5" />
              {/* Ярославка */}
              <line x1="770" y1="80" x2="540" y2="285" stroke="#b0bec5" strokeWidth="7" />
              <line x1="770" y1="80" x2="540" y2="285" stroke="#cfd8dc" strokeWidth="5" />
              {/* Калужское */}
              <line x1="450" y1="575" x2="450" y2="400" stroke="#b0bec5" strokeWidth="7" />
              <line x1="450" y1="575" x2="450" y2="400" stroke="#cfd8dc" strokeWidth="5" />
              {/* Можайское */}
              <line x1="30" y1="340" x2="280" y2="305" stroke="#b0bec5" strokeWidth="7" />
              <line x1="30" y1="340" x2="280" y2="305" stroke="#cfd8dc" strokeWidth="5" />
              {/* Рязанка */}
              <line x1="870" y1="420" x2="620" y2="310" stroke="#b0bec5" strokeWidth="6" />
              <line x1="870" y1="420" x2="620" y2="310" stroke="#cfd8dc" strokeWidth="4" />

              {/* ── Река Москва ── */}
              <path
                d="M 20 380 Q 120 340 200 360 Q 290 385 370 360 Q 430 340 480 360 Q 560 385 650 355 Q 730 330 820 350 Q 870 360 900 345"
                fill="none" stroke="#7db8d8" strokeWidth="14" opacity="0.65"
              />
              <path
                d="M 20 380 Q 120 340 200 360 Q 290 385 370 360 Q 430 340 480 360 Q 560 385 650 355 Q 730 330 820 350 Q 870 360 900 345"
                fill="none" stroke="#aed8ee" strokeWidth="9" opacity="0.55"
              />

              {/* ── Парковые зоны ── */}
              <ellipse cx="220" cy="310" rx="32" ry="22" fill="#a5d6a7" opacity="0.45" />
              <ellipse cx="430" cy="185" rx="22" ry="16" fill="#a5d6a7" opacity="0.45" />
              <ellipse cx="700" cy="250" rx="26" ry="18" fill="#a5d6a7" opacity="0.45" />
              <ellipse cx="350" cy="480" rx="20" ry="14" fill="#a5d6a7" opacity="0.45" />

              {/* ── Route lines ── */}
              {layers.routes && ENGINEERS.map(eng => {
                if (!eng.currentOrderId) return null;
                const order = WORK_ORDERS.find(o => o.id === eng.currentOrderId);
                if (!order) return null;
                return (
                  <line
                    key={eng.id}
                    x1={eng.svgX} y1={eng.svgY}
                    x2={order.svgX} y2={order.svgY}
                    stroke={STATUS_COLOR[eng.status]}
                    strokeWidth="2"
                    strokeDasharray="8 5"
                    opacity="0.7"
                  />
                );
              })}

              {/* ── Work order markers (stars) ── */}
              {layers.orders && WORK_ORDERS.map(order => {
                const color = PRIORITY_COLOR[order.priority];
                const isEmergency = order.priority === 'emergency';
                const r = isEmergency ? 13 : 10;
                return (
                  <g key={order.id} style={{ cursor: 'pointer' }}>
                    <polygon
                      points={starPath(order.svgX, order.svgY, r)}
                      fill={color}
                      stroke="white"
                      strokeWidth="1.5"
                      opacity="0.9"
                    />
                    <text
                      x={order.svgX}
                      y={order.svgY - r - 4}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#374151"
                      fontWeight="600"
                    >
                      {order.number.split('-').pop()}
                    </text>
                  </g>
                );
              })}

              {/* ── Engineer markers ── */}
              {layers.engineers && ENGINEERS.map(eng => {
                const color = STATUS_COLOR[eng.status];
                const isSelected = selectedEngineerId === eng.id;
                const isActive = eng.status === 'on_site' || eng.status === 'en_route';
                const r = isSelected ? 19 : 15;
                return (
                  <g
                    key={eng.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEngineerClick(eng.id)}
                  >
                    {/* Pulse ring */}
                    {isActive && (
                      <circle
                        cx={eng.svgX} cy={eng.svgY} r={r + 10}
                        fill={color} opacity="0.18"
                      >
                        <animate attributeName="r" values={`${r + 6};${r + 14};${r + 6}`} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Selection ring */}
                    {isSelected && (
                      <circle cx={eng.svgX} cy={eng.svgY} r={r + 5}
                        fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.6" />
                    )}
                    {/* Main circle */}
                    <circle
                      cx={eng.svgX} cy={eng.svgY} r={r}
                      fill={color}
                      stroke="white"
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    {/* Initials */}
                    <text
                      x={eng.svgX} y={eng.svgY + 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill="white"
                      fontWeight="700"
                    >
                      {eng.initials}
                    </text>
                    {/* Direction arrow for en_route */}
                    {eng.status === 'en_route' && (
                      <polygon
                        points={`${eng.svgX},${eng.svgY - r - 9} ${eng.svgX - 5},${eng.svgY - r - 1} ${eng.svgX + 5},${eng.svgY - r - 1}`}
                        fill={color}
                        stroke="white"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                );
              })}

              {/* ── Legend ── */}
              <g transform="translate(10, 490)">
                <rect x="0" y="0" width="198" height="100" fill="white" rx="6" opacity="0.93" />
                {/* Engineers */}
                <circle cx="14" cy="14" r="7" fill="#22c55e" />
                <text x="25" y="18" fontSize="9" fill="#374151">Свободен</text>
                <circle cx="14" cy="30" r="7" fill="#f59e0b" />
                <text x="25" y="34" fontSize="9" fill="#374151">В пути</text>
                <circle cx="14" cy="46" r="7" fill="#ef4444" />
                <text x="25" y="50" fontSize="9" fill="#374151">На выезде</text>
                <circle cx="14" cy="62" r="7" fill="#9ca3af" />
                <text x="25" y="66" fontSize="9" fill="#374151">Перерыв</text>
                {/* Orders */}
                <polygon points={starPath(104, 14, 7)} fill="#3b82f6" />
                <text x="118" y="18" fontSize="9" fill="#374151">Обычный</text>
                <polygon points={starPath(104, 30, 7)} fill="#f97316" />
                <text x="118" y="34" fontSize="9" fill="#374151">Срочный</text>
                <polygon points={starPath(104, 46, 9)} fill="#ef4444" />
                <text x="118" y="50" fontSize="9" fill="#374151">Аварийный</text>
                <line x1="104" y1="57" x2="185" y2="57" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
                <text x="118" y="70" fontSize="9" fill="#374151">Маршрут</text>
                <text x="8" y="87" fontSize="8" fill="#9ca3af">● Пульсация — активный инженер</text>
              </g>
            </svg>
          </div>
        </div>

        {/* ── Right detail panel ── */}
        <div className="w-[300px] bg-white border-l flex flex-col overflow-hidden flex-shrink-0">
          {selectedEngineer ? (
            <div className="flex flex-col h-full overflow-y-auto">

              {/* Header */}
              <div className="px-5 py-4 border-b bg-gradient-to-br from-blue-50 to-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base shadow flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLOR[selectedEngineer.status] }}
                  >
                    {selectedEngineer.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">{selectedEngineer.name}</p>
                    <p className="text-xs text-gray-500">{selectedEngineer.role}</p>
                    <Badge className={`mt-1 text-[10px] px-2 py-0.5 ${STATUS_BADGE_CLASS[selectedEngineer.status]}`}>
                      {STATUS_LABEL[selectedEngineer.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Current order */}
              {currentOrder ? (
                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Текущий наряд</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                    <p className="text-sm font-semibold text-blue-600">{currentOrder.number}</p>
                    <p className="text-sm font-medium text-gray-700">{currentOrder.client}</p>
                    <div className="flex items-start gap-1.5 text-xs text-gray-500">
                      <Icon name="MapPin" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{currentOrder.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icon name="Wrench" className="w-3.5 h-3.5" />
                      <span>{currentOrder.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icon name="Clock" className="w-3.5 h-3.5" />
                      <span>Запланировано: {currentOrder.scheduledTime}</span>
                    </div>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] text-white font-medium mt-1"
                      style={{ backgroundColor: PRIORITY_COLOR[currentOrder.priority] }}
                    >
                      {PRIORITY_LABEL[currentOrder.priority]}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Текущий наряд</p>
                  <p className="text-sm text-gray-400 italic">Нет активного наряда</p>
                </div>
              )}

              {/* Next order */}
              {nextOrder ? (
                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Следующий наряд — {selectedEngineer.nextOrderTime}
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-semibold text-blue-700">{nextOrder.number}</p>
                    <p className="text-sm text-gray-700">{nextOrder.client}</p>
                    <div className="flex items-start gap-1.5 text-xs text-gray-500">
                      <Icon name="MapPin" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{nextOrder.address}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Следующий наряд</p>
                  <p className="text-sm text-gray-400 italic">Не запланировано</p>
                </div>
              )}

              {/* Day stats */}
              <div className="px-4 py-3 border-b">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">День</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-green-700">{selectedEngineer.distanceKm}</p>
                    <p className="text-[10px] text-green-600">км пробег</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-700">
                      {selectedEngineer.phone.slice(-4)}
                    </p>
                    <p className="text-[10px] text-gray-500">последние 4 тел.</p>
                  </div>
                </div>
              </div>

              {/* Contact row */}
              <div className="px-4 py-3 border-b">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Phone" className="w-4 h-4 text-gray-400" />
                  <span>{selectedEngineer.phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-4 flex flex-col gap-2 mt-auto">
                <Button size="sm" className="w-full gap-2" onClick={handleAssign}>
                  <Icon name="Plus" className="w-4 h-4" />
                  Назначить новый
                </Button>
                <Button size="sm" variant="outline" className="w-full gap-2" onClick={handleContact}>
                  <Icon name="Phone" className="w-4 h-4" />
                  Связаться
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center px-6 gap-4 text-gray-400">
              <Icon name="MapPin" className="w-12 h-12 text-gray-200" />
              <p className="text-sm">Нажмите на маркер инженера на карте или выберите его из списка слева</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom events strip ── */}
      <div className="bg-white border-t flex-shrink-0">
        <div className="px-4 py-2 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <p className="text-xs font-semibold text-gray-400 uppercase whitespace-nowrap mr-1">События</p>
          {EVENTS.map(ev => (
            <div
              key={ev.id}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-shrink-0"
            >
              <Icon name={ev.icon} className={`w-4 h-4 flex-shrink-0 ${ev.color}`} />
              <div>
                <p className="text-xs text-gray-700 whitespace-nowrap">{ev.text}</p>
                <p className="text-[10px] text-gray-400">{ev.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
