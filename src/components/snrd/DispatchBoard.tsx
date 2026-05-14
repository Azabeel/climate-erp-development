import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type WOStatus = 'assigned' | 'in_progress' | 'completed' | 'emergency';

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  address: string;
  serviceType: string;
  status: WOStatus;
  engineerId: number | null;
  dayIndex: number; // 0=Mon … 6=Sun
  timeStart: string;
  timeEnd: string;
  notes: string;
}

interface Engineer {
  id: number;
  name: string;
}

// ─────────────────────────────────────────────
// Demo data
// ─────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  { id: 1, name: 'Иванов А.В.' },
  { id: 2, name: 'Петров С.М.' },
  { id: 3, name: 'Козлов Д.Р.' },
  { id: 4, name: 'Новиков П.А.' },
  { id: 5, name: 'Сидоров В.К.' },
  { id: 6, name: 'Морозов И.Л.' },
  { id: 7, name: 'Волков А.С.' },
  { id: 8, name: 'Зайцев Н.П.' },
];

const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo1',  number: 'WO-2026-000121', client: 'ТЦ «Мега»',          address: 'ул. Ленина, 45',       serviceType: 'Ремонт',      status: 'in_progress', engineerId: 1, dayIndex: 0, timeStart: '09:00', timeEnd: '11:30', notes: 'Замена компрессора Daikin' },
  { id: 'wo2',  number: 'WO-2026-000122', client: 'БЦ «Авангард»',      address: 'пр. Мира, 12',        serviceType: 'ТО',          status: 'assigned',    engineerId: 1, dayIndex: 1, timeStart: '10:00', timeEnd: '12:00', notes: 'Плановое ТО VRF-системы' },
  { id: 'wo3',  number: 'WO-2026-000123', client: 'Склад «Логистик»',   address: 'ул. Промышленная, 3', serviceType: 'Диагностика', status: 'completed',   engineerId: 2, dayIndex: 0, timeStart: '08:00', timeEnd: '09:30', notes: '' },
  { id: 'wo4',  number: 'WO-2026-000124', client: 'Ресторан «Уют»',     address: 'ул. Садовая, 7',      serviceType: 'Ремонт',      status: 'emergency',   engineerId: 2, dayIndex: 2, timeStart: '14:00', timeEnd: '17:00', notes: 'Аварийный вызов, компрессор не запускается' },
  { id: 'wo5',  number: 'WO-2026-000125', client: 'ТЦ «Европа»',        address: 'пл. Победы, 1',       serviceType: 'Установка',   status: 'assigned',    engineerId: 3, dayIndex: 0, timeStart: '13:00', timeEnd: '16:00', notes: 'Монтаж кассетного блока' },
  { id: 'wo6',  number: 'WO-2026-000126', client: 'Офис «Прогресс»',    address: 'ул. Гагарина, 22',    serviceType: 'ТО',          status: 'completed',   engineerId: 3, dayIndex: 3, timeStart: '09:00', timeEnd: '10:30', notes: '' },
  { id: 'wo7',  number: 'WO-2026-000127', client: 'Гостиница «Заря»',   address: 'ул. Морская, 8',      serviceType: 'Ремонт',      status: 'in_progress', engineerId: 4, dayIndex: 1, timeStart: '11:00', timeEnd: '14:00', notes: 'Утечка фреона R-410A' },
  { id: 'wo8',  number: 'WO-2026-000128', client: 'Банк «Надёжный»',    address: 'пр. Советский, 55',   serviceType: 'Диагностика', status: 'assigned',    engineerId: 4, dayIndex: 4, timeStart: '10:00', timeEnd: '11:30', notes: '' },
  { id: 'wo9',  number: 'WO-2026-000129', client: 'ТЦ «Мега»',          address: 'ул. Ленина, 45',      serviceType: 'ТО',          status: 'completed',   engineerId: 5, dayIndex: 2, timeStart: '09:00', timeEnd: '11:00', notes: 'Плановое ТО чиллера' },
  { id: 'wo10', number: 'WO-2026-000130', client: 'Склад «Логистик»',   address: 'ул. Промышленная, 3', serviceType: 'Ремонт',      status: 'assigned',    engineerId: 5, dayIndex: 4, timeStart: '13:00', timeEnd: '15:30', notes: '' },
  { id: 'wo11', number: 'WO-2026-000131', client: 'Кафе «Уголок»',      address: 'ул. Цветочная, 14',   serviceType: 'Установка',   status: 'assigned',    engineerId: 6, dayIndex: 0, timeStart: '09:00', timeEnd: '13:00', notes: 'Монтаж 3 сплит-систем' },
  { id: 'wo12', number: 'WO-2026-000132', client: 'Офис «Прогресс»',    address: 'ул. Гагарина, 22',    serviceType: 'Ремонт',      status: 'emergency',   engineerId: 7, dayIndex: 3, timeStart: '15:00', timeEnd: '17:30', notes: 'Аварийный — офис без охлаждения' },
  { id: 'wo13', number: 'WO-2026-000133', client: 'БЦ «Авангард»',      address: 'пр. Мира, 12',        serviceType: 'ТО',          status: 'in_progress', engineerId: 7, dayIndex: 1, timeStart: '08:30', timeEnd: '10:00', notes: '' },
  { id: 'wo14', number: 'WO-2026-000134', client: 'Гостиница «Заря»',   address: 'ул. Морская, 8',      serviceType: 'Диагностика', status: 'completed',   engineerId: 8, dayIndex: 2, timeStart: '10:00', timeEnd: '11:30', notes: '' },
  { id: 'wo15', number: 'WO-2026-000135', client: 'Банк «Надёжный»',    address: 'пр. Советский, 55',   serviceType: 'Ремонт',      status: 'assigned',    engineerId: 8, dayIndex: 5, timeStart: '09:00', timeEnd: '12:00', notes: 'Замена вентилятора конденсатора' },
];

