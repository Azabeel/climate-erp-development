import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AlertItem {
  id: string;
  priority: 'critical' | 'warning';
  name: string;
  article: string;
  current: number;
  min: number;
  unit: string;
  deficit: number;
  relatedOrders: number;
  supplier: string;
  daysToOrder: number;
  category: string;
  ignored?: boolean;
}

interface RelatedOrder {
  id: string;
  number: string;
  plannedDate: string;
  engineer: string;
  status: string;
  statusColor: string;
}

interface StockDayPoint {
  day: string;
  stock: number;
}

interface CategorySetting {
  id: string;
  name: string;
  minStock: number;
  autoOrder: boolean;
}

// ─────────────────────────────────────────────
// Mock data — 20 HVAC positions
// ─────────────────────────────────────────────

const INITIAL_ALERTS: AlertItem[] = [
  { id: 'a1',  priority: 'critical', name: 'Хладагент R-410A (13.6 кг)',          article: 'R410A-13',       current: 1,  min: 3,  unit: 'бал.', deficit: 2,  relatedOrders: 4, supplier: 'ХладоСнаб',       daysToOrder: 0, category: 'Хладагенты' },
  { id: 'a2',  priority: 'critical', name: 'Компрессор Daikin JT160BCBY1L',        article: 'COMP-DAI-35',    current: 0,  min: 1,  unit: 'шт.',  deficit: 1,  relatedOrders: 2, supplier: 'Daikin RUS',       daysToOrder: 0, category: 'Компрессоры' },
  { id: 'a3',  priority: 'critical', name: 'Компрессор Mitsubishi SH170A4AL',      article: 'COMP-MIT-170',   current: 0,  min: 1,  unit: 'шт.',  deficit: 1,  relatedOrders: 1, supplier: 'МТС-Климат',       daysToOrder: 0, category: 'Компрессоры' },
  { id: 'a4',  priority: 'critical', name: 'Плата управления Midea MDV-D36T1',     article: 'PCB-MDV-D36',    current: 0,  min: 2,  unit: 'шт.',  deficit: 2,  relatedOrders: 3, supplier: 'Midea Rus',        daysToOrder: 0, category: 'Электроника' },
  { id: 'a5',  priority: 'critical', name: 'Хладагент R-32 (12 кг)',               article: 'R32-12',         current: 1,  min: 4,  unit: 'бал.', deficit: 3,  relatedOrders: 5, supplier: 'ХладоСнаб',       daysToOrder: 1, category: 'Хладагенты' },
  { id: 'a6',  priority: 'critical', name: 'Датчик давления высокой стороны',      article: 'SEN-HP-16BAR',   current: 2,  min: 5,  unit: 'шт.',  deficit: 3,  relatedOrders: 2, supplier: 'ТехноКлимат',     daysToOrder: 1, category: 'Датчики' },
  { id: 'a7',  priority: 'critical', name: 'Фильтр-осушитель DCL-085S',            article: 'FLT-DCL-085',    current: 3,  min: 10, unit: 'шт.',  deficit: 7,  relatedOrders: 6, supplier: 'Danfoss',          daysToOrder: 2, category: 'Фильтры' },
  { id: 'a8',  priority: 'critical', name: 'Вентилятор внешнего блока 380В',       article: 'FAN-OUT-380',    current: 0,  min: 2,  unit: 'шт.',  deficit: 2,  relatedOrders: 1, supplier: 'АэроКлимат',      daysToOrder: 0, category: 'Вентиляция' },
  { id: 'a9',  priority: 'warning',  name: 'Фильтр G4 500×500×20',                article: 'FILTR-G4-500',   current: 8,  min: 20, unit: 'шт.',  deficit: 12, relatedOrders: 7, supplier: 'Клима-Фильтр',    daysToOrder: 3, category: 'Фильтры' },
  { id: 'a10', priority: 'warning',  name: 'Ремень приводной B48',                 article: 'BELT-B48',       current: 3,  min: 10, unit: 'шт.',  deficit: 7,  relatedOrders: 2, supplier: 'ПриводТех',       daysToOrder: 4, category: 'Приводы' },
  { id: 'a11', priority: 'warning',  name: 'Датчик температуры NTC 10k',           article: 'SEN-TEMP-10K',   current: 5,  min: 15, unit: 'шт.',  deficit: 10, relatedOrders: 3, supplier: 'ТехноКлимат',     daysToOrder: 5, category: 'Датчики' },
  { id: 'a12', priority: 'warning',  name: 'Конденсатор пусковой 30 мкФ',         article: 'CAP-RUN-30UF',   current: 4,  min: 8,  unit: 'шт.',  deficit: 4,  relatedOrders: 2, supplier: 'ЭлектроСнаб',     daysToOrder: 3, category: 'Электроника' },
  { id: 'a13', priority: 'warning',  name: 'Трубка капиллярная ø1.4 (бухта 50м)', article: 'TUBE-CAP-14',    current: 2,  min: 5,  unit: 'бух.', deficit: 3,  relatedOrders: 1, supplier: 'МеталлКлимат',    daysToOrder: 4, category: 'Трубопровод' },
  { id: 'a14', priority: 'warning',  name: 'Плата управления Haier AC-5611',       article: 'PCB-HAI-5611',   current: 1,  min: 3,  unit: 'шт.',  deficit: 2,  relatedOrders: 1, supplier: 'Haier RUS',        daysToOrder: 5, category: 'Электроника' },
  { id: 'a15', priority: 'warning',  name: 'Хладагент R-22 (13.6 кг)',             article: 'R22-13',         current: 2,  min: 5,  unit: 'бал.', deficit: 3,  relatedOrders: 2, supplier: 'ХладоСнаб',       daysToOrder: 6, category: 'Хладагенты' },
  { id: 'a16', priority: 'warning',  name: 'Расширительный клапан TXV R410',       article: 'TXV-R410-7',     current: 3,  min: 6,  unit: 'шт.',  deficit: 3,  relatedOrders: 2, supplier: 'Danfoss',          daysToOrder: 4, category: 'Арматура' },
  { id: 'a17', priority: 'warning',  name: 'Масло компрессорное POE 68 (1 л)',     article: 'OIL-POE68-1L',   current: 7,  min: 12, unit: 'фл.',  deficit: 5,  relatedOrders: 0, supplier: 'ЛубриКлимат',     daysToOrder: 7, category: 'Масла' },
  { id: 'a18', priority: 'warning',  name: 'Контактор 3P 25А 230В',               article: 'CONT-3P-25A',    current: 5,  min: 10, unit: 'шт.',  deficit: 5,  relatedOrders: 1, supplier: 'ЭлектроСнаб',     daysToOrder: 5, category: 'Электрика' },
  { id: 'a19', priority: 'warning',  name: 'Пресс-фитинг ø28 мм (т-образный)',    article: 'FIT-28T',        current: 6,  min: 15, unit: 'шт.',  deficit: 9,  relatedOrders: 3, supplier: 'МеталлКлимат',    daysToOrder: 3, category: 'Трубопровод' },
  { id: 'a20', priority: 'warning',  name: 'Инверторный модуль IPM 30А',           article: 'IPM-30A-INV',    current: 1,  min: 3,  unit: 'шт.',  deficit: 2,  relatedOrders: 2, supplier: 'Mitsubishi Parts', daysToOrder: 2, category: 'Электроника' },
];

