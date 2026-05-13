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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

type ActStatus = 'Черновик' | 'На подписании' | 'Подписан' | 'Отправлен в 1С';

interface ActService {
  name: string;
  unit: string;
  qty: number;
  priceEach: number;
}

interface CompletionAct {
  id: string;
  number: string;
  workOrderNumber: string;
  clientName: string;
  date: string;
  services: ActService[];
  totalAmount: number;
  status: ActStatus;
}

const mockActs: CompletionAct[] = [
  {
    id: '1',
    number: 'АКТ-2024-0041',
    workOrderNumber: 'WO-2024-000041',
    clientName: 'ООО "МегаМолл"',
    date: '2024-10-14',
    services: [
      { name: 'Техническое обслуживание кондиционеров', unit: 'шт', qty: 4, priceEach: 8500 },
      { name: 'Замена фильтров', unit: 'компл', qty: 4, priceEach: 1200 },
      { name: 'Чистка теплообменника', unit: 'шт', qty: 2, priceEach: 3500 },
    ],
    totalAmount: 48400,
    status: 'Отправлен в 1С',
  },
  {
    id: '2',
    number: 'АКТ-2024-0042',
    workOrderNumber: 'WO-2024-000043',
    clientName: 'АО "ПромСтрой"',
    date: '2024-10-15',
    services: [
      { name: 'Ремонт компрессора Daikin', unit: 'шт', qty: 1, priceEach: 28000 },
      { name: 'Замена компрессора (запчасть)', unit: 'шт', qty: 1, priceEach: 45000 },
      { name: 'Дозаправка хладагентом R-410A', unit: 'кг', qty: 0.8, priceEach: 1800 },
    ],
    totalAmount: 74440,
    status: 'Подписан',
  },
  {
    id: '3',
    number: 'АКТ-2024-0043',
    workOrderNumber: 'WO-2024-000047',
    clientName: 'ООО "ТехноСервис"',
    date: '2024-10-16',
    services: [
      { name: 'Плановое ТО системы кондиционирования', unit: 'система', qty: 1, priceEach: 15000 },
      { name: 'Промывка дренажной системы', unit: 'шт', qty: 3, priceEach: 800 },
    ],
    totalAmount: 17400,
    status: 'На подписании',
  },
  {
    id: '4',
    number: 'АКТ-2024-0044',
    workOrderNumber: 'WO-2024-000049',
    clientName: 'ЗАО "РосТех"',
    date: '2024-10-17',
    services: [
      { name: 'Диагностика системы прецизионного охлаждения', unit: 'час', qty: 3, priceEach: 4500 },
      { name: 'Устранение утечки хладагента', unit: 'шт', qty: 1, priceEach: 12000 },
      { name: 'Заправка хладагентом R-32', unit: 'кг', qty: 1.2, priceEach: 2200 },
      { name: 'Выезд инженера', unit: 'шт', qty: 1, priceEach: 1500 },
    ],
    totalAmount: 29140,
    status: 'Черновик',
  },
  {
    id: '5',
    number: 'АКТ-2024-0045',
    workOrderNumber: 'WO-2024-000052',
    clientName: 'ООО "НоваФарм"',
    date: '2024-10-18',
    services: [
      { name: 'Экстренный выезд — аварийная ситуация', unit: 'шт', qty: 1, priceEach: 5000 },
      { name: 'Ремонт платы управления Mitsubishi', unit: 'шт', qty: 1, priceEach: 22000 },
      { name: 'Запасная часть (плата PCB)', unit: 'шт', qty: 1, priceEach: 18000 },
    ],
    totalAmount: 45000,
    status: 'Подписан',
  },
  {
    id: '6',
    number: 'АКТ-2024-0046',
    workOrderNumber: 'WO-2024-000055',
    clientName: 'ООО "Альфа-Центр"',
    date: '2024-10-20',
    services: [
      { name: 'Монтаж кондиционеров LG 9кВт', unit: 'шт', qty: 3, priceEach: 8000 },
      { name: 'Прокладка трасс', unit: 'п.м', qty: 12, priceEach: 650 },
      { name: 'Пусконаладочные работы', unit: 'комплект', qty: 3, priceEach: 2500 },
    ],
    totalAmount: 39300,
    status: 'Отправлен в 1С',
  },
  {
    id: '7',
    number: 'АКТ-2024-0047',
    workOrderNumber: 'WO-2024-000058',
    clientName: 'ООО "МегаМолл"',
    date: '2024-10-21',
    services: [
      { name: 'ТО сплит-систем кинотеатра', unit: 'шт', qty: 6, priceEach: 4500 },
      { name: 'Очистка фанкойлов', unit: 'шт', qty: 12, priceEach: 1200 },
    ],
    totalAmount: 41400,
    status: 'На подписании',
  },
  {
    id: '8',
    number: 'АКТ-2024-0048',
    workOrderNumber: 'WO-2024-000061',
    clientName: 'ПАО "СтройИнвест"',
    date: '2024-10-22',
    services: [
      { name: 'Ревизия всей системы кондиционирования', unit: 'час', qty: 8, priceEach: 4500 },
      { name: 'Замена запорной арматуры', unit: 'шт', qty: 4, priceEach: 3200 },
    ],
    totalAmount: 48800,
    status: 'Черновик',
  },
  {
    id: '9',
    number: 'АКТ-2024-0049',
    workOrderNumber: 'WO-2024-000064',
    clientName: 'ИП Смирнов А.П.',
    date: '2024-10-23',
    services: [
      { name: 'Сезонное ТО кондиционеров (осень)', unit: 'шт', qty: 3, priceEach: 3500 },
    ],
    totalAmount: 10500,
    status: 'Подписан',
  },
  {
    id: '10',
    number: 'АКТ-2024-0050',
    workOrderNumber: 'WO-2024-000067',
    clientName: 'ООО "ТехноСервис"',
    date: '2024-10-25',
    services: [
      { name: 'Замена вентилятора наружного блока', unit: 'шт', qty: 1, priceEach: 9500 },
      { name: 'Запасная часть (вентилятор)', unit: 'шт', qty: 1, priceEach: 7800 },
      { name: 'Дозаправка хладагентом R-410A', unit: 'кг', qty: 0.5, priceEach: 1800 },
      { name: 'Выезд инженера', unit: 'шт', qty: 1, priceEach: 1500 },
    ],
    totalAmount: 20700,
    status: 'Черновик',
  },
];

