import { useState } from 'react';
import { Navigation, MapPin, Clock, Fuel, RotateCcw, Check, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Order {
  id: string;
  number: string;
  client: string;
  address: string;
  type: string;
  duration: number;
  priority: 'normal' | 'urgent' | 'emergency';
  slaDeadline: string;
  position: { x: number; y: number };
}

interface Engineer {
  id: string;
  name: string;
  initials: string;
  startLocation: string;
  vehicle: string;
  orders: string[];
  totalKm: number;
  totalTime: number;
  color: string;
  startPos: { x: number; y: number };
}

const ORDERS: Order[] = [
  { id: 'o1', number: 'WO-047', client: 'ТЦ Мираж', address: 'ул. Ленина, 1', type: 'Аварийный ремонт', duration: 90, priority: 'emergency', slaDeadline: '15:30', position: { x: 25, y: 30 } },
  { id: 'o2', number: 'WO-048', client: 'БЦ Олимп', address: 'пр. Мира, 45', type: 'ТО плановое', duration: 120, priority: 'normal', slaDeadline: '17:00', position: { x: 65, y: 25 } },
  { id: 'o3', number: 'WO-049', client: 'ИП Смирнов', address: 'ул. Дачная, 14', type: 'Диагностика', duration: 60, priority: 'normal', slaDeadline: '18:00', position: { x: 78, y: 60 } },
  { id: 'o4', number: 'WO-050', client: 'Сбербанк-офис', address: 'ул. Советская, 12', type: 'Гарантийный', duration: 75, priority: 'urgent', slaDeadline: '16:00', position: { x: 40, y: 70 } },
  { id: 'o5', number: 'WO-051', client: 'ООО ПромТех', address: 'ул. Заводская, 8', type: 'Ремонт', duration: 150, priority: 'urgent', slaDeadline: '16:45', position: { x: 55, y: 45 } },
  { id: 'o6', number: 'WO-052', client: 'Школа №14', address: 'ул. Школьная, 7', type: 'ТО плановое', duration: 90, priority: 'normal', slaDeadline: '18:30', position: { x: 20, y: 72 } },
];

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Козлов М.И.', initials: 'КМ', startLocation: 'Офис', vehicle: 'Авто', orders: ['o1', 'o5'], totalKm: 23, totalTime: 285, color: '#3b82f6', startPos: { x: 10, y: 10 } },
  { id: 'e2', name: 'Петров С.А.', initials: 'ПС', startLocation: 'Дом', vehicle: 'Авто', orders: ['o4', 'o2'], totalKm: 31, totalTime: 270, color: '#10b981', startPos: { x: 85, y: 85 } },
  { id: 'e3', name: 'Иванов А.К.', initials: 'ИА', startLocation: 'Офис', vehicle: 'ОТ', orders: ['o6', 'o3'], totalKm: 18, totalTime: 225, color: '#f59e0b', startPos: { x: 10, y: 10 } },
];

const PRIORITY_COLOR: Record<string, string> = {
  emergency: '#ef4444',
  urgent: '#f97316',
  normal: '#3b82f6',
};

