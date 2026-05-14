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
type WOStatus = 'назначен' | 'выполняется' | 'завершён' | 'аварийный';

interface WorkOrderBlock {
  id: string;
  client: string;
  address: string;
  serviceType: string;
  status: WOStatus;
  engineerId: number;
  dayIndex: number;
  timeStart: string;
  timeEnd: string;
  notes: string;
}

interface Engineer {
  id: number;
  name: string;
}

interface UnassignedOrder {
  id: string;
  client: string;
  address: string;
  serviceType: string;
  priority: 'Срочно' | 'Обычный' | 'Аварийный';
}

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

const WORK_ORDERS: WorkOrderBlock[] = [
  { id: 'WO-2026-000201', client: 'ООО "МегаМолл"', address: 'ул. Ленина, 45', serviceType: 'Ремонт кондиционера', status: 'назначен', engineerId: 1, dayIndex: 0, timeStart: '09:00', timeEnd: '11:00', notes: 'Не охлаждает, ошибка E1' },
  { id: 'WO-2026-000202', client: 'АО "ПромСтрой"', address: 'пр. Победы, 12', serviceType: 'ТО сплит-системы', status: 'выполняется', engineerId: 1, dayIndex: 1, timeStart: '10:00', timeEnd: '12:30', notes: 'Плановое обслуживание' },
  { id: 'WO-2026-000203', client: 'ИП Соколов', address: 'ул. Садовая, 7', serviceType: 'Монтаж VRF', status: 'назначен', engineerId: 2, dayIndex: 0, timeStart: '08:00', timeEnd: '14:00', notes: 'Требуется лестница' },
  { id: 'WO-2026-000204', client: 'ООО "НоваФарм"', address: 'ул. Советская, 33', serviceType: 'Заправка хладагентом', status: 'завершён', engineerId: 2, dayIndex: 2, timeStart: '11:00', timeEnd: '12:00', notes: 'R-410A, 0.5 кг' },
  { id: 'WO-2026-000205', client: 'ПАО "СтройИнвест"', address: 'ул. Гагарина, 88', serviceType: 'Диагностика чиллера', status: 'аварийный', engineerId: 3, dayIndex: 0, timeStart: '07:00', timeEnd: '10:00', notes: 'Аварийная остановка, утечка' },
  { id: 'WO-2026-000206', client: 'ООО "Альфа-Центр"', address: 'пр. Мира, 55', serviceType: 'Ремонт вентиляции', status: 'назначен', engineerId: 3, dayIndex: 2, timeStart: '13:00', timeEnd: '15:00', notes: 'Шум в воздуховоде' },
  { id: 'WO-2026-000207', client: 'ООО "ТехноПлаза"', address: 'ул. Центральная, 1', serviceType: 'ТО VRF системы', status: 'выполняется', engineerId: 4, dayIndex: 1, timeStart: '09:00', timeEnd: '13:00', notes: 'Квартальное ТО' },
  { id: 'WO-2026-000208', client: 'ИП Смирнов', address: 'ул. Лесная, 22', serviceType: 'Монтаж сплит-системы', status: 'завершён', engineerId: 4, dayIndex: 3, timeStart: '10:00', timeEnd: '13:00', notes: 'Установка в спальне' },
  { id: 'WO-2026-000209', client: 'ООО "РиэлтиГрупп"', address: 'ул. Комсомольская, 14', serviceType: 'Гарантийный ремонт', status: 'назначен', engineerId: 5, dayIndex: 1, timeStart: '14:00', timeEnd: '16:00', notes: 'В рамках гарантии 2 года' },
  { id: 'WO-2026-000210', client: 'АО "МетроМолл"', address: 'пр. Октября, 99', serviceType: 'Диагностика системы', status: 'выполняется', engineerId: 5, dayIndex: 3, timeStart: '09:00', timeEnd: '11:00', notes: 'Проверка всех блоков' },
  { id: 'WO-2026-000211', client: 'ООО "ЭкоОфис"', address: 'ул. Парковая, 5', serviceType: 'Чистка фильтров', status: 'завершён', engineerId: 6, dayIndex: 0, timeStart: '11:00', timeEnd: '12:00', notes: 'Профилактика' },
  { id: 'WO-2026-000212', client: 'ПАО "ГлобалТех"', address: 'ул. Новая, 78', serviceType: 'Монтаж канального кондиционера', status: 'назначен', engineerId: 7, dayIndex: 2, timeStart: '08:00', timeEnd: '16:00', notes: 'Сложный монтаж, нужны 2 чел.' },
  { id: 'WO-2026-000213', client: 'ООО "СервисПлюс"', address: 'ул. Рабочая, 11', serviceType: 'Ремонт компрессора', status: 'аварийный', engineerId: 7, dayIndex: 4, timeStart: '09:00', timeEnd: '13:00', notes: 'Компрессор не запускается' },
  { id: 'WO-2026-000214', client: 'ООО "БизнесЦентр"', address: 'пр. Ленина, 200', serviceType: 'ТО холодильного оборудования', status: 'назначен', engineerId: 8, dayIndex: 1, timeStart: '10:00', timeEnd: '13:00', notes: 'Плановое ТО ежеквартальное' },
  { id: 'WO-2026-000215', client: 'ИП Кузнецова', address: 'ул. Молодёжная, 3', serviceType: 'Замена дренажного насоса', status: 'завершён', engineerId: 8, dayIndex: 3, timeStart: '14:00', timeEnd: '15:30', notes: 'Протекает поддон' },
];

