import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type EngStatus = 'На смене' | 'Выходной' | 'В отпуске';
type EmployType = 'Штатный' | 'Подрядчик';
type TransportType = 'Личный а/м' | 'Служебный а/м' | 'Общественный';

interface Certificate {
  name: string;
  issued: string;
  expires: string;
  status: 'Действующий' | 'Истекает' | 'Просрочен';
}

interface Competency {
  name: string;
  current: number;
  target: number;
  label: string;
}

interface WorkOrder {
  id: string;
  date: string;
  client: string;
  type: string;
  status: 'Выполнен' | 'В работе' | 'Ожидание ЗИП' | 'Отменён';
  duration: string;
  nps: number | null;
  amount: number;
}

interface ScheduleDay {
  date: string;
  weekday: string;
  dayStatus: 'Рабочий' | 'Выходной' | 'Отпуск';
  orders: { time: string; client: string; type: string }[];
}

interface Engineer {
  id: string;
  name: string;
  initials: string;
  color: string;
  position: string;
  status: EngStatus;
  phone: string;
  email: string;
  telegram: string;
  experienceYears: number;
  employment: EmployType;
  transport: TransportType;
  transportModel: string;
  transportPlate: string;
  rating: number;
  efficiencyScore: number;
  kpi: { ordersMonth: number; revenueMonth: number; avgNps: number; onTimePercent: number };
  revenueHistory: { month: string; revenue: number; orders: number }[];
  currentOrders: { id: string; client: string; status: string; time: string }[];
  fuelKm: number;
  fuelCompensation: number;
  workOrders: WorkOrder[];
  ordersPerDay: { day: string; count: number }[];
  competencies: Competency[];
  radarData: { subject: string; current: number; target: number }[];
  certificates: Certificate[];
  payroll: { piecework: number; bonuses: number; fuel: number; total: number; planPercent: number };
  salaryHistory: { month: string; amount: number }[];
  schedule: ScheduleDay[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const ENGINEERS: Engineer[] = [
  {
    id: '1',
    name: 'Алексей Петров',
    initials: 'АП',
    color: 'bg-blue-500',
    position: 'Старший инженер-монтажник',
    status: 'На смене',
    phone: '+7 (916) 234-56-78',
    email: 'a.petrov@servisklimat.ru',
    telegram: '@a_petrov_sk',
    experienceYears: 7,
    employment: 'Штатный',
    transport: 'Личный а/м',
    transportModel: 'Kia Rio',
    transportPlate: 'А123БВ77',
    rating: 4.8,
    efficiencyScore: 87,
    kpi: { ordersMonth: 24, revenueMonth: 186400, avgNps: 9.2, onTimePercent: 92 },
    revenueHistory: [
      { month: 'Дек', revenue: 142000, orders: 18 },
      { month: 'Янв', revenue: 158000, orders: 20 },
      { month: 'Фев', revenue: 167000, orders: 21 },
      { month: 'Мар', revenue: 175000, orders: 23 },
      { month: 'Апр', revenue: 181000, orders: 22 },
      { month: 'Май', revenue: 186400, orders: 24 },
    ],
    currentOrders: [
      { id: 'WO-2025-001234', client: 'ООО «Альфа»', status: 'В работе', time: '10:00–13:00' },
      { id: 'WO-2025-001235', client: 'Иванова М.В.', status: 'На выезде', time: '14:30–16:00' },
      { id: 'WO-2025-001236', client: 'ИП Сидоров', status: 'Запланирован', time: '17:00–18:30' },
    ],
    fuelKm: 1240,
    fuelCompensation: 8184,
    workOrders: [
      { id: 'WO-2025-001220', date: '12.05.2025', client: 'ООО «Ромашка»', type: 'Ремонт', status: 'Выполнен', duration: '2ч 15мин', nps: 10, amount: 7800 },
      { id: 'WO-2025-001215', date: '11.05.2025', client: 'Петрова А.Г.', type: 'ТО', status: 'Выполнен', duration: '1ч 30мин', nps: 9, amount: 4500 },
      { id: 'WO-2025-001210', date: '10.05.2025', client: 'ООО «Мега»', type: 'Монтаж', status: 'Выполнен', duration: '4ч 00мин', nps: 9, amount: 18500 },
      { id: 'WO-2025-001205', date: '09.05.2025', client: 'ИП Козлов', type: 'Ремонт', status: 'Выполнен', duration: '1ч 45мин', nps: 8, amount: 5200 },
      { id: 'WO-2025-001200', date: '08.05.2025', client: 'ТЦ «Центр»', type: 'Ремонт', status: 'Выполнен', duration: '3ч 30мин', nps: 10, amount: 12300 },
    ],
    ordersPerDay: [
      { day: 'Пн', count: 4 }, { day: 'Вт', count: 5 }, { day: 'Ср', count: 3 },
      { day: 'Чт', count: 5 }, { day: 'Пт', count: 4 }, { day: 'Сб', count: 2 }, { day: 'Вс', count: 1 },
    ],
    competencies: [
      { name: 'Диагностика', current: 4, target: 4, label: 'Наставник' },
      { name: 'Монтаж сплит-систем', current: 4, target: 4, label: 'Наставник' },
      { name: 'Чиллеры и ВРВ', current: 3, target: 4, label: 'Эксперт' },
      { name: 'Вентиляция', current: 2, target: 3, label: 'Уверенный' },
      { name: 'Электрика', current: 3, target: 3, label: 'Эксперт' },
      { name: 'Работа с хладагентами', current: 4, target: 4, label: 'Наставник' },
    ],
    radarData: [
      { subject: 'Диагностика', current: 95, target: 100 },
      { subject: 'Монтаж', current: 90, target: 100 },
      { subject: 'ВРВ/Чиллеры', current: 75, target: 90 },
      { subject: 'Вентиляция', current: 55, target: 75 },
      { subject: 'Электрика', current: 80, target: 85 },
      { subject: 'Хладагенты', current: 95, target: 100 },
      { subject: 'Документация', current: 85, target: 90 },
      { subject: 'Клиентский сервис', current: 92, target: 95 },
    ],
    certificates: [
      { name: 'Daikin Certified Technician', issued: '15.03.2023', expires: '15.03.2026', status: 'Действующий' },
      { name: 'Работа с хладагентами ФЗ-155', issued: '10.01.2024', expires: '10.01.2027', status: 'Действующий' },
      { name: 'Mitsubishi Electric Service', issued: '20.06.2022', expires: '20.06.2025', status: 'Истекает' },
      { name: 'Электробезопасность III группа', issued: '05.09.2023', expires: '05.09.2025', status: 'Истекает' },
    ],
    payroll: { piecework: 52400, bonuses: 8300, fuel: 8184, total: 68884, planPercent: 96 },
    salaryHistory: [
      { month: 'Дек', amount: 58200 }, { month: 'Янв', amount: 61400 },
      { month: 'Фев', amount: 63700 }, { month: 'Мар', amount: 65100 },
      { month: 'Апр', amount: 67300 }, { month: 'Май', amount: 68884 },
    ],
    schedule: [
      { date: '12.05', weekday: 'Пн', dayStatus: 'Рабочий', orders: [{ time: '09:00', client: 'ООО «Ромашка»', type: 'Ремонт' }, { time: '13:00', client: 'Петрова А.Г.', type: 'ТО' }] },
      { date: '13.05', weekday: 'Вт', dayStatus: 'Рабочий', orders: [{ time: '10:00', client: 'ООО «Мега»', type: 'Монтаж' }] },
      { date: '14.05', weekday: 'Ср', dayStatus: 'Рабочий', orders: [{ time: '09:30', client: 'ИП Козлов', type: 'Ремонт' }, { time: '14:00', client: 'ТЦ «Центр»', type: 'Ремонт' }, { time: '17:00', client: 'Иванов С.', type: 'Диагностика' }] },
      { date: '15.05', weekday: 'Чт', dayStatus: 'Рабочий', orders: [{ time: '11:00', client: 'ООО «Альфа»', type: 'ТО' }] },
      { date: '16.05', weekday: 'Пт', dayStatus: 'Рабочий', orders: [{ time: '10:00', client: 'ИП Смирнов', type: 'Монтаж' }, { time: '15:00', client: 'Козлова В.', type: 'Ремонт' }] },
      { date: '17.05', weekday: 'Сб', dayStatus: 'Выходной', orders: [] },
      { date: '18.05', weekday: 'Вс', dayStatus: 'Выходной', orders: [] },
    ],
  },
  {
    id: '2',
    name: 'Дмитрий Соколов',
    initials: 'ДС',
    color: 'bg-green-500',
    position: 'Инженер-монтажник',
    status: 'На смене',
    phone: '+7 (926) 345-67-89',
    email: 'd.sokolov@servisklimat.ru',
    telegram: '@d_sokolov_sk',
    experienceYears: 4,
    employment: 'Штатный',
    transport: 'Служебный а/м',
    transportModel: 'Lada Largus',
    transportPlate: 'В456ГД77',
    rating: 4.6,
    efficiencyScore: 79,
    kpi: { ordersMonth: 19, revenueMonth: 141200, avgNps: 8.8, onTimePercent: 87 },
    revenueHistory: [
      { month: 'Дек', revenue: 108000, orders: 14 }, { month: 'Янв', revenue: 115000, orders: 15 },
      { month: 'Фев', revenue: 124000, orders: 17 }, { month: 'Мар', revenue: 132000, orders: 18 },
      { month: 'Апр', revenue: 138000, orders: 18 }, { month: 'Май', revenue: 141200, orders: 19 },
    ],
    currentOrders: [
      { id: 'WO-2025-001237', client: 'ТЦ «Мегаполис»', status: 'В работе', time: '09:00–12:00' },
      { id: 'WO-2025-001238', client: 'Новиков П.А.', status: 'Запланирован', time: '13:30–15:00' },
      { id: 'WO-2025-001239', client: 'ООО «Старт»', status: 'Запланирован', time: '16:00–17:30' },
    ],
    fuelKm: 980,
    fuelCompensation: 6468,
    workOrders: [
      { id: 'WO-2025-001219', date: '12.05.2025', client: 'ТЦ «Мегаполис»', type: 'ТО', status: 'Выполнен', duration: '3ч 00мин', nps: 9, amount: 9200 },
      { id: 'WO-2025-001214', date: '11.05.2025', client: 'Новиков П.А.', type: 'Ремонт', status: 'Выполнен', duration: '2ч 15мин', nps: 8, amount: 6100 },
      { id: 'WO-2025-001209', date: '10.05.2025', client: 'ООО «Старт»', type: 'Монтаж', status: 'Выполнен', duration: '3ч 45мин', nps: 9, amount: 15400 },
      { id: 'WO-2025-001204', date: '09.05.2025', client: 'Морозова Е.', type: 'Диагностика', status: 'Выполнен', duration: '1ч 00мин', nps: null, amount: 2800 },
      { id: 'WO-2025-001199', date: '07.05.2025', client: 'ООО «Весна»', type: 'Ремонт', status: 'Выполнен', duration: '2ч 30мин', nps: 9, amount: 7700 },
    ],
    ordersPerDay: [
      { day: 'Пн', count: 3 }, { day: 'Вт', count: 4 }, { day: 'Ср', count: 4 },
      { day: 'Чт', count: 3 }, { day: 'Пт', count: 3 }, { day: 'Сб', count: 1 }, { day: 'Вс', count: 1 },
    ],
    competencies: [
      { name: 'Диагностика', current: 3, target: 4, label: 'Эксперт' },
      { name: 'Монтаж сплит-систем', current: 4, target: 4, label: 'Наставник' },
      { name: 'Чиллеры и ВРВ', current: 2, target: 3, label: 'Уверенный' },
      { name: 'Вентиляция', current: 3, target: 3, label: 'Эксперт' },
      { name: 'Электрика', current: 2, target: 3, label: 'Уверенный' },
      { name: 'Работа с хладагентами', current: 3, target: 4, label: 'Эксперт' },
    ],
    radarData: [
      { subject: 'Диагностика', current: 75, target: 90 }, { subject: 'Монтаж', current: 92, target: 100 },
      { subject: 'ВРВ/Чиллеры', current: 55, target: 75 }, { subject: 'Вентиляция', current: 78, target: 85 },
      { subject: 'Электрика', current: 60, target: 75 }, { subject: 'Хладагенты', current: 80, target: 95 },
      { subject: 'Документация', current: 70, target: 85 }, { subject: 'Клиентский сервис', current: 85, target: 90 },
    ],
    certificates: [
      { name: 'Mitsubishi Electric Service', issued: '10.04.2023', expires: '10.04.2026', status: 'Действующий' },
      { name: 'Работа с хладагентами ФЗ-155', issued: '20.02.2024', expires: '20.02.2027', status: 'Действующий' },
      { name: 'Электробезопасность II группа', issued: '15.11.2023', expires: '15.11.2024', status: 'Просрочен' },
    ],
    payroll: { piecework: 38700, bonuses: 4200, fuel: 6468, total: 49368, planPercent: 82 },
    salaryHistory: [
      { month: 'Дек', amount: 42000 }, { month: 'Янв', amount: 44100 },
      { month: 'Фев', amount: 46200 }, { month: 'Мар', amount: 47800 },
      { month: 'Апр', amount: 48500 }, { month: 'Май', amount: 49368 },
    ],
    schedule: [
      { date: '12.05', weekday: 'Пн', dayStatus: 'Рабочий', orders: [{ time: '09:00', client: 'ТЦ «Мегаполис»', type: 'ТО' }, { time: '14:00', client: 'Новиков П.А.', type: 'Ремонт' }] },
      { date: '13.05', weekday: 'Вт', dayStatus: 'Рабочий', orders: [{ time: '10:30', client: 'ООО «Старт»', type: 'Монтаж' }] },
      { date: '14.05', weekday: 'Ср', dayStatus: 'Рабочий', orders: [{ time: '09:00', client: 'Морозова Е.', type: 'Диагностика' }, { time: '13:00', client: 'ООО «Весна»', type: 'Ремонт' }] },
      { date: '15.05', weekday: 'Чт', dayStatus: 'Рабочий', orders: [{ time: '10:00', client: 'ИП Лебедев', type: 'ТО' }, { time: '15:00', client: 'Павлов А.', type: 'Ремонт' }] },
      { date: '16.05', weekday: 'Пт', dayStatus: 'Рабочий', orders: [{ time: '09:00', client: 'ООО «Люкс»', type: 'Монтаж' }] },
      { date: '17.05', weekday: 'Сб', dayStatus: 'Выходной', orders: [] },
      { date: '18.05', weekday: 'Вс', dayStatus: 'Выходной', orders: [] },
    ],
  },
  {
    id: '3', name: 'Сергей Новиков', initials: 'СН', color: 'bg-purple-500',
    position: 'Инженер по вентиляции', status: 'Выходной',
    phone: '+7 (903) 456-78-90', email: 's.novikov@servisklimat.ru', telegram: '@s_novikov_sk',
    experienceYears: 5, employment: 'Штатный', transport: 'Личный а/м',
    transportModel: 'Hyundai Solaris', transportPlate: 'Е789ЖЗ77',
    rating: 4.7, efficiencyScore: 83,
    kpi: { ordersMonth: 21, revenueMonth: 163500, avgNps: 9.0, onTimePercent: 90 },
    revenueHistory: [
      { month: 'Дек', revenue: 128000, orders: 17 }, { month: 'Янв', revenue: 138000, orders: 18 },
      { month: 'Фев', revenue: 148000, orders: 19 }, { month: 'Мар', revenue: 155000, orders: 20 },
      { month: 'Апр', revenue: 160000, orders: 21 }, { month: 'Май', revenue: 163500, orders: 21 },
    ],
    currentOrders: [],
    fuelKm: 1100, fuelCompensation: 7260,
    workOrders: [
      { id: 'WO-2025-001218', date: '10.05.2025', client: 'Бизнес-центр «Олимп»', type: 'Вентиляция', status: 'Выполнен', duration: '5ч 00мин', nps: 9, amount: 22000 },
      { id: 'WO-2025-001213', date: '09.05.2025', client: 'ООО «Прогресс»', type: 'Монтаж', status: 'Выполнен', duration: '3ч 30мин', nps: 10, amount: 14500 },
      { id: 'WO-2025-001208', date: '08.05.2025', client: 'Школа №15', type: 'ТО', status: 'Выполнен', duration: '2ч 45мин', nps: null, amount: 8900 },
      { id: 'WO-2025-001203', date: '07.05.2025', client: 'Жуков В.Н.', type: 'Ремонт', status: 'Выполнен', duration: '2ч 00мин', nps: 8, amount: 5600 },
      { id: 'WO-2025-001198', date: '06.05.2025', client: 'ООО «Климат+»', type: 'Вентиляция', status: 'Выполнен', duration: '4ч 15мин', nps: 9, amount: 17800 },
    ],
    ordersPerDay: [
      { day: 'Пн', count: 3 }, { day: 'Вт', count: 4 }, { day: 'Ср', count: 5 },
      { day: 'Чт', count: 4 }, { day: 'Пт', count: 3 }, { day: 'Сб', count: 1 }, { day: 'Вс', count: 1 },
    ],
    competencies: [
      { name: 'Диагностика', current: 3, target: 4, label: 'Эксперт' },
      { name: 'Монтаж сплит-систем', current: 3, target: 3, label: 'Эксперт' },
      { name: 'Чиллеры и ВРВ', current: 2, target: 3, label: 'Уверенный' },
      { name: 'Вентиляция', current: 4, target: 4, label: 'Наставник' },
      { name: 'Электрика', current: 3, target: 3, label: 'Эксперт' },
      { name: 'Работа с хладагентами', current: 2, target: 3, label: 'Уверенный' },
    ],
    radarData: [
      { subject: 'Диагностика', current: 78, target: 88 }, { subject: 'Монтаж', current: 80, target: 85 },
      { subject: 'ВРВ/Чиллеры', current: 60, target: 75 }, { subject: 'Вентиляция', current: 96, target: 100 },
      { subject: 'Электрика', current: 75, target: 80 }, { subject: 'Хладагенты', current: 65, target: 80 },
      { subject: 'Документация', current: 82, target: 88 }, { subject: 'Клиентский сервис', current: 88, target: 92 },
    ],
    certificates: [
      { name: 'Вентиляционные системы ВЕНТС', issued: '12.05.2022', expires: '12.05.2025', status: 'Истекает' },
      { name: 'Работа с хладагентами ФЗ-155', issued: '01.03.2024', expires: '01.03.2027', status: 'Действующий' },
      { name: 'Противопожарный минимум', issued: '20.08.2023', expires: '20.08.2025', status: 'Истекает' },
    ],
    payroll: { piecework: 44200, bonuses: 5800, fuel: 7260, total: 57260, planPercent: 89 },
    salaryHistory: [
      { month: 'Дек', amount: 49000 }, { month: 'Янв', amount: 51200 },
      { month: 'Фев', amount: 53400 }, { month: 'Мар', amount: 54900 },
      { month: 'Апр', amount: 56100 }, { month: 'Май', amount: 57260 },
    ],
    schedule: [
      { date: '12.05', weekday: 'Пн', dayStatus: 'Рабочий', orders: [{ time: '09:00', client: 'Бизнес-центр «Олимп»', type: 'Вентиляция' }] },
      { date: '13.05', weekday: 'Вт', dayStatus: 'Рабочий', orders: [{ time: '10:00', client: 'ООО «Прогресс»', type: 'Монтаж' }, { time: '15:00', client: 'Школа №15', type: 'ТО' }] },
      { date: '14.05', weekday: 'Ср', dayStatus: 'Рабочий', orders: [{ time: '09:30', client: 'Жуков В.Н.', type: 'Ремонт' }] },
      { date: '15.05', weekday: 'Чт', dayStatus: 'Рабочий', orders: [{ time: '11:00', client: 'ООО «Климат+»', type: 'Вентиляция' }, { time: '16:00', client: 'ИП Тимофеев', type: 'ТО' }] },
      { date: '16.05', weekday: 'Пт', dayStatus: 'Рабочий', orders: [{ time: '10:00', client: 'Магазин «Уют»', type: 'Монтаж' }] },
      { date: '17.05', weekday: 'Сб', dayStatus: 'Выходной', orders: [] },
      { date: '18.05', weekday: 'Вс', dayStatus: 'Выходной', orders: [] },
    ],
  },
  {
    id: '4', name: 'Михаил Воронов', initials: 'МВ', color: 'bg-orange-500',
    position: 'Инженер (подрядчик)', status: 'На смене',
    phone: '+7 (915) 567-89-01', email: 'm.voronov@mail.ru', telegram: '@m_voronov',
    experienceYears: 3, employment: 'Подрядчик', transport: 'Личный а/м',
    transportModel: 'Renault Logan', transportPlate: 'И012КЛ97',
    rating: 4.4, efficiencyScore: 71,
    kpi: { ordersMonth: 15, revenueMonth: 112000, avgNps: 8.5, onTimePercent: 83 },
    revenueHistory: [
      { month: 'Дек', revenue: 82000, orders: 11 }, { month: 'Янв', revenue: 88000, orders: 12 },
      { month: 'Фев', revenue: 95000, orders: 13 }, { month: 'Мар', revenue: 103000, orders: 14 },
      { month: 'Апр', revenue: 108000, orders: 14 }, { month: 'Май', revenue: 112000, orders: 15 },
    ],
    currentOrders: [
      { id: 'WO-2025-001240', client: 'Кузнецова И.', status: 'В работе', time: '11:00–13:30' },
    ],
    fuelKm: 820, fuelCompensation: 5412,
    workOrders: [
      { id: 'WO-2025-001217', date: '12.05.2025', client: 'Кузнецова И.', type: 'Ремонт', status: 'В работе', duration: '—', nps: null, amount: 4200 },
      { id: 'WO-2025-001212', date: '11.05.2025', client: 'ООО «Надежда»', type: 'ТО', status: 'Выполнен', duration: '2ч 00мин', nps: 8, amount: 5800 },
      { id: 'WO-2025-001207', date: '10.05.2025', client: 'Фролов Д.', type: 'Ремонт', status: 'Выполнен', duration: '1ч 30мин', nps: 9, amount: 4100 },
      { id: 'WO-2025-001202', date: '09.05.2025', client: 'ООО «Пром»', type: 'Монтаж', status: 'Выполнен', duration: '4ч 30мин', nps: null, amount: 16200 },
      { id: 'WO-2025-001197', date: '07.05.2025', client: 'Белова Н.', type: 'Диагностика', status: 'Выполнен', duration: '1ч 00мин', nps: 8, amount: 2500 },
    ],
    ordersPerDay: [
      { day: 'Пн', count: 2 }, { day: 'Вт', count: 3 }, { day: 'Ср', count: 3 },
      { day: 'Чт', count: 3 }, { day: 'Пт', count: 2 }, { day: 'Сб', count: 1 }, { day: 'Вс', count: 1 },
    ],
    competencies: [
      { name: 'Диагностика', current: 2, target: 3, label: 'Уверенный' },
      { name: 'Монтаж сплит-систем', current: 3, target: 4, label: 'Эксперт' },
      { name: 'Чиллеры и ВРВ', current: 1, target: 2, label: 'Базовый' },
      { name: 'Вентиляция', current: 2, target: 3, label: 'Уверенный' },
      { name: 'Электрика', current: 2, target: 3, label: 'Уверенный' },
      { name: 'Работа с хладагентами', current: 2, target: 3, label: 'Уверенный' },
    ],
    radarData: [
      { subject: 'Диагностика', current: 58, target: 75 }, { subject: 'Монтаж', current: 78, target: 90 },
      { subject: 'ВРВ/Чиллеры', current: 30, target: 55 }, { subject: 'Вентиляция', current: 55, target: 72 },
      { subject: 'Электрика', current: 60, target: 72 }, { subject: 'Хладагенты', current: 62, target: 75 },
      { subject: 'Документация', current: 65, target: 78 }, { subject: 'Клиентский сервис', current: 78, target: 85 },
    ],
    certificates: [
      { name: 'Работа с хладагентами ФЗ-155', issued: '15.06.2023', expires: '15.06.2026', status: 'Действующий' },
      { name: 'Электробезопасность II группа', issued: '10.10.2022', expires: '10.10.2024', status: 'Просрочен' },
    ],
    payroll: { piecework: 29800, bonuses: 2100, fuel: 5412, total: 37312, planPercent: 74 },
    salaryHistory: [
      { month: 'Дек', amount: 30200 }, { month: 'Янв', amount: 31800 },
      { month: 'Фев', amount: 33100 }, { month: 'Мар', amount: 34900 },
      { month: 'Апр', amount: 36200 }, { month: 'Май', amount: 37312 },
    ],
    schedule: [
      { date: '12.05', weekday: 'Пн', dayStatus: 'Рабочий', orders: [{ time: '11:00', client: 'Кузнецова И.', type: 'Ремонт' }] },
      { date: '13.05', weekday: 'Вт', dayStatus: 'Рабочий', orders: [{ time: '10:00', client: 'ООО «Надежда»', type: 'ТО' }, { time: '14:00', client: 'Фролов Д.', type: 'Ремонт' }] },
      { date: '14.05', weekday: 'Ср', dayStatus: 'Рабочий', orders: [{ time: '09:00', client: 'ООО «Пром»', type: 'Монтаж' }] },
      { date: '15.05', weekday: 'Чт', dayStatus: 'Рабочий', orders: [{ time: '13:00', client: 'Белова Н.', type: 'Диагностика' }, { time: '15:30', client: 'Романов А.', type: 'ТО' }] },
      { date: '16.05', weekday: 'Пт', dayStatus: 'Рабочий', orders: [{ time: '10:00', client: 'ИП Якимов', type: 'Ремонт' }] },
      { date: '17.05', weekday: 'Сб', dayStatus: 'Выходной', orders: [] },
      { date: '18.05', weekday: 'Вс', dayStatus: 'Выходной', orders: [] },
    ],
  },
  {
    id: '5', name: 'Андрей Лебедев', initials: 'АЛ', color: 'bg-red-500',
    position: 'Старший инженер по ВРВ', status: 'В отпуске',
    phone: '+7 (965) 678-90-12', email: 'a.lebedev@servisklimat.ru', telegram: '@a_lebedev_sk',
    experienceYears: 9, employment: 'Штатный', transport: 'Служебный а/м',
    transportModel: 'Ford Transit', transportPlate: 'М345НО77',
    rating: 4.9, efficiencyScore: 94,
    kpi: { ordersMonth: 18, revenueMonth: 224000, avgNps: 9.6, onTimePercent: 97 },
    revenueHistory: [
      { month: 'Дек', revenue: 185000, orders: 15 }, { month: 'Янв', revenue: 196000, orders: 16 },
      { month: 'Фев', revenue: 204000, orders: 17 }, { month: 'Мар', revenue: 211000, orders: 17 },
      { month: 'Апр', revenue: 218000, orders: 18 }, { month: 'Май', revenue: 224000, orders: 18 },
    ],
    currentOrders: [],
    fuelKm: 0, fuelCompensation: 0,
    workOrders: [
      { id: 'WO-2025-001216', date: '02.05.2025', client: 'Банк «Капитал»', type: 'ВРВ', status: 'Выполнен', duration: '6ч 00мин', nps: 10, amount: 38000 },
      { id: 'WO-2025-001211', date: '01.05.2025', client: 'ТРЦ «Галерея»', type: 'ВРВ', status: 'Выполнен', duration: '5ч 30мин', nps: 10, amount: 42000 },
      { id: 'WO-2025-001206', date: '30.04.2025', client: 'Отель «Марс»', type: 'ТО', status: 'Выполнен', duration: '8ч 00мин', nps: 9, amount: 56000 },
      { id: 'WO-2025-001201', date: '29.04.2025', client: 'Офис «Сити»', type: 'Монтаж', status: 'Выполнен', duration: '7ч 00мин', nps: 10, amount: 45000 },
      { id: 'WO-2025-001196', date: '28.04.2025', client: 'Завод «Север»', type: 'ВРВ', status: 'Выполнен', duration: '5ч 00мин', nps: 9, amount: 31000 },
    ],
    ordersPerDay: [
      { day: 'Пн', count: 2 }, { day: 'Вт', count: 3 }, { day: 'Ср', count: 3 },
      { day: 'Чт', count: 4 }, { day: 'Пт', count: 4 }, { day: 'Сб', count: 1 }, { day: 'Вс', count: 1 },
    ],
    competencies: [
      { name: 'Диагностика', current: 4, target: 4, label: 'Наставник' },
      { name: 'Монтаж сплит-систем', current: 4, target: 4, label: 'Наставник' },
      { name: 'Чиллеры и ВРВ', current: 4, target: 4, label: 'Наставник' },
      { name: 'Вентиляция', current: 3, target: 4, label: 'Эксперт' },
      { name: 'Электрика', current: 4, target: 4, label: 'Наставник' },
      { name: 'Работа с хладагентами', current: 4, target: 4, label: 'Наставник' },
    ],
    radarData: [
      { subject: 'Диагностика', current: 98, target: 100 }, { subject: 'Монтаж', current: 95, target: 100 },
      { subject: 'ВРВ/Чиллеры', current: 99, target: 100 }, { subject: 'Вентиляция', current: 82, target: 95 },
      { subject: 'Электрика', current: 94, target: 98 }, { subject: 'Хладагенты', current: 97, target: 100 },
      { subject: 'Документация', current: 92, target: 95 }, { subject: 'Клиентский сервис', current: 96, target: 98 },
    ],
    certificates: [
      { name: 'Daikin VRV Master Technician', issued: '05.01.2023', expires: '05.01.2026', status: 'Действующий' },
      { name: 'Mitsubishi Electric City Multi', issued: '18.03.2022', expires: '18.03.2025', status: 'Истекает' },
      { name: 'Работа с хладагентами ФЗ-155', issued: '22.04.2024', expires: '22.04.2027', status: 'Действующий' },
      { name: 'Электробезопасность IV группа', issued: '30.06.2023', expires: '30.06.2025', status: 'Истекает' },
    ],
    payroll: { piecework: 64200, bonuses: 12500, fuel: 0, total: 76700, planPercent: 98 },
    salaryHistory: [
      { month: 'Дек', amount: 66000 }, { month: 'Янв', amount: 68500 },
      { month: 'Фев', amount: 70200 }, { month: 'Мар', amount: 72100 },
      { month: 'Апр', amount: 74800 }, { month: 'Май', amount: 76700 },
    ],
    schedule: [
      { date: '12.05', weekday: 'Пн', dayStatus: 'Отпуск', orders: [] },
      { date: '13.05', weekday: 'Вт', dayStatus: 'Отпуск', orders: [] },
      { date: '14.05', weekday: 'Ср', dayStatus: 'Отпуск', orders: [] },
      { date: '15.05', weekday: 'Чт', dayStatus: 'Отпуск', orders: [] },
      { date: '16.05', weekday: 'Пт', dayStatus: 'Отпуск', orders: [] },
      { date: '17.05', weekday: 'Сб', dayStatus: 'Отпуск', orders: [] },
      { date: '18.05', weekday: 'Вс', dayStatus: 'Отпуск', orders: [] },
    ],
  },
  {
    id: '6', name: 'Иван Тихонов', initials: 'ИТ', color: 'bg-teal-500',
    position: 'Инженер-монтажник (стажёр)', status: 'На смене',
    phone: '+7 (977) 789-01-23', email: 'i.tikhonov@servisklimat.ru', telegram: '@i_tikhonov_sk',
    experienceYears: 1, employment: 'Штатный', transport: 'Общественный',
    transportModel: '—', transportPlate: '—',
    rating: 4.2, efficiencyScore: 58,
    kpi: { ordersMonth: 10, revenueMonth: 68400, avgNps: 8.1, onTimePercent: 75 },
    revenueHistory: [
      { month: 'Дек', revenue: 38000, orders: 6 }, { month: 'Янв', revenue: 44000, orders: 7 },
      { month: 'Фев', revenue: 51000, orders: 8 }, { month: 'Мар', revenue: 58000, orders: 8 },
      { month: 'Апр', revenue: 63000, orders: 9 }, { month: 'Май', revenue: 68400, orders: 10 },
    ],
    currentOrders: [
      { id: 'WO-2025-001241', client: 'Васильева О.', status: 'Запланирован', time: '14:00–16:00' },
    ],
    fuelKm: 0, fuelCompensation: 0,
    workOrders: [
      { id: 'WO-2025-001221', date: '12.05.2025', client: 'Васильева О.', type: 'ТО', status: 'Ожидание ЗИП', duration: '—', nps: null, amount: 3200 },
      { id: 'WO-2025-001216', date: '11.05.2025', client: 'ИП Кириллов', type: 'ТО', status: 'Выполнен', duration: '2ч 30мин', nps: 8, amount: 4600 },
      { id: 'WO-2025-001211', date: '09.05.2025', client: 'Зайцева М.', type: 'Ремонт', status: 'Выполнен', duration: '2ч 00мин', nps: 7, amount: 4100 },
      { id: 'WO-2025-001206', date: '08.05.2025', client: 'ООО «Свет»', type: 'Монтаж', status: 'Выполнен', duration: '3ч 15мин', nps: 9, amount: 9800 },
      { id: 'WO-2025-001201', date: '06.05.2025', client: 'Орлов Г.', type: 'Диагностика', status: 'Выполнен', duration: '1ч 15мин', nps: null, amount: 2200 },
    ],
    ordersPerDay: [
      { day: 'Пн', count: 1 }, { day: 'Вт', count: 2 }, { day: 'Ср', count: 2 },
      { day: 'Чт', count: 2 }, { day: 'Пт', count: 2 }, { day: 'Сб', count: 1 }, { day: 'Вс', count: 0 },
    ],
    competencies: [
      { name: 'Диагностика', current: 1, target: 3, label: 'Базовый' },
      { name: 'Монтаж сплит-систем', current: 2, target: 3, label: 'Уверенный' },
      { name: 'Чиллеры и ВРВ', current: 0, target: 2, label: 'Нет' },
      { name: 'Вентиляция', current: 1, target: 2, label: 'Базовый' },
      { name: 'Электрика', current: 1, target: 2, label: 'Базовый' },
      { name: 'Работа с хладагентами', current: 1, target: 2, label: 'Базовый' },
    ],
    radarData: [
      { subject: 'Диагностика', current: 35, target: 70 }, { subject: 'Монтаж', current: 55, target: 75 },
      { subject: 'ВРВ/Чиллеры', current: 10, target: 50 }, { subject: 'Вентиляция', current: 38, target: 58 },
      { subject: 'Электрика', current: 40, target: 60 }, { subject: 'Хладагенты', current: 42, target: 60 },
      { subject: 'Документация', current: 55, target: 70 }, { subject: 'Клиентский сервис', current: 68, target: 80 },
    ],
    certificates: [
      { name: 'Работа с хладагентами ФЗ-155', issued: '10.11.2024', expires: '10.11.2027', status: 'Действующий' },
      { name: 'Электробезопасность I группа', issued: '05.12.2024', expires: '05.12.2025', status: 'Действующий' },
    ],
    payroll: { piecework: 18200, bonuses: 1500, fuel: 0, total: 19700, planPercent: 52 },
    salaryHistory: [
      { month: 'Дек', amount: 12000 }, { month: 'Янв', amount: 14200 },
      { month: 'Фев', amount: 15800 }, { month: 'Мар', amount: 17100 },
      { month: 'Апр', amount: 18500 }, { month: 'Май', amount: 19700 },
    ],
    schedule: [
      { date: '12.05', weekday: 'Пн', dayStatus: 'Рабочий', orders: [{ time: '09:00', client: '(стажировка с Петровым)', type: 'Монтаж' }] },
      { date: '13.05', weekday: 'Вт', dayStatus: 'Рабочий', orders: [{ time: '10:00', client: 'ИП Кириллов', type: 'ТО' }] },
      { date: '14.05', weekday: 'Ср', dayStatus: 'Рабочий', orders: [{ time: '11:00', client: 'Зайцева М.', type: 'Ремонт' }] },
      { date: '15.05', weekday: 'Чт', dayStatus: 'Рабочий', orders: [{ time: '09:30', client: 'ООО «Свет»', type: 'Монтаж' }] },
      { date: '16.05', weekday: 'Пт', dayStatus: 'Рабочий', orders: [{ time: '14:00', client: 'Васильева О.', type: 'ТО' }] },
      { date: '17.05', weekday: 'Сб', dayStatus: 'Выходной', orders: [] },
      { date: '18.05', weekday: 'Вс', dayStatus: 'Выходной', orders: [] },
    ],
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function statusVariant(status: EngStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'На смене') return 'default';
  if (status === 'В отпуске') return 'secondary';
  return 'outline';
}

function orderStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'Выполнен') return 'default';
  if (status === 'В работе' || status === 'На выезде') return 'secondary';
  if (status === 'Отменён') return 'destructive';
  return 'outline';
}

function certVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'Действующий') return 'default';
  if (status === 'Истекает') return 'secondary';
  return 'destructive';
}

function dayCellVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'Рабочий') return 'default';
  if (status === 'Отпуск') return 'secondary';
  return 'outline';
}

function levelLabel(level: number): string {
  const labels = ['Нет', 'Базовый', 'Уверенный', 'Эксперт', 'Наставник'];
  return labels[level] ?? 'Нет';
}

function transportIcon(type: TransportType): string {
  if (type === 'Личный а/м') return 'Car';
  if (type === 'Служебный а/м') return 'Truck';
  return 'Bus';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="Star"
          size={14}
          className={i <= Math.round(rating) ? 'fill-amber-400' : 'fill-none'}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </span>
  );
}

function KpiCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon name={icon as any} size={18} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EngineerProfileFull() {
  const [selectedId, setSelectedId] = useState('1');
  const [ordersMonth, setOrdersMonth] = useState('may');
  const [scheduleWeekOffset, setScheduleWeekOffset] = useState(0);

  const eng = ENGINEERS.find((e) => e.id === selectedId) ?? ENGINEERS[0];

  const fmt = (n: number) => n.toLocaleString('ru-RU');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Инженер:</span>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENGINEERS.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                <span className="flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${e.color}`}>
                    {e.initials}
                  </span>
                  {e.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar + name */}
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className={`${eng.color} text-white text-xl font-bold`}>
                  {eng.initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">{eng.name}</h2>
                <p className="text-sm text-gray-500">{eng.position}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={statusVariant(eng.status)}>{eng.status}</Badge>
                  <Badge variant={eng.employment === 'Штатный' ? 'default' : 'secondary'}>
                    {eng.employment}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="Phone" size={14} />
                  <span>{eng.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="Mail" size={14} />
                  <span>{eng.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="MessageCircle" size={14} />
                  <span>{eng.telegram}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name="Clock" size={14} />
                  <span>Стаж: {eng.experienceYears} лет</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon name={transportIcon(eng.transport) as any} size={14} />
                  <span>{eng.transport}</span>
                </div>
              </div>
            </div>

            {/* Rating & Efficiency */}
            <div className="space-y-3 min-w-[180px]">
              <div>
                <p className="text-xs text-gray-500 mb-1">Рейтинг клиентов</p>
                <StarRating rating={eng.rating} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">Балл эффективности</p>
                  <span className="text-sm font-bold text-gray-900">{eng.efficiencyScore}/100</span>
                </div>
                <Progress value={eng.efficiencyScore} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="orders">Наряды</TabsTrigger>
          <TabsTrigger value="competencies">Компетенции</TabsTrigger>
          <TabsTrigger value="salary">Зарплата</TabsTrigger>
          <TabsTrigger value="schedule">График</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Нарядов в мае" value={String(eng.kpi.ordersMonth)} icon="ClipboardList" color="bg-blue-500" />
            <KpiCard label="Выручка" value={`${fmt(eng.kpi.revenueMonth)} ₽`} icon="TrendingUp" color="bg-green-500" />
            <KpiCard label="Средний NPS" value={String(eng.kpi.avgNps)} icon="Star" color="bg-amber-500" />
            <KpiCard label="% в срок" value={`${eng.kpi.onTimePercent}%`} icon="CheckCircle" color="bg-purple-500" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Выручка и наряды (последние 6 месяцев)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={eng.revenueHistory}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="rev" orientation="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                  <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number, n: string) => n === 'revenue' ? [`${fmt(v)} ₽`, 'Выручка'] : [v, 'Нарядов']} />
                  <Legend formatter={(v) => v === 'revenue' ? 'Выручка' : 'Нарядов'} />
                  <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
                  <Area yAxisId="ord" type="monotone" dataKey="orders" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Текущие наряды</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {eng.currentOrders.length === 0
                  ? <p className="text-sm text-gray-400">Нарядов нет</p>
                  : eng.currentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs font-mono text-gray-400">{o.id}</p>
                        <p className="text-sm font-medium">{o.client}</p>
                        <p className="text-xs text-gray-500">{o.time}</p>
                      </div>
                      <Badge variant={orderStatusVariant(o.status)}>{o.status}</Badge>
                    </div>
                  ))
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Автомобиль</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name={transportIcon(eng.transport) as any} size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{eng.transportModel}</p>
                    <p className="text-xs text-gray-500">{eng.transportPlate}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Пробег за май</p>
                    <p className="font-bold">{fmt(eng.fuelKm)} км</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">ГСМ к компенсации</p>
                    <p className="font-bold">{fmt(eng.fuelCompensation)} ₽</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── ORDERS ── */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">История нарядов</h3>
            <Select value={ordersMonth} onValueChange={setOrdersMonth}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="may">Май 2025</SelectItem>
                <SelectItem value="apr">Апрель 2025</SelectItem>
                <SelectItem value="mar">Март 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Дата', '№ наряда', 'Клиент', 'Тип', 'Статус', 'Длит.', 'NPS', 'Сумма ₽'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {eng.workOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-500">{o.date}</td>
                        <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                        <td className="px-3 py-2 font-medium">{o.client}</td>
                        <td className="px-3 py-2 text-gray-600">{o.type}</td>
                        <td className="px-3 py-2"><Badge variant={orderStatusVariant(o.status)}>{o.status}</Badge></td>
                        <td className="px-3 py-2 text-gray-600">{o.duration}</td>
                        <td className="px-3 py-2 text-center">{o.nps ?? '—'}</td>
                        <td className="px-3 py-2 font-medium text-right">{fmt(o.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Нарядов по дням недели</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={eng.ordersPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Нарядов" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── COMPETENCIES ── */}
        <TabsContent value="competencies" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Профиль компетенций</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={eng.radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar name="Текущий" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Целевой" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 2" />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Уровни навыков</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {eng.competencies.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{c.name}</span>
                      <span className="text-xs font-medium text-gray-500">{levelLabel(c.current)}</span>
                    </div>
                    <Progress value={(c.current / 4) * 100} className="h-1.5" />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => toast.success('Обучение назначено', { description: `${eng.name} добавлен в план обучения` })}
                >
                  <Icon name="BookOpen" size={14} className="mr-2" />
                  Назначить обучение
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Сертификаты</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {eng.certificates.map((c) => (
                <div key={c.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">Выдан: {c.issued} · Действует до: {c.expires}</p>
                  </div>
                  <Badge variant={certVariant(c.status)}>{c.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SALARY ── */}
        <TabsContent value="salary" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Расчётный листок — Май 2025</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Сдельная ставка', value: eng.payroll.piecework, icon: 'Wrench', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Надбавки', value: eng.payroll.bonuses, icon: 'Award', color: 'bg-amber-50 text-amber-600' },
                  { label: 'ГСМ', value: eng.payroll.fuel, icon: 'Fuel', color: 'bg-orange-50 text-orange-600' },
                  { label: 'ИТОГО', value: eng.payroll.total, icon: 'Wallet', color: 'bg-green-50 text-green-600' },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-lg ${item.color.split(' ')[0]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name={item.icon as any} size={14} className={item.color.split(' ')[1]} />
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                    <p className={`text-lg font-bold ${item.color.split(' ')[1]}`}>{fmt(item.value)} ₽</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Выполнение плана</span>
                  <span className="text-sm font-bold">{eng.payroll.planPercent}%</span>
                </div>
                <Progress value={eng.payroll.planPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Зарплата по месяцам</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={eng.salaryHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                  <Tooltip formatter={(v: number) => [`${fmt(v)} ₽`, 'Зарплата']} />
                  <Bar dataKey="amount" name="Зарплата" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SCHEDULE ── */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Неделя: {eng.schedule[0]?.date} – {eng.schedule[6]?.date}
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setScheduleWeekOffset((p) => p - 1)}>
                <Icon name="ChevronLeft" size={14} className="mr-1" />
                Прошлая
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScheduleWeekOffset((p) => p + 1)}>
                Следующая
                <Icon name="ChevronRight" size={14} className="ml-1" />
              </Button>
            </div>
          </div>
          {scheduleWeekOffset !== 0 && (
            <p className="text-xs text-gray-400 italic">
              (смещение: {scheduleWeekOffset > 0 ? `+${scheduleWeekOffset}` : scheduleWeekOffset} нед. — данные статичны)
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {eng.schedule.map((day) => (
              <Card key={day.date} className={day.dayStatus !== 'Рабочий' ? 'opacity-60' : ''}>
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{day.weekday} {day.date}</span>
                    <Badge variant={dayCellVariant(day.dayStatus)} className="text-xs">
                      {day.dayStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-1">
                  {day.orders.length === 0
                    ? <p className="text-xs text-gray-400">Нарядов нет</p>
                    : day.orders.map((o, i) => (
                      <div key={i} className="text-xs bg-blue-50 rounded p-1.5">
                        <span className="font-mono text-blue-600 mr-1">{o.time}</span>
                        <span className="text-gray-700">{o.client}</span>
                        <span className="ml-1 text-gray-400">· {o.type}</span>
                      </div>
                    ))
                  }
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
