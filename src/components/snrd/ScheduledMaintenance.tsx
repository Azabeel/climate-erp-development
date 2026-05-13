import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

type Frequency = 'Ежемесячно' | 'Ежеквартально' | 'Ежегодно';
type MaintenanceStatus = 'Запланировано' | 'Просрочено' | 'Выполнено';
type ViewMode = 'list' | 'calendar';

interface MaintenancePlan {
  id: string;
  name: string;
  equipmentType: string;
  clientName: string;
  objectName: string;
  frequency: Frequency;
  nextDate: string; // DD.MM.YYYY
  lastDate: string;
  assignedEngineer: string;
  status: MaintenanceStatus;
  estimatedDuration: number; // minutes
}

const ENGINEERS = [
  'Иванов Иван',
  'Петров Сергей',
  'Сидоров Алексей',
  'Козлов Михаил',
  'Волков Николай',
  'Новиков Андрей',
];

const mockPlans: MaintenancePlan[] = [
  {
    id: 'MP-001', name: 'ТО кондиционеров ТЦ Мега', equipmentType: 'Кондиционер',
    clientName: 'ТЦ «Мега»', objectName: 'Торговый зал №1',
    frequency: 'Ежеквартально', nextDate: '15.05.2026', lastDate: '15.02.2026',
    assignedEngineer: 'Иванов Иван', status: 'Запланировано', estimatedDuration: 180,
  },
  {
    id: 'MP-002', name: 'Замена фильтров вентиляции', equipmentType: 'Вентустановка',
    clientName: 'БЦ «Авангард»', objectName: 'Серверная комната',
    frequency: 'Ежемесячно', nextDate: '08.05.2026', lastDate: '08.04.2026',
    assignedEngineer: 'Петров Сергей', status: 'Просрочено', estimatedDuration: 60,
  },
  {
    id: 'MP-003', name: 'Годовое ТО чиллера', equipmentType: 'Чиллер',
    clientName: 'Завод «МашПром»', objectName: 'Производственный цех',
    frequency: 'Ежегодно', nextDate: '20.05.2026', lastDate: '20.05.2025',
    assignedEngineer: 'Козлов Михаил', status: 'Запланировано', estimatedDuration: 480,
  },
  {
    id: 'MP-004', name: 'ТО VRF-системы', equipmentType: 'VRF-система',
    clientName: 'Отель «Метрополь»', objectName: 'Гостиничный корпус А',
    frequency: 'Ежеквартально', nextDate: '05.05.2026', lastDate: '05.02.2026',
    assignedEngineer: 'Сидоров Алексей', status: 'Просрочено', estimatedDuration: 240,
  },
  {
    id: 'MP-005', name: 'Промывка дренажных систем', equipmentType: 'Дренажная система',
    clientName: 'Склад «Логистик»', objectName: 'Склад А',
    frequency: 'Ежемесячно', nextDate: '18.05.2026', lastDate: '18.04.2026',
    assignedEngineer: 'Волков Николай', status: 'Запланировано', estimatedDuration: 90,
  },
  {
    id: 'MP-006', name: 'ТО фанкойлов', equipmentType: 'Фанкойл',
    clientName: 'Офис «ТехноГрупп»', objectName: 'Офисный этаж 3',
    frequency: 'Ежеквартально', nextDate: '25.05.2026', lastDate: '25.02.2026',
    assignedEngineer: 'Новиков Андрей', status: 'Запланировано', estimatedDuration: 120,
  },
  {
    id: 'MP-007', name: 'Проверка холодильных камер', equipmentType: 'Холодильная камера',
    clientName: 'Ресторан «Причал»', objectName: 'Кухонный блок',
    frequency: 'Ежемесячно', nextDate: '12.05.2026', lastDate: '12.04.2026',
    assignedEngineer: 'Иванов Иван', status: 'Запланировано', estimatedDuration: 75,
  },
  {
    id: 'MP-008', name: 'Ежегодная проверка вентиляции', equipmentType: 'Вентиляция',
    clientName: 'СК «Крылатское»', objectName: 'Спортивный зал',
    frequency: 'Ежегодно', nextDate: '30.05.2026', lastDate: '30.05.2025',
    assignedEngineer: 'Петров Сергей', status: 'Запланировано', estimatedDuration: 360,
  },
  {
    id: 'MP-009', name: 'ТО кассетных кондиционеров', equipmentType: 'Кондиционер',
    clientName: 'ТЦ «Садовод»', objectName: 'Торговые ряды',
    frequency: 'Ежеквартально', nextDate: '22.05.2026', lastDate: '22.02.2026',
    assignedEngineer: 'Козлов Михаил', status: 'Запланировано', estimatedDuration: 150,
  },
  {
    id: 'MP-010', name: 'Дозаправка фреона', equipmentType: 'Кондиционер',
    clientName: 'Бутик «Люкс»', objectName: 'Торговый зал',
    frequency: 'Ежегодно', nextDate: '01.05.2026', lastDate: '01.05.2025',
    assignedEngineer: 'Сидоров Алексей', status: 'Просрочено', estimatedDuration: 45,
  },
];

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  Запланировано: 'bg-blue-100 text-blue-700',
  Просрочено: 'bg-red-100 text-red-700',
  Выполнено: 'bg-green-100 text-green-700',
};

