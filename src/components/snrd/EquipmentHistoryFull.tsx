import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type EquipmentStatus = 'online' | 'warning' | 'offline';
type EquipmentKind =
  | 'VRF'
  | 'Сплит-система'
  | 'Чиллер'
  | 'Вентиляция'
  | 'Фанкойл'
  | 'Тепловой насос';

type EventType =
  | 'installation'
  | 'repair'
  | 'maintenance'
  | 'emergency'
  | 'part_replacement'
  | 'diagnostic'
  | 'parts_order'
  | 'warranty';

interface Equipment {
  id: string;
  name: string;
  client: string;
  kind: EquipmentKind;
  status: EquipmentStatus;
  model: string;
  serial: string;
  installYear: number;
  warrantyUntil: string;
  hoursWorked: number;
  totalRepairs: number;
  totalSpent: number;
  reliability: number; // %
  nextMaintenance: string;
}

interface HistoryEvent {
  id: string;
  date: string;
  type: EventType;
  title: string;
  description: string;
  engineer: string;
  workOrderId: string | null;
  cost: number | null;
  materials: string[];
  hasPhotos: boolean;
}

interface MonthRepairs {
  month: string;
  repairs: number;
}

interface CostCategory {
  category: string;
  amount: number;
}

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const EVENT_CONFIG: Record<
  EventType,
  { label: string; icon: string; color: string; bg: string; border: string; dot: string }
