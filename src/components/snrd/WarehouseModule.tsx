import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const stockItems = [
  { id: 'SKU-001', name: 'Фреон R-410A (баллон 10 кг)', category: 'Хладагент', unit: 'баллон', qty: 12, reserved: 3, warehouse: 'Центральный', minQty: 5, price: 4500 },
  { id: 'SKU-002', name: 'Фреон R-32 (баллон 10 кг)', category: 'Хладагент', unit: 'баллон', qty: 8, reserved: 1, warehouse: 'Центральный', minQty: 4, price: 4200 },
  { id: 'SKU-003', name: 'Медная трубка 1/4" (м)', category: 'Трубки', unit: 'м', qty: 150, reserved: 20, warehouse: 'Центральный', minQty: 50, price: 180 },
  { id: 'SKU-004', name: 'Медная трубка 3/8" (м)', category: 'Трубки', unit: 'м', qty: 120, reserved: 15, warehouse: 'Центральный', minQty: 50, price: 220 },
  { id: 'SKU-005', name: 'Теплоизоляция 13мм (м)', category: 'Изоляция', unit: 'м', qty: 200, reserved: 30, warehouse: 'Центральный', minQty: 100, price: 45 },
  { id: 'SKU-006', name: 'Дренажная помпа Aspen Mini', category: 'Дренаж', unit: 'шт', qty: 6, reserved: 2, warehouse: 'Центральный', minQty: 3, price: 3200 },
  { id: 'SKU-007', name: 'Пульт ДУ универсальный', category: 'Запчасти', unit: 'шт', qty: 15, reserved: 0, warehouse: 'Мобильный А', minQty: 5, price: 850 },
  { id: 'SKU-008', name: 'Плата управления Daikin RZQS', category: 'Запчасти', unit: 'шт', qty: 2, reserved: 1, warehouse: 'Центральный', minQty: 2, price: 18500 },
  { id: 'SKU-009', name: 'Компрессор Mitsubishi FH-035', category: 'Запчасти', unit: 'шт', qty: 1, reserved: 0, warehouse: 'Центральный', minQty: 1, price: 45000 },
  { id: 'SKU-010', name: 'Фильтр-осушитель 1/4"', category: 'Расходники', unit: 'шт', qty: 50, reserved: 5, warehouse: 'Центральный', minQty: 20, price: 120 },
  { id: 'SKU-011', name: 'Вентиль шаровый 1/4"', category: 'Арматура', unit: 'шт', qty: 35, reserved: 8, warehouse: 'Мобильный А', minQty: 15, price: 280 },
  { id: 'SKU-012', name: 'Манометрический коллектор', category: 'Инструмент', unit: 'шт', qty: 4, reserved: 0, warehouse: 'Центральный', minQty: 2, price: 12000 },
];

const movements = [
  { id: 'MOV-001', date: '12.05.2026 09:15', type: 'Поступление', item: 'Фреон R-410A (баллон 10 кг)', qty: 5, from: 'Поставщик ООО «ХладТех»', to: 'Центральный', engineer: 'Система', orderId: null, cost: 22500 },
  { id: 'MOV-002', date: '12.05.2026 10:30', type: 'Списание', item: 'Медная трубка 1/4" (м)', qty: 8, from: 'Центральный', to: 'Наряд WO-2026-000045', engineer: 'Петров А.В.', orderId: 'WO-2026-000045', cost: 1440 },
  { id: 'MOV-003', date: '11.05.2026 14:20', type: 'Перемещение', item: 'Пульт ДУ универсальный', qty: 3, from: 'Центральный', to: 'Мобильный А', engineer: 'Сидоров К.Н.', orderId: null, cost: 2550 },
  { id: 'MOV-004', date: '11.05.2026 11:00', type: 'Списание', item: 'Фреон R-32 (баллон 10 кг)', qty: 2, from: 'Центральный', to: 'Наряд WO-2026-000043', engineer: 'Иванов М.С.', orderId: 'WO-2026-000043', cost: 8400 },
  { id: 'MOV-005', date: '10.05.2026 16:45', type: 'Поступление', item: 'Фильтр-осушитель 1/4"', qty: 30, from: 'Поставщик ООО «АвтоМаг»', to: 'Центральный', engineer: 'Система', orderId: null, cost: 3600 },
  { id: 'MOV-006', date: '10.05.2026 09:00', type: 'Возврат', item: 'Дренажная помпа Aspen Mini', qty: 1, from: 'Наряд WO-2026-000040', to: 'Центральный', engineer: 'Козлов Д.А.', orderId: 'WO-2026-000040', cost: 3200 },
  { id: 'MOV-007', date: '09.05.2026 13:30', type: 'Инвентаризация', item: 'Теплоизоляция 13мм (м)', qty: -5, from: 'Центральный', to: 'Списано (недостача)', engineer: 'Миронова Е.В.', orderId: null, cost: 225 },
];

