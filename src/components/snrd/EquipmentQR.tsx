import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type EquipmentStatus = 'online' | 'offline' | 'warning';
type EquipmentType = 'Кондиционер' | 'Чиллер' | 'Вентиляционная установка';

interface ScanEvent {
  id: string;
  user: string;
  date: string;
  purpose: string;
}

interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  serial: string;
  client: string;
  address: string;
  status: EquipmentStatus;
  model: string;
  installYear: number;
  lastMaintenance: string;
  nextMaintenance: string;
  scanHistory: ScanEvent[];
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const EQUIPMENT_DATA: Equipment[] = [
  {
    id: '1',
    name: 'Кондиционер — Офис А',
    type: 'Кондиционер',
    serial: 'AC-2023-001-XKZ',
    client: 'ООО «Альфа Трейд»',
    address: 'г. Москва, ул. Ленина, 12, оф. 305',
    status: 'online',
    model: 'Daikin FTXB35C',
    installYear: 2021,
    lastMaintenance: '15.02.2026',
    nextMaintenance: '15.08.2026',
    scanHistory: [
      { id: 's1', user: 'Иванов А.', date: '14.05.2026 10:23', purpose: 'Плановое ТО' },
      { id: 's2', user: 'Петров В.', date: '01.03.2026 09:11', purpose: 'Проверка давления' },
      { id: 's3', user: 'Иванов А.', date: '15.02.2026 08:45', purpose: 'Сервисное обслуживание' },
      { id: 's4', user: 'Смирнов К.', date: '12.11.2025 14:30', purpose: 'Диагностика' },
      { id: 's5', user: 'Петров В.', date: '20.08.2025 11:00', purpose: 'Плановое ТО' },
    ],
  },
  {
    id: '2',
    name: 'Кондиционер — Переговорная',
    type: 'Кондиционер',
    serial: 'AC-2022-017-MNP',
    client: 'ООО «Альфа Трейд»',
    address: 'г. Москва, ул. Ленина, 12, оф. 101',
    status: 'warning',
    model: 'Mitsubishi MSZ-AP25VG',
    installYear: 2020,
    lastMaintenance: '10.01.2026',
    nextMaintenance: '10.07.2026',
    scanHistory: [
      { id: 's6', user: 'Козлов Р.', date: '10.05.2026 16:05', purpose: 'Аварийный вызов' },
      { id: 's7', user: 'Иванов А.', date: '10.01.2026 10:00', purpose: 'Плановое ТО' },
      { id: 's8', user: 'Козлов Р.', date: '05.10.2025 13:22', purpose: 'Замена фильтров' },
      { id: 's9', user: 'Петров В.', date: '12.07.2025 08:30', purpose: 'Плановое ТО' },
      { id: 's10', user: 'Иванов А.', date: '20.04.2025 09:15', purpose: 'Диагностика утечки' },
    ],
  },
  {
    id: '3',
    name: 'Чиллер — Серверная',
    type: 'Чиллер',
    serial: 'CH-2021-003-RQW',
    client: 'АО «ТехноПром»',
    address: 'г. Москва, пр. Мира, 45, корп. 2',
    status: 'online',
    model: 'Carrier 30XW-P 150',
    installYear: 2019,
    lastMaintenance: '01.04.2026',
    nextMaintenance: '01.10.2026',
    scanHistory: [
      { id: 's11', user: 'Смирнов К.', date: '01.04.2026 07:50', purpose: 'Квартальное ТО' },
      { id: 's12', user: 'Козлов Р.', date: '10.01.2026 08:20', purpose: 'Квартальное ТО' },
      { id: 's13', user: 'Смирнов К.', date: '05.10.2025 07:45', purpose: 'Квартальное ТО' },
      { id: 's14', user: 'Иванов А.', date: '15.07.2025 08:00', purpose: 'Квартальное ТО' },
      { id: 's15', user: 'Козлов Р.', date: '02.04.2025 09:30', purpose: 'Квартальное ТО' },
    ],
  },
  {
    id: '4',
    name: 'Вент. установка — Склад №1',
    type: 'Вентиляционная установка',
    serial: 'VU-2020-088-LKT',
    client: 'ИП Сидоров М.В.',
    address: 'г. Москва, ш. Каширское, 99',
    status: 'offline',
    model: 'VTS VENTUS W VS-20',
    installYear: 2018,
    lastMaintenance: '20.12.2025',
    nextMaintenance: '20.06.2026',
    scanHistory: [
      { id: 's16', user: 'Петров В.', date: '20.12.2025 11:10', purpose: 'Плановое ТО' },
      { id: 's17', user: 'Иванов А.', date: '18.06.2025 10:30', purpose: 'Плановое ТО' },
      { id: 's18', user: 'Козлов Р.', date: '05.01.2025 09:00', purpose: 'Аварийный ремонт' },
      { id: 's19', user: 'Смирнов К.', date: '14.12.2024 14:00', purpose: 'Плановое ТО' },
      { id: 's20', user: 'Петров В.', date: '10.06.2024 08:45', purpose: 'Плановое ТО' },
    ],
  },
  {
    id: '5',
    name: 'Кондиционер — Кабинет директора',
    type: 'Кондиционер',
    serial: 'AC-2024-055-BVN',
    client: 'ЗАО «СтройГрупп»',
    address: 'г. Москва, ул. Тверская, 3, оф. 501',
    status: 'online',
    model: 'Haier AS35S2SF1FA',
    installYear: 2023,
    lastMaintenance: '03.05.2026',
    nextMaintenance: '03.11.2026',
    scanHistory: [
      { id: 's21', user: 'Иванов А.', date: '03.05.2026 13:00', purpose: 'Плановое ТО' },
      { id: 's22', user: 'Козлов Р.', date: '25.11.2025 11:40', purpose: 'Плановое ТО' },
      { id: 's23', user: 'Смирнов К.', date: '10.06.2025 09:20', purpose: 'Замена фильтров' },
      { id: 's24', user: 'Иванов А.', date: '20.03.2025 10:10', purpose: 'Диагностика' },
      { id: 's25', user: 'Петров В.', date: '15.11.2024 08:00', purpose: 'Первичная настройка' },
    ],
  },
  {
    id: '6',
    name: 'Чиллер — Производственный цех',
    type: 'Чиллер',
    serial: 'CH-2019-012-ZXP',
    client: 'АО «ТехноПром»',
    address: 'г. Москва, пр. Мира, 45, корп. 1',
    status: 'warning',
    model: 'Trane RTAC 200',
    installYear: 2017,
    lastMaintenance: '28.02.2026',
    nextMaintenance: '28.08.2026',
    scanHistory: [
      { id: 's26', user: 'Козлов Р.', date: '12.05.2026 07:30', purpose: 'Устранение шума' },
      { id: 's27', user: 'Смирнов К.', date: '28.02.2026 08:00', purpose: 'Плановое ТО' },
      { id: 's28', user: 'Иванов А.', date: '15.11.2025 09:45', purpose: 'Дозаправка хладагента' },
      { id: 's29', user: 'Козлов Р.', date: '30.08.2025 08:15', purpose: 'Плановое ТО' },
      { id: 's30', user: 'Смирнов К.', date: '04.03.2025 10:00', purpose: 'Плановое ТО' },
    ],
  },
  {
    id: '7',
    name: 'Вент. установка — Торговый зал',
    type: 'Вентиляционная установка',
    serial: 'VU-2023-031-KYP',
    client: 'ИП Новикова Е.С.',
    address: 'г. Москва, ул. Садовая, 18',
    status: 'online',
    model: 'Systemair SAVE VSR 300',
    installYear: 2022,
    lastMaintenance: '11.04.2026',
    nextMaintenance: '11.10.2026',
    scanHistory: [
      { id: 's31', user: 'Петров В.', date: '11.04.2026 12:00', purpose: 'Плановое ТО' },
      { id: 's32', user: 'Иванов А.', date: '08.10.2025 11:30', purpose: 'Плановое ТО' },
      { id: 's33', user: 'Козлов Р.', date: '22.04.2025 09:00', purpose: 'Замена ремней' },
      { id: 's34', user: 'Смирнов К.', date: '10.10.2024 10:20', purpose: 'Плановое ТО' },
      { id: 's35', user: 'Петров В.', date: '15.05.2024 08:50', purpose: 'Пусконаладка' },
    ],
  },
  {
    id: '8',
    name: 'Кондиционер — Серверная стойка',
    type: 'Кондиционер',
    serial: 'AC-2022-099-FHJ',
    client: 'ЗАО «СтройГрупп»',
    address: 'г. Москва, ул. Тверская, 3, подвал',
    status: 'online',
    model: 'Schneider Electric InRow RC',
    installYear: 2021,
    lastMaintenance: '22.03.2026',
    nextMaintenance: '22.09.2026',
    scanHistory: [
      { id: 's36', user: 'Смирнов К.', date: '22.03.2026 07:00', purpose: 'Плановое ТО' },
      { id: 's37', user: 'Козлов Р.', date: '18.09.2025 07:15', purpose: 'Плановое ТО' },
      { id: 's38', user: 'Иванов А.', date: '05.06.2025 08:30', purpose: 'Замена фильтров' },
      { id: 's39', user: 'Петров В.', date: '20.03.2025 07:00', purpose: 'Плановое ТО' },
      { id: 's40', user: 'Смирнов К.', date: '10.09.2024 08:00', purpose: 'Плановое ТО' },
    ],
  },
];

