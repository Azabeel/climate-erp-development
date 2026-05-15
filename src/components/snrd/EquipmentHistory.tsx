import { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle,
  Wrench,
  RefreshCw,
  Droplets,
  AlertCircle,
  Activity,
  Calendar,
  User,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type EquipmentStatus = 'online' | 'offline' | 'warning';
type EventType =
  | 'installation'
  | 'maintenance'
  | 'repair'
  | 'part_replacement'
  | 'refrigerant'
  | 'failure'
  | 'measurement';

interface Equipment {
  id: string;
  name: string;
  model: string;
  serial: string;
  type: string;
  status: EquipmentStatus;
  client: string;
  address: string;
  installYear: number;
  warrantyUntil: string;
  hoursWorked: number;
  repairCount: number;
  totalMaintenanceCost: number;
  nextFailurePrediction: string;
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
  hasPhoto: boolean;
}

interface MetricPoint {
  day: string;
  supplyTemp: number;
  returnTemp: number;
  compressorCurrent: number;
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const EQUIPMENT_LIST: Equipment[] = [
  {
    id: 'eq1',
    name: 'Daikin VRV IV (офис «Альфа»)',
    model: 'RXYQ10T',
    serial: 'SN-DK-2021-00312',
    type: 'VRV-система',
    status: 'online',
    client: 'ООО «Альфа Груп»',
    address: 'г. Москва, ул. Ленина, 42',
    installYear: 2021,
    warrantyUntil: '2024-08-15',
    hoursWorked: 14200,
    repairCount: 2,
    totalMaintenanceCost: 87500,
    nextFailurePrediction: 'Риск низкий. Следующее ТО через ~3 месяца.',
  },
  {
    id: 'eq2',
    name: 'Mitsubishi Heavy SRK25 (кв. Иванов)',
    model: 'SRK25ZS-S',
    serial: 'SN-MH-2020-00789',
    type: 'Настенный кондиционер',
    status: 'warning',
    client: 'Иванов Андрей Петрович',
    address: 'г. Москва, Садовая, 18, кв. 7',
    installYear: 2020,
    warrantyUntil: '2023-03-01',
    hoursWorked: 8750,
    repairCount: 4,
    totalMaintenanceCost: 42300,
    nextFailurePrediction: 'Риск средний (~62%). Рекомендуется проверка компрессора.',
  },
  {
    id: 'eq3',
    name: 'Gree GMV-500 (ТЦ «Мираж»)',
    model: 'GMV-500WM/B-X',
    serial: 'SN-GR-2019-01045',
    type: 'Мультизональная система',
    status: 'warning',
    client: 'ООО «Мираж Ритейл»',
    address: 'г. Москва, пр. Мира, 101',
    installYear: 2019,
    warrantyUntil: '2022-05-20',
    hoursWorked: 24100,
    repairCount: 7,
    totalMaintenanceCost: 215000,
    nextFailurePrediction: 'Высокий риск (~78%). Внеплановое ТО в течение 15 дней.',
  },
  {
    id: 'eq4',
    name: 'Carrier 30RB (склад «Восток»)',
    model: '30RB-080',
    serial: 'SN-CR-2022-00214',
    type: 'Чиллер',
    status: 'online',
    client: 'ЗАО «Восток Логистик»',
    address: 'МО, Люберцы, Промзона, д. 3',
    installYear: 2022,
    warrantyUntil: '2025-11-30',
    hoursWorked: 6200,
    repairCount: 0,
    totalMaintenanceCost: 28000,
    nextFailurePrediction: 'Риск низкий. Оборудование в отличном состоянии.',
  },
  {
    id: 'eq5',
    name: 'Systemair SAVE VTR 500 (БЦ «Сириус»)',
    model: 'SAVE VTR 500/B',
    serial: 'SN-SY-2020-00455',
    type: 'Приточно-вытяжная установка',
    status: 'offline',
    client: 'ООО «БЦ Сириус»',
    address: 'г. Москва, Варшавское ш., 79',
    installYear: 2020,
    warrantyUntil: '2023-07-10',
    hoursWorked: 17600,
    repairCount: 3,
    totalMaintenanceCost: 95400,
    nextFailurePrediction: 'Оборудование offline. Требуется диагностика.',
  },
  {
    id: 'eq6',
    name: 'LG Multi V 5 (ресторан «Оливье»)',
    model: 'ARUM100LTE5',
    serial: 'SN-LG-2023-00088',
    type: 'VRF-система',
    status: 'online',
    client: 'ИП Смирнова Е.В.',
    address: 'г. Москва, ул. Тверская, 15',
    installYear: 2023,
    warrantyUntil: '2026-02-28',
    hoursWorked: 3100,
    repairCount: 1,
    totalMaintenanceCost: 12000,
    nextFailurePrediction: 'Риск низкий. Замена фильтров через ~45 дней.',
  },
];

const HISTORY_BY_EQUIPMENT: Record<string, HistoryEvent[]> = {
  eq1: [
    {
      id: 'e1',
      date: '2021-08-15',
      type: 'installation',
      title: 'Монтаж и пуско-наладка',
      description: 'Установка VRV-системы Daikin RXYQ10T. Подключение 8 внутренних блоков. Проверка герметичности, заправка фреоном R-410A (12 кг), пуско-наладочные работы.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2021-000142',
      cost: 45000,
      hasPhoto: true,
    },
    {
      id: 'e2',
      date: '2021-12-10',
      type: 'measurement',
      title: 'Плановые замеры показателей',
      description: 'Снятие рабочих параметров: температура подачи 7°C, возврат 12°C, давление 18.5 бар, ток компрессора 12.4 А.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2021-000398',
      cost: null,
      hasPhoto: false,
    },
    {
      id: 'e3',
      date: '2022-03-20',
      type: 'maintenance',
      title: 'Плановое сезонное ТО',
      description: 'Чистка теплообменников, проверка фильтров, диагностика платы управления, смазка вентиляторов, проверка уровня фреона.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2022-000087',
      cost: 12500,
      hasPhoto: true,
    },
    {
      id: 'e4',
      date: '2022-09-05',
      type: 'failure',
      title: 'Аварийный вызов — ошибка U4',
      description: 'Зафиксирована ошибка U4 (несоответствие мощности). Обнаружена неисправная плата управления внутреннего блока №3.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000321',
      cost: null,
      hasPhoto: false,
    },
    {
      id: 'e5',
      date: '2022-09-07',
      type: 'part_replacement',
      title: 'Замена платы управления',
      description: 'Замена платы управления внутреннего блока №3 (арт. 6871A20109N). Тестирование, подтверждение работоспособности.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000322',
      cost: 18700,
      hasPhoto: true,
    },
    {
      id: 'e6',
      date: '2023-04-12',
      type: 'maintenance',
      title: 'Плановое ТО (весна 2023)',
      description: 'Полный регламент ТО: чистка всех блоков, проверка хладагента, протяжка клемм, обновление прошивки центрального контроллера.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2023-000156',
      cost: 14800,
      hasPhoto: true,
    },
    {
      id: 'e7',
      date: '2023-11-20',
      type: 'refrigerant',
      title: 'Дозаправка хладагентом',
      description: 'Обнаружена микроутечка в соединении 4-го блока. Устранение негерметичности, дозаправка R-410A 0.8 кг из баллона SN-B-2023-045.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2023-000489',
      cost: 5600,
      hasPhoto: false,
    },
    {
      id: 'e8',
      date: '2024-04-08',
      type: 'maintenance',
      title: 'Плановое ТО (весна 2024)',
      description: 'Регламентное ТО перед летним сезоном. Все показатели в норме. Заменены воздушные фильтры в блоках 1-8.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2024-000203',
      cost: 16200,
      hasPhoto: true,
    },
  ],
  eq2: [
    {
      id: 'e1',
      date: '2020-06-10',
      type: 'installation',
      title: 'Монтаж кондиционера',
      description: 'Установка настенного кондиционера Mitsubishi Heavy SRK25ZS-S. Монтаж трассы 3 м, подключение, заправка R-32 (0.9 кг).',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2020-000078',
      cost: 8500,
      hasPhoto: false,
    },
    {
      id: 'e2',
      date: '2021-07-14',
      type: 'maintenance',
      title: 'Чистка и техобслуживание',
      description: 'Глубокая чистка внутреннего блока, чистка наружного блока, проверка давления, дезинфекция.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2021-000234',
      cost: 3200,
      hasPhoto: false,
    },
    {
      id: 'e3',
      date: '2022-05-30',
      type: 'failure',
      title: 'Не охлаждает — ошибка P8',
      description: 'Жалоба клиента: плохое охлаждение. Диагностика: ошибка P8 (перегрев компрессора). Причина — засорение теплообменника и низкий заряд фреона.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000195',
      cost: null,
      hasPhoto: false,
    },
    {
      id: 'e4',
      date: '2022-06-01',
      type: 'refrigerant',
      title: 'Заправка хладагентом R-32',
      description: 'Устранение утечки на внешнем блоке (вибрационное расстяжение), заправка R-32 1.2 кг.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000196',
      cost: 4100,
      hasPhoto: true,
    },
    {
      id: 'e5',
      date: '2023-08-22',
      type: 'repair',
      title: 'Ремонт — шум компрессора',
      description: 'Вибрационный шум наружного блока. Замена антивибрационных подушек, балансировка вентилятора, крепёж панелей корпуса.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2023-000312',
      cost: 5800,
      hasPhoto: false,
    },
    {
      id: 'e6',
      date: '2024-03-15',
      type: 'measurement',
      title: 'Диагностика перед сезоном',
      description: 'Проверка перед летом: ток компрессора 8.2 А (норма до 9 А), давление всасывания 8.5 бар, нагнетание 24 бар. Небольшой износ компрессора.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2024-000118',
      cost: 1500,
      hasPhoto: false,
    },
  ],
  eq3: [
    {
      id: 'e1',
      date: '2019-05-20',
      type: 'installation',
      title: 'Монтаж мультизональной системы Gree GMV-500',
      description: 'Монтаж наружного блока GMV-500WM/B-X и 24 внутренних блоков. Прокладка фреонопроводов (суммарно 180 м), вакуумирование, заправка R-410A (28 кг).',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2019-000033',
      cost: 185000,
      hasPhoto: true,
    },
    {
      id: 'e2',
      date: '2020-05-12',
      type: 'maintenance',
      title: 'Годовое ТО (1 год)',
      description: 'Полный осмотр системы, чистка всех блоков, проверка герметичности контуров, анализ параметров работы.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2020-000124',
      cost: 38000,
      hasPhoto: true,
    },
    {
      id: 'e3',
      date: '2021-02-08',
      type: 'failure',
      title: 'Аварийная остановка — ошибка EA',
      description: 'Остановка 4 блоков (EA — ошибка связи). Нарушение кабеля шины данных из-за механического повреждения (строительные работы в здании).',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2021-000041',
      cost: null,
      hasPhoto: false,
    },
    {
      id: 'e4',
      date: '2021-02-10',
      type: 'repair',
      title: 'Восстановление шины данных',
      description: 'Прокладка нового кабеля шины данных (15 м), тестирование коммуникации всех блоков. Система восстановлена в полном объёме.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2021-000042',
      cost: 12400,
      hasPhoto: false,
    },
    {
      id: 'e5',
      date: '2021-05-20',
      type: 'maintenance',
      title: 'Годовое ТО (2 года)',
      description: 'Регламентное ТО. Выявлена незначительная утечка на 12-м блоке. Уровень фреона: минус 1.5 кг.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2021-000189',
      cost: 42000,
      hasPhoto: true,
    },
    {
      id: 'e6',
      date: '2021-06-05',
      type: 'refrigerant',
      title: 'Дозаправка + устранение утечки',
      description: 'Поиск и устранение утечки (разгерметизация в зоне 12-го блока). Заправка R-410A 1.5 кг.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2021-000201',
      cost: 8700,
      hasPhoto: true,
    },
    {
      id: 'e7',
      date: '2022-05-18',
      type: 'maintenance',
      title: 'Годовое ТО (3 года)',
      description: 'Плановое ТО. Состояние системы удовлетворительное. Замена воздушных фильтров в 18 блоках, чистка теплообменников.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2022-000178',
      cost: 45000,
      hasPhoto: true,
    },
    {
      id: 'e8',
      date: '2023-05-25',
      type: 'maintenance',
      title: 'Годовое ТО (4 года)',
      description: 'Плановое ТО. Износ компрессора наружного блока — 65% ресурса. Рекомендована замена в течение года.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2023-000201',
      cost: 48500,
      hasPhoto: false,
    },
    {
      id: 'e9',
      date: '2024-01-15',
      type: 'failure',
      title: 'Авария — остановка наружного блока',
      description: 'Полная остановка наружного блока: ошибка H7 (блокировка вентилятора). Вышел из строя двигатель вентилятора наружного блока.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2024-000028',
      cost: null,
      hasPhoto: false,
    },
    {
      id: 'e10',
      date: '2024-01-17',
      type: 'part_replacement',
      title: 'Замена двигателя вентилятора',
      description: 'Замена двигателя вентилятора наружного блока (арт. 1506309). Тестирование системы под нагрузкой, все блоки в работе.',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2024-000029',
      cost: 22500,
      hasPhoto: true,
    },
  ],
  eq4: [
    {
      id: 'e1',
      date: '2022-11-30',
      type: 'installation',
      title: 'Монтаж чиллера Carrier 30RB-080',
      description: 'Монтаж чиллера с воздушным охлаждением. Подключение к системе гидравлики здания, пуско-наладочные работы, заправка R-134a (18 кг).',
      engineer: 'Петров Д.В.',
      workOrderId: 'WO-2022-000412',
      cost: 125000,
      hasPhoto: true,
    },
    {
      id: 'e2',
      date: '2023-04-10',
      type: 'measurement',
      title: 'Пуск после зимнего простоя',
      description: 'Плановый пуск после зимы. Температура чиллерной воды 6/12°C. Все параметры в норме.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2023-000148',
      cost: 3500,
      hasPhoto: false,
    },
    {
      id: 'e3',
      date: '2023-10-15',
      type: 'maintenance',
      title: 'Осеннее ТО и консервация',
      description: 'Сезонное обслуживание: промывка теплообменника, проверка гликолевого раствора (концентрация 30%), консервация на зиму.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2023-000398',
      cost: 28000,
      hasPhoto: false,
    },
  ],
  eq5: [
    {
      id: 'e1',
      date: '2020-09-01',
      type: 'installation',
      title: 'Монтаж вентустановки Systemair SAVE VTR 500',
      description: 'Монтаж приточно-вытяжной установки с рекуперацией. Подключение воздуховодов, автоматики, настройка расходов воздуха.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2020-000189',
      cost: 72000,
      hasPhoto: true,
    },
    {
      id: 'e2',
      date: '2021-03-20',
      type: 'maintenance',
      title: 'Замена фильтров (весна)',
      description: 'Плановая замена фильтров G4 и F7. Очистка роторного рекуператора.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2021-000098',
      cost: 8500,
      hasPhoto: false,
    },
    {
      id: 'e3',
      date: '2022-01-25',
      type: 'failure',
      title: 'Остановка — ошибка температурного датчика',
      description: 'Установка остановилась по ошибке температурного датчика приточного воздуха. Неисправность датчика NTC.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2022-000032',
      cost: null,
      hasPhoto: false,
    },
    {
      id: 'e4',
      date: '2022-01-26',
      type: 'part_replacement',
      title: 'Замена датчика температуры',
      description: 'Замена датчика температуры приточного воздуха NTC (арт. 4-055-1300). Установка восстановлена.',
      engineer: 'Сидоров А.Н.',
      workOrderId: 'WO-2022-000033',
      cost: 3200,
      hasPhoto: false,
    },
    {
      id: 'e5',
      date: '2023-04-11',
      type: 'maintenance',
      title: 'Полное ТО (3 года эксплуатации)',
      description: 'Комплексное обслуживание: фильтры G4+F7, очистка рекуператора, смазка подшипников вентиляторов, проверка автоматики.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2023-000155',
      cost: 18000,
      hasPhoto: true,
    },
    {
      id: 'e6',
      date: '2024-04-01',
      type: 'failure',
      title: 'Нет связи с оборудованием',
      description: 'Оборудование перешло в состояние offline. Неисправен модуль Modbus. Требуется диагностика на месте.',
      engineer: '',
      workOrderId: null,
      cost: null,
      hasPhoto: false,
    },
  ],
  eq6: [
    {
      id: 'e1',
      date: '2023-02-28',
      type: 'installation',
      title: 'Монтаж LG Multi V 5',
      description: 'Установка мультизональной системы LG ARUM100LTE5 с 6 внутренними блоками. Прокладка трасс, заправка R-410A (9 кг).',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2023-000058',
      cost: 68000,
      hasPhoto: true,
    },
    {
      id: 'e2',
      date: '2023-09-10',
      type: 'measurement',
      title: 'Замеры после летнего сезона',
      description: 'Параметры системы после первого лета: температура подачи 8°C, ток 14.2 А. Всё в норме.',
      engineer: 'Козлов М.П.',
      workOrderId: 'WO-2023-000365',
      cost: 2000,
      hasPhoto: false,
    },
    {
      id: 'e3',
      date: '2024-03-05',
      type: 'maintenance',
      title: 'Первое плановое ТО',
      description: 'ТО через 1 год: чистка блоков, проверка уровня фреона, замена фильтров. Всё в норме.',
      engineer: 'Фёдоров И.С.',
      workOrderId: 'WO-2024-000092',
      cost: 12000,
      hasPhoto: false,
    },
  ],
};

function generateMetrics(equipmentId: string): MetricPoint[] {
  const seed = equipmentId.charCodeAt(equipmentId.length - 1);
  const points: MetricPoint[] = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const variation = Math.sin((i + seed) * 0.4) * 1.5;
    points.push({
      day,
      supplyTemp: parseFloat((7 + variation + (seed % 3)).toFixed(1)),
      returnTemp: parseFloat((12 + variation * 0.7 + (seed % 3)).toFixed(1)),
      compressorCurrent: parseFloat((12 + Math.cos((i + seed) * 0.3) * 2).toFixed(1)),
    });
  }
  return points;
}

// ─────────────────────────────────────────────
// Config maps
// ─────────────────────────────────────────────

const EVENT_CONFIG: Record<
  EventType,
  { label: string; color: string; bg: string; border: string; dot: string; icon: React.FC<{ className?: string }> }
> = {
  installation: {
    label: 'Установка',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    icon: Package,
  },
  maintenance: {
    label: 'Плановое ТО',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    icon: CheckCircle,
  },
  repair: {
    label: 'Ремонт',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: Wrench,
  },
  part_replacement: {
    label: 'Замена запчасти',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    icon: RefreshCw,
  },
  refrigerant: {
    label: 'Заправка фреоном',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    icon: Droplets,
  },
  failure: {
    label: 'Поломка',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: AlertCircle,
  },
  measurement: {
    label: 'Замер показателей',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    icon: Activity,
  },
};

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; dot: string; badge: string }> = {
  online: { label: 'Online', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  offline: { label: 'Offline', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' },
  warning: { label: 'Внимание', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
};

const ALL_EVENT_TYPES: EventType[] = [
  'installation',
  'maintenance',
  'repair',
  'part_replacement',
  'refrigerant',
  'failure',
  'measurement',
];

const PERIOD_OPTIONS = [
  { label: 'Всё время', months: 0 },
  { label: 'Последний год', months: 12 },
  { label: 'Последние 3 месяца', months: 3 },
  { label: 'Последний месяц', months: 1 },
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCost(cost: number): string {
  return cost.toLocaleString('ru-RU') + ' ₽';
}

interface EquipmentCardProps {
  equipment: Equipment;
}

function EquipmentSummaryCard({ equipment }: EquipmentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[equipment.status].badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[equipment.status].dot}`} />
              {STATUS_CONFIG[equipment.status].label}
            </span>
            <span className="text-xs text-gray-400">{equipment.type}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 truncate">{equipment.model}</h2>
          <p className="text-sm text-gray-500 mt-0.5">С/н: {equipment.serial}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {equipment.client}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {equipment.address}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat label="Год установки" value={String(equipment.installYear)} />
          <Stat label="Гарантия до" value={new Date(equipment.warrantyUntil).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })} />
          <Stat label="Наработка" value={`${equipment.hoursWorked.toLocaleString('ru-RU')} ч`} />
          <Stat label="Ремонтов" value={String(equipment.repairCount)} accent={equipment.repairCount > 3 ? 'red' : 'default'} />
          <Stat label="Затраты на ТО" value={formatCost(equipment.totalMaintenanceCost)} />
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <Activity className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">{equipment.nextFailurePrediction}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = 'default',
}: {
  label: string;
  value: string;
  accent?: 'default' | 'red';
}) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 text-center min-w-[80px]">
      <p className={`text-base font-semibold ${accent === 'red' ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">{label}</p>
    </div>
  );
}

interface TimelineEventProps {
  event: HistoryEvent;
  isLast: boolean;
}

function TimelineEvent({ event, isLast }: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = EVENT_CONFIG[event.type];
  const EventIcon = cfg.icon;

  return (
    <div className="flex gap-3">
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow ${cfg.dot}`}>
          <EventIcon className="w-4 h-4 text-white" />
        </div>
        {!isLast && <div className="w-0.5 bg-gray-200 flex-1 mt-1 mb-1" />}
      </div>

      {/* Content */}
      <div className={`flex-1 rounded-xl border ${cfg.border} ${cfg.bg} p-3 mb-4`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white border ${cfg.border} ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(event.date)}
              </span>
            </div>
            <p className="font-medium text-gray-900 mt-1 text-sm">{event.title}</p>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
          >
            {expanded ? (
              <ChevronLeft className="w-4 h-4 rotate-90" />
            ) : (
              <ChevronRight className="w-4 h-4 rotate-90" />
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-current/10 space-y-2">
            <p className="text-sm text-gray-700">{event.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {event.engineer && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {event.engineer}
                </span>
              )}
              {event.workOrderId && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.workOrderId}
                </span>
              )}
              {event.cost !== null && (
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <DollarSign className="w-3 h-3" />
                  {formatCost(event.cost)}
                </span>
              )}
              {event.hasPhoto && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Package className="w-3 h-3" />
                  Есть фото
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function EquipmentHistory() {
  const [selectedId, setSelectedId] = useState<string>('eq1');
  const [filterTypes, setFilterTypes] = useState<Set<EventType>>(new Set());
  const [filterPeriod, setFilterPeriod] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);

  const equipment = EQUIPMENT_LIST.find((e) => e.id === selectedId)!;
  const allEvents = HISTORY_BY_EQUIPMENT[selectedId] ?? [];
  const metrics = useMemo(() => generateMetrics(selectedId), [selectedId]);

  const filteredEvents = useMemo(() => {
    let events = [...allEvents].reverse(); // newest first
    if (filterTypes.size > 0) {
      events = events.filter((e) => filterTypes.has(e.type));
    }
    if (filterPeriod > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - filterPeriod);
      events = events.filter((e) => new Date(e.date) >= cutoff);
    }
    return events;
  }, [allEvents, filterTypes, filterPeriod]);

  function toggleType(type: EventType) {
    setFilterTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function clearFilters() {
    setFilterTypes(new Set());
    setFilterPeriod(0);
  }

  const hasActiveFilters = filterTypes.size > 0 || filterPeriod > 0;

  return (
    <div className="flex h-full bg-gray-50 min-h-0 overflow-hidden">
      {/* ── Equipment list (left panel) ── */}
      <div
        className={`shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ${
          listCollapsed ? 'w-12' : 'w-72'
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
          {!listCollapsed && (
            <span className="text-sm font-semibold text-gray-700">Оборудование</span>
          )}
          <button
            onClick={() => setListCollapsed((v) => !v)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 ml-auto"
          >
            {listCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!listCollapsed && (
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {EQUIPMENT_LIST.map((eq) => {
                const sc = STATUS_CONFIG[eq.status];
                const isActive = eq.id === selectedId;
                return (
                  <button
                    key={eq.id}
                    onClick={() => setSelectedId(eq.id)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                      <span className="text-sm font-medium text-gray-900 truncate">{eq.model}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate pl-4">{eq.type}</p>
                    <p className="text-xs text-gray-400 truncate pl-4">{eq.client}</p>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {listCollapsed && (
          <div className="flex-1 flex flex-col items-center pt-2 gap-1">
            {EQUIPMENT_LIST.map((eq) => {
              const sc = STATUS_CONFIG[eq.status];
              return (
                <button
                  key={eq.id}
                  onClick={() => setSelectedId(eq.id)}
                  title={eq.model}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    eq.id === selectedId ? 'border-blue-400' : 'border-transparent'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${sc.dot}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-4 max-w-4xl">
            {/* Summary card */}
            <EquipmentSummaryCard equipment={equipment} />

            {/* Metrics chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Показатели за последние 30 дней
              </h3>
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Температура подачи / возврата, °C</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={metrics} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(v: number, name: string) => [
                        `${v} °C`,
                        name === 'supplyTemp' ? 'Подача' : 'Возврат',
                      ]}
                    />
                    <Area type="monotone" dataKey="supplyTemp" stroke="#3b82f6" fill="url(#supplyGrad)" strokeWidth={1.5} dot={false} />
                    <Area type="monotone" dataKey="returnTemp" stroke="#10b981" fill="url(#returnGrad)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Ток компрессора, А</p>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={metrics} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(v: number) => [`${v} А`, 'Ток']}
                    />
                    <Line type="monotone" dataKey="compressorCurrent" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Timeline section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              {/* Timeline header + filters */}
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-700">
                  Хронология событий
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {filteredEvents.length} из {allEvents.length}
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Сбросить
                    </button>
                  )}
                  <Button
                    variant={showFilters ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowFilters((v) => !v)}
                    className="h-7 text-xs gap-1"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Фильтр
                    {hasActiveFilters && (
                      <span className="ml-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {filterTypes.size + (filterPeriod > 0 ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Filter panel */}
              {showFilters && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Тип события</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_EVENT_TYPES.map((type) => {
                        const cfg = EVENT_CONFIG[type];
                        const active = filterTypes.has(type);
                        return (
                          <button
                            key={type}
                            onClick={() => toggleType(type)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                              active
                                ? `${cfg.bg} ${cfg.border} ${cfg.color} font-medium`
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <cfg.icon className="w-3 h-3" />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Период</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PERIOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.months}
                          onClick={() => setFilterPeriod(opt.months)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                            filterPeriod === opt.months
                              ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {filteredEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Нет событий по выбранным фильтрам</p>
                </div>
              ) : (
                <div>
                  {filteredEvents.map((event, idx) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isLast={idx === filteredEvents.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
