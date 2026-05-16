import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Типы ─────────────────────────────────────────────────────────────────────

type EquipmentType =
  | 'VRF'
  | 'Сплит-система'
  | 'Чиллер'
  | 'Фанкойл'
  | 'Вентиляция'
  | 'Тепловой насос';

type EquipmentStatus = 'Исправно' | 'Требует ТО' | 'В ремонте';

interface WorkOrderRecord {
  id: string;
  date: string;
  type: string;
  engineer: string;
  result: string;
}

interface RefrigerantRecord {
  date: string;
  operation: 'Заправка' | 'Дозаправка' | 'Рекуперация';
  kg: number;
  engineer: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serial: string;
  installYear: number;
  location: string;
  client: string;
  status: EquipmentStatus;
  nextMaintenance: string;
  mtbf: number;
  refrigerant?: string;
  hasIoT: boolean;
  workOrders: WorkOrderRecord[];
  refrigerantLog?: RefrigerantRecord[];
}

// ─── Моковые данные: 15 единиц оборудования ───────────────────────────────────

const EQUIPMENT_LIST: EquipmentItem[] = [
  {
    id: 'EQ-001',
    name: 'VRF-система Daikin VRV IV',
    type: 'VRF',
    brand: 'Daikin',
    model: 'RYYQ14T',
    serial: 'DK2021-0014-A',
    installYear: 2021,
    location: 'БЦ «Горизонт», корп. А, кровля',
    client: 'ООО «Горизонт-Девелопмент»',
    status: 'Исправно',
    nextMaintenance: '2026-06-10',
    mtbf: 312,
    refrigerant: 'R-410A',
    hasIoT: true,
    workOrders: [
      { id: 'WO-2026-000124', date: '2026-04-15', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2025-000876', date: '2025-10-20', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2025-000412', date: '2025-05-08', type: 'Ремонт', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2024-000981', date: '2024-11-14', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-000534', date: '2024-06-02', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2025-05-08', operation: 'Дозаправка', kg: 0.6, engineer: 'Петров А.' },
      { date: '2024-06-02', operation: 'Заправка', kg: 2.4, engineer: 'Козлов В.' },
      { date: '2023-09-15', operation: 'Рекуперация', kg: 1.8, engineer: 'Иванов С.' },
    ],
  },
  {
    id: 'EQ-002',
    name: 'Сплит-система Mitsubishi Electric',
    type: 'Сплит-система',
    brand: 'Mitsubishi Electric',
    model: 'MSZ-LN25VGR',
    serial: 'ME2022-LN25-007',
    installYear: 2022,
    location: 'Офис «Альфа», каб. 301',
    client: 'АО «Альфа-Технологии»',
    status: 'Исправно',
    nextMaintenance: '2026-05-20',
    mtbf: 445,
    refrigerant: 'R-32',
    hasIoT: false,
    workOrders: [
      { id: 'WO-2026-000098', date: '2026-03-10', type: 'ТО', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2025-000654', date: '2025-09-05', type: 'ТО', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2024-000789', date: '2024-04-22', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2023-000341', date: '2023-11-17', type: 'Чистка', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2023-000102', date: '2023-06-30', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2025-09-05', operation: 'Дозаправка', kg: 0.2, engineer: 'Сидоров М.' },
      { date: '2022-07-18', operation: 'Заправка', kg: 0.95, engineer: 'Иванов С.' },
    ],
  },
  {
    id: 'EQ-003',
    name: 'Чиллер York YVAA',
    type: 'Чиллер',
    brand: 'York',
    model: 'YVAA0087SE-46XN',
    serial: 'YK2020-0087-C',
    installYear: 2020,
    location: 'ТЦ «Меридиан», технич. этаж',
    client: 'ООО «ТЦ Меридиан»',
    status: 'Требует ТО',
    nextMaintenance: '2026-05-16',
    mtbf: 198,
    refrigerant: 'R-134a',
    hasIoT: true,
    workOrders: [
      { id: 'WO-2026-000141', date: '2026-04-28', type: 'Диагностика', engineer: 'Петров А.', result: 'Требует ТО' },
      { id: 'WO-2025-000920', date: '2025-11-12', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2025-000401', date: '2025-05-19', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2024-001010', date: '2024-12-03', type: 'Ремонт', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-000612', date: '2024-07-08', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2026-04-28', operation: 'Дозаправка', kg: 1.2, engineer: 'Петров А.' },
      { date: '2025-05-19', operation: 'Рекуперация', kg: 4.5, engineer: 'Козлов В.' },
      { date: '2024-07-08', operation: 'Заправка', kg: 5.0, engineer: 'Петров А.' },
    ],
  },
  {
    id: 'EQ-004',
    name: 'Фанкойл Carrier 42WC',
    type: 'Фанкойл',
    brand: 'Carrier',
    model: '42WCE012',
    serial: 'CA2021-42WC-012',
    installYear: 2021,
    location: 'Гостиница «Астория», номер 215',
    client: 'ООО «Астория Отель»',
    status: 'Исправно',
    nextMaintenance: '2026-07-01',
    mtbf: 520,
    hasIoT: false,
    workOrders: [
      { id: 'WO-2026-000067', date: '2026-02-14', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2025-000488', date: '2025-08-22', type: 'Чистка', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2024-000900', date: '2024-10-31', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-000310', date: '2024-04-17', type: 'Замена фильтра', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2023-000550', date: '2023-09-05', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
    ],
  },
  {
    id: 'EQ-005',
    name: 'Приточная установка Systemair SAVE',
    type: 'Вентиляция',
    brand: 'Systemair',
    model: 'SAVE VSR 300',
    serial: 'SY2022-VSR-300-05',
    installYear: 2022,
    location: 'БЦ «Горизонт», корп. Б',
    client: 'ООО «Горизонт-Девелопмент»',
    status: 'Исправно',
    nextMaintenance: '2026-08-15',
    mtbf: 610,
    hasIoT: true,
    workOrders: [
      { id: 'WO-2026-000033', date: '2026-01-20', type: 'Замена фильтра', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2025-000300', date: '2025-07-11', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2024-000750', date: '2024-09-25', type: 'Замена фильтра', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-000200', date: '2024-03-12', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2023-000480', date: '2023-08-28', type: 'Настройка', engineer: 'Петров А.', result: 'Выполнено' },
    ],
  },
  {
    id: 'EQ-006',
    name: 'Тепловой насос Daikin Altherma',
    type: 'Тепловой насос',
    brand: 'Daikin',
    model: 'EHBH16D9W',
    serial: 'DK2023-EHBH-016-B',
    installYear: 2023,
    location: 'Коттедж Сосновка, пос. 14',
    client: 'Смирнов Д.В.',
    status: 'В ремонте',
    nextMaintenance: '2026-06-30',
    mtbf: 180,
    refrigerant: 'R-32',
    hasIoT: false,
    workOrders: [
      { id: 'WO-2026-000155', date: '2026-05-01', type: 'Ремонт', engineer: 'Петров А.', result: 'В процессе' },
      { id: 'WO-2026-000088', date: '2026-03-22', type: 'Диагностика', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2025-000810', date: '2025-10-14', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2025-000210', date: '2025-04-06', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2023-000890', date: '2023-12-15', type: 'Ввод в эксплуатацию', engineer: 'Петров А.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2026-05-01', operation: 'Рекуперация', kg: 1.5, engineer: 'Петров А.' },
      { date: '2023-12-15', operation: 'Заправка', kg: 3.1, engineer: 'Петров А.' },
    ],
  },
  {
    id: 'EQ-007',
    name: 'VRF-система Daikin VRV IV-S',
    type: 'VRF',
    brand: 'Daikin',
    model: 'RXYSQ5T7V1B',
    serial: 'DK2022-5T7V-003',
    installYear: 2022,
    location: 'Офис «Бета», 2 этаж',
    client: 'АО «Бета-Консалт»',
    status: 'Исправно',
    nextMaintenance: '2026-09-05',
    mtbf: 390,
    refrigerant: 'R-410A',
    hasIoT: true,
    workOrders: [
      { id: 'WO-2026-000110', date: '2026-04-02', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2025-000670', date: '2025-09-18', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2025-000101', date: '2025-03-07', type: 'Чистка', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2024-000820', date: '2024-10-14', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2024-000200', date: '2024-04-01', type: 'Настройка', engineer: 'Петров А.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2025-09-18', operation: 'Дозаправка', kg: 0.4, engineer: 'Козлов В.' },
      { date: '2022-08-10', operation: 'Заправка', kg: 3.8, engineer: 'Иванов С.' },
    ],
  },
  {
    id: 'EQ-008',
    name: 'Сплит-система Mitsubishi Heavy',
    type: 'Сплит-система',
    brand: 'Mitsubishi Heavy',
    model: 'SRK35ZS-S',
    serial: 'MH2020-SRK35-018',
    installYear: 2020,
    location: 'Магазин «Электрон», торг. зал',
    client: 'ООО «Электрон-Ритейл»',
    status: 'Требует ТО',
    nextMaintenance: '2026-05-16',
    mtbf: 210,
    refrigerant: 'R-410A',
    hasIoT: false,
    workOrders: [
      { id: 'WO-2026-000130', date: '2026-04-20', type: 'Диагностика', engineer: 'Иванов С.', result: 'Требует ТО' },
      { id: 'WO-2025-000750', date: '2025-10-05', type: 'ТО', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2025-000350', date: '2025-05-30', type: 'Чистка', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-000940', date: '2024-11-22', type: 'ТО', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2024-000430', date: '2024-05-17', type: 'Ремонт', engineer: 'Петров А.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2025-10-05', operation: 'Дозаправка', kg: 0.5, engineer: 'Сидоров М.' },
      { date: '2024-05-17', operation: 'Заправка', kg: 1.1, engineer: 'Петров А.' },
    ],
  },
  {
    id: 'EQ-009',
    name: 'Фанкойл Carrier 40UU',
    type: 'Фанкойл',
    brand: 'Carrier',
    model: '40UU025C',
    serial: 'CA2019-40UU-025',
    installYear: 2019,
    location: 'Гостиница «Астория», конф. зал',
    client: 'ООО «Астория Отель»',
    status: 'Исправно',
    nextMaintenance: '2026-10-01',
    mtbf: 580,
    hasIoT: false,
    workOrders: [
      { id: 'WO-2026-000045', date: '2026-02-05', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2025-000520', date: '2025-08-12', type: 'Замена фильтра', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-000840', date: '2024-10-28', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2024-000290', date: '2024-04-09', type: 'Чистка', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2023-000670', date: '2023-09-20', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
    ],
  },
  {
    id: 'EQ-010',
    name: 'Рекуператор Systemair SAVE VTR',
    type: 'Вентиляция',
    brand: 'Systemair',
    model: 'SAVE VTR 150/B',
    serial: 'SY2021-VTR-150-09',
    installYear: 2021,
    location: 'Клиника «МедЦентр», блок А',
    client: 'ООО «МедЦентр Плюс»',
    status: 'Исправно',
    nextMaintenance: '2026-06-22',
    mtbf: 490,
    hasIoT: true,
    workOrders: [
      { id: 'WO-2026-000079', date: '2026-03-01', type: 'Замена фильтра', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2025-000580', date: '2025-09-10', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2024-000710', date: '2024-09-02', type: 'Замена фильтра', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-000180', date: '2024-03-25', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2023-000440', date: '2023-08-14', type: 'Настройка ДУ', engineer: 'Петров А.', result: 'Выполнено' },
    ],
  },
  {
    id: 'EQ-011',
    name: 'Чиллер Carrier 30XA',
    type: 'Чиллер',
    brand: 'Carrier',
    model: '30XA1802',
    serial: 'CA2018-30XA-002',
    installYear: 2018,
    location: 'Завод «Металлист», цех №3',
    client: 'АО «Металлист»',
    status: 'Требует ТО',
    nextMaintenance: '2026-05-18',
    mtbf: 155,
    refrigerant: 'R-134a',
    hasIoT: true,
    workOrders: [
      { id: 'WO-2026-000148', date: '2026-04-25', type: 'Диагностика', engineer: 'Петров А.', result: 'Требует ТО' },
      { id: 'WO-2025-000890', date: '2025-11-05', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2025-000450', date: '2025-06-12', type: 'Ремонт', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-001050', date: '2024-12-18', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2024-000650', date: '2024-07-30', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2026-04-25', operation: 'Дозаправка', kg: 2.0, engineer: 'Петров А.' },
      { date: '2025-06-12', operation: 'Рекуперация', kg: 8.5, engineer: 'Иванов С.' },
      { date: '2018-05-20', operation: 'Заправка', kg: 12.0, engineer: 'Козлов В.' },
    ],
  },
  {
    id: 'EQ-012',
    name: 'Сплит-система Daikin Emura',
    type: 'Сплит-система',
    brand: 'Daikin',
    model: 'FTXJ35MW',
    serial: 'DK2023-FTXJ35-011',
    installYear: 2023,
    location: 'Офис «Альфа», каб. 115',
    client: 'АО «Альфа-Технологии»',
    status: 'Исправно',
    nextMaintenance: '2026-09-20',
    mtbf: 480,
    refrigerant: 'R-32',
    hasIoT: false,
    workOrders: [
      { id: 'WO-2026-000055', date: '2026-02-18', type: 'ТО', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2025-000420', date: '2025-08-07', type: 'Чистка', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2024-000870', date: '2024-11-03', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-000330', date: '2024-05-22', type: 'Замена фильтра', engineer: 'Сидоров М.', result: 'Выполнено' },
      { id: 'WO-2023-001010', date: '2023-12-28', type: 'Ввод в эксплуатацию', engineer: 'Иванов С.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2023-12-28', operation: 'Заправка', kg: 0.88, engineer: 'Иванов С.' },
    ],
  },
  {
    id: 'EQ-013',
    name: 'Тепловой насос Mitsubishi Zubadan',
    type: 'Тепловой насос',
    brand: 'Mitsubishi Electric',
    model: 'PUZ-SHZ60VHA',
    serial: 'ME2021-SHZ60-004',
    installYear: 2021,
    location: 'Загородный дом, пос. Берёзки',
    client: 'Воронова Е.А.',
    status: 'В ремонте',
    nextMaintenance: '2026-07-10',
    mtbf: 160,
    refrigerant: 'R-410A',
    hasIoT: false,
    workOrders: [
      { id: 'WO-2026-000162', date: '2026-05-05', type: 'Ремонт', engineer: 'Козлов В.', result: 'В процессе' },
      { id: 'WO-2026-000095', date: '2026-03-28', type: 'Диагностика', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2025-000830', date: '2025-10-20', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2025-000240', date: '2025-04-14', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2021-000920', date: '2021-11-08', type: 'Ввод в эксплуатацию', engineer: 'Козлов В.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2026-05-05', operation: 'Рекуперация', kg: 2.3, engineer: 'Козлов В.' },
      { date: '2021-11-08', operation: 'Заправка', kg: 4.2, engineer: 'Козлов В.' },
    ],
  },
  {
    id: 'EQ-014',
    name: 'VRF-система Daikin VRV IV-Q',
    type: 'VRF',
    brand: 'Daikin',
    model: 'RQCEQ140A9W1B',
    serial: 'DK2020-Q140-001',
    installYear: 2020,
    location: 'ТЦ «Меридиан», вход. группа',
    client: 'ООО «ТЦ Меридиан»',
    status: 'Исправно',
    nextMaintenance: '2026-06-05',
    mtbf: 275,
    refrigerant: 'R-410A',
    hasIoT: true,
    workOrders: [
      { id: 'WO-2026-000118', date: '2026-04-10', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2025-000700', date: '2025-09-28', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2025-000280', date: '2025-04-25', type: 'Чистка', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2024-000960', date: '2024-11-30', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' },
      { id: 'WO-2024-000470', date: '2024-06-15', type: 'Дозаправка', engineer: 'Иванов С.', result: 'Выполнено' },
    ],
    refrigerantLog: [
      { date: '2024-06-15', operation: 'Дозаправка', kg: 0.8, engineer: 'Иванов С.' },
      { date: '2020-06-01', operation: 'Заправка', kg: 6.5, engineer: 'Козлов В.' },
    ],
  },
  {
    id: 'EQ-015',
    name: 'Приточная установка Systemair MUB',
    type: 'Вентиляция',
    brand: 'Systemair',
    model: 'MUB 062 355D',
    serial: 'SY2023-MUB-355-12',
    installYear: 2023,
    location: 'Клиника «МедЦентр», операц.',
    client: 'ООО «МедЦентр Плюс»',
    status: 'Требует ТО',
    nextMaintenance: '2026-05-21',
    mtbf: 230,
    hasIoT: true,
    workOrders: [
      { id: 'WO-2026-000135', date: '2026-04-22', type: 'Диагностика', engineer: 'Козлов В.', result: 'Требует ТО' },
      { id: 'WO-2025-000760', date: '2025-10-08', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2025-000160', date: '2025-03-17', type: 'Замена фильтра', engineer: 'Иванов С.', result: 'Выполнено' },
      { id: 'WO-2024-001000', date: '2024-12-10', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' },
      { id: 'WO-2023-001050', date: '2023-12-20', type: 'Ввод в эксплуатацию', engineer: 'Петров А.', result: 'Выполнено' },
    ],
  },
];

// ─── Данные для аналитики ─────────────────────────────────────────────────────

const STATUS_PIE_DATA = [
  { name: 'Исправно', value: 241, color: '#10b981' },
  { name: 'Требует ТО', value: 31, color: '#f59e0b' },
  { name: 'В ремонте', value: 12, color: '#ef4444' },
];

const ORDERS_BY_TYPE_DATA = [
  { type: 'VRF', нарядов: 38 },
  { type: 'Сплит', нарядов: 67 },
  { type: 'Чиллер', нарядов: 22 },
  { type: 'Фанкойл', нарядов: 45 },
  { type: 'Вентиляция', нарядов: 33 },
  { type: 'Тепл. насос', нарядов: 18 },
];

const MTBF_TREND_DATA = [
  { month: 'Июн', mtbf: 340 },
  { month: 'Июл', mtbf: 320 },
  { month: 'Авг', mtbf: 355 },
  { month: 'Сен', mtbf: 370 },
  { month: 'Окт', mtbf: 348 },
  { month: 'Ноя', mtbf: 330 },
  { month: 'Дек', mtbf: 315 },
  { month: 'Янв', mtbf: 290 },
  { month: 'Фев', mtbf: 305 },
  { month: 'Мар', mtbf: 322 },
  { month: 'Апр', mtbf: 338 },
  { month: 'Май', mtbf: 350 },
];

// Генерация температурного тренда за 30 дней (IoT моковые данные)
const generateTemperatureData = () =>
  Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    setpoint: 22,
    actual: parseFloat((21 + Math.sin(i * 0.4) * 1.5 + Math.random() * 0.8 - 0.4).toFixed(1)),
    outdoor: parseFloat((14 + Math.sin(i * 0.2) * 6 + Math.random() * 2 - 1).toFixed(1)),
  }));

const TEMP_DATA = generateTemperatureData();

// ─── Вспомогательные функции ──────────────────────────────────────────────────

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  'Исправно': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Требует ТО': 'bg-amber-100 text-amber-700 border-amber-200',
  'В ремонте': 'bg-red-100 text-red-700 border-red-200',
};

const TYPE_ICONS: Record<EquipmentType, string> = {
  VRF: 'Wind',
  'Сплит-система': 'AirVent',
  Чиллер: 'Thermometer',
  Фанкойл: 'Fan',
  Вентиляция: 'RefreshCw',
  'Тепловой насос': 'Zap',
};

const REFRIGERANT_OP_COLORS: Record<string, string> = {
  Заправка: 'bg-blue-100 text-blue-700',
  Дозаправка: 'bg-cyan-100 text-cyan-700',
  Рекуперация: 'bg-purple-100 text-purple-700',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

const isToday = (iso: string) => {
  const today = new Date();
  const d = new Date(iso);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

const isSoon = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
};

const mtbfReliability = (mtbf: number) => {
  if (mtbf >= 400) return { label: 'Высокая', color: 'text-emerald-600' };
  if (mtbf >= 250) return { label: 'Средняя', color: 'text-amber-600' };
  return { label: 'Низкая', color: 'text-red-600' };
};

// ─── Компонент MetricCard ─────────────────────────────────────────────────────

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
}

const MetricCard = ({ icon, label, value, sub, iconBg, iconColor, highlight }: MetricCardProps) => (
  <div className={`bg-white rounded-xl border p-4 flex items-start gap-3 shadow-sm ${highlight ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'}`}>
    <div className={`${iconBg} rounded-lg p-2 flex-shrink-0`}>
      <Icon name={icon} size={20} className={iconColor} />
    </div>
    <div>
      <p className="text-xs text-slate-500 leading-tight">{label}</p>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Основной компонент ───────────────────────────────────────────────────────

const EquipmentFull = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [selected, setSelected] = useState<EquipmentItem | null>(EQUIPMENT_LIST[0]);

  // Уникальные клиенты для фильтра
  const clients = useMemo(() => {
    const unique = Array.from(new Set(EQUIPMENT_LIST.map((e) => e.client)));
    return unique.sort();
  }, []);

  // Фильтрация
  const filtered = useMemo(() => {
    return EQUIPMENT_LIST.filter((eq) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        eq.name.toLowerCase().includes(q) ||
        eq.serial.toLowerCase().includes(q) ||
        eq.model.toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || eq.type === typeFilter;
      const matchStatus = statusFilter === 'all' || eq.status === statusFilter;
      const matchClient = clientFilter === 'all' || eq.client === clientFilter;
      return matchSearch && matchType && matchStatus && matchClient;
    });
  }, [search, typeFilter, statusFilter, clientFilter]);

  const handleSelect = (eq: EquipmentItem) => {
    setSelected(eq);
  };

  const handleQR = () => {
    toast.success(`QR-код для ${selected?.name} скопирован в буфер`);
  };

  const handleNewOrder = () => {
    toast.success(`Создан наряд для ${selected?.name}`);
  };

  const handleExport = () => {
    toast.info('Экспорт реестра в Excel...');
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-50 min-h-screen">
      {/* ── Заголовок ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Реестр оборудования</h1>
          <p className="text-sm text-slate-500">EAM — управление активами климатического оборудования</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Icon name="Download" size={14} className="mr-1" />
            Экспорт
          </Button>
          <Button size="sm" onClick={() => toast.success('Открыта форма добавления оборудования')}>
            <Icon name="Plus" size={14} className="mr-1" />
            Добавить
          </Button>
        </div>
      </div>

      {/* ── Метрики ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard icon="Package" label="Единиц оборудования" value="284" iconBg="bg-blue-100" iconColor="text-blue-600" />
        <MetricCard icon="CheckCircle" label="Исправно" value="241" sub="85%" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <MetricCard icon="AlertTriangle" label="Требует ТО" value="31" sub="11%" iconBg="bg-amber-100" iconColor="text-amber-600" />
        <MetricCard icon="Wrench" label="В ремонте" value="12" sub="4%" iconBg="bg-red-100" iconColor="text-red-600" />
        <MetricCard icon="CalendarClock" label="Следующее ТО" value="5 сегодня" iconBg="bg-orange-100" iconColor="text-orange-600" highlight />
      </div>

      {/* ── Фильтры ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Поиск по названию / серийному номеру..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-8 text-sm border border-slate-200 rounded-md px-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="all">Все типы</option>
          <option value="VRF">VRF</option>
          <option value="Сплит-система">Сплит-система</option>
          <option value="Чиллер">Чиллер</option>
          <option value="Фанкойл">Фанкойл</option>
          <option value="Вентиляция">Вентиляция</option>
          <option value="Тепловой насос">Тепловой насос</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 text-sm border border-slate-200 rounded-md px-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="all">Все статусы</option>
          <option value="Исправно">Исправно</option>
          <option value="Требует ТО">Требует ТО</option>
          <option value="В ремонте">В ремонте</option>
        </select>

        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="h-8 text-sm border border-slate-200 rounded-md px-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="all">Все клиенты</option>
          {clients.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto">{filtered.length} из {EQUIPMENT_LIST.length}</span>
      </div>

      {/* ── Основная область: таблица + детальная панель ─────────── */}
      <div className="flex gap-4 flex-col xl:flex-row">
        {/* Таблица */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">Оборудование</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">Тип</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">Серийный №</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">Год</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">Объект</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">Клиент</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">Статус</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">След. ТО</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">MTBF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((eq) => {
                  const isSelected = selected?.id === eq.id;
                  const toDay = isToday(eq.nextMaintenance);
                  const soon = isSoon(eq.nextMaintenance);
                  return (
                    <tr
                      key={eq.id}
                      onClick={() => handleSelect(eq)}
                      className={`border-b border-slate-100 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            eq.status === 'Исправно' ? 'bg-emerald-100' :
                            eq.status === 'Требует ТО' ? 'bg-amber-100' : 'bg-red-100'
                          }`}>
                            <Icon name={TYPE_ICONS[eq.type] ?? 'Box'} size={14} className={
                              eq.status === 'Исправно' ? 'text-emerald-600' :
                              eq.status === 'Требует ТО' ? 'text-amber-600' : 'text-red-600'
                            } />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 leading-tight whitespace-nowrap">{eq.name}</p>
                            <p className="text-xs text-slate-400">{eq.brand} {eq.model}</p>
                          </div>
                          {eq.hasIoT && (
                            <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded font-medium">IoT</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{eq.type}</td>
                      <td className="px-3 py-2.5 text-slate-500 font-mono text-xs whitespace-nowrap">{eq.serial}</td>
                      <td className="px-3 py-2.5 text-slate-600">{eq.installYear}</td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-[160px] truncate" title={eq.location}>{eq.location}</td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-[140px] truncate" title={eq.client}>{eq.client}</td>
                      <td className="px-3 py-2.5">
                        <Badge className={`${STATUS_COLORS[eq.status]} border text-xs font-medium`}>
                          {eq.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`text-xs font-medium ${toDay ? 'text-red-600' : soon ? 'text-amber-600' : 'text-slate-600'}`}>
                          {toDay && <Icon name="AlertCircle" size={11} className="inline mr-0.5 -mt-0.5" />}
                          {formatDate(eq.nextMaintenance)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-semibold ${mtbfReliability(eq.mtbf).color}`}>
                          {eq.mtbf} дн.
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
                      <p>Оборудование не найдено</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Детальная карточка */}
        {selected && (
          <div className="xl:w-[420px] flex-shrink-0 flex flex-col gap-3">
            {/* Шапка карточки */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selected.status === 'Исправно' ? 'bg-emerald-100' :
                  selected.status === 'Требует ТО' ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  <Icon name={TYPE_ICONS[selected.type] ?? 'Box'} size={28} className={
                    selected.status === 'Исправно' ? 'text-emerald-600' :
                    selected.status === 'Требует ТО' ? 'text-amber-600' : 'text-red-600'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-slate-800 leading-tight text-sm">{selected.name}</h2>
                    <Badge className={`${STATUS_COLORS[selected.status]} border text-xs flex-shrink-0`}>
                      {selected.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selected.brand} · {selected.model}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selected.serial}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selected.refrigerant && (
                      <span className="text-[11px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                        {selected.refrigerant}
                      </span>
                    )}
                    {selected.hasIoT && (
                      <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        IoT-мониторинг
                      </span>
                    )}
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      Установлен: {selected.installYear}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Объект</p>
                  <p className="text-slate-700 font-medium leading-tight">{selected.location}</p>
                </div>
                <div>
                  <p className="text-slate-400">Клиент</p>
                  <p className="text-slate-700 font-medium leading-tight">{selected.client}</p>
                </div>
                <div>
                  <p className="text-slate-400">MTBF</p>
                  <p className={`font-bold ${mtbfReliability(selected.mtbf).color}`}>
                    {selected.mtbf} дн. · {mtbfReliability(selected.mtbf).label}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Следующее ТО</p>
                  <p className={`font-medium ${isToday(selected.nextMaintenance) ? 'text-red-600' : isSoon(selected.nextMaintenance) ? 'text-amber-600' : 'text-slate-700'}`}>
                    {formatDate(selected.nextMaintenance)}
                    {isToday(selected.nextMaintenance) && ' (сегодня!)'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleNewOrder}>
                  <Icon name="Plus" size={12} className="mr-1" />
                  Создать наряд
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={handleQR}>
                  <Icon name="QrCode" size={12} />
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => toast.info('Открыта история')}>
                  <Icon name="History" size={12} />
                </Button>
              </div>
            </div>

            {/* IoT температурный график */}
            {selected.hasIoT && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Thermometer" size={14} className="text-blue-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Температура (IoT, 30 дней)</h3>
                  <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">Онлайн</span>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={TEMP_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} domain={[0, 35]} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0' }}
                      formatter={(v: number, name: string) => [`${v}°C`, name === 'actual' ? 'Внутри' : name === 'outdoor' ? 'Снаружи' : 'Уставка']}
                      labelFormatter={(l) => `День ${l}`}
                    />
                    <Area type="monotone" dataKey="outdoor" stroke="#f59e0b" strokeWidth={1.5} fill="url(#outGrad)" dot={false} name="outdoor" />
                    <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} fill="url(#tempGrad)" dot={false} name="actual" />
                    <Line type="monotone" dataKey="setpoint" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="setpoint" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-blue-600"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />Внутри</span>
                  <span className="flex items-center gap-1 text-[10px] text-amber-600"><span className="w-3 h-0.5 bg-amber-400 inline-block rounded" />Снаружи</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded border-dashed border-t" />Уставка</span>
                </div>
              </div>
            )}

            {/* Последние наряды */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="ClipboardList" size={14} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700">Последние наряды</h3>
              </div>
              <div className="space-y-1.5">
                {selected.workOrders.slice(0, 5).map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-50 gap-2">
                    <span className="font-mono text-blue-600 flex-shrink-0">{wo.id}</span>
                    <span className="text-slate-500 flex-shrink-0">{formatDate(wo.date)}</span>
                    <span className="text-slate-700 flex-1 text-center">{wo.type}</span>
                    <span className="text-slate-500 flex-shrink-0">{wo.engineer}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${wo.result === 'Выполнено' ? 'bg-emerald-100 text-emerald-700' : wo.result === 'В процессе' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {wo.result}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Журнал хладагентов (только если есть) */}
            {selected.refrigerantLog && selected.refrigerantLog.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Droplets" size={14} className="text-cyan-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Журнал хладагента</h3>
                  <span className="text-[10px] text-slate-400 ml-auto">{selected.refrigerant}</span>
                </div>
                <div className="space-y-1.5">
                  {selected.refrigerantLog.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg bg-slate-50">
                      <span className="text-slate-500 flex-shrink-0">{formatDate(r.date)}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${REFRIGERANT_OP_COLORS[r.operation]}`}>
                        {r.operation}
                      </span>
                      <span className="font-bold text-slate-700 flex-shrink-0">{r.kg} кг</span>
                      <span className="text-slate-400 ml-auto">{r.engineer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Аналитическая панель ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PieChart: Распределение по статусам */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="PieChart" size={14} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Распределение по статусам</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={STATUS_PIE_DATA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                paddingAngle={2}
              >
                {STATUS_PIE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0' }}
                formatter={(v: number, name: string) => [`${v} ед.`, name]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BarChart: Наряды по типам оборудования */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BarChart2" size={14} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Нарядов по типам (2025–2026)</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ORDERS_BY_TYPE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0' }}
                formatter={(v: number) => [`${v} нарядов`]}
              />
              <Bar dataKey="нарядов" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LineChart: MTBF тренд за 12 месяцев */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TrendingUp" size={14} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Тренд MTBF (12 мес.), дней</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MTBF_TREND_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} domain={[260, 640]} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0' }}
                formatter={(v: number) => [`${v} дн.`, 'MTBF']}
              />
              <Line
                type="monotone"
                dataKey="mtbf"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EquipmentFull;
