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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Типы ─────────────────────────────────────────────────────────────────────

type Category = 'Хладагенты' | 'Фильтры' | 'Запчасти' | 'Расходники' | 'Инструменты';
type StockStatus = 'Норма' | 'Мало' | 'Критически' | 'Зарезервировано';
type WarehouseKey = 'all' | 'central' | 'petrov' | 'kozlov';
type ViewMode = 'table' | 'cards';

interface StockItem {
  id: string;
  name: string;
  category: Category;
  unit: string;
  qty: number;
  minQty: number;
  maxQty: number;
  reserved: number;
  purchasePrice: number;
  warehouse: WarehouseKey;
}

// ─── Моковые данные: 20 позиций ───────────────────────────────────────────────

const STOCK_ITEMS: StockItem[] = [
  { id: 'SKU-001', name: 'Фреон R-410A (баллон 10 кг)', category: 'Хладагенты', unit: 'баллон', qty: 12, minQty: 5, maxQty: 20, reserved: 3, purchasePrice: 4500, warehouse: 'central' },
  { id: 'SKU-002', name: 'Фреон R-32 (баллон 10 кг)', category: 'Хладагенты', unit: 'баллон', qty: 8, minQty: 4, maxQty: 16, reserved: 1, purchasePrice: 4200, warehouse: 'central' },
  { id: 'SKU-003', name: 'Фреон R-22 (баллон 13.6 кг)', category: 'Хладагенты', unit: 'баллон', qty: 2, minQty: 3, maxQty: 10, reserved: 0, purchasePrice: 3800, warehouse: 'central' },
  { id: 'SKU-004', name: 'Фреон R-407C (баллон 11.3 кг)', category: 'Хладагенты', unit: 'баллон', qty: 4, minQty: 2, maxQty: 8, reserved: 1, purchasePrice: 4100, warehouse: 'central' },
  { id: 'SKU-005', name: 'Фильтр-осушитель 1/4" (Alco)', category: 'Фильтры', unit: 'шт', qty: 48, minQty: 20, maxQty: 80, reserved: 4, purchasePrice: 120, warehouse: 'central' },
  { id: 'SKU-006', name: 'Фильтр-осушитель 3/8" (Alco)', category: 'Фильтры', unit: 'шт', qty: 32, minQty: 15, maxQty: 60, reserved: 2, purchasePrice: 145, warehouse: 'central' },
  { id: 'SKU-007', name: 'Фильтр сетчатый 1/2" (нерж.)', category: 'Фильтры', unit: 'шт', qty: 6, minQty: 10, maxQty: 30, reserved: 0, purchasePrice: 280, warehouse: 'central' },
  { id: 'SKU-008', name: 'Компрессор Mitsubishi FH-035', category: 'Запчасти', unit: 'шт', qty: 1, minQty: 1, maxQty: 3, reserved: 1, purchasePrice: 45000, warehouse: 'central' },
  { id: 'SKU-009', name: 'Компрессор Daikin 2YC45RXAD', category: 'Запчасти', unit: 'шт', qty: 0, minQty: 1, maxQty: 3, reserved: 0, purchasePrice: 52000, warehouse: 'central' },
  { id: 'SKU-010', name: 'Плата управления Daikin RZQS', category: 'Запчасти', unit: 'шт', qty: 2, minQty: 2, maxQty: 6, reserved: 1, purchasePrice: 18500, warehouse: 'central' },
  { id: 'SKU-011', name: 'Плата инвертора Mitsubishi PAR-31MAA', category: 'Запчасти', unit: 'шт', qty: 3, minQty: 2, maxQty: 6, reserved: 0, purchasePrice: 14200, warehouse: 'central' },
  { id: 'SKU-012', name: 'Теплообменник испарителя Haier AS18', category: 'Запчасти', unit: 'шт', qty: 1, minQty: 1, maxQty: 3, reserved: 0, purchasePrice: 9800, warehouse: 'central' },
  { id: 'SKU-013', name: 'Медная трубка 1/4" (м)', category: 'Расходники', unit: 'м', qty: 150, minQty: 50, maxQty: 300, reserved: 20, purchasePrice: 180, warehouse: 'central' },
  { id: 'SKU-014', name: 'Медная трубка 3/8" (м)', category: 'Расходники', unit: 'м', qty: 120, minQty: 50, maxQty: 250, reserved: 15, purchasePrice: 220, warehouse: 'central' },
  { id: 'SKU-015', name: 'Теплоизоляция K-Flex 13мм (м)', category: 'Расходники', unit: 'м', qty: 200, minQty: 100, maxQty: 400, reserved: 30, purchasePrice: 45, warehouse: 'petrov' },
  { id: 'SKU-016', name: 'Дренажная помпа Aspen Mini Orange', category: 'Расходники', unit: 'шт', qty: 5, minQty: 3, maxQty: 12, reserved: 2, purchasePrice: 3200, warehouse: 'central' },
  { id: 'SKU-017', name: 'Вентиль шаровый 1/4" (Refco)', category: 'Расходники', unit: 'шт', qty: 35, minQty: 15, maxQty: 60, reserved: 8, purchasePrice: 280, warehouse: 'petrov' },
  { id: 'SKU-018', name: 'Манометрический коллектор 4-вент.', category: 'Инструменты', unit: 'шт', qty: 4, minQty: 2, maxQty: 8, reserved: 0, purchasePrice: 12000, warehouse: 'central' },
  { id: 'SKU-019', name: 'Вакуумный насос Value V-i220SV', category: 'Инструменты', unit: 'шт', qty: 3, minQty: 2, maxQty: 6, reserved: 1, purchasePrice: 18500, warehouse: 'kozlov' },
  { id: 'SKU-020', name: 'Течеискатель электронный Inficon D-TEK', category: 'Инструменты', unit: 'шт', qty: 2, minQty: 2, maxQty: 5, reserved: 0, purchasePrice: 24000, warehouse: 'kozlov' },
];

