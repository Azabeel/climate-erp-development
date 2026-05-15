import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const MOCK_ORDER = {
  id: 'WO-2026-000415',
  type: 'Ремонт' as const,
  priority: 'URGENT' as const,
  status: 'IN_PROGRESS' as const,
  statusLabel: 'В работе',
  source: 'EMAIL' as const,

  client: 'ООО «Торговый Центр»',
  contactName: 'Смирнова Е. А.',
  contactPhone: '+7 (495) 321-00-11',
  serviceObject: 'ТЦ «Галактика», 3 этаж, ВРФ-зона',
  address: 'ул. Ленина, 45, Москва',

  engineer: {
    name: 'Петров А. В.',
    initials: 'ПА',
    phone: '+7 (916) 555-77-88',
    avatarColor: 'bg-indigo-100 text-indigo-700',
  },

  createdAt: '2026-05-15T08:00:00',
  assignedAt: '2026-05-15T08:22:00',
  acceptedAt: '2026-05-15T09:05:00',
  enRouteAt: '2026-05-15T09:20:00',
  onSiteAt: '2026-05-15T10:00:00',
  completedAt: null as string | null,

  sla: {
    ttr: { label: 'TTR (Реакция)', planned: 120, elapsed: 82, unit: 'мин' },
    tto: { label: 'TTO (На месте)', planned: 240, elapsed: 180, unit: 'мин' },
    ttf: { label: 'TTF (Выполнение)', planned: 480, elapsed: 230, unit: 'мин' },
  },

  services: [
    { id: 's1', name: 'Диагностика ВРФ-системы', hours: 1.0, rate: 3500, total: 3500 },
    { id: 's2', name: 'Дозаправка хладагентом R-410A', hours: 0.5, rate: 2800, total: 1400 },
    { id: 's3', name: 'Проверка давления в контуре', hours: 0.5, rate: 2000, total: 1000 },
  ],

  materials: [
    { id: 'm1', name: 'Хладагент R-410A', qty: 1.2, unit: 'кг', price: 2200, total: 2640 },
    { id: 'm2', name: 'Уплотнительные кольца (набор)', qty: 2, unit: 'шт', price: 350, total: 700 },
    { id: 'm3', name: 'Ниппель Schrader 1/4"', qty: 4, unit: 'шт', price: 120, total: 480 },
  ],

  photos: [
    { id: 'p1', label: 'До работ', tag: 'before' },
    { id: 'p2', label: 'До работ', tag: 'before' },
    { id: 'p3', label: 'Дефект', tag: 'defect' },
    { id: 'p4', label: 'Запчасть', tag: 'part' },
    { id: 'p5', label: 'После работ', tag: 'after' },
    { id: 'p6', label: 'После работ', tag: 'after' },
  ],

  history: [
    { id: 'h1', icon: 'FilePlus', color: 'text-blue-600 bg-blue-50', action: 'Наряд создан', user: 'Диспетчер Иванова Н. В.', dt: '2026-05-15 08:00' },
    { id: 'h2', icon: 'UserCheck', color: 'text-indigo-600 bg-indigo-50', action: 'Назначен инженер Петров А. В.', user: 'Диспетчер Иванова Н. В.', dt: '2026-05-15 08:22' },
    { id: 'h3', icon: 'CheckCircle', color: 'text-green-600 bg-green-50', action: 'Статус → Принят', user: 'Петров А. В.', dt: '2026-05-15 09:05' },
    { id: 'h4', icon: 'Navigation', color: 'text-orange-500 bg-orange-50', action: 'Статус → В пути', user: 'Петров А. В.', dt: '2026-05-15 09:20' },
    { id: 'h5', icon: 'MapPin', color: 'text-purple-600 bg-purple-50', action: 'Статус → На месте', user: 'Петров А. В.', dt: '2026-05-15 10:00' },
    { id: 'h6', icon: 'Package', color: 'text-yellow-600 bg-yellow-50', action: 'Добавлен материал: R-410A 1.2 кг', user: 'Петров А. В.', dt: '2026-05-15 10:35' },
    { id: 'h7', icon: 'Wrench', color: 'text-teal-600 bg-teal-50', action: 'Статус → В работе', user: 'Петров А. В.', dt: '2026-05-15 10:40' },
    { id: 'h8', icon: 'MessageSquare', color: 'text-gray-600 bg-gray-100', action: 'Комментарий: «Обнаружена утечка на штуцере испарителя ст. 3»', user: 'Петров А. В.', dt: '2026-05-15 11:10' },
  ],
};

