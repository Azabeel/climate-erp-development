import { useState } from 'react';
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
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type MaintenanceType = 'Ежеквартальное' | 'Полугодовое' | 'Годовое';
type MaintenanceStatus = 'Запланировано' | 'Просрочено' | 'Выполнено';
type ViewMode = 'list' | 'calendar' | 'gantt';

interface MaintenanceItem {
  id: string;
  object: string;         // название объекта
  equipment: string;      // оборудование
  type: MaintenanceType;
  nextDate: string;       // ISO date
  engineer: string;
  status: MaintenanceStatus;
  periodicity: string;    // напр. "Раз в 3 мес."
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ENGINEERS = ['Петров С.И.', 'Сидоров В.Н.', 'Козлов А.В.'];

const ITEMS: MaintenanceItem[] = [
  {
    id: 'PPR-001',
    object: 'ТЦ Мираж',
    equipment: 'Daikin VRV-IV (наружный блок)',
    type: 'Ежеквартальное',
    nextDate: '2026-05-20',
    engineer: 'Козлов А.В.',
    status: 'Запланировано',
    periodicity: 'Раз в 3 мес.',
  },
  {
    id: 'PPR-002',
    object: 'Офис Альфа',
    equipment: 'Mitsubishi Heavy SRK (split 24)',
    type: 'Полугодовое',
    nextDate: '2026-05-12',
    engineer: 'Петров С.И.',
    status: 'Выполнено',
    periodicity: 'Раз в 6 мес.',
  },
  {
    id: 'PPR-003',
    object: 'ТРЦ Галерея',
    equipment: 'Carrier 38QHC (чиллер)',
    type: 'Годовое',
    nextDate: '2026-05-08',
    engineer: 'Сидоров В.Н.',
    status: 'Просрочено',
    periodicity: 'Раз в год',
  },
  {
    id: 'PPR-004',
    object: 'Склад Логистик',
    equipment: 'Gree GMV6 (мультизональная)',
    type: 'Ежеквартальное',
    nextDate: '2026-06-15',
    engineer: 'Козлов А.В.',
    status: 'Запланировано',
    periodicity: 'Раз в 3 мес.',
  },
  {
    id: 'PPR-005',
    object: 'ЖК Радуга',
    equipment: 'Toshiba Super Digital (VRF)',
    type: 'Полугодовое',
    nextDate: '2026-05-22',
    engineer: 'Петров С.И.',
    status: 'Запланировано',
    periodicity: 'Раз в 6 мес.',
  },
  {
    id: 'PPR-006',
    object: 'БЦ Горизонт',
    equipment: 'Haier AD482MHERA (кассетный)',
    type: 'Ежеквартальное',
    nextDate: '2026-04-28',
    engineer: 'Сидоров В.Н.',
    status: 'Просрочено',
    periodicity: 'Раз в 3 мес.',
  },
  {
    id: 'PPR-007',
    object: 'Коттеджный посёлок Сосны',
    equipment: 'Daikin Altherma (тепловой насос)',
    type: 'Годовое',
    nextDate: '2026-06-03',
    engineer: 'Петров С.И.',
    status: 'Запланировано',
    periodicity: 'Раз в год',
  },
  {
    id: 'PPR-008',
    object: 'Ресторан Парус',
    equipment: 'Fujitsu AOYG (мульти-сплит)',
    type: 'Ежеквартальное',
    nextDate: '2026-03-10',
    engineer: 'Козлов А.В.',
    status: 'Выполнено',
    periodicity: 'Раз в 3 мес.',
  },
  {
    id: 'PPR-009',
    object: 'Поликлиника №7',
    equipment: 'Mitsubishi Electric MXZ (VRF)',
    type: 'Годовое',
    nextDate: '2026-05-05',
    engineer: 'Козлов А.В.',
    status: 'Просрочено',
    periodicity: 'Раз в год',
  },
  {
    id: 'PPR-010',
    object: 'Гипермаркет Лента',
    equipment: 'LG Multi V (центральная система)',
    type: 'Полугодовое',
    nextDate: '2026-05-29',
    engineer: 'Петров С.И.',
    status: 'Запланировано',
    periodicity: 'Раз в 6 мес.',
  },
  {
    id: 'PPR-011',
    object: 'Школа №42',
    equipment: 'Panasonic KIT-UZ (канальный)',
    type: 'Ежеквартальное',
    nextDate: '2026-06-20',
    engineer: 'Сидоров В.Н.',
    status: 'Запланировано',
    periodicity: 'Раз в 3 мес.',
  },
  {
    id: 'PPR-012',
    object: 'Гостиница Европа',
    equipment: 'Samsung DVM S (VRF)',
    type: 'Годовое',
    nextDate: '2026-02-14',
    engineer: 'Петров С.И.',
    status: 'Выполнено',
    periodicity: 'Раз в год',
  },
];

// 6 объектов для диаграммы Ганта
const GANTT_OBJECTS = [
  'ТЦ Мираж',
  'Офис Альфа',
  'ТРЦ Галерея',
  'Склад Логистик',
  'ЖК Радуга',
  'БЦ Горизонт',
];

// ТО месяцев по объекту (month index 0-11, type)
const GANTT_DATA: Record<string, { month: number; type: MaintenanceType }[]> = {
  'ТЦ Мираж':         [{ month: 1, type: 'Ежеквартальное' }, { month: 4, type: 'Ежеквартальное' }, { month: 7, type: 'Ежеквартальное' }, { month: 10, type: 'Ежеквартальное' }],
  'Офис Альфа':       [{ month: 1, type: 'Полугодовое' }, { month: 7, type: 'Полугодовое' }],
  'ТРЦ Галерея':      [{ month: 4, type: 'Годовое' }],
  'Склад Логистик':   [{ month: 2, type: 'Ежеквартальное' }, { month: 5, type: 'Ежеквартальное' }, { month: 8, type: 'Ежеквартальное' }, { month: 11, type: 'Ежеквартальное' }],
  'ЖК Радуга':        [{ month: 4, type: 'Полугодовое' }, { month: 10, type: 'Полугодовое' }],
  'БЦ Горизонт':      [{ month: 0, type: 'Ежеквартальное' }, { month: 3, type: 'Ежеквартальное' }, { month: 6, type: 'Ежеквартальное' }, { month: 9, type: 'Ежеквартальное' }],
};

// Plan vs fact (bar chart)
const CHART_DATA = [
  { month: 'Янв', plan: 4, fact: 4 },
  { month: 'Фев', plan: 3, fact: 3 },
  { month: 'Мар', plan: 5, fact: 4 },
  { month: 'Апр', plan: 4, fact: 2 },
  { month: 'Май', plan: 6, fact: 3 },
  { month: 'Июн', plan: 5, fact: 0 },
  { month: 'Июл', plan: 4, fact: 0 },
  { month: 'Авг', plan: 4, fact: 0 },
  { month: 'Сен', plan: 3, fact: 0 },
  { month: 'Окт', plan: 5, fact: 0 },
  { month: 'Ноя', plan: 4, fact: 0 },
  { month: 'Дек', plan: 3, fact: 0 },
];

// ─── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
];
const MONTH_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAY_NAMES = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const TYPE_COLOR: Record<MaintenanceType, string> = {
  'Ежеквартальное': 'bg-sky-500',
  'Полугодовое':    'bg-indigo-500',
  'Годовое':        'bg-violet-600',
};

