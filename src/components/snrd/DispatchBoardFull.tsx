import { useState, useRef, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const DAY_START_HOUR = 7;   // 07:00
const DAY_END_HOUR   = 20;  // 20:00
const TOTAL_HOURS    = DAY_END_HOUR - DAY_START_HOUR; // 13
const ENGINEER_COL_W = 200; // px — left column
const UNASSIGNED_W   = 280; // px — right panel
const ROW_H          = 64;  // px — height of each engineer row

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type WorkOrderType = 'repair' | 'maintenance' | 'installation' | 'warranty' | 'emergency';
type WorkOrderStatus = 'new' | 'assigned' | 'en_route' | 'on_site' | 'in_progress' | 'awaiting_parts' | 'completed';
type ViewMode = 'day' | 'week';

interface Engineer {
  id: string;
  name: string;
  initials: string;
  online: boolean;
  phone: string;
  avatarColor: string;
}

interface WorkOrder {
  id: string;
  number: string;
  engineerId: string | null;
  client: string;
  address: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  startHour: number;   // decimal, e.g. 9.5 = 09:30
  durationH: number;   // hours, e.g. 1.5
  description: string;
  priority: 'normal' | 'urgent' | 'emergency';
  phone: string;
  slaDeadline: string;
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Петров А.В.',    initials: 'ПА', online: true,  phone: '+7 900 111-22-33', avatarColor: '#4f46e5' },
  { id: 'e2', name: 'Сидоров И.С.',   initials: 'СИ', online: true,  phone: '+7 900 222-33-44', avatarColor: '#0891b2' },
  { id: 'e3', name: 'Козлов Д.М.',    initials: 'КД', online: false, phone: '+7 900 333-44-55', avatarColor: '#16a34a' },
  { id: 'e4', name: 'Морозова Е.К.',  initials: 'МЕ', online: true,  phone: '+7 900 444-55-66', avatarColor: '#d97706' },
  { id: 'e5', name: 'Волков П.Н.',    initials: 'ВП', online: true,  phone: '+7 900 555-66-77', avatarColor: '#dc2626' },
  { id: 'e6', name: 'Новиков С.В.',   initials: 'НС', online: false, phone: '+7 900 666-77-88', avatarColor: '#7c3aed' },
  { id: 'e7', name: 'Захаров Р.А.',   initials: 'ЗР', online: true,  phone: '+7 900 777-88-99', avatarColor: '#0f766e' },
  { id: 'e8', name: 'Лебедева О.П.',  initials: 'ЛО', online: true,  phone: '+7 900 888-99-00', avatarColor: '#be185d' },
];

const INITIAL_ORDERS: WorkOrder[] = [
  // Петров А.В.
  { id: 'wo1',  number: 'WO-2026-000101', engineerId: 'e1', client: 'ООО Альфа',      address: 'ул. Ленина, 12',      type: 'repair',       status: 'completed',   startHour: 8,    durationH: 2,   description: 'Ремонт кондиционера Daikin', priority: 'normal',    phone: '+7 900 001-01-01', slaDeadline: '09:00' },
  { id: 'wo2',  number: 'WO-2026-000102', engineerId: 'e1', client: 'ИП Иванова',     address: 'пр. Мира, 34',        type: 'maintenance',  status: 'assigned',    startHour: 11,   durationH: 1.5, description: 'Плановое ТО системы', priority: 'normal',    phone: '+7 900 001-01-02', slaDeadline: '13:00' },
  { id: 'wo3',  number: 'WO-2026-000103', engineerId: 'e1', client: 'ТЦ Галерея',     address: 'ул. Садовая, 7',      type: 'installation', status: 'in_progress', startHour: 14,   durationH: 3,   description: 'Монтаж VRF-системы', priority: 'urgent',    phone: '+7 900 001-01-03', slaDeadline: '18:00' },
  // Сидоров И.С.
  { id: 'wo4',  number: 'WO-2026-000104', engineerId: 'e2', client: 'ООО Берег',      address: 'ул. Речная, 3',       type: 'repair',       status: 'en_route',    startHour: 7.5,  durationH: 2.5, description: 'Диагностика и ремонт LG', priority: 'urgent',    phone: '+7 900 002-02-01', slaDeadline: '11:00' },
  { id: 'wo5',  number: 'WO-2026-000105', engineerId: 'e2', client: 'Сбербанк',       address: 'ул. Банковская, 1',   type: 'maintenance',  status: 'assigned',    startHour: 12,   durationH: 2,   description: 'ТО 4 кондиционеров', priority: 'normal',    phone: '+7 900 002-02-02', slaDeadline: '15:00' },
  { id: 'wo6',  number: 'WO-2026-000106', engineerId: 'e2', client: 'ООО Прогресс',   address: 'пр. Победы, 100',     type: 'repair',       status: 'assigned',    startHour: 15.5, durationH: 1.5, description: 'Замена компрессора', priority: 'normal',    phone: '+7 900 002-02-03', slaDeadline: '18:00' },
  // Козлов Д.М.
  { id: 'wo7',  number: 'WO-2026-000107', engineerId: 'e3', client: 'ООО Гранд',      address: 'ул. Центральная, 5',  type: 'warranty',     status: 'on_site',     startHour: 9,    durationH: 2,   description: 'Гарантийный осмотр Mitsubishi', priority: 'normal', phone: '+7 900 003-03-01', slaDeadline: '12:00' },
  { id: 'wo8',  number: 'WO-2026-000108', engineerId: 'e3', client: 'Магнит',         address: 'ул. Торговая, 22',    type: 'maintenance',  status: 'assigned',    startHour: 13,   durationH: 3,   description: 'ТО холодильного оборудования', priority: 'normal', phone: '+7 900 003-03-02', slaDeadline: '17:00' },
  { id: 'wo9',  number: 'WO-2026-000109', engineerId: 'e3', client: 'ИП Козлов',      address: 'ул. Лесная, 8',       type: 'repair',       status: 'assigned',    startHour: 17,   durationH: 2,   description: 'Нет холода, проверка фреона', priority: 'urgent',  phone: '+7 900 003-03-03', slaDeadline: '20:00' },
  // Морозова Е.К.
  { id: 'wo10', number: 'WO-2026-000110', engineerId: 'e4', client: 'Росбанк',        address: 'пр. Ленина, 45',      type: 'installation', status: 'in_progress', startHour: 8,    durationH: 4,   description: 'Монтаж системы вентиляции', priority: 'normal',    phone: '+7 900 004-04-01', slaDeadline: '13:00' },
  { id: 'wo11', number: 'WO-2026-000111', engineerId: 'e4', client: 'ООО Астра',      address: 'ул. Зелёная, 18',     type: 'maintenance',  status: 'assigned',    startHour: 14,   durationH: 1.5, description: 'Плановое ТО дата-центра', priority: 'urgent',    phone: '+7 900 004-04-02', slaDeadline: '16:00' },
  { id: 'wo12', number: 'WO-2026-000112', engineerId: 'e4', client: 'Пятёрочка №33',  address: 'ул. Советская, 9',    type: 'repair',       status: 'assigned',    startHour: 16.5, durationH: 2,   description: 'Шум компрессора', priority: 'normal',    phone: '+7 900 004-04-03', slaDeadline: '19:30' },
  // Волков П.Н.
  { id: 'wo13', number: 'WO-2026-000113', engineerId: 'e5', client: 'Детский сад №4', address: 'ул. Пионерская, 2',   type: 'emergency',    status: 'on_site',     startHour: 7,    durationH: 3,   description: 'Аварийный ремонт — нет вентиляции', priority: 'emergency', phone: '+7 900 005-05-01', slaDeadline: '10:00' },
  { id: 'wo14', number: 'WO-2026-000114', engineerId: 'e5', client: 'ООО Феникс',     address: 'пр. Строителей, 77',  type: 'repair',       status: 'assigned',    startHour: 11.5, durationH: 2,   description: 'Утечка хладагента R410A', priority: 'urgent',    phone: '+7 900 005-05-02', slaDeadline: '14:30' },
  { id: 'wo15', number: 'WO-2026-000115', engineerId: 'e5', client: 'ИП Попов',       address: 'ул. Гагарина, 55',    type: 'maintenance',  status: 'assigned',    startHour: 15,   durationH: 1.5, description: 'Промывка дренажа', priority: 'normal',    phone: '+7 900 005-05-03', slaDeadline: '17:30' },
  // Новиков С.В.
  { id: 'wo16', number: 'WO-2026-000116', engineerId: 'e6', client: 'ООО Омега',      address: 'ул. Промышленная, 12',type: 'installation', status: 'assigned',    startHour: 9,    durationH: 5,   description: 'Монтаж чиллера 60 кВт', priority: 'normal',    phone: '+7 900 006-06-01', slaDeadline: '15:00' },
  { id: 'wo17', number: 'WO-2026-000117', engineerId: 'e6', client: 'Ресторан «Сад»', address: 'ул. Парковая, 3',     type: 'repair',       status: 'assigned',    startHour: 16,   durationH: 2,   description: 'Ремонт системы охлаждения кухни', priority: 'urgent', phone: '+7 900 006-06-02', slaDeadline: '19:00' },
  // Захаров Р.А.
  { id: 'wo18', number: 'WO-2026-000118', engineerId: 'e7', client: 'Поликлиника №2', address: 'ул. Медицинская, 7',  type: 'maintenance',  status: 'completed',   startHour: 8,    durationH: 2.5, description: 'ТО вентиляции операционной', priority: 'urgent',    phone: '+7 900 007-07-01', slaDeadline: '11:00' },
  { id: 'wo19', number: 'WO-2026-000119', engineerId: 'e7', client: 'ООО Кристалл',   address: 'ул. Алмазная, 4',     type: 'repair',       status: 'in_progress', startHour: 11.5, durationH: 2,   description: 'Ошибка E6 — датчик температуры', priority: 'normal',  phone: '+7 900 007-07-02', slaDeadline: '14:30' },
  { id: 'wo20', number: 'WO-2026-000120', engineerId: 'e7', client: 'ТЦ Радуга',      address: 'пр. Энтузиастов, 88', type: 'installation', status: 'assigned',    startHour: 14.5, durationH: 3.5, description: 'Монтаж 6 сплит-систем', priority: 'normal',    phone: '+7 900 007-07-03', slaDeadline: '19:00' },
  // Лебедева О.П.
  { id: 'wo21', number: 'WO-2026-000121', engineerId: 'e8', client: 'Кафе «Уют»',     address: 'ул. Тихая, 11',       type: 'repair',       status: 'completed',   startHour: 8.5,  durationH: 1.5, description: 'Замена фильтров, чистка', priority: 'normal',    phone: '+7 900 008-08-01', slaDeadline: '11:00' },
  { id: 'wo22', number: 'WO-2026-000122', engineerId: 'e8', client: 'Офис ГК Альянс', address: 'пр. Центральный, 1',  type: 'maintenance',  status: 'on_site',     startHour: 11,   durationH: 2,   description: 'ТО 8 кассетных кондиционеров', priority: 'normal',  phone: '+7 900 008-08-02', slaDeadline: '14:00' },
  { id: 'wo23', number: 'WO-2026-000123', engineerId: 'e8', client: 'ООО Ритм',       address: 'ул. Музыкальная, 5',  type: 'repair',       status: 'assigned',    startHour: 14,   durationH: 2.5, description: 'Вибрация наружного блока', priority: 'urgent',    phone: '+7 900 008-08-03', slaDeadline: '17:30' },
  { id: 'wo24', number: 'WO-2026-000124', engineerId: 'e8', client: 'Гостиница «Рус»',address: 'ул. Гостиничная, 2',  type: 'maintenance',  status: 'assigned',    startHour: 17.5, durationH: 2,   description: 'ТО 12 номеров', priority: 'normal',    phone: '+7 900 008-08-04', slaDeadline: '20:00' },
];

const UNASSIGNED_ORDERS: WorkOrder[] = [
  { id: 'ua1', number: 'WO-2026-000125', engineerId: null, client: 'ООО Меркурий',   address: 'ул. Купеческая, 33',  type: 'repair',       status: 'new', startHour: 0, durationH: 2,   description: 'Не работает обогрев',         priority: 'normal',    phone: '+7 900 100-11-11', slaDeadline: '15:00' },
  { id: 'ua2', number: 'WO-2026-000126', engineerId: null, client: 'Школа №45',      address: 'пр. Школьный, 15',    type: 'emergency',    status: 'new', startHour: 0, durationH: 3,   description: 'Аварийная неисправность',     priority: 'emergency', phone: '+7 900 200-22-22', slaDeadline: '12:00' },
  { id: 'ua3', number: 'WO-2026-000127', engineerId: null, client: 'ООО Экспресс',   address: 'ул. Быстрая, 8',      type: 'installation', status: 'new', startHour: 0, durationH: 4,   description: 'Монтаж сплит-системы',        priority: 'normal',    phone: '+7 900 300-33-33', slaDeadline: '18:00' },
  { id: 'ua4', number: 'WO-2026-000128', engineerId: null, client: 'ИП Фролов',      address: 'ул. Фруктовая, 12',   type: 'maintenance',  status: 'new', startHour: 0, durationH: 1.5, description: 'Плановое ТО',                priority: 'normal',    phone: '+7 900 400-44-44', slaDeadline: '17:00' },
];

// ─────────────────────────────────────────────
// Helper utilities
// ─────────────────────────────────────────────

function formatHour(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' });
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function nowDecimalHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

/** Convert decimal hour to left% within the 07:00-20:00 window */
function hourToPercent(h: number): number {
  return ((h - DAY_START_HOUR) / TOTAL_HOURS) * 100;
}

// ─────────────────────────────────────────────
// Styling helpers
// ─────────────────────────────────────────────

const TYPE_STYLES: Record<WorkOrderType, { bg: string; border: string; label: string }> = {
  repair:       { bg: 'bg-blue-100',   border: 'border-blue-400',   label: 'Ремонт'   },
  maintenance:  { bg: 'bg-green-100',  border: 'border-green-400',  label: 'ТО'       },
  installation: { bg: 'bg-orange-100', border: 'border-orange-400', label: 'Монтаж'   },
  warranty:     { bg: 'bg-purple-100', border: 'border-purple-400', label: 'Гарантия' },
  emergency:    { bg: 'bg-red-100',    border: 'border-red-500',    label: 'Аварийный'},
};

const STATUS_BADGE: Record<WorkOrderStatus, { color: string; label: string }> = {
  new:            { color: 'bg-slate-100 text-slate-700',  label: 'Новый'          },
  assigned:       { color: 'bg-blue-100 text-blue-700',    label: 'Назначен'       },
  en_route:       { color: 'bg-yellow-100 text-yellow-700',label: 'В пути'         },
  on_site:        { color: 'bg-indigo-100 text-indigo-700',label: 'На месте'       },
  in_progress:    { color: 'bg-cyan-100 text-cyan-700',    label: 'Выполняется'    },
  awaiting_parts: { color: 'bg-orange-100 text-orange-700',label: 'Ожидает ЗИП'   },
  completed:      { color: 'bg-green-100 text-green-700',  label: 'Выполнен'       },
};

const PRIORITY_DOT: Record<WorkOrder['priority'], string> = {
  normal:    'bg-gray-400',
  urgent:    'bg-orange-500',
  emergency: 'bg-red-600',
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Engineer avatar column cell */
function EngineerCell({ engineer }: { engineer: Engineer }) {
  return (
    <div
      className="flex items-center gap-2 px-3 border-b border-r border-gray-200 bg-white"
      style={{ width: ENGINEER_COL_W, minWidth: ENGINEER_COL_W, height: ROW_H }}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: engineer.avatarColor }}
        >
          {engineer.initials}
        </div>
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
            engineer.online ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{engineer.name}</p>
        <p className={`text-[10px] ${engineer.online ? 'text-green-600' : 'text-gray-400'}`}>
          {engineer.online ? 'Онлайн' : 'Офлайн'}
        </p>
      </div>
    </div>
  );
}

/** Time-scale header */
function TimeScaleHeader() {
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START_HOUR + i);
  return (
    <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
      {/* Engineer column placeholder */}
      <div style={{ width: ENGINEER_COL_W, minWidth: ENGINEER_COL_W }} className="border-r border-gray-200 flex-shrink-0" />
      {/* Hour marks */}
      <div className="flex flex-1 relative">
        {hours.map((h) => (
          <div
            key={h}
            className="flex-1 text-center text-[10px] text-gray-500 py-1 border-r border-gray-200 last:border-r-0"
          >
            {String(h).padStart(2, '0')}:00
          </div>
        ))}
      </div>
    </div>
  );
}

