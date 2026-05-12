import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface Contractor {
  id: string;
  name: string;
  type: 'ИП' | 'ООО';
  specialization: string;
  rating: number;
  activeOrders: number;
  completedOrders: number;
  phone: string;
  email: string;
  inn: string;
  contractStatus: 'Активен' | 'Нет договора';
  hourlyRate: number;
}

const mockContractors: Contractor[] = [
  {
    id: '1',
    name: 'ИП Козлов Дмитрий Александрович',
    type: 'ИП',
    specialization: 'Электрика',
    rating: 4.8,
    activeOrders: 3,
    completedOrders: 127,
    phone: '+7 (903) 123-45-67',
    email: 'kozlov.electro@mail.ru',
    inn: '772345678901',
    contractStatus: 'Активен',
    hourlyRate: 2500,
  },
  {
    id: '2',
    name: 'ООО «ВентПрофи»',
    type: 'ООО',
    specialization: 'Вентиляция',
    rating: 4.5,
    activeOrders: 5,
    completedOrders: 89,
    phone: '+7 (495) 234-56-78',
    email: 'info@ventprofi.ru',
    inn: '7701234567',
    contractStatus: 'Активен',
    hourlyRate: 3200,
  },
  {
    id: '3',
    name: 'ИП Петров Сергей Иванович',
    type: 'ИП',
    specialization: 'Сантехника',
    rating: 4.2,
    activeOrders: 1,
    completedOrders: 54,
    phone: '+7 (916) 345-67-89',
    email: 'petrov.santi@yandex.ru',
    inn: '503456789012',
    contractStatus: 'Активен',
    hourlyRate: 2000,
  },
  {
    id: '4',
    name: 'ООО «ХладоТехСервис»',
    type: 'ООО',
    specialization: 'Холодоснабжение',
    rating: 4.9,
    activeOrders: 7,
    completedOrders: 203,
    phone: '+7 (495) 456-78-90',
    email: 'support@hlado-tech.ru',
    inn: '7756789012',
    contractStatus: 'Активен',
    hourlyRate: 4500,
  },
  {
    id: '5',
    name: 'ИП Сидоров Алексей Николаевич',
    type: 'ИП',
    specialization: 'Электрика',
    rating: 3.7,
    activeOrders: 0,
    completedOrders: 31,
    phone: '+7 (926) 567-89-01',
    email: 'sidorov.al@gmail.com',
    inn: '772567890123',
    contractStatus: 'Нет договора',
    hourlyRate: 1800,
  },
  {
    id: '6',
    name: 'ООО «АэроКлимат»',
    type: 'ООО',
    specialization: 'Вентиляция',
    rating: 4.1,
    activeOrders: 2,
    completedOrders: 67,
    phone: '+7 (495) 678-90-12',
    email: 'aeroklim@mail.ru',
    inn: '7789012345',
    contractStatus: 'Нет договора',
    hourlyRate: 2800,
  },
  {
    id: '7',
    name: 'ИП Федоров Константин Павлович',
    type: 'ИП',
    specialization: 'Холодоснабжение',
    rating: 4.6,
    activeOrders: 4,
    completedOrders: 158,
    phone: '+7 (903) 789-01-23',
    email: 'fedorov.cold@yandex.ru',
    inn: '503789012345',
    contractStatus: 'Активен',
    hourlyRate: 3800,
  },
  {
    id: '8',
    name: 'ООО «СантехМонтаж»',
    type: 'ООО',
    specialization: 'Сантехника',
    rating: 3.9,
    activeOrders: 2,
    completedOrders: 44,
    phone: '+7 (495) 890-12-34',
    email: 'info@sante-montazh.ru',
    inn: '7790123456',
    contractStatus: 'Активен',
    hourlyRate: 2200,
  },
];

const workHistory = [
  { id: 'WO-2026-001234', date: '15.04.2026', type: 'Ремонт', address: 'ул. Ленина, 45', status: 'Завершён', amount: 12500 },
  { id: 'WO-2026-001189', date: '08.04.2026', type: 'Обслуживание', address: 'пр. Мира, 12', status: 'Завершён', amount: 8000 },
  { id: 'WO-2026-001102', date: '28.03.2026', type: 'Монтаж', address: 'ул. Садовая, 7', status: 'Завершён', amount: 35000 },
  { id: 'WO-2026-001087', date: '22.03.2026', type: 'Диагностика', address: 'ул. Тверская, 3', status: 'Завершён', amount: 4500 },
  { id: 'WO-2026-001045', date: '15.03.2026', type: 'Ремонт', address: 'Дмитровское ш., 89', status: 'Завершён', amount: 19800 },
];

const specializationColors: Record<string, string> = {
  'Электрика': 'bg-yellow-100 text-yellow-700',
  'Вентиляция': 'bg-blue-100 text-blue-700',
  'Сантехника': 'bg-cyan-100 text-cyan-700',
  'Холодоснабжение': 'bg-indigo-100 text-indigo-700',
};

