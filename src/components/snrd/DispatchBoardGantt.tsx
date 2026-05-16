import { useState, useRef, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const DAY_START = 7;   // 07:00
const DAY_END   = 20;  // 20:00
const TOTAL_H   = DAY_END - DAY_START; // 13 hours shown
const ENG_COL_W = 180; // px — left engineer column
const UNASSIGNED_W = 260; // px — right unassigned panel
const ROW_H     = 64;  // px — height per engineer row

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type WOType     = 'repair' | 'maintenance' | 'installation' | 'emergency';
type WOStatus   = 'new' | 'assigned' | 'en_route' | 'on_site' | 'in_progress' | 'awaiting_parts' | 'completed';
type Priority   = 'normal' | 'urgent' | 'emergency';
type ViewMode   = 'day' | 'week';

interface Engineer {
  id: string;
  name: string;
  initials: string;
  online: boolean;
  avatarColor: string;
}

interface WorkOrder {
  id: string;
  number: string;
  engineerId: string | null;
  client: string;
  address: string;
  type: WOType;
  status: WOStatus;
  /** Decimal hour, e.g. 9.5 = 09:30 */
  startHour: number;
  /** Duration in hours, e.g. 1.5 */
  durationH: number;
  description: string;
  priority: Priority;
  phone: string;
  slaDeadline: string;
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Петров А.',    initials: 'ПА', online: true,  avatarColor: '#4f46e5' },
  { id: 'e2', name: 'Сидоров И.',   initials: 'СИ', online: true,  avatarColor: '#0891b2' },
  { id: 'e3', name: 'Козлов Д.',    initials: 'КД', online: false, avatarColor: '#16a34a' },
  { id: 'e4', name: 'Морозова Е.',  initials: 'МЕ', online: true,  avatarColor: '#d97706' },
  { id: 'e5', name: 'Волков П.',    initials: 'ВП', online: true,  avatarColor: '#dc2626' },
  { id: 'e6', name: 'Новиков С.',   initials: 'НС', online: false, avatarColor: '#7c3aed' },
  { id: 'e7', name: 'Захаров Р.',   initials: 'ЗР', online: true,  avatarColor: '#0f766e' },
  { id: 'e8', name: 'Лебедева О.',  initials: 'ЛО', online: true,  avatarColor: '#be185d' },
];

const INITIAL_ORDERS: WorkOrder[] = [
  // Петров А.
  { id: 'wo1',  number: 'WO-2026-000101', engineerId: 'e1', client: 'ООО Альфа',       address: 'ул. Ленина, 12',       type: 'repair',       status: 'completed',   startHour: 7.5,  durationH: 2,   description: 'Ремонт Daikin FTX35',        priority: 'normal',    phone: '+7 900 001-01-01', slaDeadline: '10:00' },
  { id: 'wo2',  number: 'WO-2026-000102', engineerId: 'e1', client: 'ИП Иванова',      address: 'пр. Мира, 34',         type: 'maintenance',  status: 'assigned',    startHour: 10.5, durationH: 1.5, description: 'Плановое ТО, чистка',        priority: 'normal',    phone: '+7 900 001-01-02', slaDeadline: '13:00' },
  { id: 'wo3',  number: 'WO-2026-000103', engineerId: 'e1', client: 'ТЦ Галерея',      address: 'ул. Садовая, 7',       type: 'installation', status: 'in_progress', startHour: 14,   durationH: 3.5, description: 'Монтаж VRF Mitsubishi',      priority: 'urgent',    phone: '+7 900 001-01-03', slaDeadline: '18:00' },
  // Сидоров И.
  { id: 'wo4',  number: 'WO-2026-000104', engineerId: 'e2', client: 'ООО Берег',       address: 'ул. Речная, 3',        type: 'repair',       status: 'en_route',    startHour: 7,    durationH: 2.5, description: 'Диагностика и ремонт LG',    priority: 'urgent',    phone: '+7 900 002-02-01', slaDeadline: '10:30' },
  { id: 'wo5',  number: 'WO-2026-000105', engineerId: 'e2', client: 'Сбербанк',        address: 'ул. Банковская, 1',    type: 'maintenance',  status: 'assigned',    startHour: 11,   durationH: 2,   description: 'ТО 4 кондиционеров',         priority: 'normal',    phone: '+7 900 002-02-02', slaDeadline: '14:00' },
  { id: 'wo6',  number: 'WO-2026-000106', engineerId: 'e2', client: 'ООО Прогресс',    address: 'пр. Победы, 100',      type: 'repair',       status: 'assigned',    startHour: 15,   durationH: 2,   description: 'Замена компрессора',          priority: 'normal',    phone: '+7 900 002-02-03', slaDeadline: '18:00' },
  // Козлов Д.
  { id: 'wo7',  number: 'WO-2026-000107', engineerId: 'e3', client: 'ООО Гранд',       address: 'ул. Центральная, 5',   type: 'maintenance',  status: 'on_site',     startHour: 9,    durationH: 2,   description: 'ТО Mitsubishi Heavy',        priority: 'normal',    phone: '+7 900 003-03-01', slaDeadline: '12:00' },
  { id: 'wo8',  number: 'WO-2026-000108', engineerId: 'e3', client: 'Магнит',          address: 'ул. Торговая, 22',     type: 'maintenance',  status: 'assigned',    startHour: 12.5, durationH: 3,   description: 'ТО холодильного оборудования', priority: 'normal',  phone: '+7 900 003-03-02', slaDeadline: '17:00' },
  { id: 'wo9',  number: 'WO-2026-000109', engineerId: 'e3', client: 'ИП Козлов',       address: 'ул. Лесная, 8',        type: 'repair',       status: 'assigned',    startHour: 17,   durationH: 2,   description: 'Нет холода, проверка фреона', priority: 'urgent',  phone: '+7 900 003-03-03', slaDeadline: '20:00' },
  // Морозова Е.
  { id: 'wo10', number: 'WO-2026-000110', engineerId: 'e4', client: 'Росбанк',         address: 'пр. Ленина, 45',       type: 'installation', status: 'in_progress', startHour: 8,    durationH: 4,   description: 'Монтаж вентиляции',          priority: 'normal',    phone: '+7 900 004-04-01', slaDeadline: '13:00' },
  { id: 'wo11', number: 'WO-2026-000111', engineerId: 'e4', client: 'ООО Астра',       address: 'ул. Зелёная, 18',      type: 'maintenance',  status: 'assigned',    startHour: 14,   durationH: 1.5, description: 'ТО серверной комнаты',       priority: 'urgent',    phone: '+7 900 004-04-02', slaDeadline: '16:00' },
  { id: 'wo12', number: 'WO-2026-000112', engineerId: 'e4', client: 'Пятёрочка №33',   address: 'ул. Советская, 9',     type: 'repair',       status: 'assigned',    startHour: 16.5, durationH: 2,   description: 'Шум компрессора',            priority: 'normal',    phone: '+7 900 004-04-03', slaDeadline: '19:30' },
  // Волков П.
  { id: 'wo13', number: 'WO-2026-000113', engineerId: 'e5', client: 'Детский сад №4',  address: 'ул. Пионерская, 2',    type: 'emergency',    status: 'on_site',     startHour: 7,    durationH: 3,   description: 'Авария — нет вентиляции',    priority: 'emergency', phone: '+7 900 005-05-01', slaDeadline: '10:00' },
  { id: 'wo14', number: 'WO-2026-000114', engineerId: 'e5', client: 'ООО Феникс',      address: 'пр. Строителей, 77',   type: 'repair',       status: 'assigned',    startHour: 11.5, durationH: 2,   description: 'Утечка хладагента R410A',    priority: 'urgent',    phone: '+7 900 005-05-02', slaDeadline: '14:30' },
  { id: 'wo15', number: 'WO-2026-000115', engineerId: 'e5', client: 'ИП Попов',        address: 'ул. Гагарина, 55',     type: 'maintenance',  status: 'assigned',    startHour: 15,   durationH: 1.5, description: 'Промывка дренажа',           priority: 'normal',    phone: '+7 900 005-05-03', slaDeadline: '17:30' },
  // Новиков С.
  { id: 'wo16', number: 'WO-2026-000116', engineerId: 'e6', client: 'ООО Омега',       address: 'ул. Промышленная, 12', type: 'installation', status: 'assigned',    startHour: 9,    durationH: 5,   description: 'Монтаж чиллера 60 кВт',     priority: 'normal',    phone: '+7 900 006-06-01', slaDeadline: '15:00' },
  { id: 'wo17', number: 'WO-2026-000117', engineerId: 'e6', client: 'Ресторан «Сад»',  address: 'ул. Парковая, 3',      type: 'repair',       status: 'assigned',    startHour: 16,   durationH: 2,   description: 'Ремонт системы охлаждения',  priority: 'urgent',    phone: '+7 900 006-06-02', slaDeadline: '19:00' },
  // Захаров Р.
  { id: 'wo18', number: 'WO-2026-000118', engineerId: 'e7', client: 'Поликлиника №2',  address: 'ул. Медицинская, 7',   type: 'maintenance',  status: 'completed',   startHour: 8,    durationH: 2.5, description: 'ТО вентиляции операционной', priority: 'urgent',   phone: '+7 900 007-07-01', slaDeadline: '11:00' },
  { id: 'wo19', number: 'WO-2026-000119', engineerId: 'e7', client: 'ООО Кристалл',    address: 'ул. Алмазная, 4',      type: 'repair',       status: 'in_progress', startHour: 11.5, durationH: 2,   description: 'Ошибка E6 — датчик темп.',  priority: 'normal',    phone: '+7 900 007-07-02', slaDeadline: '14:30' },
  { id: 'wo20', number: 'WO-2026-000120', engineerId: 'e7', client: 'ТЦ Радуга',       address: 'пр. Энтузиастов, 88',  type: 'installation', status: 'assigned',    startHour: 14.5, durationH: 3.5, description: 'Монтаж 6 сплит-систем',      priority: 'normal',    phone: '+7 900 007-07-03', slaDeadline: '19:00' },
  // Лебедева О.
  { id: 'wo21', number: 'WO-2026-000121', engineerId: 'e8', client: 'Кафе «Уют»',      address: 'ул. Тихая, 11',        type: 'repair',       status: 'completed',   startHour: 8,    durationH: 1.5, description: 'Замена фильтров, чистка',    priority: 'normal',    phone: '+7 900 008-08-01', slaDeadline: '10:30' },
  { id: 'wo22', number: 'WO-2026-000122', engineerId: 'e8', client: 'Офис ГК Альянс',  address: 'пр. Центральный, 1',   type: 'maintenance',  status: 'on_site',     startHour: 10.5, durationH: 2,   description: 'ТО 8 кассетных кондиционеров', priority: 'normal', phone: '+7 900 008-08-02', slaDeadline: '13:30' },
  { id: 'wo23', number: 'WO-2026-000123', engineerId: 'e8', client: 'ООО Ритм',        address: 'ул. Музыкальная, 5',   type: 'repair',       status: 'assigned',    startHour: 14,   durationH: 2.5, description: 'Вибрация наружного блока',   priority: 'urgent',    phone: '+7 900 008-08-03', slaDeadline: '17:30' },
  { id: 'wo24', number: 'WO-2026-000124', engineerId: 'e8', client: 'Гостиница «Русь»', address: 'ул. Гостиничная, 2',  type: 'maintenance',  status: 'assigned',    startHour: 17.5, durationH: 2,   description: 'ТО 12 номеров',             priority: 'normal',    phone: '+7 900 008-08-04', slaDeadline: '20:00' },
];

const UNASSIGNED_ORDERS: WorkOrder[] = [
  { id: 'ua1', number: 'WO-2026-000125', engineerId: null, client: 'ООО Меркурий',    address: 'ул. Купеческая, 33',  type: 'repair',       status: 'new', startHour: 0, durationH: 2,   description: 'Не работает обогрев',     priority: 'normal',    phone: '+7 900 100-11-11', slaDeadline: '15:00' },
  { id: 'ua2', number: 'WO-2026-000126', engineerId: null, client: 'Школа №45',       address: 'пр. Школьный, 15',    type: 'emergency',    status: 'new', startHour: 0, durationH: 3,   description: 'Аварийная неисправность', priority: 'emergency', phone: '+7 900 200-22-22', slaDeadline: '12:00' },
  { id: 'ua3', number: 'WO-2026-000127', engineerId: null, client: 'ООО Экспресс',    address: 'ул. Быстрая, 8',      type: 'installation', status: 'new', startHour: 0, durationH: 4,   description: 'Монтаж сплит-системы',    priority: 'normal',    phone: '+7 900 300-33-33', slaDeadline: '18:00' },
  { id: 'ua4', number: 'WO-2026-000128', engineerId: null, client: 'ИП Фролов',       address: 'ул. Фруктовая, 12',   type: 'maintenance',  status: 'new', startHour: 0, durationH: 1.5, description: 'Плановое ТО',             priority: 'normal',    phone: '+7 900 400-44-44', slaDeadline: '17:00' },
];

// ─────────────────────────────────────────────
// Style maps
// ─────────────────────────────────────────────

const TYPE_STYLES: Record<WOType, { bg: string; border: string; text: string; label: string }> = {
  repair:       { bg: 'bg-blue-100',   border: 'border-blue-400',   text: 'text-blue-800',   label: 'Ремонт'    },
  maintenance:  { bg: 'bg-green-100',  border: 'border-green-400',  text: 'text-green-800',  label: 'ТО'        },
  installation: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', label: 'Монтаж'    },
  emergency:    { bg: 'bg-red-100',    border: 'border-red-500',    text: 'text-red-800',    label: 'Аварийный' },
};

const STATUS_LABEL: Record<WOStatus, { cls: string; label: string }> = {
  new:            { cls: 'bg-slate-100 text-slate-700',   label: 'Новый'       },
  assigned:       { cls: 'bg-blue-100 text-blue-700',     label: 'Назначен'    },
  en_route:       { cls: 'bg-yellow-100 text-yellow-700', label: 'В пути'      },
  on_site:        { cls: 'bg-indigo-100 text-indigo-700', label: 'На месте'    },
  in_progress:    { cls: 'bg-cyan-100 text-cyan-700',     label: 'Выполняется' },
  awaiting_parts: { cls: 'bg-orange-100 text-orange-700', label: 'Ожидает ЗИП' },
  completed:      { cls: 'bg-green-100 text-green-700',   label: 'Выполнен'    },
};

const PRIORITY_DOT: Record<Priority, string> = {
  normal:    'bg-gray-400',
  urgent:    'bg-orange-500',
  emergency: 'bg-red-600 animate-pulse',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmtHour(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' });
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function nowDecimal(): number {
  const n = new Date();
  return n.getHours() + n.getMinutes() / 60;
}

/** Convert decimal hour → left % within 07:00–20:00 window */
function toPct(h: number): number {
  return ((h - DAY_START) / TOTAL_H) * 100;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Left column: avatar + name + status dot */
function EngineerCell({ eng }: { eng: Engineer }) {
  return (
    <div
      className="flex items-center gap-2 px-3 border-b border-r border-gray-200 bg-white flex-shrink-0"
      style={{ width: ENG_COL_W, minWidth: ENG_COL_W, height: ROW_H }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold select-none"
          style={{ backgroundColor: eng.avatarColor }}
        >
          {eng.initials}
        </div>
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
            eng.online ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>
      {/* Name + status */}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{eng.name}</p>
        <p className={`text-[10px] leading-tight ${eng.online ? 'text-green-600' : 'text-gray-400'}`}>
          {eng.online ? 'Онлайн' : 'Офлайн'}
        </p>
      </div>
    </div>
  );
}

/** Sticky time-scale header row */
function TimeHeader() {
  const ticks = Array.from({ length: TOTAL_H + 1 }, (_, i) => DAY_START + i);
  return (
    <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10 flex-shrink-0">
      {/* Spacer for engineer column */}
      <div
        className="flex-shrink-0 border-r border-gray-200 flex items-center px-3 gap-1 text-[10px] font-semibold text-gray-500"
        style={{ width: ENG_COL_W, minWidth: ENG_COL_W }}
      >
        <Icon name="Users" size={11} className="text-gray-400" />
        Инженер
      </div>
      {/* Hour ticks */}
      <div className="flex flex-1">
        {ticks.map((h) => (
          <div
            key={h}
            className="flex-1 text-center text-[10px] text-gray-500 py-1.5 border-r border-gray-100 last:border-r-0"
          >
            {String(h).padStart(2, '0')}:00
          </div>
        ))}
      </div>
    </div>
  );
}

/** Gantt bar for one work order */
function GanttBar({
  order,
  selected,
  onClick,
}: {
  order: WorkOrder;
  selected: boolean;
  onClick: () => void;
}) {
  const s = TYPE_STYLES[order.type];
  const leftPct  = toPct(order.startHour);
  const widthPct = (order.durationH / TOTAL_H) * 100;
  const faded    = order.status === 'completed';

  return (
    <div
      className={[
        'absolute top-2 bottom-2 rounded-md border-l-4 cursor-pointer select-none transition-all',
        s.bg, s.border,
        faded ? 'opacity-55' : 'opacity-90',
        selected
          ? 'ring-2 ring-offset-1 ring-blue-500 shadow-lg z-20'
          : 'hover:opacity-100 hover:shadow-md z-10',
      ].join(' ')}
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      onClick={onClick}
      title={`${order.number} — ${order.client}`}
    >
      <div className="px-1.5 py-1 h-full flex flex-col justify-center overflow-hidden">
        <p className={`text-[10px] font-bold leading-tight truncate ${s.text}`}>
          #{order.number.slice(-4)}
        </p>
        <p className="text-[9px] text-gray-600 truncate leading-tight">{order.description}</p>
      </div>
    </div>
  );
}

/** Popup detail card that appears when a bar is clicked */
function DetailPopup({
  order,
  engineer,
  onClose,
  onShift,
}: {
  order: WorkOrder;
  engineer: Engineer | undefined;
  onClose: () => void;
  onShift: (id: string, delta: number) => void;
}) {
  const ts = TYPE_STYLES[order.type];
  const ss = STATUS_LABEL[order.status];

  return (
    <div className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72 top-8 left-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[10px] font-mono text-gray-400">{order.number}</p>
          <p className="text-sm font-semibold text-gray-900 leading-tight">{order.client}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0 mt-0.5">
          <Icon name="X" size={14} />
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-3">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${ts.bg} ${ts.border} ${ts.text}`}>
          {ts.label}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ss.cls}`}>
          {ss.label}
        </span>
        {order.priority !== 'normal' && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            order.priority === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {order.priority === 'emergency' ? 'Аварийный' : 'Срочный'}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3 text-xs text-gray-700">
        <div className="flex gap-1.5 items-start">
          <Icon name="MapPin" size={12} className="mt-0.5 text-gray-400 flex-shrink-0" />
          <span>{order.address}</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <Icon name="Clock" size={12} className="text-gray-400 flex-shrink-0" />
          <span>
            {fmtHour(order.startHour)} — {fmtHour(order.startHour + order.durationH)}
            {' '}({Math.round(order.durationH * 60)} мин)
          </span>
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
          <span className="text-red-600 font-medium">SLA: {order.slaDeadline}</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 mb-3 leading-snug">
        {order.description}
      </p>

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

/** Card in the unassigned right panel */
function UnassignedCard({ order }: { order: WorkOrder }) {
  const ts = TYPE_STYLES[order.type];
  return (
    <div className={`rounded-lg border-l-4 border ${ts.border} ${ts.bg} p-3 mb-2 last:mb-0`}>
      {/* Top row */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-mono text-gray-500 truncate">{order.number}</span>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[order.priority]}`} />
      </div>
      {/* Client */}
      <p className="text-xs font-semibold text-gray-800 leading-tight mb-0.5 truncate">{order.client}</p>
      {/* Type badge + SLA */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${ts.bg} ${ts.text} border ${ts.border}`}>
          {ts.label}
        </span>
        <span className="text-[10px] text-red-600 font-medium">SLA {order.slaDeadline}</span>
      </div>
      {/* Assign button */}
      <Button
        size="sm"
        className="w-full h-6 text-[10px] px-2 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() =>
          toast.info('Назначение наряда', {
            description: `Перетащите ${order.number} на строку инженера`,
          })
        }
      >
        <Icon name="UserPlus" size={10} className="mr-1" />
        Назначить
      </Button>
    </div>
  );
}

/** Small stats tile */
function StatTile({ label, value, colorCls }: { label: string; value: number; colorCls: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 bg-white rounded-lg border border-gray-200 min-w-[72px]">
      <span className={`text-2xl font-bold ${colorCls}`}>{value}</span>
      <span className="text-[10px] text-gray-500 text-center leading-tight whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function DispatchBoardGantt() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode]        = useState<ViewMode>('day');
  const [orders, setOrders]            = useState<WorkOrder[]>(INITIAL_ORDERS);
  const [selectedId, setSelectedId]    = useState<string | null>(null);
  const [filterEng, setFilterEng]      = useState<string>('all');
  const [nowHour, setNowHour]          = useState(nowDecimal());
  const scrollRef                      = useRef<HTMLDivElement>(null);

  // Refresh "now" line every minute
  useEffect(() => {
    const id = setInterval(() => setNowHour(nowDecimal()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Selected order + its engineer
  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;
  const selectedEngineer = selectedOrder
    ? ENGINEERS.find((e) => e.id === selectedOrder.engineerId)
    : undefined;

  // Shift order start time by delta hours
  const handleShift = useCallback((orderId: string, delta: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = Math.max(DAY_START, Math.min(DAY_END - o.durationH, o.startHour + delta));
        toast.success(`Наряд сдвинут на ${delta > 0 ? '+' : ''}${delta * 60} мин`, {
          description: `Новое время начала: ${fmtHour(next)}`,
        });
        return { ...o, startHour: next };
      }),
    );
  }, []);

  // Visible engineers after filter
  const visibleEngineers = filterEng === 'all'
    ? ENGINEERS
    : ENGINEERS.filter((e) => e.id === filterEng);

  // Orders for a specific engineer
  const engOrders = (engId: string) => orders.filter((o) => o.engineerId === engId);

  // ── Statistics ──
  const assigned     = orders.filter((o) => o.engineerId !== null);
  const total        = assigned.length;
  const completed    = assigned.filter((o) => o.status === 'completed').length;
  const inProgress   = assigned.filter((o) => ['en_route', 'on_site', 'in_progress'].includes(o.status)).length;
  const waiting      = assigned.filter((o) => ['new', 'assigned', 'awaiting_parts'].includes(o.status)).length;

  // Load chart data
  const loadData = ENGINEERS.map((eng) => {
    const busyH  = orders.filter((o) => o.engineerId === eng.id).reduce((s, o) => s + o.durationH, 0);
    return { name: eng.name.split(' ')[0], load: Math.min(100, Math.round((busyH / TOTAL_H) * 100)) };
  });

  // Now-line position & visibility
  const nowPct      = toPct(nowHour);
  const showNowLine = nowHour >= DAY_START && nowHour <= DAY_END;

  // Hour divider indices (0 … TOTAL_H-1)
  const gridLines = Array.from({ length: TOTAL_H }, (_, i) => i);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden select-none">

      {/* ═══════════════════════════════════════
          HEADER
      ═══════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-wrap">

        {/* Date navigation */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate((d) => addDays(d, -1))}
          >
            <Icon name="ChevronLeft" size={14} />
          </Button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <Icon name="CalendarDays" size={13} className="text-blue-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-blue-900 whitespace-nowrap">
              {fmtDate(currentDate)}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate((d) => addDays(d, 1))}
          >
            <Icon name="ChevronRight" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs px-2"
            onClick={() => setCurrentDate(new Date())}
          >
            Сегодня
          </Button>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['day', 'week'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                setViewMode(mode);
                if (mode === 'week') {
                  toast.info('Режим недели', { description: 'Отображается дневной вид' });
                }
              }}
            >
              {mode === 'day' ? 'День' : 'Неделя'}
            </button>
          ))}
        </div>

        {/* Engineer filter */}
        <select
          value={filterEng}
          onChange={(e) => setFilterEng(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="all">Все инженеры</option>
          {ENGINEERS.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        {/* Create order */}
        <div className="ml-auto">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"
            onClick={() =>
              toast.success('Новый наряд', { description: 'Открыта форма создания наряда' })
            }
          >
            <Icon name="Plus" size={13} />
            Создать наряд
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MAIN AREA  (Gantt + Unassigned panel)
      ═══════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── GANTT ─────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Time-scale header */}
          <TimeHeader />

          {/* Scrollable rows */}
          <div className="flex-1 overflow-y-auto overflow-x-auto" ref={scrollRef}>
            <div className="flex flex-col" style={{ minWidth: 800 }}>
              {visibleEngineers.map((eng) => {
                const rows = engOrders(eng.id);
                return (
                  <div
                    key={eng.id}
                    className="flex border-b border-gray-100 last:border-b-0"
                    style={{ height: ROW_H }}
                  >
                    {/* Engineer cell */}
                    <EngineerCell eng={eng} />

                    {/* Gantt track */}
                    <div
                      className="flex-1 relative bg-white hover:bg-gray-50/40 transition-colors"
                      onClick={() => setSelectedId(null)}
                    >
                      {/* Vertical hour grid lines */}
                      {gridLines.map((i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-r border-gray-100 pointer-events-none"
                          style={{ left: `${(i / TOTAL_H) * 100}%` }}
                        />
                      ))}

                      {/* "Now" vertical red line */}
                      {showNowLine && (
                        <div
                          className="absolute top-0 bottom-0 border-l-2 border-red-500 z-30 pointer-events-none"
                          style={{ left: `${nowPct}%` }}
                        >
                          <div className="absolute -top-0 -left-[5px] w-2.5 h-2.5 bg-red-500 rounded-full" />
                        </div>
                      )}

                      {/* Work order bars */}
                      {rows.map((order) => (
                        <div key={order.id} className="absolute inset-0 pointer-events-none">
                          <div className="pointer-events-auto absolute inset-0">
                            <GanttBar
                              order={order}
                              selected={order.id === selectedId}
                              onClick={() =>
                                setSelectedId((prev) => (prev === order.id ? null : order.id))
                              }
                            />
                          </div>

                          {/* Detail popup */}
                          {selectedId === order.id && selectedOrder && (
                            <div className="pointer-events-auto">
                              <DetailPopup
                                order={selectedOrder}
                                engineer={selectedEngineer}
                                onClose={() => setSelectedId(null)}
                                onShift={handleShift}
                              />
                            </div>
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

        {/* ── UNASSIGNED PANEL ─────────────────── */}
        <div
          className="flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden"
          style={{ width: UNASSIGNED_W }}
        >
          {/* Panel header */}
          <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Icon name="ClipboardList" size={13} className="text-orange-500" />
            <span className="text-xs font-semibold text-gray-700">Не назначено</span>
            <Badge className="ml-auto bg-orange-100 text-orange-700 border border-orange-200 text-[10px] px-1.5 py-0 h-4">
              {UNASSIGNED_ORDERS.length}
            </Badge>
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto p-3">
            {UNASSIGNED_ORDERS.map((order) => (
              <UnassignedCard key={order.id} order={order} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-gray-50">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Типы нарядов
            </p>
            <div className="space-y-1">
              {(Object.entries(TYPE_STYLES) as [WOType, typeof TYPE_STYLES[WOType]][]).map(([key, s]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm border-l-2 ${s.bg} ${s.border}`} />
                  <span className="text-[10px] text-gray-600">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BOTTOM PANEL
      ═══════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-4 items-stretch flex-wrap">

        {/* Stat counters */}
        <div className="flex gap-2 flex-wrap items-center">
          <StatTile label="Всего"     value={total}      colorCls="text-gray-800"  />
          <StatTile label="Выполнено" value={completed}  colorCls="text-green-600" />
          <StatTile label="В работе"  value={inProgress} colorCls="text-blue-600"  />
          <StatTile label="Ожидают"   value={waiting}    colorCls="text-orange-500"/>
        </div>

        {/* Horizontal load bar chart */}
        <div className="flex-1 min-w-[300px]">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
            % загрузки инженеров
          </p>
          <ResponsiveContainer width="100%" height={68}>
            <BarChart data={loadData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={52}
                tick={{ fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Загрузка']}
                contentStyle={{ fontSize: 11, borderRadius: 6 }}
              />
              <Bar
                dataKey="load"
                fill="#3b82f6"
                radius={[0, 3, 3, 0]}
                maxBarSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