// ─────────────────────────────────────────────
// QR Pattern Generator
// ─────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash;
}

function generateQRPattern(serialNumber: string): boolean[][] {
  const SIZE = 15;
  const matrix: boolean[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(false),
  );

  // Seed LCG from serial hash
  let seed = hashString(serialNumber);
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  // Fill random cells
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      matrix[r][c] = lcg() > 0.45;
    }
  }

  // Fixed finder patterns (top-left, top-right, bottom-left) — mimics real QR
  const finder = (rowOff: number, colOff: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[rowOff + r][colOff + c] = border || inner;
      }
    }
  };

  finder(0, 0);   // top-left
  finder(0, 8);   // top-right (shifted to fit 15 grid)
  finder(8, 0);   // bottom-left

  return matrix;
}

// ─────────────────────────────────────────────
// QR SVG Component
// ─────────────────────────────────────────────

interface QRSVGProps {
  serial: string;
  size?: number;
}

const QRSVG = ({ serial, size = 180 }: QRSVGProps) => {
  const matrix = useMemo(() => generateQRPattern(serial), [serial]);
  const CELLS = 15;
  const cellSize = size / CELLS;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className="rounded"
    >
      <rect width={size} height={size} fill="white" />
      {matrix.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1a1a2e"
            />
          ) : null,
        ),
      )}
    </svg>
  );
};

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────