const cylinders = [
  { id: 'CYL-001', type: 'R-410A', serial: 'BA-2024-0451', capacity: 10.0, remaining: 7.3, supplier: 'ХладТех', received: '15.03.2026', status: 'Активен' },
  { id: 'CYL-002', type: 'R-410A', serial: 'BA-2024-0452', capacity: 10.0, remaining: 10.0, supplier: 'ХладТех', received: '10.05.2026', status: 'Активен' },
  { id: 'CYL-003', type: 'R-32', serial: 'RC-2025-1102', capacity: 10.0, remaining: 4.8, supplier: 'ФреоноСнаб', received: '20.02.2026', status: 'Активен' },
  { id: 'CYL-004', type: 'R-32', serial: 'RC-2025-1103', capacity: 10.0, remaining: 10.0, supplier: 'ФреоноСнаб', received: '05.05.2026', status: 'Активен' },
  { id: 'CYL-005', type: 'R-22', serial: 'LG-2023-0890', capacity: 13.6, remaining: 0.4, supplier: 'ХладТех', received: '10.01.2025', status: 'К замене' },
  { id: 'CYL-006', type: 'R-407C', serial: 'MX-2024-3310', capacity: 11.3, remaining: 11.3, supplier: 'ГазРесурс', received: '01.04.2026', status: 'Активен' },
];

const refrigerantLog = [
  { id: 'RL-001', date: '12.05.2026', type: 'Заправка', refrigerant: 'R-410A', qty: 1.2, cylinder: 'BA-2024-0451', engineer: 'Петров А.В.', orderId: 'WO-2026-000045', equipment: 'Daikin FTXS50K, ул. Ленина 12' },
  { id: 'RL-002', date: '11.05.2026', type: 'Дозаправка', refrigerant: 'R-32', qty: 0.8, cylinder: 'RC-2025-1102', engineer: 'Иванов М.С.', orderId: 'WO-2026-000043', equipment: 'Mitsubishi MSZ-LN35VGR, офис Альфа' },
  { id: 'RL-003', date: '10.05.2026', type: 'Заправка', refrigerant: 'R-410A', qty: 2.5, cylinder: 'BA-2024-0451', engineer: 'Сидоров К.Н.', orderId: 'WO-2026-000041', equipment: 'Samsung AR12TXEAAWKN, ТЦ Меркурий' },
  { id: 'RL-004', date: '09.05.2026', type: 'Рекуперация', refrigerant: 'R-22', qty: 0.4, cylinder: 'LG-2023-0890', engineer: 'Козлов Д.А.', orderId: 'WO-2026-000039', equipment: 'Старый блок LG, демонтаж' },
  { id: 'RL-005', date: '08.05.2026', type: 'Заправка', refrigerant: 'R-410A', qty: 1.8, cylinder: 'BA-2024-0451', engineer: 'Петров А.В.', orderId: 'WO-2026-000037', equipment: 'Haier AS18NS4ERA, ресторан' },
];

const movTypeColor: Record<string, string> = {
  'Поступление': 'bg-green-100 text-green-700',
  'Списание': 'bg-red-100 text-red-700',
  'Перемещение': 'bg-blue-100 text-blue-700',
  'Возврат': 'bg-orange-100 text-orange-700',
  'Инвентаризация': 'bg-purple-100 text-purple-700',
};

const refTypeColor: Record<string, string> = {
  'Заправка': 'bg-blue-100 text-blue-700',
  'Дозаправка': 'bg-cyan-100 text-cyan-700',
  'Рекуперация': 'bg-orange-100 text-orange-700',
  'Замена': 'bg-purple-100 text-purple-700',
};

