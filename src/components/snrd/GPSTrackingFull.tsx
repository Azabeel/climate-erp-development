import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

// ─── Типы ──────────────────────────────────────────────────────────────────────

type EngineerStatus = 'В пути' | 'На объекте' | 'Свободен' | 'Офис';
type FilterType = 'all' | 'active' | 'zone-south' | 'zone-north' | 'zone-center';

interface RoutePoint {
  time: string;
  address: string;
  type: 'depot' | 'object' | 'waypoint';
}

interface Engineer {
  id: number;
  name: string;
  initials: string;
  color: string;
  status: EngineerStatus;
  address: string;
  speed: number;
  lastUpdate: string;
  distanceToday: number;
  zone: 'south' | 'north' | 'center';
  x: number;
  y: number;
  route: { x: number; y: number }[];
  routePoints: RoutePoint[];
}

// ─── Данные ────────────────────────────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  {
    id: 1,
    name: 'Алексей Петров',
    initials: 'АП',
    color: '#3B82F6',
    status: 'В пути',
    address: 'ул. Тверская, 18, Москва',
    speed: 42,
    lastUpdate: '2 мин назад',
    distanceToday: 34.2,
    zone: 'center',
    x: 440,
    y: 220,
    route: [{ x: 380, y: 280 }, { x: 400, y: 255 }, { x: 420, y: 235 }, { x: 440, y: 220 }],
    routePoints: [
      { time: '08:15', address: 'Офис — ул. Садовая-Кудринская, 3', type: 'depot' },
      { time: '09:40', address: 'Объект — Тверской бульвар, 22', type: 'object' },
      { time: '11:20', address: 'Объект — Никитский бульвар, 12', type: 'object' },
      { time: '13:00', address: 'В пути — ул. Тверская, 18', type: 'waypoint' },
    ],
  },
  {
    id: 2,
    name: 'Дмитрий Соколов',
    initials: 'ДС',
    color: '#10B981',
    status: 'На объекте',
    address: 'Проспект Мира, 74, Москва',
    speed: 0,
    lastUpdate: '1 мин назад',
    distanceToday: 21.5,
    zone: 'north',
    x: 520,
    y: 150,
    route: [{ x: 380, y: 280 }, { x: 430, y: 200 }, { x: 480, y: 165 }, { x: 520, y: 150 }],
    routePoints: [
      { time: '08:00', address: 'Офис — ул. Садовая-Кудринская, 3', type: 'depot' },
      { time: '09:15', address: 'Объект — ул. Щепкина, 6', type: 'object' },
      { time: '11:50', address: 'Объект — Проспект Мира, 74', type: 'object' },
    ],
  },
  {
    id: 3,
    name: 'Игорь Кузнецов',
    initials: 'ИК',
    color: '#F59E0B',
    status: 'В пути',
    address: 'ул. Профсоюзная, 93, Москва',
    speed: 58,
    lastUpdate: '3 мин назад',
    distanceToday: 47.8,
    zone: 'south',
    x: 390,
    y: 440,
    route: [{ x: 380, y: 280 }, { x: 385, y: 340 }, { x: 388, y: 390 }, { x: 390, y: 440 }],
    routePoints: [
      { time: '07:45', address: 'Офис — ул. Садовая-Кудринская, 3', type: 'depot' },
      { time: '09:00', address: 'Объект — ул. Нагорная, 13', type: 'object' },
      { time: '11:30', address: 'Объект — ул. Варшавское ш., 87', type: 'object' },
      { time: '13:15', address: 'В пути — ул. Профсоюзная, 93', type: 'waypoint' },
    ],
  },
  {
    id: 4,
    name: 'Михаил Волков',
    initials: 'МВ',
    color: '#EF4444',
    status: 'Свободен',
    address: 'ул. Ленинская Слобода, 26, Москва',
    speed: 0,
    lastUpdate: '5 мин назад',
    distanceToday: 15.3,
    zone: 'south',
    x: 580,
    y: 420,
    route: [{ x: 380, y: 280 }, { x: 480, y: 350 }, { x: 540, y: 390 }, { x: 580, y: 420 }],
    routePoints: [
      { time: '08:30', address: 'Офис — ул. Садовая-Кудринская, 3', type: 'depot' },
      { time: '10:00', address: 'Объект — ул. Велозаводская, 11', type: 'object' },
      { time: '12:45', address: 'Свободен — ул. Ленинская Слобода, 26', type: 'waypoint' },
    ],
  },
  {
    id: 5,
    name: 'Сергей Новиков',
    initials: 'СН',
    color: '#8B5CF6',
    status: 'На объекте',
    address: 'Ленинградский проспект, 37, Москва',
    speed: 0,
    lastUpdate: '1 мин назад',
    distanceToday: 28.6,
    zone: 'north',
    x: 290,
    y: 130,
    route: [{ x: 380, y: 280 }, { x: 345, y: 220 }, { x: 315, y: 165 }, { x: 290, y: 130 }],
    routePoints: [
      { time: '08:00', address: 'Дом — ул. Усиевича, 31', type: 'depot' },
      { time: '09:20', address: 'Объект — Ленинградский пр., 25', type: 'object' },
      { time: '11:00', address: 'Объект — Ленинградский пр., 37', type: 'object' },
    ],
  },
  {
    id: 6,
    name: 'Андрей Морозов',
    initials: 'АМ',
    color: '#06B6D4',
    status: 'В пути',
    address: 'ш. Энтузиастов, 56, Москва',
    speed: 35,
    lastUpdate: '2 мин назад',
    distanceToday: 39.1,
    zone: 'north',
    x: 680,
    y: 240,
    route: [{ x: 380, y: 280 }, { x: 480, y: 265 }, { x: 580, y: 252 }, { x: 680, y: 240 }],
    routePoints: [
      { time: '08:10', address: 'Офис — ул. Садовая-Кудринская, 3', type: 'depot' },
      { time: '09:30', address: 'Объект — Измайловский пр., 71', type: 'object' },
      { time: '12:00', address: 'В пути — ш. Энтузиастов, 56', type: 'waypoint' },
    ],
  },
  {
    id: 7,
    name: 'Павел Зайцев',
    initials: 'ПЗ',
    color: '#F97316',
    status: 'Офис',
    address: 'ул. Садовая-Кудринская, 3, Москва',
    speed: 0,
    lastUpdate: '10 мин назад',
    distanceToday: 0,
    zone: 'center',
    x: 380,
    y: 280,
    route: [{ x: 380, y: 280 }],
    routePoints: [
      { time: '09:00', address: 'Офис — ул. Садовая-Кудринская, 3', type: 'depot' },
    ],
  },
  {
    id: 8,
    name: 'Виктор Лебедев',
    initials: 'ВЛ',
    color: '#EC4899',
    status: 'На объекте',
    address: 'ул. Большая Серпуховская, 44, Москва',
    speed: 0,
    lastUpdate: '1 мин назад',
    distanceToday: 18.7,
    zone: 'south',
    x: 470,
    y: 380,
    route: [{ x: 380, y: 280 }, { x: 410, y: 310 }, { x: 445, y: 345 }, { x: 470, y: 380 }],
    routePoints: [
      { time: '08:20', address: 'Дом — ул. Люсиновская, 72', type: 'depot' },
      { time: '09:45', address: 'Объект — ул. Большая Серпуховская, 44', type: 'object' },
    ],
  },
];

