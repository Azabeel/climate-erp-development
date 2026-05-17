import { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EquipmentRow {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  client: string;
  location: string;
  installDate: string;
  warrantyUntil: string;
  daysLeft: number;
  supplier: string;
  claimHistory: ClaimRecord[];
  docs: DocRecord[];
}

interface ClaimRecord {
  date: string;
  problem: string;
  resolution: string;
  partsCost: number;
}

interface DocRecord {
  label: string;
  icon: string;
}

// ─── Mock: Equipment table (15 rows) ─────────────────────────────────────────

const EQUIPMENT: EquipmentRow[] = [
  {
    id: 'eq-01',
    brand: 'Daikin', model: 'FTXB35C',
    serialNumber: 'DK-2025-11-001A',
    client: 'ООО «Альфа Технолоджис»', location: 'БЦ «Восток», 3 эт.',
    installDate: '15.11.2024', warrantyUntil: '15.11.2027', daysLeft: 549,
    supplier: 'ООО «ДайкинРус»',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
      { label: 'Накладная', icon: 'Package' },
    ],
  },
  {
    id: 'eq-02',
    brand: 'Mitsubishi Electric', model: 'PURY-P200YSKM-A',
    serialNumber: 'ME-VRF-2024-0031',
    client: 'ТЦ «Мираж»', location: 'Машинное отделение',
    installDate: '10.03.2024', warrantyUntil: '10.03.2029', daysLeft: 1030,
    supplier: 'МитЭлектрик СПб',
    claimHistory: [
      { date: '12.08.2024', problem: 'Утечка фреона (инвертор)', resolution: 'Замена клапана Schrader', partsCost: 3200 },
    ],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
      { label: 'Накладная', icon: 'Package' },
    ],
  },
  {
    id: 'eq-03',
    brand: 'LG', model: 'S09EQ ARTCOOL',
    serialNumber: 'LG-2025-04-0017',
    client: 'Иванов Петр Сергеевич', location: 'ул. Садовая, 14, кв. 7',
    installDate: '02.04.2025', warrantyUntil: '02.04.2026', daysLeft: 22,
    supplier: 'LG Electronics RU',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
    ],
  },
  {
    id: 'eq-04',
    brand: 'Haier', model: 'AS18TT4HRA',
    serialNumber: 'HR-2025-02-0092',
    client: 'ИП Смирнов К.А.', location: 'Офис, пр. Ленина, 88',
    installDate: '14.02.2025', warrantyUntil: '14.02.2026', daysLeft: 5,
    supplier: 'Haier Russia',
    claimHistory: [
      { date: '20.03.2025', problem: 'Посторонний шум при охлаждении', resolution: 'Балансировка крыльчатки', partsCost: 0 },
    ],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
      { label: 'Накладная', icon: 'Package' },
    ],
  },
  {
    id: 'eq-05',
    brand: 'Daikin', model: 'RZQSG71L3V1',
    serialNumber: 'DK-VRF-2024-0008',
    client: 'БЦ «Горизонт»', location: 'Кровля, блок A',
    installDate: '18.07.2024', warrantyUntil: '18.07.2027', daysLeft: 429,
    supplier: 'ООО «ДайкинРус»',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
    ],
  },
  {
    id: 'eq-06',
    brand: 'Carrier', model: '30XA-0402',
    serialNumber: 'CR-CH-2023-0002',
    client: 'Завод «Металлург»', location: 'Компрессорный цех',
    installDate: '22.09.2023', warrantyUntil: '22.09.2025', daysLeft: -236,
    supplier: 'Carrier Russia',
    claimHistory: [
      { date: '05.04.2024', problem: 'Перегрев компрессора', resolution: 'Замена реле давления', partsCost: 12400 },
      { date: '11.07.2024', problem: 'Ошибка E37 (датчик температуры)', resolution: 'Замена датчика NTC', partsCost: 1800 },
    ],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
      { label: 'Накладная', icon: 'Package' },
    ],
  },
  {
    id: 'eq-07',
    brand: 'Mitsubishi Electric', model: 'PLA-SP60BA',
    serialNumber: 'ME-FC-2025-0144',
    client: 'Гостиница «Север»', location: 'Корпус B, этаж 2–4',
    installDate: '05.01.2025', warrantyUntil: '05.01.2027', daysLeft: 235,
    supplier: 'МитЭлектрик СПб',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
    ],
  },
  {
    id: 'eq-08',
    brand: 'Midea', model: 'MSAB-24HRN8-SE',
    serialNumber: 'MD-2025-03-0058',
    client: 'Школа №14', location: 'Актовый зал',
    installDate: '10.03.2025', warrantyUntil: '10.03.2028', daysLeft: 663,
    supplier: 'Midea Rus',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
      { label: 'Накладная', icon: 'Package' },
    ],
  },
  {
    id: 'eq-09',
    brand: 'Haier', model: 'AB36ES1ERA',
    serialNumber: 'HR-2025-01-0033',
    client: 'Стоматология «Улыбка»', location: 'ул. Пушкина, 3',
    installDate: '20.01.2025', warrantyUntil: '20.01.2026', daysLeft: 18,
    supplier: 'Haier Russia',
    claimHistory: [
      { date: '14.04.2025', problem: 'Не охлаждает, ошибка F1', resolution: 'Продувка конденсатора', partsCost: 0 },
    ],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
    ],
  },
  {
    id: 'eq-10',
    brand: 'Daikin', model: 'ATXN35M',
    serialNumber: 'DK-2024-08-0072',
    client: 'ООО «СтройГрупп»', location: 'Офис директора',
    installDate: '30.08.2024', warrantyUntil: '30.08.2027', daysLeft: 472,
    supplier: 'ООО «ДайкинРус»',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
    ],
  },
  {
    id: 'eq-11',
    brand: 'Mitsubishi Electric', model: 'MSZ-AP25VGK',
    serialNumber: 'ME-2025-05-0201',
    client: 'ИП Петрова А.С.', location: 'Салон красоты',
    installDate: '02.05.2025', warrantyUntil: '02.05.2026', daysLeft: 11,
    supplier: 'МитЭлектрик СПб',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
    ],
  },
  {
    id: 'eq-12',
    brand: 'Midea', model: 'MSVD-18HRN8-SE',
    serialNumber: 'MD-2024-10-0019',
    client: 'Аптека «Здоровье»', location: 'Торговый зал',
    installDate: '15.10.2024', warrantyUntil: '15.10.2027', daysLeft: 518,
    supplier: 'Midea Rus',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
      { label: 'Накладная', icon: 'Package' },
    ],
  },
  {
    id: 'eq-13',
    brand: 'LG', model: 'S12EQ.NSAR',
    serialNumber: 'LG-2024-06-0044',
    client: 'ТРЦ «Планета»', location: 'Кафе, 1 этаж',
    installDate: '08.06.2024', warrantyUntil: '08.06.2026', daysLeft: 24,
    supplier: 'LG Electronics RU',
    claimHistory: [
      { date: '22.01.2025', problem: 'Вибрация наружного блока', resolution: 'Затяжка крепежа', partsCost: 0 },
    ],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
    ],
  },
  {
    id: 'eq-14',
    brand: 'Carrier', model: '42GQE018DS',
    serialNumber: 'CR-2023-12-0009',
    client: 'Банк «Капитал»', location: 'Серверная комната',
    installDate: '12.12.2023', warrantyUntil: '12.12.2025', daysLeft: -155,
    supplier: 'Carrier Russia',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
      { label: 'Накладная', icon: 'Package' },
    ],
  },
  {
    id: 'eq-15',
    brand: 'Daikin', model: 'FCQ71C',
    serialNumber: 'DK-2025-02-0039',
    client: 'Фитнес-клуб «Форма»', location: 'Спортзал',
    installDate: '18.02.2025', warrantyUntil: '18.02.2028', daysLeft: 644,
    supplier: 'ООО «ДайкинРус»',
    claimHistory: [],
    docs: [
      { label: 'Акт установки', icon: 'FileText' },
      { label: 'Гарантийный паспорт', icon: 'ShieldCheck' },
    ],
  },
];

