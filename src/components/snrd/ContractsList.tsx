import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

type ContractType = 'СЛА' | 'Разовый' | 'Абонентский';
type ContractStatus = 'Активен' | 'На продлении' | 'Истёк';
type SLALevel = 'Стандарт' | 'Приоритет' | 'Критичный';

interface ContractObject {
  name: string;
  address: string;
  equipment: string;
}

interface PaymentScheduleItem {
  date: string;
  amount: number;
  status: 'Оплачен' | 'Ожидается' | 'Просрочен';
}

interface Contract {
  id: string;
  number: string;
  clientName: string;
  type: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paidAmount: number;
  objectsCount: number;
  slaLevel: SLALevel;
  objects: ContractObject[];
  slaTerms: string[];
  paymentSchedule: PaymentScheduleItem[];
}

const mockContracts: Contract[] = [
  {
    id: '1',
    number: 'ДОГ-2024-001',
    clientName: 'ООО "ТехноСервис"',
    type: 'СЛА',
    status: 'Активен',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    totalAmount: 1500000,
    paidAmount: 1125000,
    objectsCount: 3,
    slaLevel: 'Приоритет',
    objects: [
      { name: 'Офис на Ленина, 12', address: 'ул. Ленина, 12, оф. 305', equipment: 'Daikin VRV 48кВт' },
      { name: 'Склад Северный', address: 'пр. Северный, 78', equipment: 'Carrier 24кВт x2' },
      { name: 'Торговый зал', address: 'ул. Ленина, 12, этаж 1', equipment: 'LG Multi F 18кВт' },
    ],
    slaTerms: ['Время реакции: 2 часа', 'Время устранения: 8 часов', 'Плановое ТО: 2 раза в год', 'Круглосуточная поддержка'],
    paymentSchedule: [
      { date: '2024-01-15', amount: 375000, status: 'Оплачен' },
      { date: '2024-04-15', amount: 375000, status: 'Оплачен' },
      { date: '2024-07-15', amount: 375000, status: 'Оплачен' },
      { date: '2024-10-15', amount: 375000, status: 'Ожидается' },
    ],
  },
  {
    id: '2',
    number: 'ДОГ-2024-002',
    clientName: 'АО "ПромСтрой"',
    type: 'Абонентский',
    status: 'На продлении',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    totalAmount: 850000,
    paidAmount: 850000,
    objectsCount: 2,
    slaLevel: 'Стандарт',
    objects: [
      { name: 'Производственный цех', address: 'ул. Промышленная, 5', equipment: 'Mitsubishi Heavy 60кВт' },
      { name: 'Административный корпус', address: 'ул. Промышленная, 5А', equipment: 'Daikin 30кВт' },
    ],
    slaTerms: ['Время реакции: 4 часа', 'Время устранения: 24 часа', 'Плановое ТО: 1 раз в год'],
    paymentSchedule: [
      { date: '2024-03-01', amount: 425000, status: 'Оплачен' },
      { date: '2024-09-01', amount: 425000, status: 'Оплачен' },
    ],
  },
  {
    id: '3',
    number: 'ДОГ-2023-045',
    clientName: 'ИП Смирнов А.П.',
    type: 'Разовый',
    status: 'Истёк',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    totalAmount: 320000,
    paidAmount: 320000,
    objectsCount: 1,
    slaLevel: 'Стандарт',
    objects: [
      { name: 'Офис', address: 'ул. Мира, 22, оф. 7', equipment: 'Samsung 12кВт x3' },
    ],
    slaTerms: ['Время реакции: 8 часов', 'Время устранения: 48 часов'],
    paymentSchedule: [
      { date: '2023-06-01', amount: 160000, status: 'Оплачен' },
      { date: '2023-12-01', amount: 160000, status: 'Оплачен' },
    ],
  },
  {
    id: '4',
    number: 'ДОГ-2024-003',
    clientName: 'ООО "МегаМолл"',
    type: 'СЛА',
    status: 'Активен',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    totalAmount: 3200000,
    paidAmount: 2400000,
    objectsCount: 5,
    slaLevel: 'Критичный',
    objects: [
      { name: 'ТЦ МегаМолл — зона А', address: 'пр. Победы, 100, зона А', equipment: 'Daikin VRV 120кВт' },
      { name: 'ТЦ МегаМолл — зона Б', address: 'пр. Победы, 100, зона Б', equipment: 'Daikin VRV 120кВт' },
      { name: 'Кинотеатр', address: 'пр. Победы, 100, 3 этаж', equipment: 'Carrier 80кВт' },
      { name: 'Фудкорт', address: 'пр. Победы, 100, 2 этаж', equipment: 'Mitsubishi 60кВт' },
      { name: 'Серверная', address: 'пр. Победы, 100, подвал', equipment: 'Precision cooling 20кВт' },
    ],
    slaTerms: ['Время реакции: 1 час', 'Время устранения: 4 часа', 'Плановое ТО: 4 раза в год', 'Круглосуточная поддержка', 'Выезд дежурного инженера 24/7'],
    paymentSchedule: [
      { date: '2024-02-01', amount: 800000, status: 'Оплачен' },
      { date: '2024-05-01', amount: 800000, status: 'Оплачен' },
      { date: '2024-08-01', amount: 800000, status: 'Оплачен' },
      { date: '2024-11-01', amount: 800000, status: 'Ожидается' },
    ],
  },
  {
    id: '5',
    number: 'ДОГ-2024-004',
    clientName: 'ЗАО "РосТех"',
    type: 'Абонентский',
    status: 'Активен',
    startDate: '2024-05-15',
    endDate: '2025-05-14',
    totalAmount: 680000,
    paidAmount: 340000,
    objectsCount: 2,
    slaLevel: 'Приоритет',
    objects: [
      { name: 'НИИ корпус 1', address: 'ул. Академическая, 3', equipment: 'Fujitsu 48кВт' },
      { name: 'Лаборатория', address: 'ул. Академическая, 3А', equipment: 'Precision cooling 15кВт' },
    ],
    slaTerms: ['Время реакции: 2 часа', 'Время устранения: 12 часов', 'Плановое ТО: 2 раза в год'],
    paymentSchedule: [
      { date: '2024-05-15', amount: 340000, status: 'Оплачен' },
      { date: '2024-11-15', amount: 340000, status: 'Ожидается' },
    ],
  },
  {
    id: '6',
    number: 'ДОГ-2024-005',
    clientName: 'ООО "Альфа-Центр"',
    type: 'Разовый',
    status: 'Активен',
    startDate: '2024-09-01',
    endDate: '2024-12-31',
    totalAmount: 145000,
    paidAmount: 72500,
    objectsCount: 1,
    slaLevel: 'Стандарт',
    objects: [
      { name: 'Офисный центр', address: 'ул. Новая, 45, 4 этаж', equipment: 'LG 9кВт x5' },
    ],
    slaTerms: ['Время реакции: 8 часов', 'Время устранения: 48 часов'],
    paymentSchedule: [
      { date: '2024-09-01', amount: 72500, status: 'Оплачен' },
      { date: '2024-12-01', amount: 72500, status: 'Ожидается' },
    ],
  },
  {
    id: '7',
    number: 'ДОГ-2023-089',
    clientName: 'ПАО "СтройИнвест"',
    type: 'СЛА',
    status: 'Истёк',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    totalAmount: 2100000,
    paidAmount: 2100000,
    objectsCount: 4,
    slaLevel: 'Критичный',
    objects: [
      { name: 'БЦ Горизонт — этаж 1-5', address: 'пр. Мира, 55', equipment: 'Daikin VRV 200кВт' },
      { name: 'БЦ Горизонт — этаж 6-10', address: 'пр. Мира, 55', equipment: 'Daikin VRV 200кВт' },
      { name: 'Подземная парковка', address: 'пр. Мира, 55, -1', equipment: 'Вентиляция 50кВт' },
      { name: 'Ресторан', address: 'пр. Мира, 55, цоколь', equipment: 'Mitsubishi 30кВт' },
    ],
    slaTerms: ['Время реакции: 1 час', 'Время устранения: 6 часов', 'Плановое ТО: 4 раза в год'],
    paymentSchedule: [
      { date: '2023-01-01', amount: 525000, status: 'Оплачен' },
      { date: '2023-04-01', amount: 525000, status: 'Оплачен' },
      { date: '2023-07-01', amount: 525000, status: 'Оплачен' },
      { date: '2023-10-01', amount: 525000, status: 'Оплачен' },
    ],
  },
  {
    id: '8',
    number: 'ДОГ-2024-006',
    clientName: 'ООО "НоваФарм"',
    type: 'СЛА',
    status: 'На продлении',
    startDate: '2024-04-01',
    endDate: '2024-11-30',
    totalAmount: 560000,
    paidAmount: 420000,
    objectsCount: 2,
    slaLevel: 'Критичный',
    objects: [
      { name: 'Аптека №1', address: 'ул. Советская, 8', equipment: 'Тепловые насосы 15кВт' },
      { name: 'Склад фармацевтики', address: 'ул. Заводская, 33', equipment: 'Precision cooling 25кВт' },
    ],
    slaTerms: ['Время реакции: 1 час', 'Время устранения: 4 часа', 'Плановое ТО: 3 раза в год', 'Мониторинг температурного режима 24/7'],
    paymentSchedule: [
      { date: '2024-04-01', amount: 140000, status: 'Оплачен' },
      { date: '2024-06-01', amount: 140000, status: 'Оплачен' },
      { date: '2024-08-01', amount: 140000, status: 'Оплачен' },
      { date: '2024-10-01', amount: 140000, status: 'Ожидается' },
    ],
  },
];

