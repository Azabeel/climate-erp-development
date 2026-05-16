import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ViewMode = 'day' | 'week' | 'month';
type Priority = 'normal' | 'urgent' | 'emergency';
type WorkType = 'repair' | 'maintenance' | 'installation' | 'warranty';
type WorkOrderStatus =
  | 'new'
  | 'assigned'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'awaiting_parts'
  | 'completed'
  | 'cancelled';

interface Engineer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

interface WorkOrder {
  id: string;
  number: string;
  engineerId: string;
  client: string;
  address: string;
  type: WorkType;
  status: WorkOrderStatus;
  priority: Priority;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:MM
  timeEnd: string; // HH:MM
  description: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const DAY_START = 7;  // 07:00
const DAY_END   = 20; // 20:00
const TOTAL_HRS = DAY_END - DAY_START; // 13 hours

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Петров А.В.',   initials: 'ПА', avatarColor: '#4f46e5' },
  { id: 'e2', name: 'Сидоров И.С.',  initials: 'СИ', avatarColor: '#0891b2' },
  { id: 'e3', name: 'Козлов Д.М.',   initials: 'КД', avatarColor: '#16a34a' },
  { id: 'e4', name: 'Морозова Е.К.', initials: 'МЕ', avatarColor: '#d97706' },
  { id: 'e5', name: 'Волков П.Н.',   initials: 'ВП', avatarColor: '#dc2626' },
  { id: 'e6', name: 'Новиков С.В.',  initials: 'НС', avatarColor: '#7c3aed' },
  { id: 'e7', name: 'Захаров Р.А.',  initials: 'ЗР', avatarColor: '#0f766e' },
  { id: 'e8', name: 'Лебедева О.П.', initials: 'ЛО', avatarColor: '#be185d' },
];

const ENGINEER_FILTER_OPTIONS = ['Все инженеры', ...ENGINEERS.map(e => e.name)];

const TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',          label: 'Все типы' },
  { value: 'repair',       label: 'Ремонт' },
  { value: 'maintenance',  label: 'ТО' },
  { value: 'installation', label: 'Монтаж' },
  { value: 'warranty',     label: 'Гарантия' },
];

// Priority colors
const PRIORITY_COLOR: Record<Priority, { bg: string; border: string; dot: string; text: string }> = {
  emergency: { bg: 'bg-red-100',    border: 'border-red-400',    dot: 'bg-red-500',    text: 'text-red-700' },
  urgent:    { bg: 'bg-orange-100', border: 'border-orange-400', dot: 'bg-orange-500', text: 'text-orange-700' },
  normal:    { bg: 'bg-blue-100',   border: 'border-blue-300',   dot: 'bg-blue-500',   text: 'text-blue-700' },
};

const TYPE_LABEL: Record<WorkType, string> = {
  repair:       'Ремонт',
  maintenance:  'ТО',
  installation: 'Монтаж',
  warranty:     'Гарантия',
};

const TYPE_COLOR: Record<WorkType, string> = {
  repair:       '#3B82F6',
  maintenance:  '#10B981',
  installation: '#F97316',
  warranty:     '#8B5CF6',
};

const STATUS_BADGE: Record<WorkOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new:            { label: 'Новый',          variant: 'secondary' },
  assigned:       { label: 'Назначен',       variant: 'outline' },
  en_route:       { label: 'В пути',         variant: 'default' },
  on_site:        { label: 'На объекте',     variant: 'default' },
  in_progress:    { label: 'В работе',       variant: 'default' },
  awaiting_parts: { label: 'Ожидает ЗИП',   variant: 'secondary' },
  completed:      { label: 'Выполнен',       variant: 'outline' },
  cancelled:      { label: 'Отменён',        variant: 'destructive' },
};

// ─────────────────────────────────────────────
// Mock data — 30+ orders across May 2026
// ─────────────────────────────────────────────