const SLA_CHART_DATA = [
  { time: '08:00', план: 0, факт: 0 },
  { time: '09:00', план: 60, факт: 82 },
  { time: '10:00', план: 120, факт: 180 },
  { time: '11:00', план: 180, факт: 230 },
  { time: '12:00', план: 240, факт: null },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'createdAt', label: 'Создан' },
  { key: 'assignedAt', label: 'Назначен' },
  { key: 'acceptedAt', label: 'Принят' },
  { key: 'enRouteAt', label: 'В пути' },
  { key: 'onSiteAt', label: 'На месте' },
  { key: 'completedAt', label: 'Выполнен' },
] as const;

const STATUS_CHANGE_OPTIONS = [
  { value: 'EN_ROUTE', label: 'В пути' },
  { value: 'ON_SITE', label: 'На месте' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'COMPLETED', label: 'Выполнен' },
];

const PHOTO_TAG_COLORS: Record<string, string> = {
  before: 'bg-blue-100 text-blue-700',
  after: 'bg-green-100 text-green-700',
  defect: 'bg-red-100 text-red-700',
  part: 'bg-yellow-100 text-yellow-700',
};

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function fmtRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function slaColor(planned: number, elapsed: number) {
  const pct = elapsed / planned;
  if (pct >= 1) return { bar: 'bg-red-500', text: 'text-red-600', badge: 'destructive' as const };
  if (pct >= 0.75) return { bar: 'bg-yellow-400', text: 'text-yellow-600', badge: 'secondary' as const };
  return { bar: 'bg-green-500', text: 'text-green-600', badge: 'secondary' as const };
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

type TabId = 'overview' | 'services' | 'sla' | 'photos' | 'ai' | 'history';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Общая информация' },
  { id: 'services', label: 'Услуги и материалы' },
  { id: 'sla', label: 'SLA и время' },
  { id: 'photos', label: 'Фотоотчёт' },
  { id: 'ai', label: 'ИИ-ассистент' },
  { id: 'history', label: 'История' },
];

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

interface Props {
  onBack?: () => void;
}