interface NewContractForm {
  number: string;
  clientName: string;
  type: ContractType | '';
  status: ContractStatus | '';
  startDate: string;
  endDate: string;
  totalAmount: string;
  objectsCount: string;
  slaLevel: SLALevel | '';
}

const statusColors: Record<ContractStatus, string> = {
  'Активен': 'bg-green-100 text-green-700 border-green-200',
  'На продлении': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Истёк': 'bg-gray-100 text-gray-600 border-gray-200',
};

const slaColors: Record<SLALevel, string> = {
  'Стандарт': 'bg-blue-50 text-blue-700 border-blue-200',
  'Приоритет': 'bg-purple-50 text-purple-700 border-purple-200',
  'Критичный': 'bg-red-50 text-red-700 border-red-200',
};

const typeColors: Record<ContractType, string> = {
  'СЛА': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Разовый': 'bg-orange-50 text-orange-700 border-orange-200',
  'Абонентский': 'bg-teal-50 text-teal-700 border-teal-200',
};

const paymentStatusColors: Record<PaymentScheduleItem['status'], string> = {
  'Оплачен': 'bg-green-100 text-green-700',
  'Ожидается': 'bg-blue-100 text-blue-700',
  'Просрочен': 'bg-red-100 text-red-700',
};

const fmt = (n: number) => n.toLocaleString('ru-RU');

const ContractsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<NewContractForm>({
    number: '',
    clientName: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    totalAmount: '',
    objectsCount: '',
    slaLevel: '',
  });

  const now = new Date();
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const activeContracts = mockContracts.filter(c => c.status === 'Активен');
  const expiringThisMonth = mockContracts.filter(c => {
    const end = new Date(c.endDate);
    return end <= thisMonthEnd && end >= now;
  });
  const totalRevenue = mockContracts.reduce((sum, c) => sum + c.paidAmount, 0);

  const filtered = mockContracts.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = c.clientName.toLowerCase().includes(q) || c.number.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleRowClick = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleSubmit = () => {
    setDialogOpen(false);
    setForm({ number: '', clientName: '', type: '', status: '', startDate: '', endDate: '', totalAmount: '', objectsCount: '', slaLevel: '' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Договоры</h2>
          <p className="text-gray-500 mt-1">Управление договорами с клиентами</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Icon name="Plus" size={16} />
          Создать договор
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Icon name="FileCheck2" size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Активных договоров</p>
              <p className="text-2xl font-bold text-gray-900">{activeContracts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Icon name="Clock" size={22} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Истекают в этом месяце</p>
              <p className="text-2xl font-bold text-gray-900">{expiringThisMonth.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Icon name="TrendingUp" size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(totalRevenue)} ₽</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по клиенту или номеру..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="Активен">Активен</SelectItem>
                <SelectItem value="На продлении">На продлении</SelectItem>
                <SelectItem value="Истёк">Истёк</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="СЛА">СЛА</SelectItem>
                <SelectItem value="Разовый">Разовый</SelectItem>
                <SelectItem value="Абонентский">Абонентский</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="pl-6">Номер / Клиент</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Период</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="text-right">Оплачено</TableHead>
                <TableHead className="text-center">Объектов</TableHead>
                <TableHead className="text-center w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(contract => (
                <>
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(contract.id)}
                  >
                    <TableCell className="pl-6">
                      <div className="font-medium text-gray-900">{contract.number}</div>
                      <div className="text-sm text-gray-500">{contract.clientName}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${typeColors[contract.type]}`}>
                        {contract.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[contract.status]}`}>
                        {contract.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${slaColors[contract.slaLevel]}`}>
                        {contract.slaLevel}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div>{contract.startDate}</div>
                      <div className="text-gray-400">→ {contract.endDate}</div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {fmt(contract.totalAmount)} ₽
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-600">
                      {fmt(contract.paidAmount)} ₽
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700">
                      {contract.objectsCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Icon
                        name={expandedId === contract.id ? 'ChevronUp' : 'ChevronDown'}
                        size={16}
                        className="text-gray-400"
                      />
                    </TableCell>
                  </TableRow>

                  {expandedId === contract.id && (
                    <TableRow key={`${contract.id}-detail`}>
                      <TableCell colSpan={9} className="bg-gray-50 px-6 pb-5 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                          {/* Objects */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Icon name="Building2" size={14} className="text-gray-500" />
                              Объекты обслуживания
                            </h4>
                            <div className="space-y-2">
                              {contract.objects.map((obj, i) => (
                                <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 text-sm">
                                  <div className="font-medium text-gray-800">{obj.name}</div>
                                  <div className="text-gray-500 mt-0.5">{obj.address}</div>
                                  <div className="text-blue-600 mt-0.5">{obj.equipment}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* SLA Terms */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Icon name="ShieldCheck" size={14} className="text-gray-500" />
                              Условия SLA
                            </h4>
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                              <ul className="space-y-1.5">
                                {contract.slaTerms.map((term, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <Icon name="Check" size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    {term}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Payment Schedule */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <Icon name="CreditCard" size={14} className="text-gray-500" />
                              График платежей
                            </h4>
                            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                              {contract.paymentSchedule.map((p, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                                  <span className="text-gray-600">{p.date}</span>
                                  <span className="font-medium text-gray-900">{fmt(p.amount)} ₽</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${paymentStatusColors[p.status]}`}>
                                    {p.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Icon name="FileX" size={36} className="mx-auto mb-2 opacity-40" />
              <p>Договоры не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">
        Показано: {filtered.length} из {mockContracts.length} договоров
      </p>

      {/* Create Contract Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать договор</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Номер договора</label>
              <Input
                placeholder="ДОГ-2024-XXX"
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Клиент</label>
              <Input
                placeholder="Название организации / ИП"
                value={form.clientName}
                onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Тип</label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as ContractType }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выбрать тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="СЛА">СЛА</SelectItem>
                  <SelectItem value="Разовый">Разовый</SelectItem>
                  <SelectItem value="Абонентский">Абонентский</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Уровень SLA</label>
              <Select value={form.slaLevel} onValueChange={v => setForm(f => ({ ...f, slaLevel: v as SLALevel }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выбрать уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Стандарт">Стандарт</SelectItem>
                  <SelectItem value="Приоритет">Приоритет</SelectItem>
                  <SelectItem value="Критичный">Критичный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Дата начала</label>
              <Input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Дата окончания</label>
              <Input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Сумма договора (₽)</label>
              <Input
                type="number"
                placeholder="0"
                value={form.totalAmount}
                onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Кол-во объектов</label>
              <Input
                type="number"
                placeholder="1"
                value={form.objectsCount}
                onChange={e => setForm(f => ({ ...f, objectsCount: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSubmit}>Создать договор</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractsList;
