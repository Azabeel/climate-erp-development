import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'general' | 'devices' | 'sync' | 'qr';
type DeviceStatus = 'Активно' | 'Устарело' | 'Заблокировано';
type DeviceOS = 'Android' | 'iOS';

interface Device {
  id: string;
  engineer: string;
  model: string;
  os: DeviceOS;
  appVersion: string;
  lastSeen: string;
  status: DeviceStatus;
}

interface SyncEntry {
  engineer: string;
  lastSync: string;
  minsAgo: number;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_DEVICES: Device[] = [
  { id: 'd01', engineer: 'Петров А.В.',    model: 'Samsung Galaxy A54',       os: 'Android', appVersion: '2.4.1', lastSeen: '16.05.2026 08:42', status: 'Активно' },
  { id: 'd02', engineer: 'Сидоров К.Н.',   model: 'Xiaomi Redmi Note 12',     os: 'Android', appVersion: '2.4.1', lastSeen: '16.05.2026 08:55', status: 'Активно' },
  { id: 'd03', engineer: 'Козлов Д.А.',    model: 'POCO X5 Pro',              os: 'Android', appVersion: '2.3.8', lastSeen: '16.05.2026 07:30', status: 'Устарело' },
  { id: 'd04', engineer: 'Новиков Р.И.',   model: 'Samsung Galaxy A34',       os: 'Android', appVersion: '2.4.1', lastSeen: '16.05.2026 09:01', status: 'Активно' },
  { id: 'd05', engineer: 'Морозов И.В.',   model: 'iPhone 14',                os: 'iOS',     appVersion: '2.4.0', lastSeen: '16.05.2026 08:48', status: 'Активно' },
  { id: 'd06', engineer: 'Волков С.Е.',    model: 'Realme 11 Pro',            os: 'Android', appVersion: '2.3.5', lastSeen: '15.05.2026 17:22', status: 'Устарело' },
  { id: 'd07', engineer: 'Лебедев Г.К.',   model: 'iPhone 13',                os: 'iOS',     appVersion: '2.4.0', lastSeen: '16.05.2026 09:10', status: 'Активно' },
  { id: 'd08', engineer: 'Орлов М.Ю.',     model: 'OnePlus Nord 3',           os: 'Android', appVersion: '2.4.1', lastSeen: '16.05.2026 08:35', status: 'Активно' },
  { id: 'd09', engineer: 'Захаров Н.Д.',   model: 'Samsung Galaxy S23 FE',    os: 'Android', appVersion: '2.4.1', lastSeen: '16.05.2026 08:58', status: 'Активно' },
  { id: 'd10', engineer: 'Тихонов В.П.',   model: 'Xiaomi 13T',               os: 'Android', appVersion: '2.3.8', lastSeen: '14.05.2026 16:05', status: 'Устарело' },
  { id: 'd11', engineer: 'Беляев Л.О.',    model: 'Google Pixel 8',           os: 'Android', appVersion: '2.4.1', lastSeen: '16.05.2026 09:05', status: 'Активно' },
  { id: 'd12', engineer: 'Зайцев Ф.Ю.',    model: 'Huawei Nova 12',           os: 'Android', appVersion: '2.1.0', lastSeen: '10.05.2026 11:00', status: 'Заблокировано' },
];

const SYNC_ENTRIES: SyncEntry[] = [
  { engineer: 'Петров А.В.',  lastSync: '2 мин назад',   minsAgo: 2  },
  { engineer: 'Сидоров К.Н.', lastSync: '5 мин назад',   minsAgo: 5  },
  { engineer: 'Козлов Д.А.',  lastSync: '48 мин назад',  minsAgo: 48 },
  { engineer: 'Новиков Р.И.', lastSync: '12 мин назад',  minsAgo: 12 },
  { engineer: 'Морозов И.В.', lastSync: '3 мин назад',   minsAgo: 3  },
  { engineer: 'Волков С.Е.',  lastSync: '1 ч 18 мин назад', minsAgo: 78 },
  { engineer: 'Лебедев Г.К.', lastSync: '7 мин назад',   minsAgo: 7  },
  { engineer: 'Орлов М.Ю.',   lastSync: '11 мин назад',  minsAgo: 11 },
];

const SYNC_CHART_DATA = [
  { time: '09:00', count: 14 },
  { time: '10:00', count: 18 },
  { time: '11:00', count: 16 },
  { time: '12:00', count: 9  },
  { time: '13:00', count: 11 },
  { time: '14:00', count: 17 },
  { time: '15:00', count: 20 },
  { time: '16:00', count: 15 },
  { time: '17:00', count: 8  },
  { time: '18:00', count: 6  },
];

// Chart data for 7 days (hourly buckets aggregated by day label)
const SYNC_WEEKLY_DATA = [
  { day: 'Пн', syncs: 118 },
  { day: 'Вт', syncs: 134 },
  { day: 'Ср', syncs: 109 },
  { day: 'Чт', syncs: 145 },
  { day: 'Пт', syncs: 162 },
  { day: 'Сб', syncs: 41  },
  { day: 'Вс', syncs: 29  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
        value ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: value ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const map: Record<DeviceStatus, string> = {
    'Активно':      'bg-green-100 text-green-700',
    'Устарело':     'bg-amber-100 text-amber-700',
    'Заблокировано': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

// ─── Tabs config ───────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'general',  label: 'Общие',         icon: 'Settings'    },
  { id: 'devices',  label: 'Устройства',    icon: 'Smartphone'  },
  { id: 'sync',     label: 'Синхронизация', icon: 'RefreshCw'   },
  { id: 'qr',       label: 'QR-коды',       icon: 'QrCode'      },
];

// ─── QR SVG imitation ─────────────────────────────────────────────────────────

function QRCodeBlock() {
  // Simple deterministic dot grid to imitate a QR code visually
  const SIZE = 21; // 21×21 modules (standard QR Version 1 layout hint)
  const CELL = 8;
  const TOTAL = SIZE * CELL;

  // Fixed pattern seed — mimics the look of a real QR without actual encoding
  const pattern: number[][] = Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (_, c) => {
      // Finder patterns (top-left, top-right, bottom-left corners)
      const inFinder = (
        (r < 7 && c < 7) ||
        (r < 7 && c >= SIZE - 7) ||
        (r >= SIZE - 7 && c < 7)
      );
      if (inFinder) {
        const lr = r % 7, lc = c % 7;
        const cr = r >= SIZE - 7 ? r - (SIZE - 7) : r;
        const cc = c >= SIZE - 7 ? c - (SIZE - 7) : c;
        const row = c >= SIZE - 7 ? cr : (r >= SIZE - 7 ? cr : lr);
        const col = c >= SIZE - 7 ? cc : lc;
        return (
          row === 0 || row === 6 || col === 0 || col === 6 ||
          (row >= 2 && row <= 4 && col >= 2 && col <= 4)
        ) ? 1 : 0;
      }
      // Timing patterns
      if (r === 6 || c === 6) return (r + c) % 2 === 0 ? 1 : 0;
      // Pseudo-random data modules (deterministic)
      return ((r * 13 + c * 7 + r * c) % 3 === 0) ? 1 : 0;
    })
  );

  return (
    <svg
      width={TOTAL + 16}
      height={TOTAL + 16}
      viewBox={`0 0 ${TOTAL + 16} ${TOTAL + 16}`}
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-lg border border-gray-200 bg-white"
    >
      <rect x="0" y="0" width={TOTAL + 16} height={TOTAL + 16} fill="white" />
      {pattern.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={8 + c * CELL}
              y={8 + r * CELL}
              width={CELL - 1}
              height={CELL - 1}
              fill="#111827"
              rx={0.5}
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const MobileAppSettingsFull = () => {
  const [tab, setTab] = useState<TabId>('general');

  // General settings state
  const [offlineMode, setOfflineMode]       = useState(true);
  const [gpsTracking, setGpsTracking]       = useState(true);
  const [gpsInterval, setGpsInterval]       = useState('5');
  const [photoRequired, setPhotoRequired]   = useState(true);
  const [minPhotos, setMinPhotos]           = useState('2');
  const [barcodeScan, setBarcodeScan]       = useState(true);
  const [pushNotify, setPushNotify]         = useState(true);

  // Devices state
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  // Sync settings state
  const [syncSchedule, setSyncSchedule] = useState('При подключении');

  // QR state
  const [qrToken] = useState('SK-DEV-2026-A7F3E');

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveGeneral = () => {
    toast.success('Настройки сохранены', {
      description: 'Изменения будут применены при следующей синхронизации',
    });
  };

  const handleForceUpdate = (device: Device) => {
    toast.info(`Команда на обновление отправлена`, {
      description: `Устройство «${device.engineer}» получит уведомление об обновлении`,
    });
  };

  const handleBlock = (device: Device) => {
    setDevices(prev =>
      prev.map(d =>
        d.id === device.id
          ? { ...d, status: d.status === 'Заблокировано' ? 'Активно' : 'Заблокировано' }
          : d
      )
    );
    const isBlocking = device.status !== 'Заблокировано';
    toast[isBlocking ? 'warning' : 'success'](
      isBlocking ? `Устройство заблокировано` : `Устройство разблокировано`,
      { description: `Инженер: ${device.engineer}` }
    );
  };

  const handleSyncAll = () => {
    toast.success('Синхронизация запущена', {
      description: 'Все активные устройства получили команду на синхронизацию',
    });
  };

  const handleGenerateQR = () => {
    toast.success('QR-код обновлён', {
      description: 'Предыдущий QR-код аннулирован. Используйте новый для регистрации устройств',
    });
  };

  const handleCheckUpdates = () => {
    toast.success('Проверка обновлений', {
      description: 'Используется актуальная версия приложения (2.4.1 / 2.4.0)',
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const activeCount = devices.filter(d => d.status === 'Активно').length;
  const outdatedCount = devices.filter(d => d.status === 'Устарело').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Status card ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="Smartphone" size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Мобильное приложение «Сервис Климат»</h2>
              <p className="text-sm text-gray-500 mt-0.5">Управление настройками Android и iOS клиентов</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCheckUpdates} className="flex-shrink-0">
            <Icon name="RefreshCw" size={14} className="mr-1.5" />
            Проверить обновления
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Версия Android</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">2.4.1</span>
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Актуальная</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Версия iOS</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">2.4.0</span>
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Актуальная</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Активных устройств</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{activeCount}</span>
              {outdatedCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                  {outdatedCount} устарело
                </span>
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Последнее обновление</p>
            <div className="flex items-center gap-1.5">
              <Icon name="Clock" size={14} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">3 дня назад</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Tab: Общие                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'general' && (
        <div className="space-y-5">

          {/* Подключение и геолокация */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Подключение и геолокация</h3>
            </div>
            <div className="divide-y divide-gray-50">

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Разрешить офлайн-режим</p>
                  <p className="text-xs text-gray-400 mt-0.5">Работа без интернета с синхронизацией при подключении</p>
                </div>
                <Toggle value={offlineMode} onChange={() => setOfflineMode(v => !v)} />
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">GPS отслеживание</p>
                  <p className="text-xs text-gray-400 mt-0.5">Запись маршрутов инженеров в рабочее время</p>
                </div>
                <Toggle value={gpsTracking} onChange={() => setGpsTracking(v => !v)} />
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Интервал обновления GPS</p>
                  <p className="text-xs text-gray-400 mt-0.5">Как часто фиксировать координаты инженера</p>
                </div>
                <select
                  value={gpsInterval}
                  onChange={e => setGpsInterval(e.target.value)}
                  disabled={!gpsTracking}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Каждую минуту</option>
                  <option value="5">Каждые 5 минут</option>
                  <option value="10">Каждые 10 минут</option>
                  <option value="30">Каждые 30 минут</option>
                </select>
              </div>

            </div>
          </div>

          {/* Работа с нарядами */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Работа с нарядами</h3>
            </div>
            <div className="divide-y divide-gray-50">

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Обязательное фото до/после наряда</p>
                  <p className="text-xs text-gray-400 mt-0.5">Нельзя закрыть наряд без загрузки фотографий</p>
                </div>
                <Toggle value={photoRequired} onChange={() => setPhotoRequired(v => !v)} />
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Минимальное количество фото</p>
                  <p className="text-xs text-gray-400 mt-0.5">Минимум снимков на наряд (до + после)</p>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={minPhotos}
                    onChange={e => setMinPhotos(e.target.value)}
                    disabled={!photoRequired}
                    className="text-center text-sm h-8 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Сканирование штрих-кодов</p>
                  <p className="text-xs text-gray-400 mt-0.5">QR и штрих-коды оборудования и материалов</p>
                </div>
                <Toggle value={barcodeScan} onChange={() => setBarcodeScan(v => !v)} />
              </div>

            </div>
          </div>

          {/* Уведомления */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Уведомления</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Push-уведомления</p>
                  <p className="text-xs text-gray-400 mt-0.5">Новые наряды, изменения статуса, напоминания</p>
                </div>
                <Toggle value={pushNotify} onChange={() => setPushNotify(v => !v)} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral}>
              <Icon name="Save" size={14} className="mr-1.5" />
              Сохранить настройки
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Tab: Устройства                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'devices' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Зарегистрированные устройства</h3>
              <p className="text-xs text-gray-400 mt-0.5">{devices.length} устройств · {activeCount} активно</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Инженер</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Устройство</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ОС</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Версия</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Последний вход</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {devices.map(device => (
                  <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={13} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap">{device.engineer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{device.model}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          name={device.os === 'iOS' ? 'Apple' : 'Bot'}
                          size={13}
                          className="text-gray-400"
                        />
                        <span className="text-gray-600">{device.os}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                        device.status === 'Устарело'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {device.appVersion}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{device.lastSeen}</td>
                    <td className="px-4 py-3">
                      <DeviceStatusBadge status={device.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {device.status !== 'Заблокировано' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleForceUpdate(device)}
                          >
                            <Icon name="Download" size={11} className="mr-1" />
                            Обновить
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-7 text-xs ${
                            device.status === 'Заблокировано'
                              ? 'border-green-300 text-green-700 hover:bg-green-50'
                              : 'border-red-200 text-red-600 hover:bg-red-50'
                          }`}
                          onClick={() => handleBlock(device)}
                        >
                          <Icon
                            name={device.status === 'Заблокировано' ? 'Unlock' : 'Ban'}
                            size={11}
                            className="mr-1"
                          />
                          {device.status === 'Заблокировано' ? 'Разблокировать' : 'Заблокировать'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Tab: Синхронизация                                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'sync' && (
        <div className="space-y-5">

          {/* Расписание синхронизации */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Расписание синхронизации</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Режим синхронизации</p>
                <p className="text-xs text-gray-400 mt-0.5">Когда устройства должны отправлять данные на сервер</p>
              </div>
              <select
                value={syncSchedule}
                onChange={e => setSyncSchedule(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>При подключении</option>
                <option>Каждые 5 мин</option>
                <option>Каждые 15 мин</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSyncAll}>
                <Icon name="RefreshCw" size={14} className="mr-1.5" />
                Синхронизировать все
              </Button>
            </div>
          </div>

          {/* Статус по инженерам */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Последняя синхронизация по инженерам</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {SYNC_ENTRIES.map(entry => {
                const isOld = entry.minsAgo >= 30;
                return (
                  <div key={entry.engineer} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOld ? 'bg-amber-400' : 'bg-green-500'}`} />
                      <span className="text-sm text-gray-900">{entry.engineer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={13} className="text-gray-300" />
                      <span className={`text-xs ${isOld ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                        {entry.lastSync}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Активность синхронизаций за 7 дней</h3>
            <p className="text-xs text-gray-400 mb-4">Количество синхронизаций по дням недели</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={SYNC_WEEKLY_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="syncGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v: number) => [`${v} синхр.`, 'Синхронизаций']}
                />
                <Area
                  type="monotone"
                  dataKey="syncs"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#syncGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Сегодня (почасово)</p>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={SYNC_CHART_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="syncGradHour" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number) => [`${v} синхр.`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#syncGradHour)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Tab: QR-коды                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* QR code display */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 self-start">QR-код для привязки устройства</h3>
            <p className="text-xs text-gray-400 mb-5 self-start">
              Покажите этот QR инженеру при регистрации нового устройства
            </p>

            <div className="mb-4">
              <QRCodeBlock />
            </div>

            <div className="w-full bg-gray-50 rounded-lg px-4 py-2.5 mb-4">
              <p className="text-xs text-gray-400 mb-0.5">Токен устройства</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold text-gray-900">{qrToken}</code>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Токен скопирован');
                  }}
                  className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon name="Copy" size={14} />
                </button>
              </div>
            </div>

            <div className="w-full flex items-center gap-2 mb-5">
              <Icon name="AlertCircle" size={13} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">QR-код действителен 24 часа. После регистрации устройства — аннулируется.</p>
            </div>

            <Button onClick={handleGenerateQR} className="w-full">
              <Icon name="RefreshCw" size={14} className="mr-1.5" />
              Генерировать новый QR
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Инструкция по регистрации устройства</h3>

            <div className="space-y-4">
              {([
                {
                  step: 1,
                  title: 'Установите приложение',
                  desc: 'Загрузите «Сервис Климат» из Google Play или App Store на устройство инженера.',
                  icon: 'Download',
                  color: 'bg-blue-100 text-blue-600',
                },
                {
                  step: 2,
                  title: 'Откройте экран регистрации',
                  desc: 'При первом запуске приложение попросит отсканировать QR-код для привязки к организации.',
                  icon: 'Smartphone',
                  color: 'bg-purple-100 text-purple-600',
                },
                {
                  step: 3,
                  title: 'Отсканируйте QR-код',
                  desc: 'Нажмите «Сканировать QR» и направьте камеру на код с этой страницы или введите токен вручную.',
                  icon: 'QrCode',
                  color: 'bg-green-100 text-green-600',
                },
                {
                  step: 4,
                  title: 'Войдите в аккаунт',
                  desc: 'После привязки введите логин и пароль, выданные инженеру администратором системы.',
                  icon: 'LogIn',
                  color: 'bg-amber-100 text-amber-600',
                },
              ] as const).map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon name={item.icon} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-400">Шаг {item.step}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  После успешной регистрации устройство появится в разделе «Устройства» со статусом «Активно».
                  Администратор получит уведомление о новом подключении.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileAppSettingsFull;
