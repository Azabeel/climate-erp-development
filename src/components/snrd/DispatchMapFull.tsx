import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type EngStatus = 'en_route' | 'on_site' | 'available' | 'break';
type OrderStatus = 'in_progress' | 'en_route' | 'new' | 'delayed' | 'completed';

interface Engineer {
  id: string;
  name: string;
  initials: string;
  color: string;
  status: EngStatus;
  phone: string;
  address: string;
  ordersCount: number;
  currentOrder: string | null;
  nextOrder: string | null;
  eta: string | null;
  svgX: number;
  svgY: number;
}

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  address: string;
  engineerId: string | null;
  status: OrderStatus;
  time: string;
  svgX: number;
  svgY: number;
}

interface Tooltip {
  visible: boolean;
  x: number;
  y: number;
  name: string;
  status: EngStatus;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  {
    id: 'e1', name: 'Козлов Михаил', initials: 'КМ', color: '#3b82f6',
    status: 'en_route', phone: '+7 916 234-56-78',
    address: 'Ленинградский пр., 45', ordersCount: 3,
    currentOrder: 'WO-2026-000112', nextOrder: 'WO-2026-000118', eta: '14:30',
    svgX: 340, svgY: 155,
  },
  {
    id: 'e2', name: 'Петров Сергей', initials: 'ПС', color: '#10b981',
    status: 'on_site', phone: '+7 903 345-67-89',
    address: 'ул. Арбат, 20', ordersCount: 2,
    currentOrder: 'WO-2026-000108', nextOrder: null, eta: null,
    svgX: 430, svgY: 285,
  },
  {
    id: 'e3', name: 'Иванов Кирилл', initials: 'ИК', color: '#f59e0b',
    status: 'available', phone: '+7 925 456-78-90',
    address: 'Варшавское ш., 12', ordersCount: 1,
    currentOrder: null, nextOrder: 'WO-2026-000120', eta: '15:00',
    svgX: 460, svgY: 410,
  },
  {
    id: 'e4', name: 'Сидоров Николай', initials: 'СН', color: '#ef4444',
    status: 'on_site', phone: '+7 977 567-89-01',
    address: 'Дмитровское ш., 88', ordersCount: 2,
    currentOrder: 'WO-2026-000115', nextOrder: null, eta: null,
    svgX: 490, svgY: 130,
  },
  {
    id: 'e5', name: 'Фролов Алексей', initials: 'ФА', color: '#8b5cf6',
    status: 'break', phone: '+7 985 678-90-12',
    address: 'Можайское ш., 5', ordersCount: 1,
    currentOrder: null, nextOrder: 'WO-2026-000121', eta: '15:45',
    svgX: 225, svgY: 325,
  },
  {
    id: 'e6', name: 'Морозов Дмитрий', initials: 'МД', color: '#ec4899',
    status: 'en_route', phone: '+7 999 123-45-67',
    address: 'Рязанский пр., 30', ordersCount: 3,
    currentOrder: 'WO-2026-000103', nextOrder: 'WO-2026-000117', eta: '16:00',
    svgX: 625, svgY: 370,
  },
  {
    id: 'e7', name: 'Орлов Павел', initials: 'ОП', color: '#06b6d4',
    status: 'available', phone: '+7 901 234-56-78',
    address: 'Новорижское ш., 1', ordersCount: 0,
    currentOrder: null, nextOrder: null, eta: null,
    svgX: 155, svgY: 195,
  },
];

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1', number: 'WO-2026-000112', client: 'ТЦ Европейский',
    address: 'Киевская ул., 2', engineerId: 'e1', status: 'en_route',
    time: '14:30', svgX: 375, svgY: 115,
  },
  {
    id: 'wo2', number: 'WO-2026-000108', client: 'Сбербанк офис',
    address: 'ул. Арбат, 18', engineerId: 'e2', status: 'in_progress',
    time: '11:30', svgX: 405, svgY: 265,
  },
  {
    id: 'wo3', number: 'WO-2026-000115', client: 'ТЦ Алтуфьево',
    address: 'Дмитровское ш., 90', engineerId: 'e4', status: 'in_progress',
    time: '13:00', svgX: 525, svgY: 100,
  },
  {
    id: 'wo4', number: 'WO-2026-000103', client: 'Медцентр Здоровье',
    address: 'Рязанский пр., 28', engineerId: 'e6', status: 'en_route',
    time: '15:30', svgX: 660, svgY: 345,
  },
  {
    id: 'wo5', number: 'WO-2026-000120', client: 'БЦ Нагатино',
    address: 'Варшавское ш., 9', engineerId: null, status: 'new',
    time: '17:00', svgX: 490, svgY: 445,
  },
];

