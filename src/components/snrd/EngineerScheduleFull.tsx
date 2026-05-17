import { useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type WorkType = 'maintenance' | 'installation' | 'repair' | 'emergency' | 'day_off';
type OrderStatus = 'assigned' | 'in_progress' | 'completed' | 'en_route';
type AbsenceType = 'vacation' | 'sick';

interface Engineer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  statusToday: 'working' | 'on_site' | 'en_route' | 'day_off';
  phone: string;
}

interface WorkOrder {
  id: string;
  number: string;
  engineerId: string;
  dayIndex: number; // 0=Mon … 6=Sun
  timeStart: string; // HH:MM
  timeEnd: string;
  type: WorkType;
  client: string;
  address: string;
  status: OrderStatus;
  description: string;
}

interface SelectedBlock {
  order: WorkOrder;
  anchorRect: DOMRect;
}

// ─────────────────────────────────────────────
// Constants & data
// ─────────────────────────────────────────────

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DAY_DATES  = ['12', '13', '14', '15', '16', '17', '18'];
const MONTHS     = 'мая 2026';

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Алексей Воронов',   initials: 'АВ', avatarColor: '#3b82f6', statusToday: 'on_site',   phone: '+7 900 111-22-33' },
  { id: 'e2', name: 'Дмитрий Козлов',    initials: 'ДК', avatarColor: '#10b981', statusToday: 'en_route',  phone: '+7 900 222-33-44' },
  { id: 'e3', name: 'Сергей Петров',     initials: 'СП', avatarColor: '#f59e0b', statusToday: 'working',   phone: '+7 900 333-44-55' },
  { id: 'e4', name: 'Иван Новиков',      initials: 'ИН', avatarColor: '#8b5cf6', statusToday: 'working',   phone: '+7 900 444-55-66' },
  { id: 'e5', name: 'Михаил Семёнов',    initials: 'МС', avatarColor: '#ef4444', statusToday: 'day_off',   phone: '+7 900 555-66-77' },
  { id: 'e6', name: 'Андрей Захаров',    initials: 'АЗ', avatarColor: '#06b6d4', statusToday: 'on_site',   phone: '+7 900 666-77-88' },
  { id: 'e7', name: 'Павел Морозов',     initials: 'ПМ', avatarColor: '#f97316', statusToday: 'working',   phone: '+7 900 777-88-99' },
  { id: 'e8', name: 'Николай Соколов',   initials: 'НС', avatarColor: '#84cc16', statusToday: 'en_route',  phone: '+7 900 888-99-00' },
];