const FREQ_STYLES: Record<Frequency, string> = {
  Ежемесячно: 'bg-green-100 text-green-700',
  Ежеквартально: 'bg-orange-100 text-orange-700',
  Ежегодно: 'bg-purple-100 text-purple-700',
};

const STATUS_DOT: Record<MaintenanceStatus, string> = {
  Запланировано: 'bg-blue-500',
  Просрочено: 'bg-red-500',
  Выполнено: 'bg-green-500',
};

// Parse DD.MM.YYYY → { day, month }
const parseDay = (dateStr: string): { day: number; month: number; year: number } => {
  const [d, m, y] = dateStr.split('.').map(Number);
  return { day: d, month: m, year: y };
};

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const ScheduledMaintenance = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>(mockPlans);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof MaintenancePlan>('nextDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(5); // May
  const [calendarYear, setCalendarYear] = useState(2026);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEquipmentType, setFormEquipmentType] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formObject, setFormObject] = useState('');
  const [formFrequency, setFormFrequency] = useState<Frequency>('Ежемесячно');
  const [formNextDate, setFormNextDate] = useState('');
  const [formEngineer, setFormEngineer] = useState(ENGINEERS[0]);
  const [formDuration, setFormDuration] = useState('60');

  const filtered = plans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.equipmentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: string | number = a[sortField] as string | number;
    let vb: string | number = b[sortField] as string | number;
    if (sortField === 'nextDate' || sortField === 'lastDate') {
      const pa = parseDay(a[sortField] as string);
      const pb = parseDay(b[sortField] as string);
      const da = pa.year * 10000 + pa.month * 100 + pa.day;
      const db = pb.year * 10000 + pb.month * 100 + pb.day;
      va = da; vb = db;
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: keyof MaintenancePlan) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSave = () => {
    if (!formName.trim() || !formNextDate) return;
    const [y, m, d] = formNextDate.split('-');
    const newPlan: MaintenancePlan = {
      id: `MP-${String(plans.length + 1).padStart(3, '0')}`,
      name: formName,
      equipmentType: formEquipmentType,
      clientName: formClient,
      objectName: formObject,
      frequency: formFrequency,
      nextDate: `${d}.${m}.${y}`,
      lastDate: '—',
      assignedEngineer: formEngineer,
      status: 'Запланировано',
      estimatedDuration: parseInt(formDuration) || 60,
    };
    setPlans([...plans, newPlan]);
    setIsModalOpen(false);
  };

  const createWorkOrder = (id: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, status: 'Выполнено' } : p)));
  };

  // Calendar helpers
  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const getFirstWeekday = (month: number, year: number) => {
    const d = new Date(year, month - 1, 1).getDay();
    return d === 0 ? 6 : d - 1; // 0=Mon
  };

  const getPlansForDay = (day: number) =>
    plans.filter((p) => {
      const pd = parseDay(p.nextDate);
      return pd.day === day && pd.month === calendarMonth && pd.year === calendarYear;
    });

  const prevMonth = () => {
    if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(calendarYear - 1); }
    else setCalendarMonth(calendarMonth - 1);
  };
  const nextMonth = () => {
    if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(calendarYear + 1); }
    else setCalendarMonth(calendarMonth + 1);
  };

  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
  const firstWeekday = getFirstWeekday(calendarMonth, calendarYear);

  const overdue = plans.filter((p) => p.status === 'Просрочено').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Плановое обслуживание</h2>
          <p className="text-gray-500 mt-1">Планово-предупредительные работы (ППР)</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Icon name="List" size={15} />
              Список
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Icon name="Calendar" size={15} />
              Календарь
            </button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать план ТО
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="CalendarClock" size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{plans.length}</div>
              <div className="text-sm text-gray-500">Всего планов</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{overdue}</div>
              <div className="text-sm text-gray-500">Просрочено</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{plans.filter((p) => p.status === 'Выполнено').length}</div>
              <div className="text-sm text-gray-500">Выполнено</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(plans.reduce((s, p) => s + p.estimatedDuration, 0) / 60)}ч
              </div>
              <div className="text-sm text-gray-500">Суммарно (план)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters (list mode only) */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск по названию, клиенту, оборудованию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Все статусы</option>
                <option value="Запланировано">Запланировано</option>
                <option value="Просрочено">Просрочено</option>
                <option value="Выполнено">Выполнено</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Планы ТО ({sorted.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Название
                      <Icon name={sortField === 'name' ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={13} />
                    </div>
                  </TableHead>
                  <TableHead>Оборудование</TableHead>
                  <TableHead>Клиент / Объект</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('frequency')}
                  >
                    <div className="flex items-center gap-1">
                      Периодичность
                      <Icon name={sortField === 'frequency' ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={13} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('nextDate')}
                  >
                    <div className="flex items-center gap-1">
                      Следующая дата
                      <Icon name={sortField === 'nextDate' ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={13} />
                    </div>
                  </TableHead>
                  <TableHead>Инженер</TableHead>
                  <TableHead>Длит.</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Статус
                      <Icon name={sortField === 'status' ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={13} />
                    </div>
                  </TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((plan) => (
                  <TableRow key={plan.id} className={plan.status === 'Просрочено' ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="font-medium text-sm text-gray-900">{plan.name}</div>
                      <div className="text-xs text-gray-400">{plan.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{plan.equipmentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{plan.clientName}</div>
                      <div className="text-xs text-gray-500">{plan.objectName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={FREQ_STYLES[plan.frequency]}>{plan.frequency}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Icon name="Calendar" size={13} className="text-gray-400" />
                        <span className={`text-sm ${plan.status === 'Просрочено' ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                          {plan.nextDate}
                        </span>
                      </div>
                      {plan.lastDate !== '—' && (
                        <div className="text-xs text-gray-400 mt-0.5">Последнее: {plan.lastDate}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{plan.assignedEngineer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Icon name="Clock" size={13} className="text-gray-400" />
                        {plan.estimatedDuration >= 60
                          ? `${Math.floor(plan.estimatedDuration / 60)}ч ${plan.estimatedDuration % 60 > 0 ? plan.estimatedDuration % 60 + 'м' : ''}`
                          : `${plan.estimatedDuration}м`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[plan.status]}>{plan.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {plan.status === 'Просрочено' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => createWorkOrder(plan.id)}
                            title="Создать наряд"
                          >
                            <Icon name="Wrench" size={13} className="mr-1" />
                            Наряд
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Редактировать">
                          <Icon name="Edit" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {sorted.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                Планы ТО не найдены
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {MONTHS_RU[calendarMonth - 1]} {calendarYear}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <Icon name="ChevronLeft" size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS_RU.map((wd) => (
                <div key={wd} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {wd}
                </div>
              ))}
            </div>
            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayPlans = getPlansForDay(day);
                const today = calendarMonth === 5 && calendarYear === 2026 && day === 11;
                return (
                  <div
                    key={day}
                    className={`h-20 border rounded-lg p-1.5 ${today ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                  >
                    <div className={`text-xs font-semibold mb-1 ${today ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayPlans.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center gap-1 px-1 rounded text-xs truncate ${
                            p.status === 'Просрочено' ? 'bg-red-100 text-red-700' :
                            p.status === 'Выполнено' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}
                          title={p.name}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[p.status]}`} />
                          <span className="truncate">{p.name}</span>
                        </div>
                      ))}
                      {dayPlans.length > 3 && (
                        <div className="text-xs text-gray-400 pl-1">+{dayPlans.length - 3}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Запланировано
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Просрочено
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Выполнено
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue alert */}
      {overdue > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
                <div>
                  <div className="font-semibold text-red-800">
                    {overdue} просроченных плана ТО
                  </div>
                  <div className="text-sm text-red-600">
                    Требуется создать наряды для выполнения просроченного обслуживания
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => { setStatusFilter('Просрочено'); setViewMode('list'); }}
              >
                Показать просроченные
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать план ТО</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Например: ТО кондиционеров офиса"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Тип оборудования</Label>
                <Input
                  value={formEquipmentType}
                  onChange={(e) => setFormEquipmentType(e.target.value)}
                  placeholder="Кондиционер"
                />
              </div>
              <div>
                <Label>Периодичность</Label>
                <select
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value as Frequency)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ежемесячно">Ежемесячно</option>
                  <option value="Ежеквартально">Ежеквартально</option>
                  <option value="Ежегодно">Ежегодно</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Клиент</Label>
              <Input
                value={formClient}
                onChange={(e) => setFormClient(e.target.value)}
                placeholder="Название клиента"
              />
            </div>
            <div>
              <Label>Объект</Label>
              <Input
                value={formObject}
                onChange={(e) => setFormObject(e.target.value)}
                placeholder="Название объекта / помещения"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Дата начала *</Label>
                <Input
                  type="date"
                  value={formNextDate}
                  onChange={(e) => setFormNextDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Длительность (мин)</Label>
                <Input
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  min="15"
                  max="999"
                />
              </div>
            </div>
            <div>
              <Label>Инженер</Label>
              <select
                value={formEngineer}
                onChange={(e) => setFormEngineer(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ENGINEERS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!formName.trim() || !formNextDate}>
              Создать план
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledMaintenance;
