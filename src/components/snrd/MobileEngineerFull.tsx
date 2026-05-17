import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'Новый' | 'В пути' | 'На месте' | 'Выполнен';
type OrderType   = 'Ремонт' | 'ТО' | 'Монтаж' | 'Гарантия';

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  address: string;
  type: OrderType;
  time: string;
  status: OrderStatus;
}

interface StockItem {
  sku: string;
  name: string;
  qty: number;
  unit: string;
}

interface RoutePoint {
  label: string;
  address: string;
  distance: string;
  order: number;
  x: number;
  y: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1',
    number: 'WO-2026-000341',
    client: 'ООО «Полярный экспресс»',
    address: 'ул. Ленина, 42, оф. 301',
    type: 'Ремонт',
    time: '09:00 – 11:00',
    status: 'В пути',
  },
  {
    id: 'wo2',
    number: 'WO-2026-000342',
    client: 'Иванова Светлана Викторовна',
    address: 'пр. Мира, 15, кв. 88',
    type: 'ТО',
    time: '12:00 – 13:30',
    status: 'Новый',
  },
  {
    id: 'wo3',
    number: 'WO-2026-000344',
    client: 'ИП Громов Р.С.',
    address: 'Промышленная ул., 7, склад 2',
    type: 'Монтаж',
    time: '15:00 – 18:00',
    status: 'Новый',
  },
];

const STOCK_ITEMS: StockItem[] = [
  { sku: 'FLT-001',  name: 'Фильтр-осушитель R-410A',     qty: 4,   unit: 'шт' },
  { sku: 'CAP-M10',  name: 'Конденсатор пусковой 10 мкФ', qty: 2,   unit: 'шт' },
  { sku: 'RFR-R410', name: 'Хладагент R-410A (баллон)',    qty: 1,   unit: 'шт' },
  { sku: 'BLT-6PJ',  name: 'Ремень приводной 6PJ-660',    qty: 3,   unit: 'шт' },
  { sku: 'VLV-EXP',  name: 'Клапан расширительный TXV',   qty: 1,   unit: 'шт' },
  { sku: 'SNS-NTC',  name: 'Датчик температуры NTC 10K',  qty: 6,   unit: 'шт' },
  { sku: 'FAN-230V', name: 'Вентилятор осевой 230В 35Вт', qty: 2,   unit: 'шт' },
  { sku: 'COP-PAS',  name: 'Прокладка компрессора (к-т)', qty: 2,   unit: 'к-т' },
  { sku: 'INS-13MM', name: 'Теплоизоляция труб 13 мм',    qty: 10,  unit: 'м' },
  { sku: 'SCR-M4X',  name: 'Саморезы М4×20 (упак.)',      qty: 3,   unit: 'уп' },
];