const statusOrder: ActStatus[] = ['Черновик', 'На подписании', 'Подписан', 'Отправлен в 1С'];

const statusColors: Record<ActStatus, string> = {
  'Черновик': 'bg-gray-100 text-gray-600 border-gray-200',
  'На подписании': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Подписан': 'bg-green-100 text-green-700 border-green-200',
  'Отправлен в 1С': 'bg-blue-100 text-blue-700 border-blue-200',
};

const fmt = (n: number) => n.toLocaleString('ru-RU');

type SortField = 'date' | 'totalAmount' | 'number';
type SortDir = 'asc' | 'desc';

const CompletionActs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const clients = Array.from(new Set(mockActs.map(a => a.clientName))).sort();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Icon name="ChevronsUpDown" size={14} className="text-gray-300 ml-1" />;
    return <Icon name={sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-blue-500 ml-1" />;
  };

  const filtered = mockActs
    .filter(a => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        a.number.toLowerCase().includes(q) ||
        a.workOrderNumber.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchClient = clientFilter === 'all' || a.clientName === clientFilter;
      const matchDateFrom = !dateFrom || a.date >= dateFrom;
      const matchDateTo = !dateTo || a.date <= dateTo;
      return matchSearch && matchStatus && matchClient && matchDateFrom && matchDateTo;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortField === 'totalAmount') cmp = a.totalAmount - b.totalAmount;
      else if (sortField === 'number') cmp = a.number.localeCompare(b.number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalSum = filtered.reduce((s, a) => s + a.totalAmount, 0);

  const getNextStatus = (status: ActStatus): ActStatus | null => {
    const idx = statusOrder.indexOf(status);
    return idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;
  };

  const statsCount = (s: ActStatus) => mockActs.filter(a => a.status === s).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Акты выполненных работ</h2>
          <p className="text-gray-500 mt-1">Управление актами и их статусами</p>
        </div>
        <Button className="gap-2">
          <Icon name="FilePlus2" size={16} />
          Сформировать акт
        </Button>
      </div>

      {/* Status flow */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statusOrder.map((s, i) => (
          <Card key={s}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${
                s === 'Черновик' ? 'bg-gray-400' :
                s === 'На подписании' ? 'bg-yellow-400' :
                s === 'Подписан' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <div>
                <p className="text-xs text-gray-500">Шаг {i + 1}</p>
                <p className="text-sm font-semibold text-gray-800">{s}</p>
                <p className="text-lg font-bold text-gray-900">{statsCount(s)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по номеру или клиенту..."
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
                {statusOrder.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Клиент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все клиенты</SelectItem>
                {clients.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-36 text-sm"
              />
              <span className="text-gray-400 text-sm">—</span>
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-36 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="pl-6">
                  <button
                    className="flex items-center font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => handleSort('number')}
                  >
                    Номер акта
                    <SortIcon field="number" />
                  </button>
                </TableHead>
                <TableHead>Наряд</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>
                  <button
                    className="flex items-center font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => handleSort('date')}
                  >
                    Дата
                    <SortIcon field="date" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    className="flex items-center font-medium text-gray-600 hover:text-gray-900 ml-auto"
                    onClick={() => handleSort('totalAmount')}
                  >
                    Сумма
                    <SortIcon field="totalAmount" />
                  </button>
                </TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(act => {
                const nextStatus = getNextStatus(act.status);
                return (
                  <>
                    <TableRow
                      key={act.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpandedId(prev => prev === act.id ? null : act.id)}
                    >
                      <TableCell className="pl-6 font-medium text-gray-900">{act.number}</TableCell>
                      <TableCell className="text-sm text-blue-600">{act.workOrderNumber}</TableCell>
                      <TableCell className="text-sm text-gray-700">{act.clientName}</TableCell>
                      <TableCell className="text-sm text-gray-600">{act.date}</TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">
                        {fmt(act.totalAmount)} ₽
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[act.status]}`}>
                          {act.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {nextStatus && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={e => { e.stopPropagation(); }}
                          >
                            <Icon name="ArrowRight" size={12} className="mr-1" />
                            {nextStatus}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Icon
                          name={expandedId === act.id ? 'ChevronUp' : 'ChevronDown'}
                          size={16}
                          className="text-gray-400"
                        />
                      </TableCell>
                    </TableRow>

                    {expandedId === act.id && (
                      <TableRow key={`${act.id}-detail`}>
                        <TableCell colSpan={8} className="bg-gray-50 px-6 py-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                            <Icon name="ListChecks" size={14} className="text-gray-500" />
                            Перечень услуг и работ
                          </h4>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="text-left px-4 py-2 text-gray-600 font-medium">Наименование</th>
                                  <th className="text-center px-4 py-2 text-gray-600 font-medium">Ед.</th>
                                  <th className="text-center px-4 py-2 text-gray-600 font-medium">Кол-во</th>
                                  <th className="text-right px-4 py-2 text-gray-600 font-medium">Цена</th>
                                  <th className="text-right px-4 py-2 text-gray-600 font-medium">Итого</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {act.services.map((svc, i) => (
                                  <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-gray-800">{svc.name}</td>
                                    <td className="px-4 py-2 text-center text-gray-500">{svc.unit}</td>
                                    <td className="px-4 py-2 text-center text-gray-700">{svc.qty}</td>
                                    <td className="px-4 py-2 text-right text-gray-700">{fmt(svc.priceEach)} ₽</td>
                                    <td className="px-4 py-2 text-right font-semibold text-gray-900">
                                      {fmt(svc.qty * svc.priceEach)} ₽
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                  <td colSpan={4} className="px-4 py-2 text-right font-semibold text-gray-700">
                                    Итого по акту:
                                  </td>
                                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                                    {fmt(act.totalAmount)} ₽
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Icon name="FileX" size={36} className="mx-auto mb-2 opacity-40" />
              <p>Акты не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer totals */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Показано: {filtered.length} из {mockActs.length} актов
        </p>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-2 flex items-center gap-3">
          <span className="text-sm text-gray-600">Сумма по выбранным:</span>
          <span className="text-lg font-bold text-gray-900">{fmt(totalSum)} ₽</span>
        </div>
      </div>
    </div>
  );
};

export default CompletionActs;
