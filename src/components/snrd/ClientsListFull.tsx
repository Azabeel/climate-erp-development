import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientType = 'LEGAL' | 'INDIVIDUAL';
type ClientStatus = 'active' | 'inactive';
type ViewMode = 'table' | 'grid';

interface Contract {
  id: string;
  number: string;
  type: string;
  startDate: string;
  endDate: string;
  sla: string;
  active: boolean;
}

interface WorkOrderMini {
  id: string;
  number: string;
  date: string;
  status: string;
  description: string;
}

interface Client {
  id: string;
  type: ClientType;
  name: string;
  inn?: string;
  phone: string;
  email: string;
  city: string;
  manager: string;
  managerInitials: string;
  managerColor: string;
  ordersCount: number;
  revenue: number;
  nps: number;
  lastVisit: string;
  clientSince: number;
  status: ClientStatus;
  contract?: Contract;
  recentOrders: WorkOrderMini[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const CLIENTS: Client[] = [
  {
    id: '1', type: 'LEGAL', name: 'ООО «АрктикХолод»', inn: '7701234567',
    phone: '+7 (495) 123-45-67', email: 'info@arkticholod.ru', city: 'Москва',
    manager: 'Иванова А.', managerInitials: 'ИА', managerColor: 'bg-blue-500',
    ordersCount: 48, revenue: 1240000, nps: 9, lastVisit: '12.05.2026', clientSince: 2019,
    status: 'active',
    contract: { id: 'c1', number: 'ДО-2024-001', type: 'Сервисное обслуживание', startDate: '01.01.2024', endDate: '31.12.2026', sla: 'SLA Корпоративный', active: true },
    recentOrders: [
      { id: 'wo1', number: 'WO-2026-001234', date: '12.05.2026', status: 'Выполнен', description: 'ТО чиллера Carrier' },
      { id: 'wo2', number: 'WO-2026-001198', date: '28.04.2026', status: 'Выполнен', description: 'Заправка R-410A' },
      { id: 'wo3', number: 'WO-2026-001150', date: '10.04.2026', status: 'Выполнен', description: 'Замена фреонового фильтра' },
    ],
  },
  {
    id: '2', type: 'LEGAL', name: 'АО «ТермоГрупп»', inn: '7709876543',
    phone: '+7 (495) 987-65-43', email: 'service@thermogroup.ru', city: 'Москва',
    manager: 'Петров С.', managerInitials: 'ПС', managerColor: 'bg-green-500',
    ordersCount: 35, revenue: 890000, nps: 8, lastVisit: '10.05.2026', clientSince: 2020,
    status: 'active',
    contract: { id: 'c2', number: 'ДО-2024-012', type: 'Расширенное ТО', startDate: '15.03.2024', endDate: '14.03.2027', sla: 'SLA Premium', active: true },
    recentOrders: [
      { id: 'wo4', number: 'WO-2026-001220', date: '10.05.2026', status: 'В работе', description: 'Диагностика VRF системы' },
      { id: 'wo5', number: 'WO-2026-001180', date: '22.04.2026', status: 'Выполнен', description: 'ТО кондиционеров (12 ед.)' },
      { id: 'wo6', number: 'WO-2026-001130', date: '05.04.2026', status: 'Выполнен', description: 'Промывка теплообменников' },
    ],
  },
  {
    id: '3', type: 'INDIVIDUAL', name: 'Смирнов Дмитрий Александрович', inn: undefined,
    phone: '+7 (916) 234-56-78', email: 'smirnov.da@gmail.com', city: 'Москва',
    manager: 'Козлова М.', managerInitials: 'КМ', managerColor: 'bg-purple-500',
    ordersCount: 7, revenue: 95000, nps: 10, lastVisit: '08.05.2026', clientSince: 2022,
    status: 'active',
    contract: undefined,
    recentOrders: [
      { id: 'wo7', number: 'WO-2026-001210', date: '08.05.2026', status: 'Выполнен', description: 'Чистка сплит-системы' },
      { id: 'wo8', number: 'WO-2026-001050', date: '20.03.2026', status: 'Выполнен', description: 'Заправка кондиционера' },
      { id: 'wo9', number: 'WO-2025-003890', date: '15.09.2025', status: 'Выполнен', description: 'Установка кондиционера' },
    ],
  },
  {
    id: '4', type: 'LEGAL', name: 'ООО «КлиматСервис Плюс»', inn: '5031234567',
    phone: '+7 (495) 456-78-90', email: 'zakaz@klimatplus.ru', city: 'Химки',
    manager: 'Иванова А.', managerInitials: 'ИА', managerColor: 'bg-blue-500',
    ordersCount: 62, revenue: 1580000, nps: 7, lastVisit: '14.05.2026', clientSince: 2018,
    status: 'active',
    contract: { id: 'c4', number: 'ДО-2023-045', type: 'Комплексное обслуживание', startDate: '01.07.2023', endDate: '30.06.2026', sla: 'SLA Корпоративный', active: true },
    recentOrders: [
      { id: 'wo10', number: 'WO-2026-001240', date: '14.05.2026', status: 'Назначен', description: 'Ремонт чиллера York' },
      { id: 'wo11', number: 'WO-2026-001215', date: '11.05.2026', status: 'Выполнен', description: 'ТО холодильных витрин' },
      { id: 'wo12', number: 'WO-2026-001190', date: '30.04.2026', status: 'Выполнен', description: 'Замена компрессора' },
    ],
  },
  {
    id: '5', type: 'INDIVIDUAL', name: 'Новикова Елена Ивановна', inn: undefined,
    phone: '+7 (926) 345-67-89', email: 'novikova.ei@mail.ru', city: 'Красногорск',
    manager: 'Петров С.', managerInitials: 'ПС', managerColor: 'bg-green-500',
    ordersCount: 3, revenue: 28000, nps: 9, lastVisit: '05.04.2026', clientSince: 2024,
    status: 'active',
    contract: undefined,
    recentOrders: [
      { id: 'wo13', number: 'WO-2026-001100', date: '05.04.2026', status: 'Выполнен', description: 'Установка сплит-системы' },
      { id: 'wo14', number: 'WO-2026-001030', date: '15.03.2026', status: 'Выполнен', description: 'Консультация и выезд' },
      { id: 'wo15', number: 'WO-2025-004100', date: '10.11.2025', status: 'Выполнен', description: 'Демонтаж старого кондиционера' },
    ],
  },
  {
    id: '6', type: 'LEGAL', name: 'ЗАО «РефриджТех»', inn: '7734567890',
    phone: '+7 (495) 567-89-01', email: 'tech@refrigtech.ru', city: 'Москва',
    manager: 'Козлова М.', managerInitials: 'КМ', managerColor: 'bg-purple-500',
    ordersCount: 29, revenue: 720000, nps: 8, lastVisit: '09.05.2026', clientSince: 2021,
    status: 'active',
    contract: { id: 'c6', number: 'ДО-2025-007', type: 'Гарантийное обслуживание', startDate: '01.01.2025', endDate: '31.12.2026', sla: 'SLA Стандарт', active: true },
    recentOrders: [
      { id: 'wo16', number: 'WO-2026-001225', date: '09.05.2026', status: 'Выполнен', description: 'Регламентное ТО' },
      { id: 'wo17', number: 'WO-2026-001170', date: '18.04.2026', status: 'Выполнен', description: 'Ремонт холодильной камеры' },
      { id: 'wo18', number: 'WO-2026-001120', date: '01.04.2026', status: 'Выполнен', description: 'Заправка хладагента' },
    ],
  },
  {
    id: '7', type: 'INDIVIDUAL', name: 'Захаров Михаил Петрович', inn: undefined,
    phone: '+7 (903) 456-78-90', email: 'zakharov.mp@yandex.ru', city: 'Одинцово',
    manager: 'Иванова А.', managerInitials: 'ИА', managerColor: 'bg-blue-500',
    ordersCount: 5, revenue: 42000, nps: 8, lastVisit: '02.05.2026', clientSince: 2023,
    status: 'active',
    contract: undefined,
    recentOrders: [
      { id: 'wo19', number: 'WO-2026-001160', date: '02.05.2026', status: 'Выполнен', description: 'Ремонт кондиционера Daikin' },
      { id: 'wo20', number: 'WO-2026-000980', date: '05.02.2026', status: 'Выполнен', description: 'Чистка дренажной системы' },
      { id: 'wo21', number: 'WO-2025-003750', date: '20.08.2025', status: 'Выполнен', description: 'Сезонное ТО' },
    ],
  },
  {
    id: '8', type: 'LEGAL', name: 'ООО «МегаМолл Девелопмент»', inn: '7712345678',
    phone: '+7 (495) 678-90-12', email: 'facility@megamoll.ru', city: 'Москва',
    manager: 'Петров С.', managerInitials: 'ПС', managerColor: 'bg-green-500',
    ordersCount: 85, revenue: 2340000, nps: 7, lastVisit: '15.05.2026', clientSince: 2017,
    status: 'active',
    contract: { id: 'c8', number: 'ДО-2024-003', type: 'Комплексное ТО', startDate: '01.01.2024', endDate: '31.12.2026', sla: 'SLA Premium', active: true },
    recentOrders: [
      { id: 'wo22', number: 'WO-2026-001245', date: '15.05.2026', status: 'В работе', description: 'Плановое ТО ТЦ (50 ед.)' },
      { id: 'wo23', number: 'WO-2026-001230', date: '13.05.2026', status: 'Выполнен', description: 'Аварийный выезд, утечка' },
      { id: 'wo24', number: 'WO-2026-001205', date: '07.05.2026', status: 'Выполнен', description: 'Замена фильтров' },
    ],
  },
  {
    id: '9', type: 'INDIVIDUAL', name: 'Федорова Ольга Сергеевна', inn: undefined,
    phone: '+7 (967) 567-89-01', email: 'fedorova.os@gmail.com', city: 'Зеленоград',
    manager: 'Козлова М.', managerInitials: 'КМ', managerColor: 'bg-purple-500',
    ordersCount: 2, revenue: 18500, nps: 10, lastVisit: '25.03.2026', clientSince: 2025,
    status: 'active',
    contract: undefined,
    recentOrders: [
      { id: 'wo25', number: 'WO-2026-001070', date: '25.03.2026', status: 'Выполнен', description: 'Установка кондиционера' },
      { id: 'wo26', number: 'WO-2026-001055', date: '20.03.2026', status: 'Выполнен', description: 'Монтаж трассы' },
      { id: 'wo27', number: 'WO-2026-001040', date: '18.03.2026', status: 'Выполнен', description: 'Выезд и замер' },
    ],
  },
  {
    id: '10', type: 'LEGAL', name: 'ГУП «МосКлимат»', inn: '7705678901',
    phone: '+7 (495) 789-01-23', email: 'info@mosklimat.ru', city: 'Москва',
    manager: 'Иванова А.', managerInitials: 'ИА', managerColor: 'bg-blue-500',
    ordersCount: 54, revenue: 1650000, nps: 6, lastVisit: '11.05.2026', clientSince: 2016,
    status: 'active',
    contract: { id: 'c10', number: 'ДО-2025-015', type: 'Государственный контракт', startDate: '01.04.2025', endDate: '31.03.2027', sla: 'SLA Корпоративный', active: true },
    recentOrders: [
      { id: 'wo28', number: 'WO-2026-001235', date: '11.05.2026', status: 'Выполнен', description: 'ТО административных зданий' },
      { id: 'wo29', number: 'WO-2026-001195', date: '01.05.2026', status: 'Выполнен', description: 'Ремонт систем вентиляции' },
      { id: 'wo30', number: 'WO-2026-001145', date: '08.04.2026', status: 'Выполнен', description: 'Диагностика' },
    ],
  },
  {
    id: '11', type: 'INDIVIDUAL', name: 'Морозов Андрей Викторович', inn: undefined,
    phone: '+7 (915) 678-90-12', email: 'morozov.av@mail.ru', city: 'Мытищи',
    manager: 'Петров С.', managerInitials: 'ПС', managerColor: 'bg-green-500',
    ordersCount: 4, revenue: 35000, nps: 9, lastVisit: '30.04.2026', clientSince: 2023,
    status: 'inactive',
    contract: undefined,
    recentOrders: [
      { id: 'wo31', number: 'WO-2026-001140', date: '30.04.2026', status: 'Выполнен', description: 'Сезонное ТО' },
      { id: 'wo32', number: 'WO-2025-003600', date: '15.07.2025', status: 'Выполнен', description: 'Заправка фреона' },
      { id: 'wo33', number: 'WO-2025-002800', date: '10.05.2025', status: 'Выполнен', description: 'Чистка кондиционера' },
    ],
  },
  {
    id: '12', type: 'LEGAL', name: 'ООО «СтройКомфорт»', inn: '5001234567',
    phone: '+7 (498) 890-12-34', email: 'klimat@stroycomfort.ru', city: 'Подольск',
    manager: 'Козлова М.', managerInitials: 'КМ', managerColor: 'bg-purple-500',
    ordersCount: 18, revenue: 420000, nps: 8, lastVisit: '07.05.2026', clientSince: 2022,
    status: 'active',
    contract: { id: 'c12', number: 'ДО-2025-022', type: 'Сервисное обслуживание', startDate: '01.06.2025', endDate: '31.05.2027', sla: 'SLA Стандарт', active: true },
    recentOrders: [
      { id: 'wo34', number: 'WO-2026-001200', date: '07.05.2026', status: 'Выполнен', description: 'ТО офиса' },
      { id: 'wo35', number: 'WO-2026-001110', date: '25.03.2026', status: 'Выполнен', description: 'Замена фильтров' },
      { id: 'wo36', number: 'WO-2026-001002', date: '10.01.2026', status: 'Выполнен', description: 'Диагностика VRV' },
    ],
  },
  {
    id: '13', type: 'INDIVIDUAL', name: 'Волков Сергей Николаевич', inn: undefined,
    phone: '+7 (925) 789-01-23', email: 'volkov.sn@yandex.ru', city: 'Люберцы',
    manager: 'Иванова А.', managerInitials: 'ИА', managerColor: 'bg-blue-500',
    ordersCount: 6, revenue: 58000, nps: 8, lastVisit: '03.05.2026', clientSince: 2021,
    status: 'active',
    contract: undefined,
    recentOrders: [
      { id: 'wo37', number: 'WO-2026-001165', date: '03.05.2026', status: 'Выполнен', description: 'Ремонт кассетного кондиционера' },
      { id: 'wo38', number: 'WO-2026-000900', date: '15.01.2026', status: 'Выполнен', description: 'Заправка R-32' },
      { id: 'wo39', number: 'WO-2025-003500', date: '01.07.2025', status: 'Выполнен', description: 'Сезонное ТО' },
    ],
  },
  {
    id: '14', type: 'LEGAL', name: 'ПАО «ХолодПромИнвест»', inn: '7723456789',
    phone: '+7 (495) 901-23-45', email: 'service@holodprom.ru', city: 'Москва',
    manager: 'Петров С.', managerInitials: 'ПС', managerColor: 'bg-green-500',
    ordersCount: 41, revenue: 1100000, nps: 7, lastVisit: '13.05.2026', clientSince: 2019,
    status: 'active',
    contract: { id: 'c14', number: 'ДО-2024-018', type: 'Расширенное ТО', startDate: '01.09.2024', endDate: '31.08.2027', sla: 'SLA Корпоративный', active: true },
    recentOrders: [
      { id: 'wo40', number: 'WO-2026-001238', date: '13.05.2026', status: 'В работе', description: 'Плановое ТО производства' },
      { id: 'wo41', number: 'WO-2026-001185', date: '25.04.2026', status: 'Выполнен', description: 'Ремонт промышленного чиллера' },
      { id: 'wo42', number: 'WO-2026-001135', date: '07.04.2026', status: 'Выполнен', description: 'Замена компрессора' },
    ],
  },
  {
    id: '15', type: 'INDIVIDUAL', name: 'Соколова Татьяна Юрьевна', inn: undefined,
    phone: '+7 (909) 012-34-56', email: 'sokolova.ty@gmail.com', city: 'Балашиха',
    manager: 'Козлова М.', managerInitials: 'КМ', managerColor: 'bg-purple-500',
    ordersCount: 2, revenue: 15000, nps: 10, lastVisit: '18.04.2026', clientSince: 2025,
    status: 'inactive',
    contract: undefined,
    recentOrders: [
      { id: 'wo43', number: 'WO-2026-001115', date: '18.04.2026', status: 'Выполнен', description: 'Установка кондиционера' },
      { id: 'wo44', number: 'WO-2026-001095', date: '10.04.2026', status: 'Выполнен', description: 'Монтаж трассы' },
      { id: 'wo45', number: 'WO-2026-001080', date: '05.04.2026', status: 'Выполнен', description: 'Выезд и замер' },
    ],
  },
];

// ─── Charts Data ──────────────────────────────────────────────────────────────

const PIE_DATA = [
  { name: 'Юрлица', value: 187, color: '#3b82f6' },
  { name: 'Физлица', value: 125, color: '#8b5cf6' },
];

const TOP_CLIENTS_DATA = [
  { name: 'МегаМолл', orders: 85 },
  { name: 'МосКлимат', orders: 54 },
  { name: 'КлиматС.+', orders: 62 },
  { name: 'АрктикХол', orders: 48 },
  { name: 'ХолодПром', orders: 41 },
  { name: 'ТермоГруп', orders: 35 },
  { name: 'РефриджТех', orders: 29 },
  { name: 'СтройКом', orders: 18 },
  { name: 'Смирнов', orders: 7 },
  { name: 'Волков', orders: 6 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.replace('ООО «', '').replace('АО «', '').replace('ЗАО «', '').replace('ПАО «', '').replace('ГУП «', '').replace('»', '').trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatMoney(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} млн ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)} тыс ₽`;
  return `${value} ₽`;
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  'Выполнен': 'bg-green-100 text-green-700',
  'В работе': 'bg-blue-100 text-blue-700',
  'Назначен': 'bg-yellow-100 text-yellow-700',
  'Отменён': 'bg-red-100 text-red-700',
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps { title: string; value: string | number; icon: string; color: string; }

function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon name={icon} size={22} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ client, onClose }: { client: Client; onClose: () => void }) {
  const initials = getInitials(client.name);

  return (
    <div className="w-[400px] border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-semibold text-gray-700">Карточка клиента</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={16} />
        </Button>
      </div>

      {/* Header */}
      <div className="px-4 py-4 border-b bg-gray-50">
        <div className="flex items-start gap-3">
          <Avatar className="w-14 h-14">
            <AvatarFallback className={`text-white text-lg font-semibold ${client.type === 'LEGAL' ? 'bg-blue-500' : 'bg-purple-500'}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight">{client.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={client.type === 'LEGAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'} variant="secondary">
                {client.type === 'LEGAL' ? 'Юрлицо' : 'Физлицо'}
              </Badge>
              <Badge className={client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} variant="secondary">
                {client.status === 'active' ? 'Активен' : 'Неактивен'}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">Клиент с {client.clientSince} · {client.city}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" className="flex-1 gap-1.5 text-xs">
            <Icon name="Plus" size={12} /> Создать наряд
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Icon name="Phone" size={12} /> Позвонить
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Icon name="MessageCircle" size={12} /> Написать
          </Button>
        </div>
      </div>

      {/* Contacts */}
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Контакты</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icon name="Phone" size={13} className="text-gray-400 shrink-0" />
            {client.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icon name="Mail" size={13} className="text-gray-400 shrink-0" />
            {client.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icon name="MapPin" size={13} className="text-gray-400 shrink-0" />
            {client.city}
          </div>
          {client.inn && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Icon name="Building2" size={13} className="text-gray-400 shrink-0" />
              ИНН: {client.inn}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icon name="User" size={13} className="text-gray-400 shrink-0" />
            Менеджер: {client.manager}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Статистика</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Нарядов', value: client.ordersCount, icon: 'Wrench' },
            { label: 'Выручка', value: formatMoney(client.revenue), icon: 'TrendingUp' },
            { label: 'NPS', value: `${client.nps}/10`, icon: 'Star' },
            { label: 'Последний визит', value: client.lastVisit, icon: 'Calendar' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Последние наряды</p>
        <div className="space-y-2">
          {client.recentOrders.map((wo) => (
            <div key={wo.id} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-mono text-blue-600">{wo.number}</p>
                <p className="text-xs text-gray-600 truncate">{wo.description}</p>
                <p className="text-xs text-gray-400">{wo.date}</p>
              </div>
              <Badge className={`text-xs shrink-0 ${ORDER_STATUS_COLORS[wo.status] ?? 'bg-gray-100 text-gray-600'}`} variant="secondary">
                {wo.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Contract */}
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Договор</p>
        {client.contract ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">{client.contract.number}</p>
              <Badge className="bg-green-100 text-green-700" variant="secondary">Активен</Badge>
            </div>
            <p className="text-xs text-gray-500">{client.contract.type}</p>
            <p className="text-xs text-gray-500">{client.contract.startDate} — {client.contract.endDate}</p>
            <p className="text-xs text-blue-600 font-medium">{client.contract.sla}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Нет активного договора</p>
        )}
      </div>

      <div className="px-4 py-3">
        <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => toast.info(`Открытие карточки клиента: ${client.name}`)}>
          <Icon name="ExternalLink" size={14} />
          Открыть полную карточку
        </Button>
      </div>
    </div>
  );
}

// ─── Add Client Dialog ────────────────────────────────────────────────────────

function AddClientDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<ClientType>('LEGAL');
  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [manager, setManager] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Заполните обязательные поля: Название и Телефон');
      return;
    }
    toast.success(`Клиент «${name}» успешно добавлен`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить клиента</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Тип клиента</label>
            <Select value={type} onValueChange={(v) => setType(v as ClientType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEGAL">Юридическое лицо</SelectItem>
                <SelectItem value="INDIVIDUAL">Физическое лицо</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {type === 'LEGAL' ? 'Название организации' : 'ФИО'} <span className="text-red-500">*</span>
            </label>
            <Input placeholder={type === 'LEGAL' ? 'ООО «Название»' : 'Фамилия Имя Отчество'} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {type === 'LEGAL' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">ИНН</label>
              <Input placeholder="0000000000" value={inn} onChange={(e) => setInn(e.target.value)} />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Телефон <span className="text-red-500">*</span></label>
            <Input placeholder="+7 (000) 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
            <Input placeholder="email@example.ru" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Менеджер</label>
            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите менеджера" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Иванова А.">Иванова А.</SelectItem>
                <SelectItem value="Петров С.">Петров С.</SelectItem>
                <SelectItem value="Козлова М.">Козлова М.</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Icon name="UserPlus" size={14} />
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function ClientGridCard({ client, onSelect }: { client: Client; onSelect: () => void }) {
  const initials = getInitials(client.name);
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-11 h-11 shrink-0">
            <AvatarFallback className={`text-white font-semibold text-sm ${client.type === 'LEGAL' ? 'bg-blue-500' : 'bg-purple-500'}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{client.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Badge className={`text-xs ${client.type === 'LEGAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`} variant="secondary">
                {client.type === 'LEGAL' ? 'Юрлицо' : 'Физлицо'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Icon name="MapPin" size={11} className="text-gray-400" />
            {client.city}
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="Wrench" size={11} className="text-gray-400" />
            {client.ordersCount} нарядов
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="FileText" size={11} className="text-gray-400" />
            {client.contract ? (
              <span className="text-green-600 font-medium">Договор активен</span>
            ) : (
              <span className="text-gray-400">Без договора</span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 mt-3">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-7 gap-1">
            <Icon name="Eye" size={11} /> Просмотр
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={(e) => { e.stopPropagation(); toast.info(`Звонок: ${client.phone}`); }}>
            <Icon name="Phone" size={11} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientsListFull() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'LEGAL' | 'INDIVIDUAL'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'revenue' | 'since'>('name');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filtered = CLIENTS
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.inn ?? '').includes(q);
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchManager = managerFilter === 'all' || c.manager === managerFilter;
      return matchSearch && matchType && matchStatus && matchManager;
    })
    .sort((a, b) => {
      if (sortBy === 'orders') return b.ordersCount - a.ordersCount;
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'since') return a.clientSince - b.clientSince;
      return a.name.localeCompare(b.name, 'ru');
    });

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Клиенты</h1>
            <p className="text-sm text-gray-500 mt-0.5">Управление клиентской базой</p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Icon name="UserPlus" size={15} />
            Добавить клиента
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard title="Всего клиентов" value={312} icon="Users" color="bg-blue-500" />
            <KpiCard title="Юридических лиц" value={187} icon="Building2" color="bg-indigo-500" />
            <KpiCard title="Физических лиц" value={125} icon="User" color="bg-purple-500" />
            <KpiCard title="Активных договоров" value={94} icon="FileCheck" color="bg-green-500" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Соотношение типов клиентов</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, '']} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Топ-10 клиентов по нарядам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={TOP_CLIENTS_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Нарядов" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input className="pl-8 h-9 text-sm" placeholder="Поиск по имени, телефону, ИНН..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue placeholder="Тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="LEGAL">Юрлицо</SelectItem>
                    <SelectItem value="INDIVIDUAL">Физлицо</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="inactive">Неактивен</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={managerFilter} onValueChange={setManagerFilter}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue placeholder="Менеджер" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все менеджеры</SelectItem>
                    <SelectItem value="Иванова А.">Иванова А.</SelectItem>
                    <SelectItem value="Петров С.">Петров С.</SelectItem>
                    <SelectItem value="Козлова М.">Козлова М.</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">По названию</SelectItem>
                    <SelectItem value="orders">По нарядам</SelectItem>
                    <SelectItem value="revenue">По выручке</SelectItem>
                    <SelectItem value="since">Клиент с</SelectItem>
                  </SelectContent>
                </Select>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <TabsList className="h-9">
                    <TabsTrigger value="table" className="px-3 gap-1.5 text-sm">
                      <Icon name="List" size={13} /> Список
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="px-3 gap-1.5 text-sm">
                      <Icon name="LayoutGrid" size={13} /> Карточки
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <span className="text-sm text-gray-400 ml-auto shrink-0">Найдено: {filtered.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Table View */}
          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="pl-4 w-8">#</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>ИНН</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Менеджер</TableHead>
                      <TableHead className="text-center">Нарядов</TableHead>
                      <TableHead>Договор</TableHead>
                      <TableHead className="text-center">С года</TableHead>
                      <TableHead className="text-right pr-4">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((client, idx) => {
                      const initials = getInitials(client.name);
                      const isSelected = selectedClient?.id === client.id;
                      return (
                        <TableRow
                          key={client.id}
                          className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedClient(isSelected ? null : client)}
                        >
                          <TableCell className="pl-4 text-xs text-gray-400">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className={`text-white text-xs font-semibold ${client.type === 'LEGAL' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{client.name}</p>
                                <p className="text-xs text-gray-400">{client.city}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${client.type === 'LEGAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`} variant="secondary">
                              {client.type === 'LEGAL' ? 'Юрлицо' : 'Физлицо'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 font-mono text-xs">{client.inn ?? '—'}</TableCell>
                          <TableCell className="text-sm text-gray-600">{client.phone}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className={`text-white text-[9px] ${client.managerColor}`}>
                                  {client.managerInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">{client.manager}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-semibold text-gray-800">{client.ordersCount}</span>
                          </TableCell>
                          <TableCell>
                            {client.contract ? (
                              <Badge className="bg-green-100 text-green-700 text-xs" variant="secondary">Активен</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-500 text-xs" variant="secondary">Нет</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-600">{client.clientSince}</TableCell>
                          <TableCell className="text-right pr-4">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => toast.info(`Создание наряда для: ${client.name}`)}>
                                <Icon name="Plus" size={13} />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => toast.info(`Звонок: ${client.phone}`)}>
                                <Icon name="Phone" size={13} />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => setSelectedClient(client)}>
                                <Icon name="Eye" size={13} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-4 gap-4">
              {filtered.map((client) => (
                <ClientGridCard
                  key={client.id}
                  client={client}
                  onSelect={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedClient && (
        <DetailPanel client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}

      <AddClientDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />
    </div>
  );
}
