import { useState } from 'react';
import { MapPin, Navigation, User, Phone, Truck, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type EngineerStatus = 'available' | 'en_route' | 'on_site' | 'offline';
type OrderPriority = 'normal' | 'urgent' | 'emergency';
type FilterType = 'all' | 'en_route' | 'on_site' | 'available';

interface Engineer {
  id: string;
  name: string;
  initials: string;
  status: EngineerStatus;
  currentOrder: string | null;
  position: { x: number; y: number };
  phone: string;
  vehicle: 'Авто' | 'ОТ';
  ordersToday: number;
  distanceKm: number;
}

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  address: string;
  type: string;
  status: string;
  priority: OrderPriority;
  engineer: string | null;
  position: { x: number; y: number };
  eta: string;
}

const ENGINEERS: Engineer[] = [
  {
    id: 'e1', name: 'Козлов М.И.', initials: 'КМ', status: 'en_route',
    currentOrder: 'wo1', position: { x: 32, y: 28 },
    phone: '+7 916 234-56-78', vehicle: 'Авто', ordersToday: 3, distanceKm: 47.2,
  },
  {
    id: 'e2', name: 'Петров С.А.', initials: 'ПС', status: 'on_site',
    currentOrder: 'wo2', position: { x: 65, y: 42 },
    phone: '+7 903 345-67-89', vehicle: 'Авто', ordersToday: 2, distanceKm: 31.8,
  },
  {
    id: 'e3', name: 'Иванов К.Д.', initials: 'ИК', status: 'available',
    currentOrder: null, position: { x: 50, y: 68 },
    phone: '+7 925 456-78-90', vehicle: 'ОТ', ordersToday: 4, distanceKm: 12.5,
  },
  {
    id: 'e4', name: 'Сидоров Н.В.', initials: 'СН', status: 'en_route',
    currentOrder: 'wo4', position: { x: 78, y: 22 },
    phone: '+7 977 567-89-01', vehicle: 'Авто', ordersToday: 1, distanceKm: 58.3,
  },
  {
    id: 'e5', name: 'Фролов А.Е.', initials: 'ФА', status: 'offline',
    currentOrder: null, position: { x: 20, y: 75 },
    phone: '+7 985 678-90-12', vehicle: 'ОТ', ordersToday: 0, distanceKm: 0,
  },
];

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1', number: 'WO-2026-000112', client: 'ТЦ Мираж', address: 'ул. Ленина, 45',
    type: 'Аварийный ремонт', status: 'EN_ROUTE', priority: 'emergency',
    engineer: 'Козлов М.И.', position: { x: 38, y: 18 }, eta: '14:35',
  },
  {
    id: 'wo2', number: 'WO-2026-000108', client: 'Сбербанк офис', address: 'пр. Победы, 12',
    type: 'ТО плановое', status: 'ON_SITE', priority: 'normal',
    engineer: 'Петров С.А.', position: { x: 65, y: 42 }, eta: '—',
  },
  {
    id: 'wo3', number: 'WO-2026-000115', client: 'Офисный центр Альфа', address: 'ул. Садовая, 88',
    type: 'Диагностика', status: 'NEW', priority: 'urgent',
    engineer: null, position: { x: 52, y: 55 }, eta: 'Не назначен',
  },
  {
    id: 'wo4', number: 'WO-2026-000103', client: 'Гипермаркет Лента', address: 'Северное ш., 5',
    type: 'Установка', status: 'EN_ROUTE', priority: 'normal',
    engineer: 'Сидоров Н.В.', position: { x: 83, y: 14 }, eta: '15:10',
  },
  {
    id: 'wo5', number: 'WO-2026-000117', client: 'Медцентр Здоровье', address: 'ул. Врачей, 3',
    type: 'Гарантийный ремонт', status: 'NEW', priority: 'urgent',
    engineer: null, position: { x: 22, y: 48 }, eta: 'Не назначен',
  },
  {
    id: 'wo6', number: 'WO-2026-000099', client: 'Ресторан Арагви', address: 'пл. Советская, 1',
    type: 'Ремонт', status: 'AWAITING_PARTS', priority: 'normal',
    engineer: 'Иванов К.Д.', position: { x: 44, y: 78 }, eta: 'Ожидание ЗИП',
  },
];

const STATUS_COLOR: Record<EngineerStatus, string> = {
  available: '#22c55e',
  en_route: '#f59e0b',
  on_site: '#ef4444',
  offline: '#9ca3af',
};

