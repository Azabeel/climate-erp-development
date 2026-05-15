import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Моковые данные ────────────────────────────────────────────────────────────

const OBJECT = {
  name: 'ТЦ Европа',
  address: 'г. Москва, ул. Садовая, 1',
  type: 'ТЦ',
  client: 'ООО «Европа Ритейл»',
  responsiblePerson: 'Смирнов Алексей Владимирович',
  responsiblePhone: '+7 (495) 123-45-67',
  area: 12500,
  floors: 5,
  builtYear: 2008,
  status: 'active' as 'active' | 'paused',
};

const EQUIPMENT = [
  { id: 'eq1', type: 'Чиллер', brand: 'Daikin EWAD250C', serial: 'DK-2019-0051', installYear: 2019, status: 'ok' as const },
  { id: 'eq2', type: 'Фанкойл', brand: 'Carrier 42CC-018', serial: 'CA-2019-0072', installYear: 2019, status: 'ok' as const },
  { id: 'eq3', type: 'Сплит-система', brand: 'Mitsubishi MSZ-LN50', serial: 'MT-2020-0143', installYear: 2020, status: 'maintenance' as const },
  { id: 'eq4', type: 'Сплит-система', brand: 'Mitsubishi MSZ-LN35', serial: 'MT-2020-0144', installYear: 2020, status: 'ok' as const },
  { id: 'eq5', type: 'Вентиляционная установка', brand: 'Systemair SAVE VSR 500', serial: 'SY-2021-0211', installYear: 2021, status: 'repair' as const },
  { id: 'eq6', type: 'Тепловой насос', brand: 'Daikin ERLQ016CV3', serial: 'DK-2022-0384', installYear: 2022, status: 'ok' as const },
  { id: 'eq7', type: 'Прецизионный кондиционер', brand: 'Stulz CyberAir 3PRO', serial: 'ST-2023-0055', installYear: 2023, status: 'ok' as const },
  { id: 'eq8', type: 'Сплит-система', brand: 'LG Multi V IV', serial: 'LG-2023-0091', installYear: 2023, status: 'maintenance' as const },
];

const WORK_ORDERS = [
  { id: 'WO-2026-000412', type: 'ТО', date: '2026-05-14', engineer: 'Козлов М.И.', status: 'completed', rating: 5 },
  { id: 'WO-2026-000389', type: 'Ремонт', date: '2026-04-22', engineer: 'Петров С.А.', status: 'completed', rating: 4 },
  { id: 'WO-2026-000341', type: 'Диагностика', date: '2026-04-01', engineer: 'Иванов А.К.', status: 'completed', rating: 5 },
  { id: 'WO-2026-000298', type: 'Гарантия', date: '2026-03-15', engineer: 'Козлов М.И.', status: 'completed', rating: 4 },
  { id: 'WO-2026-000211', type: 'ТО', date: '2026-02-28', engineer: 'Смирнов П.Р.', status: 'completed', rating: 5 },
  { id: 'WO-2026-000144', type: 'Ремонт', date: '2026-02-10', engineer: 'Петров С.А.', status: 'completed', rating: 3 },
  { id: 'WO-2026-000087', type: 'Монтаж', date: '2026-01-25', engineer: 'Федоров Н.С.', status: 'completed', rating: 5 },
  { id: 'WO-2025-004981', type: 'ТО', date: '2025-11-10', engineer: 'Козлов М.И.', status: 'completed', rating: 5 },
  { id: 'WO-2025-004730', type: 'Диагностика', date: '2025-10-05', engineer: 'Иванов А.К.', status: 'completed', rating: 4 },
  { id: 'WO-2025-004502', type: 'Ремонт', date: '2025-09-18', engineer: 'Петров С.А.', status: 'completed', rating: 4 },
];

