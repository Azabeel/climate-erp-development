import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoutePoint {
  id: string;
  index: number;
  type: 'office' | 'client';
  address: string;
  clientName: string;
  arrivalPlan: string;
  duration: number; // минут
  distanceFromPrev: number; // км
  timeWindow: string; // «09:00–11:00»
  orderId: string;
  // SVG-координаты (0–100 %)
  svgX: number;
  svgY: number;
}

interface Engineer {
  id: string;
  name: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Козлов М.И.' },
  { id: 'e2', name: 'Петров С.А.' },
  { id: 'e3', name: 'Иванов А.К.' },
  { id: 'e4', name: 'Смирнов Д.Е.' },
];

const INITIAL_ROUTE: RoutePoint[] = [
  {
    id: 'p0',
    index: 0,
    type: 'office',
    address: 'ул. Большая Полянка, 28',
    clientName: 'Офис «Сервис Климат»',
    arrivalPlan: '08:00',
    duration: 0,
    distanceFromPrev: 0,
    timeWindow: '08:00',
    orderId: '',
    svgX: 12,
    svgY: 14,
  },
  {
    id: 'p1',
    index: 1,
    type: 'client',
    address: 'пр-т Мира, 120, офис 305',
    clientName: 'ООО «АгроТехСнаб»',
    arrivalPlan: '09:15',
    duration: 75,
    distanceFromPrev: 11.2,
    timeWindow: '09:00–11:00',
    orderId: 'WO-2026-000312',
    svgX: 62,
    svgY: 18,
  },
  {
    id: 'p2',
    index: 2,
    type: 'client',
    address: 'Щёлковское шоссе, 55, стр. 2',
    clientName: 'ТЦ «Восточный»',
    arrivalPlan: '10:45',
    duration: 90,
    distanceFromPrev: 9.4,
    timeWindow: '10:00–12:00',
    orderId: 'WO-2026-000318',
    svgX: 82,
    svgY: 32,
  },
  {
    id: 'p3',
    index: 3,
    type: 'client',
    address: 'ул. Академика Янгеля, 3',
    clientName: 'Сбербанк, доп. офис 8 ',
    arrivalPlan: '12:30',
    duration: 60,
    distanceFromPrev: 14.1,
    timeWindow: '12:00–14:00',
    orderId: 'WO-2026-000325',
    svgX: 28,
    svgY: 72,
  },
  {
    id: 'p4',
    index: 4,
    type: 'client',
    address: 'Варшавское шоссе, 87, к. 1',
    clientName: 'БЦ «Дельта Плаза»',
    arrivalPlan: '14:15',
    duration: 120,
    distanceFromPrev: 8.8,
    timeWindow: '13:30–16:00',
    orderId: 'WO-2026-000331',
    svgX: 44,
    svgY: 84,
  },
  {
    id: 'p5',
    index: 5,
    type: 'client',
    address: 'Ленинский пр-т, 42, эт. 3',
    clientName: 'ООО «МедТехПром»',
    arrivalPlan: '16:45',
    duration: 45,
    distanceFromPrev: 7.5,
    timeWindow: '16:00–18:00',
    orderId: 'WO-2026-000337',
    svgX: 20,
    svgY: 56,
  },
  {
    id: 'p6',
    index: 6,
    type: 'client',
    address: 'ул. Профсоюзная, 93А',
    clientName: 'Школа №1329',
    arrivalPlan: '17:45',
    duration: 60,
    distanceFromPrev: 10.0,
    timeWindow: '17:00–19:00',
    orderId: 'WO-2026-000341',
    svgX: 36,
    svgY: 66,
  },
];

// Часовая нагрузка (минут работы в каждый час)
const HOURLY_LOAD = [
  { hour: '08:00', load: 0 },
  { hour: '09:00', load: 45 },
  { hour: '10:00', load: 75 },
  { hour: '11:00', load: 90 },
  { hour: '12:00', load: 60 },
  { hour: '13:00', load: 120 },
  { hour: '14:00', load: 120 },
  { hour: '15:00', load: 45 },
  { hour: '16:00', load: 60 },
];