/** Detail popup card */
function OrderDetailCard({
  order,
  engineer,
  onClose,
  onShift,
}: {
  order: WorkOrder;
  engineer: Engineer | undefined;
  onClose: () => void;
  onShift: (orderId: string, delta: number) => void;
}) {
  const typeStyle = TYPE_STYLES[order.type];
  const statusStyle = STATUS_BADGE[order.status];

  return (
    <div className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72 top-8 left-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 font-mono">{order.number}</p>
          <p className="font-semibold text-gray-900 text-sm leading-tight">{order.client}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0">
          <Icon name="X" size={14} />
        </button>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1 mb-3">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${typeStyle.bg} ${typeStyle.border}`}>
          {typeStyle.label}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle.color}`}>
          {statusStyle.label}
        </span>
      </div>

      {/* Info rows */}
      <div className="space-y-1.5 mb-3 text-xs text-gray-700">
        <div className="flex gap-1.5 items-start">
          <Icon name="MapPin" size={12} className="mt-0.5 text-gray-400 flex-shrink-0" />
          <span>{order.address}</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <Icon name="Clock" size={12} className="text-gray-400 flex-shrink-0" />
          <span>{formatHour(order.startHour)} — {formatHour(order.startHour + order.durationH)} ({order.durationH * 60} мин)</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <Icon name="Phone" size={12} className="text-gray-400 flex-shrink-0" />
          <span>{order.phone}</span>
        </div>
        {engineer && (
          <div className="flex gap-1.5 items-center">
            <Icon name="User" size={12} className="text-gray-400 flex-shrink-0" />
            <span>{engineer.name}</span>
          </div>
        )}
        <div className="flex gap-1.5 items-center">
          <Icon name="AlertCircle" size={12} className="text-gray-400 flex-shrink-0" />
          <span>SLA: {order.slaDeadline}</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 mb-3">{order.description}</p>

      {/* Shift buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-[10px] h-7"
          onClick={() => onShift(order.id, -0.5)}
        >
          <Icon name="ChevronLeft" size={12} className="mr-1" />
          −30 мин
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-[10px] h-7"
          onClick={() => onShift(order.id, 0.5)}
        >
          +30 мин
          <Icon name="ChevronRight" size={12} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

/** Gantt bar for a single work order */
function GanttBar({
  order,
  isSelected,
  onClick,
}: {
  order: WorkOrder;
  isSelected: boolean;
  onClick: () => void;
}) {
  const typeStyle = TYPE_STYLES[order.type];
  const leftPct = hourToPercent(order.startHour);
  const widthPct = (order.durationH / TOTAL_HOURS) * 100;
  const isCompleted = order.status === 'completed';

  return (
    <div
      className={`absolute top-2 bottom-2 rounded-md border-l-4 cursor-pointer select-none transition-all
        ${typeStyle.bg} ${typeStyle.border}
        ${isCompleted ? 'opacity-60' : 'opacity-90'}
        ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500 z-20' : 'hover:opacity-100 hover:shadow-md z-10'}
      `}
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      onClick={onClick}
      title={`${order.number} • ${order.client}`}
    >
      <div className="px-1.5 py-1 h-full flex flex-col justify-center overflow-hidden">
        <p className="text-[10px] font-bold text-gray-800 leading-tight truncate">{order.number.slice(-4)}</p>
        <p className="text-[9px] text-gray-600 truncate leading-tight">{order.description}</p>
      </div>
    </div>
  );
}

/** Unassigned order card in right panel */
function UnassignedCard({ order }: { order: WorkOrder }) {
  const typeStyle = TYPE_STYLES[order.type];
  return (
    <div className={`rounded-lg border ${typeStyle.border} ${typeStyle.bg} p-3 mb-2`}>
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-[10px] font-mono text-gray-500">{order.number}</span>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${PRIORITY_DOT[order.priority]}`} />
      </div>
      <p className="text-xs font-semibold text-gray-800 leading-tight mb-0.5">{order.client}</p>
      <p className="text-[10px] text-gray-600 mb-0.5 truncate">{order.address}</p>
      <p className="text-[10px] text-gray-500 mb-2">{order.description}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-red-600 font-medium">SLA: {order.slaDeadline}</span>
        <Button
          size="sm"
          className="h-6 text-[10px] px-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => toast.info('Выберите инженера', { description: `Нажмите на строку инженера для назначения наряда ${order.number}` })}
        >
          <Icon name="UserPlus" size={10} className="mr-1" />
          Назначить
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Statistics bar
// ─────────────────────────────────────────────

function StatsBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Filter types
// ─────────────────────────────────────────────

type StatusFilter = 'all' | WorkOrderStatus;
type TypeFilter   = 'all' | WorkOrderType;

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function DispatchBoardFull() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [orders, setOrders] = useState<WorkOrder[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterEngineer, setFilterEngineer] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterType, setFilterType] = useState<TypeFilter>('all');
  const [nowHour, setNowHour] = useState(nowDecimalHour());
  const ganttScrollRef = useRef<HTMLDivElement>(null);

  // Update "now" line every minute
  useEffect(() => {
    const timer = setInterval(() => setNowHour(nowDecimalHour()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Selected order object
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;
  const selectedEngineer = selectedOrder ? ENGINEERS.find((e) => e.id === selectedOrder.engineerId) : undefined;

  // Shift order by delta hours
  const handleShift = useCallback((orderId: string, delta: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newStart = Math.max(DAY_START_HOUR, Math.min(DAY_END_HOUR - o.durationH, o.startHour + delta));
        toast.success(`Наряд сдвинут на ${delta > 0 ? '+' : ''}${delta * 60} мин`, {
          description: `Новое время: ${formatHour(newStart)}`,
        });
        return { ...o, startHour: newStart };
      }),
    );
  }, []);

  // Filtered engineers
  const visibleEngineers = filterEngineer === 'all'
    ? ENGINEERS
    : ENGINEERS.filter((e) => e.id === filterEngineer);

  // Filtered orders per engineer
  function engineerOrders(engineerId: string): WorkOrder[] {
    return orders.filter((o) => {
      if (o.engineerId !== engineerId) return false;
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (filterType !== 'all' && o.type !== filterType) return false;
      return true;
    });
  }

  // Statistics
  const allAssigned  = orders.filter((o) => o.engineerId !== null);
  const totalCount   = allAssigned.length;
  const completedCnt = allAssigned.filter((o) => o.status === 'completed').length;
  const inProgressCnt= allAssigned.filter((o) => ['en_route','on_site','in_progress'].includes(o.status)).length;
  const waitingCnt   = allAssigned.filter((o) => ['new','assigned','awaiting_parts'].includes(o.status)).length;

  // BarChart data: load % per engineer
  const loadData = ENGINEERS.map((eng) => {
    const engOrders = orders.filter((o) => o.engineerId === eng.id);
    const busyHours = engOrders.reduce((sum, o) => sum + o.durationH, 0);
    const loadPct   = Math.round((busyHours / TOTAL_HOURS) * 100);
    return { name: eng.name.split(' ')[0], load: loadPct };
  });

  // Now-line position
  const nowPct = hourToPercent(nowHour);
  const showNowLine = nowHour >= DAY_START_HOUR && nowHour <= DAY_END_HOUR;

  // Hours for background grid
  const gridHours = Array.from({ length: TOTAL_HOURS }, (_, i) => i);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden">

      {/* ── HEADER ─────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate((d) => addDays(d, -1))}>
            <Icon name="ChevronLeft" size={14} />
          </Button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
            <Icon name="CalendarDays" size={14} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-900 whitespace-nowrap">{formatDate(currentDate)}</span>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate((d) => addDays(d, 1))}>
            <Icon name="ChevronRight" size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setCurrentDate(new Date())}>
            Сегодня
          </Button>
        </div>

        {/* View mode */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['day', 'week'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode);
                if (mode === 'week') toast.info('Режим недели', { description: 'В этом демо отображается дневной вид' });
              }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === mode ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {mode === 'day' ? 'День' : 'Неделя'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterEngineer}
            onChange={(e) => setFilterEngineer(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Все инженеры</option>
            {ENGINEERS.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Все статусы</option>
            {Object.entries(STATUS_BADGE).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TypeFilter)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Все типы</option>
            {Object.entries(TYPE_STYLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
            onClick={() => toast.success('Новый наряд', { description: 'Открыта форма создания наряда' })}
          >
            <Icon name="Plus" size={13} className="mr-1" />
            Добавить наряд
          </Button>
        </div>
      </div>

      {/* ── MAIN AREA ─────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── GANTT SECTION ─────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Time scale header (sticky) */}
          <div className="flex-shrink-0 flex border-b border-gray-200 bg-gray-50">
            {/* Engineer label header */}
            <div
              className="flex-shrink-0 flex items-center px-3 text-xs font-semibold text-gray-500 border-r border-gray-200 bg-gray-50"
              style={{ width: ENGINEER_COL_W, minWidth: ENGINEER_COL_W }}
            >
              <Icon name="Users" size={12} className="mr-1.5" />
              Инженер
            </div>
            {/* Time ticks */}
            <div className="flex flex-1">
              {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START_HOUR + i).map((h) => (
                <div
                  key={h}
                  className="flex-1 text-center text-[10px] text-gray-500 py-1.5 border-r border-gray-100 last:border-r-0"
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Gantt rows (scrollable) */}
          <div className="flex-1 overflow-y-auto overflow-x-auto" ref={ganttScrollRef}>
            <div className="flex flex-col" style={{ minWidth: 900 }}>
              {visibleEngineers.map((engineer) => {
                const engOrders = engineerOrders(engineer.id);
                return (
                  <div key={engineer.id} className="flex border-b border-gray-100 last:border-b-0" style={{ height: ROW_H }}>
                    {/* Engineer column */}
                    <EngineerCell engineer={engineer} />

                    {/* Gantt track */}
                    <div
                      className="flex-1 relative bg-white hover:bg-gray-50/50 transition-colors"
                      onClick={() => setSelectedOrderId(null)}
                    >
                      {/* Hour grid lines */}
                      {gridHours.map((i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-r border-gray-100"
                          style={{ left: `${(i / TOTAL_HOURS) * 100}%` }}
                        />
                      ))}

                      {/* Now line */}
                      {showNowLine && (
                        <div
                          className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-400 z-20 pointer-events-none"
                          style={{ left: `${nowPct}%` }}
                        >
                          <div className="absolute -top-0 -left-[9px] w-4 h-4 flex items-center justify-center">
                            <span className="text-red-500 text-[8px] font-bold">▼</span>
                          </div>
                        </div>
                      )}

                      {/* Order bars */}
                      {engOrders.map((order) => (
                        <div key={order.id} className="absolute inset-0">
                          <GanttBar
                            order={order}
                            isSelected={order.id === selectedOrderId}
                            onClick={() => {
                              setSelectedOrderId((prev) => (prev === order.id ? null : order.id));
                            }}
                          />
                          {/* Detail popup */}
                          {selectedOrderId === order.id && (
                            <OrderDetailCard
                              order={order}
                              engineer={engineer}
                              onClose={() => setSelectedOrderId(null)}
                              onShift={handleShift}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── UNASSIGNED PANEL ─────────────────────── */}
        <div
          className="flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden"
          style={{ width: UNASSIGNED_W }}
        >
          <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Icon name="ClipboardList" size={13} className="text-orange-500" />
            <span className="text-xs font-semibold text-gray-700">Нераспределённые</span>
            <Badge className="ml-auto bg-orange-100 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0">
              {UNASSIGNED_ORDERS.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {UNASSIGNED_ORDERS.map((order) => (
              <UnassignedCard key={order.id} order={order} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex-shrink-0 border-t border-gray-200 p-3">
            <p className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Типы нарядов</p>
            <div className="space-y-1">
              {Object.entries(TYPE_STYLES).map(([key, style]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm border ${style.bg} ${style.border}`} />
                  <span className="text-[10px] text-gray-600">{style.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PANEL ──────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-6 items-stretch flex-wrap">

        {/* Stats badges */}
        <div className="flex gap-2 flex-wrap">
          <StatsBadge label="Нарядов всего"  value={totalCount}    color="text-gray-800"  />
          <StatsBadge label="Выполнено"       value={completedCnt}  color="text-green-600" />
          <StatsBadge label="В работе"        value={inProgressCnt} color="text-blue-600"  />
          <StatsBadge label="Ожидают"         value={waitingCnt}    color="text-orange-500"/>
          <StatsBadge label="Не назначено"    value={UNASSIGNED_ORDERS.length} color="text-red-500" />
        </div>

        {/* Load chart */}
        <div className="flex-1 min-w-[320px]">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Загрузка инженеров</p>
          <ResponsiveContainer width="100%" height={64}>
            <BarChart data={loadData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Загрузка']}
                contentStyle={{ fontSize: 11, borderRadius: 6 }}
              />
              <Bar
                dataKey="load"
                fill="#3b82f6"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick legend: status colors */}
        <div className="flex flex-col justify-center gap-1">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Статусы</p>
          {(['en_route','on_site','in_progress','completed'] as WorkOrderStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[s].color}`}>
                {STATUS_BADGE[s].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