const ContractorsList = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  const filtered = mockContractors.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.inn.includes(searchQuery);
    const matchSpec = specFilter === 'all' || c.specialization === specFilter;
    const matchStatus = statusFilter === 'all' || c.contractStatus === statusFilter;
    return matchSearch && matchSpec && matchStatus;
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Icon
          key={star}
          name="Star"
          size={14}
          className={star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Подрядчики и партнёры</h2>
          <p className="text-gray-500 mt-1">Справочник субподрядчиков и внешних специалистов</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить подрядчика
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по названию или ИНН..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={specFilter}
              onChange={e => setSpecFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все специализации</option>
              <option value="Электрика">Электрика</option>
              <option value="Вентиляция">Вентиляция</option>
              <option value="Сантехника">Сантехника</option>
              <option value="Холодоснабжение">Холодоснабжение</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все статусы</option>
              <option value="Активен">С договором</option>
              <option value="Нет договора">Без договора</option>
            </select>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon name="LayoutGrid" size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon name="List" size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-500">Найдено: {filtered.length}</span>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(contractor => (
            <Card
              key={contractor.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedContractor(contractor)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Wrench" size={20} className="text-blue-600" />
                  </div>
                  <Badge
                    className={contractor.contractStatus === 'Активен'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'}
                  >
                    {contractor.contractStatus === 'Активен' ? 'Договор' : 'Без договора'}
                  </Badge>
                </div>

                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                  {contractor.name}
                </h3>
                <span className="text-xs text-gray-400">{contractor.type} · ИНН {contractor.inn}</span>

                <div className="mt-3 space-y-2">
                  <Badge className={`text-xs ${specializationColors[contractor.specialization] || 'bg-gray-100 text-gray-700'}`}>
                    {contractor.specialization}
                  </Badge>
                  <div className="mt-1">{renderStars(contractor.rating)}</div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-orange-50 rounded-md p-2">
                    <div className="text-lg font-bold text-orange-600">{contractor.activeOrders}</div>
                    <div className="text-xs text-gray-500">Активных</div>
                  </div>
                  <div className="bg-green-50 rounded-md p-2">
                    <div className="text-lg font-bold text-green-600">{contractor.completedOrders}</div>
                    <div className="text-xs text-gray-500">Выполнено</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    {contractor.hourlyRate.toLocaleString('ru-RU')} ₽/ч
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={e => { e.stopPropagation(); }}
                    >
                      <Icon name="Phone" size={14} className="text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={e => { e.stopPropagation(); }}
                    >
                      <Icon name="Mail" size={14} className="text-gray-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Специализация</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Активных</TableHead>
                  <TableHead>Выполнено</TableHead>
                  <TableHead>Ставка</TableHead>
                  <TableHead>Договор</TableHead>
                  <TableHead>Контакты</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedContractor(c)}
                  >
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${specializationColors[c.specialization] || 'bg-gray-100'}`}>
                        {c.specialization}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderStars(c.rating)}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-orange-600">{c.activeOrders}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">{c.completedOrders}</span>
                    </TableCell>
                    <TableCell className="font-medium">{c.hourlyRate.toLocaleString('ru-RU')} ₽/ч</TableCell>
                    <TableCell>
                      <Badge className={c.contractStatus === 'Активен' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                        {c.contractStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={e => e.stopPropagation()}>
                          <Icon name="Phone" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={e => e.stopPropagation()}>
                          <Icon name="Mail" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedContractor} onOpenChange={() => setSelectedContractor(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedContractor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon name="Wrench" size={20} className="text-blue-600" />
                  </div>
                  {selectedContractor.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Тип организации</span>
                      <p className="font-medium">{selectedContractor.type}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">ИНН</span>
                      <p className="font-medium">{selectedContractor.inn}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Специализация</span>
                      <div className="mt-1">
                        <Badge className={specializationColors[selectedContractor.specialization] || ''}>
                          {selectedContractor.specialization}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Статус договора</span>
                      <div className="mt-1">
                        <Badge className={selectedContractor.contractStatus === 'Активен' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                          {selectedContractor.contractStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Телефон</span>
                      <p className="font-medium">{selectedContractor.phone}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Email</span>
                      <p className="font-medium">{selectedContractor.email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Почасовая ставка</span>
                      <p className="text-lg font-bold text-blue-600">{selectedContractor.hourlyRate.toLocaleString('ru-RU')} ₽/ч</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Рейтинг</span>
                      <div className="mt-1">{renderStars(selectedContractor.rating)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedContractor.activeOrders}</div>
                    <div className="text-sm text-gray-600">Активных заявок</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedContractor.completedOrders}</div>
                    <div className="text-sm text-gray-600">Выполнено всего</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {((selectedContractor.completedOrders / (selectedContractor.completedOrders + selectedContractor.activeOrders)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Завершаемость</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">История работ</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>№ Наряда</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Адрес</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Сумма</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workHistory.map(wh => (
                        <TableRow key={wh.id}>
                          <TableCell className="font-mono text-sm">{wh.id}</TableCell>
                          <TableCell>{wh.date}</TableCell>
                          <TableCell>{wh.type}</TableCell>
                          <TableCell>{wh.address}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700">{wh.status}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{wh.amount.toLocaleString('ru-RU')} ₽</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline">
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Icon name="FileText" size={16} className="mr-2" />
                    Создать заявку
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractorsList;