const ROUTE_POINTS: RoutePoint[] = [
  { label: 'A', order: 1, address: 'База — Гаражный пер., 3',        distance: '—',     x: 150, y: 40  },
  { label: 'B', order: 2, address: 'ул. Ленина, 42 (WO-000341)',     distance: '12 км', x: 80,  y: 160 },
  { label: 'C', order: 3, address: 'пр. Мира, 15 (WO-000342)',       distance: '9 км',  x: 220, y: 240 },
  { label: 'D', order: 4, address: 'Промышленная ул., 7 (WO-000344)', distance: '13 км', x: 150, y: 350 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Новый:    'secondary',
  'В пути': 'default',
  'На месте': 'outline',
  Выполнен: 'outline',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  Новый:      'bg-slate-100 text-slate-700',
  'В пути':   'bg-blue-100 text-blue-700',
  'На месте': 'bg-amber-100 text-amber-700',
  Выполнен:   'bg-green-100 text-green-700',
};

const TYPE_ICON: Record<OrderType, string> = {
  Ремонт:   'Wrench',
  ТО:       'Settings',
  Монтаж:   'Hammer',
  Гарантия: 'ShieldCheck',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className="flex items-center justify-between bg-gray-900 text-white text-xs px-4 py-1.5 rounded-t-3xl">
      <span className="font-medium">09:41</span>
      <div className="flex items-center gap-1.5">
        <Icon name="Signal" size={12} />
        <Icon name="Wifi" size={12} />
        <Icon name="Battery" size={12} />
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onSelect,
}: {
  order: WorkOrder;
  onSelect: (o: WorkOrder) => void;
}) {
  return (
    <Card
      className="p-3 mb-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
      onClick={() => onSelect(order)}
    >
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-xs font-mono text-gray-400">{order.number}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
          {order.status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon name={TYPE_ICON[order.type]} size={13} className="text-blue-500 shrink-0" />
        <span className="text-sm font-semibold text-gray-800 truncate">{order.client}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
        <Icon name="MapPin" size={11} className="shrink-0" />
        <span className="truncate">{order.address}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Icon name="Clock" size={11} className="shrink-0" />
        <span>{order.time}</span>
        <Badge variant="outline" className="ml-auto text-[10px] py-0 h-4">{order.type}</Badge>
      </div>
    </Card>
  );
}

function OrderDetail({
  order,
  onBack,
  onStatusChange,
}: {
  order: WorkOrder;
  onBack: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const actions: { label: string; status: OrderStatus; icon: string; color: string }[] = [
    { label: 'Выехал',    status: 'В пути',   icon: 'Car',       color: 'bg-blue-500 hover:bg-blue-600 text-white' },
    { label: 'На месте',  status: 'На месте', icon: 'Navigation', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
    { label: 'Завершить', status: 'Выполнен', icon: 'CheckCircle', color: 'bg-green-500 hover:bg-green-600 text-white' },
  ];

  return (
    <div>
      <button
        className="flex items-center gap-1 text-blue-600 text-sm mb-3"
        onClick={onBack}
      >
        <Icon name="ChevronLeft" size={16} />
        Назад
      </button>
      <Card className="p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-gray-400">{order.number}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
            {order.status}
          </span>
        </div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">{order.client}</h3>
        <div className="space-y-1.5 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Icon name="MapPin" size={12} className="text-gray-400" />
            {order.address}
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="Clock" size={12} className="text-gray-400" />
            {order.time}
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name={TYPE_ICON[order.type]} size={12} className="text-gray-400" />
            {order.type}
          </div>
        </div>
        <div className="space-y-2">
          {actions.map(({ label, status, icon, color }) => (
            <button
              key={status}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${color}`}
              onClick={() => {
                onStatusChange(order.id, status);
                toast.success(`Статус наряда изменён: «${status}»`);
              }}
            >
              <Icon name={icon} size={15} />
              {label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Screen: Мои наряды ───────────────────────────────────────────────────────

function OrdersScreen() {
  const [orders, setOrders] = useState<WorkOrder[]>(WORK_ORDERS);
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [dayStarted, setDayStarted] = useState(false);

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
    setSelected(prev => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  return (
    <div className="p-4">
      {!selected ? (
        <>
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-800">Доброе утро, Иванов А.!</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Сегодня {orders.length} наряда · {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}
            </p>
          </div>

          {!dayStarted && (
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              onClick={() => {
                setDayStarted(true);
                toast.success('GPS активирован. Маршрут построен!');
              }}
            >
              <Icon name="Play" size={15} />
              Начать день
            </button>
          )}

          {dayStarted && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4">
              <Icon name="Navigation" size={14} className="text-green-600" />
              <span className="text-xs text-green-700 font-medium">GPS активен · Маршрут построен</span>
            </div>
          )}

          <div>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onSelect={setSelected} />
            ))}
          </div>
        </>
      ) : (
        <OrderDetail
          order={selected}
          onBack={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// ─── Screen: Маршрут ──────────────────────────────────────────────────────────

function RouteScreen() {
  const pointColors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="p-4">
      <h2 className="text-base font-bold text-gray-800 mb-3">Маршрут на сегодня</h2>

      {/* SVG map */}
      <Card className="p-2 mb-4 border border-gray-100 bg-gray-50">
        <svg viewBox="0 0 300 400" className="w-full" style={{ height: 220 }}>
          {/* Background grid lines */}
          {[60, 120, 180, 240, 300, 360].map(y => (
            <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
          ))}
          {[60, 120, 180, 240].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="#e5e7eb" strokeWidth="0.5" />
          ))}

          {/* Route lines */}
          {ROUTE_POINTS.slice(0, -1).map((pt, i) => {
            const next = ROUTE_POINTS[i + 1];
            return (
              <line
                key={i}
                x1={pt.x} y1={pt.y}
                x2={next.x} y2={next.y}
                stroke="#93c5fd"
                strokeWidth="2.5"
                strokeDasharray="6,3"
              />
            );
          })}

          {/* Points */}
          {ROUTE_POINTS.map((pt, i) => (
            <g key={pt.label}>
              <circle cx={pt.x} cy={pt.y} r={14} fill={pointColors[i]} />
              <text
                x={pt.x} y={pt.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </Card>

      {/* Route list */}
      <div className="space-y-2 mb-4">
        {ROUTE_POINTS.map((pt, i) => (
          <div key={pt.label} className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
              style={{ backgroundColor: pointColors[i] }}
            >
              {pt.label}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{pt.address}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{pt.distance}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-3 border border-blue-100 bg-blue-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Icon name="Route" size={14} />
            <span className="font-medium">Итого: 34 км</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-700">
            <Icon name="Clock" size={14} />
            <span className="font-medium">~2.5 ч в пути</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Screen: Склад ────────────────────────────────────────────────────────────

function StockScreen() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Мобильный склад</h2>
        <Badge variant="outline" className="text-xs">
          {STOCK_ITEMS.length} позиций
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {STOCK_ITEMS.map(item => (
          <div
            key={item.sku}
            className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2"
          >
            <Icon name="Package" size={13} className="text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
            </div>
            <span className="text-xs font-semibold text-blue-700 shrink-0">
              {item.qty} {item.unit}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
          onClick={() => toast.success('Заявка на ЗИП отправлена диспетчеру')}
        >
          <Icon name="ShoppingCart" size={15} />
          Запросить ЗИП
        </button>
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold transition-colors"
          onClick={() => toast.info('QR-сканирование...')}
        >
          <Icon name="ScanLine" size={15} />
          Сканировать
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Профиль ──────────────────────────────────────────────────────────

function ProfileScreen() {
  const stats = [
    { label: 'Нарядов (месяц)', value: '24', icon: 'ClipboardList' },
    { label: 'ГСМ (км)',        value: '612',  icon: 'Fuel' },
    { label: 'Рейтинг клиентов', value: '4.8 ★', icon: 'Star' },
  ];

  return (
    <div className="p-4">
      {/* Avatar block */}
      <div className="flex flex-col items-center mb-5">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-2">
          <Icon name="UserCircle" size={36} className="text-white" />
        </div>
        <h3 className="text-base font-bold text-gray-800">Иванов Алексей Николаевич</h3>
        <p className="text-xs text-gray-500">Инженер по климатической технике</p>
        <div className="flex items-center gap-1 mt-1">
          {[1,2,3,4,5].map(s => (
            <Icon
              key={s}
              name="Star"
              size={12}
              className={s <= 4 ? 'text-amber-400' : 'text-gray-200'}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">4.8</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.map(({ label, value, icon }) => (
          <Card key={label} className="p-2 border border-gray-100 text-center">
            <Icon name={icon} size={16} className="text-blue-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-800">{value}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
          </Card>
        ))}
      </div>

      {/* Efficiency */}
      <Card className="p-3 border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Эффективность</span>
          <span className="text-xs font-bold text-green-600">87 / 100</span>
        </div>
        <Progress value={87} className="h-2" />
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          onClick={() => toast.success('Расчётный листок за май 2026 открыт')}
        >
          <Icon name="FileText" size={15} />
          Расчётный листок
        </button>
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
          onClick={() => toast.error('Выход из системы...')}
        >
          <Icon name="LogOut" size={15} />
          Выйти
        </button>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function MobileEngineerFull() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Smartphone frame */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-800">
        <StatusBar />

        {/* App header */}
        <div className="flex items-center justify-between bg-blue-600 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Icon name="Wind" size={16} className="text-white" />
            <span className="text-white text-sm font-bold">Сервис Климат</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info('Нет новых уведомлений')}
              className="text-white/80 hover:text-white"
            >
              <Icon name="Bell" size={16} />
            </button>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="User" size={13} className="text-white" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders">
          <TabsContent value="orders" className="m-0 overflow-y-auto" style={{ maxHeight: 480 }}>
            <OrdersScreen />
          </TabsContent>

          <TabsContent value="route" className="m-0 overflow-y-auto" style={{ maxHeight: 480 }}>
            <RouteScreen />
          </TabsContent>

          <TabsContent value="stock" className="m-0 overflow-y-auto" style={{ maxHeight: 480 }}>
            <StockScreen />
          </TabsContent>

          <TabsContent value="profile" className="m-0 overflow-y-auto" style={{ maxHeight: 480 }}>
            <ProfileScreen />
          </TabsContent>

          {/* Bottom nav */}
          <div className="border-t border-gray-100 bg-white">
            <TabsList className="w-full h-14 grid grid-cols-4 bg-transparent rounded-none p-0">
              <TabsTrigger
                value="orders"
                className="flex flex-col gap-0.5 h-full rounded-none data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 text-gray-500"
              >
                <Icon name="ClipboardList" size={18} />
                <span className="text-[10px]">Наряды</span>
              </TabsTrigger>
              <TabsTrigger
                value="route"
                className="flex flex-col gap-0.5 h-full rounded-none data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 text-gray-500"
              >
                <Icon name="Map" size={18} />
                <span className="text-[10px]">Маршрут</span>
              </TabsTrigger>
              <TabsTrigger
                value="stock"
                className="flex flex-col gap-0.5 h-full rounded-none data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 text-gray-500"
              >
                <Icon name="Package" size={18} />
                <span className="text-[10px]">Склад</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex flex-col gap-0.5 h-full rounded-none data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 text-gray-500"
              >
                <Icon name="User" size={18} />
                <span className="text-[10px]">Профиль</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {/* Home indicator */}
        <div className="flex justify-center pb-2 pt-1 bg-white">
          <div className="w-24 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