const SITE_MARKERS = [
  { x: 440, y: 200, label: 'Тверской б-р, 22' },
  { x: 520, y: 145, label: 'Пр. Мира, 74' },
  { x: 395, y: 450, label: 'Профсоюзная, 93' },
  { x: 285, y: 120, label: 'Ленингр. пр., 37' },
  { x: 465, y: 372, label: 'Серпуховская, 44' },
  { x: 690, y: 235, label: 'Энтузиастов, 56' },
];

const generateSpeedData = (baseSpeed: number) =>
  Array.from({ length: 12 }, (_, i) => ({
    time: `${(i + 1) * 5} мин`,
    speed: Math.max(0, baseSpeed + Math.round((Math.random() - 0.5) * 20)),
  }));

// ─── Вспомогательные компоненты ────────────────────────────────────────────────

const statusColor: Record<EngineerStatus, string> = {
  'В пути': 'bg-blue-100 text-blue-700',
  'На объекте': 'bg-green-100 text-green-700',
  'Свободен': 'bg-gray-100 text-gray-700',
  'Офис': 'bg-amber-100 text-amber-700',
};

const statusDot: Record<EngineerStatus, string> = {
  'В пути': 'bg-blue-500',
  'На объекте': 'bg-green-500',
  'Свободен': 'bg-gray-400',
  'Офис': 'bg-amber-500',
};

