import { useState } from 'react';
import {
  CalendarClock,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type MaintenanceType = 'ТО-1' | 'ТО-2' | 'ТО-3' | 'Сезонное';
type MaintenanceStatus = 'planned' | 'completed' | 'overdue' | 'in_progress';
type ViewMode = 'calendar' | 'list' | 'equipment';
type FilterMode = 'all' | 'overdue' | 'upcoming' | 'completed';

interface MaintenanceItem {
  id: string;
  equipmentName: string;
  client: string;
  location: string;
  maintenanceType: MaintenanceType;
  scheduledDate: string;
  engineer: string;
  estimatedHours: number;
  status: MaintenanceStatus;
  lastMaintenanceDate: string;
  nextMaintenanceDays: number;
}

const MAINTENANCE_ITEMS: MaintenanceItem[] = [
  {
    id: 'PPR-001',
    equipmentName: 'Daikin VRV-IV (наружный блок)',
    client: 'ТЦ Мираж',
    location: 'ТЦ Мираж, этаж 2, зона А',
    maintenanceType: 'ТО-2',
    scheduledDate: '2026-05-05',
    engineer: 'Козлов А.В.',
    estimatedHours: 3,
    status: 'completed',
    lastMaintenanceDate: '2025-11-05',
    nextMaintenanceDays: -10,
  },
  {
    id: 'PPR-002',
    equipmentName: 'Mitsubishi Heavy SRK (split 24)',
    client: 'Офис Альфа',
    location: 'Офис Альфа, 3 этаж, переговорная',
    maintenanceType: 'ТО-1',
    scheduledDate: '2026-05-12',
    engineer: 'Петров С.И.',
    estimatedHours: 1.5,
    status: 'completed',
    lastMaintenanceDate: '2025-05-12',
    nextMaintenanceDays: -3,
  },
  {
    id: 'PPR-003',
    equipmentName: 'Carrier 38QHC (чиллер)',
    client: 'ТРЦ Галерея',
    location: 'ТРЦ Галерея, тех. этаж, ИТП',
    maintenanceType: 'ТО-3',
    scheduledDate: '2026-05-08',
    engineer: 'Сидоров В.Н.',
    estimatedHours: 6,
    status: 'overdue',
    lastMaintenanceDate: '2025-05-08',
    nextMaintenanceDays: -7,
  },
  {
    id: 'PPR-004',
    equipmentName: 'Gree GMV6 (мультизональная)',
    client: 'Склад Логистик',
    location: 'Склад №3, зона охлаждения',
    maintenanceType: 'Сезонное',
    scheduledDate: '2026-05-20',
    engineer: 'Козлов А.В.',
    estimatedHours: 4,
    status: 'in_progress',
    lastMaintenanceDate: '2025-10-20',
    nextMaintenanceDays: 5,
  },
  {
    id: 'PPR-005',
    equipmentName: 'Toshiba Super Digital (VRF)',
    client: 'ЖК Радуга',
    location: 'ЖК Радуга, лобби, 1 этаж',
    maintenanceType: 'ТО-1',
    scheduledDate: '2026-05-22',
    engineer: 'Иванов Д.К.',
    estimatedHours: 2,
    status: 'planned',
    lastMaintenanceDate: '2025-11-22',
    nextMaintenanceDays: 7,
  },
  {
    id: 'PPR-006',
    equipmentName: 'Haier AD482MHERA (кассетный)',
    client: 'БЦ Горизонт',
    location: 'БЦ Горизонт, 7 этаж, open space',
    maintenanceType: 'ТО-2',
    scheduledDate: '2026-05-27',
    engineer: 'Петров С.И.',
    estimatedHours: 2.5,
    status: 'planned',
    lastMaintenanceDate: '2025-11-27',
    nextMaintenanceDays: 12,
  },
  {
    id: 'PPR-007',
    equipmentName: 'Daikin Altherma (тепловой насос)',
    client: 'Коттеджный посёлок Сосны',
    location: 'Коттедж №14, котельная',
    maintenanceType: 'Сезонное',
    scheduledDate: '2026-06-03',
    engineer: 'Сидоров В.Н.',
    estimatedHours: 5,
    status: 'planned',
    lastMaintenanceDate: '2025-10-03',
    nextMaintenanceDays: 19,
  },
  {
    id: 'PPR-008',
    equipmentName: 'Fujitsu AOYG (мульти-сплит)',
    client: 'Ресторан Парус',
    location: 'Ресторан Парус, зал, крыша',
    maintenanceType: 'ТО-1',
    scheduledDate: '2026-06-10',
    engineer: 'Иванов Д.К.',
    estimatedHours: 1.5,
    status: 'planned',
    lastMaintenanceDate: '2025-12-10',
    nextMaintenanceDays: 26,
  },
  {
    id: 'PPR-009',
    equipmentName: 'Mitsubishi Electric MXZ (VRF)',
    client: 'Поликлиника №7',
    location: 'Поликлиника №7, операционный блок',
    maintenanceType: 'ТО-3',
    scheduledDate: '2026-05-15',
    engineer: 'Козлов А.В.',
    estimatedHours: 7,
    status: 'overdue',
    lastMaintenanceDate: '2025-05-15',
    nextMaintenanceDays: -15,
  },
  {
    id: 'PPR-010',
    equipmentName: 'LG Multi V (центральная система)',
    client: 'Гипермаркет Лента',
    location: 'Гипермаркет Лента, торговый зал',
    maintenanceType: 'ТО-2',
    scheduledDate: '2026-05-29',
    engineer: 'Петров С.И.',
    estimatedHours: 4,
    status: 'planned',
    lastMaintenanceDate: '2025-11-29',
    nextMaintenanceDays: 14,
  },
];

const STATUS_CONFIG: Record<
  MaintenanceStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  planned: {
    label: 'Запланировано',
    badgeClass: 'bg-blue-100 text-blue-700',
    icon: <Clock size={12} />,
  },
  completed: {
    label: 'Выполнено',
    badgeClass: 'bg-green-100 text-green-700',
    icon: <CheckCircle size={12} />,
  },
  overdue: {
    label: 'Просрочено',
    badgeClass: 'bg-red-100 text-red-700',
    icon: <AlertTriangle size={12} />,
  },
  in_progress: {
    label: 'В работе',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    icon: <Wrench size={12} />,
  },
};