const MONTHLY_ORDERS = [
  { month: 'Июн\'25', repair: 1, maintenance: 2, warranty: 0 },
  { month: 'Июл\'25', repair: 0, maintenance: 1, warranty: 1 },
  { month: 'Авг\'25', repair: 2, maintenance: 1, warranty: 0 },
  { month: 'Сен\'25', repair: 1, maintenance: 2, warranty: 0 },
  { month: 'Окт\'25', repair: 1, maintenance: 1, warranty: 1 },
  { month: 'Ноя\'25', repair: 0, maintenance: 2, warranty: 0 },
  { month: 'Дек\'25', repair: 1, maintenance: 1, warranty: 0 },
  { month: 'Янв\'26', repair: 2, maintenance: 2, warranty: 0 },
  { month: 'Фев\'26', repair: 1, maintenance: 1, warranty: 1 },
  { month: 'Мар\'26', repair: 0, maintenance: 2, warranty: 0 },
  { month: 'Апр\'26', repair: 1, maintenance: 1, warranty: 0 },
  { month: 'Май\'26', repair: 0, maintenance: 1, warranty: 0 },
];

const CONTRACTS = {
  current: {
    number: 'ДО-2024-047',
    start: '2024-01-01',
    end: '2026-12-31',
    slaType: 'Корпоративный A+',
    conditions: 'TTR ≤ 4 ч, TTF ≤ 24 ч, Реагирование 24/7, Плановое ТО 2 раза в год',
    slaCompliance: 92,
  },
  history: [
    { number: 'ДО-2022-031', start: '2022-01-01', end: '2022-12-31', slaType: 'Стандартный', status: 'closed' },
    { number: 'ДО-2023-038', start: '2023-01-01', end: '2023-12-31', slaType: 'Расширенный B', status: 'closed' },
    { number: 'ДО-2023-101', start: '2023-12-01', end: '2023-12-31', slaType: 'Корпоративный A', status: 'closed' },
  ],
};

const EXPENSES_DATA = [
  { month: 'Июн\'25', amount: 38000 },
  { month: 'Июл\'25', amount: 22000 },
  { month: 'Авг\'25', amount: 45000 },
  { month: 'Сен\'25', amount: 31000 },
  { month: 'Окт\'25', amount: 28000 },
  { month: 'Ноя\'25', amount: 19000 },
  { month: 'Дек\'25', amount: 25000 },
  { month: 'Янв\'26', amount: 52000 },
  { month: 'Фев\'26', amount: 34000 },
  { month: 'Мар\'26', amount: 18000 },
  { month: 'Апр\'26', amount: 41000 },
  { month: 'Май\'26', amount: 12000 },
];

const TOP_PROBLEMS = [
  { issue: 'Засорение фильтров', count: 8 },
  { issue: 'Утечка хладагента', count: 5 },
  { issue: 'Шум наружного блока', count: 3 },
];

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

type EquipStatus = 'ok' | 'maintenance' | 'repair';

const statusConfig: Record<EquipStatus, { label: string; color: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ok: { label: 'Исправен', color: 'bg-green-100 text-green-700', badgeVariant: 'default' },
  maintenance: { label: 'Требует ТО', color: 'bg-yellow-100 text-yellow-700', badgeVariant: 'secondary' },
  repair: { label: 'В ремонте', color: 'bg-red-100 text-red-700', badgeVariant: 'destructive' },
};

const orderTypeColor: Record<string, string> = {
  ТО: 'bg-blue-100 text-blue-700',
  Ремонт: 'bg-orange-100 text-orange-700',
  Диагностика: 'bg-purple-100 text-purple-700',
  Гарантия: 'bg-green-100 text-green-700',
  Монтаж: 'bg-teal-100 text-teal-700',
};

function StarRating({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="Star"
          size={12}
          className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </span>
  );
}

// ─── SVG план этажа ────────────────────────────────────────────────────────────

