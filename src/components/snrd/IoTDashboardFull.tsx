import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type DeviceStatus = 'online' | 'warning' | 'alert' | 'offline';
type MapLayer = 'temperature' | 'humidity' | 'pressure';

interface HvacDevice {
  id: string;
  name: string;
  type: string;
  zone: string;
  zoneId: string;
  temp: number;       // °C
  humidity: number;   // %
  power: number;      // кВт
  status: DeviceStatus;
  updatedAt: string;
  // map coords (viewBox 0 0 400 300)
  cx: number;
  cy: number;
  // detail extras
  pressure: number;   // бар
}

interface IoTEvent {
  id: string;
  time: string;
  device: string;
  event: string;
  value: string;
  severity: 'critical' | 'warning' | 'info';
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DEVICES: HvacDevice[] = [
  { id: 'vrf1',  name: 'VRF-система Daikin VRV-IV', type: 'VRF-система',        zone: 'Зал А',     zoneId: 'hallA',   temp: 22.1, humidity: 51, power: 18.4, status: 'online',  updatedAt: '1 мин назад',  cx: 95,  cy: 75,  pressure: 5.1 },
  { id: 'chl1',  name: 'Чиллер York YLAA',           type: 'Чиллер',             zone: 'Зал Б',     zoneId: 'hallB',   temp: 34.2, humidity: 48, power: 42.0, status: 'alert',   updatedAt: '2 мин назад',  cx: 290, cy: 80,  pressure: 4.2 },
  { id: 'ahu1',  name: 'Приточная уст. Systemair',   type: 'Приточная установка', zone: 'Зал А',     zoneId: 'hallA',   temp: 21.8, humidity: 55, power: 7.2,  status: 'online',  updatedAt: '1 мин назад',  cx: 110, cy: 110, pressure: 5.4 },
  { id: 'exh1',  name: 'Вытяжка Ostberg CK',         type: 'Вытяжка',            zone: 'Склад',     zoneId: 'storage', temp: 28.5, humidity: 62, power: 3.1,  status: 'warning', updatedAt: '5 мин назад',  cx: 250, cy: 195, pressure: 5.0 },
  { id: 'fc1',   name: 'Фанкойл Daikin FWB #1',      type: 'Фанкойл',            zone: 'Офисы',     zoneId: 'offices', temp: 23.0, humidity: 50, power: 1.8,  status: 'online',  updatedAt: '2 мин назад',  cx: 330, cy: 195, pressure: 5.2 },
  { id: 'fc2',   name: 'Фанкойл Daikin FWB #2',      type: 'Фанкойл',            zone: 'Офисы',     zoneId: 'offices', temp: 22.7, humidity: 49, power: 1.9,  status: 'online',  updatedAt: '2 мин назад',  cx: 350, cy: 215, pressure: 5.3 },
  { id: 'fc3',   name: 'Фанкойл Carrier 42С #3',     type: 'Фанкойл',            zone: 'Зал Б',     zoneId: 'hallB',   temp: 22.3, humidity: 53, power: 2.1,  status: 'online',  updatedAt: '3 мин назад',  cx: 270, cy: 110, pressure: 5.1 },
  { id: 'fc4',   name: 'Фанкойл Carrier 42С #4',     type: 'Фанкойл',            zone: 'Серверная', zoneId: 'server',  temp: 19.5, humidity: 44, power: 2.4,  status: 'online',  updatedAt: '1 мин назад',  cx: 175, cy: 245, pressure: 5.5 },
  { id: 'fc5',   name: 'Фанкойл LG PTAC #5',         type: 'Фанкойл',            zone: 'Склад',     zoneId: 'storage', temp: 29.1, humidity: 63, power: 2.0,  status: 'warning', updatedAt: '8 мин назад',  cx: 225, cy: 210, pressure: 4.8 },
  { id: 'hp1',   name: 'Тепловой насос Mitsubishi',  type: 'Тепловой насос',     zone: 'Зал А',     zoneId: 'hallA',   temp: 22.5, humidity: 52, power: 14.0, status: 'online',  updatedAt: '2 мин назад',  cx: 80,  cy: 140, pressure: 5.3 },
  { id: 'cmp1',  name: 'Компрессор Copeland ZR',     type: 'Компрессор',         zone: 'Серверная', zoneId: 'server',  temp: 31.0, humidity: 45, power: 11.5, status: 'alert',   updatedAt: '4 мин назад',  cx: 155, cy: 225, pressure: 3.8 },
];

const IOT_EVENTS: IoTEvent[] = [
  { id: 'e1', time: '14:03', device: 'Чиллер York YLAA',        event: 'Температура превысила порог 34°C',    value: '34.2°C',  severity: 'critical' },
  { id: 'e2', time: '13:47', device: 'Компрессор Copeland ZR',  event: 'Давление ниже нормы',                 value: '3.8 бар', severity: 'critical' },
  { id: 'e3', time: '13:22', device: 'Вытяжка Ostberg CK',      event: 'Высокая влажность в зоне',            value: '62%',     severity: 'warning'  },
  { id: 'e4', time: '12:55', device: 'Фанкойл LG PTAC #5',     event: 'Температура склада выше нормы',       value: '29.1°C',  severity: 'warning'  },
  { id: 'e5', time: '12:10', device: 'Приточная уст. Systemair',event: 'Плановая телеметрия OK',              value: 'OK',      severity: 'info'     },
  { id: 'e6', time: '11:40', device: 'VRF-система Daikin VRV-IV',event: 'Плановое переключение режима',       value: 'Охлаждение', severity: 'info'  },
  { id: 'e7', time: '10:15', device: 'Тепловой насос Mitsubishi',event: 'Самодиагностика завершена',          value: 'Норма',   severity: 'info'     },
  { id: 'e8', time: '09:03', device: 'Фанкойл Daikin FWB #1',  event: 'Запуск после ночного режима',         value: '23.0°C',  severity: 'info'     },
];

// Building zones for SVG floor plan
const ZONES = [
  { id: 'hallA',   label: 'Зал А',     x: 20,  y: 20,  w: 160, h: 150 },
  { id: 'hallB',   label: 'Зал Б',     x: 200, y: 20,  w: 180, h: 150 },
  { id: 'storage', label: 'Склад',     x: 200, y: 180, w: 120, h: 100 },
  { id: 'server',  label: 'Серверная', x: 120, y: 200, w: 80,  h: 80  },
  { id: 'offices', label: 'Офисы',     x: 320, y: 170, w: 60,  h: 120 },
];

// ─── Deterministic chart data ─────────────────────────────────────────────────

function makeTempHistory(baseTemp: number): { time: string; temp: number }[] {
  return Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    const noise = Math.sin(i * 0.45) * 2.1 + Math.cos(i * 1.2) * 0.8;
    return { time: `${h}:${m}`, temp: +(baseTemp + noise).toFixed(1) };
  });
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<DeviceStatus, { label: string; dot: string; rowBg: string; badge: string }> = {
  online:  { label: 'Норма',       dot: '#22c55e', rowBg: '',                      badge: 'bg-green-100 text-green-700'  },
  warning: { label: 'Внимание',    dot: '#eab308', rowBg: 'bg-yellow-50',          badge: 'bg-yellow-100 text-yellow-700' },
  alert:   { label: 'Алерт',      dot: '#ef4444', rowBg: 'bg-red-50',             badge: 'bg-red-100 text-red-700'      },
  offline: { label: 'Офлайн',     dot: '#9ca3af', rowBg: 'bg-gray-50 opacity-60', badge: 'bg-gray-100 text-gray-500'    },
};