const UNASSIGNED_ORDERS: UnassignedOrder[] = [
  { id: 'WO-2026-000216', client: 'ООО "ФудКорт"', address: 'ул. Торговая, 8', serviceType: 'Ремонт VRF', priority: 'Срочно' },
  { id: 'WO-2026-000217', client: 'АО "МедиаПарк"', address: 'пр. Свободы, 45', serviceType: 'Монтаж сплит-системы', priority: 'Обычный' },
  { id: 'WO-2026-000218', client: 'ООО "АрктикЛогистик"', address: 'ул. Промышленная, 17', serviceType: 'Диагностика холодильника', priority: 'Аварийный' },
  { id: 'WO-2026-000219', client: 'ИП Фёдоров', address: 'ул. Лесопарковая, 6', serviceType: 'ТО сплит-системы', priority: 'Обычный' },
  { id: 'WO-2026-000220', client: 'ООО "СтройМастер"', address: 'пр. Победы, 31', serviceType: 'Замена фреона', priority: 'Срочно' },
];

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

const STATUS_COLORS: Record<WOStatus, string> = {
  назначен: 'bg-blue-100 border-blue-400 text-blue-800',
  выполняется: 'bg-green-100 border-green-400 text-green-800',
  завершён: 'bg-gray-100 border-gray-400 text-gray-600',
  аварийный: 'bg-red-100 border-red-400 text-red-800',
};

const STATUS_BADGE: Record<WOStatus, string> = {
  назначен: 'bg-blue-500 text-white',
  выполняется: 'bg-green-500 text-white',
  завершён: 'bg-gray-400 text-white',
  аварийный: 'bg-red-500 text-white',
};

const PRIORITY_BADGE: Record<string, string> = {
  'Обычный': 'bg-gray-100 text-gray-700',
  'Срочно': 'bg-orange-100 text-orange-700',
  'Аварийный': 'bg-red-100 text-red-700',
};