const TYPE_COLOR: Record<MaintenanceType, string> = {
  'ТО-1': 'bg-sky-500',
  'ТО-2': 'bg-indigo-500',
  'ТО-3': 'bg-violet-500',
  'Сезонное': 'bg-emerald-500',
};

// Build a 7-col calendar grid for a given month/year.
// Returns array of 35 or 42 day cells (null = padding day).
function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon-first
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

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function MaintenancePlanner() {
  const [view, setView] = useState<ViewMode>('list');
  const [selectedMonth, setSelectedMonth] = useState<number>(4); // May = index 4
  const [filter, setFilter] = useState<FilterMode>('all');

  const calendarYear = 2026;

  const filteredItems = MAINTENANCE_ITEMS.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return item.status === 'overdue';
    if (filter === 'upcoming') return item.status === 'planned' || item.status === 'in_progress';
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  const counts = {
    planned: MAINTENANCE_ITEMS.filter((i) => i.status === 'planned').length,
    completed: MAINTENANCE_ITEMS.filter((i) => i.status === 'completed').length,
    overdue: MAINTENANCE_ITEMS.filter((i) => i.status === 'overdue').length,
    in_progress: MAINTENANCE_ITEMS.filter((i) => i.status === 'in_progress').length,
  };

  // Items for the currently displayed calendar month
  const calendarItems = MAINTENANCE_ITEMS.filter((item) => {
    const d = new Date(item.scheduledDate);
    return d.getFullYear() === calendarYear && d.getMonth() === selectedMonth;
  });

  // Items per day for calendar rendering
  const itemsByDay: Record<number, MaintenanceItem[]> = {};
  calendarItems.forEach((item) => {
    const day = new Date(item.scheduledDate).getDate();
    if (!itemsByDay[day]) itemsByDay[day] = [];
    itemsByDay[day].push(item);
  });

  const calendarGrid = buildCalendarGrid(calendarYear, selectedMonth);

  // Group items by equipment for equipment view
  const byEquipment: Record<string, MaintenanceItem[]> = {};
  MAINTENANCE_ITEMS.forEach((item) => {
    const key = item.equipmentName;
    if (!byEquipment[key]) byEquipment[key] = [];
    byEquipment[key].push(item);
  });

  function handleCreateOrder(item: MaintenanceItem) {
    toast.success('Наряд создан', {
      description: `ТО для ${item.equipmentName} (${item.client}) — ${item.engineer}`,
    });
  }

  function handleAddMaintenance() {
    toast.info('Открытие формы добавления ТО');
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <CalendarClock size={22} className="text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Планирование ТО</h1>
            <p className="text-xs text-gray-500">
              Планово-предупредительные работы (ППР) по климатическому оборудованию
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setView('list')}
            >
              <List size={13} />
              Список
            </button>
            <button
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors border-l border-gray-200 ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setView('calendar')}
            >
              <LayoutGrid size={13} />
              Календарь
            </button>
            <button
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors border-l border-gray-200 ${
                view === 'equipment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setView('equipment')}
            >
              <Cpu size={13} />
              По объектам
            </button>
          </div>
          <Button size="sm" onClick={handleAddMaintenance}>
            <Plus size={14} className="mr-1" />
            Добавить ТО
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-6 flex-wrap">
        {(
          [
            { key: 'planned', label: 'Запланировано', color: 'text-blue-600', filterKey: 'upcoming' },
            { key: 'in_progress', label: 'В работе', color: 'text-yellow-600', filterKey: 'upcoming' },
            { key: 'completed', label: 'Выполнено', color: 'text-green-600', filterKey: 'completed' },
            { key: 'overdue', label: 'Просрочено', color: 'text-red-600', filterKey: 'overdue' },
          ] as Array<{
            key: keyof typeof counts;
            label: string;
            color: string;
            filterKey: FilterMode;
          }>
        ).map(({ key, label, color, filterKey }) => (
          <button
            key={key}
            className={`flex items-center gap-1.5 text-sm hover:opacity-75 transition-opacity ${
              filter === filterKey ? 'font-bold' : ''
            }`}
            onClick={() => setFilter(filter === filterKey ? 'all' : filterKey)}
          >
            <span className={`text-lg font-bold ${color}`}>{counts[key]}</span>
            <span className="text-gray-600">{label}</span>
          </button>
        ))}
        {filter !== 'all' && (
          <button
            className="ml-auto text-xs text-blue-600 hover:underline"
            onClick={() => setFilter('all')}
          >
            Сбросить фильтр
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    'Оборудование',
                    'Клиент',
                    'Тип ТО',
                    'Дата',
                    'Инженер',
                    'Статус',
                    'Действие',
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
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
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 leading-tight">
                          {item.equipmentName}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.location}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.client}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded text-white ${
                            TYPE_COLOR[item.maintenanceType]
                          }`}
                        >
                          {item.maintenanceType}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">
                          ~{item.estimatedHours} ч
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800">{formatDate(item.scheduledDate)}</div>
                        {item.nextMaintenanceDays < 0 ? (
                          <div className="text-xs text-red-500 mt-0.5">
                            Просрочено {Math.abs(item.nextMaintenanceDays)} дн.
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-0.5">
                            Через {item.nextMaintenanceDays} дн.
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.engineer}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${st.badgeClass}`}
                        >
                          {st.icon}
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.status === 'completed' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              toast.info('Просмотр наряда', {
                                description: item.equipmentName,
                              })
                            }
                          >
                            Просмотр
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleCreateOrder(item)}
                          >
                            Создать наряд
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                      Нет записей по выбранному фильтру
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CALENDAR VIEW ── */}
        {view === 'calendar' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Month navigation */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth((m) => Math.max(0, m - 1))}
                disabled={selectedMonth === 0}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="font-semibold text-gray-800 text-sm">
                {MONTH_NAMES[selectedMonth]} {calendarYear}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth((m) => Math.min(11, m + 1))}
                disabled={selectedMonth === 11}
              >
                <ChevronRight size={14} />
              </Button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7">
              {calendarGrid.map((day, idx) => {
                const isToday =
                  day !== null &&
                  selectedMonth === 4 &&
                  day === 15; // 2026-05-15 per project context
                const dayItems = day !== null ? (itemsByDay[day] ?? []) : [];
                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 ${
                      day === null ? 'bg-gray-50' : 'bg-white'
                    } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                  >
                    {day !== null && (
                      <>
                        <div
                          className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600'
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayItems.map((item) => (
                            <div
                              key={item.id}
                              title={`${item.equipmentName} — ${item.engineer}`}
                              className={`text-white text-[10px] leading-tight px-1 py-0.5 rounded truncate cursor-default ${
                                TYPE_COLOR[item.maintenanceType]
                              } ${item.status === 'overdue' ? 'opacity-70 line-through' : ''}`}
                            >
                              {item.maintenanceType} · {item.client}
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
              {(Object.entries(TYPE_COLOR) as [MaintenanceType, string][]).map(
                ([type, color]) => (
                  <span key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className={`w-3 h-3 rounded ${color}`} />
                    {type}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* ── EQUIPMENT VIEW ── */}
        {view === 'equipment' && (
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(byEquipment).map(([equipmentName, items]) => {
              // Sort by date for timeline display
              const sorted = [...items].sort(
                (a, b) =>
                  new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
              );
              const latestStatus = sorted[sorted.length - 1]?.status ?? 'planned';
              const st = STATUS_CONFIG[latestStatus];

              return (
                <div
                  key={equipmentName}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  {/* Equipment card header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-2">
                      <Cpu size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{equipmentName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {sorted[0]?.client} · {sorted[0]?.location}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${st.badgeClass}`}
                    >
                      {st.icon}
                      {st.label}
                    </span>
                  </div>

                  {/* Vertical timeline */}
                  <div className="ml-4 border-l-2 border-gray-200 pl-4 space-y-3">
                    {sorted.map((item, i) => {
                      const itemSt = STATUS_CONFIG[item.status];
                      const isLast = i === sorted.length - 1;
                      return (
                        <div key={item.id} className="relative">
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                              item.status === 'completed'
                                ? 'bg-green-500'
                                : item.status === 'overdue'
                                ? 'bg-red-500'
                                : item.status === 'in_progress'
                                ? 'bg-yellow-400'
                                : 'bg-blue-400'
                            }`}
                          />
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded text-white flex-shrink-0 ${
                                  TYPE_COLOR[item.maintenanceType]
                                }`}
                              >
                                {item.maintenanceType}
                              </span>
                              <span className="text-xs text-gray-600 font-medium">
                                {formatDate(item.scheduledDate)}
                              </span>
                              <span className="text-xs text-gray-400 hidden sm:inline">
                                · {item.engineer}
                              </span>
                              <span className="text-xs text-gray-400 hidden sm:inline">
                                · ~{item.estimatedHours} ч
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span
                                className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full ${itemSt.badgeClass}`}
                              >
                                {itemSt.icon}
                                <span className="hidden sm:inline">{itemSt.label}</span>
                              </span>
                              {isLast && item.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  className="h-6 text-xs px-2"
                                  onClick={() => handleCreateOrder(item)}
                                >
                                  Создать наряд
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