// ─── Данные для аналитики ─────────────────────────────────────────────────────

const PIE_DATA = [
  { name: 'Хладагенты', value: 61200, color: '#3b82f6' },
  { name: 'Фильтры', value: 11960, color: '#06b6d4' },
  { name: 'Запчасти', value: 152600, color: '#8b5cf6' },
  { name: 'Расходники', value: 72750, color: '#10b981' },
  { name: 'Инструменты', value: 144500, color: '#f59e0b' },
];

const TURNOVER_DATA = [
  { month: 'Июн', value: 38 },
  { month: 'Июл', value: 52 },
  { month: 'Авг', value: 61 },
  { month: 'Сен', value: 47 },
  { month: 'Окт', value: 39 },
  { month: 'Ноя', value: 44 },
  { month: 'Дек', value: 53 },
  { month: 'Янв', value: 35 },
  { month: 'Фев', value: 36 },
  { month: 'Мар', value: 48 },
  { month: 'Апр', value: 55 },
  { month: 'Май', value: 63 },
];

const TOP_FAST_ITEMS = [
  { name: 'Фреон R-410A', turnover: 4.2 },
  { name: 'Фильтр-осуш. 1/4"', turnover: 3.8 },
  { name: 'Теплоизол. 13мм', turnover: 3.5 },
  { name: 'Медная тр. 1/4"', turnover: 3.2 },
  { name: 'Вентиль 1/4"', turnover: 2.9 },
  { name: 'Фреон R-32', turnover: 2.7 },
  { name: 'Дренаж. помпа', turnover: 2.4 },
  { name: 'Фильтр-осуш. 3/8"', turnover: 2.2 },
  { name: 'Медная тр. 3/8"', turnover: 2.1 },
  { name: 'Плата Mitsubishi', turnover: 1.8 },
];

// ─── Вспомогательные функции ──────────────────────────────────────────────────

const WAREHOUSE_LABELS: Record<WarehouseKey, string> = {
  all: 'Все склады',
  central: 'Центральный',
  petrov: 'Мобильный (Петров)',
  kozlov: 'Мобильный (Козлов)',
};

const CATEGORIES: Category[] = ['Хладагенты', 'Фильтры', 'Запчасти', 'Расходники', 'Инструменты'];
const STATUS_OPTIONS: StockStatus[] = ['Норма', 'Мало', 'Критически', 'Зарезервировано'];

function getItemStatus(item: StockItem): StockStatus {
  const free = item.qty - item.reserved;
  if (item.reserved > 0 && free <= item.minQty) return 'Зарезервировано';
  if (item.qty === 0 || item.qty < item.minQty) return 'Критически';
  if (item.qty < item.minQty * 1.5) return 'Мало';
  return 'Норма';
}