const WarehouseModule = () => {
  const [search, setSearch] = useState('');
  const [movSearch, setMovSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(stockItems.map(i => i.category)))];
  const filtered = stockItems.filter(i =>
    (catFilter === 'all' || i.category === catFilter) &&
    (i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredMov = movements.filter(m =>
    m.item.toLowerCase().includes(movSearch.toLowerCase()) || m.type.toLowerCase().includes(movSearch.toLowerCase())
  );

  const totalValue = stockItems.reduce((s, i) => s + i.qty * i.price, 0);
  const lowStock = stockItems.filter(i => i.qty - i.reserved <= i.minQty).length;

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Позиций на складе</p>
                <p className="text-2xl font-bold">{stockItems.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="Package" size={20} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Стоимость склада</p>
                <p className="text-2xl font-bold">{(totalValue / 1000).toFixed(0)}K ₽</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="CircleDollarSign" size={20} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Баллонов хладагента</p>
                <p className="text-2xl font-bold">{cylinders.length}</p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Icon name="Wind" size={20} className="text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Критический запас</p>
                <p className="text-2xl font-bold text-red-600">{lowStock}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock">
        <TabsList className="mb-4">
          <TabsTrigger value="stock">Остатки</TabsTrigger>
          <TabsTrigger value="movements">Движение товаров</TabsTrigger>
          <TabsTrigger value="refrigerants">Хладагенты</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Складские остатки</CardTitle>
                <div className="flex gap-2">
                  <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
                  <select
                    value={catFilter}
                    onChange={e => setCatFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Все категории' : c}</option>)}
                  </select>
                  <Button size="sm">
                    <Icon name="Plus" size={16} className="mr-1" />
                    Оприходовать
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 font-medium">Артикул</th>
                      <th className="pb-3 font-medium">Наименование</th>
                      <th className="pb-3 font-medium">Категория</th>
                      <th className="pb-3 font-medium text-right">Кол-во</th>
                      <th className="pb-3 font-medium text-right">Резерв</th>
                      <th className="pb-3 font-medium text-right">Доступно</th>
                      <th className="pb-3 font-medium">Склад</th>
                      <th className="pb-3 font-medium text-right">Цена</th>
                      <th className="pb-3 font-medium text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map(item => {
                      const available = item.qty - item.reserved;
                      const isLow = available <= item.minQty;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-3 text-gray-500">{item.id}</td>
                          <td className="py-3 font-medium">
                            <div className="flex items-center gap-2">
                              {item.name}
                              {isLow && <Badge className="bg-red-100 text-red-700 text-xs">Мало</Badge>}
                            </div>
                          </td>
                          <td className="py-3 text-gray-600">{item.category}</td>
                          <td className="py-3 text-right">{item.qty} {item.unit}</td>
                          <td className="py-3 text-right text-orange-600">{item.reserved}</td>
                          <td className={`py-3 text-right font-medium ${isLow ? 'text-red-600' : 'text-green-600'}`}>{available}</td>
                          <td className="py-3 text-gray-600">{item.warehouse}</td>
                          <td className="py-3 text-right">{item.price.toLocaleString()} ₽</td>
                          <td className="py-3 text-right font-medium">{(item.qty * item.price).toLocaleString()} ₽</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-semibold bg-gray-50">
                      <td colSpan={8} className="py-3 text-right pr-4">Итого:</td>
                      <td className="py-3 text-right">{totalValue.toLocaleString()} ₽</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Движение товаров</CardTitle>
                <div className="flex gap-2">
                  <Input placeholder="Поиск..." value={movSearch} onChange={e => setMovSearch(e.target.value)} className="w-48" />
                  <Button size="sm">
                    <Icon name="Plus" size={16} className="mr-1" />
                    Новое движение
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Дата</th>
                    <th className="pb-3 font-medium">Тип</th>
                    <th className="pb-3 font-medium">Номенклатура</th>
                    <th className="pb-3 font-medium text-right">Кол-во</th>
                    <th className="pb-3 font-medium">Откуда</th>
                    <th className="pb-3 font-medium">Куда</th>
                    <th className="pb-3 font-medium">Сотрудник</th>
                    <th className="pb-3 font-medium text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMov.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-500">{m.date}</td>
                      <td className="py-3">
                        <Badge className={movTypeColor[m.type] || 'bg-gray-100 text-gray-700'}>{m.type}</Badge>
                      </td>
                      <td className="py-3 font-medium">{m.item}</td>
                      <td className={`py-3 text-right font-medium ${m.qty < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {m.qty > 0 ? '+' : ''}{m.qty}
                      </td>
                      <td className="py-3 text-gray-600 max-w-[150px] truncate">{m.from}</td>
                      <td className="py-3 text-gray-600 max-w-[150px] truncate">{m.to}</td>
                      <td className="py-3 text-gray-600">{m.engineer}</td>
                      <td className="py-3 text-right">{m.cost.toLocaleString()} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refrigerants">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Баллоны хладагента</CardTitle>
                  <Button size="sm">
                    <Icon name="Plus" size={16} className="mr-1" />
                    Добавить баллон
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Тип</th>
                      <th className="pb-3 font-medium">Серийный №</th>
                      <th className="pb-3 font-medium text-right">Остаток</th>
                      <th className="pb-3 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cylinders.map(c => {
                      const pct = (c.remaining / c.capacity) * 100;
                      return (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="py-2 text-gray-500">{c.id}</td>
                          <td className="py-2 font-medium">{c.type}</td>
                          <td className="py-2 text-gray-600">{c.serial}</td>
                          <td className="py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${pct < 20 ? 'bg-red-500' : pct < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs">{c.remaining}/{c.capacity} кг</span>
                            </div>
                          </td>
                          <td className="py-2">
                            <Badge className={c.status === 'Активен' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Журнал операций с хладагентами</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 font-medium">Дата</th>
                      <th className="pb-3 font-medium">Операция</th>
                      <th className="pb-3 font-medium">Хладагент</th>
                      <th className="pb-3 font-medium text-right">кг</th>
                      <th className="pb-3 font-medium">Инженер</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {refrigerantLog.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-2 text-gray-500">{r.date}</td>
                        <td className="py-2">
                          <Badge className={refTypeColor[r.type] || 'bg-gray-100 text-gray-700'}>{r.type}</Badge>
                        </td>
                        <td className="py-2 font-medium">{r.refrigerant}</td>
                        <td className="py-2 text-right font-medium">{r.qty}</td>
                        <td className="py-2 text-gray-600">{r.engineer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800 text-sm">
                    <Icon name="AlertTriangle" size={14} />
                    <span className="font-medium">Внимание:</span>
                    <span>1 единица оборудования превышает норму утечки (32% &gt; 30%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarehouseModule;