const RouteOptimizer = () => {
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>('e1');
  const [optimized, setOptimized] = useState(false);

  const eng = ENGINEERS.find(e => e.id === selectedEngineer);
  const engOrders = eng ? ORDERS.filter(o => eng.orders.includes(o.id)) : [];

  const handleOptimize = () => {
    setOptimized(true);
    toast.success('Маршруты оптимизированы — экономия 18 мин и 4.2 км');
  };

  const handleApply = () => {
    toast.success('Маршруты применены и отправлены инженерам');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Navigation size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Оптимизация маршрутов</h2>
            <p className="text-gray-500 text-sm">Автоматическое построение оптимальных маршрутов на день</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setOptimized(false); toast.info('Маршруты сброшены'); }}>
            <RotateCcw size={14} className="mr-2" /> Сбросить
          </Button>
          <Button size="sm" onClick={optimized ? handleApply : handleOptimize}
            className={optimized ? 'bg-green-600 hover:bg-green-700' : ''}>
            {optimized ? <><Check size={14} className="mr-2" /> Применить</> : <><Navigation size={14} className="mr-2" /> Оптимизировать</>}
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Нарядов на день', value: ORDERS.length.toString(), icon: MapPin, color: 'text-blue-600 bg-blue-50' },
          { label: 'Инженеров', value: ENGINEERS.length.toString(), icon: Users, color: 'text-green-600 bg-green-50' },
          { label: 'Общий пробег', value: `${ENGINEERS.reduce((s, e) => s + e.totalKm, 0)} км`, icon: Fuel, color: 'text-orange-600 bg-orange-50' },
          { label: 'Экономия (оптим.)', value: optimized ? '4.2 км / 18 мин' : '—', icon: Clock, color: 'text-purple-600 bg-purple-50' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
              <k.icon size={18} />
            </div>
            <p className="text-xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Engineer list */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Инженеры</h3>
          {ENGINEERS.map(e => (
            <div key={e.id}
              onClick={() => setSelectedEngineer(e.id)}
              className={`cursor-pointer border rounded-xl p-4 transition-all ${selectedEngineer === e.id ? 'border-blue-400 shadow ring-2 ring-blue-100' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: e.color }}>
                  {e.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                  <p className="text-xs text-gray-500">{e.vehicle} · старт: {e.startLocation}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{e.orders.length}</p>
                  <p className="text-gray-500">нарядов</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{e.totalKm} км</p>
                  <p className="text-gray-500">пробег</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{Math.round(e.totalTime / 60)}ч {e.totalTime % 60}м</p>
                  <p className="text-gray-500">время</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SVG Map */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Карта маршрутов</h3>
            <div className="flex gap-3 text-xs text-gray-500">
              {ENGINEERS.map(e => (
                <span key={e.id} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: e.color }} />
                  {e.name.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
          <svg width="100%" viewBox="0 0 100 100" className="bg-gray-50" style={{ minHeight: 320 }}>
            {/* Grid */}
            {[20, 40, 60, 80].map(v => (
              <g key={v}>
                <line x1={v} y1={0} x2={v} y2={100} stroke="#e5e7eb" strokeWidth="0.3" />
                <line x1={0} y1={v} x2={100} y2={v} stroke="#e5e7eb" strokeWidth="0.3" />
              </g>
            ))}

            {/* Routes */}
            {ENGINEERS.map(e => {
              const pts = [e.startPos, ...ORDERS.filter(o => e.orders.includes(o.id)).map(o => o.position)];
              return (
                <polyline key={e.id}
                  points={pts.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none" stroke={e.color} strokeWidth="0.8" strokeDasharray={optimized ? 'none' : '2,1'} opacity="0.7" />
              );
            })}

            {/* Order markers */}
            {ORDERS.map(o => (
              <g key={o.id}>
                <circle cx={o.position.x} cy={o.position.y} r="3.5"
                  fill={PRIORITY_COLOR[o.priority]} stroke="white" strokeWidth="0.8" />
                <text x={o.position.x + 4.5} y={o.position.y + 1.2} fontSize="3" fill="#374151">{o.number}</text>
              </g>
            ))}

            {/* Engineer start markers */}
            {ENGINEERS.map((e, idx) => (
              <g key={e.id}>
                <rect x={e.startPos.x - 3} y={e.startPos.y - 3} width="6" height="6" rx="1"
                  fill={e.color} stroke="white" strokeWidth="0.8"
                  transform={idx > 0 ? `translate(${idx * 3}, ${idx * 3})` : ''} />
              </g>
            ))}
          </svg>
          <div className="px-4 py-2 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Аварийный</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Срочный</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Обычный</span>
          </div>
        </div>

        {/* Route detail */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">
              {eng ? `Маршрут: ${eng.name}` : 'Выберите инженера'}
            </h3>
          </div>
          {eng && (
            <div className="p-4">
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />

                {/* Start point */}
                <div className="relative flex gap-3">
                  <div className="absolute -left-4 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: eng.color }}>
                    <span className="text-white text-xs font-bold" style={{ fontSize: 7 }}>S</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Начало смены — {eng.startLocation}</p>
                    <p className="text-xs text-gray-400">09:00</p>
                  </div>
                </div>

                {engOrders.map((o, i) => {
                  const startTime = 9 * 60 + 30 + i * (o.duration + 20);
                  const h = Math.floor(startTime / 60);
                  const m = startTime % 60;
                  return (
                    <div key={o.id} className="relative flex gap-3">
                      <div className="absolute -left-4 w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: PRIORITY_COLOR[o.priority] }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-900">{o.number} — {o.client}</p>
                          <span className="text-xs text-gray-400">{`${h}:${m.toString().padStart(2, '0')}`}</span>
                        </div>
                        <p className="text-xs text-gray-500">{o.address}</p>
                        <p className="text-xs text-gray-400">{o.type} · {o.duration} мин · SLA до {o.slaDeadline}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="relative flex gap-3">
                  <div className="absolute -left-4 w-4 h-4 rounded-full border-2 border-white bg-gray-400" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Конец смены</p>
                    <p className="text-xs text-gray-400">~{Math.round((9 * 60 + engOrders.reduce((s, o) => s + o.duration + 20, 30)) / 60)}:{String((9 * 60 + engOrders.reduce((s, o) => s + o.duration + 20, 30)) % 60).padStart(2, '0')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button size="sm" className="w-full" onClick={() => toast.success(`Маршрут отправлен: ${eng.name}`)}>
                  <ChevronRight size={14} className="mr-1" /> Отправить маршрут инженеру
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;