function FloorPlan() {
  const zones = [
    { x: 10, y: 10, w: 180, h: 70, label: 'Зона 1 — Торговый зал (1 эт.)' },
    { x: 200, y: 10, w: 120, h: 70, label: 'Зона 2 — Фудкорт' },
    { x: 330, y: 10, w: 100, h: 70, label: 'Зона 3 — Кинотеатр' },
    { x: 10, y: 90, w: 130, h: 60, label: 'Зона 4 — Склад' },
    { x: 150, y: 90, w: 160, h: 60, label: 'Зона 5 — Якорный арендатор' },
    { x: 320, y: 90, w: 110, h: 60, label: 'Зона 6 — Офисы' },
    { x: 10, y: 160, w: 420, h: 30, label: 'Техническое помещение / Кровля' },
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Интерактивный план объекта</p>
      <svg viewBox="0 0 440 200" className="w-full h-48" role="img" aria-label="Схема этажей объекта">
        <rect x="0" y="0" width="440" height="200" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        {zones.map((z, i) => (
          <g key={i}>
            <rect
              x={z.x} y={z.y} width={z.w} height={z.h}
              rx="4"
              fill={i % 2 === 0 ? '#dbeafe' : '#e0e7ff'}
              stroke="#93c5fd"
              strokeWidth="1.5"
              className="cursor-pointer hover:fill-blue-200 transition-colors"
              onClick={() => toast.info(z.label)}
            />
            <text
              x={z.x + z.w / 2}
              y={z.y + z.h / 2 - 6}
              textAnchor="middle"
              fontSize="8"
              fill="#1e40af"
              fontWeight="600"
            >
              {z.label.split(' — ')[0]}
            </text>
            <text
              x={z.x + z.w / 2}
              y={z.y + z.h / 2 + 6}
              textAnchor="middle"
              fontSize="7"
              fill="#3b82f6"
            >
              {z.label.split(' — ')[1] ?? ''}
            </text>
          </g>
        ))}
        {/* Лифтовые шахты */}
        <rect x="438" y="10" width="0" height="0" />
        <circle cx="425" cy="45" r="6" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1" />
        <text x="425" y="48" textAnchor="middle" fontSize="6" fill="#92400e">Л</text>
        <circle cx="425" cy="115" r="6" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1" />
        <text x="425" y="118" textAnchor="middle" fontSize="6" fill="#92400e">Л</text>
      </svg>
      <p className="text-xs text-gray-400 mt-2">Нажмите на зону для просмотра оборудования</p>
    </div>
  );
}

// ─── Вкладки ──────────────────────────────────────────────────────────────────

type TabId = 'passport' | 'equipment' | 'orders' | 'contracts' | 'analytics';

const TABS: { id: TabId; label: string }[] = [
  { id: 'passport', label: 'Паспорт объекта' },
  { id: 'equipment', label: 'Оборудование' },
  { id: 'orders', label: 'История нарядов' },
  { id: 'contracts', label: 'Договоры и SLA' },
  { id: 'analytics', label: 'Аналитика' },
];

// ─── Основной компонент ───────────────────────────────────────────────────────

interface Props {
  onBack?: () => void;
}