const STATUS_CONFIG: Record<
  EquipmentStatus,
  { label: string; bg: string; dot: string; icon: string }
> = {
  online: {
    label: 'Онлайн',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: 'Wifi',
  },
  offline: {
    label: 'Офлайн',
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: 'WifiOff',
  },
  warning: {
    label: 'Внимание',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: 'AlertCircle',
  },
};

const CLIENTS = Array.from(new Set(EQUIPMENT_DATA.map((e) => e.client)));
const TYPES: EquipmentType[] = ['Кондиционер', 'Чиллер', 'Вентиляционная установка'];

// ─────────────────────────────────────────────
// Equipment Card
// ─────────────────────────────────────────────

interface EquipmentCardProps {
  item: Equipment;
  selected: boolean;
  active: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onClick: (item: Equipment) => void;
}

const EquipmentCard = ({ item, selected, active, onSelect, onClick }: EquipmentCardProps) => {
  const sc = STATUS_CONFIG[item.status];

  return (
    <div
      onClick={() => onClick(item)}
      className={`relative rounded-xl border bg-white p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
        active ? 'border-blue-500 shadow-md ring-1 ring-blue-400' : 'border-slate-200'
      }`}
    >
      {/* Checkbox */}
      <div
        className="absolute top-3 left-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelect(item.id, !!v)}
          className="border-slate-300"
        />
      </div>

      {/* QR preview */}
      <div className="flex justify-center mb-3 mt-1">
        <div className="w-16 h-16 overflow-hidden rounded border border-slate-100 shadow-sm">
          <QRSVG serial={item.serial} size={64} />
        </div>
      </div>

      {/* Status badge */}
      <div className="flex justify-center mb-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${sc.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-slate-800 text-center leading-tight mb-1">
        {item.name}
      </p>

      {/* Type */}
      <p className="text-xs text-slate-500 text-center mb-2">{item.type}</p>

      {/* Serial */}
      <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-mono">
        <span>{item.serial}</span>
      </div>

      {/* Client & address */}
      <div className="mt-3 space-y-1">
        <div className="flex items-start gap-1.5 text-xs text-slate-600">
          <Icon name="User" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
          <span className="truncate">{item.client}</span>
        </div>
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <Icon name="MapPin" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
          <span className="line-clamp-2">{item.address}</span>
        </div>
      </div>

      {/* Chevron hint */}
      <div className="absolute bottom-3 right-3">
        <Icon name="ChevronRight" className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Side Panel
// ─────────────────────────────────────────────

interface SidePanelProps {
  item: Equipment;
  onClose: () => void;
}

const SidePanel = ({ item, onClose }: SidePanelProps) => {
  const sc = STATUS_CONFIG[item.status];

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/equipment/${item.serial}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }, [item.serial]);

  const handleDownload = useCallback(() => {
    const svg = document.getElementById(`qr-download-${item.id}`)?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${item.serial}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [item]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-96 shrink-0 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-800 leading-tight">{item.name}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{item.serial}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Icon name="X" className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* QR block */}
        <div className="px-5 py-5 flex flex-col items-center border-b border-slate-100">
          <div
            id={`qr-download-${item.id}`}
            className="rounded-xl border-2 border-slate-100 shadow-sm p-2 bg-white mb-4"
          >
            <QRSVG serial={item.serial} size={180} />
          </div>
          <p className="text-xs text-slate-400 mb-4 font-mono tracking-wide">{item.serial}</p>

          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs"
              onClick={handleDownload}
            >
              <Icon name="Download" className="w-3.5 h-3.5" />
              Скачать QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs"
              onClick={handlePrint}
            >
              <Icon name="Printer" className="w-3.5 h-3.5" />
              Этикетка
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs"
              onClick={handleCopyLink}
            >
              <Icon name="Copy" className="w-3.5 h-3.5" />
              Ссылка
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Информация об оборудовании
          </h4>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Статус</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${sc.bg}`}
            >
              <Icon name={sc.icon as 'Wifi'} className="w-3 h-3" />
              {sc.label}
            </span>
          </div>

          {[
            { label: 'Тип', value: item.type },
            { label: 'Модель', value: item.model },
            { label: 'Год установки', value: String(item.installYear) },
            { label: 'Клиент', value: item.client },
            { label: 'Адрес', value: item.address },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-xs text-slate-500 shrink-0">{label}</span>
              <span className="text-xs font-medium text-slate-700 text-right">{value}</span>
            </div>
          ))}

          {/* Maintenance dates */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5">
              <p className="text-xs text-slate-400 mb-0.5">Последнее ТО</p>
              <p className="text-xs font-semibold text-slate-700">{item.lastMaintenance}</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5">
              <p className="text-xs text-blue-400 mb-0.5">Следующее ТО</p>
              <p className="text-xs font-semibold text-blue-700">{item.nextMaintenance}</p>
            </div>
          </div>
        </div>

        {/* Scan history */}
        <div className="px-5 py-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            История сканирований
          </h4>
          <div className="space-y-2">
            {item.scanHistory.map((event) => (
              <div
                key={event.id}
                className="flex gap-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5"
              >
                <div className="mt-0.5 w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <Icon name="User" className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700">{event.user}</p>
                  <p className="text-xs text-slate-500 truncate">{event.purpose}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Icon name="Clock" className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">{event.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const EquipmentQR = () => {
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<Equipment | null>(null);

  const filtered = useMemo(() => {
    return EQUIPMENT_DATA.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.serial.toLowerCase().includes(q);
      const matchClient = clientFilter === 'all' || item.client === clientFilter;
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchClient && matchType && matchStatus;
    });
  }, [search, clientFilter, typeFilter, statusFilter]);

  const allSelected = filtered.length > 0 && filtered.every((e) => selectedIds.has(e.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  };

  const handlePrintSelected = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const selectedItems = EQUIPMENT_DATA.filter((e) => selectedIds.has(e.id));
    const csv = [
      ['Название', 'Тип', 'Серийный номер', 'Клиент', 'Адрес', 'Статус', 'Модель', 'Год установки', 'Последнее ТО', 'Следующее ТО'],
      ...selectedItems.map((e) => [
        e.name, e.type, e.serial, e.client, e.address, e.status, e.model, String(e.installYear), e.lastMaintenance, e.nextMaintenance,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment_qr.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 bg-slate-50">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Icon name="QrCode" className="w-5 h-5 text-blue-600" />
                QR-коды оборудования
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {filtered.length} единиц оборудования
              </p>
            </div>

            {/* Bulk actions */}
            {someSelected && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  Выбрано: {selectedIds.size}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handlePrintSelected}
                >
                  <Icon name="Printer" className="w-3.5 h-3.5" />
                  Печать QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleExportExcel}
                >
                  <Icon name="Download" className="w-3.5 h-3.5" />
                  Экспорт CSV
                </Button>
              </div>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию или серийному номеру..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <Icon name="X" className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* Client filter */}
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-48 text-sm h-9">
                <Icon name="User" className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <SelectValue placeholder="Клиент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все клиенты</SelectItem>
                {CLIENTS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-52 text-sm h-9">
                <Icon name="Filter" className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 text-sm h-9">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="online">Онлайн</SelectItem>
                <SelectItem value="offline">Офлайн</SelectItem>
                <SelectItem value="warning">Внимание</SelectItem>
              </SelectContent>
            </Select>

            {/* Select all */}
            <div className="flex items-center gap-2 ml-auto">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                id="select-all"
                className="border-slate-300"
              />
              <label htmlFor="select-all" className="text-xs text-slate-500 cursor-pointer select-none">
                Выбрать все
              </label>
            </div>
          </div>
        </div>

        {/* Equipment grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Icon name="QrCode" className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Оборудование не найдено</p>
              <p className="text-slate-400 text-sm mt-1">Измените параметры поиска или фильтров</p>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                activeItem
                  ? 'grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
              }`}
            >
              {filtered.map((item) => (
                <EquipmentCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  active={activeItem?.id === item.id}
                  onSelect={toggleSelectItem}
                  onClick={setActiveItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      {activeItem && (
        <SidePanel
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      )}
    </div>
  );
};

export default EquipmentQR;