// Кварталы/блоки города (SVG)
const CITY_BLOCKS = [
  { x: 5, y: 5, w: 18, h: 12 },
  { x: 30, y: 5, w: 22, h: 10 },
  { x: 58, y: 5, w: 20, h: 14 },
  { x: 82, y: 5, w: 14, h: 18 },
  { x: 5, y: 24, w: 14, h: 20 },
  { x: 24, y: 22, w: 20, h: 16 },
  { x: 50, y: 22, w: 24, h: 14 },
  { x: 80, y: 28, w: 16, h: 18 },
  { x: 5, y: 50, w: 20, h: 18 },
  { x: 30, y: 48, w: 18, h: 20 },
  { x: 54, y: 46, w: 22, h: 16 },
  { x: 80, y: 52, w: 16, h: 18 },
  { x: 5, y: 74, w: 16, h: 20 },
  { x: 28, y: 72, w: 22, h: 22 },
  { x: 56, y: 72, w: 20, h: 22 },
];

// Маршрут до оптимизации (зигзаг — красный пунктир)
const UNOPTIMIZED_PATH = [
  { x: 12, y: 14 },
  { x: 82, y: 32 },
  { x: 20, y: 56 },
  { x: 62, y: 18 },
  { x: 44, y: 84 },
  { x: 28, y: 72 },
  { x: 36, y: 66 },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function svgPct(val: number, total: number) {
  return (val / 100) * total;
}

function polylinePoints(pts: { x: number; y: number }[], W: number, H: number) {
  return pts.map((p) => `${svgPct(p.x, W)},${svgPct(p.y, H)}`).join(' ');
}

function arrowMid(
  a: { x: number; y: number },
  b: { x: number; y: number },
  W: number,
  H: number
) {
  const mx = svgPct((a.x + b.x) / 2, W);
  const my = svgPct((a.y + b.y) / 2, H);
  const angle =
    Math.atan2(
      svgPct(b.y, H) - svgPct(a.y, H),
      svgPct(b.x, W) - svgPct(a.x, W)
    ) *
    (180 / Math.PI);
  return { mx, my, angle };
}

// ─── Component ────────────────────────────────────────────────────────────────

const RouteOptimizerFull: React.FC = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEngineerId, setSelectedEngineerId] = useState('e1');
  const [route, setRoute] = useState<RoutePoint[]>(INITIAL_ROUTE);
  const [optimized, setOptimized] = useState(false);
  const [tooltipPoint, setTooltipPoint] = useState<RoutePoint | null>(null);
  const [pulse, setPulse] = useState(true);

  // Пульсация текущей позиции
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(id);
  }, []);

  const SVG_W = 800;
  const SVG_H = 500;

  // Точки оптимального маршрута
  const optimizedPath = route.map((p) => ({ x: p.svgX, y: p.svgY }));

  // Текущее положение инженера (~между точками 1 и 2)
  const engineerPos = {
    x: svgPct((route[1].svgX + route[2].svgX) / 2, SVG_W),
    y: svgPct((route[1].svgY + route[2].svgY) / 2, SVG_H),
  };

  // Сводные данные
  const totalKm = route
    .slice(1)
    .reduce((s, p) => s + p.distanceFromPrev, 0)
    .toFixed(1);
  const totalMinutes = route.reduce((s, p) => s + p.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const fuelConsumption = (parseFloat(totalKm) * 0.10).toFixed(1);

  // Оптимизация
  function handleOptimize() {
    // Переставляем точки в «лучшем» порядке (имитация)
    const newRoute = [
      route[0],
      route[1],
      route[5],
      route[3],
      route[4],
      route[6],
      route[2],
    ].map((p, i) => ({ ...p, index: i }));
    setRoute(newRoute);
    setOptimized(true);
    toast.success('Маршрут оптимизирован', {
      description: 'Экономия: 28 км, 1ч 15мин, 3.4 л топлива',
    });
  }

  // Перемещение точек
  function moveUp(idx: number) {
    if (idx <= 1) return; // офис всегда первый
    const arr = [...route];
    [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
    setRoute(arr.map((p, i) => ({ ...p, index: i })));
  }

  function moveDown(idx: number) {
    if (idx === 0 || idx >= route.length - 1) return;
    const arr = [...route];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setRoute(arr.map((p, i) => ({ ...p, index: i })));
  }

  const engineer = ENGINEERS.find((e) => e.id === selectedEngineerId)!;

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans">
      {/* ── Шапка ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Icon name="MapPin" className="text-blue-600 w-5 h-5" />
          <span className="text-lg font-semibold text-gray-800">
            Оптимизатор маршрутов
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Дата */}
          <div className="flex items-center gap-1.5">
            <Icon name="Calendar" className="text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Инженер */}
          <div className="flex items-center gap-1.5">
            <Icon name="User" className="text-gray-400 w-4 h-4" />
            <select
              value={selectedEngineerId}
              onChange={(e) => setSelectedEngineerId(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENGINEERS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Кнопки действий */}
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleOptimize}
          >
            <Icon name="Zap" className="w-4 h-4 mr-1.5" />
            Оптимизировать маршрут
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.info('Маршрут экспортирован', {
                description: 'Открыт в Яндекс.Навигаторе',
              })
            }
          >
            <Icon name="Navigation" className="w-4 h-4 mr-1.5" />
            Экспорт в навигатор
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(`Маршрут отправлен ${engineer.name}`, {
                description: 'Уведомление доставлено в приложение',
              })
            }
          >
            <Icon name="Send" className="w-4 h-4 mr-1.5" />
            Отправить инженеру
          </Button>
        </div>
      </div>

      {/* ── Основной контент ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Левая панель ─────────────────────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Список точек
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {route.map((point, idx) => (
              <div
                key={point.id}
                className={`px-3 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                  tooltipPoint?.id === point.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() =>
                  setTooltipPoint(tooltipPoint?.id === point.id ? null : point)
                }
              >
                <div className="flex items-start gap-2">
                  {/* Маркер */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 ${
                      point.type === 'office' ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                  >
                    {point.type === 'office' ? (
                      <Icon name="Building2" className="w-3 h-3" />
                    ) : (
                      idx
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {point.clientName}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {point.address}
                    </p>

                    {point.type === 'client' && (
                      <div className="mt-1.5 space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Icon name="Clock" className="w-3 h-3 text-blue-400" />
                          <span>
                            {point.arrivalPlan} · {point.duration} мин
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Icon name="Route" className="w-3 h-3 text-gray-400" />
                          <span>{point.distanceFromPrev} км от пред.</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Icon name="AlarmClock" className="w-3 h-3" />
                          <span>{point.timeWindow}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Кнопки перемещения */}
                  {point.type === 'client' && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveUp(idx);
                        }}
                        disabled={idx <= 1}
                        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Icon name="ChevronUp" className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveDown(idx);
                        }}
                        disabled={idx >= route.length - 1}
                        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Icon name="ChevronDown" className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Сводка */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Icon name="Route" className="w-3.5 h-3.5 text-gray-400" />
                Итого км
              </span>
              <span className="font-semibold">{totalKm} км</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Icon name="Clock" className="w-3.5 h-3.5 text-gray-400" />
                Время в дороге
              </span>
              <span className="font-semibold">
                {totalHours}ч {totalMins}мин
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Icon name="Fuel" className="w-3.5 h-3.5 text-gray-400" />
                Расход топлива
              </span>
              <span className="font-semibold">{fuelConsumption} л</span>
            </div>
          </div>
        </aside>

        {/* ── Правая часть ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ── SVG Карта ──────────────────────────────────────────────── */}
          <div className="flex-1 relative overflow-hidden">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full h-full"
              style={{ background: '#e8ecef' }}
            >
              {/* Фон — серый город */}
              <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#e8ecef" />

              {/* Кварталы */}
              {CITY_BLOCKS.map((b, i) => (
                <rect
                  key={i}
                  x={svgPct(b.x, SVG_W)}
                  y={svgPct(b.y, SVG_H)}
                  width={svgPct(b.w, SVG_W)}
                  height={svgPct(b.h, SVG_H)}
                  fill="#d1d5db"
                  rx={3}
                />
              ))}

              {/* Дороги (горизонтальные) */}
              {[20, 42, 65, 88].map((y, i) => (
                <line
                  key={`hr${i}`}
                  x1={0}
                  y1={svgPct(y, SVG_H)}
                  x2={SVG_W}
                  y2={svgPct(y, SVG_H)}
                  stroke="#f5f5f5"
                  strokeWidth={svgPct(3, SVG_W)}
                />
              ))}
              {/* Дороги (вертикальные) */}
              {[22, 47, 72, 96].map((x, i) => (
                <line
                  key={`vr${i}`}
                  x1={svgPct(x, SVG_W)}
                  y1={0}
                  x2={svgPct(x, SVG_W)}
                  y2={SVG_H}
                  stroke="#f5f5f5"
                  strokeWidth={svgPct(3, SVG_W)}
                />
              ))}

              {/* Неоптимальный маршрут (красный пунктир) */}
              {!optimized && (
                <polyline
                  points={polylinePoints(UNOPTIMIZED_PATH, SVG_W, SVG_H)}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  strokeDasharray="8 5"
                  opacity={0.7}
                />
              )}

              {/* Оптимальный маршрут (синий) */}
              <polyline
                points={polylinePoints(optimizedPath, SVG_W, SVG_H)}
                fill="none"
                stroke="#2563eb"
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.9}
              />

              {/* Стрелки направления */}
              {route.slice(0, -1).map((p, i) => {
                const next = route[i + 1];
                const { mx, my, angle } = arrowMid(
                  { x: p.svgX, y: p.svgY },
                  { x: next.svgX, y: next.svgY },
                  SVG_W,
                  SVG_H
                );
                return (
                  <g key={`arr${i}`} transform={`translate(${mx},${my}) rotate(${angle})`}>
                    <polygon
                      points="-6,-4 6,0 -6,4"
                      fill="#2563eb"
                      opacity={0.85}
                    />
                  </g>
                );
              })}

              {/* Маркеры точек */}
              {route.map((point, idx) => {
                const cx = svgPct(point.svgX, SVG_W);
                const cy = svgPct(point.svgY, SVG_H);
                const isOffice = point.type === 'office';
                const isActive = tooltipPoint?.id === point.id;

                return (
                  <g
                    key={point.id}
                    onClick={() =>
                      setTooltipPoint(tooltipPoint?.id === point.id ? null : point)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Тень */}
                    <circle cx={cx + 1} cy={cy + 1} r={isOffice ? 16 : 14} fill="rgba(0,0,0,0.15)" />
                    {/* Основной круг */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isOffice ? 16 : 14}
                      fill={isOffice ? '#16a34a' : isActive ? '#1d4ed8' : '#2563eb'}
                      stroke="#fff"
                      strokeWidth={2.5}
                    />
                    {/* Метка */}
                    {isOffice ? (
                      <text
                        x={cx}
                        y={cy + 4}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight="bold"
                        fill="#fff"
                      >
                        🏢
                      </text>
                    ) : (
                      <text
                        x={cx}
                        y={cy + 4.5}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                        fill="#fff"
                      >
                        {idx}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Текущее положение инженера (пульсирующая точка) */}
              <g>
                {/* Пульс — внешнее кольцо */}
                <circle
                  cx={engineerPos.x}
                  cy={engineerPos.y}
                  r={pulse ? 18 : 12}
                  fill="rgba(234,179,8,0.3)"
                  style={{ transition: 'r 0.9s ease-in-out' }}
                />
                {/* Внутренний круг */}
                <circle
                  cx={engineerPos.x}
                  cy={engineerPos.y}
                  r={9}
                  fill="#eab308"
                  stroke="#fff"
                  strokeWidth={2.5}
                />
                <text
                  x={engineerPos.x}
                  y={engineerPos.y + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#fff"
                >
                  ▶
                </text>
              </g>

              {/* Tooltip выбранной точки */}
              {tooltipPoint && (() => {
                const tx = svgPct(tooltipPoint.svgX, SVG_W);
                const ty = svgPct(tooltipPoint.svgY, SVG_H);
                const flip = tooltipPoint.svgX > 70;
                const tooltipW = 200;
                const tooltipH = tooltipPoint.type === 'client' ? 84 : 50;
                const rx = flip ? tx - tooltipW - 16 : tx + 16;
                const ry = ty - tooltipH / 2;

                return (
                  <g>
                    {/* Линия-коннектор */}
                    <line
                      x1={tx}
                      y1={ty}
                      x2={flip ? rx + tooltipW : rx}
                      y2={ry + tooltipH / 2}
                      stroke="#374151"
                      strokeWidth={1.2}
                      strokeDasharray="3 2"
                    />
                    {/* Фон тултипа */}
                    <rect
                      x={rx}
                      y={ry}
                      width={tooltipW}
                      height={tooltipH}
                      fill="#1f2937"
                      rx={6}
                      opacity={0.92}
                    />
                    <text
                      x={rx + 10}
                      y={ry + 18}
                      fontSize={11}
                      fontWeight="bold"
                      fill="#f9fafb"
                    >
                      {tooltipPoint.clientName}
                    </text>
                    <text x={rx + 10} y={ry + 32} fontSize={9.5} fill="#d1d5db">
                      {tooltipPoint.address}
                    </text>
                    {tooltipPoint.type === 'client' && (
                      <>
                        <text x={rx + 10} y={ry + 50} fontSize={9.5} fill="#93c5fd">
                          ⏱ Прибытие: {tooltipPoint.arrivalPlan}  ·  {tooltipPoint.duration} мин
                        </text>
                        <text x={rx + 10} y={ry + 66} fontSize={9} fill="#6b7280">
                          Окно: {tooltipPoint.timeWindow}  ·  {tooltipPoint.orderId}
                        </text>
                      </>
                    )}
                  </g>
                );
              })()}

              {/* Легенда */}
              <g transform={`translate(${SVG_W - 190}, 16)`}>
                <rect width={178} height={90} fill="rgba(255,255,255,0.88)" rx={6} />
                <circle cx={14} cy={18} r={7} fill="#16a34a" />
                <text x={26} y={22} fontSize={11} fill="#374151">Офис (старт)</text>
                <circle cx={14} cy={38} r={7} fill="#2563eb" />
                <text x={26} y={42} fontSize={11} fill="#374151">Точка клиента</text>
                <circle cx={14} cy={58} r={7} fill="#eab308" />
                <text x={26} y={62} fontSize={11} fill="#374151">Позиция инженера</text>
                <line x1={6} y1={76} x2={22} y2={76} stroke="#2563eb" strokeWidth={2.5} />
                <text x={26} y={80} fontSize={11} fill="#374151">Оптимальный путь</text>
                {!optimized && (
                  <>
                    <line x1={6} y1={92} x2={22} y2={92} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3" />
                    <text x={26} y={96} fontSize={11} fill="#374151">До оптимизации</text>
                  </>
                )}
              </g>
            </svg>
          </div>

          {/* ── Нижняя панель ────────────────────────────────────────────── */}
          <div className="bg-white border-t border-gray-200 flex gap-0 overflow-hidden" style={{ height: '220px' }}>
            {/* Статистика оптимизации */}
            <div className="flex-shrink-0 w-72 border-r border-gray-200 px-5 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Результат оптимизации
              </p>
              <div className="space-y-2">
                {/* До */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">До оптимизации</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs">
                      89 км
                    </Badge>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs">
                      4ч 20мин
                    </Badge>
                  </div>
                </div>
                {/* После */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">После оптимизации</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                      61 км
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                      3ч 05мин
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Icon name="Route" className="w-3.5 h-3.5 text-green-500" />
                      Экономия пробега
                    </span>
                    <span className="font-semibold text-green-600">−28 км (−31%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Icon name="Fuel" className="w-3.5 h-3.5 text-green-500" />
                      Экономия топлива
                    </span>
                    <span className="font-semibold text-green-600">−3.4 л</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Icon name="Clock" className="w-3.5 h-3.5 text-green-500" />
                      Экономия времени
                    </span>
                    <span className="font-semibold text-green-600">−1ч 15мин</span>
                  </div>
                </div>

                {optimized && (
                  <div className="mt-1 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2 py-1.5">
                    <Icon name="CheckCircle" className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">
                      Маршрут оптимизирован
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* BarChart нагрузки */}
            <div className="flex-1 px-5 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Нагрузка по часам дня (мин)
              </p>
              <ResponsiveContainer width="100%" height={155}>
                <BarChart
                  data={HOURLY_LOAD}
                  margin={{ top: 4, right: 16, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v} мин`, 'Нагрузка']}
                    contentStyle={{
                      fontSize: 11,
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                    }}
                  />
                  <Bar
                    dataKey="load"
                    fill="#2563eb"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizerFull;