const WORK_ORDERS: WorkOrder[] = [
  // Алексей Воронов (e1)
  { id: 'o1',  number: 'WO-2026-000101', engineerId: 'e1', dayIndex: 0, timeStart: '09:00', timeEnd: '11:00', type: 'maintenance',  client: 'ООО «Прогресс»',         address: 'ул. Ленина, 45',     status: 'completed',   description: 'Плановое ТО сплит-системы LG 12000 BTU' },
  { id: 'o2',  number: 'WO-2026-000102', engineerId: 'e1', dayIndex: 0, timeStart: '13:00', timeEnd: '15:00', type: 'repair',       client: 'ИП Смирнова А.В.',       address: 'пр. Мира, 12',       status: 'completed',   description: 'Ремонт компрессора кондиционера' },
  { id: 'o3',  number: 'WO-2026-000103', engineerId: 'e1', dayIndex: 1, timeStart: '10:00', timeEnd: '13:00', type: 'installation', client: 'ЖК «Солнечный»',         address: 'ул. Садовая, 7',     status: 'in_progress', description: 'Монтаж мульти-сплит системы Mitsubishi 3×9000' },
  { id: 'o4',  number: 'WO-2026-000104', engineerId: 'e1', dayIndex: 2, timeStart: '09:00', timeEnd: '10:30', type: 'maintenance',  client: 'Банк «Финанс»',           address: 'пл. Победы, 1',      status: 'assigned',    description: 'ТО чиллера Daikin, фильтры, хладагент' },
  { id: 'o5',  number: 'WO-2026-000105', engineerId: 'e1', dayIndex: 3, timeStart: '11:00', timeEnd: '13:00', type: 'repair',       client: 'Ресторан «Арбат»',       address: 'ул. Кирова, 33',     status: 'assigned',    description: 'Не работает охлаждение, утечка хладагента' },
  { id: 'o6',  number: 'WO-2026-000106', engineerId: 'e1', dayIndex: 4, timeStart: '14:00', timeEnd: '16:00', type: 'maintenance',  client: 'Офис ГК «Стройком»',     address: 'бул. Строителей, 9', status: 'assigned',    description: 'Ежеквартальное ТО по договору' },

  // Дмитрий Козлов (e2)
  { id: 'o7',  number: 'WO-2026-000107', engineerId: 'e2', dayIndex: 0, timeStart: '08:00', timeEnd: '10:00', type: 'installation', client: 'ТЦ «Меридиан»',          address: 'ш. Энтузиастов, 21', status: 'completed',   description: 'Монтаж канального кондиционера Haier' },
  { id: 'o8',  number: 'WO-2026-000108', engineerId: 'e2', dayIndex: 1, timeStart: '09:30', timeEnd: '11:00', type: 'maintenance',  client: 'Клиника «МедЦентр»',     address: 'ул. Врачей, 5',      status: 'assigned',    description: 'ТО медицинского климатического оборудования' },
  { id: 'o9',  number: 'WO-2026-000109', engineerId: 'e2', dayIndex: 1, timeStart: '13:00', timeEnd: '14:30', type: 'repair',       client: 'ИП Петров Н.М.',         address: 'пр. Победы, 88',     status: 'assigned',    description: 'Шумит наружный блок, требует балансировки' },
  { id: 'o10', number: 'WO-2026-000110', engineerId: 'e2', dayIndex: 2, timeStart: '10:00', timeEnd: '12:00', type: 'emergency',    client: 'Серверная ПАО «Сбер»',   address: 'ул. Банковская, 3',  status: 'in_progress', description: 'АВАРИЙНЫЙ: отказ прецизионного кондиционера' },
  { id: 'o11', number: 'WO-2026-000111', engineerId: 'e2', dayIndex: 3, timeStart: '09:00', timeEnd: '11:00', type: 'installation', client: 'Жилой дом',              address: 'ул. Молодёжная, 14', status: 'assigned',    description: 'Монтаж 2 сплит-систем в квартире' },
  { id: 'o12', number: 'WO-2026-000112', engineerId: 'e2', dayIndex: 4, timeStart: '11:00', timeEnd: '13:00', type: 'maintenance',  client: 'Фитнес «Energy»',        address: 'пр. Спортивный, 4',  status: 'assigned',    description: 'ТО вентиляции бассейна' },

  // Сергей Петров (e3)
  { id: 'o13', number: 'WO-2026-000113', engineerId: 'e3', dayIndex: 0, timeStart: '09:00', timeEnd: '12:00', type: 'installation', client: 'ООО «АгроТех»',          address: 'ул. Полевая, 2',     status: 'completed',   description: 'Монтаж промышленного чиллера 40 кВт' },
  { id: 'o14', number: 'WO-2026-000114', engineerId: 'e3', dayIndex: 1, timeStart: '14:00', timeEnd: '16:00', type: 'repair',       client: 'Гостиница «Визит»',      address: 'пл. Вокзальная, 1',  status: 'assigned',    description: 'Ремонт фанкойлов в номерах 201-210' },
  { id: 'o15', number: 'WO-2026-000115', engineerId: 'e3', dayIndex: 2, timeStart: '10:00', timeEnd: '11:30', type: 'maintenance',  client: 'Аптека «Здоровье»',      address: 'ул. Советская, 56',  status: 'assigned',    description: 'ТО холодильного оборудования' },
  { id: 'o16', number: 'WO-2026-000116', engineerId: 'e3', dayIndex: 3, timeStart: '13:00', timeEnd: '15:00', type: 'installation', client: 'Кафе «Уют»',             address: 'ул. Тихая, 8',       status: 'assigned',    description: 'Монтаж вытяжной вентиляции на кухне' },
  { id: 'o17', number: 'WO-2026-000117', engineerId: 'e3', dayIndex: 4, timeStart: '09:00', timeEnd: '10:30', type: 'maintenance',  client: 'Офис ООО «ТехСервис»',  address: 'бул. Центральный, 5',status: 'assigned',    description: 'Плановое ТО, замена фильтров' },
  { id: 'o18', number: 'WO-2026-000118', engineerId: 'e3', dayIndex: 5, timeStart: '10:00', timeEnd: '12:00', type: 'repair',       client: 'ИП Иванов',              address: 'пос. Южный, 14',     status: 'assigned',    description: 'Не холодит, диагностика' },

  // Иван Новиков (e4)
  { id: 'o19', number: 'WO-2026-000119', engineerId: 'e4', dayIndex: 0, timeStart: '11:00', timeEnd: '13:00', type: 'repair',       client: 'Завод «МеталлПром»',     address: 'пр. Заводской, 100', status: 'completed',   description: 'Ремонт промышленной вентиляции цеха №3' },
  { id: 'o20', number: 'WO-2026-000120', engineerId: 'e4', dayIndex: 1, timeStart: '09:00', timeEnd: '11:00', type: 'maintenance',  client: 'ТРЦ «Планета»',          address: 'ул. Торговая, 22',   status: 'assigned',    description: 'ТО 12 внутренних блоков VRF системы' },
  { id: 'o21', number: 'WO-2026-000121', engineerId: 'e4', dayIndex: 2, timeStart: '14:00', timeEnd: '16:30', type: 'installation', client: 'Склад ООО «Логист»',     address: 'ш. Московское, 5',   status: 'assigned',    description: 'Монтаж системы вентиляции склада 2000 м²' },
  { id: 'o22', number: 'WO-2026-000122', engineerId: 'e4', dayIndex: 3, timeStart: '10:00', timeEnd: '11:30', type: 'emergency',    client: 'Молочный комбинат',      address: 'ул. Пищевая, 7',     status: 'assigned',    description: 'АВАРИЙНЫЙ: отказ холодильных камер' },
  { id: 'o23', number: 'WO-2026-000123', engineerId: 'e4', dayIndex: 4, timeStart: '13:00', timeEnd: '14:30', type: 'maintenance',  client: 'Офис «РосБанк»',         address: 'пр. Ленина, 30',     status: 'assigned',    description: 'Ежемесячное ТО по сервисному договору' },
  { id: 'o24', number: 'WO-2026-000124', engineerId: 'e4', dayIndex: 5, timeStart: '09:00', timeEnd: '11:00', type: 'repair',       client: 'Частный дом',            address: 'пос. Дачный, 3',     status: 'assigned',    description: 'Не включается кондиционер, ошибка Е5' },

  // Михаил Семёнов (e5) — суббота/воскресенье выходной
  { id: 'o25', number: 'WO-2026-000125', engineerId: 'e5', dayIndex: 0, timeStart: '09:00', timeEnd: '11:00', type: 'installation', client: 'Детский сад №5',         address: 'ул. Детская, 10',    status: 'completed',   description: 'Монтаж рекуператора воздуха' },
  { id: 'o26', number: 'WO-2026-000126', engineerId: 'e5', dayIndex: 1, timeStart: '10:00', timeEnd: '12:30', type: 'repair',       client: 'Школа №42',              address: 'пр. Образования, 8', status: 'assigned',    description: 'Ремонт и промывка канального кондиционера' },
  { id: 'o27', number: 'WO-2026-000127', engineerId: 'e5', dayIndex: 2, timeStart: '09:00', timeEnd: '10:30', type: 'maintenance',  client: 'Библиотека городская',   address: 'пл. Культуры, 3',    status: 'assigned',    description: 'ТО системы приточной вентиляции' },
  { id: 'o28', number: 'WO-2026-000128', engineerId: 'e5', dayIndex: 3, timeStart: '13:00', timeEnd: '15:00', type: 'repair',       client: 'Кинотеатр «Звезда»',     address: 'ул. Кинотеатральная, 1', status: 'assigned', description: 'Ремонт зональной системы вентиляции зала' },
  { id: 'o29', number: 'WO-2026-000129', engineerId: 'e5', dayIndex: 4, timeStart: '11:00', timeEnd: '12:30', type: 'maintenance',  client: 'ФОК «Олимп»',           address: 'ул. Спортивная, 15', status: 'assigned',    description: 'ТО вентиляции ледового катка' },
  { id: 'o30', number: 'WO-2026-000130', engineerId: 'e5', dayIndex: 5, timeStart: '00:00', timeEnd: '00:00', type: 'day_off',      client: '',                       address: '',                   status: 'assigned',    description: 'Выходной день' },
  { id: 'o31', number: 'WO-2026-000131', engineerId: 'e5', dayIndex: 6, timeStart: '00:00', timeEnd: '00:00', type: 'day_off',      client: '',                       address: '',                   status: 'assigned',    description: 'Выходной день' },

  // Андрей Захаров (e6)
  { id: 'o32', number: 'WO-2026-000132', engineerId: 'e6', dayIndex: 0, timeStart: '08:00', timeEnd: '10:00', type: 'emergency',    client: 'ЦОД «DataLine»',        address: 'ул. Серверная, 2',   status: 'completed',   description: 'АВАРИЙНЫЙ: перегрев серверного помещения' },
  { id: 'o33', number: 'WO-2026-000133', engineerId: 'e6', dayIndex: 0, timeStart: '12:00', timeEnd: '14:00', type: 'repair',       client: 'Супермаркет «Магнит»',  address: 'пр. Торговый, 66',   status: 'completed',   description: 'Ремонт холодильных витрин' },
  { id: 'o34', number: 'WO-2026-000134', engineerId: 'e6', dayIndex: 1, timeStart: '10:00', timeEnd: '12:00', type: 'installation', client: 'Стоматология «Улыбка»', address: 'ул. Медицинская, 18',status: 'assigned',    description: 'Монтаж стерильной системы вентиляции' },
  { id: 'o35', number: 'WO-2026-000135', engineerId: 'e6', dayIndex: 2, timeStart: '09:00', timeEnd: '11:00', type: 'maintenance',  client: 'Завод «Электрон»',       address: 'пр. Промышленный, 4',status: 'assigned',    description: 'ТО системы кондиционирования чистой комнаты' },
  { id: 'o36', number: 'WO-2026-000136', engineerId: 'e6', dayIndex: 3, timeStart: '14:00', timeEnd: '16:00', type: 'repair',       client: 'БЦ «Олимп»',            address: 'пл. Бизнес, 1',      status: 'assigned',    description: 'Замена компрессора в наружном блоке' },
  { id: 'o37', number: 'WO-2026-000137', engineerId: 'e6', dayIndex: 4, timeStart: '10:00', timeEnd: '12:00', type: 'installation', client: 'Частный дом Ковалёва',  address: 'пос. Лесной, 7',     status: 'assigned',    description: 'Монтаж теплового насоса воздух-вода' },

  // Павел Морозов (e7)
  { id: 'o38', number: 'WO-2026-000138', engineerId: 'e7', dayIndex: 0, timeStart: '10:00', timeEnd: '12:00', type: 'maintenance',  client: 'Аэропорт (зона В)',      address: 'Аэровокзальная пл., 1', status: 'completed', description: 'ТО VRF системы зоны вылетов' },
  { id: 'o39', number: 'WO-2026-000139', engineerId: 'e7', dayIndex: 1, timeStart: '09:00', timeEnd: '10:30', type: 'repair',       client: 'Офис «ГазПром»',        address: 'пр. Нефтяников, 15', status: 'assigned',    description: 'Устранение шума во внутреннем блоке' },
  { id: 'o40', number: 'WO-2026-000140', engineerId: 'e7', dayIndex: 2, timeStart: '11:00', timeEnd: '13:00', type: 'installation', client: 'ЖК «Новый квартал»',    address: 'ул. Строительная, 44',status: 'assigned',   description: 'Монтаж 4 кондиционеров в офисе застройщика' },
  { id: 'o41', number: 'WO-2026-000141', engineerId: 'e7', dayIndex: 3, timeStart: '09:00', timeEnd: '11:00', type: 'maintenance',  client: 'Кинотеатр IMAX',        address: 'ТРЦ «Галактика»',    status: 'assigned',    description: 'ТО системы кондиционирования кинозала' },
  { id: 'o42', number: 'WO-2026-000142', engineerId: 'e7', dayIndex: 4, timeStart: '13:00', timeEnd: '15:30', type: 'repair',       client: 'Пекарня «Хлеб да Соль»',address: 'ул. Пекарная, 3',    status: 'assigned',    description: 'Ремонт холодильного оборудования расстойки' },
  { id: 'o43', number: 'WO-2026-000143', engineerId: 'e7', dayIndex: 5, timeStart: '10:00', timeEnd: '11:30', type: 'maintenance',  client: 'Частный заказчик',       address: 'Коттеджный пос. «Уют»', status: 'assigned', description: 'Сезонный осмотр климатической системы' },

  // Николай Соколов (e8)
  { id: 'o44', number: 'WO-2026-000144', engineerId: 'e8', dayIndex: 0, timeStart: '09:30', timeEnd: '11:30', type: 'repair',       client: 'МФЦ «Мои документы»',  address: 'пл. Административная, 2', status: 'completed', description: 'Ремонт системы вентиляции операционного зала' },
  { id: 'o45', number: 'WO-2026-000145', engineerId: 'e8', dayIndex: 1, timeStart: '13:00', timeEnd: '15:00', type: 'installation', client: 'Ресторан «Sushi Bar»',  address: 'пр. Морской, 12',    status: 'assigned',    description: 'Монтаж вытяжного зонта и канального кондиционера' },
  { id: 'o46', number: 'WO-2026-000146', engineerId: 'e8', dayIndex: 2, timeStart: '09:00', timeEnd: '10:30', type: 'maintenance',  client: 'Аптечная сеть «Ригла»', address: 'ул. Фармацевтов, 9', status: 'assigned',    description: 'ТО 3 кондиционеров в аптечных пунктах' },
  { id: 'o47', number: 'WO-2026-000147', engineerId: 'e8', dayIndex: 3, timeStart: '11:00', timeEnd: '13:00', type: 'emergency',    client: 'Мясокомбинат «Юг»',     address: 'ул. Мясная, 5',      status: 'assigned',    description: 'АВАРИЙНЫЙ: отказ холодильных камер хранения' },
  { id: 'o48', number: 'WO-2026-000148', engineerId: 'e8', dayIndex: 4, timeStart: '10:00', timeEnd: '12:00', type: 'repair',       client: 'Офис «ТехноПарк»',      address: 'бул. Инноваций, 18', status: 'assigned',    description: 'Диагностика и ремонт кассетного кондиционера' },
  { id: 'o49', number: 'WO-2026-000149', engineerId: 'e8', dayIndex: 5, timeStart: '09:00', timeEnd: '11:00', type: 'installation', client: 'Частный дом Федотова',  address: 'пос. Берёзовый, 21', status: 'assigned',    description: 'Монтаж сплит-системы 24000 BTU' },
];