// ─── Mock: Charts ─────────────────────────────────────────────────────────────

const BRANDS_PIE = [
  { name: 'Daikin', value: 42, color: '#6366f1' },
  { name: 'Mitsubishi', value: 31, color: '#10b981' },
  { name: 'Midea', value: 28, color: '#f59e0b' },
  { name: 'Haier', value: 24, color: '#ec4899' },
  { name: 'Прочие', value: 22, color: '#94a3b8' },
];

const MONTHS_DATA = [
  { month: 'Июн', warranty: 2, paid: 18 },
  { month: 'Июл', warranty: 3, paid: 21 },
  { month: 'Авг', warranty: 4, paid: 24 },
  { month: 'Сен', warranty: 2, paid: 19 },
  { month: 'Окт', warranty: 3, paid: 22 },
  { month: 'Ноя', warranty: 5, paid: 20 },
  { month: 'Дек', warranty: 2, paid: 17 },
  { month: 'Янв', warranty: 4, paid: 23 },
  { month: 'Фев', warranty: 3, paid: 25 },
  { month: 'Мар', warranty: 2, paid: 28 },
  { month: 'Апр', warranty: 3, paid: 30 },
  { month: 'Май', warranty: 1, paid: 32 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysBadge(daysLeft: number) {
  if (daysLeft < 0) {
    return <Badge className="bg-gray-100 text-gray-600 border border-gray-300 text-xs">Истекла</Badge>;
  }
  if (daysLeft < 30) {
    return <Badge className="bg-red-100 text-red-700 border border-red-300 text-xs">{daysLeft} дн.</Badge>;
  }
  if (daysLeft < 90) {
    return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 text-xs">{daysLeft} дн.</Badge>;
  }
  return <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs">{daysLeft} дн.</Badge>;
}

function isExpiringSoon(daysLeft: number) {
  return daysLeft >= 0 && daysLeft < 30;
}

const BRANDS = ['Все бренды', 'Daikin', 'Mitsubishi Electric', 'Midea', 'Haier', 'LG', 'Carrier'];
const WARRANTY_STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активна' },
  { value: 'expiring', label: 'Истекает' },
  { value: 'expired', label: 'Истекла' },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 leading-tight">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function DetailPanel({
  item,
  onClose,
}: {
  item: EquipmentRow;
  onClose: () => void;
}) {
  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{item.brand} {item.model}</p>
          <p className="text-xs text-gray-500 mt-0.5">S/N: {item.serialNumber}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="X" size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Main info */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-400">Клиент</p>
            <p className="text-gray-800 font-medium mt-0.5">{item.client}</p>
          </div>
          <div>
            <p className="text-gray-400">Объект</p>
            <p className="text-gray-800 font-medium mt-0.5">{item.location}</p>
          </div>
          <div>
            <p className="text-gray-400">Дата установки</p>
            <p className="text-gray-800 font-medium mt-0.5">{item.installDate}</p>
          </div>
          <div>
            <p className="text-gray-400">Гарантия до</p>
            <p className="text-gray-800 font-medium mt-0.5">{item.warrantyUntil}</p>
          </div>
          <div>
            <p className="text-gray-400">Поставщик</p>
            <p className="text-gray-800 font-medium mt-0.5">{item.supplier}</p>
          </div>
          <div>
            <p className="text-gray-400">Осталось</p>
            <div className="mt-0.5">{getDaysBadge(item.daysLeft)}</div>
          </div>
        </div>
      </div>

      {/* Claim history */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          История гарантийных обращений
        </p>
        {item.claimHistory.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Обращений не было</p>
        ) : (
          <div className="space-y-2">
            {item.claimHistory.map((claim, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{claim.date}</span>
                  {claim.partsCost > 0 && (
                    <span className="text-xs text-orange-600 font-semibold">
                      {claim.partsCost.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600"><span className="font-medium">Проблема:</span> {claim.problem}</p>
                <p className="text-xs text-gray-600 mt-0.5"><span className="font-medium">Решение:</span> {claim.resolution}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Документы
        </p>
        <div className="space-y-1.5">
          {item.docs.map((doc, idx) => (
            <button
              key={idx}
              onClick={() => toast.success(`Загрузка: ${doc.label}`)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
            >
              <Icon name={doc.icon as Parameters<typeof Icon>[0]['name']} size={14} className="text-blue-500 flex-shrink-0" />
              <span className="text-xs text-gray-700">{doc.label}</span>
              <Icon name="Download" size={12} className="text-gray-400 ml-auto flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="px-4 pb-4 mt-auto">
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
          onClick={() =>
            toast.success(`Гарантийный наряд создан для ${item.brand} ${item.model}`, {
              description: `Клиент: ${item.client}`,
            })
          }
        >
          <Icon name="ClipboardPlus" size={14} className="mr-2" />
          Создать гарантийный наряд
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WarrantyTrackingFull() {
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('Все бренды');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<EquipmentRow | null>(null);

  // Filter logic
  const filtered = EQUIPMENT.filter((eq) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      eq.brand.toLowerCase().includes(q) ||
      eq.model.toLowerCase().includes(q) ||
      eq.serialNumber.toLowerCase().includes(q) ||
      eq.client.toLowerCase().includes(q);

    const matchBrand = brandFilter === 'Все бренды' || eq.brand === brandFilter;

    let matchStatus = true;
    if (statusFilter === 'active') matchStatus = eq.daysLeft >= 90;
    else if (statusFilter === 'expiring') matchStatus = eq.daysLeft >= 0 && eq.daysLeft < 90;
    else if (statusFilter === 'expired') matchStatus = eq.daysLeft < 0;

    return matchSearch && matchBrand && matchStatus;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon name="ShieldCheck" size={20} className="text-indigo-600" />
            Гарантийный учёт оборудования
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Мониторинг гарантий, обращений и документов HVAC</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-sm"
          onClick={() => toast.success('Экспорт реестра гарантий запущен')}
        >
          <Icon name="Download" size={14} className="mr-1.5" />
          Экспорт
        </Button>
      </div>

      {/* ── Alert Banner ── */}
      <div className="mx-6 mt-4 flex-shrink-0 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex items-center gap-3">
        <Icon name="AlertTriangle" size={18} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800 flex-1">
          <span className="font-semibold">12 единиц оборудования</span> истекают в ближайшие 30 дней.
          Уведомить клиентов?
        </p>
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs flex-shrink-0"
          onClick={() =>
            toast.success('Уведомления отправлены', {
              description: '12 клиентам отправлены SMS и email об истечении гарантии',
            })
          }
        >
          <Icon name="Send" size={12} className="mr-1.5" />
          Отправить уведомления
        </Button>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-4 gap-4 px-6 mt-4 flex-shrink-0">
        <MetricCard
          icon="ShieldCheck"
          label="На гарантии"
          value="147"
          sub="единиц оборудования"
          color="bg-indigo-500"
        />
        <MetricCard
          icon="Clock"
          label="Истекает в 30 дней"
          value="12"
          sub="требуют уведомления"
          color="bg-amber-500"
        />
        <MetricCard
          icon="Wrench"
          label="Гарантийных обращений"
          value="34"
          sub="за текущий год"
          color="bg-blue-500"
        />
        <MetricCard
          icon="Banknote"
          label="Средняя стоимость случая"
          value="8 400 ₽"
          sub="запчасти по гарантии"
          color="bg-emerald-500"
        />
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 gap-0 mt-4 mx-6 mb-6 min-h-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        {/* Left: table + charts */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Filters */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-1 max-w-xs">
              <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="Бренд, модель, S/N, клиент…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-8 px-3 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              {WARRANTY_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} записей</span>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Оборудование</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Серийный №</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Клиент</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Объект</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Установка</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Гарантия до</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Осталось</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Поставщик</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Паспорт</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((eq) => (
                  <tr
                    key={eq.id}
                    onClick={() => setSelected(eq.id === selected?.id ? null : eq)}
                    className={`cursor-pointer transition-colors ${
                      isExpiringSoon(eq.daysLeft)
                        ? 'bg-amber-50 hover:bg-amber-100'
                        : selected?.id === eq.id
                        ? 'bg-indigo-50'
                        : 'hover:bg-gray-50'
                    } ${selected?.id === eq.id ? 'ring-1 ring-inset ring-indigo-300' : ''}`}
                  >
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900 whitespace-nowrap">{eq.brand}</p>
                      <p className="text-xs text-gray-500">{eq.model}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <code className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                        {eq.serialNumber}
                      </code>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-700 max-w-[140px] truncate" title={eq.client}>
                      {eq.client}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[120px] truncate" title={eq.location}>
                      {eq.location}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{eq.installDate}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-700 whitespace-nowrap">{eq.warrantyUntil}</td>
                    <td className="px-4 py-2.5">{getDaysBadge(eq.daysLeft)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[100px] truncate" title={eq.supplier}>
                      {eq.supplier}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Загрузка гарантийного паспорта: ${eq.serialNumber}`);
                        }}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Icon name="Download" size={12} />
                        Скачать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
                Ничего не найдено по заданным фильтрам
              </div>
            )}
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-2 gap-4 p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50">
            {/* PieChart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Гарантийные случаи по брендам
              </p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={BRANDS_PIE}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {BRANDS_PIE.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [`${v} ед.`, '']}
                      contentStyle={{ fontSize: 11, borderRadius: 6 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 flex-1">
                  {BRANDS_PIE.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-gray-600 flex-1">{item.name}</span>
                      <span className="text-xs font-semibold text-gray-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BarChart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Обращения по месяцам
              </p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-red-400" />
                  <span className="text-xs text-gray-500">Гарантийные</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-indigo-400" />
                  <span className="text-xs text-gray-500">Платные</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={108}>
                <BarChart data={MONTHS_DATA} barSize={8} barGap={2}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 6 }}
                    formatter={(v: number, name: string) => [
                      `${v} заявок`,
                      name === 'warranty' ? 'Гарантийные' : 'Платные',
                    ]}
                  />
                  <Bar dataKey="warranty" fill="#f87171" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="paid" fill="#818cf8" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selected && (
          <DetailPanel item={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}