const STATUS_BADGE: Record<EngStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  en_route:  { label: 'В пути',     variant: 'default' },
  on_site:   { label: 'На объекте', variant: 'destructive' },
  available: { label: 'Свободен',   variant: 'secondary' },
  break:     { label: 'Перерыв',    variant: 'outline' },
};

const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  in_progress: '#10b981',
  en_route:    '#f59e0b',
  new:         '#6366f1',
  delayed:     '#ef4444',
  completed:   '#9ca3af',
};

const DISTRICTS = [
  { label: 'ЦАО',  x: 440, y: 270 },
  { label: 'СЗАО', x: 220, y: 170 },
  { label: 'САО',  x: 450, y: 120 },
  { label: 'СВАО', x: 620, y: 155 },
  { label: 'ВАО',  x: 660, y: 310 },
  { label: 'ЮВАО', x: 595, y: 430 },
  { label: 'ЮАО',  x: 430, y: 470 },
  { label: 'ЮЗАО', x: 265, y: 430 },
  { label: 'ЗАО',  x: 220, y: 310 },
];

// ─── Helper components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EngStatus }) {
  const { label, variant } = STATUS_BADGE[status];
  return <Badge variant={variant} className="text-xs">{label}</Badge>;
}

// ─── SVG Map ─────────────────────────────────────────────────────────────────

interface MapProps {
  engineers: Engineer[];
  orders: WorkOrder[];
  selectedId: string | null;
  onSelectEngineer: (id: string) => void;
}