const WorkOrderDetail = ({ onBack }: Props) => {
  const order = MOCK_ORDER;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const totalServices = order.services.reduce((s, x) => s + x.total, 0);
  const totalMaterials = order.materials.reduce((s, x) => s + x.total, 0);
  const vat = Math.round((totalServices + totalMaterials) * 0.2);
  const grandTotal = totalServices + totalMaterials + vat;

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const label = STATUS_CHANGE_OPTIONS.find(o => o.value === e.target.value)?.label ?? e.target.value;
    toast.success(`Статус изменён на «${label}»`);
    e.target.value = '';
  }

  function handleAskAI() {
    if (!aiQuestion.trim()) return;
    setAiAnswer(
      'На основании истории оборудования Daikin VRF MDX20G и текущего симптома (утечка хладагента) рекомендую: ' +
      '1) заменить уплотнительное кольцо штуцера испарителя; ' +
      '2) провести опрессовку контура азотом 20 бар на 30 мин; ' +
      '3) вакуумировать и дозаправить R-410A до рабочего давления.'
    );
    toast.success('Ответ получен');
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Icon name="ArrowLeft" size={16} />
              Назад
            </button>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{order.id}</h2>
              <Badge variant="outline" className="text-xs">{order.type}</Badge>
              <Badge variant="destructive" className="text-xs">Срочный</Badge>
              <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">{order.statusLabel}</Badge>
            </div>
            <p className="text-sm text-gray-500">{order.client} · {order.serviceObject}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status change dropdown */}
          <div className="relative">
            <select
              defaultValue=""
              onChange={handleStatusChange}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>Изменить статус</option>
              {STATUS_CHANGE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Icon name="ChevronDown" size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <Button variant="outline" size="sm" onClick={() => toast.info('Открыт редактор наряда')}>
            <Icon name="Pencil" size={14} className="mr-1.5" />
            Редактировать
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Отправка на печать')}>
            <Icon name="Printer" size={14} className="mr-1.5" />
            Распечатать
          </Button>
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Client */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Клиент / Объект</p>
          <p className="font-semibold text-gray-900 text-sm mb-0.5">{order.client}</p>
          <p className="text-xs text-gray-600">{order.contactName}</p>
          <p className="text-xs text-gray-500">{order.contactPhone}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
            <Icon name="MapPin" size={11} />
            {order.address}
          </div>
        </div>

        {/* Engineer */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Инженер</p>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${order.engineer.avatarColor}`}>
              {order.engineer.initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{order.engineer.name}</p>
              <p className="text-xs text-gray-500">{order.engineer.phone}</p>
              <button
                className="text-xs text-blue-600 hover:underline mt-0.5"
                onClick={() => toast.info(`Звонок ${order.engineer.name}`)}
              >
                Позвонить
              </button>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Время</p>
          <div className="space-y-1.5 text-xs">
            {[
              { label: 'Создан', val: fmtTime(order.createdAt) },
              { label: 'Назначен', val: fmtTime(order.assignedAt) },
              { label: 'Принят', val: fmtTime(order.acceptedAt) },
              { label: 'В пути', val: fmtTime(order.enRouteAt) },
              { label: 'На месте', val: fmtTime(order.onSiteAt) },
              { label: 'Выполнен', val: fmtTime(order.completedAt) },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-500">{row.label}:</span>
                <span className={row.val === '—' ? 'text-gray-300' : 'font-medium text-gray-800'}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ══════════════════════════════════════
          TAB 1 — Общая информация
      ══════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Status timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Этапы выполнения</p>
            <div className="flex items-center overflow-x-auto gap-0">
              {STATUS_STEPS.map((step, i) => {
                const ts = order[step.key as keyof typeof order] as string | null;
                const done = !!ts;
                const current = !done && (i === 0 || !!(order[STATUS_STEPS[i - 1].key as keyof typeof order]));
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[72px]">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ring-2
                        ${done
                          ? 'bg-green-500 text-white ring-green-200'
                          : current
                          ? 'bg-blue-600 text-white ring-blue-200'
                          : 'bg-gray-100 text-gray-400 ring-gray-100'}`}
                      >
                        {done
                          ? <Icon name="Check" size={16} />
                          : <span>{i + 1}</span>}
                      </div>
                      <p className={`text-xs mt-1.5 text-center leading-tight
                        ${done ? 'text-green-700 font-medium' : current ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {ts && <p className="text-[10px] text-gray-400 mt-0.5">{fmtTime(ts)}</p>}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`h-0.5 w-10 mx-1 mb-7 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Параметры наряда</p>
              {[
                { label: 'Номер', value: order.id },
                { label: 'Тип', value: order.type },
                { label: 'Источник', value: 'E-mail' },
                { label: 'Приоритет', value: 'Срочный' },
                { label: 'Объект', value: order.serviceObject },
                { label: 'Адрес', value: order.address },
              ].map(row => (
                <div key={row.label} className="flex gap-4">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{row.label}</span>
                  <span className="text-sm text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Описание задачи</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Клиент сообщает о нарушении холодоснабжения в зоне VRF (3 этаж).
                Система Daikin VRF MDX20G, 4 внутренних блока. По предварительной оценке —
                утечка хладагента R-410A в контуре испарителя. Необходимо: диагностика,
                устранение утечки, дозаправка, опрессовка.
              </p>
              <div className="flex gap-2 flex-wrap pt-1">
                {['Диагностика', 'Хладагент', 'VRF'].map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 2 — Услуги и материалы
      ══════════════════════════════════════ */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Services table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Icon name="Wrench" size={15} className="text-gray-500" />
                Услуги
              </p>
              <Button size="sm" variant="outline" onClick={() => toast.info('Добавление услуги')}>
                <Icon name="Plus" size={13} className="mr-1" /> Добавить
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium">Услуга</th>
                  <th className="text-center px-4 py-2.5 font-medium">Часы</th>
                  <th className="text-right px-4 py-2.5 font-medium">Ставка</th>
                  <th className="text-right px-5 py-2.5 font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.services.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{s.hours}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmtRub(s.rate)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{fmtRub(s.total)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold text-sm">
                  <td colSpan={3} className="px-5 py-3 text-gray-700">Итого услуги</td>
                  <td className="px-5 py-3 text-right text-gray-900">{fmtRub(totalServices)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Materials table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Icon name="Package" size={15} className="text-gray-500" />
                Материалы
              </p>
              <Button size="sm" variant="outline" onClick={() => toast.info('Добавление материала')}>
                <Icon name="Plus" size={13} className="mr-1" /> Добавить
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium">Наименование</th>
                  <th className="text-center px-4 py-2.5 font-medium">Кол-во</th>
                  <th className="text-center px-4 py-2.5 font-medium">Ед.</th>
                  <th className="text-right px-4 py-2.5 font-medium">Цена</th>
                  <th className="text-right px-5 py-2.5 font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.materials.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{m.qty}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{m.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmtRub(m.price)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{fmtRub(m.total)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="px-5 py-3 text-gray-700">Итого материалы</td>
                  <td className="px-5 py-3 text-right text-gray-900">{fmtRub(totalMaterials)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 mb-3">Итого к оплате</p>
            <div className="space-y-2 text-sm max-w-xs ml-auto">
              <div className="flex justify-between text-gray-600">
                <span>Услуги</span><span>{fmtRub(totalServices)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Материалы</span><span>{fmtRub(totalMaterials)}</span>
              </div>
              <div className="flex justify-between text-gray-600 border-t border-dashed border-gray-200 pt-2">
                <span>НДС 20%</span><span>{fmtRub(vat)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-300 pt-2">
                <span>ИТОГО</span><span>{fmtRub(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 3 — SLA и время
      ══════════════════════════════════════ */}
      {activeTab === 'sla' && (
        <div className="space-y-4">
          {/* SLA progress bars */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 mb-4">Метрики SLA</p>
            <div className="space-y-5">
              {Object.entries(order.sla).map(([key, sla]) => {
                const { bar, text } = slaColor(sla.planned, sla.elapsed);
                const pct = Math.min((sla.elapsed / sla.planned) * 100, 100);
                const remaining = Math.max(sla.planned - sla.elapsed, 0);
                return (
                  <div key={key}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{sla.label}</span>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${text}`}>
                          {sla.elapsed} / {sla.planned} {sla.unit}
                        </span>
                        {remaining > 0 && (
                          <span className="text-xs text-gray-400 ml-2">осталось {remaining} {sla.unit}</span>
                        )}
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all ${bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 mb-4">Таймлайн статусов</p>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200" />
              {STATUS_STEPS.map((step) => {
                const ts = order[step.key as keyof typeof order] as string | null;
                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 mt-0.5
                      ${ts
                        ? 'bg-green-500 border-green-500'
                        : 'bg-white border-gray-300'}`}
                    />
                    <div className="flex-1">
                      <div className="flex gap-3 items-baseline">
                        <span className={`text-sm font-medium ${ts ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                        {ts && (
                          <span className="text-xs text-gray-400">
                            {new Date(ts).toLocaleString('ru-RU', {
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        )}
                        {!ts && <span className="text-xs text-gray-300">ожидается</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 mb-4">График: факт vs план (минуты)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={SLA_CHART_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v} мин`} />
                <Line
                  type="monotone"
                  dataKey="план"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="факт"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-6 justify-center mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-6 h-0.5 bg-indigo-500" /> По плану
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-6 h-0.5 bg-yellow-500 border-dashed border" /> Фактически
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 4 — Фотоотчёт
      ══════════════════════════════════════ */}
      {activeTab === 'photos' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-800">
              Фотографии <span className="text-gray-400 font-normal">({order.photos.length})</span>
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info('Функция загрузки фото откроет диалог выбора файла')}
            >
              <Icon name="Upload" size={13} className="mr-1.5" />
              Загрузить фото
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {order.photos.map(photo => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-gray-100 rounded-xl border border-gray-200
                           flex flex-col items-center justify-center cursor-pointer
                           hover:border-gray-400 hover:bg-gray-50 transition-all"
                onClick={() => toast.info(`Просмотр фото: ${photo.label}`)}
              >
                <Icon name="Camera" size={28} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                <span className={`absolute bottom-2 left-2 right-2 text-center text-[11px] font-medium px-1.5 py-0.5 rounded-full
                  ${PHOTO_TAG_COLORS[photo.tag]}`}>
                  {photo.label}
                </span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="Eye" size={20} className="text-gray-600" />
                </div>
              </div>
            ))}

            {/* Upload placeholder */}
            <button
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl
                         flex flex-col items-center justify-center gap-1.5
                         text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all"
              onClick={() => toast.info('Функция загрузки фото откроет диалог выбора файла')}
            >
              <Icon name="Plus" size={24} />
              <span className="text-xs">Добавить</span>
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Обязательно: 2 фото «До работ» и 2 фото «После работ».
            Загружено {order.photos.filter(p => p.tag === 'before').length} / 2 «До» ·{' '}
            {order.photos.filter(p => p.tag === 'after').length} / 2 «После»
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 5 — ИИ-ассистент
      ══════════════════════════════════════ */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {/* Briefing */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Icon name="Sparkles" size={16} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-indigo-900">Авто-брифинг перед выездом</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4 text-sm text-gray-800 leading-relaxed space-y-1">
              <p><span className="font-medium">Оборудование:</span> Daikin VRF MDX20G (2022 г.)</p>
              <p><span className="font-medium">Последнее ТО:</span> 3 месяца назад (февраль 2026)</p>
              <p><span className="font-medium">Частая проблема:</span> утечка фреона на штуцере испарителя (3-й секции)</p>
              <p><span className="font-medium">Расход хладагента за год:</span> 1.8 кг R-410A (норма 1.0 кг)</p>
              <p><span className="font-medium">Код ошибки из истории:</span> E4 — защита компрессора от высокого давления</p>
            </div>
          </div>

          {/* AI recommendations */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Icon name="Lightbulb" size={15} className="text-yellow-500" />
              Рекомендации ИИ
            </p>
            <div className="space-y-3">
              {[
                {
                  num: 1,
                  color: 'bg-red-100 text-red-700',
                  text: 'Проверить давление в жидкостном и газовом контурах — вероятно падение из-за утечки. Ожидаемое рабочее давление: 7.5 / 24 бар.',
                },
                {
                  num: 2,
                  color: 'bg-yellow-100 text-yellow-700',
                  text: 'Осмотреть штуцерные соединения секции 3 испарителя с помощью течеискателя. Взять с собой набор уплотнительных колец 1/4" и 3/8".',
                },
                {
                  num: 3,
                  color: 'bg-green-100 text-green-700',
                  text: 'После устранения утечки: опрессовка азотом 20 бар на 30 мин, вакуумирование 500 мкм, дозаправка R-410A до рабочего давления.',
                },
              ].map(rec => (
                <div key={rec.num} className="flex gap-3 items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${rec.color}`}>
                    {rec.num}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Icon name="MessageSquare" size={15} className="text-indigo-500" />
              Задать вопрос ИИ-консультанту
            </p>

            {aiAnswer && (
              <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-900 leading-relaxed">
                <p className="font-medium text-indigo-700 mb-1 flex items-center gap-1.5">
                  <Icon name="Bot" size={14} /> ИИ-ответ
                </p>
                {aiAnswer}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                placeholder="Например: как заменить уплотнительное кольцо на Daikin VRF?"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
              <Button size="sm" onClick={handleAskAI} className="bg-indigo-600 hover:bg-indigo-700">
                <Icon name="Send" size={14} className="mr-1.5" />
                Спросить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 6 — История изменений
      ══════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-5">
            История изменений
            <span className="ml-2 text-xs font-normal text-gray-400">({order.history.length} событий)</span>
          </p>

          <div className="relative pl-8 space-y-5">
            <div className="absolute left-3.5 top-1 bottom-1 w-0.5 bg-gray-100" />

            {order.history.map((ev, idx) => (
              <div key={ev.id} className="relative flex gap-4 items-start">
                {/* Icon bubble */}
                <div className={`absolute -left-4.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ev.color}`}
                  style={{ left: '-2rem' }}>
                  <Icon name={ev.icon} size={15} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-snug">{ev.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{ev.user}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{ev.dt}</span>
                  </div>
                </div>

                {/* Connector dot (last item has no line below) */}
                {idx < order.history.length - 1 && (
                  <div className="absolute left-0 top-8 bottom-0 w-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetail;