const WORK_ORDERS: WorkOrder[] = [
  // May 4 (Mon)
  { id: 'wo01', number: 'WO-2026-001001', engineerId: 'e1', client: 'ТЦ «Европейский»', address: 'пл. Киевского вокзала, 2', type: 'maintenance', status: 'completed', priority: 'normal', date: '2026-05-04', timeStart: '09:00', timeEnd: '12:00', description: 'Плановое ТО центральной VRF' },
  { id: 'wo02', number: 'WO-2026-001002', engineerId: 'e3', client: 'ООО «ТехПром»', address: 'ул. Электрозаводская, 21', type: 'repair', status: 'completed', priority: 'urgent', date: '2026-05-04', timeStart: '10:00', timeEnd: '14:00', description: 'Замена компрессора Mitsubishi' },
  { id: 'wo03', number: 'WO-2026-001003', engineerId: 'e5', client: 'БЦ «Нагатинский»', address: 'Нагатинская ул., 4', type: 'installation', status: 'completed', priority: 'normal', date: '2026-05-04', timeStart: '08:00', timeEnd: '17:00', description: 'Монтаж мультизональной системы' },
  // May 5
  { id: 'wo04', number: 'WO-2026-001004', engineerId: 'e2', client: 'Гостиница «Метрополь»', address: 'Театральный пр., 2', type: 'repair', status: 'completed', priority: 'emergency', date: '2026-05-05', timeStart: '07:00', timeEnd: '11:00', description: 'Аварийный ремонт чиллера York' },
  { id: 'wo05', number: 'WO-2026-001005', engineerId: 'e4', client: 'Клиника «Медцентр»', address: 'Ленинградский пр., 15', type: 'maintenance', status: 'completed', priority: 'normal', date: '2026-05-05', timeStart: '11:00', timeEnd: '14:00', description: 'Плановое ТО приточной вентиляции' },
  { id: 'wo06', number: 'WO-2026-001006', engineerId: 'e6', client: 'Ресторан «Белый Лебедь»', address: 'Тверская ул., 22', type: 'repair', status: 'completed', priority: 'urgent', date: '2026-05-05', timeStart: '15:00', timeEnd: '18:00', description: 'Ремонт канального кондиционера' },
  // May 6
  { id: 'wo07', number: 'WO-2026-001007', engineerId: 'e7', client: 'АО «Русский Стандарт»', address: 'Волгоградский пр., 43', type: 'warranty', status: 'completed', priority: 'normal', date: '2026-05-06', timeStart: '10:00', timeEnd: '12:00', description: 'Гарантийное обслуживание Daikin' },
  { id: 'wo08', number: 'WO-2026-001008', engineerId: 'e1', client: 'Офис «Интеграл»', address: 'Новый Арбат, 36', type: 'repair', status: 'completed', priority: 'normal', date: '2026-05-06', timeStart: '13:00', timeEnd: '16:00', description: 'Замена фреона R-410A' },
  // May 7
  { id: 'wo09', number: 'WO-2026-001009', engineerId: 'e8', client: 'Торговый Дом «Измайлово»', address: 'Измайловское ш., 71', type: 'installation', status: 'completed', priority: 'normal', date: '2026-05-07', timeStart: '08:00', timeEnd: '16:00', description: 'Монтаж кассетных кондиционеров (4 шт.)' },
  { id: 'wo10', number: 'WO-2026-001010', engineerId: 'e2', client: 'ООО «ПромСтрой»', address: 'Шарикоподшипниковская ул., 9', type: 'maintenance', status: 'completed', priority: 'normal', date: '2026-05-07', timeStart: '11:00', timeEnd: '13:00', description: 'Чистка фильтров и теплообменников' },
  // May 11 (Mon)
  { id: 'wo11', number: 'WO-2026-001011', engineerId: 'e3', client: 'Банк «Открытие»', address: 'Пресненская наб., 8', type: 'repair', status: 'completed', priority: 'urgent', date: '2026-05-11', timeStart: '09:00', timeEnd: '12:00', description: 'Ремонт прецизионного кондиционера' },
  { id: 'wo12', number: 'WO-2026-001012', engineerId: 'e5', client: 'МФЦ «Мои Документы»', address: 'Варшавское ш., 87', type: 'maintenance', status: 'completed', priority: 'normal', date: '2026-05-11', timeStart: '10:00', timeEnd: '13:30', description: 'Плановое ТО системы вентиляции' },
  // May 12
  { id: 'wo13', number: 'WO-2026-001013', engineerId: 'e1', client: 'Отель «Рэдиссон»', address: 'Кутузовский пр., 2/1', type: 'repair', status: 'completed', priority: 'emergency', date: '2026-05-12', timeStart: '07:30', timeEnd: '10:00', description: 'Аварийное отключение холодоснабжения' },
  { id: 'wo14', number: 'WO-2026-001014', engineerId: 'e4', client: 'Автосалон «АвтоДом»', address: 'Ленинградское ш., 58', type: 'installation', status: 'completed', priority: 'normal', date: '2026-05-12', timeStart: '09:00', timeEnd: '17:00', description: 'Монтаж системы вентиляции сервисной зоны' },
  { id: 'wo15', number: 'WO-2026-001015', engineerId: 'e6', client: 'Кофейня «ДабъЛ Б»', address: 'Никольская ул., 10', type: 'warranty', status: 'completed', priority: 'normal', date: '2026-05-12', timeStart: '14:00', timeEnd: '16:00', description: 'Гарантийная замена платы управления' },
  // May 13
  { id: 'wo16', number: 'WO-2026-001016', engineerId: 'e7', client: 'ЖК «Суббота»', address: 'Нижегородская ул., 32', type: 'repair', status: 'completed', priority: 'urgent', date: '2026-05-13', timeStart: '10:00', timeEnd: '14:00', description: 'Ремонт централизованной системы ГВС' },
  { id: 'wo17', number: 'WO-2026-001017', engineerId: 'e2', client: 'Супермаркет «Перекрёсток»', address: 'Профсоюзная ул., 114', type: 'maintenance', status: 'completed', priority: 'normal', date: '2026-05-13', timeStart: '08:00', timeEnd: '11:00', description: 'ТО холодильного оборудования' },
  // May 14
  { id: 'wo18', number: 'WO-2026-001018', engineerId: 'e8', client: 'ООО «КлиматСтрой»', address: 'Рязанский пр., 86', type: 'installation', status: 'completed', priority: 'normal', date: '2026-05-14', timeStart: '09:00', timeEnd: '18:00', description: 'Монтаж VRV-системы Daikin' },
  { id: 'wo19', number: 'WO-2026-001019', engineerId: 'e3', client: 'Ресторан «Хинкальная»', address: 'Садовая-Кудринская ул., 6', type: 'repair', status: 'completed', priority: 'urgent', date: '2026-05-14', timeStart: '11:00', timeEnd: '14:00', description: 'Ремонт вытяжной системы кухни' },
  // May 15 (Fri — current week)
  { id: 'wo20', number: 'WO-2026-001020', engineerId: 'e1', client: 'БЦ «Москва-Сити»', address: 'Пресненская наб., 12', type: 'maintenance', status: 'in_progress', priority: 'normal', date: '2026-05-15', timeStart: '09:00', timeEnd: '12:00', description: 'ТО системы кондиционирования 45 эт.' },
  { id: 'wo21', number: 'WO-2026-001021', engineerId: 'e2', client: 'Гостиница «Хилтон»', address: 'Новинский бульв., 8', type: 'repair', status: 'en_route', priority: 'emergency', date: '2026-05-15', timeStart: '08:00', timeEnd: '10:00', description: 'Авария в серверной — кондиционер' },
  { id: 'wo22', number: 'WO-2026-001022', engineerId: 'e4', client: 'Офис Яндекс', address: 'Льва Толстого ул., 16', type: 'maintenance', status: 'assigned', priority: 'normal', date: '2026-05-15', timeStart: '13:00', timeEnd: '15:00', description: 'Плановое ТО 3-го этажа' },
  { id: 'wo23', number: 'WO-2026-001023', engineerId: 'e5', client: 'ТРЦ «Афимолл»', address: 'Пресненская наб., 2', type: 'installation', status: 'in_progress', priority: 'urgent', date: '2026-05-15', timeStart: '10:00', timeEnd: '17:00', description: 'Монтаж кондиционеров новых секций' },
  { id: 'wo24', number: 'WO-2026-001024', engineerId: 'e6', client: 'Клиника «ЕМС»', address: 'Щепкина ул., 35', type: 'repair', status: 'awaiting_parts', priority: 'urgent', date: '2026-05-15', timeStart: '11:00', timeEnd: '13:00', description: 'Замена вентилятора в АХУ' },
  { id: 'wo25', number: 'WO-2026-001025', engineerId: 'e7', client: 'Склад «Логистик-М»', address: 'Промышленная зона Северянин', type: 'maintenance', status: 'new', priority: 'normal', date: '2026-05-15', timeStart: '14:00', timeEnd: '16:00', description: 'ТО промышленных кондиционеров' },
  // May 19 (Mon)
  { id: 'wo26', number: 'WO-2026-001026', engineerId: 'e3', client: 'ООО «НефтьТрейд»', address: 'Краснопресненская наб., 12', type: 'repair', status: 'new', priority: 'urgent', date: '2026-05-19', timeStart: '09:00', timeEnd: '13:00', description: 'Ремонт прецизионного кондиционера' },
  { id: 'wo27', number: 'WO-2026-001027', engineerId: 'e8', client: 'Сбербанк офис', address: 'Вавилова ул., 19', type: 'maintenance', status: 'new', priority: 'normal', date: '2026-05-19', timeStart: '10:00', timeEnd: '12:00', description: 'Плановое ТО серверной комнаты' },
  // May 20
  { id: 'wo28', number: 'WO-2026-001028', engineerId: 'e1', client: 'ТЦ «Мега Белая Дача»', address: 'Покровская ул., 2', type: 'installation', status: 'new', priority: 'normal', date: '2026-05-20', timeStart: '08:00', timeEnd: '17:00', description: 'Монтаж системы вентиляции пристройки' },
  { id: 'wo29', number: 'WO-2026-001029', engineerId: 'e4', client: 'Фитнес-клуб «X-Fit»', address: 'Волоколамское ш., 73', type: 'repair', status: 'new', priority: 'urgent', date: '2026-05-20', timeStart: '11:00', timeEnd: '14:00', description: 'Ремонт осушителя воздуха бассейна' },
  // May 22
  { id: 'wo30', number: 'WO-2026-001030', engineerId: 'e5', client: 'МГУ 1-й корпус', address: 'Воробьёвы горы, 1', type: 'maintenance', status: 'new', priority: 'normal', date: '2026-05-22', timeStart: '09:00', timeEnd: '13:00', description: 'ТО систем центрального кондиционирования' },
  { id: 'wo31', number: 'WO-2026-001031', engineerId: 'e2', client: 'ДЦ «Павелецкий»', address: 'Дубининская ул., 57', type: 'warranty', status: 'new', priority: 'normal', date: '2026-05-22', timeStart: '14:00', timeEnd: '16:30', description: 'Гарантийное ТО после монтажа' },
  // May 26 (Mon)
  { id: 'wo32', number: 'WO-2026-001032', engineerId: 'e6', client: 'Завод «ЗиЛ»', address: 'Автозаводская ул., 23', type: 'repair', status: 'new', priority: 'emergency', date: '2026-05-26', timeStart: '07:00', timeEnd: '11:00', description: 'Аварийный ремонт промышленного чиллера' },
  { id: 'wo33', number: 'WO-2026-001033', engineerId: 'e7', client: 'Офис Mail.ru', address: 'Лейтенанта Шмидта ул., 3', type: 'maintenance', status: 'new', priority: 'normal', date: '2026-05-27', timeStart: '10:00', timeEnd: '13:00', description: 'Плановое ТО 5 зон кондиционирования' },
  { id: 'wo34', number: 'WO-2026-001034', engineerId: 'e8', client: 'Аэропорт Внуково', address: 'Внуково, терм. A', type: 'installation', status: 'new', priority: 'normal', date: '2026-05-28', timeStart: '08:00', timeEnd: '18:00', description: 'Монтаж кондиционеров вылетного зала' },
  { id: 'wo35', number: 'WO-2026-001035', engineerId: 'e1', client: 'Больница им. Боткина', address: 'Боткинский пр., 2', type: 'repair', status: 'new', priority: 'emergency', date: '2026-05-29', timeStart: '07:00', timeEnd: '09:00', description: 'Аварийный ремонт системы палатного отделения' },
];

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

