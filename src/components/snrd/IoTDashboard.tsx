import { useState } from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Thermometer,
  Zap,
  Wind,
  Activity,
  BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type DeviceStatus = 'online' | 'offline' | 'alert';
type TimeRange = '1h' | '6h' | '24h' | '7d';

interface DeviceSensors {
  supplyTemp: number;
  returnTemp: number;
  refrigPressureHigh: number;
  refrigPressureLow: number;
  compressorCurrent: number;
  fanSpeed: number;
  vibration: number;
  powerConsumption: number;
}

interface IoTDevice {
  id: string;
  name: string;
  status: DeviceStatus;
  lastSeen: string;
  sensors: DeviceSensors;
  alerts: string[];
}

const IOT_DEVICES: IoTDevice[] = [
  {
    id: 'd1',
    name: 'Daikin VRV-IV (ТЦ Мираж, этаж 2)',
    status: 'online',
    lastSeen: '2 мин назад',
    sensors: {
      supplyTemp: 18.4,
      returnTemp: 24.1,
      refrigPressureHigh: 2.8,
      refrigPressureLow: 0.52,
      compressorCurrent: 14.2,
      fanSpeed: 72,
      vibration: 1.1,
      powerConsumption: 8.4,
    },
    alerts: [],
  },
  {
    id: 'd2',
    name: 'Mitsubishi Heavy SRK (Офис Альфа, 3 эт.)',
    status: 'online',
    lastSeen: '1 мин назад',
    sensors: {
      supplyTemp: 20.1,
      returnTemp: 25.5,
      refrigPressureHigh: 2.6,
      refrigPressureLow: 0.49,
      compressorCurrent: 10.8,
      fanSpeed: 60,
      vibration: 0.8,
      powerConsumption: 5.9,
    },
    alerts: [],
  },
  {
    id: 'd3',
    name: 'Carrier 38QHC (ТРЦ Галерея, зал А)',
    status: 'alert',
    lastSeen: '3 мин назад',
    sensors: {
      supplyTemp: 28.7,
      returnTemp: 27.2,
      refrigPressureHigh: 3.6,
      refrigPressureLow: 0.31,
      compressorCurrent: 22.5,
      fanSpeed: 95,
      vibration: 4.8,
      powerConsumption: 14.1,
    },
    alerts: [
      'Высокое давление нагнетания (3.6 МПа > норма 3.2 МПа)',
      'Повышенная вибрация компрессора (4.8 мм/с > норма 3.5 мм/с)',
    ],
  },
  {
    id: 'd4',
    name: 'Gree GMV6 (Склад №3, зона охлаждения)',
    status: 'alert',
    lastSeen: '5 мин назад',
    sensors: {
      supplyTemp: 32.2,
      returnTemp: 28.0,
      refrigPressureHigh: 3.4,
      refrigPressureLow: 0.28,
      compressorCurrent: 19.7,
      fanSpeed: 100,
      vibration: 2.9,
      powerConsumption: 12.3,
    },
    alerts: [
      'Температура подачи выше нормы (+32.2°C, норма до +25°C)',
      'Низкое давление всасывания (0.28 МПа < норма 0.4 МПа)',
      'Перегрев компрессора — рекомендуется осмотр',
    ],
  },
  {
    id: 'd5',
    name: 'Toshiba Super Digital (ЖК Радуга, лобби)',
    status: 'offline',
    lastSeen: '4 ч назад',
    sensors: {
      supplyTemp: 0,
      returnTemp: 0,
      refrigPressureHigh: 0,
      refrigPressureLow: 0,
      compressorCurrent: 0,
      fanSpeed: 0,
      vibration: 0,
      powerConsumption: 0,
    },
    alerts: [],
  },
  {
    id: 'd6',
    name: 'Haier AD482MHERA (БЦ Горизонт, 7 эт.)',
    status: 'offline',
    lastSeen: '1 д назад',
    sensors: {
      supplyTemp: 0,
      returnTemp: 0,
      refrigPressureHigh: 0,
      refrigPressureLow: 0,
      compressorCurrent: 0,
      fanSpeed: 0,
      vibration: 0,
      powerConsumption: 0,
    },
    alerts: [],
  },
];