function MoscowMap({ engineers, orders, selectedId, onSelectEngineer }: MapProps) {
  const [tooltip, setTooltip] = useState<Tooltip>({
    visible: false, x: 0, y: 0, name: '', status: 'available',
  });

  const handleEngMouseEnter = (e: React.MouseEvent<SVGCircleElement>, eng: Engineer) => {
    const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const svgW = 900, svgH = 600;
    const scaleX = rect.width / svgW;
    const scaleY = rect.height / svgH;
    setTooltip({
      visible: true,
      x: eng.svgX * scaleX,
      y: (eng.svgY - 28) * scaleY,
      name: eng.name,
      status: eng.status,
    });
  };

  const handleEngMouseLeave = () => setTooltip(t => ({ ...t, visible: false }));

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 900 600"
        className="w-full h-full"
        style={{ background: '#f0f0f0' }}
      >
        {/* ── Водные объекты (Москва-река — схематично) ── */}
        <path d="M 180 330 Q 300 350 390 310 Q 450 290 510 320 Q 580 355 650 340"
          fill="none" stroke="#bfdbfe" strokeWidth="8" strokeLinecap="round" />

        {/* ── МКАД — большой эллипс ── */}
        <ellipse cx="450" cy="295" rx="360" ry="250"
          fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 3" />

        {/* ── ТТК — средний эллипс ── */}
        <ellipse cx="450" cy="290" rx="200" ry="148"
          fill="none" stroke="#cbd5e1" strokeWidth="2.5" />

        {/* ── Садовое кольцо — маленький эллипс ── */}
        <ellipse cx="450" cy="285" rx="95" ry="72"
          fill="none" stroke="#e2e8f0" strokeWidth="2" />

        {/* ── Радиальные дороги ── */}
        {/* Ленинградка — СЗ */}
        <line x1="410" y1="245" x2="170" y2="60"  stroke="#d1d5db" strokeWidth="2.5" />
        {/* Ярославка — СВ */}
        <line x1="490" y1="218" x2="680" y2="50"  stroke="#d1d5db" strokeWidth="2.5" />
        {/* Рязанка — В */}
        <line x1="546" y1="295" x2="810" y2="310" stroke="#d1d5db" strokeWidth="2.5" />
        {/* Варшавка — Ю */}
        <line x1="450" y1="357" x2="450" y2="555" stroke="#d1d5db" strokeWidth="2.5" />
        {/* Можайка — З */}
        <line x1="354" y1="295" x2="92"  y2="295" stroke="#d1d5db" strokeWidth="2.5" />
        {/* Дмитровка — С */}
        <line x1="450" y1="218" x2="450" y2="46"  stroke="#d1d5db" strokeWidth="2.5" />

        {/* ── Подписи колец ── */}
        <text x="814" y="292" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">МКАД</text>
        <text x="654" y="218" fontSize="9"  fill="#94a3b8" fontFamily="sans-serif">ТТК</text>
        <text x="550" y="245" fontSize="8"  fill="#94a3b8" fontFamily="sans-serif">СК</text>

        {/* ── Районы ── */}
        {DISTRICTS.map(d => (
          <g key={d.label}>
            <circle cx={d.x} cy={d.y} r="26" fill="white" fillOpacity="0.55" stroke="#e2e8f0" strokeWidth="1" />
            <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="sans-serif" fontWeight="600">
              {d.label}
            </text>
          </g>
        ))}

        {/* ── Маршрутные линии (инженер → его объект) ── */}
        {engineers.map(eng => {
          const order = orders.find(o => o.engineerId === eng.id);
          if (!order) return null;
          return (
            <line
              key={`route-${eng.id}`}
              x1={eng.svgX} y1={eng.svgY}
              x2={order.svgX} y2={order.svgY}
              stroke={eng.color}
              strokeWidth="1.5"
              strokeDasharray="5 4"
              opacity="0.6"
            />
          );
        })}

        {/* ── Маркеры объектов (квадраты) ── */}
        {orders.map(order => (
          <g key={order.id}>
            <rect
              x={order.svgX - 9} y={order.svgY - 9}
              width="18" height="18" rx="3"
              fill={ORDER_STATUS_COLOR[order.status]}
              stroke="white" strokeWidth="1.5"
              opacity="0.9"
            />
            <text
              x={order.svgX} y={order.svgY + 4}
              textAnchor="middle" fontSize="9"
              fill="white" fontFamily="sans-serif" fontWeight="700"
            >
              {order.status === 'new' ? '!' : '▶'}
            </text>
          </g>
        ))}

        {/* ── Маркеры инженеров (кружки с инициалами) ── */}
        {engineers.map(eng => (
          <g
            key={eng.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectEngineer(eng.id)}
          >
            {selectedId === eng.id && (
              <circle
                cx={eng.svgX} cy={eng.svgY} r="22"
                fill="none" stroke={eng.color} strokeWidth="2.5" opacity="0.4"
              />
            )}
            <circle
              cx={eng.svgX} cy={eng.svgY} r="16"
              fill={eng.color}
              stroke="white" strokeWidth="2"
              onMouseEnter={e => handleEngMouseEnter(e, eng)}
              onMouseLeave={handleEngMouseLeave}
            />
            <text
              x={eng.svgX} y={eng.svgY + 4}
              textAnchor="middle" fontSize="9"
              fill="white" fontFamily="sans-serif" fontWeight="700"
              style={{ pointerEvents: 'none' }}
            >
              {eng.initials}
            </text>
            {/* Индикатор статуса */}
            <circle
              cx={eng.svgX + 11} cy={eng.svgY - 11} r="5"
              fill={
                eng.status === 'on_site'   ? '#ef4444' :
                eng.status === 'en_route'  ? '#f59e0b' :
                eng.status === 'available' ? '#22c55e' : '#9ca3af'
              }
              stroke="white" strokeWidth="1.5"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        ))}
      </svg>

      {/* ── SVG tooltip (абсолютный, поверх svg) ── */}
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap"
          style={{ left: tooltip.x + 8, top: tooltip.y }}
        >
          <div className="font-semibold">{tooltip.name}</div>
          <div className="text-gray-300">{STATUS_BADGE[tooltip.status].label}</div>
        </div>
      )}

      {/* ── Легенда ── */}
      <div className="absolute bottom-2 left-2 bg-white/90 rounded p-2 text-xs space-y-1 border border-gray-200">
        <div className="font-semibold text-gray-600 mb-1">Статус объекта</div>
        {(['in_progress', 'en_route', 'new'] as OrderStatus[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: ORDER_STATUS_COLOR[s] }} />
            <span className="text-gray-500">
              {s === 'in_progress' ? 'В работе' : s === 'en_route' ? 'Едет инженер' : 'Новый'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Left panel ───────────────────────────────────────────────────────────────

interface LeftPanelProps {
  engineers: Engineer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

function LeftPanel({ engineers, selectedId, onSelect, search, onSearch }: LeftPanelProps) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white h-full">
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="font-semibold text-sm text-gray-700 mb-2">Инженеры на смене</div>
        <Input
          placeholder="Поиск инженера..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {engineers
          .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
          .map(eng => (
            <div
              key={eng.id}
              className={`px-3 py-2.5 border-b border-gray-50 cursor-pointer transition-colors ${
                selectedId === eng.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(eng.id)}
            >
              <div className="flex items-start gap-2">
                {/* Аватар */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: eng.color }}
                >
                  {eng.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-gray-800 truncate">{eng.name}</span>
                    <StatusBadge status={eng.status} />
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{eng.address}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    <span className="font-medium">{eng.ordersCount}</span> нарядов
                    {eng.currentOrder && (
                      <span className="ml-1 text-gray-400">· {eng.currentOrder}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full h-6 text-xs"
                onClick={e => {
                  e.stopPropagation();
                  toast.success(`Назначение наряда инженеру ${eng.name}`);
                }}
              >
                <Icon name="Plus" size={11} className="mr-1" />
                Назначить наряд
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────

interface RightPanelProps {
  engineer: Engineer | null;
  orders: WorkOrder[];
}

function RightPanel({ engineer, orders }: RightPanelProps) {
  if (!engineer) {
    return (
      <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
        <Icon name="MapPin" size={32} className="text-gray-300" />
        <span>Выберите инженера на карте</span>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.engineerId === engineer.id);

  return (
    <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col h-full overflow-y-auto">
      {/* Заголовок */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: engineer.color }}
          >
            {engineer.initials}
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-800">{engineer.name}</div>
            <StatusBadge status={engineer.status} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
          <Icon name="Phone" size={12} />
          <span>{engineer.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
          <Icon name="MapPin" size={12} />
          <span className="truncate">{engineer.address}</span>
        </div>
      </div>

      {/* Текущий наряд */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-600 mb-2">Текущий наряд</div>
        {engineer.currentOrder ? (
          <div className="bg-blue-50 rounded p-2 text-xs space-y-1">
            <div className="font-semibold text-blue-700">{engineer.currentOrder}</div>
            {activeOrders[0] && (
              <>
                <div className="text-gray-600">{activeOrders[0].client}</div>
                <div className="text-gray-500 truncate">{activeOrders[0].address}</div>
              </>
            )}
            {engineer.eta && (
              <div className="flex items-center gap-1 text-blue-600">
                <Icon name="Clock" size={11} />
                <span>ETA: {engineer.eta}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">Нет активного наряда</div>
        )}
      </div>

      {/* Следующий наряд */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-600 mb-2">Следующий наряд</div>
        {engineer.nextOrder ? (
          <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
            <div className="font-semibold text-gray-700">{engineer.nextOrder}</div>
            {engineer.eta && (
              <div className="flex items-center gap-1 text-gray-500">
                <Icon name="Clock" size={11} />
                <span>Плановое время: {engineer.eta}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">Нет следующего наряда</div>
        )}
      </div>

      {/* Активные наряды */}
      <div className="px-3 py-3 flex-1">
        <div className="text-xs font-semibold text-gray-600 mb-2">
          Наряды сегодня ({activeOrders.length})
        </div>
        <div className="space-y-2">
          {activeOrders.length === 0 && (
            <div className="text-xs text-gray-400 italic">Нарядов нет</div>
          )}
          {activeOrders.map(order => (
            <div key={order.id} className="border border-gray-100 rounded p-2 text-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">{order.number}</span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: ORDER_STATUS_COLOR[order.status] }}
                />
              </div>
              <div className="text-gray-600">{order.client}</div>
              <div className="text-gray-400 truncate">{order.address}</div>
              <div className="text-gray-400">{order.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs"
          onClick={() => toast.success(`Звонок ${engineer.name}: ${engineer.phone}`)}
        >
          <Icon name="Phone" size={13} className="mr-1.5" />
          Позвонить
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs"
          onClick={() => toast.info(`Переназначение нарядов инженера ${engineer.name}`)}
        >
          <Icon name="RefreshCw" size={13} className="mr-1.5" />
          Переназначить
        </Button>
      </div>
    </div>
  );
}

// ─── Bottom stats ─────────────────────────────────────────────────────────────

function BottomStats({ engineers, orders }: { engineers: Engineer[]; orders: WorkOrder[] }) {
  const onShift    = engineers.length;
  const active     = orders.filter(o => ['in_progress', 'en_route'].includes(o.status)).length;
  const free       = engineers.filter(e => e.status === 'available').length;
  const enRoute    = engineers.filter(e => e.status === 'en_route').length;
  const slaViolated = orders.filter(o => o.status === 'delayed').length;

  const stats = [
    { label: 'Инженеров на смене', value: onShift,     icon: 'Users',         color: 'text-blue-600' },
    { label: 'Активных нарядов',   value: active,      icon: 'ClipboardList', color: 'text-green-600' },
    { label: 'Свободных',          value: free,        icon: 'CheckCircle',   color: 'text-emerald-600' },
    { label: 'В пути',             value: enRoute,     icon: 'Navigation',    color: 'text-amber-600' },
    { label: 'Просрочено SLA',     value: slaViolated, icon: 'AlertTriangle', color: 'text-red-600' },
  ];

  return (
    <div className="flex gap-3 px-3 py-2 border-t border-gray-200 bg-white flex-shrink-0">
      {stats.map(s => (
        <Card key={s.label} className="flex-1 px-3 py-2 flex items-center gap-2 min-w-0">
          <Icon name={s.icon as any} size={16} className={s.color} />
          <div className="min-w-0">
            <div className="text-lg font-bold text-gray-800 leading-none">{s.value}</div>
            <div className="text-xs text-gray-400 truncate mt-0.5">{s.label}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function DispatchMapFull() {
  const [selectedEngId, setSelectedEngId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const selectedEng = ENGINEERS.find(e => e.id === selectedEngId) ?? null;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="Map" size={18} className="text-blue-600" />
          <span className="font-semibold text-gray-800">Карта диспетчера</span>
          <Badge variant="secondary" className="text-xs">Live</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Icon name="RefreshCw" size={13} />
          <span>Обновлено 13:47</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          engineers={ENGINEERS}
          selectedId={selectedEngId}
          onSelect={id => setSelectedEngId(prev => prev === id ? null : id)}
          search={search}
          onSearch={setSearch}
        />

        {/* Map center */}
        <div className="flex-1 relative overflow-hidden bg-gray-100">
          <MoscowMap
            engineers={ENGINEERS}
            orders={WORK_ORDERS}
            selectedId={selectedEngId}
            onSelectEngineer={id => setSelectedEngId(prev => prev === id ? null : id)}
          />
        </div>

        <RightPanel engineer={selectedEng} orders={WORK_ORDERS} />
      </div>

      {/* Bottom stats */}
      <BottomStats engineers={ENGINEERS} orders={WORK_ORDERS} />
    </div>
  );
}