function statusBadgeClass(status: StockStatus): string {
  switch (status) {
    case 'Норма': return 'bg-green-100 text-green-700';
    case 'Мало': return 'bg-yellow-100 text-yellow-700';
    case 'Критически': return 'bg-red-100 text-red-700';
    case 'Зарезервировано': return 'bg-orange-100 text-orange-700';
  }
}

function statusDotClass(status: StockStatus): string {
  switch (status) {
    case 'Норма': return 'bg-green-500';
    case 'Мало': return 'bg-yellow-400';
    case 'Критически': return 'bg-red-500';
    case 'Зарезервировано': return 'bg-orange-400';
  }
}

function rowBgClass(status: StockStatus): string {
  if (status === 'Критически') return 'bg-red-50';
  if (status === 'Мало') return 'bg-yellow-50/50';
  return '';
}

function fmtPrice(val: number): string {
  return val.toLocaleString('ru-RU') + ' ₽';
}

// ─── Компонент ────────────────────────────────────────────────────────────────

const WarehouseFull = () => {
  const [warehouse, setWarehouse] = useState<WarehouseKey>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // ─── Вычисляемые метрики ────────────────────────────────────────────────────

  const totalItems = 347;
  const criticalCount = 12;
  const reservedCount = 48;
  const mobileWarehouses = 8;

  // ─── Фильтрация ─────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return STOCK_ITEMS.filter((item) => {
      const matchWarehouse = warehouse === 'all' || item.warehouse === warehouse;
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const status = getItemStatus(item);
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchWarehouse && matchSearch && matchCategory && matchStatus;
    });
  }, [warehouse, search, categoryFilter, statusFilter]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleMovement = (item: StockItem) => {
    toast.info(`Движение: ${item.name}`, { description: 'Откройте форму движения товара' });
  };

  const handleReserve = (item: StockItem) => {
    const free = item.qty - item.reserved;
    if (free <= 0) {
      toast.error('Нет свободного остатка для резервирования');
      return;
    }
    toast.success(`Зарезервировано: ${item.name}`, { description: `Свободно: ${free} ${item.unit}` });
  };

  const handleOrder = (item: StockItem) => {
    toast.info(`Заказ ЗИП: ${item.name}`, { description: 'Создаётся заявка на закупку...' });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-6 p-6 min-h-screen bg-gray-50">
      {/* Основная колонка */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Склад и остатки</h1>
            <p className="text-sm text-gray-500 mt-0.5">Управление материальными запасами и резервами</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info('Инвентаризация запущена')}>
              <Icon name="ClipboardList" size={15} className="mr-1.5" />
              Инвентаризация
            </Button>
            <Button size="sm" onClick={() => toast.success('Форма оприходования открыта')}>
              <Icon name="Plus" size={15} className="mr-1.5" />
              Оприходовать
            </Button>
          </div>
        </div>

        {/* Метрики-карточки */}
        <div className="grid grid-cols-5 gap-3">
          <MetricCard
            label="Позиций на складе"
            value={totalItems.toLocaleString('ru-RU')}
            icon="Package"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <MetricCard
            label="Общая стоимость"
            value="2.84 млн ₽"
            icon="CircleDollarSign"
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <MetricCard
            label="Критически мало"
            value={String(criticalCount)}
            icon="AlertTriangle"
            iconBg="bg-red-100"
            iconColor="text-red-600"
            valueClass="text-red-600"
          />
          <MetricCard
            label="Зарезервировано"
            value={`${reservedCount} поз.`}
            icon="Lock"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
          <MetricCard
            label="Мобильных складов"
            value={String(mobileWarehouses)}
            icon="Truck"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Переключатель складов */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'central', 'petrov', 'kozlov'] as WarehouseKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setWarehouse(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                warehouse === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {key !== 'central' && key !== 'all' && (
                <span className="inline-block w-2 h-2 rounded-full bg-current mr-1.5 align-middle opacity-70" />
              )}
              {WAREHOUSE_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Фильтры и вид */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск по наименованию / артикулу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">Все категории</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">Все статусы</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Переключатель вида */}
          <div className="flex border border-gray-200 rounded-md overflow-hidden bg-white ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon name="TableProperties" size={15} />
              Таблица
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon name="LayoutGrid" size={15} />
              Карточки
            </button>
          </div>
        </div>

        {/* Счётчик результатов */}
        <div className="text-sm text-gray-500">
          Показано <span className="font-semibold text-gray-800">{filtered.length}</span> позиций
          {filtered.length !== STOCK_ITEMS.length && ` из ${STOCK_ITEMS.length}`}
        </div>

        {/* Контент: таблица или карточки */}
        {viewMode === 'table' ? (
          <StockTable items={filtered} onMovement={handleMovement} onReserve={handleReserve} onOrder={handleOrder} />
        ) : (
          <StockCards items={filtered} onMovement={handleMovement} onReserve={handleReserve} onOrder={handleOrder} />
        )}
      </div>

      {/* Боковая панель аналитики */}
      <div className="w-72 shrink-0 flex flex-col gap-5">
        <SidebarPieChart />
        <SidebarLineChart />
        <SidebarTopItems />
      </div>
    </div>
  );
};

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  valueClass?: string;
}