const STATUS_LABEL: Record<EngineerStatus, string> = {
  available: 'Свободен',
  en_route: 'В пути',
  on_site: 'На объекте',
  offline: 'Не в сети',
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

export default function FieldMap() {
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredEngineers = filter === 'all'
    ? ENGINEERS
    : ENGINEERS.filter(e => e.status === filter);

  const selectedEngineerData = selectedEngineer ? ENGINEERS.find(e => e.id === selectedEngineer) : null;
  const selectedOrderData = selectedOrder ? WORK_ORDERS.find(o => o.id === selectedOrder) : null;

  const availableCount = ENGINEERS.filter(e => e.status === 'available').length;
  const enRouteCount = ENGINEERS.filter(e => e.status === 'en_route').length;
  const onSiteCount = ENGINEERS.filter(e => e.status === 'on_site').length;
  const openOrdersCount = WORK_ORDERS.filter(o => o.status !== 'COMPLETED' && o.status !== 'CLOSED').length;

  function handleEngineerClick(id: string) {
    setSelectedEngineer(prev => prev === id ? null : id);
    setSelectedOrder(null);
  }

  function handleOrderClick(id: string) {
    setSelectedOrder(prev => prev === id ? null : id);
    setSelectedEngineer(null);
  }

  function handleAutoDispatch() {
    toast.success('Авторасстановка выполнена: 2 наряда назначены оптимально');
  }

  // Convert 0-100 % to SVG coordinates within the map viewport
  function toSvg(val: number, max: number) {
    return (val / 100) * max;
  }

  const MAP_W = 600;
  const MAP_H = 420;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">Карта выездов</span>
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'available', 'en_route', 'on_site'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'available' ? 'Свободны' : f === 'en_route' ? 'В пути' : 'На объекте'}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={handleAutoDispatch} className="gap-1.5">
          <Zap className="w-4 h-4" />
          Авторасстановка
        </Button>
      </div>

      {/* KPI bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          <span className="text-gray-600">Свободны:</span>
          <span className="font-semibold text-gray-800">{availableCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
          <span className="text-gray-600">В пути:</span>
          <span className="font-semibold text-gray-800">{enRouteCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span className="text-gray-600">На объекте:</span>
          <span className="font-semibold text-gray-800">{onSiteCount}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-4 border-l pl-4">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-gray-600">Открытых нарядов:</span>
          <span className="font-semibold text-gray-800">{openOrdersCount}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel — engineer list */}
        <div className="w-56 bg-white border-r flex flex-col overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
            Инженеры
          </div>
          {filteredEngineers.map(eng => (
            <button
              key={eng.id}
              onClick={() => handleEngineerClick(eng.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                selectedEngineer === eng.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: STATUS_COLOR[eng.status] }}
              >
                {eng.initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{eng.name}</div>
                <div className="text-xs text-gray-500">{STATUS_LABEL[eng.status]}</div>
              </div>
            </button>
          ))}
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-t mt-1">
            Наряды
          </div>
          {WORK_ORDERS.map(order => (
            <button
              key={order.id}
              onClick={() => handleOrderClick(order.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                selectedOrder === order.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
              }`}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0 rotate-45"
                style={{ backgroundColor: PRIORITY_COLOR[order.priority] }}
              />
              <div className="min-w-0">
                <div className="text-xs font-medium text-gray-800 truncate">{order.number}</div>
                <div className="text-xs text-gray-500 truncate">{order.client}</div>
              </div>
            </button>
          ))}
        </div>

        {/* SVG Map */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="w-full h-full max-h-[520px] rounded-lg shadow-inner"
            style={{ background: '#e8ecf0' }}
          >
            {/* City background blocks */}
            <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#dde3ea" rx="8" />

            {/* City blocks */}
            <rect x="30" y="20" width="90" height="70" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="140" y="15" width="120" height="55" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="280" y="25" width="80" height="65" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="380" y="10" width="100" height="80" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="500" y="20" width="85" height="60" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="30" y="120" width="100" height="90" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="150" y="110" width="140" height="100" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="310" y="115" width="90" height="85" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="420" y="105" width="160" height="110" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="20" y="240" width="110" height="100" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="150" y="235" width="130" height="95" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="300" y="230" width="100" height="105" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="420" y="240" width="150" height="90" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="30" y="355" width="120" height="55" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="170" y="355" width="100" height="55" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="290" y="355" width="130" height="55" fill="#c8d0da" rx="3" opacity="0.7" />
            <rect x="440" y="355" width="140" height="55" fill="#c8d0da" rx="3" opacity="0.7" />

            {/* Roads — horizontal */}
            <path d={`M 0 100 H ${MAP_W}`} stroke="#b0bec5" strokeWidth="8" fill="none" />
            <path d={`M 0 100 H ${MAP_W}`} stroke="#cfd8dc" strokeWidth="6" fill="none" />
            <path d={`M 0 220 H ${MAP_W}`} stroke="#b0bec5" strokeWidth="8" fill="none" />
            <path d={`M 0 220 H ${MAP_W}`} stroke="#cfd8dc" strokeWidth="6" fill="none" />
            <path d={`M 0 340 H ${MAP_W}`} stroke="#b0bec5" strokeWidth="6" fill="none" />
            <path d={`M 0 340 H ${MAP_W}`} stroke="#cfd8dc" strokeWidth="4" fill="none" />
            {/* Roads — vertical */}
            <path d={`M 130 0 V ${MAP_H}`} stroke="#b0bec5" strokeWidth="8" fill="none" />
            <path d={`M 130 0 V ${MAP_H}`} stroke="#cfd8dc" strokeWidth="6" fill="none" />
            <path d={`M 300 0 V ${MAP_H}`} stroke="#b0bec5" strokeWidth="8" fill="none" />
            <path d={`M 300 0 V ${MAP_H}`} stroke="#cfd8dc" strokeWidth="6" fill="none" />
            <path d={`M 480 0 V ${MAP_H}`} stroke="#b0bec5" strokeWidth="6" fill="none" />
            <path d={`M 480 0 V ${MAP_H}`} stroke="#cfd8dc" strokeWidth="4" fill="none" />
            {/* Diagonal road */}
            <path d={`M 0 300 Q 200 200 ${MAP_W} 120`} stroke="#b0bec5" strokeWidth="6" fill="none" />
            <path d={`M 0 300 Q 200 200 ${MAP_W} 120`} stroke="#cfd8dc" strokeWidth="4" fill="none" />

            {/* Road dashes */}
            <path d={`M 0 100 H ${MAP_W}`} stroke="white" strokeWidth="1.5" strokeDasharray="20 15" fill="none" opacity="0.5" />
            <path d={`M 0 220 H ${MAP_W}`} stroke="white" strokeWidth="1.5" strokeDasharray="20 15" fill="none" opacity="0.5" />
            <path d={`M 130 0 V ${MAP_H}`} stroke="white" strokeWidth="1.5" strokeDasharray="20 15" fill="none" opacity="0.5" />
            <path d={`M 300 0 V ${MAP_H}`} stroke="white" strokeWidth="1.5" strokeDasharray="20 15" fill="none" opacity="0.5" />

            {/* Green areas */}
            <ellipse cx="220" cy="310" rx="30" ry="20" fill="#a5d6a7" opacity="0.5" />
            <ellipse cx="430" cy="185" rx="20" ry="15" fill="#a5d6a7" opacity="0.5" />

            {/* Connect lines from engineer to their order */}
            {ENGINEERS.filter(e => e.currentOrder).map(eng => {
              const order = WORK_ORDERS.find(o => o.id === eng.currentOrder);
              if (!order) return null;
              const ex = toSvg(eng.position.x, MAP_W);
              const ey = toSvg(eng.position.y, MAP_H);
              const ox = toSvg(order.position.x, MAP_W);
              const oy = toSvg(order.position.y, MAP_H);
              return (
                <line
                  key={eng.id}
                  x1={ex} y1={ey} x2={ox} y2={oy}
                  stroke={STATUS_COLOR[eng.status]}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.7"
                />
              );
            })}

            {/* Work order markers */}
            {WORK_ORDERS.map(order => {
              const x = toSvg(order.position.x, MAP_W);
              const y = toSvg(order.position.y, MAP_H);
              const color = PRIORITY_COLOR[order.priority];
              const isSelected = selectedOrder === order.id;
              const size = isSelected ? 14 : 10;
              return (
                <g
                  key={order.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOrderClick(order.id)}
                >
                  <rect
                    x={-size / 2} y={-size / 2}
                    width={size} height={size}
                    fill={color}
                    stroke="white"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    rx="2"
                    transform="rotate(45)"
                  />
                  {isSelected && (
                    <circle cx="0" cy="0" r={size + 4} fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
                  )}
                  <text x="0" y={-size - 4} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">
                    {order.number.split('-').pop()}
                  </text>
                </g>
              );
            })}

            {/* Engineer markers */}
            {ENGINEERS.map(eng => {
              const x = toSvg(eng.position.x, MAP_W);
              const y = toSvg(eng.position.y, MAP_H);
              const color = STATUS_COLOR[eng.status];
              const isSelected = selectedEngineer === eng.id;
              const r = isSelected ? 18 : 14;
              return (
                <g
                  key={eng.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleEngineerClick(eng.id)}
                >
                  {isSelected && (
                    <circle cx="0" cy="0" r={r + 6} fill={color} opacity="0.2" />
                  )}
                  <circle cx="0" cy="0" r={r} fill={color} stroke="white" strokeWidth={isSelected ? 3 : 2} />
                  <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">
                    {eng.initials}
                  </text>
                  {eng.status === 'en_route' && (
                    <polygon points="0,-22 4,-14 -4,-14" fill={color} stroke="white" strokeWidth="1" />
                  )}
                </g>
              );
            })}

            {/* Legend */}
            <g transform={`translate(8, ${MAP_H - 70})`}>
              <rect x="0" y="0" width="120" height="65" fill="white" rx="4" opacity="0.9" />
              <circle cx="12" cy="12" r="6" fill="#22c55e" />
              <text x="22" y="16" fontSize="9" fill="#374151">Свободен</text>
              <circle cx="12" cy="28" r="6" fill="#f59e0b" />
              <text x="22" y="32" fontSize="9" fill="#374151">В пути</text>
              <circle cx="12" cy="44" r="6" fill="#ef4444" />
              <text x="22" y="48" fontSize="9" fill="#374151">На объекте</text>
              <rect x="60" y="6" width="8" height="8" fill="#3b82f6" rx="1" transform="rotate(45 64 10)" />
              <text x="72" y="14" fontSize="9" fill="#374151">Обычный</text>
              <rect x="60" y="22" width="8" height="8" fill="#f97316" rx="1" transform="rotate(45 64 26)" />
              <text x="72" y="30" fontSize="9" fill="#374151">Срочный</text>
              <rect x="60" y="38" width="8" height="8" fill="#ef4444" rx="1" transform="rotate(45 64 42)" />
              <text x="72" y="46" fontSize="9" fill="#374151">Аварийный</text>
            </g>
          </svg>
        </div>

        {/* Right detail panel */}
        <div className="w-72 bg-white border-l flex flex-col overflow-y-auto">
          {selectedEngineerData ? (
            <div className="flex flex-col gap-0">
              <div className="px-4 py-3 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: STATUS_COLOR[selectedEngineerData.status] }}
                  >
                    {selectedEngineerData.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{selectedEngineerData.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: STATUS_COLOR[selectedEngineerData.status] }}
                      />
                      <span className="text-xs text-gray-500">{STATUS_LABEL[selectedEngineerData.status]}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-b space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedEngineerData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span>Транспорт: {selectedEngineerData.vehicle}</span>
                </div>
              </div>

              {selectedEngineerData.currentOrder && (() => {
                const order = WORK_ORDERS.find(o => o.id === selectedEngineerData.currentOrder);
                if (!order) return null;
                return (
                  <div className="px-4 py-3 border-b">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Текущий наряд</div>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                      <div className="font-medium text-sm text-blue-600">{order.number}</div>
                      <div className="text-sm text-gray-700">{order.client}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {order.address}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        ETA: {order.eta}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span
                          className="px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: PRIORITY_COLOR[order.priority] }}
                        >
                          {PRIORITY_LABEL[order.priority]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="px-4 py-3 border-b">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Сегодня</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                    <div className="text-xl font-bold text-blue-700">{selectedEngineerData.ordersToday}</div>
                    <div className="text-xs text-blue-600">нарядов</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2.5 text-center">
                    <div className="text-xl font-bold text-green-700">{selectedEngineerData.distanceKm}</div>
                    <div className="text-xs text-green-600">км пробег</div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 space-y-2">
                <Button size="sm" className="w-full gap-1.5" variant="outline">
                  <Phone className="w-3.5 h-3.5" />
                  Позвонить
                </Button>
                <Button size="sm" className="w-full gap-1.5" variant="outline">
                  <Navigation className="w-3.5 h-3.5" />
                  Назначить наряд
                </Button>
              </div>
            </div>
          ) : selectedOrderData ? (
            <div className="flex flex-col gap-0">
              <div className="px-4 py-3 border-b bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-sm rotate-45 flex-shrink-0"
                    style={{ backgroundColor: PRIORITY_COLOR[selectedOrderData.priority] }}
                  />
                  <span className="font-semibold text-sm text-blue-600">{selectedOrderData.number}</span>
                </div>
                <div className="font-medium text-gray-800">{selectedOrderData.client}</div>
                <div
                  className="mt-1 inline-block px-2 py-0.5 rounded-full text-xs text-white font-medium"
                  style={{ backgroundColor: PRIORITY_COLOR[selectedOrderData.priority] }}
                >
                  {PRIORITY_LABEL[selectedOrderData.priority]}
                </div>
              </div>
              <div className="px-4 py-3 border-b space-y-2.5">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{selectedOrderData.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  <span>{selectedOrderData.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>ETA: <span className="font-medium">{selectedOrderData.eta}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{selectedOrderData.engineer ?? <span className="text-orange-500 font-medium">Не назначен</span>}</span>
                </div>
              </div>
              <div className="px-4 py-3 border-b">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Статус</div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                  {selectedOrderData.status}
                </span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <Button size="sm" className="w-full gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Назначить инженера
                </Button>
                <Button size="sm" className="w-full gap-1.5" variant="outline">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Открыть наряд
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-3 px-6 text-center">
              <MapPin className="w-10 h-10 text-gray-200" />
              <p className="text-sm">Выберите инженера или наряд на карте для просмотра деталей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