const ServiceObjectCard = ({ onBack }: Props) => {
  const [activeTab, setActiveTab] = useState<TabId>('passport');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Шапка ── */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Icon name="ChevronLeft" size={16} />
              Назад
            </button>
          )}
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="Building2" size={24} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{OBJECT.name}</h2>
              <Badge
                variant={OBJECT.status === 'active' ? 'default' : 'secondary'}
                className={OBJECT.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
              >
                {OBJECT.status === 'active' ? 'Активный' : 'На паузе'}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
              <Icon name="MapPin" size={12} />
              {OBJECT.address} · {OBJECT.type} · {OBJECT.area.toLocaleString('ru-RU')} м²
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('QR-код объекта')}>
            <Icon name="QrCode" size={14} className="mr-1.5" />
            QR-код
          </Button>
          <Button size="sm" onClick={() => toast.success('Наряд создан')}>
            <Icon name="Wrench" size={14} className="mr-1.5" />
            Создать наряд
          </Button>
        </div>
      </div>

      {/* ── Навигация ── */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════
          Вкладка 1 — Паспорт объекта
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'passport' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Основные реквизиты */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="FileText" size={16} className="text-blue-500" />
              Основная информация
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Тип объекта</p>
                <p className="font-medium text-gray-900">{OBJECT.type}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Год постройки</p>
                <p className="font-medium text-gray-900">{OBJECT.builtYear}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Площадь</p>
                <p className="font-medium text-gray-900">{OBJECT.area.toLocaleString('ru-RU')} м²</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Этажей</p>
                <p className="font-medium text-gray-900">{OBJECT.floors}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-xs mb-0.5">Адрес</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Icon name="MapPin" size={12} className="text-gray-400" />
                  {OBJECT.address}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Клиент и контакт</h4>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Building" size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 cursor-pointer hover:underline" onClick={() => toast.info('Переход к карточке клиента')}>
                    {OBJECT.client}
                  </p>
                  <p className="text-xs text-blue-500">Юридическое лицо</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon name="User" size={14} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{OBJECT.responsiblePerson}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Icon name="Phone" size={10} />
                    {OBJECT.responsiblePhone}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => toast.info(`Звонок: ${OBJECT.responsiblePhone}`)}
                >
                  <Icon name="Phone" size={12} />
                </Button>
              </div>
            </div>
          </div>

          {/* SVG план */}
          <div className="space-y-4">
            <FloorPlan />
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Зоны обслуживания</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Зона 1 — Торговый зал',
                  'Зона 2 — Фудкорт',
                  'Зона 3 — Кинотеатр',
                  'Зона 4 — Склад',
                  'Зона 5 — Якорный арендатор',
                  'Зона 6 — Офисы',
                ].map((zone, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: i % 2 === 0 ? '#dbeafe' : '#e0e7ff', border: '1px solid #93c5fd' }} />
                    {zone}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          Вкладка 2 — Оборудование
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{EQUIPMENT.length} единиц оборудования</p>
            <Button size="sm" onClick={() => toast.success('Форма добавления оборудования')}>
              <Icon name="Plus" size={14} className="mr-1.5" />
              Добавить оборудование
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Тип</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Марка / Модель</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Серийный номер</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Год установки</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Статус</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {EQUIPMENT.map((eq) => {
                  const cfg = statusConfig[eq.status];
                  return (
                    <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">{eq.type}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{eq.brand}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{eq.serial}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{eq.installYear}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          <Icon
                            name={eq.status === 'ok' ? 'CheckCircle2' : eq.status === 'maintenance' ? 'AlertTriangle' : 'XCircle'}
                            size={10}
                          />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toast.info(`Наряд для ${eq.brand}`)}>
                            <Icon name="Wrench" size={12} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toast.info(`QR: ${eq.serial}`)}>
                            <Icon name="QrCode" size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Сводка по статусам */}
          <div className="grid grid-cols-3 gap-4">
            {(['ok', 'maintenance', 'repair'] as EquipStatus[]).map((s) => {
              const count = EQUIPMENT.filter((e) => e.status === s).length;
              const cfg = statusConfig[s];
              return (
                <div key={s} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.color}`}>
                    <Icon
                      name={s === 'ok' ? 'CheckCircle2' : s === 'maintenance' ? 'AlertTriangle' : 'XCircle'}
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500">{cfg.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          Вкладка 3 — История нарядов
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Таблица нарядов */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Все наряды</h3>
              <Badge variant="secondary">{WORK_ORDERS.length}</Badge>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Номер</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Тип</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Дата</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Инженер</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Статус</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Оценка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {WORK_ORDERS.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toast.info(`Открыть наряд ${wo.id}`)}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{wo.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${orderTypeColor[wo.type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {wo.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(wo.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{wo.engineer}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <Icon name="CheckCircle2" size={12} />
                        Выполнен
                      </span>
                    </td>
                    <td className="px-4 py-3 flex justify-center">
                      <StarRating count={wo.rating} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BarChart нарядов по месяцам */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Наряды по месяцам</h3>
            <p className="text-xs text-gray-400 mb-4">Последние 12 месяцев</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_ORDERS} barSize={12} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="repair" name="Ремонт" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                <Bar dataKey="maintenance" name="ТО" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="warranty" name="Гарантия" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              {[{ color: '#f97316', label: 'Ремонт' }, { color: '#3b82f6', label: 'ТО' }, { color: '#22c55e', label: 'Гарантия' }].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          Вкладка 4 — Договоры и SLA
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          {/* Текущий договор */}
          <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">Договор {CONTRACTS.current.number}</h3>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Действующий</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(CONTRACTS.current.start).toLocaleDateString('ru-RU')} —{' '}
                  {new Date(CONTRACTS.current.end).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('Открыть договор')}>
                <Icon name="FileText" size={14} className="mr-1.5" />
                Открыть
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-500 mb-0.5">Тип SLA</p>
                <p className="font-semibold text-blue-800">{CONTRACTS.current.slaType}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-0.5">Условия</p>
                <p className="text-sm text-gray-700">{CONTRACTS.current.conditions}</p>
              </div>
            </div>

            {/* Прогресс-бар SLA */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Соблюдение SLA за последние 90 дней</p>
                <span className="text-sm font-bold text-green-600">{CONTRACTS.current.slaCompliance}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${CONTRACTS.current.slaCompliance}%`,
                    background: CONTRACTS.current.slaCompliance >= 90
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : CONTRACTS.current.slaCompliance >= 75
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                      : 'linear-gradient(90deg, #ef4444, #dc2626)',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span className="text-yellow-500">75% — предупреждение</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* История договоров */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">История договоров</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Номер</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Период</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Тип SLA</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {CONTRACTS.history.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-700">{c.number}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(c.start).toLocaleDateString('ru-RU')} — {new Date(c.end).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{c.slaType}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary">Закрыт</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          Вкладка 5 — Аналитика
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Метрики */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Среднее время ответа', value: '2.4 ч', icon: 'Clock', color: 'text-blue-600 bg-blue-50', delta: '-12%', positive: true },
              { label: 'MTBF (среднее м/у отказами)', value: '142 дня', icon: 'Activity', color: 'text-green-600 bg-green-50', delta: '+8 дн', positive: true },
              { label: 'NPS клиента', value: '74', icon: 'ThumbsUp', color: 'text-purple-600 bg-purple-50', delta: '+6', positive: true },
              { label: 'Всего нарядов (год)', value: '18', icon: 'ClipboardList', color: 'text-orange-600 bg-orange-50', delta: '+3', positive: false },
            ].map((m) => (
              <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${m.color}`}>
                  <Icon name={m.icon as Parameters<typeof Icon>[0]['name']} size={18} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-400 mt-0.5 mb-2">{m.label}</p>
                <span className={`text-xs font-medium ${m.positive ? 'text-green-600' : 'text-orange-500'}`}>{m.delta} за год</span>
              </div>
            ))}
          </div>

          {/* LineChart расходов */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Расходы на обслуживание</h3>
            <p className="text-xs text-gray-400 mb-4">Последние 12 месяцев, руб.</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={EXPENSES_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Расходы']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Топ-3 проблемы */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Топ-3 проблемы</h3>
            <p className="text-xs text-gray-400 mb-4">По частоте обращений за год</p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={TOP_PROBLEMS} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="issue"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={160}
                />
                <Tooltip
                  formatter={(v: number) => [`${v} случаев`, 'Кол-во']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceObjectCard;