const MetricCard = ({ label, value, icon, iconBg, iconColor, valueClass }: MetricCardProps) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
    <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
      <Icon name={icon} size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 leading-tight truncate">{label}</p>
      <p className={`text-xl font-bold leading-tight mt-0.5 ${valueClass ?? 'text-gray-900'}`}>{value}</p>
    </div>
  </div>
);

// ─── Таблица остатков ─────────────────────────────────────────────────────────

interface TableProps {
  items: StockItem[];
  onMovement: (item: StockItem) => void;
  onReserve: (item: StockItem) => void;
  onOrder: (item: StockItem) => void;
}

const StockTable = ({ items, onMovement, onReserve, onOrder }: TableProps) => {
  const totalValue = items.reduce((s, i) => s + i.qty * i.purchasePrice, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Артикул</th>
              <th className="px-4 py-3 font-medium">Наименование</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium text-center">Ед.</th>
              <th className="px-4 py-3 font-medium text-right">На складе</th>
              <th className="px-4 py-3 font-medium text-right">Мин.</th>
              <th className="px-4 py-3 font-medium text-right">Макс.</th>
              <th className="px-4 py-3 font-medium text-right">Резерв</th>
              <th className="px-4 py-3 font-medium text-right">Свободно</th>
              <th className="px-4 py-3 font-medium text-right">Цена закуп.</th>
              <th className="px-4 py-3 font-medium text-right">Стоимость</th>
              <th className="px-4 py-3 font-medium text-center">Статус</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const status = getItemStatus(item);
              const free = item.qty - item.reserved;
              return (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${rowBgClass(status)}`}>
                  <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{item.id}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-gray-900 leading-tight">{item.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{item.category}</td>
                  <td className="px-4 py-2.5 text-center text-gray-500">{item.unit}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{item.qty}</td>
                  <td className="px-4 py-2.5 text-right text-gray-400">{item.minQty}</td>
                  <td className="px-4 py-2.5 text-right text-gray-400">{item.maxQty}</td>
                  <td className="px-4 py-2.5 text-right text-orange-600">{item.reserved}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${free <= 0 ? 'text-red-600' : free <= item.minQty ? 'text-yellow-600' : 'text-green-600'}`}>
                    {free}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmtPrice(item.purchasePrice)}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{fmtPrice(item.qty * item.purchasePrice)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusDotClass(status)}`} />
                      <Badge className={`text-xs py-0 ${statusBadgeClass(status)}`}>{status}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => onMovement(item)}
                        title="Движение"
                        className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Icon name="ArrowLeftRight" size={13} />
                      </button>
                      <button
                        onClick={() => onReserve(item)}
                        title="Зарезервировать"
                        className="p-1.5 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-colors"
                      >
                        <Icon name="Lock" size={13} />
                      </button>
                      <button
                        onClick={() => onOrder(item)}
                        title="Заказать"
                        className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <Icon name="ShoppingCart" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50 font-semibold">
              <td colSpan={10} className="px-4 py-3 text-right text-gray-600">Итого по фильтру:</td>
              <td className="px-4 py-3 text-right text-gray-900">{fmtPrice(totalValue)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ─── Карточный вид ────────────────────────────────────────────────────────────

const StockCards = ({ items, onMovement, onReserve, onOrder }: TableProps) => (
  <div className="grid grid-cols-4 gap-4">
    {items.map((item) => {
      const status = getItemStatus(item);
      const free = item.qty - item.reserved;
      const fillPct = Math.min(100, Math.round((item.qty / item.maxQty) * 100));
      const minPct = Math.round((item.minQty / item.maxQty) * 100);
      return (
        <div
          key={item.id}
          className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3 transition-shadow hover:shadow-md ${
            status === 'Критически' ? 'border-red-200' : status === 'Мало' ? 'border-yellow-200' : 'border-gray-100'
          }`}
        >
          {/* Заголовок карточки */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-mono">{item.id}</p>
              <p className="text-sm font-semibold text-gray-900 leading-snug mt-0.5 line-clamp-2">{item.name}</p>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${statusDotClass(status)}`} />
          </div>

          {/* Категория */}
          <Badge className="text-xs w-fit bg-gray-100 text-gray-600">{item.category}</Badge>

          {/* Количество */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">На складе</span>
            <span className={`font-bold ${status === 'Критически' ? 'text-red-600' : 'text-gray-900'}`}>
              {item.qty} {item.unit}
            </span>
          </div>

          {/* Прогресс-бар мин-макс */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Мин: {item.minQty}</span>
              <span>Макс: {item.maxQty}</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              {/* Маркер минимума */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
                style={{ left: `${minPct}%` }}
              />
              {/* Заполнение */}
              <div
                className={`h-full rounded-full transition-all ${
                  fillPct <= minPct
                    ? 'bg-red-500'
                    : fillPct <= minPct * 1.5
                    ? 'bg-yellow-400'
                    : 'bg-green-500'
                }`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {/* Резерв / Свободно */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Резерв: <span className="text-orange-600 font-medium">{item.reserved}</span></span>
            <span>Свободно: <span className={`font-medium ${free <= 0 ? 'text-red-600' : 'text-green-600'}`}>{free}</span></span>
          </div>

          {/* Статус */}
          <Badge className={`text-xs w-fit ${statusBadgeClass(status)}`}>{status}</Badge>

          {/* Кнопки */}
          <div className="flex gap-1 mt-auto pt-1 border-t">
            <button
              onClick={() => onMovement(item)}
              className="flex-1 py-1.5 text-xs rounded bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition-colors flex items-center justify-center gap-1"
            >
              <Icon name="ArrowLeftRight" size={12} />
              Движение
            </button>
            <button
              onClick={() => onReserve(item)}
              className="flex-1 py-1.5 text-xs rounded bg-gray-50 hover:bg-orange-50 hover:text-orange-600 text-gray-500 transition-colors flex items-center justify-center gap-1"
            >
              <Icon name="Lock" size={12} />
              Резерв
            </button>
            <button
              onClick={() => onOrder(item)}
              className="flex-1 py-1.5 text-xs rounded bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-500 transition-colors flex items-center justify-center gap-1"
            >
              <Icon name="ShoppingCart" size={12} />
              Заказ
            </button>
          </div>
        </div>
      );
    })}
    {items.length === 0 && (
      <div className="col-span-4 py-16 text-center text-gray-400">
        <Icon name="PackageSearch" size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">Позиции не найдены</p>
      </div>
    )}
  </div>
);

// ─── Боковые виджеты ──────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const SidebarPieChart = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
      <Icon name="PieChart" size={15} className="text-blue-500" />
      Распределение по категориям
    </h3>
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={PIE_DATA}
          cx="50%"
          cy="50%"
          outerRadius={75}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {PIE_DATA.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val: number) => [fmtPrice(val), 'Стоимость']}
          contentStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
    <div className="space-y-1.5 mt-2">
      {PIE_DATA.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}</span>
          </div>
          <span className="font-medium text-gray-800">{(entry.value / 1000).toFixed(0)}K ₽</span>
        </div>
      ))}
    </div>
  </div>
);

const SidebarLineChart = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
      <Icon name="TrendingUp" size={15} className="text-green-500" />
      Оборачиваемость (12 мес.)
    </h3>
    <p className="text-xs text-gray-400 mb-3">Кол-во оборотов в месяц</p>
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={TURNOVER_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={2} />
        <YAxis tick={{ fontSize: 9 }} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="Обороты"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const SidebarTopItems = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
      <Icon name="Zap" size={15} className="text-yellow-500" />
      Топ-10 быстрооборачиваемых
    </h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={TOP_FAST_ITEMS}
        layout="vertical"
        margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 5]} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 9 }}
          width={90}
        />
        <Tooltip
          formatter={(val: number) => [`${val} об./мес.`, 'Оборачиваемость']}
          contentStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="turnover" fill="#3b82f6" radius={[0, 3, 3, 0]} name="Оборачиваемость" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default WarehouseFull;