export default function DispatchBoard() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedWO, setSelectedWO] = useState<WorkOrderBlock | null>(null);
  const [filterEngineer, setFilterEngineer] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<WOStatus | 'all'>('all');
  const [assignedIds, setAssignedIds] = useState<string[]>([]);

  const today = new Date();
  const monday = addDays(getMonday(today), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const filteredEngineers = filterEngineer === 'all' ? ENGINEERS : ENGINEERS.filter(e => e.id === filterEngineer);

  function getOrders(engineerId: number, dayIndex: number): WorkOrderBlock[] {
    return WORK_ORDERS.filter(wo => wo.engineerId === engineerId && wo.dayIndex === dayIndex && (filterStatus === 'all' || wo.status === filterStatus));
  }

  function handleAssign(orderId: string) {
    setAssignedIds(prev => [...prev, orderId]);
  }

  const unassignedVisible = UNASSIGNED_ORDERS.filter(o => !assignedIds.includes(o.id));

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}>
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <span className="font-semibold text-sm min-w-[180px] text-center">
            {formatDate(monday)} — {formatDate(addDays(monday, 6))}
          </span>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
            <Icon name="ChevronRight" size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Сегодня</Button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Icon name="Filter" size={15} className="text-gray-400" />
          <select className="text-sm border rounded px-2 py-1" value={filterEngineer === 'all' ? 'all' : filterEngineer} onChange={e => setFilterEngineer(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Все инженеры</option>
            {ENGINEERS.map(eng => <option key={eng.id} value={eng.id}>{eng.name}</option>)}
          </select>
          <select className="text-sm border rounded px-2 py-1" value={filterStatus} onChange={e => setFilterStatus(e.target.value as WOStatus | 'all')}>
            <option value="all">Все статусы</option>
            <option value="назначен">Назначен</option>
            <option value="выполняется">Выполняется</option>
            <option value="завершён">Завершён</option>
            <option value="аварийный">Аварийный</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 overflow-auto">
          <Card>
            <CardContent className="p-0">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold w-32 min-w-[128px]">Инженер</th>
                    {weekDays.map((day, i) => (
                      <th key={i} className={`border border-gray-200 px-2 py-2 text-center font-semibold min-w-[130px] ${isToday(day) ? 'bg-blue-50 text-blue-700' : i >= 5 ? 'text-gray-400' : ''}`}>
                        <div>{DAY_NAMES[i]}</div>
                        <div className="text-xs font-normal">{formatDate(day)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEngineers.map(eng => (
                    <tr key={eng.id} className="hover:bg-gray-50/50">
                      <td className="border border-gray-200 px-3 py-2 font-medium text-xs align-top bg-white">{eng.name}</td>
                      {weekDays.map((_, dayIdx) => {
                        const orders = getOrders(eng.id, dayIdx);
                        return (
                          <td key={dayIdx} className={`border border-gray-200 px-1 py-1 align-top min-h-[60px] ${dayIdx >= 5 ? 'bg-gray-50' : ''}`}>
                            <div className="flex flex-col gap-1">
                              {orders.map(wo => (
                                <button key={wo.id} onClick={() => setSelectedWO(wo)} className={`w-full text-left text-xs border rounded px-1.5 py-1 cursor-pointer hover:opacity-80 transition-opacity ${STATUS_COLORS[wo.status]}`}>
                                  <div className="font-semibold truncate">{wo.id.replace('WO-2026-', '#')}</div>
                                  <div className="truncate text-[10px] opacity-80">{wo.client.length > 16 ? wo.client.slice(0, 16) + '…' : wo.client}</div>
                                  <div className="text-[10px] opacity-70">{wo.timeStart}–{wo.timeEnd}</div>
                                </button>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
            {(Object.entries(STATUS_COLORS) as [WOStatus, string][]).map(([status, cls]) => (
              <span key={status} className="flex items-center gap-1.5">
                <span className={`inline-block w-3 h-3 rounded border ${cls}`} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            ))}
          </div>
        </div>

        <div className="w-64 shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="Clock" size={15} />
                Нераспределённые
                <Badge className="ml-auto bg-orange-100 text-orange-700 text-xs">{unassignedVisible.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {unassignedVisible.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Все наряды распределены</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {unassignedVisible.map(order => (
                    <div key={order.id} className="border rounded p-2 text-xs bg-white hover:bg-gray-50">
                      <div className="font-semibold text-gray-800">{order.id.replace('WO-2026-', '#')}</div>
                      <div className="text-gray-500 truncate">{order.client}</div>
                      <div className="text-gray-500 truncate text-[10px]">{order.serviceType}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_BADGE[order.priority]}`}>{order.priority}</span>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handleAssign(order.id)}>Назначить</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedWO} onOpenChange={() => setSelectedWO(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FileText" size={18} />
              {selectedWO?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedWO && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[selectedWO.status]}`}>
                  {selectedWO.status.charAt(0).toUpperCase() + selectedWO.status.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                <span className="text-gray-500">Клиент</span><span className="font-medium">{selectedWO.client}</span>
                <span className="text-gray-500">Адрес</span><span>{selectedWO.address}</span>
                <span className="text-gray-500">Инженер</span><span>{ENGINEERS.find(e => e.id === selectedWO.engineerId)?.name}</span>
                <span className="text-gray-500">Вид работ</span><span>{selectedWO.serviceType}</span>
                <span className="text-gray-500">Время</span><span>{selectedWO.timeStart} – {selectedWO.timeEnd}</span>
                <span className="text-gray-500">День недели</span><span>{DAY_NAMES[selectedWO.dayIndex]}</span>
                <span className="text-gray-500">Примечания</span><span className="text-gray-700">{selectedWO.notes}</span>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedWO(null)}>Закрыть</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