function timeToPercent(t: string): number {
  return ((parseTime(t) - DAY_START) / TOTAL_HRS) * 100;
}

function durationPercent(start: string, end: string): number {
  return ((parseTime(end) - parseTime(start)) / TOTAL_HRS) * 100;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function getDayLoadPercent(dayOrders: WorkOrder[]): number {
  const totalMinutes = dayOrders.reduce((acc, o) => {
    return acc + (parseTime(o.timeEnd) - parseTime(o.timeStart)) * 60;
  }, 0);
  const maxMinutes = ENGINEERS.length * TOTAL_HRS * 60;
  return Math.round((totalMinutes / maxMinutes) * 100);
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface RightPanelProps {
  date: Date | null;
  orders: WorkOrder[];
  onClose: () => void;
}

const RightPanel = ({ date, orders, onClose }: RightPanelProps) => {
  if (!date) return null;

  const label = date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex-shrink-0 w-[350px] bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 capitalize">{label}</p>
          <p className="text-sm font-semibold text-gray-900">{orders.length} нарядов</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => toast.success('Открыта форма создания нового наряда')}
          >
            <Icon name="Plus" size={13} className="mr-1" />
            Добавить
          </Button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <Icon name="X" size={15} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {orders.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">
            <Icon name="Calendar" size={32} className="mx-auto mb-2 text-gray-200" />
            Нет нарядов на этот день
          </div>
        )}
        {orders
          .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
          .map(order => {
            const eng = ENGINEERS.find(e => e.id === order.engineerId);
            const pc = PRIORITY_COLOR[order.priority];
            const st = STATUS_BADGE[order.status];
            return (
              <div
                key={order.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${pc.border}`}
                onClick={() => toast.info(`Наряд ${order.number}: ${order.description}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{order.number.split('-').slice(-1)[0]}</span>
                  <Badge variant={st.variant} className="text-[10px] px-1.5 py-0">
                    {st.label}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-0.5 leading-snug">{order.client}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Icon name="Clock" size={11} />
                  <span>{order.timeStart}–{order.timeEnd}</span>
                  <span className="text-gray-300">·</span>
                  <span
                    className="font-medium"
                    style={{ color: TYPE_COLOR[order.type] }}
                  >
                    {TYPE_LABEL[order.type]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Icon name="MapPin" size={11} />
                  <span className="truncate">{order.address}</span>
                </div>
                {eng && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: eng.avatarColor }}
                    >
                      {eng.initials[0]}
                    </div>
                    <span className="text-xs text-gray-500">{eng.name}</span>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Month View
// ─────────────────────────────────────────────

interface MonthViewProps {
  year: number;
  month: number; // 0-based
  orders: WorkOrder[];
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
}

const MonthView = ({ year, month, orders, selectedDate, onSelectDate }: MonthViewProps) => {
  const firstDay = new Date(year, month, 1);
  // Monday-based: getDay() returns 0=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const today = toDateString(new Date());
  const selectedStr = selectedDate ? toDateString(selectedDate) : null;

  const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEK_LABELS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* Cells grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {Array.from({ length: totalCells }, (_, idx) => {
          const dayNum = idx - startOffset + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return <div key={idx} className="border-r border-b border-gray-100 bg-gray-50/50" />;
          }

          const cellDate = new Date(year, month, dayNum);
          const dateStr = toDateString(cellDate);
          const dayOrders = orders.filter(o => o.date === dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedStr;
          const isWeekend = (idx % 7) >= 5;

          // Group orders by priority for dots
          const emergency = dayOrders.filter(o => o.priority === 'emergency');
          const urgent = dayOrders.filter(o => o.priority === 'urgent');
          const normal = dayOrders.filter(o => o.priority === 'normal');

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(cellDate)}
              className={`
                border-r border-b border-gray-100 p-1.5 cursor-pointer transition-colors min-h-[80px]
                ${isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : 'hover:bg-gray-50'}
                ${isWeekend && !isSelected ? 'bg-slate-50/70' : ''}
              `}
            >
              {/* Day number */}
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`
                    text-sm font-medium leading-none inline-flex items-center justify-center w-6 h-6 rounded-full
                    ${isToday ? 'bg-blue-600 text-white' : isSelected ? 'text-blue-700' : isWeekend ? 'text-gray-400' : 'text-gray-700'}
                  `}
                >
                  {dayNum}
                </span>
                {dayOrders.length > 0 && (
                  <span className="text-[10px] text-gray-400">{dayOrders.length}</span>
                )}
              </div>

              {/* Priority dots */}
              {dayOrders.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {emergency.length > 0 && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      {emergency.length > 1 && <span className="text-[10px] text-red-600 font-medium">{emergency.length}</span>}
                    </div>
                  )}
                  {urgent.length > 0 && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                      {urgent.length > 1 && <span className="text-[10px] text-orange-600 font-medium">{urgent.length}</span>}
                    </div>
                  )}
                  {normal.length > 0 && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      {normal.length > 1 && <span className="text-[10px] text-blue-600 font-medium">{normal.length}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Week View
// ─────────────────────────────────────────────

interface WeekViewProps {
  weekDates: Date[];
  orders: WorkOrder[];
  onSelectDate: (d: Date) => void;
}

const WeekView = ({ weekDates, orders, onSelectDate }: WeekViewProps) => {
  const today = toDateString(new Date());
  const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200">
      {/* Header: engineers label + day columns */}
      <div
        className="grid sticky top-0 z-10 bg-white border-b border-gray-200"
        style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}
      >
        <div className="px-3 py-2 text-xs font-medium text-gray-400 border-r border-gray-100">
          Инженер
        </div>
        {weekDates.map((d, idx) => {
          const ds = toDateString(d);
          const isToday = ds === today;
          const dayOrders = orders.filter(o => o.date === ds);
          return (
            <div
              key={ds}
              onClick={() => onSelectDate(d)}
              className={`px-2 py-2 text-center border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}
            >
              <div className="text-xs text-gray-400">{DAY_LABELS[idx]}</div>
              <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {d.getDate()}
              </div>
              {dayOrders.length > 0 && (
                <div className="text-[10px] text-gray-400">{dayOrders.length} нар.</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Engineer rows */}
      {ENGINEERS.map(eng => {
        return (
          <div
            key={eng.id}
            className="grid border-b border-gray-100 last:border-b-0"
            style={{ gridTemplateColumns: '160px repeat(7, 1fr)', minHeight: '72px' }}
          >
            {/* Engineer name */}
            <div className="flex items-center gap-2 px-3 py-2 border-r border-gray-100">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: eng.avatarColor }}
              >
                {eng.initials}
              </div>
              <span className="text-xs text-gray-700 leading-tight">{eng.name}</span>
            </div>

            {/* Day cells */}
            {weekDates.map(d => {
              const ds = toDateString(d);
              const isToday = ds === today;
              const cellOrders = orders.filter(o => o.date === ds && o.engineerId === eng.id);

              return (
                <div
                  key={ds}
                  className={`border-r border-gray-100 last:border-r-0 p-1 flex flex-col gap-1 ${isToday ? 'bg-blue-50/40' : ''}`}
                >
                  {cellOrders.map(order => {
                    const pc = PRIORITY_COLOR[order.priority];
                    return (
                      <div
                        key={order.id}
                        onClick={() => toast.info(`${order.number} · ${order.client}`)}
                        className={`text-[10px] leading-tight px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity border ${pc.bg} ${pc.border} ${pc.text}`}
                      >
                        <div className="font-semibold truncate">{order.client}</div>
                        <div className="text-gray-500">{order.timeStart}–{order.timeEnd}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Load summary row */}
      <div
        className="grid bg-gray-50 border-t border-gray-200 sticky bottom-0"
        style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}
      >
        <div className="px-3 py-2 text-xs font-medium text-gray-500 border-r border-gray-100">
          Загрузка дня
        </div>
        {weekDates.map(d => {
          const ds = toDateString(d);
          const dayOrders = orders.filter(o => o.date === ds);
          const load = getDayLoadPercent(dayOrders);
          const loadColor = load >= 80 ? 'text-red-600' : load >= 50 ? 'text-orange-500' : 'text-green-600';
          return (
            <div key={ds} className="px-2 py-2 text-center border-r border-gray-100 last:border-r-0">
              <div className={`text-xs font-bold ${loadColor}`}>{load}%</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div
                  className={`h-1 rounded-full transition-all ${load >= 80 ? 'bg-red-500' : load >= 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(load, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Day View
// ─────────────────────────────────────────────

interface DayViewProps {
  date: Date;
  orders: WorkOrder[];
}

const HOUR_LABELS = Array.from({ length: TOTAL_HRS + 1 }, (_, i) =>
  `${String(DAY_START + i).padStart(2, '0')}:00`
);

const DayView = ({ date: _date, orders }: DayViewProps) => {
  const ROW_H = 72; // px per engineer row
  const LEFT_W = 160; // px for engineer column
  const LABEL_W = 48; // px for hour labels

  return (
    <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200">
      {/* Sticky header: time labels + engineer names */}
      <div
        className="grid sticky top-0 z-10 bg-white border-b border-gray-200"
        style={{ gridTemplateColumns: `${LABEL_W}px ${LEFT_W}px 1fr` }}
      >
        <div className="border-r border-gray-100" />
        <div className="px-3 py-2 text-xs font-medium text-gray-400 border-r border-gray-100">
          Инженер
        </div>
        {/* Timeline header */}
        <div className="relative overflow-hidden" style={{ height: 36 }}>
          {HOUR_LABELS.slice(0, -1).map((label, i) => (
            <span
              key={label}
              className="absolute text-[10px] text-gray-300 top-2"
              style={{ left: `calc(${(i / TOTAL_HRS) * 100}% + 2px)` }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Engineer rows */}
      {ENGINEERS.map(eng => {
        const engOrders = orders.filter(o => o.engineerId === eng.id);

        return (
          <div
            key={eng.id}
            className="grid border-b border-gray-100 last:border-b-0"
            style={{ gridTemplateColumns: `${LABEL_W}px ${LEFT_W}px 1fr`, height: ROW_H }}
          >
            {/* Hour ruler column */}
            <div className="border-r border-gray-100 relative">
              {HOUR_LABELS.map((_, i) => (
                <div
                  key={i}
                  className="absolute border-r border-gray-100 h-full"
                  style={{ left: `${(i / TOTAL_HRS) * 100}%`, top: 0, width: 1 }}
                />
              ))}
            </div>

            {/* Engineer label */}
            <div className="flex items-center gap-2 px-3 border-r border-gray-100">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: eng.avatarColor }}
              >
                {eng.initials}
              </div>
              <span className="text-xs text-gray-700 leading-tight">{eng.name}</span>
            </div>

            {/* Timeline bar */}
            <div
              className="relative cursor-pointer"
              onClick={() => toast.info(`Добавить наряд инженеру ${eng.name}`)}
            >
              {/* Hour grid lines */}
              {HOUR_LABELS.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-100"
                  style={{ left: `${(i / TOTAL_HRS) * 100}%` }}
                />
              ))}

              {/* Order blocks */}
              {engOrders.map(order => {
                const left = timeToPercent(order.timeStart);
                const width = durationPercent(order.timeStart, order.timeEnd);
                const pc = PRIORITY_COLOR[order.priority];

                return (
                  <div
                    key={order.id}
                    className={`absolute top-1 bottom-1 rounded overflow-hidden border ${pc.bg} ${pc.border} hover:opacity-90 transition-opacity z-10`}
                    style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                    onClick={e => {
                      e.stopPropagation();
                      toast.info(`${order.number} · ${order.client} · ${order.timeStart}–${order.timeEnd}`);
                    }}
                  >
                    <div className={`px-1.5 py-0.5 h-full flex flex-col justify-center overflow-hidden`}>
                      <div className={`text-[10px] font-semibold truncate ${pc.text}`}>
                        {order.client}
                      </div>
                      {width > 8 && (
                        <div className="text-[9px] text-gray-500 truncate">
                          {order.address}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

const ServiceCalendarFull = () => {
  // "Today" in the context of this ERP is 2026-05-15
  const TODAY = new Date('2026-05-15');

  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-05-01'));
  const [selectedDate, setSelectedDate] = useState<Date | null>(TODAY);
  const [engineerFilter, setEngineerFilter] = useState('Все инженеры');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return WORK_ORDERS.filter(o => {
      const engMatch =
        engineerFilter === 'Все инженеры' ||
        ENGINEERS.find(e => e.id === o.engineerId)?.name === engineerFilter;
      const typeMatch = typeFilter === 'all' || o.type === typeFilter;
      return engMatch && typeMatch;
    });
  }, [engineerFilter, typeFilter]);

  // Week dates for week view
  const weekDates = useMemo(() => {
    const monday = getMondayOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [currentDate]);

  // Selected day orders for right panel
  const selectedDayOrders = useMemo(() => {
    if (!selectedDate) return [];
    const ds = toDateString(selectedDate);
    return filteredOrders.filter(o => o.date === ds);
  }, [selectedDate, filteredOrders]);

  // Navigation
  const navigate = (direction: -1 | 1) => {
    setCurrentDate(prev => {
      if (view === 'month') {
        const d = new Date(prev);
        d.setMonth(d.getMonth() + direction);
        return d;
      }
      if (view === 'week') {
        return addDays(prev, direction * 7);
      }
      // day
      return addDays(prev, direction);
    });
  };

  const goToday = () => {
    setCurrentDate(view === 'month' ? new Date('2026-05-01') : TODAY);
    setSelectedDate(TODAY);
  };

  // Header label
  const headerLabel = useMemo(() => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
      const mon = weekDates[0];
      const sun = weekDates[6];
      return `${mon.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — ${sun.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [view, currentDate, weekDates]);

  // Priority legend
  const LEGEND = [
    { color: 'bg-red-500',    label: 'Аварийный' },
    { color: 'bg-orange-500', label: 'Срочный' },
    { color: 'bg-blue-400',   label: 'Обычный' },
  ];

  const TYPE_LEGEND = Object.entries(TYPE_COLOR).map(([type, color]) => ({
    color,
    label: TYPE_LABEL[type as WorkType],
  }));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Icon name="ChevronLeft" size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Icon name="ChevronRight" size={16} className="text-gray-500" />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            Сегодня
          </button>
          <span className="text-sm font-semibold text-gray-900 capitalize min-w-[200px]">
            {headerLabel}
          </span>
        </div>

        {/* Center: filters */}
        <div className="flex items-center gap-2">
          <select
            value={engineerFilter}
            onChange={e => setEngineerFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            {ENGINEER_FILTER_OPTIONS.map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            {TYPE_FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Right: view switcher + add */}
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(['month', 'week', 'day'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => {
                  setView(v);
                  if (v === 'day' && !selectedDate) setCurrentDate(TODAY);
                  else if (v === 'day' && selectedDate) setCurrentDate(selectedDate);
                }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === v ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {v === 'month' ? 'Месяц' : v === 'week' ? 'Неделя' : 'День'}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => toast.success('Открыта форма создания нового наряда')}
          >
            <Icon name="Plus" size={14} className="mr-1.5" />
            Добавить наряд
          </Button>
        </div>
      </div>

      {/* ── Legend bar ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-6">
        <span className="text-xs text-gray-400 font-medium">Приоритет:</span>
        {LEGEND.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span className="text-xs text-gray-500">{l.label}</span>
          </div>
        ))}
        <span className="text-xs text-gray-300 mx-1">|</span>
        <span className="text-xs text-gray-400 font-medium">Тип:</span>
        {TYPE_LEGEND.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: l.color }} />
            <span className="text-xs text-gray-500">{l.label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          Показано: <strong className="text-gray-700">{filteredOrders.length}</strong> нарядов
        </span>
      </div>

      {/* ── Main content area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar area */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          {view === 'month' && (
            <MonthView
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              orders={filteredOrders}
              selectedDate={selectedDate}
              onSelectDate={d => setSelectedDate(d)}
            />
          )}
          {view === 'week' && (
            <WeekView
              weekDates={weekDates}
              orders={filteredOrders}
              onSelectDate={d => setSelectedDate(d)}
            />
          )}
          {view === 'day' && (
            <DayView
              date={currentDate}
              orders={filteredOrders.filter(o => o.date === toDateString(currentDate))}
            />
          )}
        </div>

        {/* Right panel */}
        {selectedDate && (
          <RightPanel
            date={selectedDate}
            orders={selectedDayOrders}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceCalendarFull;