> = {
  installation: {
    label: 'Монтаж/установка',
    icon: 'Hammer',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  repair: {
    label: 'Ремонт',
    icon: 'Wrench',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  maintenance: {
    label: 'Плановое ТО',
    icon: 'ClipboardCheck',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  emergency: {
    label: 'Авария',
    icon: 'TriangleAlert',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  part_replacement: {
    label: 'Замена компонента',
    icon: 'RefreshCw',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  diagnostic: {
    label: 'Диагностика',
    icon: 'ScanLine',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  parts_order: {
    label: 'Заказ запчасти',
    icon: 'Package',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  warranty: {
    label: 'Гарантийный случай',
    icon: 'ShieldCheck',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
  },
};

const STATUS_CONFIG: Record<
  EquipmentStatus,
  { label: string; dot: string; badgeVariant: string }
> = {
  online: { label: 'В работе', dot: 'bg-green-500', badgeVariant: 'success' },
  warning: { label: 'Внимание', dot: 'bg-amber-400', badgeVariant: 'warning' },
  offline: { label: 'Offline', dot: 'bg-gray-400', badgeVariant: 'secondary' },
};

const KIND_ICON: Record<EquipmentKind, string> = {
  VRF: 'Wind',
  'Сплит-система': 'Thermometer',
  Чиллер: 'Droplets',
  Вентиляция: 'Fan',
  Фанкойл: 'Zap',
  'Тепловой насос': 'Flame',
};

const FILTER_TYPES: { key: EventType | 'all'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'repair', label: 'Ремонт' },
  { key: 'maintenance', label: 'ТО' },
  { key: 'emergency', label: 'Авария' },
  { key: 'installation', label: 'Монтаж' },
  { key: 'part_replacement', label: 'Запчасти' },
  { key: 'diagnostic', label: 'Диагностика' },
  { key: 'warranty', label: 'Гарантия' },
];

const PERIOD_OPTIONS: { label: string; months: number }[] = [
  { label: 'Всё время', months: 0 },
  { label: '1 год', months: 12 },
  { label: '6 мес', months: 6 },
  { label: '3 мес', months: 3 },
];

// ─────────────────────────────────────────────
// Mock Data — Equipment list (10 units)
// ─────────────────────────────────────────────

const EQUIPMENT_LIST: Equipment[] = [
  {
    id: 'eq1',
    name: 'Daikin VRV-IV',
    client: 'ТЦ Европа',
    kind: 'VRF',
    status: 'online',
    model: 'RXYQ16T',
    serial: 'DK2021-VRV-0312',
    installYear: 2021,
    warrantyUntil: '2024-09-01',
    hoursWorked: 15800,
    totalRepairs: 3,
    totalSpent: 148500,
    reliability: 94,
    nextMaintenance: '2026-08-15',
  },
  {
    id: 'eq2',
    name: 'Mitsubishi MXZ-8D',
    client: 'Офис РусГаз',
    kind: 'Сплит-система',
    status: 'warning',
    model: 'MXZ-8D160VA',
    serial: 'MHI2020-MXZ-0789',
    installYear: 2020,
    warrantyUntil: '2023-04-15',
    hoursWorked: 10400,
    totalRepairs: 5,
    totalSpent: 87200,
    reliability: 81,
    nextMaintenance: '2026-06-01',
  },
  {
    id: 'eq3',
    name: 'Carrier 30XA',
    client: 'Склад LogiPark',
    kind: 'Чиллер',
    status: 'online',
    model: '30XA-302',
    serial: 'CR2022-30XA-0214',
    installYear: 2022,
    warrantyUntil: '2026-12-01',
    hoursWorked: 7600,
    totalRepairs: 1,
    totalSpent: 62000,
    reliability: 97,
    nextMaintenance: '2026-10-20',
  },
  {
    id: 'eq4',
    name: 'Gree GMV-800',
    client: 'Гипермаркет Лента',
    kind: 'VRF',
    status: 'warning',
    model: 'GMV-800WM/B-X',
    serial: 'GR2019-GMV-1045',
    installYear: 2019,
    warrantyUntil: '2022-06-01',
    hoursWorked: 27300,
    totalRepairs: 9,
    totalSpent: 312000,
    reliability: 68,
    nextMaintenance: '2026-05-30',
  },
  {
    id: 'eq5',
    name: 'Systemair SAVE VTR 700',
    client: 'БЦ Горизонт',
    kind: 'Вентиляция',
    status: 'offline',
    model: 'SAVE VTR 700/B',
    serial: 'SY2020-VTR-0455',
    installYear: 2020,
    warrantyUntil: '2023-08-10',
    hoursWorked: 18900,
    totalRepairs: 4,
    totalSpent: 103000,
    reliability: 77,
    nextMaintenance: '2026-07-10',
  },
  {
    id: 'eq6',
    name: 'LG Multi V 5',
    client: 'Ресторан Оливье',
    kind: 'VRF',
    status: 'online',
    model: 'ARUM120LTE5',
    serial: 'LG2023-MV5-0088',
    installYear: 2023,
    warrantyUntil: '2026-03-01',
    hoursWorked: 3600,
    totalRepairs: 1,
    totalSpent: 14500,
    reliability: 98,
    nextMaintenance: '2026-09-01',
  },
  {
    id: 'eq7',
    name: 'Daikin Altherma 3',
    client: 'Жилой дом Сосны',
    kind: 'Тепловой насос',
    status: 'online',
    model: 'EHBX16D6V',
    serial: 'DK2022-ALT-0511',
    installYear: 2022,
    warrantyUntil: '2025-11-15',
    hoursWorked: 9200,
    totalRepairs: 2,
    totalSpent: 47800,
    reliability: 92,
    nextMaintenance: '2026-11-15',
  },
  {
    id: 'eq8',
    name: 'Haier AV14IMSEUA',
    client: 'Офис Медиасеть',
    kind: 'VRF',
    status: 'online',
    model: 'AV14IMSEUA',
    serial: 'HI2021-VRF-0203',
    installYear: 2021,
    warrantyUntil: '2024-07-20',
    hoursWorked: 11600,
    totalRepairs: 2,
    totalSpent: 38400,
    reliability: 90,
    nextMaintenance: '2026-08-01',
  },
  {
    id: 'eq9',
    name: 'Midea MRA3-18FNXDO',
    client: 'Поликлиника №12',
    kind: 'Сплит-система',
    status: 'warning',
    model: 'MRA3-18FNXDO',
    serial: 'MD2020-SPL-1187',
    installYear: 2020,
    warrantyUntil: '2023-01-01',
    hoursWorked: 21000,
    totalRepairs: 7,
    totalSpent: 92600,
    reliability: 72,
    nextMaintenance: '2026-06-15',
  },
  {
    id: 'eq10',
    name: 'Hitachi RAS-5HVNP1',
    client: 'Торговый центр Аркада',
    kind: 'VRF',
    status: 'online',
    model: 'RAS-5HVNP1',
    serial: 'HT2022-VRF-0339',
    installYear: 2022,
    warrantyUntil: '2025-09-30',
    hoursWorked: 8800,
    totalRepairs: 1,
    totalSpent: 29000,
    reliability: 96,
    nextMaintenance: '2026-09-30',
  },
];

// ─────────────────────────────────────────────
// Mock Events per equipment
// ─────────────────────────────────────────────

const EVENTS: Record<string, HistoryEvent[]> = {
  eq1: [
    {
      id: 'ev1',
      date: '2021-09-15',
      type: 'installation',
      title: 'Монтаж и пуско-наладка VRV-системы',
      description:
        'Установка наружного блока Daikin RXYQ16T, подключение 10 внутренних блоков. Прокладка фреонопроводов (140 м), вакуумирование, заправка R-410A (14 кг). Пуско-наладочные работы, настройка центрального контроллера.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2021-000142',
      cost: 95000,
      materials: ['R-410A 14 кг', 'Медная труба 1/2" 140 м', 'Теплоизоляция Armaflex'],
      hasPhotos: true,
    },
    {
      id: 'ev2',
      date: '2022-04-10',
      type: 'maintenance',
      title: 'Плановое ТО — весна 2022',
      description:
        'Чистка теплообменников всех блоков, проверка уровня фреона, протяжка электрических клемм, смазка подшипников вентиляторов, обновление прошивки контроллера v3.14.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2022-000087',
      cost: 18500,
      materials: ['Фильтры воздушные x10', 'Смазка Mobil'],
      hasPhotos: true,
    },
    {
      id: 'ev3',
      date: '2022-09-05',
      type: 'emergency',
      title: 'Авария — ошибка U4 (несоответствие мощности)',
      description:
        'Поступил аварийный вызов: система не охлаждает три зоны. Код ошибки U4 на центральном контроллере. Диагностика выявила неисправную плату управления во внутреннем блоке №7.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000321',
      cost: null,
      materials: [],
      hasPhotos: false,
    },
    {
      id: 'ev4',
      date: '2022-09-07',
      type: 'part_replacement',
      title: 'Замена платы управления блока №7',
      description:
        'Замена платы управления внутреннего блока №7 (арт. 6871A20109N). Тестирование системы под нагрузкой 4 часа, подтверждение работоспособности всех зон.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000322',
      cost: 22400,
      materials: ['Плата 6871A20109N', 'Термопаста Arctic MX-4'],
      hasPhotos: true,
    },
    {
      id: 'ev5',
      date: '2022-10-20',
      type: 'parts_order',
      title: 'Заказ резервных плат управления',
      description:
        'По рекомендации инженера заказаны 2 резервные платы управления для снижения времени простоя при возможных будущих отказах.',
      engineer: 'Петров Д.В.',
      workOrderId: null,
      cost: 38000,
      materials: ['Плата 6871A20109N x2'],
      hasPhotos: false,
    },
    {
      id: 'ev6',
      date: '2023-04-12',
      type: 'maintenance',
      title: 'Плановое ТО — весна 2023',
      description:
        'Полный регламент ТО: чистка теплообменников, проверка хладагента (норма), протяжка клемм, обновление прошивки центрального контроллера до v3.21, смазка вентиляторов.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2023-000156',
      cost: 19200,
      materials: ['Фильтры x10', 'Смазка Mobil', 'Дезинфектор для теплообменников'],
      hasPhotos: true,
    },
    {
      id: 'ev7',
      date: '2023-08-14',
      type: 'diagnostic',
      title: 'Диагностика вибрации наружного блока',
      description:
        'Клиент пожаловался на повышенный шум. Диагностика выявила ослабленные виброизолирующие подушки. Балансировка крыльчатки вентилятора, замена виброизоляторов.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2023-000290',
      cost: 7800,
      materials: ['Виброизолятор x4', 'Крепёжные болты M8'],
      hasPhotos: false,
    },
    {
      id: 'ev8',
      date: '2023-11-20',
      type: 'repair',
      title: 'Устранение микроутечки хладагента',
      description:
        'Обнаружена микроутечка в зоне соединения блока №4. Устранение разгерметизации, опрессовка азотом, дозаправка R-410A 0.8 кг.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2023-000489',
      cost: 8600,
      materials: ['R-410A 0.8 кг', 'Флюс пайки'],
      hasPhotos: true,
    },
    {
      id: 'ev9',
      date: '2024-04-08',
      type: 'maintenance',
      title: 'Плановое ТО — весна 2024',
      description:
        'Регламентное ТО перед летним сезоном. Все показатели в норме. Заменены воздушные фильтры во всех 10 блоках, промывка теплообменников под давлением.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2024-000203',
      cost: 21000,
      materials: ['Фильтры x10', 'Чистящее средство'],
      hasPhotos: true,
    },
    {
      id: 'ev10',
      date: '2024-10-03',
      type: 'maintenance',
      title: 'Плановое ТО — осень 2024',
      description:
        'Осеннее ТО: чистка, проверка автоматики, настройка режима обогрева, проверка электрических цепей.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2024-000498',
      cost: 17500,
      materials: ['Фильтры x10'],
      hasPhotos: false,
    },
    {
      id: 'ev11',
      date: '2025-01-15',
      type: 'emergency',
      title: 'Авария — потеря связи с блоком №3',
      description:
        'Аварийное отключение блока №3 из-за ошибки E7 (потеря связи). Диагностика: обрыв сигнального кабеля, повреждён грызунами в межэтажном перекрытии.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2025-000041',
      cost: null,
      materials: [],
      hasPhotos: true,
    },
    {
      id: 'ev12',
      date: '2025-01-17',
      type: 'repair',
      title: 'Прокладка нового сигнального кабеля',
      description:
        'Прокладка нового сигнального кабеля (КСПЭ 2x0.75, 18 м) в защитной гофре. Восстановление связи с блоком №3. Проверка всех сигнальных линий.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2025-000042',
      cost: 9400,
      materials: ['КСПЭ 2x0.75 мм 18 м', 'Гофра ПВХ 16 мм', 'Клипсы крепления'],
      hasPhotos: false,
    },
    {
      id: 'ev13',
      date: '2025-04-10',
      type: 'maintenance',
      title: 'Плановое ТО — весна 2025',
      description:
        'Весеннее ТО: чистка блоков, проверка уровня фреона (норма), обновление ПО контроллера до v4.02.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2025-000198',
      cost: 22000,
      materials: ['Фильтры x10', 'Смазка Mobil'],
      hasPhotos: true,
    },
  ],
  eq2: [
    {
      id: 'ev1',
      date: '2020-07-10',
      type: 'installation',
      title: 'Монтаж мультисплит-системы Mitsubishi MXZ-8D',
      description:
        'Установка наружного блока MXZ-8D160VA и 8 внутренних блоков. Прокладка трасс, вакуумирование, заправка R-32 (8.5 кг), пуско-наладка.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2020-000078',
      cost: 68000,
      materials: ['R-32 8.5 кг', 'Медная труба 3/8" 80 м'],
      hasPhotos: true,
    },
    {
      id: 'ev2',
      date: '2021-04-20',
      type: 'maintenance',
      title: 'Первое плановое ТО (1 год)',
      description:
        'Чистка всех блоков, проверка давления (норма), фильтры G4, дезинфекция теплообменников.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2021-000102',
      cost: 11200,
      materials: ['Фильтры x8', 'Дезинфектор'],
      hasPhotos: false,
    },
    {
      id: 'ev3',
      date: '2022-06-05',
      type: 'emergency',
      title: 'Авария — ошибка P8 (перегрев компрессора)',
      description:
        'Клиент сообщил: кондиционеры в переговорной не охлаждают. Ошибка P8. Причина: засорение теплообменника наружного блока + утечка R-32.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000195',
      cost: null,
      materials: [],
      hasPhotos: false,
    },
    {
      id: 'ev4',
      date: '2022-06-07',
      type: 'repair',
      title: 'Устранение утечки R-32, заправка',
      description:
        'Промывка наружного блока под давлением, поиск и устранение утечки на вибрационном участке трассы, дозаправка R-32 1.4 кг.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000196',
      cost: 14800,
      materials: ['R-32 1.4 кг', 'Флюс пайки'],
      hasPhotos: true,
    },
    {
      id: 'ev5',
      date: '2022-10-15',
      type: 'maintenance',
      title: 'Плановое ТО — осень 2022',
      description:
        'Сезонное ТО: чистка, проверка электрики, замена фильтров, диагностика платы управления.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2022-000388',
      cost: 12000,
      materials: ['Фильтры x8'],
      hasPhotos: false,
    },
    {
      id: 'ev6',
      date: '2023-05-20',
      type: 'diagnostic',
      title: 'Диагностика шума компрессора',
      description:
        'Плановая диагностика по жалобе на посторонний шум. Износ компрессора ~55% ресурса. Рекомендован мониторинг.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2023-000211',
      cost: 4500,
      materials: [],
      hasPhotos: false,
    },
    {
      id: 'ev7',
      date: '2024-03-10',
      type: 'warranty',
      title: 'Гарантийная замена датчика температуры',
      description:
        'Датчик температуры воздуха блока №2 вышел из строя в гарантийный период (продлённая гарантия по договору). Замена выполнена бесплатно.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2024-000118',
      cost: 0,
      materials: ['Датчик NTC 10K x1'],
      hasPhotos: false,
    },
    {
      id: 'ev8',
      date: '2024-08-22',
      type: 'repair',
      title: 'Ремонт — шум вентилятора наружного блока',
      description:
        'Замена антивибрационных подушек наружного блока, балансировка крыльчатки. Вибрация устранена.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2024-000389',
      cost: 7200,
      materials: ['Виброизолятор x4'],
      hasPhotos: false,
    },
    {
      id: 'ev9',
      date: '2025-04-05',
      type: 'maintenance',
      title: 'Плановое ТО — весна 2025',
      description:
        'ТО перед сезоном. Состояние компрессора — износ 68%. Рекомендовано принять решение о замене до следующего сезона.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2025-000177',
      cost: 13500,
      materials: ['Фильтры x8', 'Смазка'],
      hasPhotos: true,
    },
  ],
  eq3: [
    {
      id: 'ev1',
      date: '2022-12-01',
      type: 'installation',
      title: 'Монтаж чиллера Carrier 30XA-302',
      description:
        'Монтаж чиллера с воздушным охлаждением конденсатора. Подключение к системе гидравлики склада, пуско-наладка, заправка R-134a (22 кг).',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2022-000412',
      cost: 142000,
      materials: ['R-134a 22 кг', 'Гликоль 30% 80 л'],
      hasPhotos: true,
    },
    {
      id: 'ev2',
      date: '2023-04-10',
      type: 'maintenance',
      title: 'Пуск после зимнего простоя',
      description:
        'Проверка концентрации гликоля (норма 28%), давлений, пуск чиллера. Все параметры в норме.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2023-000148',
      cost: 5200,
      materials: [],
      hasPhotos: false,
    },
    {
      id: 'ev3',
      date: '2023-10-15',
      type: 'maintenance',
      title: 'Осеннее ТО и консервация',
      description:
        'Промывка конденсатора, проверка гликолевого раствора, консервация системы на зиму.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2023-000398',
      cost: 32000,
      materials: ['Гликоль 5 л (доливка)'],
      hasPhotos: false,
    },
    {
      id: 'ev4',
      date: '2024-04-08',
      type: 'maintenance',
      title: 'Пуск 2024 + полное ТО',
      description:
        'Весенний пуск, полное ТО: чистка конденсатора, проверка приводов, замер токов компрессора.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2024-000181',
      cost: 28000,
      materials: [],
      hasPhotos: true,
    },
    {
      id: 'ev5',
      date: '2025-02-14',
      type: 'diagnostic',
      title: 'Диагностика вибрации насоса',
      description:
        'Плановая диагностика по заявке: вибрация на циркуляционном насосе. Диагностика не выявила дефектов — вибрация из-за режима неполной нагрузки.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2025-000062',
      cost: 3500,
      materials: [],
      hasPhotos: false,
    },
  ],
  eq4: [
    {
      id: 'ev1',
      date: '2019-05-20',
      type: 'installation',
      title: 'Монтаж мультизональной системы Gree GMV-800',
      description:
        'Монтаж GMV-800WM/B-X и 32 внутренних блоков. Прокладка 220 м фреонопроводов, заправка R-410A (35 кг).',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2019-000033',
      cost: 285000,
      materials: ['R-410A 35 кг', 'Трубы медные 220 м'],
      hasPhotos: true,
    },
    {
      id: 'ev2',
      date: '2020-05-12',
      type: 'maintenance',
      title: 'Годовое ТО (1 год)',
      description:
        'Полный осмотр системы, чистка 32 блоков, анализ параметров, проверка герметичности.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2020-000124',
      cost: 52000,
      materials: ['Фильтры x32'],
      hasPhotos: true,
    },
    {
      id: 'ev3',
      date: '2021-02-10',
      type: 'emergency',
      title: 'Авария — ошибка EA (потеря связи 6 блоков)',
      description:
        'Механическое повреждение кабеля шины данных при строительных работах. 6 блоков offline.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2021-000041',
      cost: null,
      materials: [],
      hasPhotos: false,
    },
    {
      id: 'ev4',
      date: '2021-02-12',
      type: 'repair',
      title: 'Восстановление шины данных',
      description:
        'Прокладка нового сигнального кабеля 25 м, восстановление коммуникации всех блоков.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2021-000042',
      cost: 18000,
      materials: ['Кабель КСПЭ 2x0.75 25 м', 'Гофра ПВХ'],
      hasPhotos: false,
    },
    {
      id: 'ev5',
      date: '2021-05-20',
      type: 'maintenance',
      title: 'Годовое ТО (2 года) + дозаправка',
      description:
        'Регламентное ТО. Выявлена утечка на блоке №14 (−1.8 кг). Устранение, дозаправка.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2021-000189',
      cost: 61000,
      materials: ['R-410A 1.8 кг', 'Фильтры x32'],
      hasPhotos: true,
    },
    {
      id: 'ev6',
      date: '2022-05-18',
      type: 'maintenance',
      title: 'Годовое ТО (3 года)',
      description:
        'Плановое ТО. Замена фильтров в 28 блоках, чистка теплообменников, проверка электроники.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000178',
      cost: 58000,
      materials: ['Фильтры x28'],
      hasPhotos: true,
    },
    {
      id: 'ev7',
      date: '2023-03-14',
      type: 'part_replacement',
      title: 'Замена вентилятора наружного блока',
      description:
        'Вышел из строя двигатель вентилятора наружного блока. Замена двигателя и крыльчатки.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2023-000098',
      cost: 28500,
      materials: ['Двигатель вентилятора x1', 'Крыльчатка x1'],
      hasPhotos: true,
    },
    {
      id: 'ev8',
      date: '2023-05-25',
      type: 'maintenance',
      title: 'Годовое ТО (4 года)',
      description:
        'ТО: износ компрессора наружного блока 65%. Рекомендована замена в течение года.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2023-000201',
      cost: 62000,
      materials: ['Фильтры x32', 'Смазка'],
      hasPhotos: false,
    },
    {
      id: 'ev9',
      date: '2024-01-17',
      type: 'part_replacement',
      title: 'Замена компрессора наружного блока',
      description:
        'Полная замена компрессора на новый (арт. 1506309-B). Тестирование под нагрузкой 8 часов.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2024-000029',
      cost: 89000,
      materials: ['Компрессор 1506309-B', 'R-410A 3 кг', 'Масло компрессорное'],
      hasPhotos: true,
    },
  ],
  eq5: [],
  eq6: [],
  eq7: [],
  eq8: [],
  eq9: [],
  eq10: [],
};

// Fill shorter equipment with fallback events
['eq5', 'eq6', 'eq7', 'eq8', 'eq9', 'eq10'].forEach((id) => {
  const eq = EQUIPMENT_LIST.find((e) => e.id === id)!;
  EVENTS[id] = [
    {
      id: 'ev1',
      date: `${eq.installYear}-06-01`,
      type: 'installation',
      title: `Монтаж и пуско-наладка ${eq.name}`,
      description: `Установка оборудования ${eq.model} на объекте клиента «${eq.client}». Выполнены пуско-наладочные работы, параметры соответствуют норме.`,
      engineer: 'Петров Д.В.',
      workOrderId: `WO-${eq.installYear}-000${id.slice(2)}01`,
      cost: 45000 + parseInt(id.slice(2)) * 8000,
      materials: ['Медная труба', 'Изоляция', 'Крепёж'],
      hasPhotos: true,
    },
    {
      id: 'ev2',
      date: `${eq.installYear + 1}-04-15`,
      type: 'maintenance',
      title: 'Первое плановое ТО',
      description: 'Чистка блоков, замена фильтров, проверка параметров работы. Всё в норме.',
      engineer: 'Козлов М.П.',
      workOrderId: `WO-${eq.installYear + 1}-000${id.slice(2)}02`,
      cost: 8500 + parseInt(id.slice(2)) * 1000,
      materials: ['Фильтры', 'Дезинфектор'],
      hasPhotos: false,
    },
    {
      id: 'ev3',
      date: `${eq.installYear + 1}-10-10`,
      type: 'maintenance',
      title: 'Осеннее ТО',
      description: 'Подготовка к зимнему сезону. Проверка режима обогрева, электрики, автоматики.',
      engineer: 'Сидоров А.Н.',
      workOrderId: `WO-${eq.installYear + 1}-000${id.slice(2)}03`,
      cost: 7000,
      materials: ['Фильтры'],
      hasPhotos: false,
    },
    {
      id: 'ev4',
      date: `${Math.min(eq.installYear + 2, 2025)}-05-20`,
      type: 'diagnostic',
      title: 'Плановая диагностика',
      description: 'Снятие параметров и оценка состояния оборудования. Рекомендации по эксплуатации.',
      engineer: 'Фёдоров И.С.',
      workOrderId: `WO-${Math.min(eq.installYear + 2, 2025)}-000${id.slice(2)}04`,
      cost: 3500,
      materials: [],
      hasPhotos: false,
    },
  ];
});

// ─────────────────────────────────────────────
// Chart Data Generators
// ─────────────────────────────────────────────

function generateMonthlyRepairs(events: HistoryEvent[]): MonthRepairs[] {
  const months = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
  ];
  const counts: number[] = Array(12).fill(0);
  events.forEach((ev) => {
    if (['repair', 'emergency', 'part_replacement'].includes(ev.type)) {
      const m = new Date(ev.date).getMonth();
      counts[m]++;
    }
  });
  return months.map((month, i) => ({ month, repairs: counts[i] }));
}

function generateCostCategories(events: HistoryEvent[]): CostCategory[] {
  let repair = 0;
  let maintenance = 0;
  let parts = 0;
  events.forEach((ev) => {
    if (ev.cost == null || ev.cost === 0) return;
    if (['repair', 'emergency'].includes(ev.type)) repair += ev.cost;
    else if (ev.type === 'maintenance') maintenance += ev.cost;
    else if (['part_replacement', 'parts_order'].includes(ev.type)) parts += ev.cost;
  });
  return [
    { category: 'Ремонт', amount: repair },
    { category: 'ТО', amount: maintenance },
    { category: 'Запчасти', amount: parts },
  ];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatMoney(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₽';
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  iconName,
  iconColor,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  iconName: string;
  iconColor: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <Icon name={iconName} className={`w-4 h-4 ${iconColor}`} />
      </div>
      <span className={`text-xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function EquipmentListItem({
  eq,
  isSelected,
  onClick,
}: {
  eq: Equipment;
  isSelected: boolean;
  onClick: () => void;
}) {
  const sc = STATUS_CONFIG[eq.status];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors border ${
        isSelected
          ? 'bg-blue-50 border-blue-200'
          : 'hover:bg-gray-50 border-transparent'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon name={KIND_ICON[eq.kind]} className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-sm font-medium text-gray-900 truncate leading-tight">
          {eq.name}
        </span>
        <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
      </div>
      <p className="text-xs text-gray-500 mt-0.5 pl-6 truncate">{eq.client}</p>
      <p className="text-xs text-gray-400 pl-6 truncate">{eq.kind}</p>
    </button>
  );
}

function TimelineEvent({
  event,
  isLast,
}: {
  event: HistoryEvent;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = EVENT_CONFIG[event.type];

  return (
    <div className="flex gap-3">
      {/* Connector */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${cfg.dot}`}
        >
          <Icon name={cfg.icon} className="w-4 h-4 text-white" />
        </div>
        {!isLast && <div className="w-0.5 bg-gray-200 flex-1 mt-1 mb-1 min-h-[12px]" />}
      </div>

      {/* Card */}
      <div
        className={`flex-1 rounded-xl border ${cfg.border} ${cfg.bg} p-3 mb-4 min-w-0`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white border ${cfg.border} ${cfg.color} whitespace-nowrap`}
              >
                {cfg.label}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                <Icon name="Calendar" className="w-3 h-3" />
                {formatDateShort(event.date)}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {event.title}
            </p>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title={expanded ? 'Свернуть' : 'Развернуть'}
          >
            <Icon
              name={expanded ? 'ChevronUp' : 'ChevronDown'}
              className="w-4 h-4"
            />
          </button>
        </div>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-gray-200/60 space-y-2">
            <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {event.engineer && (
                <span className="flex items-center gap-1">
                  <Icon name="User" className="w-3 h-3" />
                  {event.engineer}
                </span>
              )}
              {event.workOrderId && (
                <span className="flex items-center gap-1">
                  <Icon name="Hash" className="w-3 h-3" />
                  {event.workOrderId}
                </span>
              )}
              {event.cost !== null && (
                <span
                  className={`flex items-center gap-1 font-medium ${
                    event.cost === 0 ? 'text-green-600' : 'text-gray-700'
                  }`}
                >
                  <Icon name="Banknote" className="w-3 h-3" />
                  {event.cost === 0 ? 'Бесплатно (гарантия)' : formatMoney(event.cost)}
                </span>
              )}
            </div>

            {event.materials.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {event.materials.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            {event.hasPhotos && (
              <div className="flex gap-2 pt-1 flex-wrap">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="w-16 h-12 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-400"
                    title={`Фото ${n}`}
                  >
                    <Icon name="Image" className="w-5 h-5" />
                  </div>
                ))}
                <span className="text-xs text-gray-400 self-center">фото-вложения</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function EquipmentHistoryFull() {
  const [selectedId, setSelectedId] = useState<string>('eq1');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [filterPeriod, setFilterPeriod] = useState<number>(0);

  const equipment = EQUIPMENT_LIST.find((e) => e.id === selectedId)!;
  const allEvents = EVENTS[selectedId] ?? [];

  const filteredEquipment = useMemo(() => {
    const q = search.toLowerCase();
    return EQUIPMENT_LIST.filter(
      (eq) =>
        eq.name.toLowerCase().includes(q) ||
        eq.client.toLowerCase().includes(q) ||
        eq.kind.toLowerCase().includes(q),
    );
  }, [search]);

  const filteredEvents = useMemo(() => {
    let evs = [...allEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (filterType !== 'all') {
      evs = evs.filter((e) => e.type === filterType);
    }
    if (filterPeriod > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - filterPeriod);
      evs = evs.filter((e) => new Date(e.date) >= cutoff);
    }
    return evs;
  }, [allEvents, filterType, filterPeriod]);

  const monthlyRepairs = useMemo(() => generateMonthlyRepairs(allEvents), [allEvents]);
  const costCategories = useMemo(() => generateCostCategories(allEvents), [allEvents]);

  const sc = STATUS_CONFIG[equipment.status];

  function handleExport() {
    toast.success(`Отчёт по «${equipment.name}» формируется`, {
      description: 'PDF будет готов через несколько секунд',
    });
  }

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">

      {/* ══ LEFT PANEL — Equipment List (300px) ══ */}
      <div className="w-[300px] shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">Оборудование</h2>
            <Badge variant="secondary" className="text-xs">
              {EQUIPMENT_LIST.length}
            </Badge>
          </div>
          <Input
            placeholder="Поиск по названию, клиенту..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {filteredEquipment.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Ничего не найдено</p>
            ) : (
              filteredEquipment.map((eq) => (
                <EquipmentListItem
                  key={eq.id}
                  eq={eq}
                  isSelected={eq.id === selectedId}
                  onClick={() => setSelectedId(eq.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══ CENTER PANEL — Timeline ══ */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-gray-200">
        {/* Equipment header */}
        <div className="bg-white px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  sc.badgeVariant === 'success'
                    ? 'bg-green-100 text-green-700'
                    : sc.badgeVariant === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
                <span className="text-xs text-gray-400">{equipment.kind}</span>
              </div>
              <h1 className="text-base font-bold text-gray-900">{equipment.name}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {equipment.model} · С/н: {equipment.serial} · {equipment.client}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-xs gap-1.5 shrink-0">
              <Icon name="Download" className="w-3.5 h-3.5" />
              Скачать отчёт
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white px-5 py-2 border-b border-gray-100 shrink-0 flex items-center gap-3 flex-wrap">
          {/* Type filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {FILTER_TYPES.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors whitespace-nowrap ${
                  filterType === f.key
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Period filter */}
          <div className="flex items-center gap-1 ml-auto flex-wrap">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.months}
                onClick={() => setFilterPeriod(p.months)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors whitespace-nowrap ${
                  filterPeriod === p.months
                    ? 'bg-gray-800 border-gray-800 text-white font-medium'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            {filteredEvents.length} из {allEvents.length}
          </span>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Icon name="ClipboardList" className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Нет событий</p>
                <p className="text-xs mt-1">Попробуйте сбросить фильтры</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-7 text-xs"
                  onClick={() => {
                    setFilterType('all');
                    setFilterPeriod(0);
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            ) : (
              filteredEvents.map((event, idx) => (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  isLast={idx === filteredEvents.length - 1}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — Stats ══ */}
      <div className="w-[340px] shrink-0 bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Статистика</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label="Всего ремонтов"
                value={String(equipment.totalRepairs)}
                sub="за всё время"
                iconName="Wrench"
                iconColor={equipment.totalRepairs > 5 ? 'text-red-400' : 'text-blue-400'}
                accent={equipment.totalRepairs > 5 ? 'text-red-600' : 'text-gray-900'}
              />
              <KpiCard
                label="Потрачено"
                value={`${Math.round(equipment.totalSpent / 1000)}к ₽`}
                sub={formatMoney(equipment.totalSpent)}
                iconName="Banknote"
                iconColor="text-green-400"
              />
              <KpiCard
                label="Наработка"
                value={`${equipment.hoursWorked.toLocaleString('ru-RU')} ч`}
                sub={`с ${equipment.installYear} года`}
                iconName="Clock"
                iconColor="text-purple-400"
              />
              <KpiCard
                label="Надёжность"
                value={`${equipment.reliability}%`}
                sub="за последние 12 мес"
                iconName="ShieldCheck"
                iconColor={
                  equipment.reliability >= 90
                    ? 'text-green-400'
                    : equipment.reliability >= 75
                    ? 'text-amber-400'
                    : 'text-red-400'
                }
                accent={
                  equipment.reliability >= 90
                    ? 'text-green-600'
                    : equipment.reliability >= 75
                    ? 'text-amber-600'
                    : 'text-red-600'
                }
              />
            </div>

            {/* Next maintenance */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <Icon name="CalendarClock" className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-800">Следующее ТО</p>
                <p className="text-sm font-bold text-blue-900 mt-0.5">
                  {formatDate(equipment.nextMaintenance)}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Плановое сезонное обслуживание</p>
              </div>
            </div>

            {/* Monthly repairs chart */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <Icon name="BarChart2" className="w-3.5 h-3.5 text-gray-400" />
                Ремонты по месяцам
              </p>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={monthlyRepairs} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repairsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number) => [v, 'Ремонтов']}
                  />
                  <Area
                    type="monotone"
                    dataKey="repairs"
                    stroke="#3b82f6"
                    fill="url(#repairsGrad)"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Cost by category chart */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <Icon name="PieChart" className="w-3.5 h-3.5 text-gray-400" />
                Затраты по категориям
              </p>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={costCategories} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                  <YAxis
                    tick={{ fontSize: 9 }}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${Math.round(v / 1000)}к` : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number) => [formatMoney(v), 'Затраты']}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {costCategories.map((_, index) => {
                      const colors = ['#ef4444', '#22c55e', '#f97316'];
                      return (
                        <rect key={index} fill={colors[index % colors.length]} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {[
                  { label: 'Ремонт', color: 'bg-red-500' },
                  { label: 'ТО', color: 'bg-green-500' },
                  { label: 'Запчасти', color: 'bg-orange-500' },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-1 text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-sm ${item.color}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment details */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-700">Паспорт оборудования</p>
              {[
                { label: 'Модель', value: equipment.model },
                { label: 'Серийный №', value: equipment.serial },
                { label: 'Год установки', value: String(equipment.installYear) },
                {
                  label: 'Гарантия',
                  value: formatDateShort(equipment.warrantyUntil),
                },
                { label: 'Клиент', value: equipment.client },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-800 font-medium text-right max-w-[170px] truncate">
                    {value}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
