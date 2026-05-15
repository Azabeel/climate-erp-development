import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type DeviceStatus = 'online' | 'offline' | 'alert';
type ViewMode = 'cards' | 'table';
type AlertSeverity = 'critical' | 'warning' | 'info';

interface IoTDevice {
  id: string;
  name: string;
  object: string;
  status: DeviceStatus;
  iconType: 'thermometer' | 'wind' | 'droplets';
  outletTemp: number; // °C — температура воздуха на выходе
  current: number;    // А
  runHours: number;   // часов работы
}

interface Alert {
  id: string;
  type: string;
  device: string;
  time: string;
  severity: AlertSeverity;
  acknowledged: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DEVICES: IoTDevice[] = [
  { id: 'd01', name: 'Daikin VRV-IV #1',         object: 'ТЦ Европа',      status: 'online',  iconType: 'thermometer', outletTemp: 18.4, current: 14.2, runHours: 2840 },
  { id: 'd02', name: 'Daikin VRV-IV #2',         object: 'ТЦ Европа',      status: 'online',  iconType: 'wind',        outletTemp: 17.9, current: 13.8, runHours: 2610 },
  { id: 'd03', name: 'Mitsubishi Heavy SRK',     object: 'ТЦ Европа',      status: 'alert',   iconType: 'thermometer', outletTemp: 31.2, current: 22.5, runHours: 1920 },
  { id: 'd04', name: 'Carrier 38QHC',            object: 'Офис Газпром',   status: 'online',  iconType: 'droplets',    outletTemp: 20.1, current: 10.8, runHours: 3401 },
  { id: 'd05', name: 'Gree GMV6 #1',             object: 'Офис Газпром',   status: 'online',  iconType: 'wind',        outletTemp: 19.5, current: 11.3, runHours: 2175 },
  { id: 'd06', name: 'Gree GMV6 #2',             object: 'Офис Газпром',   status: 'offline', iconType: 'wind',        outletTemp: 0,    current: 0,    runHours: 2140 },
  { id: 'd07', name: 'Toshiba Super Digital',    object: 'Завод Ростех',   status: 'online',  iconType: 'thermometer', outletTemp: 16.7, current: 9.4,  runHours: 4820 },
  { id: 'd08', name: 'Haier AD482 #1',           object: 'Завод Ростех',   status: 'alert',   iconType: 'droplets',    outletTemp: 29.8, current: 20.1, runHours: 3210 },
  { id: 'd09', name: 'Haier AD482 #2',           object: 'Завод Ростех',   status: 'online',  iconType: 'droplets',    outletTemp: 17.2, current: 10.5, runHours: 3190 },
  { id: 'd10', name: 'LG Multi V5 #1',           object: 'ТЦ Аврора',     status: 'online',  iconType: 'wind',        outletTemp: 21.3, current: 15.6, runHours: 1650 },
  { id: 'd11', name: 'LG Multi V5 #2',           object: 'ТЦ Аврора',     status: 'offline', iconType: 'wind',        outletTemp: 0,    current: 0,    runHours: 1640 },
  { id: 'd12', name: 'Samsung DVM S',            object: 'ТЦ Аврора',     status: 'alert',   iconType: 'thermometer', outletTemp: 33.5, current: 24.7, runHours: 980  },
];

const ALERTS: Alert[] = [
  { id: 'a1', type: 'Высокая температура',  device: 'Mitsubishi Heavy SRK', time: '14:03', severity: 'critical', acknowledged: false },
  { id: 'a2', type: 'Превышение тока',      device: 'Samsung DVM S',        time: '13:51', severity: 'critical', acknowledged: false },
  { id: 'a3', type: 'Ошибка связи',         device: 'Gree GMV6 #2',         time: '13:22', severity: 'warning',  acknowledged: false },
  { id: 'a4', type: 'Ошибка связи',         device: 'LG Multi V5 #2',       time: '12:47', severity: 'warning',  acknowledged: false },
  { id: 'a5', type: 'Высокая температура',  device: 'Haier AD482 #1',       time: '11:39', severity: 'critical', acknowledged: false },
  { id: 'a6', type: 'Низкое давление',      device: 'Haier AD482 #1',       time: '11:39', severity: 'warning',  acknowledged: false },
  { id: 'a7', type: 'Превышение тока',      device: 'Mitsubishi Heavy SRK', time: '10:14', severity: 'warning',  acknowledged: false },
  { id: 'a8', type: 'Вибрация компрессора', device: 'Samsung DVM S',        time: '09:58', severity: 'info',     acknowledged: false },
];

// 24-hour telemetry for selected device (generated deterministically)
function makeTempData(baseTemp: number) {
  return Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, '0') + ':00';
    const noise = Math.sin(i * 0.6) * 2.5 + Math.cos(i * 1.1) * 1.2;
    const setpoint = baseTemp < 10 ? 0 : 22; // offline → 0
    const actual = baseTemp < 10 ? 0 : +(baseTemp + noise).toFixed(1);
    return { time: h, setpoint, actual };
  });
}