const RELATED_ORDERS_MAP: Record<string, RelatedOrder[]> = {
  a1: [
    { id: 'o1', number: 'WO-2026-000412', plannedDate: '17.05.2026', engineer: 'Козлов А.', status: 'Назначен',    statusColor: 'blue' },
    { id: 'o2', number: 'WO-2026-000415', plannedDate: '18.05.2026', engineer: 'Петров С.', status: 'Новый',       statusColor: 'gray' },
    { id: 'o3', number: 'WO-2026-000417', plannedDate: '19.05.2026', engineer: 'Иванов Д.', status: 'В пути',      statusColor: 'indigo' },
    { id: 'o4', number: 'WO-2026-000420', plannedDate: '20.05.2026', engineer: 'Сидоров Н.','status': 'Новый',     statusColor: 'gray' },
  ],
  a2: [
    { id: 'o5', number: 'WO-2026-000409', plannedDate: '17.05.2026', engineer: 'Козлов А.', status: 'В работе',    statusColor: 'orange' },
    { id: 'o6', number: 'WO-2026-000422', plannedDate: '21.05.2026', engineer: 'Петров С.', status: 'Новый',       statusColor: 'gray' },
  ],
};

// Stock dynamics — 30 days for selected item (generated generically)
function generateStockHistory(currentStock: number, _minStock: number): StockDayPoint[] {
  const points: StockDayPoint[] = [];
  let stock = currentStock + Math.round(Math.random() * 10 + 8);
  const today = new Date(2026, 4, 16); // 16 May 2026
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const label = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (i < 29 && Math.random() > 0.6) {
      stock = Math.max(0, stock - Math.round(Math.random() * 3 + 1));
    }
    points.push({ day: label, stock });
  }
  return points;
}

