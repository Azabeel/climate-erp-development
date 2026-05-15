import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type WarrantyStatus = 'active' | 'expiring' | 'expired' | 'cancelled';

interface WarrantyItem {
  id: string;
  brand: string;
  model: string;
  category: string; // Сплит-система / VRF / Чиллер / Фанкойл
  serialNumber: string;
  client: string;
  installDate: string;
  warrantyYears: number;
  warrantyEnd: string;
  status: WarrantyStatus;
  daysLeft: number;
  contractId: string;
}

interface WarrantyEvent {
  date: string;
  type: 'install' | 'claim' | 'repair' | 'close' | 'extend';
  description: string;
  engineer?: string;
  orderNumber?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const WARRANTY_ITEMS: WarrantyItem[] = [
  {
    id: 'w01', brand: 'Daikin', model: 'FTXB35C', category: 'Сплит-система',
    serialNumber: 'DK-2025-11-001A', client: 'ООО «Альфа Технолоджис»',
    installDate: '15.11.2024', warrantyYears: 3, warrantyEnd: '15.11.2027',
    status: 'active', daysLeft: 549, contractId: 'CTR-2024-089',
  },
  {
    id: 'w02', brand: 'Mitsubishi Electric', model: 'PURY-P200YSKM-A (VRF)', category: 'VRF',
    serialNumber: 'ME-VRF-2024-0031', client: 'ТЦ «Мираж»',
    installDate: '10.03.2024', warrantyYears: 5, warrantyEnd: '10.03.2029',
    status: 'active', daysLeft: 1030, contractId: 'CTR-2024-041',
  },
  {
    id: 'w03', brand: 'LG', model: 'S09EQ ARTCOOL', category: 'Сплит-система',
    serialNumber: 'LG-2025-04-0017', client: 'Иванов Петр Сергеевич',
    installDate: '02.04.2025', warrantyYears: 1, warrantyEnd: '02.04.2026',
    status: 'expiring', daysLeft: 22, contractId: 'CTR-2025-104',
  },
  {
    id: 'w04', brand: 'Haier', model: 'AS18TT4HRA', category: 'Сплит-система',
    serialNumber: 'HR-2025-02-0092', client: 'ИП Смирнов К.А.',
    installDate: '14.02.2025', warrantyYears: 1, warrantyEnd: '14.02.2026',
    status: 'expiring', daysLeft: 5, contractId: 'CTR-2025-067',
  },
  {
    id: 'w05', brand: 'Daikin', model: 'RZQSG71L3V1 (VRF)', category: 'VRF',
    serialNumber: 'DK-VRF-2024-0008', client: 'Бизнес-центр «Горизонт»',
    installDate: '18.07.2024', warrantyYears: 3, warrantyEnd: '18.07.2027',
    status: 'active', daysLeft: 429, contractId: 'CTR-2024-072',
  },
  {
    id: 'w06', brand: 'Carrier', model: '30XA-0402 Чиллер', category: 'Чиллер',
    serialNumber: 'CR-CH-2023-0002', client: 'Завод «Металлург»',
    installDate: '22.09.2023', warrantyYears: 2, warrantyEnd: '22.09.2025',
    status: 'expired', daysLeft: -236, contractId: 'CTR-2023-055',
  },
  {
    id: 'w07', brand: 'Mitsubishi Electric', model: 'PLA-SP60BA (Фанкойл)', category: 'Фанкойл',
    serialNumber: 'ME-FC-2025-0144', client: 'Гостиница «Север» (24 ед.)',
    installDate: '05.01.2025', warrantyYears: 2, warrantyEnd: '05.01.2027',
    status: 'active', daysLeft: 601, contractId: 'CTR-2025-008',
  },
  {
    id: 'w08', brand: 'LG', model: 'ARUN080GSS4 (VRF)', category: 'VRF',
    serialNumber: 'LG-VRF-2024-0020', client: 'ООО «Строй Ресурс»',
    installDate: '11.06.2024', warrantyYears: 3, warrantyEnd: '11.06.2027',
    status: 'active', daysLeft: 392, contractId: 'CTR-2024-065',
  },
  {
    id: 'w09', brand: 'Haier', model: 'AD242MSEHA (VRF)', category: 'VRF',
    serialNumber: 'HR-VRF-2023-0011', client: 'Торговый дом «Восток»',
    installDate: '30.10.2023', warrantyYears: 2, warrantyEnd: '30.10.2025',
    status: 'cancelled', daysLeft: -197, contractId: 'CTR-2023-098',
  },
  {
    id: 'w10', brand: 'Daikin', model: 'FHQ71B (Кассетный)', category: 'Фанкойл',
    serialNumber: 'DK-FC-2025-0033', client: 'Кафе «Прованс»',
    installDate: '20.03.2025', warrantyYears: 2, warrantyEnd: '20.03.2027',
    status: 'active', daysLeft: 674, contractId: 'CTR-2025-091',
  },
  {
    id: 'w11', brand: 'Mitsubishi Electric', model: 'PKFY-P50VKM-E', category: 'Фанкойл',
    serialNumber: 'ME-FC-2025-0201', client: 'Офис «ТехПром»',
    installDate: '10.04.2025', warrantyYears: 2, warrantyEnd: '10.04.2027',
    status: 'expiring', daysLeft: 28, contractId: 'CTR-2025-112',
  },
  {
    id: 'w12', brand: 'Carrier', model: 'XCE+ 42GQC Фанкойл', category: 'Фанкойл',
    serialNumber: 'CR-FC-2024-0076', client: 'Клиника «Медпрофи»',
    installDate: '17.08.2024', warrantyYears: 2, warrantyEnd: '17.08.2026',
    status: 'active', daysLeft: 459, contractId: 'CTR-2024-083',
  },
];

const WARRANTY_HISTORY: Record<string, WarrantyEvent[]> = {
  w01: [
    { date: '15.11.2024', type: 'install', description: 'Монтаж и первый запуск оборудования', engineer: 'Коваль А.В.', orderNumber: 'WO-2024-000187' },
    { date: '20.01.2025', type: 'claim', description: 'Обращение: течь конденсата с внутреннего блока', engineer: 'Петров С.Н.', orderNumber: 'WO-2025-000023' },
    { date: '22.01.2025', type: 'repair', description: 'Прочистка дренажной системы, регулировка уклона', engineer: 'Петров С.Н.', orderNumber: 'WO-2025-000023' },
    { date: '22.01.2025', type: 'close', description: 'Гарантийный случай закрыт', engineer: 'Петров С.Н.' },
  ],
  w03: [
    { date: '02.04.2025', type: 'install', description: 'Монтаж сплит-системы в квартире', engineer: 'Кравцов Д.Е.', orderNumber: 'WO-2025-000341' },
    { date: '14.04.2026', type: 'extend', description: 'Продление гарантии на +1 год по запросу клиента' },
  ],
  w06: [
    { date: '22.09.2023', type: 'install', description: 'Ввод чиллера в эксплуатацию', engineer: 'Захаров М.И.', orderNumber: 'WO-2023-000512' },
    { date: '05.03.2024', type: 'claim', description: 'Неисправность компрессора №2', engineer: 'Захаров М.И.', orderNumber: 'WO-2024-000089' },
    { date: '12.03.2024', type: 'repair', description: 'Замена компрессора (гарантийная)', engineer: 'Захаров М.И.', orderNumber: 'WO-2024-000089' },
    { date: '22.09.2025', type: 'close', description: 'Срок гарантии истёк' },
  ],
};

const DEFAULT_HISTORY: WarrantyEvent[] = [
  { date: '—', type: 'install', description: 'Монтаж и запуск оборудования', engineer: 'Не указан' },
];

// ─── Chart data ───────────────────────────────────────────────────────────────

const MONTHLY_CLAIMS = [
  { month: 'Июн\'25', claims: 3 },
  { month: 'Июл\'25', claims: 5 },
  { month: 'Авг\'25', claims: 4 },
  { month: 'Сен\'25', claims: 6 },
  { month: 'Окт\'25', claims: 8 },
  { month: 'Ноя\'25', claims: 5 },
  { month: 'Дек\'25', claims: 7 },
  { month: 'Янв\'26', claims: 4 },
  { month: 'Фев\'26', claims: 6 },
  { month: 'Мар\'26', claims: 9 },
  { month: 'Апр\'26', claims: 11 },
  { month: 'Май\'26', claims: 7 },
];

const BRAND_DISTRIBUTION = [
  { name: 'Daikin', value: 31 },
  { name: 'Mitsubishi', value: 27 },
  { name: 'LG', value: 18 },
  { name: 'Haier', value: 13 },
  { name: 'Другие', value: 11 },
];

const WARRANTY_RATIO = [
  { month: 'Июн\'25', total: 58, warranty: 3, pct: 5.2 },
  { month: 'Июл\'25', total: 72, warranty: 5, pct: 6.9 },
  { month: 'Авг\'25', total: 65, warranty: 4, pct: 6.2 },
  { month: 'Сен\'25', total: 81, warranty: 6, pct: 7.4 },
  { month: 'Окт\'25', total: 94, warranty: 8, pct: 8.5 },
  { month: 'Ноя\'25', total: 88, warranty: 5, pct: 5.7 },
  { month: 'Дек\'25', total: 102, warranty: 7, pct: 6.9 },
  { month: 'Янв\'26', total: 61, warranty: 4, pct: 6.6 },
  { month: 'Фев\'26', total: 75, warranty: 6, pct: 8.0 },
  { month: 'Мар\'26', total: 98, warranty: 9, pct: 9.2 },
  { month: 'Апр\'26', total: 110, warranty: 11, pct: 10.0 },
  { month: 'Май\'26', total: 87, warranty: 7, pct: 8.0 },
];

const BRAND_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6b7280'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<WarrantyStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  active:    { label: 'Активная',    variant: 'default',     color: 'bg-green-100 text-green-800 border-green-200' },
  expiring:  { label: 'Истекает',    variant: 'outline',     color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  expired:   { label: 'Истекла',     variant: 'secondary',   color: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelled: { label: 'Аннулирована', variant: 'destructive', color: 'bg-red-100 text-red-800 border-red-200' },
};

const EVENT_ICON: Record<WarrantyEvent['type'], string> = {
  install: 'Wrench',
  claim:   'AlertTriangle',
  repair:  'Settings',
  close:   'CheckCircle',
  extend:  'RefreshCw',
};

const EVENT_COLOR: Record<WarrantyEvent['type'], string> = {
  install: 'bg-blue-100 text-blue-700',
  claim:   'bg-red-100 text-red-700',
  repair:  'bg-orange-100 text-orange-700',
  close:   'bg-green-100 text-green-700',
  extend:  'bg-purple-100 text-purple-700',
};

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all',       label: 'Все' },
  { value: 'active',    label: 'Активные' },
  { value: 'expiring',  label: 'Истекают' },
  { value: 'expired',   label: 'Истекли' },
  { value: 'cancelled', label: 'Аннулированы' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const WarrantyTracking = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedId, setSelectedId]     = useState<string | null>('w01');

  const selected = WARRANTY_ITEMS.find(w => w.id === selectedId) ?? null;
  const history  = selected ? (WARRANTY_HISTORY[selected.id] ?? DEFAULT_HISTORY) : [];

  const filtered = WARRANTY_ITEMS.filter(w => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      w.brand.toLowerCase().includes(q) ||
      w.model.toLowerCase().includes(q) ||
      w.client.toLowerCase().includes(q) ||
      w.serialNumber.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const metrics = {
    active:   WARRANTY_ITEMS.filter(w => w.status === 'active').length,
    expiring: WARRANTY_ITEMS.filter(w => w.status === 'expiring').length,
    inWork:   7,
    avgTime:  3.2,
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon name="Shield" className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Гарантийный учёт</h1>
            <p className="text-sm text-gray-500">Мониторинг гарантий и гарантийных случаев</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Экспорт реестра гарантий запущен')}>
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт
          </Button>
          <Button onClick={() => toast.success('Форма регистрации гарантии открыта')}>
            <Icon name="Plus" size={16} className="mr-2" />
            Зарегистрировать гарантию
          </Button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Активных гарантий</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="ShieldCheck" size={18} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">89</p>
          <p className="text-xs text-gray-400 mt-1">по всем объектам</p>
        </div>

        <div className="bg-white rounded-xl border border-yellow-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-yellow-700 font-medium">Истекает в этом месяце</span>
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={18} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-700">12</p>
          <p className="text-xs text-yellow-500 mt-1">требуют внимания</p>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Гарантийных нарядов</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="Wrench" size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-700">7</p>
          <p className="text-xs text-blue-400 mt-1">в работе сейчас</p>
        </div>

        <div className="bg-white rounded-xl border border-purple-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">Среднее время ремонта</span>
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Icon name="Timer" size={18} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-700">3.2<span className="text-lg font-medium">ч</span></p>
          <p className="text-xs text-purple-400 mt-1">гарантийного ремонта</p>
        </div>
      </div>

      {/* ── Main body: table + detail panel ── */}
      <div className="flex gap-4">

        {/* Table */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по марке, модели, клиенту, серийному номеру…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === f.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Оборудование</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Серийный №</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Клиент</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Установлено</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Гарантия</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Окончание</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(w => {
                  const st = STATUS_MAP[w.status];
                  const isSelected = selectedId === w.id;
                  return (
                    <tr
                      key={w.id}
                      onClick={() => setSelectedId(w.id)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50 ${isSelected ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{w.brand} {w.model}</p>
                          <p className="text-xs text-gray-500">{w.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{w.serialNumber}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{w.client}</td>
                      <td className="px-4 py-3 text-gray-600">{w.installDate}</td>
                      <td className="px-4 py-3 text-gray-600">{w.warrantyYears} {w.warrantyYears === 1 ? 'год' : 'года'}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{w.warrantyEnd}</p>
                        {w.status === 'expiring' && (
                          <p className="text-xs text-yellow-600 font-medium">Осталось {w.daysLeft} дн.</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={e => {
                            e.stopPropagation();
                            toast.success(`Гарантия для ${w.brand} ${w.model} продлена`);
                          }}
                        >
                          <Icon name="RefreshCw" size={12} className="mr-1" />
                          Продлить
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <Icon name="SearchX" size={32} className="mx-auto mb-2 text-gray-300" />
                      Объекты не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Показано {filtered.length} из {WARRANTY_ITEMS.length} объектов
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {selected ? (
            <>
              {/* Detail header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{selected.brand}</p>
                    <p className="text-sm text-gray-600">{selected.model}</p>
                    <p className="text-xs text-gray-400">{selected.category}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_MAP[selected.status].color}`}>
                    {STATUS_MAP[selected.status].label}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Серийный №</span>
                    <span className="font-mono">{selected.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Клиент</span>
                    <span className="text-right max-w-[170px] truncate">{selected.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Договор</span>
                    <span className="text-blue-600">{selected.contractId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Установка</span>
                    <span>{selected.installDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Гарантия до</span>
                    <span className="font-medium">{selected.warrantyEnd}</span>
                  </div>
                  {selected.daysLeft > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Осталось</span>
                      <span className={selected.daysLeft <= 30 ? 'text-yellow-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {selected.daysLeft} дн.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Условия гарантии</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-start gap-1.5">
                    <Icon name="CheckCircle" size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                    Заводские дефекты и материалы
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Icon name="CheckCircle" size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                    Выезд специалиста в рабочее время
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Icon name="XCircle" size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                    Механические повреждения
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Icon name="XCircle" size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                    Нарушение условий эксплуатации
                  </li>
                </ul>
              </div>

              {/* History timeline */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">История обращений</p>
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-200" />
                  <div className="space-y-4">
                    {history.map((ev, i) => (
                      <div key={i} className="flex gap-3 relative">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${EVENT_COLOR[ev.type]}`}>
                          <Icon name={EVENT_ICON[ev.type] as any} size={14} />
                        </div>
                        <div className="flex-1 pb-1">
                          <p className="text-xs font-medium text-gray-800">{ev.description}</p>
                          {ev.engineer && (
                            <p className="text-xs text-gray-400">{ev.engineer}</p>
                          )}
                          {ev.orderNumber && (
                            <p className="text-xs text-blue-500">{ev.orderNumber}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">{ev.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-100 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => toast.success(`Гарантийный наряд создан для ${selected.brand} ${selected.model}`)}
                >
                  <Icon name="Plus" size={15} className="mr-2" />
                  Создать гарантийный наряд
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info('Отчёт по гарантийному объекту формируется…')}
                >
                  <Icon name="FileText" size={15} className="mr-2" />
                  Отчёт по объекту
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <Icon name="Shield" size={40} className="mx-auto mb-3 text-gray-200" />
                <p>Выберите объект в таблице</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Analytics ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Bar: гарантийных нарядов по месяцам */}
        <div className="col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="BarChart2" size={18} className="text-blue-500" />
            <p className="text-sm font-semibold text-gray-800">Гарантийные наряды по месяцам</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_CLAIMS} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="claims" name="Нарядов" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie: по брендам */}
        <div className="col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="PieChart" size={18} className="text-purple-500" />
            <p className="text-sm font-semibold text-gray-800">По брендам оборудования</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={BRAND_DISTRIBUTION}
                cx="45%"
                cy="50%"
                outerRadius={75}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {BRAND_DISTRIBUTION.map((_, i) => (
                  <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} ед.`, 'Объектов']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {BRAND_DISTRIBUTION.map((b, i) => (
              <div key={b.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: BRAND_COLORS[i] }} />
                {b.name}
              </div>
            ))}
          </div>
        </div>

        {/* Line: % гарантийных от общего */}
        <div className="col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="TrendingUp" size={18} className="text-green-500" />
            <p className="text-sm font-semibold text-gray-800">% гарантийных нарядов</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={WARRANTY_RATIO} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 14]} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Доля гарантийных']} />
              <Line
                type="monotone"
                dataKey="pct"
                name="% гарантийных"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-gray-400 mt-1">
            Среднее за период: {(WARRANTY_RATIO.reduce((s, r) => s + r.pct, 0) / WARRANTY_RATIO.length).toFixed(1)}%
          </p>
        </div>
      </div>

    </div>
  );
};

export default WarrantyTracking;