function makeCurrentData(baseCurrent: number) {
  return Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, '0') + ':00';
    const noise = Math.sin(i * 0.8) * 1.8;
    return { time: h, current: baseCurrent < 1 ? 0 : +(baseCurrent + noise).toFixed(1) };
  });
}

const ENERGY_DATA = [
  { object: 'ТЦ Европа',    kwh: 4820 },
  { object: 'Офис Газпром', kwh: 3140 },
  { object: 'Завод Ростех', kwh: 6275 },
  { object: 'ТЦ Аврора',   kwh: 2890 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<DeviceStatus, { label: string; stripe: string; badge: string; dot: string }> = {
  online:  { label: 'Online',   stripe: 'bg-green-500',  badge: 'bg-green-100 text-green-700', dot: 'bg-green-500'  },
  alert:   { label: 'Alert',    stripe: 'bg-yellow-400', badge: 'bg-red-100 text-red-700',     dot: 'bg-yellow-400' },
  offline: { label: 'Offline',  stripe: 'bg-red-500',    badge: 'bg-gray-100 text-gray-500',   dot: 'bg-red-500'    },
};

const SEVERITY_CFG: Record<AlertSeverity, { color: string; label: string }> = {
  critical: { color: 'bg-red-100 text-red-700 border-red-300',        label: 'Критично' },
  warning:  { color: 'bg-yellow-50 text-yellow-700 border-yellow-300', label: 'Внимание' },
  info:     { color: 'bg-blue-50 text-blue-600 border-blue-200',       label: 'Инфо'     },
};

const DEVICE_ICONS: Record<IoTDevice['iconType'], string> = {
  thermometer: 'Thermometer',
  wind:        'Wind',
  droplets:    'Droplets',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DeviceCard({
  device,
  selected,
  onClick,
}: {
  device: IoTDevice;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CFG[device.status];
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md focus:outline-none ${
        selected ? 'ring-2 ring-blue-500 border-blue-400' : 'border-gray-200'
      }`}
    >
      {/* colour stripe */}
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${cfg.stripe}`} />

      <div className="flex items-start justify-between pl-1">
        <div className="flex items-center gap-2">
          <Icon name={DEVICE_ICONS[device.iconType] as any} size={20} className="text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{device.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{device.object}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <div className="pl-1 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-400">Выход, °C</p>
          <p className={`text-base font-bold ${device.outletTemp > 28 ? 'text-red-600' : 'text-gray-800'}`}>
            {device.status === 'offline' ? '—' : device.outletTemp}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Ток, А</p>
          <p className={`text-base font-bold ${device.current > 18 ? 'text-red-600' : 'text-gray-800'}`}>
            {device.status === 'offline' ? '—' : device.current}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Часов</p>
          <p className="text-base font-bold text-gray-800">
            {device.status === 'offline' ? '—' : device.runHours.toLocaleString('ru-RU')}
          </p>
        </div>
      </div>
    </button>
  );
}

function DeviceTable({
  devices,
  selectedId,
  onSelect,
}: {
  devices: IoTDevice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Устройство</th>
            <th className="px-4 py-3 text-left">Объект</th>
            <th className="px-4 py-3 text-center">Статус</th>
            <th className="px-4 py-3 text-right">Выход °C</th>
            <th className="px-4 py-3 text-right">Ток А</th>
            <th className="px-4 py-3 text-right">Часов работы</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {devices.map((d) => {
            const cfg = STATUS_CFG[d.status];
            return (
              <tr
                key={d.id}
                onClick={() => onSelect(d.id)}
                className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                  selectedId === d.id ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-3 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <Icon name={DEVICE_ICONS[d.iconType] as any} size={15} className="text-blue-400" />
                  <span className="font-medium text-gray-800">{d.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{d.object}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${d.outletTemp > 28 ? 'text-red-600' : 'text-gray-700'}`}>
                  {d.status === 'offline' ? '—' : `${d.outletTemp} °C`}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${d.current > 18 ? 'text-red-600' : 'text-gray-700'}`}>
                  {d.status === 'offline' ? '—' : `${d.current} А`}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {d.status === 'offline' ? '—' : d.runHours.toLocaleString('ru-RU')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IoTDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS);

  const selectedDevice = DEVICES.find((d) => d.id === selectedId) ?? null;

  const onlineCount = DEVICES.filter((d) => d.status === 'online').length;
  const totalCount = DEVICES.length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  const tempData    = selectedDevice ? makeTempData(selectedDevice.outletTemp) : [];
  const currentData = selectedDevice ? makeCurrentData(selectedDevice.current) : [];

  const deviceEvents = [
    { time: '14:03', text: 'Тревога: температура подачи превысила норму' },
    { time: '12:30', text: 'Автоматический сброс ошибки E03' },
    { time: '09:05', text: 'Плановая телеметрия пройдена без замечаний' },
    { time: '07:00', text: 'Устройство запущено после ночного режима' },
    { time: 'вчера 23:15', text: 'Переход в ночной режим (уставка 26°C)' },
  ];

  function acknowledgeAlert(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    toast.success('Алерт квитирован');
  }

  function createOrder(alert: Alert) {
    toast.success('Наряд создан', {
      description: `${alert.type} — ${alert.device}`,
    });
  }

  function handleCardClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 flex-wrap flex-shrink-0">
        {/* title */}
        <div className="flex items-center gap-2">
          <Icon name="Cpu" size={18} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">IoT Мониторинг HVAC</span>
        </div>

        {/* kpi chips */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          <span className="text-sm text-gray-600">Онлайн устройств:</span>
          <span className="text-sm font-bold text-green-700">{onlineCount} из {totalCount}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Icon name="AlertTriangle" size={14} className="text-red-500" />
          <span className="text-sm text-gray-600">Алертов:</span>
          <Badge className="bg-red-500 text-white text-xs px-1.5 py-0">{activeAlerts.length} активных</Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Icon name="Clock" size={14} className="text-gray-400" />
          <span className="text-sm text-gray-500">Обновлено: 2 мин назад</span>
        </div>

        {/* view toggle */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-3 text-xs gap-1"
            onClick={() => setViewMode('cards')}
          >
            <Icon name="LayoutGrid" size={13} />
            Карточки
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-3 text-xs gap-1"
            onClick={() => setViewMode('table')}
          >
            <Icon name="Table" size={13} />
            Таблица
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Main column ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Device grid / table */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-4 gap-4">
              {DEVICES.map((d) => (
                <DeviceCard
                  key={d.id}
                  device={d}
                  selected={selectedId === d.id}
                  onClick={() => handleCardClick(d.id)}
                />
              ))}
            </div>
          ) : (
            <DeviceTable
              devices={DEVICES}
              selectedId={selectedId}
              onSelect={(id) => handleCardClick(id)}
            />
          )}

          {/* ── Detail panel ── */}
          {selectedDevice && (
            <div className="space-y-4 rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">{selectedDevice.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedDevice.object}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CFG[selectedDevice.status].badge}`}>
                    {STATUS_CFG[selectedDevice.status].label}
                  </span>
                  <Button
                    size="sm"
                    onClick={() =>
                      toast.success('Наряд создан', { description: selectedDevice.name })
                    }
                  >
                    Создать наряд
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* AreaChart — температура */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Icon name="Thermometer" size={13} className="text-orange-400" />
                    Температура воздуха, °C (24 ч)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={tempData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradSetpoint" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={5} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="setpoint" name="Уставка" stroke="#6366f1" fill="url(#gradSetpoint)" strokeWidth={1.5} dot={false} />
                      <Area type="monotone" dataKey="actual"   name="Факт"    stroke="#f97316" fill="url(#gradActual)"   strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* LineChart — ток */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Icon name="Zap" size={13} className="text-yellow-500" />
                    Ток компрессора, А (24 ч)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={currentData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={5} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="current" name="Ток, А" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Last 5 events */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                  <Icon name="ListChecks" size={13} className="text-gray-400" />
                  Последние события
                </p>
                <div className="space-y-1.5">
                  {deviceEvents.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-400 font-mono w-24 flex-shrink-0 mt-0.5">{ev.time}</span>
                      <span className="text-gray-700">{ev.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Energy BarChart ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Icon name="BarChart2" size={16} className="text-blue-500" />
              Потребление электроэнергии по объектам за месяц, кВт·ч
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ENERGY_DATA} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="object" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v: number) => [`${v.toLocaleString('ru-RU')} кВт·ч`, 'Потребление']}
                />
                <Bar dataKey="kwh" name="кВт·ч" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Alerts sidebar ── */}
        <div className="w-[280px] border-l border-gray-200 bg-white flex flex-col flex-shrink-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="BellRing" size={15} className="text-red-500" />
              <span className="text-sm font-semibold text-gray-700">Алерты</span>
            </div>
            <Badge className="bg-red-500 text-white text-xs px-1.5 py-0">{activeAlerts.length}</Badge>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {alerts.map((alert) => {
              const sev = SEVERITY_CFG[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={`px-4 py-3 space-y-2 transition-opacity ${alert.acknowledged ? 'opacity-40' : ''}`}
                >
                  <div className={`rounded-lg border px-2.5 py-1.5 ${sev.color}`}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold">{alert.type}</span>
                      <span className="text-xs opacity-70">{sev.label}</span>
                    </div>
                    <p className="text-xs mt-0.5 opacity-80">{alert.device}</p>
                    <p className="text-xs opacity-60 mt-0.5">{alert.time}</p>
                  </div>

                  {!alert.acknowledged && (
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-6 text-xs"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Квитировать
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-6 text-xs"
                        onClick={() => createOrder(alert)}
                      >
                        Наряд
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