// ─────────────────────────────────────────────
// Visual helpers
// ─────────────────────────────────────────────

const TYPE_CONFIG: Record<WorkType, { label: string; bg: string; text: string; border: string }> = {
  maintenance:  { label: 'ТО',        bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  installation: { label: 'Монтаж',    bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300' },
  repair:       { label: 'Ремонт',    bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  emergency:    { label: 'Аварийный', bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-300' },
  day_off:      { label: 'Выходной',  bg: 'bg-gray-100',   text: 'text-gray-500',   border: 'border-gray-200' },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  assigned:    'Назначен',
  in_progress: 'В работе',
  completed:   'Выполнен',
  en_route:    'В пути',
};

const STATUS_TODAY_CONFIG: Record<Engineer['statusToday'], { label: string; color: string }> = {
  working:  { label: 'На работе',  color: 'bg-green-500' },
  on_site:  { label: 'На объекте', color: 'bg-blue-500' },
  en_route: { label: 'В пути',     color: 'bg-amber-500' },
  day_off:  { label: 'Выходной',   color: 'bg-gray-400' },
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function EngineerAvatar({ engineer }: { engineer: Engineer }) {
  const cfg = STATUS_TODAY_CONFIG[engineer.statusToday];
  return (
    <div className="relative flex-shrink-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
        style={{ backgroundColor: engineer.avatarColor }}
      >
        {engineer.initials}
      </div>
      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${cfg.color}`} />
    </div>
  );
}

function OrderBlock({
  order,
  onClick,
}: {
  order: WorkOrder;
  onClick: (order: WorkOrder, e: React.MouseEvent) => void;
}) {
  const cfg = TYPE_CONFIG[order.type];
  if (order.type === 'day_off') {
    return (
      <div className={`w-full h-7 rounded flex items-center justify-center text-xs ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
        <Icon name="Moon" size={12} className="mr-1" />
        Выходной
      </div>
    );
  }
  return (
    <button
      onClick={(e) => onClick(order, e)}
      className={`w-full rounded border px-1.5 py-1 text-left hover:opacity-90 transition-opacity cursor-pointer ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <div className="text-[10px] font-semibold truncate leading-tight">{cfg.label}: {order.client.split(' ')[0]}</div>
      <div className="text-[10px] opacity-75">{order.timeStart}–{order.timeEnd}</div>
    </button>
  );
}

function OrderPopover({
  block,
  onClose,
}: {
  block: SelectedBlock;
  onClose: () => void;
}) {
  const { order } = block;
  const cfg = TYPE_CONFIG[order.type];
  const rect = block.anchorRect;
  const top = rect.bottom + window.scrollY + 6;
  const left = Math.min(rect.left + window.scrollX, window.innerWidth - 320 - 16);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
        style={{ top, left }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <Badge className={`${cfg.bg} ${cfg.text} border-0 text-xs mb-1`}>{cfg.label}</Badge>
            <div className="text-sm font-semibold text-gray-900">{order.number}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="X" size={16} />
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <Icon name="User" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{order.client}</span>
          </div>
          <div className="flex gap-2">
            <Icon name="MapPin" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{order.address}</span>
          </div>
          <div className="flex gap-2">
            <Icon name="Clock" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{order.timeStart} – {order.timeEnd}</span>
          </div>
          <div className="flex gap-2">
            <Icon name="Info" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 text-xs">{order.description}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <span className="text-xs text-gray-500">Статус:</span>
            <span className="text-xs font-medium text-gray-800">{STATUS_LABELS[order.status]}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Stats helpers
// ─────────────────────────────────────────────

function timeToHours(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

function orderDuration(o: WorkOrder): number {
  if (o.type === 'day_off') return 0;
  return Math.max(0, timeToHours(o.timeEnd) - timeToHours(o.timeStart));
}

function getEngineerStats(engineerId: string, orders: WorkOrder[]) {
  const filtered = orders.filter((o) => o.engineerId === engineerId && o.type !== 'day_off');
  const totalHours = filtered.reduce((sum, o) => sum + orderDuration(o), 0);
  const ordersCount = filtered.length;
  const avgKmPerOrder = 12;
  const estimatedKm = ordersCount * avgKmPerOrder;

  const byDay = DAY_LABELS.map((label, idx) => {
    const dayOrders = filtered.filter((o) => o.dayIndex === idx);
    const hours = dayOrders.reduce((sum, o) => sum + orderDuration(o), 0);
    return { day: label, hours: Math.round(hours * 10) / 10 };
  });

  return { ordersCount, totalHours: Math.round(totalHours * 10) / 10, estimatedKm, byDay };
}

// ─────────────────────────────────────────────
// Absence Dialog
// ─────────────────────────────────────────────

function AbsenceDialog({
  open,
  engineerName,
  onClose,
}: {
  open: boolean;
  engineerName: string;
  onClose: () => void;
}) {
  const [absenceType, setAbsenceType] = useState<AbsenceType>('vacation');

  function handleSubmit() {
    const label = absenceType === 'vacation' ? 'Отпуск' : 'Больничный';
    toast.success(`${label} для ${engineerName} оформлен`);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Отпуск / Больничный</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Инженер</label>
            <div className="text-sm text-gray-900 font-semibold">{engineerName}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Тип отсутствия</label>
            <Select value={absenceType} onValueChange={(v) => setAbsenceType(v as AbsenceType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Отпуск</SelectItem>
                <SelectItem value="sick">Больничный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Начало</label>
              <input type="date" defaultValue="2026-05-12" className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Конец</label>
              <input type="date" defaultValue="2026-05-18" className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Right panel
// ─────────────────────────────────────────────

function RightPanel({
  selectedEngineerId,
  orders,
  onAddOrder,
  onAbsence,
}: {
  selectedEngineerId: string | null;
  orders: WorkOrder[];
  onAddOrder: () => void;
  onAbsence: () => void;
}) {
  const engineer = ENGINEERS.find((e) => e.id === selectedEngineerId) ?? ENGINEERS[0];
  const stats = useMemo(() => getEngineerStats(engineer.id, orders), [engineer.id, orders]);
  const cfg = STATUS_TODAY_CONFIG[engineer.statusToday];

  return (
    <div className="w-64 flex-shrink-0 flex flex-col gap-4">
      {/* Engineer card */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <EngineerAvatar engineer={engineer} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{engineer.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                <span className="text-xs text-gray-500">{cfg.label}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-lg font-bold text-blue-700">{stats.ordersCount}</div>
              <div className="text-[10px] text-blue-500 leading-tight">нарядов</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-lg font-bold text-green-700">{stats.totalHours}</div>
              <div className="text-[10px] text-green-500 leading-tight">часов</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <div className="text-lg font-bold text-orange-700">{stats.estimatedKm}</div>
              <div className="text-[10px] text-orange-500 leading-tight">км ГСМ</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load chart */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Загрузка по дням (ч)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={stats.byDay} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6 }}
                formatter={(v: number) => [`${v} ч`, 'Часов']}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button size="sm" className="w-full justify-start gap-2" onClick={onAddOrder}>
          <Icon name="Plus" size={14} />
          Добавить наряд
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={onAbsence}>
          <Icon name="CalendarOff" size={14} />
          Отпуск / Больничный
        </Button>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Легенда</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-1.5">
          {(Object.entries(TYPE_CONFIG) as [WorkType, typeof TYPE_CONFIG[WorkType]][]).map(([, cfg]) => (
            <div key={cfg.label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm border flex-shrink-0 ${cfg.bg} ${cfg.border}`} />
              <span className="text-xs text-gray-700">{cfg.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function EngineerScheduleFull() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterEngineerId, setFilterEngineerId] = useState<string>('all');
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>(ENGINEERS[0].id);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null);
  const [absenceOpen, setAbsenceOpen] = useState(false);

  const visibleEngineers = useMemo(
    () => filterEngineerId === 'all' ? ENGINEERS : ENGINEERS.filter((e) => e.id === filterEngineerId),
    [filterEngineerId],
  );

  const selectedEngineer = ENGINEERS.find((e) => e.id === selectedEngineerId) ?? ENGINEERS[0];

  function getOrdersForCell(engineerId: string, dayIdx: number) {
    return WORK_ORDERS.filter((o) => o.engineerId === engineerId && o.dayIndex === dayIdx);
  }

  function handleBlockClick(order: WorkOrder, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSelectedBlock({ order, anchorRect: rect });
    setSelectedEngineerId(order.engineerId);
  }

  function handleExport() {
    toast.success('Расписание экспортировано в Excel');
  }

  function handleAutoplan() {
    toast.success('Расписание оптимизировано — 3 наряда перепланированы');
  }

  function handleAddOrder() {
    toast.info(`Добавление наряда для ${selectedEngineer.name}`);
  }

  const weekLabel = weekOffset === 0
    ? `Пн 12 – Вс 18 ${MONTHS}`
    : weekOffset === 1
    ? `Пн 19 – Вс 25 ${MONTHS}`
    : `Пн 5 – Вс 11 ${MONTHS}`;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Icon name="CalendarDays" size={20} className="text-blue-600" />
          <h1 className="text-base font-semibold text-gray-900">Расписание инженеров</h1>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <div className="min-w-[220px] text-center text-sm font-medium text-gray-800 bg-gray-50 border rounded-md px-3 py-1.5">
            {weekLabel}
          </div>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
            <Icon name="ChevronRight" size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} className="text-xs">
            Эта неделя
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={14} className="text-gray-400" />
          <Select value={filterEngineerId} onValueChange={setFilterEngineerId}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue placeholder="Все инженеры" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все инженеры</SelectItem>
              {ENGINEERS.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={handleAutoplan} className="gap-1.5">
            <Icon name="Zap" size={14} />
            Авто-планирование
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Icon name="Download" size={14} />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Gantt table */}
        <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <th className="w-44 px-4 py-3 text-left text-xs font-semibold text-gray-600 border-r border-gray-200">
                  Инженер
                </th>
                {DAY_LABELS.map((day, idx) => {
                  const isToday = idx === 0 && weekOffset === 0;
                  return (
                    <th
                      key={day}
                      className={`px-2 py-3 text-center text-xs font-semibold border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'text-blue-700 bg-blue-50' : 'text-gray-600'
                      }`}
                    >
                      <div>{day}</div>
                      <div className={`text-[10px] font-normal mt-0.5 ${isToday ? 'text-blue-500' : 'text-gray-400'}`}>
                        {DAY_DATES[idx]} мая
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibleEngineers.map((engineer) => (
                <tr
                  key={engineer.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedEngineerId === engineer.id ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => setSelectedEngineerId(engineer.id)}
                >
                  {/* Engineer column */}
                  <td className="px-3 py-2 border-r border-gray-200 w-44">
                    <div className="flex items-center gap-2">
                      <EngineerAvatar engineer={engineer} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-900 leading-tight truncate">
                          {engineer.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          {engineer.name.split(' ').slice(1).join(' ')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {DAY_LABELS.map((_, dayIdx) => {
                    const cellOrders = getOrdersForCell(engineer.id, dayIdx);
                    const isWeekend = dayIdx >= 5;
                    const isToday = dayIdx === 0 && weekOffset === 0;
                    return (
                      <td
                        key={dayIdx}
                        className={`px-1.5 py-1.5 border-r border-gray-100 last:border-r-0 align-top ${
                          isWeekend ? 'bg-gray-50/70' : ''
                        } ${isToday ? 'bg-blue-50/30' : ''}`}
                        style={{ minWidth: 120, maxWidth: 160 }}
                      >
                        <div className="flex flex-col gap-1">
                          {cellOrders.length === 0 ? (
                            <div className="h-7 flex items-center justify-center">
                              {isWeekend && (
                                <span className="text-[10px] text-gray-400">—</span>
                              )}
                            </div>
                          ) : (
                            cellOrders.map((order) => (
                              <OrderBlock
                                key={order.id}
                                order={order}
                                onClick={handleBlockClick}
                              />
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right panel */}
        <RightPanel
          selectedEngineerId={selectedEngineerId}
          orders={WORK_ORDERS}
          onAddOrder={handleAddOrder}
          onAbsence={() => setAbsenceOpen(true)}
        />
      </div>

      {/* Popover */}
      {selectedBlock && (
        <OrderPopover block={selectedBlock} onClose={() => setSelectedBlock(null)} />
      )}

      {/* Absence dialog */}
      <AbsenceDialog
        open={absenceOpen}
        engineerName={selectedEngineer.name}
        onClose={() => setAbsenceOpen(false)}
      />
    </div>
  );
}