const TYPE_TEXT_COLOR: Record<MaintenanceType, string> = {
  'Ежеквартальное': 'text-sky-700 bg-sky-100',
  'Полугодовое':    'text-indigo-700 bg-indigo-100',
  'Годовое':        'text-violet-700 bg-violet-100',
};

const STATUS_CONFIG: Record<
  MaintenanceStatus,
  { variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: string; rowClass: string }
> = {
  'Запланировано': { variant: 'secondary', icon: 'Clock',         rowClass: '' },
  'Просрочено':    { variant: 'destructive', icon: 'AlertTriangle', rowClass: 'bg-red-50' },
  'Выполнено':     { variant: 'default',     icon: 'CheckCircle2', rowClass: 'bg-green-50/40' },
};

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function MaintenancePlanner() {
  const [view, setView]               = useState<ViewMode>('list');
  const [calMonth, setCalMonth]       = useState(4); // May (index 4) = today per project context
  const [calYear]                     = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // List filters
  const [filterType, setFilterType]       = useState<MaintenanceType | 'Все'>('Все');
  const [filterEngineer, setFilterEngineer] = useState<string>('Все');
  const [filterStatus, setFilterStatus]   = useState<MaintenanceStatus | 'Все'>('Все');

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredItems = ITEMS.filter((item) => {
    if (filterType !== 'Все' && item.type !== filterType) return false;
    if (filterEngineer !== 'Все' && item.engineer !== filterEngineer) return false;
    if (filterStatus !== 'Все' && item.status !== filterStatus) return false;
    return true;
  });

  // Calendar
  const calGrid = buildCalendarGrid(calYear, calMonth);
  const itemsByDay: Record<number, MaintenanceItem[]> = {};
  ITEMS.forEach((item) => {
    const d = new Date(item.nextDate);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const day = d.getDate();
      if (!itemsByDay[day]) itemsByDay[day] = [];
      itemsByDay[day].push(item);
    }
  });
  const selectedDayItems = selectedDay ? (itemsByDay[selectedDay] ?? []) : [];

  // Stats
  const totalPlan    = CHART_DATA.reduce((s, r) => s + r.plan, 0);
  const totalFact    = CHART_DATA.reduce((s, r) => s + r.fact, 0);
  const pctDone      = Math.round((totalFact / totalPlan) * 100);
  const overdueCount = ITEMS.filter((i) => i.status === 'Просрочено').length;
  const autoCount    = 9; // mock

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleCreateOrder(item: MaintenanceItem) {
    toast.success('Наряд создан', {
      description: `${item.type} ТО — ${item.equipment} (${item.object}) → ${item.engineer}`,
    });
  }

  function handleGenerate() {
    const nextMonth = MONTH_NAMES[(calMonth + 1) % 12];
    const count = Math.floor(Math.random() * 4) + 3;
    toast.success(`Сгенерировано ${count} нарядов`, {
      description: `Плановые ТО на ${nextMonth} ${calYear} переданы в работу`,
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
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

          <Button size="sm" variant="outline" onClick={handleGenerate}>
            <Icon name="Zap" size={14} className="mr-1" />
            Сгенерировать наряды на след. месяц
          </Button>
        </div>
      </div>

      {/* ── Body: main + right panel ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main area */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
          {view === 'list' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
                <Icon name="Filter" size={15} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Фильтры:</span>

                {/* Type */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as MaintenanceType | 'Все')}
                  className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="Все">Все типы</option>
                  <option value="Ежеквартальное">Ежеквартальное</option>
                  <option value="Полугодовое">Полугодовое</option>
                  <option value="Годовое">Годовое</option>
                </select>

                {/* Engineer */}
                <select
                  value={filterEngineer}
                  onChange={(e) => setFilterEngineer(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="Все">Все инженеры</option>
                  {ENGINEERS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>

                {/* Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as MaintenanceStatus | 'Все')}
                  className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="Все">Все статусы</option>
                  <option value="Запланировано">Запланировано</option>
                  <option value="Просрочено">Просрочено</option>
                  <option value="Выполнено">Выполнено</option>
                </select>

                {(filterType !== 'Все' || filterEngineer !== 'Все' || filterStatus !== 'Все') && (
                  <button
                    onClick={() => { setFilterType('Все'); setFilterEngineer('Все'); setFilterStatus('Все'); }}
                    className="text-xs text-blue-600 hover:underline ml-auto"
                  >
                    Сбросить
                  </button>
                )}

                <span className="ml-auto text-xs text-gray-400">
                  {filteredItems.length} из {ITEMS.length}
                </span>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Объект', 'Оборудование', 'Тип ТО', 'Дата след. ТО', 'Инженер', 'Статус', 'Периодичность', ''].map((col) => (
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
                    {filteredItems.map((item) => {
                      const st = STATUS_CONFIG[item.status];
                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors hover:brightness-95 ${st.rowClass}`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800 text-xs">{item.object}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{item.id}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-700 max-w-[200px] truncate" title={item.equipment}>
                              {item.equipment}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_TEXT_COLOR[item.type]}`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                            {formatDate(item.nextDate)}
                            {item.status === 'Просрочено' && (
                              <div className="text-red-500 text-xs flex items-center gap-0.5 mt-0.5">
                                <Icon name="AlertTriangle" size={10} />
                                Просрочено
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                            {item.engineer}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={st.variant} className="text-xs gap-1 whitespace-nowrap">
                              <Icon name={st.icon} size={11} />
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {item.periodicity}
                          </td>
                          <td className="px-4 py-3">
                            {item.status === 'Выполнено' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toast.info('Просмотр наряда', { description: item.equipment })}
                              >
                                <Icon name="Eye" size={12} className="mr-1" />
                                Просмотр
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleCreateOrder(item)}
                              >
                                <Icon name="Plus" size={12} className="mr-1" />
                                Создать наряд
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                          <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
                          Нет записей по выбранным фильтрам
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CALENDAR VIEW ─────────────────────────────────────────────── */}
          {view === 'calendar' && (
            <div className="flex gap-4">
              {/* Calendar grid */}
              <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden min-w-0">
                {/* Navigation */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setCalMonth((m) => Math.max(0, m - 1)); setSelectedDay(null); }}
                    disabled={calMonth === 0}
                  >
                    <Icon name="ChevronLeft" size={14} />
                  </Button>
                  <span className="font-semibold text-gray-800 text-sm">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setCalMonth((m) => Math.min(11, m + 1)); setSelectedDay(null); }}
                    disabled={calMonth === 11}
                  >
                    <Icon name="ChevronRight" size={14} />
                  </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Cells */}
                <div className="grid grid-cols-7">
                  {calGrid.map((day, idx) => {
                    const isToday = day === 15 && calMonth === 4; // 2026-05-15
                    const dayItems = day !== null ? (itemsByDay[day] ?? []) : [];
                    const isSelected = day !== null && day === selectedDay;
                    return (
                      <div
                        key={idx}
                        onClick={() => day !== null && setSelectedDay(day === selectedDay ? null : day)}
                        className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 cursor-pointer transition-colors
                          ${day === null ? 'bg-gray-50 cursor-default' : 'hover:bg-blue-50/50'}
                          ${isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : ''}
                          ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                      >
                        {day !== null && (
                          <>
                            <div
                              className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                                ${isToday ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                            >
                              {day}
                            </div>
                            <div className="space-y-0.5">
                              {dayItems.map((item) => (
                                <div
                                  key={item.id}
                                  title={`${item.equipment} — ${item.engineer}`}
                                  className={`text-white text-[10px] leading-tight px-1 py-0.5 rounded truncate ${TYPE_COLOR[item.type]} ${
                                    item.status === 'Просрочено' ? 'opacity-70' : ''
                                  }`}
                                >
                                  {item.type.slice(0, 3)} · {item.object}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                  {(Object.entries(TYPE_COLOR) as [MaintenanceType, string][]).map(([type, color]) => (
                    <span key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className={`w-3 h-3 rounded ${color}`} />
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day detail panel */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-0">
                  {selectedDay ? (
                    <>
                      <h3 className="font-semibold text-gray-800 text-sm mb-3">
                        {selectedDay} {MONTH_NAMES[calMonth]}
                      </h3>
                      {selectedDayItems.length === 0 ? (
                        <p className="text-xs text-gray-400">Нет ТО в этот день</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedDayItems.map((item) => {
                            const st = STATUS_CONFIG[item.status];
                            return (
                              <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                                <div className="text-xs font-medium text-gray-800 mb-1">{item.object}</div>
                                <div className="text-xs text-gray-500 mb-2 truncate">{item.equipment}</div>
                                <Badge variant={st.variant} className="text-xs gap-1 mb-2">
                                  <Icon name={st.icon} size={10} />
                                  {item.status}
                                </Badge>
                                <div className="text-xs text-gray-500 mb-2">{item.engineer}</div>
                                {item.status !== 'Выполнено' && (
                                  <Button
                                    size="sm"
                                    className="w-full h-7 text-xs"
                                    onClick={() => handleCreateOrder(item)}
                                  >
                                    Создать наряд
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Icon name="CalendarDays" size={28} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400">Кликните на день для просмотра ТО</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── GANTT VIEW ────────────────────────────────────────────────── */}
          {view === 'gantt' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header: months */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {/* Row label column */}
                <div className="w-40 flex-shrink-0 px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200">
                  Объект
                </div>
                {MONTH_SHORT.map((m, i) => (
                  <div
                    key={m}
                    className={`flex-1 text-center py-2.5 text-xs font-medium text-gray-500 ${
                      i < 11 ? 'border-r border-gray-100' : ''
                    } ${i === 4 ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    {m}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {GANTT_OBJECTS.map((obj, rowIdx) => {
                const events = GANTT_DATA[obj] ?? [];
                return (
                  <div
                    key={obj}
                    className={`flex items-center border-b border-gray-100 ${rowIdx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    {/* Label */}
                    <div className="w-40 flex-shrink-0 px-3 py-3 text-xs font-medium text-gray-700 border-r border-gray-200 truncate" title={obj}>
                      {obj}
                    </div>
                    {/* Month cells */}
                    {MONTH_SHORT.map((_, monthIdx) => {
                      const ev = events.find((e) => e.month === monthIdx);
                      return (
                        <div
                          key={monthIdx}
                          className={`flex-1 h-10 flex items-center justify-center relative ${
                            monthIdx < 11 ? 'border-r border-gray-100' : ''
                          } ${monthIdx === 4 ? 'bg-blue-50/40' : ''}`}
                        >
                          {ev && (
                            <div
                              title={`${ev.type} — ${MONTH_NAMES[monthIdx]}`}
                              className={`w-5/6 h-6 rounded flex items-center justify-center cursor-default ${TYPE_COLOR[ev.type]}`}
                              onClick={() =>
                                toast.info(`${obj} — ${ev.type}`, {
                                  description: MONTH_NAMES[monthIdx] + ' ' + calYear,
                                })
                              }
                            >
                              <span className="text-white text-[9px] font-medium hidden lg:block truncate px-1">
                                {ev.type.slice(0, 3)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Legend */}
              <div className="px-4 py-3 flex items-center gap-5 flex-wrap border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Тип ТО:</span>
                {(Object.entries(TYPE_COLOR) as [MaintenanceType, string][]).map(([type, color]) => (
                  <span key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className={`w-3 h-3 rounded ${color}`} />
                    {type}
                  </span>
                ))}
                <span className="ml-auto text-xs text-gray-400 italic">
                  Текущий месяц выделен синим
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right stats panel ─────────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4 space-y-4">

          {/* Metrics */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Статистика
            </h3>
            <div className="space-y-2">
              {/* % completion */}
              <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="TrendingUp" size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-700">{pctDone}%</div>
                  <div className="text-xs text-blue-600">Выполнение плана</div>
                </div>
              </div>

              {/* Auto-generated */}
              <div className="bg-emerald-50 rounded-lg p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="Zap" size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-700">{autoCount}</div>
                  <div className="text-xs text-emerald-600">Нарядов создано авто</div>
                </div>
              </div>

              {/* Overdue */}
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

          {/* Bar chart: plan vs fact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              План vs Факт (12 мес.)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={1} />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'plan' ? 'План' : 'Факт',
                  ]}
                />
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(v) => (v === 'plan' ? 'План' : 'Факт')}
                />
                <Bar dataKey="plan" fill="#93c5fd" radius={[2, 2, 0, 0]} />
                <Bar dataKey="fact" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Generate button */}
          <div className="pt-1">
            <Button className="w-full" size="sm" onClick={handleGenerate}>
              <Icon name="CalendarPlus" size={14} className="mr-1.5" />
              Сгенерировать наряды на след. месяц
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Будет создано ~{Math.floor(Math.random() * 3) + 3} нарядов
            </p>
          </div>

          {/* Type breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              По типу ТО
            </h3>
            {(['Ежеквартальное', 'Полугодовое', 'Годовое'] as MaintenanceType[]).map((type) => {
              const count = ITEMS.filter((i) => i.type === type).length;
              const pct = Math.round((count / ITEMS.length) * 100);
              return (
                <div key={type} className="mb-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                    <span>{type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${TYPE_COLOR[type]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
