import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type EquipmentStatus = 'active' | 'maintenance' | 'fault';

interface ScanRecord {
  date: string;
  engineer: string;
  action: string;
}

interface EquipmentItem {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  client: string;
  location: string;
  installDate: string;
  warrantyUntil: string;
  status: EquipmentStatus;
  hasQR: boolean;
  scanHistory: ScanRecord[];
  qrSeed: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EQUIPMENT_WITH_QR: EquipmentItem[] = [
  {
    id: 'eq-01', brand: 'Daikin', model: 'FTXB35C',
    serialNumber: 'DK-2025-11-001A', client: 'ООО «Альфа Технолоджис»',
    location: 'БЦ «Восток», 3 эт.', installDate: '15.11.2024',
    warrantyUntil: '15.11.2027', status: 'active', hasQR: true, qrSeed: 1,
    scanHistory: [
      { date: '17.05.2026 09:14', engineer: 'Петров А.В.', action: 'Плановое ТО' },
      { date: '02.04.2026 11:30', engineer: 'Смирнов К.Л.', action: 'Проверка фреона' },
      { date: '15.02.2026 14:22', engineer: 'Петров А.В.', action: 'Ремонт компрессора' },
      { date: '10.01.2026 10:05', engineer: 'Иванов Д.С.', action: 'Плановое ТО' },
      { date: '20.11.2025 16:40', engineer: 'Смирнов К.Л.', action: 'Проверка' },
    ],
  },
  {
    id: 'eq-02', brand: 'Mitsubishi Electric', model: 'PURY-P200YSKM-A',
    serialNumber: 'ME-2024-08-022B', client: 'Банк «Горизонт»',
    location: 'Головной офис, 1-5 эт.', installDate: '20.08.2024',
    warrantyUntil: '20.08.2027', status: 'maintenance', hasQR: true, qrSeed: 7,
    scanHistory: [
      { date: '16.05.2026 13:00', engineer: 'Козлов М.Р.', action: 'Плановое ТО' },
      { date: '01.03.2026 09:45', engineer: 'Петров А.В.', action: 'Ремонт' },
      { date: '10.12.2025 15:20', engineer: 'Козлов М.Р.', action: 'Плановое ТО' },
      { date: '05.09.2025 11:00', engineer: 'Иванов Д.С.', action: 'Настройка' },
      { date: '25.08.2025 10:30', engineer: 'Смирнов К.Л.', action: 'Ввод в эксплуатацию' },
    ],
  },
  {
    id: 'eq-03', brand: 'Haier', model: 'AC182MFERA/1U182MEFRAS',
    serialNumber: 'HR-2025-03-007C', client: 'ИП Николаев Р.В.',
    location: 'Магазин «Электроника»', installDate: '05.03.2025',
    warrantyUntil: '05.03.2028', status: 'active', hasQR: true, qrSeed: 3,
    scanHistory: [
      { date: '10.05.2026 08:55', engineer: 'Иванов Д.С.', action: 'Проверка' },
      { date: '14.02.2026 12:10', engineer: 'Петров А.В.', action: 'Плановое ТО' },
      { date: '30.10.2025 09:00', engineer: 'Иванов Д.С.', action: 'Ремонт' },
      { date: '20.07.2025 14:30', engineer: 'Козлов М.Р.', action: 'Плановое ТО' },
      { date: '10.03.2025 16:00', engineer: 'Смирнов К.Л.', action: 'Монтаж' },
    ],
  },
  {
    id: 'eq-04', brand: 'LG', model: 'ARNU48GB8A2',
    serialNumber: 'LG-2024-06-015D', client: 'ТЦ «Мегаполис»',
    location: 'Торговый зал, сек. А', installDate: '10.06.2024',
    warrantyUntil: '10.06.2026', status: 'fault', hasQR: true, qrSeed: 11,
    scanHistory: [
      { date: '17.05.2026 07:30', engineer: 'Козлов М.Р.', action: 'Диагностика' },
      { date: '05.04.2026 11:00', engineer: 'Петров А.В.', action: 'Ремонт' },
      { date: '22.01.2026 09:15', engineer: 'Иванов Д.С.', action: 'Плановое ТО' },
      { date: '15.09.2025 13:40', engineer: 'Смирнов К.Л.', action: 'Проверка' },
      { date: '15.06.2024 10:00', engineer: 'Петров А.В.', action: 'Ввод в эксплуатацию' },
    ],
  },
  {
    id: 'eq-05', brand: 'Samsung', model: 'AM036KNPDEH/EU',
    serialNumber: 'SS-2025-01-033E', client: 'ООО «Гранд Отель»',
    location: 'Конференц-зал 2', installDate: '25.01.2025',
    warrantyUntil: '25.01.2028', status: 'active', hasQR: true, qrSeed: 5,
    scanHistory: [
      { date: '15.05.2026 10:20', engineer: 'Смирнов К.Л.', action: 'Плановое ТО' },
      { date: '10.03.2026 08:45', engineer: 'Козлов М.Р.', action: 'Заправка фреоном' },
      { date: '01.12.2025 14:00', engineer: 'Иванов Д.С.', action: 'Плановое ТО' },
      { date: '20.07.2025 11:30', engineer: 'Петров А.В.', action: 'Проверка' },
      { date: '30.01.2025 09:00', engineer: 'Смирнов К.Л.', action: 'Монтаж' },
    ],
  },
  {
    id: 'eq-06', brand: 'Fujitsu', model: 'AOYG45LBTA',
    serialNumber: 'FJ-2024-09-009F', client: 'Клиника «МедЦентр»',
    location: 'Операционный блок', installDate: '12.09.2024',
    warrantyUntil: '12.09.2027', status: 'active', hasQR: true, qrSeed: 2,
    scanHistory: [
      { date: '12.05.2026 09:00', engineer: 'Петров А.В.', action: 'Плановое ТО' },
      { date: '20.02.2026 12:30', engineer: 'Козлов М.Р.', action: 'Проверка' },
      { date: '05.11.2025 10:15', engineer: 'Иванов Д.С.', action: 'Плановое ТО' },
      { date: '01.09.2025 15:00', engineer: 'Смирнов К.Л.', action: 'Настройка' },
      { date: '15.09.2024 08:00', engineer: 'Петров А.В.', action: 'Ввод в эксплуатацию' },
    ],
  },
  {
    id: 'eq-07', brand: 'Gree', model: 'GMV-504WM/B-X',
    serialNumber: 'GR-2025-04-041G', client: 'ТЦ «Мегаполис»',
    location: 'Продуктовый отдел', installDate: '18.04.2025',
    warrantyUntil: '18.04.2028', status: 'active', hasQR: true, qrSeed: 9,
    scanHistory: [
      { date: '08.05.2026 11:45', engineer: 'Иванов Д.С.', action: 'Проверка' },
      { date: '15.01.2026 09:30', engineer: 'Петров А.В.', action: 'Плановое ТО' },
      { date: '10.09.2025 13:00', engineer: 'Козлов М.Р.', action: 'Настройка' },
      { date: '25.05.2025 10:00', engineer: 'Смирнов К.Л.', action: 'Проверка' },
      { date: '22.04.2025 08:30', engineer: 'Иванов Д.С.', action: 'Монтаж' },
    ],
  },
  {
    id: 'eq-08', brand: 'Panasonic', model: 'CS-E21QKDW',
    serialNumber: 'PN-2024-12-028H', client: 'ООО «Альфа Технолоджис»',
    location: 'БЦ «Восток», серверная', installDate: '03.12.2024',
    warrantyUntil: '03.12.2027', status: 'maintenance', hasQR: true, qrSeed: 4,
    scanHistory: [
      { date: '05.05.2026 14:00', engineer: 'Козлов М.Р.', action: 'Ремонт дренажа' },
      { date: '20.03.2026 09:15', engineer: 'Иванов Д.С.', action: 'Плановое ТО' },
      { date: '10.01.2026 11:30', engineer: 'Петров А.В.', action: 'Проверка' },
      { date: '15.06.2025 13:00', engineer: 'Смирнов К.Л.', action: 'Плановое ТО' },
      { date: '08.12.2024 09:00', engineer: 'Козлов М.Р.', action: 'Ввод в эксплуатацию' },
    ],
  },
  {
    id: 'eq-09', brand: 'Carrier', model: '42QHC024DS8',
    serialNumber: 'CA-2025-02-056I', client: 'Банк «Горизонт»',
    location: 'Доп. офис, 2 эт.', installDate: '14.02.2025',
    warrantyUntil: '14.02.2028', status: 'active', hasQR: true, qrSeed: 6,
    scanHistory: [
      { date: '01.05.2026 10:00', engineer: 'Смирнов К.Л.', action: 'Плановое ТО' },
      { date: '10.02.2026 08:30', engineer: 'Петров А.В.', action: 'Проверка фреона' },
      { date: '05.10.2025 11:00', engineer: 'Козлов М.Р.', action: 'Плановое ТО' },
      { date: '20.05.2025 14:00', engineer: 'Иванов Д.С.', action: 'Настройка' },
      { date: '20.02.2025 09:30', engineer: 'Смирнов К.Л.', action: 'Монтаж' },
    ],
  },
  {
    id: 'eq-10', brand: 'Toshiba', model: 'RAS-24BAVG-E',
    serialNumber: 'TS-2024-07-019J', client: 'ИП Николаев Р.В.',
    location: 'Склад ул. Ленина 45', installDate: '22.07.2024',
    warrantyUntil: '22.07.2027', status: 'active', hasQR: true, qrSeed: 8,
    scanHistory: [
      { date: '28.04.2026 13:30', engineer: 'Иванов Д.С.', action: 'Проверка' },
      { date: '15.01.2026 10:45', engineer: 'Петров А.В.', action: 'Плановое ТО' },
      { date: '20.09.2025 09:00', engineer: 'Козлов М.Р.', action: 'Заправка фреоном' },
      { date: '10.07.2025 14:15', engineer: 'Смирнов К.Л.', action: 'Проверка' },
      { date: '25.07.2024 08:00', engineer: 'Иванов Д.С.', action: 'Ввод в эксплуатацию' },
    ],
  },
  {
    id: 'eq-11', brand: 'Hitachi', model: 'RAD-50RPE',
    serialNumber: 'HT-2025-05-062K', client: 'ООО «Гранд Отель»',
    location: 'Ресторан, кухня', installDate: '30.05.2025',
    warrantyUntil: '30.05.2028', status: 'fault', hasQR: true, qrSeed: 10,
    scanHistory: [
      { date: '20.04.2026 11:00', engineer: 'Козлов М.Р.', action: 'Диагностика' },
      { date: '05.02.2026 09:30', engineer: 'Петров А.В.', action: 'Ремонт' },
      { date: '10.10.2025 13:00', engineer: 'Иванов Д.С.', action: 'Плановое ТО' },
      { date: '15.07.2025 10:00', engineer: 'Смирнов К.Л.', action: 'Настройка' },
      { date: '05.06.2025 08:00', engineer: 'Козлов М.Р.', action: 'Монтаж' },
    ],
  },
  {
    id: 'eq-12', brand: 'Daikin', model: 'RZQG71L9V1',
    serialNumber: 'DK-2024-10-034L', client: 'Клиника «МедЦентр»',
    location: 'Стационар, 3 эт.', installDate: '08.10.2024',
    warrantyUntil: '08.10.2027', status: 'active', hasQR: true, qrSeed: 12,
    scanHistory: [
      { date: '15.04.2026 12:00', engineer: 'Смирнов К.Л.', action: 'Плановое ТО' },
      { date: '20.01.2026 09:45', engineer: 'Козлов М.Р.', action: 'Проверка фреона' },
      { date: '05.09.2025 11:30', engineer: 'Иванов Д.С.', action: 'Плановое ТО' },
      { date: '20.04.2025 14:00', engineer: 'Петров А.В.', action: 'Настройка' },
      { date: '12.10.2024 08:30', engineer: 'Смирнов К.Л.', action: 'Ввод в эксплуатацию' },
    ],
  },
];

const INITIAL_WITHOUT_QR: Omit<EquipmentItem, 'hasQR' | 'scanHistory' | 'qrSeed'>[] = [
  { id: 'nq-01', brand: 'Bosch', model: 'Climate 5000 MS', serialNumber: 'BS-2023-06-011', client: 'ООО «Альфа Технолоджис»', location: 'Офис на Садовой', installDate: '10.06.2023', warrantyUntil: '10.06.2026', status: 'active' },
  { id: 'nq-02', brand: 'Ariston', model: 'PRIOS NET 35', serialNumber: 'AR-2022-11-008', client: 'ИП Фёдоров Г.П.', location: 'Частный дом Рублёво', installDate: '15.11.2022', warrantyUntil: '15.11.2025', status: 'fault' },
  { id: 'nq-03', brand: 'Lennox', model: 'XP21-024', serialNumber: 'LN-2024-02-019', client: 'Банк «Горизонт»', location: 'Архив, цокольный этаж', installDate: '20.02.2024', warrantyUntil: '20.02.2027', status: 'active' },
  { id: 'nq-04', brand: 'Electrolux', model: 'EACS-18HG-M2/N3', serialNumber: 'EL-2023-08-044', client: 'ТЦ «Мегаполис»', location: 'Склад, 2 секция', installDate: '05.08.2023', warrantyUntil: '05.08.2026', status: 'active' },
  { id: 'nq-05', brand: 'Trane', model: 'XR15-036', serialNumber: 'TR-2024-04-007', client: 'ООО «Гранд Отель»', location: 'Холл 1 этажа', installDate: '12.04.2024', warrantyUntil: '12.04.2027', status: 'maintenance' },
  { id: 'nq-06', brand: 'Rheem', model: 'RA1636AJ1', serialNumber: 'RH-2023-12-031', client: 'Клиника «МедЦентр»', location: 'Стерилизационная', installDate: '18.12.2023', warrantyUntil: '18.12.2026', status: 'active' },
  { id: 'nq-07', brand: 'York', model: 'YHH36B21S', serialNumber: 'YK-2024-01-055', client: 'ИП Николаев Р.В.', location: 'Магазин на Ленина', installDate: '08.01.2024', warrantyUntil: '08.01.2027', status: 'active' },
  { id: 'nq-08', brand: 'Midea', model: 'MSMABU-09HRDN1', serialNumber: 'MD-2023-05-022', client: 'ООО «Альфа Технолоджис»', location: 'Переговорная 3', installDate: '20.05.2023', warrantyUntil: '20.05.2026', status: 'active' },
  { id: 'nq-09', brand: 'Chigo', model: 'CS-35H3A-1B170', serialNumber: 'CG-2024-03-014', client: 'Банк «Горизонт»', location: 'Кассовый зал', installDate: '15.03.2024', warrantyUntil: '15.03.2027', status: 'fault' },
  { id: 'nq-10', brand: 'AUX', model: 'ASW-H09B4/LK', serialNumber: 'AU-2023-09-039', client: 'ИП Фёдоров Г.П.', location: 'Гараж', installDate: '25.09.2023', warrantyUntil: '25.09.2026', status: 'active' },
  { id: 'nq-11', brand: 'TCL', model: 'TAC-12CHSA/XA31', serialNumber: 'TC-2024-05-026', client: 'ТЦ «Мегаполис»', location: 'Подсобка, 3 эт.', installDate: '10.05.2024', warrantyUntil: '10.05.2027', status: 'active' },
  { id: 'nq-12', brand: 'MDV', model: 'MDSF-60ARN1', serialNumber: 'MV-2023-07-018', client: 'ООО «Гранд Отель»', location: 'Spa-комплекс', installDate: '30.07.2023', warrantyUntil: '30.07.2026', status: 'maintenance' },
];

// ─── QR Code SVG generator (decorative) ───────────────────────────────────────

function generateQRPattern(seed: number, size: number): boolean[][] {
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      // Deterministic pseudo-random based on seed + position
      const val = ((seed * 31 + r * 17 + c * 13) * 7919) % 100;
      row.push(val < 55);
    }
    grid.push(row);
  }
  // Always fill corners (QR alignment markers)
  const corners = [0, 1, 2, size - 3, size - 2, size - 1];
  for (const r of corners) {
    for (const c of corners) {
      grid[r][c] = true;
    }
  }
  return grid;
}