const SEVERITY_CFG = {
  critical: { color: 'text-red-600',    bg: 'bg-red-50',    icon: 'AlertCircle' },
  warning:  { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: 'AlertTriangle' },
  info:     { color: 'text-blue-600',   bg: 'bg-blue-50',   icon: 'Info' },
};

// Layer value accessor
function getLayerValue(device: HvacDevice, layer: MapLayer): number {
  if (layer === 'temperature') return device.temp;
  if (layer === 'humidity')    return device.humidity;
  return device.pressure;
}

function layerColor(device: HvacDevice, layer: MapLayer): string {
  const v = getLayerValue(device, layer);
  if (device.status === 'alert')   return '#ef4444';
  if (device.status === 'warning') return '#eab308';
  if (device.status === 'offline') return '#9ca3af';
  if (layer === 'temperature' && v > 28) return '#f97316';
  if (layer === 'humidity'    && v > 60) return '#a78bfa';
  if (layer === 'pressure'    && v < 4.5) return '#f97316';
  return '#22c55e';
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
  iconColor,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon name={icon as any} size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── SVG Floor Plan ───────────────────────────────────────────────────────────

function FloorPlan({
  devices,
  layer,
  selectedId,
  onSelectDevice,
}: {
  devices: HvacDevice[];
  layer: MapLayer;
  selectedId: string | null;
  onSelectDevice: (id: string) => void;
}) {
  const zoneColors: Record<string, string> = {
    hallA:   '#eff6ff',
    hallB:   '#f0fdf4',
    storage: '#fefce8',
    server:  '#f5f3ff',
    offices: '#fff7ed',
  };

  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full border border-gray-200 rounded-xl bg-gray-50"
      style={{ fontFamily: 'inherit' }}
    >
      {/* Outer building border */}
      <rect x="10" y="10" width="375" height="280" rx="6" ry="6"
        fill="white" stroke="#d1d5db" strokeWidth="1.5" />

      {/* Zones */}
      {ZONES.map((z) => (
        <g key={z.id}>
          <rect
            x={z.x} y={z.y} width={z.w} height={z.h}
            rx="4" ry="4"
            fill={zoneColors[z.id] ?? '#f9fafb'}
            stroke="#d1d5db"
            strokeWidth="1"
          />
          <text
            x={z.x + z.w / 2}
            y={z.y + 14}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#6b7280"
          >
            {z.label}
          </text>
        </g>
      ))}

      {/* Devices */}
      {devices.map((d) => {
        const fill = layerColor(d, layer);
        const isSelected = selectedId === d.id;
        const val = getLayerValue(d, layer);
        const unit = layer === 'temperature' ? '°' : layer === 'humidity' ? '%' : 'б';

        return (
          <g
            key={d.id}
            onClick={() => onSelectDevice(d.id)}
            style={{ cursor: 'pointer' }}
          >
            {/* Pulse ring for alerts */}
            {(d.status === 'alert' || d.status === 'warning') && (
              <circle
                cx={d.cx} cy={d.cy} r="11"
                fill="none"
                stroke={fill}
                strokeWidth="1.5"
                opacity="0.4"
              />
            )}
            {/* Selection ring */}
            {isSelected && (
              <circle cx={d.cx} cy={d.cy} r="13"
                fill="none" stroke="#3b82f6" strokeWidth="2" />
            )}
            {/* Main dot */}
            <circle cx={d.cx} cy={d.cy} r="7" fill={fill} />
            {/* Value label */}
            <text
              x={d.cx}
              y={d.cy + 18}
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill="#374151"
            >
              {val}{unit}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      {[
        { color: '#22c55e', label: 'Норма' },
        { color: '#eab308', label: 'Внимание' },
        { color: '#ef4444', label: 'Алерт' },
      ].map((item, i) => (
        <g key={item.label} transform={`translate(${14 + i * 75}, 288)`}>
          <circle cx="5" cy="-3" r="4" fill={item.color} />
          <text x="12" y="0" fontSize="8" fill="#6b7280">{item.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Device Table ─────────────────────────────────────────────────────────────

function DeviceTable({
  devices,
  selectedId,
  onSelect,
}: {
  devices: HvacDevice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Устройство</th>
            <th className="px-4 py-3 text-left">Зона</th>
            <th className="px-4 py-3 text-right">Темп °C</th>
            <th className="px-4 py-3 text-right">Влажность %</th>
            <th className="px-4 py-3 text-right">Мощность кВт</th>
            <th className="px-4 py-3 text-center">Статус</th>
            <th className="px-4 py-3 text-right">Обновлено</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {devices.map((d) => {
            const cfg = STATUS_CFG[d.status];
            const isAlert = d.status === 'alert';
            const isSelected = selectedId === d.id;
            return (
              <tr
                key={d.id}
                onClick={() => onSelect(d.id)}
                className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                  isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : cfg.rowBg
                }`}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cfg.dot }}
                    />
                    <span className="font-medium text-gray-800 leading-tight">{d.name}</span>
                  </div>
                  <span className="ml-4 text-xs text-gray-400">{d.type}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-500">{d.zone}</td>
                <td className={`px-4 py-2.5 text-right font-semibold ${isAlert || d.temp > 30 ? 'text-red-600' : 'text-gray-700'}`}>
                  {d.temp}
                </td>
                <td className={`px-4 py-2.5 text-right font-semibold ${d.humidity > 60 ? 'text-yellow-600' : 'text-gray-700'}`}>
                  {d.humidity}
                </td>
                <td className="px-4 py-2.5 text-right text-gray-700 font-semibold">
                  {d.power}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-400 text-xs">{d.updatedAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  device,
  onClose,
}: {
  device: HvacDevice;
  onClose: () => void;
}) {
  const chartData = useMemo(() => makeTempHistory(device.temp), [device.id]);
  const cfg = STATUS_CFG[device.status];

  const params = [
    { label: 'Температура', value: `${device.temp} °C`, icon: 'Thermometer', color: 'text-orange-500' },
    { label: 'Влажность',   value: `${device.humidity} %`, icon: 'Droplets',    color: 'text-blue-500'   },
    { label: 'Давление',    value: `${device.pressure} бар`, icon: 'Gauge',       color: 'text-purple-500' },
    { label: 'Мощность',    value: `${device.power} кВт`,    icon: 'Zap',         color: 'text-yellow-500' },
  ];

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-md p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{device.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{device.type} · {device.zone}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      </div>

      {/* 4 param cards */}
      <div className="grid grid-cols-4 gap-3">
        {params.map((p) => (
          <div key={p.label} className="bg-gray-50 rounded-lg px-3 py-2.5 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Icon name={p.icon as any} size={13} className={p.color} />
              <span className="text-xs text-gray-400">{p.label}</span>
            </div>
            <span className="text-lg font-bold text-gray-800 leading-tight">{p.value}</span>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
          <Icon name="TrendingUp" size={13} className="text-blue-500" />
          Температура за 24 часа (каждые 30 мин)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={7} />
            <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              formatter={(v: number) => [`${v} °C`, 'Температура']}
            />
            {/* Critical upper threshold */}
            <ReferenceLine
              y={30}
              stroke="#ef4444"
              strokeDasharray="5 3"
              label={{ value: '+30°C', fontSize: 9, fill: '#ef4444', position: 'insideTopRight' }}
            />
            {/* Lower threshold */}
            <ReferenceLine
              y={5}
              stroke="#3b82f6"
              strokeDasharray="5 3"
              label={{ value: '+5°C', fontSize: 9, fill: '#3b82f6', position: 'insideBottomRight' }}
            />
            <Area
              type="monotone"
              dataKey="temp"
              name="Температура"
              stroke="#3b82f6"
              fill="url(#gradTemp)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast.success('Наряд создан', {
              description: `${device.name} — ${device.zone}`,
            })
          }
        >
          <Icon name="Wrench" size={14} />
          Создать наряд
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast.info('Настройка алертов', {
              description: `Откройте настройки для ${device.name}`,
            })
          }
        >
          <Icon name="Bell" size={14} />
          Настроить алерты
        </Button>
        <span className="ml-auto text-xs text-gray-400">
          Обновлено: {device.updatedAt}
        </span>
      </div>
    </div>
  );
}

// ─── Event log ────────────────────────────────────────────────────────────────

function EventLog({ events }: { events: IoTEvent[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <Icon name="Activity" size={15} className="text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">Журнал событий</span>
        <span className="ml-auto text-xs text-gray-400">{events.length} событий</span>
      </div>
      <div className="divide-y divide-gray-50">
        {events.map((ev) => {
          const sev = SEVERITY_CFG[ev.severity];
          return (
            <div key={ev.id} className={`flex items-center gap-3 px-5 py-2.5 ${sev.bg}`}>
              <Icon name={sev.icon as any} size={14} className={sev.color} />
              <span className="text-xs font-mono text-gray-400 w-12 flex-shrink-0">{ev.time}</span>
              <span className="text-xs font-semibold text-gray-600 w-44 flex-shrink-0 truncate">{ev.device}</span>
              <span className="text-xs text-gray-700 flex-1">{ev.event}</span>
              <span className={`text-xs font-semibold flex-shrink-0 ${sev.color}`}>{ev.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IoTDashboardFull() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<MapLayer>('temperature');

  const selectedDevice = DEVICES.find((d) => d.id === selectedId) ?? null;

  const onlineCount   = DEVICES.filter((d) => d.status === 'online').length;
  const totalCount    = DEVICES.length;
  const alertCount    = DEVICES.filter((d) => d.status === 'alert' || d.status === 'warning').length;
  const criticalCount = DEVICES.filter((d) => d.status === 'alert').length;
  const avgTemp       = (
    DEVICES.filter((d) => d.status !== 'offline').reduce((s, d) => s + d.temp, 0) /
    DEVICES.filter((d) => d.status !== 'offline').length
  ).toFixed(1);

  function handleSelectDevice(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  const LAYER_OPTIONS: { key: MapLayer; label: string }[] = [
    { key: 'temperature', label: 'Температура' },
    { key: 'humidity',    label: 'Влажность'   },
    { key: 'pressure',    label: 'Давление'     },
  ];

  return (
    <div className="flex flex-col gap-5 p-5 bg-gray-50 min-h-full">

      {/* ── Top metrics ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon="Wifi"
          label="Онлайн устройств"
          value={`${onlineCount} / ${totalCount}`}
          sub="активных устройств"
          iconColor="bg-green-500"
        />
        <MetricCard
          icon="AlertTriangle"
          label="Алертов"
          value={String(alertCount)}
          sub="требуют внимания"
          iconColor="bg-yellow-500"
        />
        <MetricCard
          icon="AlertCircle"
          label="Критических"
          value={String(criticalCount)}
          sub="аварийных ситуаций"
          iconColor="bg-red-500"
        />
        <MetricCard
          icon="Thermometer"
          label="Средняя температура"
          value={`${avgTemp} °C`}
          sub="по всем зонам"
          iconColor="bg-blue-500"
        />
      </div>

      {/* ── Main content: floor plan + table ── */}
      <div className="flex gap-5 items-start">

        {/* ── Floor plan (≈40% width) ── */}
        <div className="w-[40%] flex-shrink-0 space-y-3">
          {/* Layer switcher */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
            {LAYER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMapLayer(opt.key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mapLayer === opt.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-[300px]">
            <FloorPlan
              devices={DEVICES}
              layer={mapLayer}
              selectedId={selectedId}
              onSelectDevice={handleSelectDevice}
            />
          </div>

          <p className="text-xs text-gray-400 text-center">
            Кликните на устройство для детальной информации
          </p>
        </div>

        {/* ── Device table ── */}
        <div className="flex-1 overflow-hidden">
          <DeviceTable
            devices={DEVICES}
            selectedId={selectedId}
            onSelect={handleSelectDevice}
          />
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selectedDevice && (
        <DetailPanel
          device={selectedDevice}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* ── Event log ── */}
      <EventLog events={IOT_EVENTS} />
    </div>
  );
}