const UNASSIGNED_ORDERS: WorkOrder[] = [
  { id: 'u1', number: 'WO-2026-000136', client: 'ТЦ «Аврора»',       address: 'ул. Речная, 3',     serviceType: 'Ремонт',      status: 'assigned', engineerId: null, dayIndex: -1, timeStart: '', timeEnd: '', notes: 'Кондиционер не охлаждает' },
  { id: 'u2', number: 'WO-2026-000137', client: 'Завод «Металл»',    address: 'пр. Заводской, 88', serviceType: 'ТО',          status: 'assigned', engineerId: null, dayIndex: -1, timeStart: '', timeEnd: '', notes: 'Плановое ТО вентиляции' },
  { id: 'u3', number: 'WO-2026-000138', client: 'ТЦ «Европа»',       address: 'пл. Победы, 1',     serviceType: 'Установка',   status: 'assigned', engineerId: null, dayIndex: -1, timeStart: '', timeEnd: '', notes: 'Монтаж чиллера 60 кВт' },
  { id: 'u4', number: 'WO-2026-000139', client: 'Кафе «Бриз»',       address: 'ул. Набережная, 5', serviceType: 'Диагностика', status: 'assigned', engineerId: null, dayIndex: -1, timeStart: '', timeEnd: '', notes: 'Запах горелого из блока' },
  { id: 'u5', number: 'WO-2026-000140', client: 'Офис «Центральный»', address: 'ул. Советская, 1',  serviceType: 'Ремонт',      status: 'emergency', engineerId: null, dayIndex: -1, timeStart: '', timeEnd: '', notes: 'Аварийный — утечка воды из дренажа' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const STATUS_COLORS: Record<WOStatus, string> = {
  assigned:    'bg-blue-100 border-blue-400 text-blue-800',
  in_progress: 'bg-green-100 border-green-400 text-green-800',
  completed:   'bg-gray-100 border-gray-400 text-gray-600',
  emergency:   'bg-red-100 border-red-500 text-red-800',
};

const STATUS_LABELS: Record<WOStatus, string> = {
  assigned:    'Назначен',
  in_progress: 'Выполняется',
  completed:   'Завершён',
  emergency:   'Аварийный',
};

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Returns Monday of the week containing `base` */
function getMondayOf(base: Date): Date {
  const d = new Date(base);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function WOBlock({ wo, onClick }: { wo: WorkOrder; onClick: () => void }) {
  const shortClient = wo.client.length > 14 ? wo.client.slice(0, 14) + '…' : wo.client;
  return (
    <div
      onClick={onClick}
      className={`border-l-4 rounded px-1.5 py-0.5 mb-1 cursor-pointer text-xs leading-tight hover:opacity-80 transition-opacity ${STATUS_COLORS[wo.status]}`}
    >
      <div className="font-semibold truncate">{wo.number.replace('WO-2026-0', 'WO-')}</div>
      <div className="truncate">{shortClient}</div>
      {wo.timeStart && <div className="text-[10px] opacity-70">{wo.timeStart}–{wo.timeEnd}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function DispatchBoard() {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [filterEngineer, setFilterEngineer] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<WOStatus | 'all'>('all');

  // Compute week dates
  const baseMonday = getMondayOf(today);
  baseMonday.setDate(baseMonday.getDate() + weekOffset * 7);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  // Filter grid orders
  const filteredOrders = WORK_ORDERS.filter(wo => {
    if (filterEngineer !== 'all' && wo.engineerId !== filterEngineer) return false;
    if (filterStatus !== 'all' && wo.status !== filterStatus) return false;
    return true;
  });

  const getCell = (engineerId: number, dayIndex: number) =>
    filteredOrders.filter(wo => wo.engineerId === engineerId && wo.dayIndex === dayIndex);

  const visibleEngineers =
    filterEngineer === 'all'
      ? ENGINEERS
      : ENGINEERS.filter(e => e.id === filterEngineer);

  return (
    <div className="flex gap-4 h-full">
      {/* Main board */}
      <div className="flex-1 min-w-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="CalendarDays" size={20} />
                Доска диспетчера
              </CardTitle>

              {/* Week navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}>
                  <Icon name="ChevronLeft" size={16} />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
                </span>
                <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
                  <Icon name="ChevronRight" size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                  Сегодня
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  className="text-sm border rounded px-2 py-1 bg-white"
                  value={filterEngineer === 'all' ? 'all' : String(filterEngineer)}
                  onChange={e => setFilterEngineer(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                  <option value="all">Все инженеры</option>
                  {ENGINEERS.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <select
                  className="text-sm border rounded px-2 py-1 bg-white"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as WOStatus | 'all')}
                >
                  <option value="all">Все статусы</option>
                  {(Object.keys(STATUS_LABELS) as WOStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto p-0">
            <table className="w-full border-collapse text-sm" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left w-28 font-semibold text-gray-600">
                    Инженер
                  </th>
                  {weekDates.map((d, i) => (
                    <th
                      key={i}
                      className={`border border-gray-200 px-2 py-2 text-center font-semibold w-1/7 ${
                        isToday(d) ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div>{DAY_NAMES[i]}</div>
                      <div className={`text-xs font-normal ${isToday(d) ? 'text-blue-500' : 'text-gray-400'}`}>
                        {formatDate(d)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleEngineers.map(eng => (
                  <tr key={eng.id} className="hover:bg-gray-50/50">
                    <td className="border border-gray-200 px-3 py-2 font-medium text-gray-700 bg-gray-50/60 align-top">
                      {eng.name}
                    </td>
                    {weekDates.map((_, dayIdx) => {
                      const cell = getCell(eng.id, dayIdx);
                      return (
                        <td
                          key={dayIdx}
                          className={`border border-gray-200 px-1 py-1 align-top ${
                            isToday(weekDates[dayIdx]) ? 'bg-blue-50/30' : ''
                          }`}
                          style={{ minHeight: 60 }}
                        >
                          {cell.map(wo => (
                            <WOBlock key={wo.id} wo={wo} onClick={() => setSelectedWO(wo)} />
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>

          {/* Legend */}
          <div className="px-4 py-2 border-t flex flex-wrap gap-3 text-xs text-gray-600">
            <span className="font-medium">Обозначения:</span>
            {(Object.keys(STATUS_LABELS) as WOStatus[]).map(s => (
              <span key={s} className="flex items-center gap-1">
                <span className={`inline-block w-3 h-3 rounded border-l-4 ${STATUS_COLORS[s]}`} />
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Unassigned sidebar */}
      <div className="w-64 flex-shrink-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Icon name="ClipboardList" size={16} />
              Не назначено
              <Badge variant="secondary" className="ml-auto">{UNASSIGNED_ORDERS.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-2 p-3">
            {UNASSIGNED_ORDERS.map(wo => (
              <div
                key={wo.id}
                className={`rounded-lg border p-2 text-xs ${
                  wo.status === 'emergency'
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {wo.status === 'emergency' && (
                  <div className="flex items-center gap-1 text-red-600 font-semibold mb-1">
                    <Icon name="AlertTriangle" size={12} />
                    Аварийный
                  </div>
                )}
                <div className="font-semibold text-gray-800">{wo.number}</div>
                <div className="text-gray-600 truncate">{wo.client}</div>
                <div className="text-gray-500 truncate">{wo.serviceType}</div>
                <div className="text-gray-400 truncate text-[10px]">{wo.notes}</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1.5 w-full h-6 text-xs"
                  onClick={() => setSelectedWO(wo)}
                >
                  Назначить
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedWO} onOpenChange={() => setSelectedWO(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FileText" size={18} />
              {selectedWO?.number}
            </DialogTitle>
          </DialogHeader>
          {selectedWO && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-500 text-xs">Клиент</div>
                  <div className="font-medium">{selectedWO.client}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Статус</div>
                  <Badge
                    className={`text-xs ${STATUS_COLORS[selectedWO.status]}`}
                    variant="outline"
                  >
                    {STATUS_LABELS[selectedWO.status]}
                  </Badge>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Инженер</div>
                  <div className="font-medium">
                    {selectedWO.engineerId
                      ? ENGINEERS.find(e => e.id === selectedWO.engineerId)?.name
                      : <span className="text-red-500">Не назначен</span>}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Тип работ</div>
                  <div className="font-medium">{selectedWO.serviceType}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500 text-xs">Адрес</div>
                  <div className="font-medium">{selectedWO.address}</div>
                </div>
                {selectedWO.timeStart && (
                  <div>
                    <div className="text-gray-500 text-xs">Время</div>
                    <div className="font-medium">{selectedWO.timeStart} — {selectedWO.timeEnd}</div>
                  </div>
                )}
                {selectedWO.dayIndex >= 0 && (
                  <div>
                    <div className="text-gray-500 text-xs">День недели</div>
                    <div className="font-medium">{DAY_NAMES[selectedWO.dayIndex]}</div>
                  </div>
                )}
                {selectedWO.notes && (
                  <div className="col-span-2">
                    <div className="text-gray-500 text-xs">Примечания</div>
                    <div className="text-gray-700">{selectedWO.notes}</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                {!selectedWO.engineerId && (
                  <Button size="sm" className="flex-1">
                    <Icon name="UserPlus" size={14} className="mr-1" />
                    Назначить инженера
                  </Button>
                )}
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedWO(null)}>
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