interface QRSVGProps {
  seed: number;
  size?: number;
  cellPx?: number;
  className?: string;
}

function QRCodeSVG({ seed, size = 5, cellPx = 8, className }: QRSVGProps) {
  const pattern = generateQRPattern(seed, size);
  const svgSize = size * cellPx + 4;
  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x={0} y={0} width={svgSize} height={svgSize} fill="white" />
      {pattern.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellPx + 2}
              y={r * cellPx + 2}
              width={cellPx - 1}
              height={cellPx - 1}
              fill="#111827"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active:      { label: 'Активен',    variant: 'default' },
  maintenance: { label: 'На ТО',      variant: 'secondary' },
  fault:       { label: 'Неисправен', variant: 'destructive' },
};

// ─── Metrics Bar ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}

function MetricCard({ icon, label, value, sub, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon name={icon} size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── QR Grid Card ─────────────────────────────────────────────────────────────

interface QRGridCardProps {
  item: EquipmentItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: EquipmentItem) => void;
}

function QRGridCard({ item, selected, onSelect, onOpen }: QRGridCardProps) {
  const status = STATUS_CONFIG[item.status];

  return (
    <div className={`bg-white rounded-xl border-2 transition-all ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'} p-4 flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item.id)}
          className="mt-1 w-4 h-4 rounded accent-blue-600 cursor-pointer"
        />
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
          <QRCodeSVG seed={item.qrSeed} size={7} cellPx={7} />
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="font-semibold text-gray-900 text-sm leading-tight">
          {item.brand} {item.model}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 font-mono">{item.serialNumber}</p>
        <p className="text-xs text-gray-600 mt-1 truncate" title={item.client}>{item.client}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.location}</p>
        <p className="text-xs text-gray-400 mt-0.5">Установлен: {item.installDate}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 mt-auto pt-1">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-8"
          onClick={() => toast.success(`QR скачан: ${item.brand} ${item.model}`)}
        >
          <Icon name="Download" size={12} className="mr-1" />
          Скачать
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs h-8"
          onClick={() => toast.success(`Отправлено на печать: ${item.serialNumber}`)}
        >
          <Icon name="Printer" size={12} className="mr-1" />
          Печать
        </Button>
        <Button
          size="sm"
          variant="default"
          className="flex-1 text-xs h-8"
          onClick={() => onOpen(item)}
        >
          <Icon name="ExternalLink" size={12} className="mr-1" />
          Карточка
        </Button>
      </div>
    </div>
  );
}

// ─── QR List Row ──────────────────────────────────────────────────────────────

interface QRListRowProps {
  item: EquipmentItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: EquipmentItem) => void;
}

function QRListRow({ item, selected, onSelect, onOpen }: QRListRowProps) {
  const status = STATUS_CONFIG[item.status];
  return (
    <div className={`bg-white rounded-xl border-2 transition-all ${selected ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'} p-4 flex items-center gap-4`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(item.id)}
        className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
      />
      <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
        <QRCodeSVG seed={item.qrSeed} size={5} cellPx={5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{item.brand} {item.model}</span>
          <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
        </div>
        <div className="flex gap-4 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-500 font-mono">{item.serialNumber}</span>
          <span className="text-xs text-gray-500">{item.client}</span>
          <span className="text-xs text-gray-400">{item.location}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 flex-shrink-0 hidden md:block">Установлен: {item.installDate}</p>
      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8"
          onClick={() => toast.success(`QR скачан: ${item.serialNumber}`)}
        >
          <Icon name="Download" size={13} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8"
          onClick={() => toast.success(`Отправлено на печать: ${item.serialNumber}`)}
        >
          <Icon name="Printer" size={13} />
        </Button>
        <Button size="sm" variant="default" className="text-xs h-8" onClick={() => onOpen(item)}>
          <Icon name="ExternalLink" size={13} className="mr-1" />
          Карточка
        </Button>
      </div>
    </div>
  );
}

// ─── Without QR Panel ─────────────────────────────────────────────────────────

interface WithoutQRPanelProps {
  items: typeof INITIAL_WITHOUT_QR;
  onGenerate: (id: string) => void;
  onGenerateAll: () => void;
}

function WithoutQRPanel({ items, onGenerate, onGenerateAll }: WithoutQRPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Без QR-кода</h3>
          <p className="text-xs text-gray-500 mt-0.5">{items.length} единиц оборудования</p>
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={onGenerateAll}
          disabled={items.length === 0}
        >
          <Icon name="QrCode" size={14} className="mr-1.5" />
          Сгенерировать все
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Icon name="CheckCircle" size={32} className="mx-auto mb-2 text-green-500" />
            <p className="text-sm">Всё оборудование имеет QR-код</p>
          </div>
        ) : (
          items.map((eq) => {
            const status = STATUS_CONFIG[eq.status];
            return (
              <div key={eq.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 truncate">{eq.brand} {eq.model}</span>
                    <Badge variant={status.variant} className="text-xs flex-shrink-0">{status.label}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{eq.serialNumber}</p>
                  <p className="text-xs text-gray-400 truncate">{eq.client}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 flex-shrink-0"
                  onClick={() => onGenerate(eq.id)}
                >
                  <Icon name="QrCode" size={12} className="mr-1" />
                  Создать QR
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  item: EquipmentItem;
  onClose: () => void;
}

function DetailModal({ item, onClose }: DetailModalProps) {
  const status = STATUS_CONFIG[item.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{item.brand} {item.model}</h2>
            <p className="text-sm text-gray-500 font-mono">{item.serialNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* QR large */}
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner">
              <QRCodeSVG seed={item.qrSeed} size={8} cellPx={10} />
            </div>
            <p className="text-xs text-gray-400 font-mono">{item.serialNumber}</p>
            <div className="flex gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => toast.success(`PDF скачан: ${item.brand} ${item.model}`)}
              >
                <Icon name="FileDown" size={14} className="mr-1.5" />
                Скачать PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Стикер отправлен на печать: ${item.serialNumber}`)}
              >
                <Icon name="Printer" size={14} className="mr-1.5" />
                Стикер
              </Button>
            </div>
          </div>

          {/* Equipment data */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <Icon name="Info" size={16} className="text-blue-500" />
              Данные оборудования
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {[
                { label: 'Бренд',          value: item.brand },
                { label: 'Модель',         value: item.model },
                { label: 'Серийный номер', value: item.serialNumber },
                { label: 'Клиент',         value: item.client },
                { label: 'Объект',         value: item.location },
                { label: 'Год установки',  value: item.installDate },
                { label: 'Гарантия до',    value: item.warrantyUntil },
                { label: 'Статус',         value: STATUS_CONFIG[item.status].label },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scan history */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <Icon name="History" size={16} className="text-purple-500" />
              История сканирований
            </h3>
            <div className="flex flex-col gap-2">
              {item.scanHistory.map((scan, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{scan.action}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{scan.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <Icon name="User" size={11} className="inline mr-1" />
                      {scan.engineer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function EquipmentQRFull() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<EquipmentItem | null>(null);
  const [withoutQR, setWithoutQR] = useState(INITIAL_WITHOUT_QR);

  const filteredItems = EQUIPMENT_WITH_QR.filter((eq) => {
    const q = search.toLowerCase();
    return (
      eq.brand.toLowerCase().includes(q) ||
      eq.model.toLowerCase().includes(q) ||
      eq.serialNumber.toLowerCase().includes(q) ||
      eq.client.toLowerCase().includes(q) ||
      eq.location.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleDownloadSelected = () => {
    toast.success(`Скачивание ${selectedIds.size} QR-кодов...`);
    setSelectedIds(new Set());
  };

  const handleGenerateQR = (id: string) => {
    const eq = withoutQR.find((e) => e.id === id);
    if (eq) {
      toast.success(`QR-код сгенерирован: ${eq.brand} ${eq.model}`);
      setWithoutQR((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleGenerateAll = () => {
    toast.success(`Сгенерировано ${withoutQR.length} QR-кодов`);
    setWithoutQR([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR-коды оборудования</h1>
          <p className="text-sm text-gray-500 mt-1">Управление QR-метками климатического оборудования</p>
        </div>
        <Button
          onClick={() => toast.success('Генерация всех QR-кодов запущена...')}
        >
          <Icon name="QrCode" size={16} className="mr-2" />
          Массовая генерация
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="QrCode"    label="QR сгенерировано"       value={156}           color="bg-blue-500" />
        <MetricCard icon="ScanLine"  label="Сканирований за месяц"  value={847}           color="bg-purple-500" />
        <MetricCard icon="AlertCircle" label="Без QR-кода"          value={withoutQR.length} color="bg-orange-500" />
        <MetricCard icon="Clock"     label="Последнее сканирование" value="5 мин назад"   color="bg-green-500" />
      </div>

      {/* Main area */}
      <div className="flex gap-6 items-start">
        {/* Left: QR grid/list */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по бренду, модели, S/N, клиенту..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Select all */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="h-9"
            >
              <Icon name={selectedIds.size === filteredItems.length && filteredItems.length > 0 ? 'CheckSquare' : 'Square'} size={14} className="mr-1.5" />
              {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? 'Снять всё' : 'Выбрать всё'}
            </Button>

            {/* Download selected */}
            {selectedIds.size > 0 && (
              <Button size="sm" variant="default" className="h-9" onClick={handleDownloadSelected}>
                <Icon name="Download" size={14} className="mr-1.5" />
                Скачать выбранные QR ({selectedIds.size})
              </Button>
            )}

            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon name="LayoutGrid" size={14} />
                Сетка
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon name="List" size={14} />
                Список
              </button>
            </div>
          </div>

          {/* Items */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <Icon name="SearchX" size={36} className="mx-auto mb-3" />
              <p className="text-sm">Ничего не найдено</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <QRGridCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onSelect={toggleSelect}
                  onOpen={setDetailItem}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredItems.map((item) => (
                <QRListRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onSelect={toggleSelect}
                  onOpen={setDetailItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Without QR panel */}
        <div className="w-80 flex-shrink-0 sticky top-6" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
          <WithoutQRPanel
            items={withoutQR}
            onGenerate={handleGenerateQR}
            onGenerateAll={handleGenerateAll}
          />
        </div>
      </div>

      {/* Detail modal */}
      {detailItem && (
        <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
}
