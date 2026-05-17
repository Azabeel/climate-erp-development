import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

type MaintenanceType = 'Квартальное' | 'Полугодовое' | 'Годовое';
type MaintenanceStatus = 'Запланировано' | 'В работе' | 'Выполнено' | 'Просрочено';
type ViewMode = 'list' | 'calendar' | 'gantt';
type Periodicity = 'Еженедельно' | 'Ежемесячно' | 'Квартально' | 'Полугодово' | 'Ежегодно';

interface MaintenanceRecord {
  id: string;
  client: string;
  address: string;
  equipment: string;
  type: MaintenanceType;
  plannedDate: string; // ISO date
  engineer: string;
  status: MaintenanceStatus;
  orderId: string | null;
}

interface EngineerRow {
  name: string;
  tasks: { startDay: number; endDay: number; type: MaintenanceType; label: string; conflict: boolean }[];
}

interface EquipmentSettings {
  periodicity: Periodicity;
  preferredEngineer: string;
  durationHours: string;
  notifyClientBefore: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const TYPE_COLOR: Record<MaintenanceType, string> = {
  'Квартальное': 'bg-sky-500',
  'Полугодовое': 'bg-indigo-500',
  'Годовое':     'bg-violet-600',
};

const TYPE_TEXT_COLOR: Record<MaintenanceType, string> = {
  'Квартальное': 'text-sky-700 bg-sky-100',
  'Полугодовое': 'text-indigo-700 bg-indigo-100',
  'Годовое':     'text-violet-700 bg-violet-100',
};

const STATUS_CONFIG: Record<
  MaintenanceStatus,
  { variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: string; rowClass: string }
> = {
  'Запланировано': { variant: 'secondary',   icon: 'Clock',          rowClass: '' },
  'В работе':      { variant: 'outline',      icon: 'Loader2',        rowClass: 'bg-blue-50/50' },
  'Выполнено':     { variant: 'default',      icon: 'CheckCircle2',   rowClass: 'bg-green-50/40' },
  'Просрочено':    { variant: 'destructive',  icon: 'AlertTriangle',  rowClass: 'bg-red-50' },
};

const ENGINEERS = [
  'Петров С.И.',
  'Сидоров В.Н.',
  'Козлов А.В.',
  'Иванов Д.О.',
  'Морозов Е.Р.',
  'Новиков Т.Л.',
  'Соколов В.В.',
  'Федоров А.С.',
];

// ─── Mock data ─────────────────────────────────────────────────────────────────

const RECORDS: MaintenanceRecord[] = [
  {
    id: 'PPR-001', client: 'ТЦ Мираж', address: 'ул. Ленина, 42',
    equipment: 'Daikin VRV-IV (наружный блок)', type: 'Квартальное',
    plannedDate: '2026-05-20', engineer: 'Козлов А.В.', status: 'Запланировано', orderId: null,
  },
  {
    id: 'PPR-002', client: 'Офис Альфа', address: 'пр. Мира, 15',
    equipment: 'Mitsubishi Heavy SRK (split 24)', type: 'Полугодовое',
    plannedDate: '2026-05-12', engineer: 'Петров С.И.', status: 'Выполнено', orderId: 'WO-2026-001234',
  },
  {
    id: 'PPR-003', client: 'ТРЦ Галерея', address: 'Садовая ул., 89',
    equipment: 'Carrier 38QHC (чиллер)', type: 'Годовое',
    plannedDate: '2026-05-08', engineer: 'Сидоров В.Н.', status: 'Просрочено', orderId: null,
  },
  {
    id: 'PPR-004', client: 'Склад Логистик', address: 'Промышленная ул., 3',
    equipment: 'Gree GMV6 (мультизональная)', type: 'Квартальное',
    plannedDate: '2026-05-25', engineer: 'Козлов А.В.', status: 'В работе', orderId: 'WO-2026-001367',
  },
  {
    id: 'PPR-005', client: 'ЖК Радуга', address: 'Новая ул., 7',
    equipment: 'Toshiba Super Digital (VRF)', type: 'Полугодовое',
    plannedDate: '2026-05-22', engineer: 'Петров С.И.', status: 'Запланировано', orderId: null,
  },
  {
    id: 'PPR-006', client: 'БЦ Горизонт', address: 'пл. Победы, 1',
    equipment: 'Haier AD482MHERA (кассетный)', type: 'Квартальное',
    plannedDate: '2026-05-04', engineer: 'Сидоров В.Н.', status: 'Просрочено', orderId: null,
  },
  {
    id: 'PPR-007', client: 'КП Сосны', address: 'Лесная ул., 12',
    equipment: 'Daikin Altherma (тепловой насос)', type: 'Годовое',
    plannedDate: '2026-05-28', engineer: 'Иванов Д.О.', status: 'Запланировано', orderId: null,
  },
  {
    id: 'PPR-008', client: 'Ресторан Парус', address: 'набережная, 5',
    equipment: 'Fujitsu AOYG (мульти-сплит)', type: 'Квартальное',
    plannedDate: '2026-05-18', engineer: 'Морозов Е.Р.', status: 'Выполнено', orderId: 'WO-2026-000987',
  },
  {
    id: 'PPR-009', client: 'Поликлиника №7', address: 'Здоровья ул., 3',
    equipment: 'Mitsubishi Electric MXZ (VRF)', type: 'Годовое',
    plannedDate: '2026-05-02', engineer: 'Козлов А.В.', status: 'Просрочено', orderId: null,
  },
  {
    id: 'PPR-010', client: 'Гипермаркет Лента', address: 'Торговая ул., 19',
    equipment: 'LG Multi V (центральная система)', type: 'Полугодовое',
    plannedDate: '2026-05-29', engineer: 'Новиков Т.Л.', status: 'Запланировано', orderId: null,
  },
  {
    id: 'PPR-011', client: 'Школа №42', address: 'Просвещения ул., 8',
    equipment: 'Panasonic KIT-UZ (канальный)', type: 'Квартальное',
    plannedDate: '2026-05-27', engineer: 'Соколов В.В.', status: 'Запланировано', orderId: null,
  },
  {
    id: 'PPR-012', client: 'Гостиница Европа', address: 'Центральная пл., 2',
    equipment: 'Samsung DVM S (VRF)', type: 'Годовое',
    plannedDate: '2026-05-14', engineer: 'Федоров А.С.', status: 'Выполнено', orderId: 'WO-2026-001100',
  },
  {
    id: 'PPR-013', client: 'Завод Технопром', address: 'Заводская ул., 45',
    equipment: 'Daikin SkyAir (потолочный)', type: 'Квартальное',
    plannedDate: '2026-05-16', engineer: 'Иванов Д.О.', status: 'В работе', orderId: 'WO-2026-001401',
  },
  {
    id: 'PPR-014', client: 'Банк Восток', address: 'Финансовый пр., 11',
    equipment: 'Mitsubishi Heavy FDT (кассетный)', type: 'Полугодовое',
    plannedDate: '2026-05-23', engineer: 'Петров С.И.', status: 'Запланировано', orderId: null,
  },
  {
    id: 'PPR-015', client: 'Фитнес-клуб Атлант', address: 'Спортивная ул., 6',
    equipment: 'Hisense HMT3-U48HFP (VRF)', type: 'Квартальное',
    plannedDate: '2026-05-30', engineer: 'Морозов Е.Р.', status: 'Запланировано', orderId: null,
  },
];

// Calendar: which days have TOs (May 2026)
const CALENDAR_YEAR = 2026;
const CALENDAR_MONTH = 4; // May

// Weekly load chart data (current month)
const WEEKLY_CHART_DATA = [
  { week: 'Нед. 1 (1–7)',   count: 7 },
  { week: 'Нед. 2 (8–14)',  count: 9 },
  { week: 'Нед. 3 (15–21)', count: 11 },
  { week: 'Нед. 4 (22–31)', count: 7 },
];

// Gantt: 8 engineers × 30 days of May 2026
const GANTT_ROWS: EngineerRow[] = [
  {
    name: 'Петров С.И.',
    tasks: [
      { startDay: 1,  endDay: 3,  type: 'Квартальное', label: 'Офис Альфа',      conflict: false },
      { startDay: 12, endDay: 13, type: 'Полугодовое', label: 'Банк Восток',      conflict: false },
      { startDay: 22, endDay: 24, type: 'Квартальное', label: 'ЖК Радуга',        conflict: false },
    ],
  },
  {
    name: 'Сидоров В.Н.',
    tasks: [
      { startDay: 4,  endDay: 5,  type: 'Квартальное', label: 'БЦ Горизонт',     conflict: false },
      { startDay: 8,  endDay: 10, type: 'Годовое',     label: 'ТРЦ Галерея',     conflict: false },
      { startDay: 20, endDay: 22, type: 'Квартальное', label: 'Школа №42',        conflict: false },
    ],
  },
  {
    name: 'Козлов А.В.',
    tasks: [
      { startDay: 2,  endDay: 5,  type: 'Годовое',     label: 'Поликлиника №7',  conflict: false },
      { startDay: 5,  endDay: 7,  type: 'Квартальное', label: 'ТЦ Мираж',        conflict: true  }, // overlap
      { startDay: 25, endDay: 27, type: 'Квартальное', label: 'Склад Логистик',  conflict: false },
    ],
  },
  {
    name: 'Иванов Д.О.',
    tasks: [
      { startDay: 7,  endDay: 9,  type: 'Годовое',     label: 'КП Сосны',        conflict: false },
      { startDay: 15, endDay: 17, type: 'Квартальное', label: 'Завод Технопром', conflict: false },
      { startDay: 28, endDay: 29, type: 'Полугодовое', label: 'Гостиница Европа', conflict: false },
    ],
  },
  {
    name: 'Морозов Е.Р.',
    tasks: [
      { startDay: 3,  endDay: 4,  type: 'Квартальное', label: 'Ресторан Парус',  conflict: false },
      { startDay: 18, endDay: 20, type: 'Квартальное', label: 'Фитнес-клуб',     conflict: false },
      { startDay: 18, endDay: 19, type: 'Полугодовое', label: 'ТРЦ Голубой',     conflict: true  }, // overlap
    ],
  },
  {
    name: 'Новиков Т.Л.',
    tasks: [
      { startDay: 10, endDay: 12, type: 'Полугодовое', label: 'Гипермаркет Лента', conflict: false },
      { startDay: 24, endDay: 26, type: 'Квартальное', label: 'Школа №8',         conflict: false },
    ],
  },
  {
    name: 'Соколов В.В.',
    tasks: [
      { startDay: 6,  endDay: 8,  type: 'Квартальное', label: 'Завод Север',     conflict: false },
      { startDay: 27, endDay: 28, type: 'Квартальное', label: 'Школа №42',       conflict: false },
    ],
  },
  {
    name: 'Федоров А.С.',
    tasks: [
      { startDay: 13, endDay: 15, type: 'Годовое',     label: 'Гостиница Европа', conflict: false },
      { startDay: 22, endDay: 24, type: 'Квартальное', label: 'БЦ Меркурий',     conflict: false },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - startOffset + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }
  return cells;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: string;
  value: string | number;
  label: string;
  sub?: string;
  colorClass: string;
  iconBg: string;
}

function MetricCard({ icon, value, label, sub, colorClass, iconBg }: MetricCardProps) {
  return (
    <div className={`rounded-xl p-4 flex items-center gap-4 ${colorClass}`}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon name={icon} size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none mb-0.5">{value}</div>
        <div className="text-xs font-medium opacity-80">{label}</div>
        {sub && <div className="text-[11px] opacity-60 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MaintenancePlannerFull() {
  const [view, setView] = useState<ViewMode>('list');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Equipment settings panel state
  const [settings, setSettings] = useState<EquipmentSettings>({
    periodicity: 'Квартально',
    preferredEngineer: ENGINEERS[0],
    durationHours: '4',
    notifyClientBefore: true,
  });

  // ── Derived ──────────────────────────────────────────────────────────────

  const calGrid = buildCalendarGrid(CALENDAR_YEAR, CALENDAR_MONTH);

  const itemsByDay: Record<number, MaintenanceRecord[]> = {};
  RECORDS.forEach((rec) => {
    const d = new Date(rec.plannedDate);
    if (d.getFullYear() === CALENDAR_YEAR && d.getMonth() === CALENDAR_MONTH) {
      const day = d.getDate();
      if (!itemsByDay[day]) itemsByDay[day] = [];
      itemsByDay[day].push(rec);
    }
  });

  const selectedDayItems = selectedDay ? (itemsByDay[selectedDay] ?? []) : [];
  const selectedRecord = RECORDS.find((r) => r.id === selectedRecordId) ?? null;

  const overdueCount = RECORDS.filter((r) => r.status === 'Просрочено').length;
  const doneCount = RECORDS.filter((r) => r.status === 'Выполнено').length;
  const totalMonth = 34;
  const doneMonth = 21;
  const pct = Math.round((doneMonth / totalMonth) * 100);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleCreateOrder(rec: MaintenanceRecord) {
    toast.success('Наряд создан', {
      description: `${rec.type} ТО — ${rec.equipment} (${rec.client}) → ${rec.engineer}`,
    });
  }

  function handlePostpone(rec: MaintenanceRecord) {
    toast.info('Перенос запланирован', {
      description: `ТО по объекту «${rec.client}» перенесено на следующую доступную дату`,
    });
  }

  function handleGenerate() {
    toast.success('План сгенерирован', {
      description: 'ТО автоматически распределены по инженерам на основе загрузки и компетенций',
    });
  }

  function handleExport() {
    toast.success('Расписание экспортировано', {
      description: 'Файл Excel с расписанием ТО на май 2026 отправлен на почту',
    });
  }

  function handleSaveSettings() {
    toast.success('Настройки сохранены', {
      description: `Периодичность: ${settings.periodicity}, инженер: ${settings.preferredEngineer}`,
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-0">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-3">
          <Icon name="CalendarClock" size={22} className="text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Планировщик ТО</h1>
            <p className="text-xs text-gray-500">
              Плановое техническое обслуживание климатического оборудования
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
            {(
              [
                { key: 'list',     label: 'Список',    icon: 'List' },
                { key: 'calendar', label: 'Календарь', icon: 'CalendarDays' },
                { key: 'gantt',    label: 'Ганта',     icon: 'GanttChart' },
              ] as { key: ViewMode; label: string; icon: string }[]
            ).map(({ key, label, icon }, i) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  i > 0 ? 'border-l border-gray-200' : ''
                } ${
                  view === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon name={icon} size={13} />
                {label}
              </button>
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={handleExport}>
            <Icon name="Download" size={14} className="mr-1.5" />
            Экспорт расписания
          </Button>

          <Button size="sm" onClick={handleGenerate}>
            <Icon name="Zap" size={14} className="mr-1.5" />
            Сгенерировать план
          </Button>
        </div>
      </div>

      {/* ── Metrics row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 flex-shrink-0">
        <MetricCard
          icon="CalendarClock"
          value={totalMonth}
          label="Плановых ТО на месяц"
          sub="Май 2026"
          colorClass="bg-blue-50 text-blue-800"
          iconBg="bg-blue-600"
        />
        <MetricCard
          icon="CheckCircle2"
          value={`${doneMonth} (${pct}%)`}
          label="Выполнено"
          sub={`Осталось: ${totalMonth - doneMonth}`}
          colorClass="bg-emerald-50 text-emerald-800"
          iconBg="bg-emerald-600"
        />
        <MetricCard
          icon="AlertTriangle"
          value={overdueCount}
          label="Просроченных"
          sub="Требуют внимания"
          colorClass="bg-red-50 text-red-800"
          iconBg="bg-red-500"
        />
        <MetricCard
          icon="Clock"
          value="сегодня 10:00"
          label="Следующее ТО"
          sub="ТЦ Мираж — Козлов А.В."
          colorClass="bg-amber-50 text-amber-800"
          iconBg="bg-amber-500"
        />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Main area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* ── LIST VIEW ──────────────────────────────────────────────────── */}
          {view === 'list' && (
            <div className="space-y-4">
              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Плановые ТО — Май 2026
                  </span>
                  <span className="text-xs text-gray-400">{RECORDS.length} записей</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {[
                          'Объект / Адрес',
                          'Оборудование',
                          'Тип ТО',
                          'Плановая дата',
                          'Инженер',
                          'Статус',
                          'Наряд',
                          '',
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {RECORDS.map((rec) => {
                        const st = STATUS_CONFIG[rec.status];
                        const isOverdue = rec.status === 'Просрочено';
                        return (
                          <tr
                            key={rec.id}
                            onClick={() => setSelectedRecordId(rec.id === selectedRecordId ? null : rec.id)}
                            className={`transition-colors cursor-pointer hover:brightness-95 ${st.rowClass} ${
                              selectedRecordId === rec.id ? 'ring-1 ring-inset ring-blue-400' : ''
                            }`}
                          >
                            {/* Object */}
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800 text-xs">{rec.client}</div>
                              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Icon name="MapPin" size={10} />
                                {rec.address}
                              </div>
                              <div className="text-[10px] text-gray-300 mt-0.5">{rec.id}</div>
                            </td>

                            {/* Equipment */}
                            <td className="px-4 py-3">
                              <div
                                className="text-xs text-gray-700 max-w-[180px] truncate"
                                title={rec.equipment}
                              >
                                {rec.equipment}
                              </div>
                            </td>

                            {/* Type */}
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_TEXT_COLOR[rec.type]}`}
                              >
                                {rec.type}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                              {formatDate(rec.plannedDate)}
                              {isOverdue && (
                                <div className="text-red-500 text-[11px] flex items-center gap-0.5 mt-0.5">
                                  <Icon name="AlertTriangle" size={10} />
                                  Просрочено
                                </div>
                              )}
                            </td>

                            {/* Engineer */}
                            <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                              {rec.engineer}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <Badge variant={st.variant} className="text-xs gap-1 whitespace-nowrap">
                                <Icon name={st.icon} size={11} />
                                {rec.status}
                              </Badge>
                            </td>

                            {/* Order */}
                            <td className="px-4 py-3 text-xs">
                              {rec.orderId ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info('Открытие наряда', { description: rec.orderId ?? '' });
                                  }}
                                  className="text-blue-600 hover:underline font-mono"
                                >
                                  {rec.orderId}
                                </button>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {rec.status === 'Выполнено' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast.info('Просмотр наряда', { description: rec.equipment });
                                    }}
                                  >
                                    <Icon name="Eye" size={12} className="mr-1" />
                                    Просмотр
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreateOrder(rec);
                                      }}
                                    >
                                      <Icon name="Plus" size={12} className="mr-1" />
                                      Создать наряд
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePostpone(rec);
                                      }}
                                    >
                                      <Icon name="CalendarPlus" size={12} className="mr-1" />
                                      Перенести
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Weekly load chart */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Icon name="BarChart2" size={16} className="text-blue-500" />
                  Нагрузка ТО по неделям
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={WEEKLY_CHART_DATA}
                    margin={{ top: 4, right: 16, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(value: number) => [value, 'ТО']}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="ТО" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── CALENDAR VIEW ──────────────────────────────────────────────── */}
          {view === 'calendar' && (
            <div className="flex gap-4">
              {/* Calendar grid */}
              <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
                {/* Month header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                  <Button variant="outline" size="sm" disabled>
                    <Icon name="ChevronLeft" size={14} />
                  </Button>
                  <span className="font-semibold text-gray-800 text-sm">
                    {MONTH_NAMES[CALENDAR_MONTH]} {CALENDAR_YEAR}
                  </span>
                  <Button variant="outline" size="sm" disabled>
                    <Icon name="ChevronRight" size={14} />
                  </Button>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {DAY_NAMES.map((d) => (
                    <div
                      key={d}
                      className="py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wide"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {calGrid.map((day, idx) => {
                    const isToday = day === 17; // 2026-05-17
                    const dayRecs = day !== null ? (itemsByDay[day] ?? []) : [];
                    const isSelected = day !== null && day === selectedDay;
                    const hasOverdue = dayRecs.some((r) => r.status === 'Просрочено');

                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          day !== null && setSelectedDay(day === selectedDay ? null : day)
                        }
                        className={`min-h-[90px] border-b border-r border-gray-100 p-1.5 transition-colors
                          ${day === null ? 'bg-gray-50 cursor-default' : 'cursor-pointer hover:bg-blue-50/40'}
                          ${isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-400' : ''}
                          ${idx % 7 === 6 ? 'border-r-0' : ''}
                        `}
                      >
                        {day !== null && (
                          <>
                            <div className="flex items-start justify-between mb-1">
                              <div
                                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                                  ${isToday ? 'bg-blue-600 text-white' : 'text-gray-600'}
                                `}
                              >
                                {day}
                              </div>
                              {dayRecs.length > 0 && (
                                <Badge
                                  variant={hasOverdue ? 'destructive' : 'secondary'}
                                  className="text-[10px] h-4 px-1"
                                >
                                  {dayRecs.length}
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-0.5">
                              {dayRecs.slice(0, 3).map((rec) => (
                                <div
                                  key={rec.id}
                                  title={`${rec.equipment} — ${rec.engineer}`}
                                  className={`text-white text-[9px] leading-tight px-1 py-0.5 rounded truncate ${
                                    TYPE_COLOR[rec.type]
                                  } ${rec.status === 'Просрочено' ? 'opacity-70 ring-1 ring-red-400' : ''}`}
                                >
                                  {rec.client}
                                </div>
                              ))}
                              {dayRecs.length > 3 && (
                                <div className="text-[9px] text-gray-400 pl-1">
                                  +{dayRecs.length - 3} ещё
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-5 flex-wrap">
                  {(Object.entries(TYPE_COLOR) as [MaintenanceType, string][]).map(([type, color]) => (
                    <span key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className={`w-3 h-3 rounded ${color}`} />
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day detail panel */}
              <div className="w-72 flex-shrink-0">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-0">
                  {selectedDay ? (
                    <>
                      <h3 className="font-semibold text-gray-800 text-sm mb-3">
                        {selectedDay} {MONTH_NAMES[CALENDAR_MONTH]} {CALENDAR_YEAR}
                      </h3>
                      {selectedDayItems.length === 0 ? (
                        <div className="text-center py-6">
                          <Icon
                            name="CalendarOff"
                            size={28}
                            className="mx-auto text-gray-300 mb-2"
                          />
                          <p className="text-xs text-gray-400">Нет ТО в этот день</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedDayItems.map((rec) => {
                            const st = STATUS_CONFIG[rec.status];
                            return (
                              <div
                                key={rec.id}
                                className={`border rounded-lg p-3 ${
                                  rec.status === 'Просрочено'
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-gray-100'
                                }`}
                              >
                                <div className="text-xs font-semibold text-gray-800 mb-0.5">
                                  {rec.client}
                                </div>
                                <div
                                  className="text-[11px] text-gray-500 mb-2 truncate"
                                  title={rec.equipment}
                                >
                                  {rec.equipment}
                                </div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge variant={st.variant} className="text-[10px] gap-1">
                                    <Icon name={st.icon} size={9} />
                                    {rec.status}
                                  </Badge>
                                  <span
                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${TYPE_TEXT_COLOR[rec.type]}`}
                                  >
                                    {rec.type}
                                  </span>
                                </div>
                                <div className="text-[11px] text-gray-500 mb-2 flex items-center gap-1">
                                  <Icon name="User" size={10} />
                                  {rec.engineer}
                                </div>
                                {rec.status !== 'Выполнено' && (
                                  <div className="flex gap-1.5">
                                    <Button
                                      size="sm"
                                      className="flex-1 h-7 text-xs"
                                      onClick={() => handleCreateOrder(rec)}
                                    >
                                      Создать наряд
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs px-2"
                                      onClick={() => handlePostpone(rec)}
                                    >
                                      <Icon name="CalendarPlus" size={12} />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <Icon name="CalendarDays" size={36} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-xs text-gray-400">
                        Кликните на день <br />для просмотра ТО
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── GANTT VIEW ─────────────────────────────────────────────────── */}
          {view === 'gantt' && (
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Legend */}
                <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-5 flex-wrap">
                  <span className="text-xs font-semibold text-gray-600">Тип ТО:</span>
                  {(Object.entries(TYPE_COLOR) as [MaintenanceType, string][]).map(([type, color]) => (
                    <span key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className={`w-3 h-3 rounded ${color}`} />
                      {type}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded bg-red-500" />
                    Конфликт
                  </span>
                  <span className="ml-auto text-xs text-gray-400 italic">
                    Май {CALENDAR_YEAR} · 30 дней
                  </span>
                </div>

                {/* Gantt header: day numbers */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  {/* Engineer label col */}
                  <div className="w-36 flex-shrink-0 px-3 py-2 text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Инженер
                  </div>
                  {/* Day columns */}
                  <div className="flex-1 overflow-hidden relative">
                    <div className="flex">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                        <div
                          key={day}
                          className={`flex-1 text-center py-2 text-[9px] font-medium border-r border-gray-100 last:border-r-0 ${
                            day === 17 ? 'bg-blue-100 text-blue-700' : 'text-gray-400'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Engineer rows */}
                {GANTT_ROWS.map((row, rowIdx) => (
                  <div
                    key={row.name}
                    className={`flex items-center border-b border-gray-100 last:border-b-0 ${
                      rowIdx % 2 === 1 ? 'bg-gray-50/40' : ''
                    }`}
                  >
                    {/* Name */}
                    <div className="w-36 flex-shrink-0 px-3 py-3 text-xs font-medium text-gray-700 border-r border-gray-200 truncate">
                      {row.name}
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 relative h-12">
                      {/* Day grid lines */}
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                          <div
                            key={day}
                            className={`flex-1 border-r border-gray-100 last:border-r-0 ${
                              day === 17 ? 'bg-blue-50/30' : ''
                            }`}
                          />
                        ))}
                      </div>

                      {/* Task bars */}
                      {row.tasks.map((task, tIdx) => {
                        const left = ((task.startDay - 1) / 30) * 100;
                        const width = ((task.endDay - task.startDay + 1) / 30) * 100;
                        return (
                          <div
                            key={tIdx}
                            title={`${task.label} — ${task.type}${task.conflict ? ' ⚠ Конфликт' : ''}`}
                            onClick={() =>
                              toast[task.conflict ? 'warning' : 'info'](task.label, {
                                description: task.conflict
                                  ? `Конфликт расписания: ${task.type}`
                                  : task.type,
                              })
                            }
                            className={`absolute top-2 bottom-2 rounded flex items-center px-1.5 cursor-pointer transition-opacity hover:opacity-80 ${
                              task.conflict ? 'bg-red-500' : TYPE_COLOR[task.type]
                            }`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                          >
                            <span className="text-white text-[9px] font-medium truncate leading-tight">
                              {task.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly load chart under Gantt */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Icon name="BarChart2" size={16} className="text-blue-500" />
                  Нагрузка ТО по неделям
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={WEEKLY_CHART_DATA}
                    margin={{ top: 4, right: 16, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(value: number) => [value, 'ТО']}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="ТО" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ────────────────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4 space-y-5">

          {/* Settings for selected equipment */}
          {selectedRecord ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Настройки ТО
                </h3>
                <button
                  onClick={() => setSelectedRecordId(null)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                <div className="text-xs font-semibold text-blue-800 mb-0.5 truncate">
                  {selectedRecord.client}
                </div>
                <div className="text-[11px] text-blue-600 truncate">{selectedRecord.equipment}</div>
                <div className="text-[10px] text-blue-400 mt-1">{selectedRecord.id}</div>
              </div>

              <div className="space-y-3">
                {/* Periodicity */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Периодичность
                  </label>
                  <select
                    value={settings.periodicity}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        periodicity: e.target.value as Periodicity,
                      }))
                    }
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Еженедельно">Еженедельно</option>
                    <option value="Ежемесячно">Ежемесячно</option>
                    <option value="Квартально">Квартально</option>
                    <option value="Полугодово">Полугодово</option>
                    <option value="Ежегодно">Ежегодно</option>
                  </select>
                </div>

                {/* Preferred engineer */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Предпочтительный инженер
                  </label>
                  <select
                    value={settings.preferredEngineer}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, preferredEngineer: e.target.value }))
                    }
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {ENGINEERS.map((eng) => (
                      <option key={eng} value={eng}>
                        {eng}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Время выполнения (ч)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={settings.durationHours}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, durationHours: e.target.value }))
                    }
                    className="h-8 text-xs"
                    placeholder="Часов"
                  />
                </div>

                {/* Notify toggle */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-600">Уведомить клиента за 3 дня</span>
                  <button
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        notifyClientBefore: !prev.notifyClientBefore,
                      }))
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.notifyClientBefore ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        settings.notifyClientBefore ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <Button className="w-full" size="sm" onClick={handleSaveSettings}>
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить настройки
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Default right panel: summary stats */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Статистика
                </h3>
                <div className="space-y-2">
                  <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="TrendingUp" size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-700">{pct}%</div>
                      <div className="text-xs text-blue-600">Выполнение плана</div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="CheckCircle2" size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-700">{doneCount}</div>
                      <div className="text-xs text-emerald-600">Выполнено всего</div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <Icon name="AlertTriangle" size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-red-600">{overdueCount}</div>
                      <div className="text-xs text-red-500">Просрочено</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type breakdown */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  По типу ТО
                </h3>
                {(['Квартальное', 'Полугодовое', 'Годовое'] as MaintenanceType[]).map((type) => {
                  const count = RECORDS.filter((r) => r.type === type).length;
                  const pct2 = Math.round((count / RECORDS.length) * 100);
                  return (
                    <div key={type} className="mb-2.5">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{type}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${TYPE_COLOR[type]}`}
                          style={{ width: `${pct2}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <Button className="w-full" size="sm" onClick={handleGenerate}>
                  <Icon name="Zap" size={14} className="mr-1.5" />
                  Сгенерировать план
                </Button>
                <Button variant="outline" className="w-full" size="sm" onClick={handleExport}>
                  <Icon name="Download" size={14} className="mr-1.5" />
                  Экспорт расписания
                </Button>
              </div>

              <div className="pt-1 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 text-center">
                  Кликните на строку таблицы <br />для настроек периодичности
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