function generateTelemetryData(baseTemp: number, baseCurrent: number, points: number) {
  return Array.from({ length: points }, (_, i) => {
    const label = `${String(Math.floor((i * (24 / points)))).padStart(2, '0')}:00`;
    return {
      time: label,
      supplyTemp: +(baseTemp + (Math.random() - 0.5) * 3).toFixed(1),
      compressorCurrent: +(baseCurrent + (Math.random() - 0.5) * 4).toFixed(1),
    };
  });
}

interface SensorCardProps {
  label: string;
  value: number;
  unit: string;
  normal: string;
  isAlert: boolean;
  icon: React.ReactNode;
}

function SensorCard({ label, value, unit, normal, isAlert, icon }: SensorCardProps) {
  return (
    <div
      className={`rounded-lg border p-3 flex flex-col gap-1 ${
        isAlert ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
      }`}
      title={`Норма: ${normal}`}
    >
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-xl font-bold ${isAlert ? 'text-red-600' : 'text-gray-800'}`}>
        {value}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </div>
      <div className="text-xs text-gray-400">Норма: {normal}</div>
    </div>
  );
}

const STATUS_META: Record<DeviceStatus, { label: string; color: string; dot: string }> = {
  online: { label: 'Онлайн', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  alert: { label: 'Тревога', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  offline: { label: 'Офлайн', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

export default function IoTDashboard() {
  const [selected, setSelected] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const selectedDevice = IOT_DEVICES.find((d) => d.id === selected) ?? null;

  const onlineDevices = IOT_DEVICES.filter((d) => d.status === 'online');
  const alertDevices = IOT_DEVICES.filter((d) => d.status === 'alert');
  const offlineDevices = IOT_DEVICES.filter((d) => d.status === 'offline');
  const totalPower = onlineDevices.reduce((sum, d) => sum + d.sensors.powerConsumption, 0);

  const telemetryData = selectedDevice
    ? generateTelemetryData(
        selectedDevice.sensors.supplyTemp || 20,
        selectedDevice.sensors.compressorCurrent || 12,
        24
      )
    : [];

  function getSensorCards(device: IoTDevice) {
    const s = device.sensors;
    return [
      {
        label: 'Температура подачи',
        value: s.supplyTemp,
        unit: '°C',
        normal: '16–25°C',
        isAlert: s.supplyTemp > 25 || s.supplyTemp < 16,
        icon: <Thermometer size={12} />,
      },
      {
        label: 'Температура возврата',
        value: s.returnTemp,
        unit: '°C',
        normal: '20–28°C',
        isAlert: s.returnTemp > 28 || s.returnTemp < 20,
        icon: <Thermometer size={12} />,
      },
      {
        label: 'Давление нагнетания',
        value: s.refrigPressureHigh,
        unit: 'МПа',
        normal: '1.8–3.2 МПа',
        isAlert: s.refrigPressureHigh > 3.2 || s.refrigPressureHigh < 1.8,
        icon: <Activity size={12} />,
      },
      {
        label: 'Давление всасывания',
        value: s.refrigPressureLow,
        unit: 'МПа',
        normal: '0.4–0.8 МПа',
        isAlert: s.refrigPressureLow > 0.8 || s.refrigPressureLow < 0.4,
        icon: <Activity size={12} />,
      },
      {
        label: 'Ток компрессора',
        value: s.compressorCurrent,
        unit: 'А',
        normal: '5–18 А',
        isAlert: s.compressorCurrent > 18 || s.compressorCurrent < 5,
        icon: <Zap size={12} />,
      },
      {
        label: 'Скорость вентилятора',
        value: s.fanSpeed,
        unit: '%',
        normal: '20–90%',
        isAlert: s.fanSpeed > 90,
        icon: <Wind size={12} />,
      },
      {
        label: 'Вибрация',
        value: s.vibration,
        unit: 'мм/с',
        normal: '< 3.5 мм/с',
        isAlert: s.vibration > 3.5,
        icon: <BarChart2 size={12} />,
      },
      {
        label: 'Потребление',
        value: s.powerConsumption,
        unit: 'кВт',
        normal: '1–12 кВт',
        isAlert: s.powerConsumption > 12,
        icon: <Zap size={12} />,
      },
    ];
  }

  const historyEvents = [
    { time: '14:32', text: 'Датчик давления вернулся в норму' },
    { time: '13:10', text: 'Превышение температуры подачи — авто-тревога' },
    { time: '09:05', text: 'Плановая проверка телеметрии пройдена' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top KPI bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">IoT Телеметрия HVAC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Онлайн:</span>
          <span className="text-sm font-bold text-green-700">{onlineDevices.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">Тревога:</span>
          <span className="text-sm font-bold text-red-700">{alertDevices.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-600">Офлайн:</span>
          <span className="text-sm font-bold text-gray-600">{offlineDevices.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-yellow-500" />
          <span className="text-sm text-gray-600">Суммарная мощность:</span>
          <span className="text-sm font-bold text-gray-800">{totalPower.toFixed(1)} кВт</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {(['1h', '6h', '24h', '7d'] as TimeRange[]).map((tr) => (
            <Button
              key={tr}
              variant={timeRange === tr ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setTimeRange(tr)}
            >
              {tr}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — device list */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Устройства ({IOT_DEVICES.length})
            </p>
          </div>
          {IOT_DEVICES.map((device) => {
            const meta = STATUS_META[device.status];
            const isSelected = selected === device.id;
            return (
              <button
                key={device.id}
                onClick={() => setSelected(isSelected ? null : device.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${meta.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                      {device.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {device.status === 'offline' ? (
                        <WifiOff size={11} className="text-gray-400" />
                      ) : (
                        <Wifi size={11} className="text-green-500" />
                      )}
                      <span className="text-xs text-gray-400">{device.lastSeen}</span>
                      {device.alerts.length > 0 && (
                        <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-medium">
                          {device.alerts.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto p-5">
          {selectedDevice ? (
            <div className="max-w-4xl space-y-4">
              {/* Device header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{selectedDevice.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_META[selectedDevice.status].color
                      }`}
                    >
                      {STATUS_META[selectedDevice.status].label}
                    </span>
                    <span className="text-xs text-gray-400">
                      Последний сигнал: {selectedDevice.lastSeen}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    toast.success('Создание наряда...', {
                      description: `Наряд по ${selectedDevice.name} открыт`,
                    })
                  }
                >
                  Открыть наряд
                </Button>
              </div>

              {/* Alert banners */}
              {selectedDevice.alerts.map((alert, i) => (
                <div
                  key={i}
                  className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 flex items-center gap-2"
                >
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{alert}</span>
                </div>
              ))}

              {/* Sensor cards 2×4 grid */}
              {selectedDevice.status !== 'offline' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Текущие показания датчиков
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {getSensorCards(selectedDevice).map((card) => (
                      <SensorCard key={card.label} {...card} />
                    ))}
                  </div>
                </div>
              )}

              {/* Telemetry chart */}
              {selectedDevice.status !== 'offline' && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={15} className="text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">
                      Тренд телеметрии ({timeRange})
                    </h3>
                    <div className="ml-auto flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-0.5 bg-orange-500" />
                        Температура подачи
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-0.5 bg-blue-500" />
                        Ток компрессора
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={telemetryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12 }}
                        formatter={(value: number, name: string) => [
                          name === 'supplyTemp' ? `${value} °C` : `${value} А`,
                          name === 'supplyTemp' ? 'Темп. подачи' : 'Ток компрессора',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="supplyTemp"
                        stroke="#f97316"
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="compressorCurrent"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Event history */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">История событий</h3>
                <div className="space-y-2">
                  {historyEvents.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-xs text-gray-400 font-mono mt-0.5 w-10 flex-shrink-0">
                        {ev.time}
                      </span>
                      <span className="text-gray-700">{ev.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <Cpu size={48} className="text-gray-300" />
              <p className="text-sm">Выберите устройство для просмотра телеметрии</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