function EngineerCard({
  engineer,
  selected,
  onClick,
}: {
  engineer: Engineer;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: engineer.color }}
        >
          {engineer.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-gray-900 truncate">{engineer.name}</div>
          <Badge className={`text-xs px-1.5 py-0 ${statusColor[engineer.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${statusDot[engineer.status]}`} />
            {engineer.status}
          </Badge>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Icon name="MapPin" size={11} />
          <span className="truncate">{engineer.address}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Icon name="Gauge" size={11} />
            {engineer.speed} км/ч
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={11} />
            {engineer.lastUpdate}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Главный компонент ─────────────────────────────────────────────────────────

export default function GPSTrackingFull() {
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [filter, setFilter] = useState<FilterType>('all');

  const selected = ENGINEERS.find((e) => e.id === selectedId) ?? null;
  const speedData = selected ? generateSpeedData(selected.speed) : [];

  const filteredEngineers = ENGINEERS.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'active') return e.status === 'В пути' || e.status === 'На объекте';
    if (filter === 'zone-south') return e.zone === 'south';
    if (filter === 'zone-north') return e.zone === 'north';
    if (filter === 'zone-center') return e.zone === 'center';
    return true;
  });

  const stats = {
    enRoute: ENGINEERS.filter((e) => e.status === 'В пути').length,
    onSite: ENGINEERS.filter((e) => e.status === 'На объекте').length,
    free: ENGINEERS.filter((e) => e.status === 'Свободен').length,
    office: ENGINEERS.filter((e) => e.status === 'Офис').length,
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden" style={{ minHeight: 0 }}>
      {/* ─── Левая панель ─────────────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
        <div className="p-3 border-b border-gray-200 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
              <Icon name="Navigation" size={14} className="text-blue-500" />
              GPS-трекинг
            </h2>
            <span className="text-xs text-gray-400">{ENGINEERS.length} инженеров</span>
          </div>

          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Фильтр" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все инженеры</SelectItem>
              <SelectItem value="active">Только активные</SelectItem>
              <SelectItem value="zone-center">Зона: Центр</SelectItem>
              <SelectItem value="zone-north">Зона: Север/Восток</SelectItem>
              <SelectItem value="zone-south">Зона: Юг</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-4 gap-1 text-center">
            {[
              { label: 'В пути', value: stats.enRoute, color: 'text-blue-600' },
              { label: 'На объекте', value: stats.onSite, color: 'text-green-600' },
              { label: 'Свободен', value: stats.free, color: 'text-gray-600' },
              { label: 'Офис', value: stats.office, color: 'text-amber-600' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded p-1">
                <div className={`font-bold text-sm ${s.color}`}>{s.value}</div>
                <div className="text-gray-400 text-[10px] leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredEngineers.map((eng) => (
            <EngineerCard
              key={eng.id}
              engineer={eng}
              selected={selectedId === eng.id}
              onClick={() => setSelectedId(eng.id)}
            />
          ))}
          {filteredEngineers.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              Нет инженеров в этой зоне
            </div>
          )}
        </div>
      </div>

      {/* ─── Центр: SVG-карта ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2 border-b border-gray-200 bg-white flex items-center gap-2 flex-shrink-0">
          <Icon name="Map" size={14} className="text-gray-500" />
          <span className="text-xs font-medium text-gray-700">Карта — Москва</span>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> В пути
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> На объекте
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> Свободен
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Офис
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-slate-100">
          <svg
            viewBox="0 0 900 600"
            className="w-full h-full"
            style={{ display: 'block' }}
          >
            {/* Фон */}
            <rect x={0} y={0} width={900} height={600} fill="#e8edf2" />

            {/* Кварталы */}
            {[
              [60, 50, 120, 80], [200, 50, 140, 70], [360, 40, 100, 60],
              [480, 50, 130, 75], [630, 45, 110, 65], [760, 50, 110, 70],
              [60, 160, 100, 90], [180, 150, 150, 80], [350, 155, 80, 70],
              [450, 140, 140, 80], [610, 150, 120, 85], [750, 145, 120, 90],
              [60, 295, 110, 80], [190, 300, 80, 70], [290, 305, 60, 65],
              [500, 295, 130, 85], [650, 290, 120, 80], [790, 295, 80, 85],
              [60, 420, 130, 85], [210, 415, 100, 80], [330, 425, 120, 75],
              [470, 420, 90, 80], [580, 415, 130, 85], [730, 420, 130, 80],
              [60, 540, 120, 50], [200, 535, 150, 55], [380, 540, 110, 50],
              [510, 535, 140, 55], [680, 540, 130, 50], [830, 535, 50, 55],
            ].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill="#d0d8e4" rx={3} />
            ))}

            {/* Улицы горизонтальные */}
            {[130, 245, 385, 510, 605].map((y, i) => (
              <line key={`h${i}`} x1={0} y1={y} x2={900} y2={y} stroke="#c8d0dc" strokeWidth={8} />
            ))}
            {/* Улицы вертикальные */}
            {[155, 290, 450, 640, 770].map((x, i) => (
              <line key={`v${i}`} x1={x} y1={0} x2={x} y2={600} stroke="#c8d0dc" strokeWidth={8} />
            ))}

            {/* Главные дороги */}
            <line x1={0} y1={280} x2={900} y2={280} stroke="#b8c4d4" strokeWidth={14} />
            <line x1={380} y1={0} x2={380} y2={600} stroke="#b8c4d4" strokeWidth={14} />

            {/* Подписи улиц */}
            <text x={10} y={274} fontSize={9} fill="#8897aa">ул. Садовое кольцо</text>
            <text x={382} y={25} fontSize={9} fill="#8897aa" transform="rotate(90,382,25)">Тверская ул.</text>

            {/* Офис — звезда */}
            <polygon
              points="380,264 384,272 394,272 386,278 389,288 380,282 371,288 374,278 366,272 376,272"
              fill="#F59E0B"
              stroke="#fff"
              strokeWidth={1.5}
            />
            <text x={394} y={276} fontSize={9} fill="#92400e" fontWeight="600">Офис</text>

            {/* Маршруты выбранного инженера */}
            {selected && selected.route.length > 1 && (
              <polyline
                points={selected.route.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={selected.color}
                strokeWidth={2.5}
                strokeDasharray="6 3"
                opacity={0.7}
              />
            )}

            {/* Все маршруты (тонкие, фоновые) */}
            {ENGINEERS.filter((e) => e.id !== selectedId && e.route.length > 1).map((eng) => (
              <polyline
                key={eng.id}
                points={eng.route.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={eng.color}
                strokeWidth={1}
                opacity={0.25}
              />
            ))}

            {/* Маркеры объектов (треугольники) */}
            {SITE_MARKERS.map((m, i) => (
              <g key={i}>
                <polygon
                  points={`${m.x},${m.y - 12} ${m.x - 8},${m.y + 6} ${m.x + 8},${m.y + 6}`}
                  fill="#2563EB"
                  stroke="#fff"
                  strokeWidth={1.5}
                />
                <text x={m.x} y={m.y + 19} textAnchor="middle" fontSize={8} fill="#1e40af">
                  {m.label}
                </text>
              </g>
            ))}

            {/* Маркеры инженеров */}
            {ENGINEERS.map((eng) => {
              const isSelected = eng.id === selectedId;
              return (
                <g
                  key={eng.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedId(eng.id)}
                >
                  <circle
                    cx={eng.x}
                    cy={eng.y}
                    r={isSelected ? 18 : 14}
                    fill={eng.color}
                    stroke="#fff"
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={isSelected ? 1 : 0.85}
                  />
                  {isSelected && (
                    <circle cx={eng.x} cy={eng.y} r={22} fill="none" stroke={eng.color} strokeWidth={2} opacity={0.4} />
                  )}
                  <text
                    x={eng.x}
                    y={eng.y + 4}
                    textAnchor="middle"
                    fontSize={isSelected ? 9 : 8}
                    fill="#fff"
                    fontWeight="700"
                  >
                    {eng.initials}
                  </text>
                  {eng.status === 'В пути' && (
                    <circle cx={eng.x + (isSelected ? 14 : 10)} cy={eng.y - (isSelected ? 14 : 10)} r={4} fill="#22c55e" stroke="#fff" strokeWidth={1} />
                  )}
                </g>
              );
            })}

            {/* Легенда */}
            <rect x={720} y={545} width={170} height={46} fill="white" rx={4} opacity={0.9} />
            <text x={728} y={558} fontSize={8} fill="#6b7280" fontWeight="600">ЛЕГЕНДА</text>
            <polygon points="732,566 728,572 736,572" fill="#2563EB" />
            <text x={740} y={572} fontSize={8} fill="#374151">Объект</text>
            <polygon points="760,566 756,572 764,572" fill="#F59E0B" />
            <text x={768} y={572} fontSize={8} fill="#374151">Офис</text>
            <line x1={727} y1={579} x2={745} y2={579} stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 2" />
            <text x={748} y={583} fontSize={8} fill="#374151">Маршрут</text>

            {/* Масштаб */}
            <line x1={20} y1={575} x2={70} y2={575} stroke="#374151" strokeWidth={2} />
            <line x1={20} y1={570} x2={20} y2={580} stroke="#374151" strokeWidth={2} />
            <line x1={70} y1={570} x2={70} y2={580} stroke="#374151" strokeWidth={2} />
            <text x={45} y={570} textAnchor="middle" fontSize={8} fill="#374151">~2 км</text>
          </svg>
        </div>
      </div>

      {/* ─── Правая панель ─────────────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-l border-gray-200 bg-white overflow-y-auto">
        {selected ? (
          <>
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: selected.color }}
                >
                  {selected.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-gray-900 truncate">{selected.name}</div>
                  <Badge className={`text-xs px-1.5 py-0 ${statusColor[selected.status]}`}>
                    {selected.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() =>
                    toast.success(`Звонок ${selected.name}`, { description: 'Соединяемся...' })
                  }
                >
                  <Icon name="Phone" size={12} className="mr-1" />
                  Позвонить
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() =>
                    toast.success(`Чат с ${selected.name}`, { description: 'Открываем мессенджер...' })
                  }
                >
                  <Icon name="MessageCircle" size={12} className="mr-1" />
                  Чат
                </Button>
              </div>
            </div>

            {/* Статистика дня */}
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Статистика дня
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: 'Route', label: 'Пробег', value: `${selected.distanceToday} км`, color: 'text-blue-600' },
                  { icon: 'Gauge', label: 'Скорость', value: `${selected.speed} км/ч`, color: 'text-green-600' },
                  { icon: 'MapPin', label: 'Объектов', value: `${selected.routePoints.filter(p => p.type === 'object').length}`, color: 'text-purple-600' },
                  { icon: 'Clock', label: 'Обновление', value: selected.lastUpdate, color: 'text-gray-600' },
                ].map((stat) => (
                  <Card key={stat.label} className="p-2 border-gray-100">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-1.5">
                        <Icon name={stat.icon} size={13} className={stat.color} />
                        <div>
                          <div className={`font-bold text-sm ${stat.color}`}>{stat.value}</div>
                          <div className="text-gray-400 text-[10px]">{stat.label}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* График скорости */}
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Скорость за последний час
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={speedData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 8 }} interval={2} />
                  <YAxis tick={{ fontSize: 8 }} domain={[0, 80]} />
                  <Tooltip
                    contentStyle={{ fontSize: 10, padding: '4px 8px' }}
                    formatter={(v: number) => [`${v} км/ч`, 'Скорость']}
                  />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke={selected.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Маршрут */}
            <div className="p-3 flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Маршрут сегодня
              </div>
              <div className="space-y-2">
                {selected.routePoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          point.type === 'depot'
                            ? 'bg-amber-100'
                            : point.type === 'object'
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          name={point.type === 'depot' ? 'Home' : point.type === 'object' ? 'Wrench' : 'Navigation'}
                          size={10}
                          className={
                            point.type === 'depot'
                              ? 'text-amber-600'
                              : point.type === 'object'
                              ? 'text-blue-600'
                              : 'text-gray-500'
                          }
                        />
                      </div>
                      {idx < selected.routePoints.length - 1 && (
                        <div className="w-px h-4 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="text-[10px] text-gray-400 font-medium">{point.time}</div>
                      <div className="text-xs text-gray-700 leading-tight">{point.address}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-6 text-center">
            <div>
              <Icon name="Navigation" size={32} className="mx-auto mb-2 opacity-30" />
              Выберите инженера на карте или в списке
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