const INITIAL_CATEGORY_SETTINGS: CategorySetting[] = [
  { id: 'c1', name: 'Хладагенты',  minStock: 4,  autoOrder: true  },
  { id: 'c2', name: 'Компрессоры', minStock: 1,  autoOrder: false },
  { id: 'c3', name: 'Фильтры',     minStock: 20, autoOrder: true  },
  { id: 'c4', name: 'Электроника', minStock: 3,  autoOrder: false },
  { id: 'c5', name: 'Датчики',     minStock: 10, autoOrder: true  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const STATUS_COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700',
  gray:   'bg-gray-100 text-gray-600',
  indigo: 'bg-indigo-100 text-indigo-700',
  orange: 'bg-orange-100 text-orange-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const StockAlertsFull = () => {
  const [alerts, setAlerts]               = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [filter, setFilter]               = useState<'all' | 'critical' | 'warning'>('all');
  const [search, setSearch]               = useState('');
  const [categorySettings, setCategorySettings] = useState<CategorySetting[]>(INITIAL_CATEGORY_SETTINGS);

  // Derived
  const visible = alerts.filter(a => !a.ignored);
  const criticalCount  = visible.filter(a => a.priority === 'critical').length;
  const warningCount   = visible.filter(a => a.priority === 'warning').length;
  const onOrderCount   = 5; // static metric
  const orderRiskCount = 3; // static metric

  const filtered = visible.filter(a => {
    const matchesPriority = filter === 'all' || a.priority === filter;
    const matchesSearch   = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.article.toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesSearch;
  }).sort((a, b) => (a.priority === 'critical' ? -1 : 1) - (b.priority === 'critical' ? -1 : 1));

  const activeAlert = activeAlertId ? alerts.find(a => a.id === activeAlertId) ?? null : null;
  const relatedOrders = activeAlertId ? (RELATED_ORDERS_MAP[activeAlertId] ?? []) : [];
  const stockHistory  = activeAlert ? generateStockHistory(activeAlert.current, activeAlert.min) : [];

  // ── Handlers ──

  const handleOrder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Заявка на закупку создана');
    setAlerts(prev => prev.map(a => a.id === id ? { ...a } : a));
  };

  const handleIgnore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ignored: true } : a));
    if (activeAlertId === id) setActiveAlertId(null);
    toast.info('Алерт скрыт');
  };

  const handleBulkOrder = () => {
    toast.success(`Созданы заявки на закупку: ${selected.size} позиц.`);
    setSelected(new Set());
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelected(checked ? new Set(filtered.map(a => a.id)) : new Set());
  };

  const handleCategoryMinChange = (id: string, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    setCategorySettings(prev => prev.map(c => c.id === id ? { ...c, minStock: num } : c));
  };

  const handleAutoOrderToggle = (id: string) => {
    setCategorySettings(prev => prev.map(c => c.id === id ? { ...c, autoOrder: !c.autoOrder } : c));
  };

  const handleSaveSettings = () => {
    toast.success('Настройки алертов сохранены');
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* ── Main column ── */}
      <div className={`flex-1 p-6 overflow-y-auto transition-all ${activeAlert ? 'mr-[360px]' : ''}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Icon name="BellRing" size={20} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Алерты остатков склада</h1>
              <p className="text-sm text-gray-500">Контроль минимальных запасов · HVAC ERP «Сервис Климат»</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info('Остатки пересчитаны')}>
            <Icon name="RefreshCw" size={14} className="mr-2" /> Обновить
          </Button>
        </div>

        {/* ── 4 metric cards ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Критических алертов"
            value={criticalCount}
            icon="ShieldAlert"
            color="red"
          />
          <MetricCard
            label="Предупреждений"
            value={warningCount}
            icon="AlertTriangle"
            color="yellow"
          />
          <MetricCard
            label="Позиций под заказом"
            value={onOrderCount}
            icon="ShoppingCart"
            color="blue"
          />
          <MetricCard
            label="Угроза срыва нарядов"
            value={orderRiskCount}
            icon="Wrench"
            color="orange"
          />
        </div>

        {/* ── Filter + search + bulk ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск по наименованию или артикулу…"
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'critical', 'warning'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? 'Все' : f === 'critical' ? '🔴 Критичные' : '🟡 Предупреждения'}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <Button size="sm" onClick={handleBulkOrder} className="ml-auto">
              <Icon name="ShoppingCart" size={14} className="mr-2" />
              Создать заказы на выбранные ({selected.size})
            </Button>
          )}
        </div>

        {/* ── Alerts table ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={e => toggleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-3 py-3 w-8 text-left text-gray-500 font-medium">!</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Наименование / Артикул</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-medium">Остаток</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-medium">Мин.</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-medium">Дефицит</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-medium">Нарядов</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-medium">Поставщик</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-medium">Дней до заказа</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setActiveAlertId(prev => prev === item.id ? null : item.id)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50/40 ${
                      activeAlertId === item.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' :
                      item.priority === 'critical' ? 'bg-red-50/30' : 'bg-yellow-50/20'
                    }`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selected.has(item.id)}
                        onChange={() => {}}
                        onClick={e => toggleSelect(item.id, e)}
                      />
                    </td>
                    <td className="px-3 py-3 text-base leading-none">
                      {item.priority === 'critical' ? '🔴' : '🟡'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 leading-snug">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.article}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`font-bold text-base ${item.priority === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {item.current}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {item.min} <span className="text-xs">{item.unit}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant="destructive" className="text-xs font-semibold">
                        -{item.deficit}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {item.relatedOrders > 0 ? (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                          {item.relatedOrders}
                        </Badge>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{item.supplier}</td>
                    <td className="px-3 py-3 text-center">
                      {item.daysToOrder === 0 ? (
                        <Badge variant="destructive" className="text-xs">Сегодня</Badge>
                      ) : (
                        <span className="text-sm text-gray-600">{item.daysToOrder} д.</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant={item.priority === 'critical' ? 'default' : 'outline'}
                          className="h-7 text-xs px-2"
                          onClick={e => handleOrder(item.id, e)}
                        >
                          <Icon name="ShoppingCart" size={12} className="mr-1" />
                          Создать заказ
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 text-gray-400 hover:text-red-500"
                          onClick={e => handleIgnore(item.id, e)}
                        >
                          <Icon name="X" size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Icon name="PackageCheck" size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Нет позиций, соответствующих фильтру</p>
            </div>
          )}
        </div>

        {/* ── Settings panel ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="Settings" size={16} className="text-gray-500" />
              Настройки алертов по категориям
            </h2>
            <Button size="sm" onClick={handleSaveSettings}>
              <Icon name="Save" size={14} className="mr-1.5" />
              Сохранить
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Категория</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">Мин. остаток</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">Авто-заказ при падении ниже минимума</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categorySettings.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-3 font-medium text-gray-800">{cat.name}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Input
                        type="number"
                        min={0}
                        value={cat.minStock}
                        onChange={e => handleCategoryMinChange(cat.id, e.target.value)}
                        className="w-20 h-8 text-center text-sm mx-auto"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <div
                          onClick={() => handleAutoOrderToggle(cat.id)}
                          className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${cat.autoOrder ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${cat.autoOrder ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                        <span className={`text-xs font-medium ${cat.autoOrder ? 'text-blue-700' : 'text-gray-400'}`}>
                          {cat.autoOrder ? 'Включён' : 'Выключен'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Side panel ── */}
      {activeAlert && (
        <aside className="fixed right-0 top-0 h-full w-[360px] bg-white border-l border-gray-200 shadow-xl flex flex-col z-10">
          {/* Side header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Детали позиции</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{activeAlert.name}</p>
              <p className="text-xs text-gray-400">{activeAlert.article}</p>
            </div>
            <button onClick={() => setActiveAlertId(null)} className="text-gray-400 hover:text-gray-700 ml-2 shrink-0">
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Stock summary */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-red-50 rounded-lg py-2 px-1">
                  <p className={`text-2xl font-bold ${activeAlert.priority === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {activeAlert.current}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Остаток</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2 px-1">
                  <p className="text-2xl font-bold text-gray-700">{activeAlert.min}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Минимум</p>
                </div>
                <div className="bg-orange-50 rounded-lg py-2 px-1">
                  <p className="text-2xl font-bold text-orange-600">-{activeAlert.deficit}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Дефицит</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Icon name="Truck" size={13} className="text-gray-400" />
                <span>Поставщик: <span className="text-gray-700 font-medium">{activeAlert.supplier}</span></span>
              </div>
            </div>

            {/* Stock dynamics chart */}
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Динамика остатков (30 дней)
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={stockHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9 }}
                    interval={6}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e5e7eb' }}
                    formatter={(v: number) => [v, 'Остаток']}
                  />
                  <ReferenceLine y={activeAlert.min} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'Мин', position: 'right', fontSize: 9, fill: '#ef4444' }} />
                  <ReferenceLine y={activeAlert.min * 3} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'Макс', position: 'right', fontSize: 9, fill: '#22c55e' }} />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Related orders */}
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Icon name="ClipboardList" size={13} className="text-gray-400" />
                Связанные наряды ({relatedOrders.length})
              </p>
              {relatedOrders.length > 0 ? (
                <div className="space-y-2">
                  {relatedOrders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-medium text-blue-700">{order.number}</span>
                        <Badge className={`text-xs ${STATUS_COLOR_MAP[order.statusColor] ?? 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={11} className="text-gray-400" />
                          {order.plannedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="User" size={11} className="text-gray-400" />
                          {order.engineer}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <Icon name="ClipboardX" size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Нет связанных нарядов</p>
                </div>
              )}
            </div>
          </div>

          {/* Side footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
            <Button
              className="flex-1"
              size="sm"
              onClick={e => handleOrder(activeAlert.id, e as React.MouseEvent)}
            >
              <Icon name="ShoppingCart" size={14} className="mr-1.5" />
              Создать заказ
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-500"
              onClick={e => handleIgnore(activeAlert.id, e as React.MouseEvent)}
            >
              <Icon name="EyeOff" size={14} className="mr-1" />
              Скрыть
            </Button>
          </div>
        </aside>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MetricCard sub-component
// ─────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
  color: 'red' | 'yellow' | 'blue' | 'orange';
}

const COLOR_MAP: Record<MetricCardProps['color'], { bg: string; border: string; iconBg: string; iconText: string; value: string; label: string }> = {
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    iconBg: 'bg-red-100',    iconText: 'text-red-600',    value: 'text-red-700',    label: 'text-red-600'    },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100', iconText: 'text-yellow-600', value: 'text-yellow-700', label: 'text-yellow-600' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   iconBg: 'bg-blue-100',   iconText: 'text-blue-600',   value: 'text-blue-700',   label: 'text-blue-600'   },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100', iconText: 'text-orange-600', value: 'text-orange-700', label: 'text-orange-600' },
};

const MetricCard = ({ label, value, icon, color }: MetricCardProps) => {
  const c = COLOR_MAP[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
        <Icon name={icon} size={20} className={c.iconText} />
      </div>
      <div className="min-w-0">
        <p className={`text-3xl font-bold leading-none ${c.value}`}>{value}</p>
        <p className={`text-xs mt-1 leading-tight ${c.label}`}>{label}</p>
      </div>
    </div>
  );
};

export default StockAlertsFull;
