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
  priorityLabel: 'Срочный',
  status: 'IN_PROGRESS' as const,
  statusLabel: 'В работе',
  source: 'EMAIL',

  client: 'ООО «Торговый Центр»',
  contactName: 'Смирнова Е. А.',
  contactPhone: '+7 (495) 321-00-11',
  serviceObject: 'ТЦ «Европа», ул. Садовая, 1',
  address: 'ул. Садовая, 1, Москва',

  engineer: {
    name: 'Петров А. В.',
    initials: 'ПА',
    phone: '+7 (916) 555-77-88',
    avatarColor: 'bg-indigo-100 text-indigo-700',
  },

  scheduledStart: '2026-05-15T14:00:00',
  scheduledEnd: '2026-05-15T17:00:00',

  createdAt: '2026-05-15T08:00:00',
  assignedAt: '2026-05-15T08:22:00',
  acceptedAt: '2026-05-15T09:05:00',
  enRouteAt: '2026-05-15T09:20:00',
  onSiteAt: '2026-05-15T10:00:00',
  inProgressAt: '2026-05-15T10:40:00',
  completedAt: null as string | null,

  sla: {
    ttr: { label: 'TTR (Время реакции)', planned: 120, elapsed: 82, unit: 'мин' },
    tto: { label: 'TTO (Прибытие на объект)', planned: 240, elapsed: 180, unit: 'мин' },
    ttf: { label: 'TTF (Выполнение работ)', planned: 480, elapsed: 230, unit: 'мин' },
  },

  services: [
    { id: 's1', name: 'Диагностика системы кондиционирования', hours: 1.0, rate: 2000, total: 2000 },
    { id: 's2', name: 'Чистка фильтров и теплообменника', hours: 2.0, rate: 1500, total: 3000 },
    { id: 's3', name: 'Дозаправка хладагентом R-410A', hours: 1.0, rate: 2500, total: 2500 },
    { id: 's4', name: 'Профилактическое обслуживание', hours: 3.0, rate: 1800, total: 5400 },
  ],

  materials: [
    { id: 'm1', name: 'Фреон R-410A', qty: 0.5, unit: 'кг', price: 800, total: 400 },
    { id: 'm2', name: 'Фильтр воздушный', qty: 2, unit: 'шт', price: 350, total: 700 },
    { id: 'm3', name: 'Прокладки уплотнительные (набор)', qty: 1, unit: 'набор', price: 120, total: 120 },
  ],

  photos: [
    { id: 'p1', label: 'До работ', tag: 'before' },
    { id: 'p2', label: 'До работ', tag: 'before' },
    { id: 'p3', label: 'До работ', tag: 'before' },
    { id: 'p4', label: 'Дефект', tag: 'defect' },
    { id: 'p5', label: 'Запчасть', tag: 'part' },
    { id: 'p6', label: 'После работ', tag: 'after' },
    { id: 'p7', label: 'После работ', tag: 'after' },
    { id: 'p8', label: 'После работ', tag: 'after' },
  ],

  history: [
    {
      id: 'h1',
      icon: 'FilePlus',
      color: 'text-blue-600 bg-blue-50',
      action: 'Наряд создан',
      user: 'Диспетчер Иванова Н. В.',
      dt: '2026-05-15 08:00',
    },
    {
      id: 'h2',
      icon: 'UserCheck',
      color: 'text-indigo-600 bg-indigo-50',
      action: 'Назначен инженер Петров А. В.',
      user: 'Диспетчер Иванова Н. В.',
      dt: '2026-05-15 08:22',
    },
    {
      id: 'h3',
      icon: 'CheckCircle',
      color: 'text-green-600 bg-green-50',
      action: 'Статус изменён → Принят',
      user: 'Петров А. В.',
      dt: '2026-05-15 09:05',
    },
    {
      id: 'h4',
      icon: 'Navigation',
      color: 'text-orange-500 bg-orange-50',
      action: 'Статус изменён → В пути',
      user: 'Петров А. В.',
      dt: '2026-05-15 09:20',
    },
    {
      id: 'h5',
      icon: 'MapPin',
      color: 'text-purple-600 bg-purple-50',
      action: 'Статус изменён → На месте',
      user: 'Петров А. В.',
      dt: '2026-05-15 10:00',
    },
    {
      id: 'h6',
      icon: 'Package',
      color: 'text-yellow-600 bg-yellow-50',
      action: 'Добавлен материал: Фреон R-410A 0.5 кг',
      user: 'Петров А. В.',
      dt: '2026-05-15 10:35',
    },
    {
      id: 'h7',
      icon: 'Wrench',
      color: 'text-teal-600 bg-teal-50',
      action: 'Статус изменён → В работе',
      user: 'Петров А. В.',
      dt: '2026-05-15 10:40',
    },
    {
      id: 'h8',
      icon: 'FileText',
      color: 'text-gray-600 bg-gray-100',
      action: 'Загружен документ: Акт дефектовки.pdf',
      user: 'Петров А. В.',
      dt: '2026-05-15 11:15',
    },
  ],
};

const SLA_CHART_DATA = [
  { time: '08:00', план: 0, факт: 0 },
  { time: '09:00', план: 60, факт: 82 },
  { time: '10:00', план: 120, факт: 180 },
  { time: '11:00', план: 180, факт: 230 },
  { time: '12:00', план: 240, факт: null },
  { time: '13:00', план: 300, факт: null },
  { time: '14:00', план: 360, факт: null },
  { time: '15:00', план: 480, факт: null },
];

const COMMENTS = [
  {
    id: 'c1',
    author: 'Диспетчер Иванова Н. В.',
    initials: 'ИН',
    avatarColor: 'bg-blue-100 text-blue-700',
    text: 'Клиент сообщает о нарушении холодоснабжения в зале 3А. Приоритет повышен до «Срочный».',
    dt: '2026-05-15 08:05',
  },
  {
    id: 'c2',
    author: 'Петров А. В.',
    initials: 'ПА',
    avatarColor: 'bg-indigo-100 text-indigo-700',
    text: 'Принял наряд. Выезжаю с центрального склада, будут необходимые расходники.',
    dt: '2026-05-15 09:05',
  },
  {
    id: 'c3',
    author: 'Петров А. В.',
    initials: 'ПА',
    avatarColor: 'bg-indigo-100 text-indigo-700',
    text: 'Обнаружена утечка на штуцере испарителя. Дозаправил R-410A, устранил неисправность. Провожу профилактику фильтров.',
    dt: '2026-05-15 10:55',
  },
];

// ─────────────────────────────────────────────
// Helpers & constants
// ─────────────────────────────────────────────

type TabId = 'overview' | 'services' | 'sla' | 'photos' | 'ai' | 'history';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Общая информация', icon: 'ClipboardList' },
  { id: 'services', label: 'Услуги и материалы', icon: 'Wrench' },
  { id: 'sla', label: 'SLA и хронология', icon: 'Clock' },
  { id: 'photos', label: 'Фотоотчёт', icon: 'Camera' },
  { id: 'ai', label: 'ИИ-ассистент', icon: 'Bot' },
  { id: 'history', label: 'История изменений', icon: 'History' },
];

const STATUS_CHANGE_OPTIONS = [
  { value: 'EN_ROUTE', label: 'В пути' },
  { value: 'ON_SITE', label: 'На месте' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'AWAITING_PARTS', label: 'Ожидание запчасти' },
  { value: 'COMPLETED', label: 'Выполнен' },
  { value: 'CANCELLED', label: 'Отменён' },
];

const TIMELINE_STEPS = [
  { key: 'createdAt', label: 'Создан', icon: 'FilePlus' },
  { key: 'assignedAt', label: 'Назначен', icon: 'UserCheck' },
  { key: 'acceptedAt', label: 'Принят', icon: 'CheckCircle' },
  { key: 'enRouteAt', label: 'В пути', icon: 'Navigation' },
  { key: 'onSiteAt', label: 'На месте', icon: 'MapPin' },
  { key: 'inProgressAt', label: 'В работе', icon: 'Wrench' },
] as const;

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

function fmtDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function slaColor(planned: number, elapsed: number) {
  const pct = elapsed / planned;
  if (pct >= 1)
    return { bar: 'bg-red-500', text: 'text-red-600', badge: 'RED' as const };
  if (pct >= 0.75)
    return { bar: 'bg-yellow-400', text: 'text-yellow-600', badge: 'YELLOW' as const };
  return { bar: 'bg-green-500', text: 'text-green-600', badge: 'GREEN' as const };
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

interface Props {
  onBack?: () => void;
}

const WorkOrderDetailFull = ({ onBack }: Props) => {
  const order = MOCK_ORDER;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(COMMENTS);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const totalServices = order.services.reduce((s, x) => s + x.total, 0);
  const totalMaterials = order.materials.reduce((s, x) => s + x.total, 0);
  const vat = Math.round((totalServices + totalMaterials) * 0.2);
  const grandTotal = totalServices + totalMaterials + vat;

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const label =
      STATUS_CHANGE_OPTIONS.find((o) => o.value === e.target.value)?.label ?? e.target.value;
    toast.success(`Статус изменён на «${label}»`);
    e.target.value = '';
  }

  function handleAddComment() {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c${Date.now()}`,
        author: 'Вы',
        initials: 'ВЫ',
        avatarColor: 'bg-gray-100 text-gray-700',
        text: newComment.trim(),
        dt: new Date().toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setNewComment('');
    toast.success('Комментарий добавлен');
  }

  function handleAskAI() {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiAnswer(
        'На основании истории оборудования Daikin VRF MDX20G и текущего симптома ' +
          '(снижение холодопроизводительности, частичная утечка хладагента R-410A) рекомендую: ' +
          '1) проверить и устранить утечку на штуцерных соединениях испарителя; ' +
          '2) провести опрессовку контура азотом 20 бар на 30 мин; ' +
          '3) вакуумировать контур до 500 мкм и дозаправить R-410A до рабочего давления 7.5 / 24 бар.',
      );
      setAiLoading(false);
      toast.success('Ответ получен');
    }, 900);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* ── Hero header ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mt-1"
              >
                <Icon name="ArrowLeft" size={16} />
                Назад
              </button>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{order.id}</h2>
                <Badge variant="outline" className="text-xs font-medium">
                  {order.type}
                </Badge>
                <Badge variant="destructive" className="text-xs font-medium">
                  {order.priorityLabel}
                </Badge>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-xs font-medium">
                  {order.statusLabel}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {order.client} &middot; {order.serviceObject}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Icon name="Calendar" size={11} />
                Плановое время: 15 мая 14:00–17:00
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                defaultValue=""
                onChange={handleStatusChange}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="" disabled>
                  Изменить статус
                </option>
                {STATUS_CHANGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Icon
                name="ChevronDown"
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Открыт редактор наряда')}
            >
              <Icon name="Pencil" size={14} className="mr-1.5" />
              Редактировать
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Отправка на печать...')}
            >
              <Icon name="Printer" size={14} className="mr-1.5" />
              Распечатать
            </Button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          {/* Client */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Клиент
            </p>
            <p className="text-sm font-semibold text-gray-900">{order.client}</p>
            <p className="text-xs text-gray-500 mt-0.5">{order.contactName}</p>
            <p className="text-xs text-gray-500">{order.contactPhone}</p>
          </div>
          {/* Object */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Объект
            </p>
            <p className="text-sm font-semibold text-gray-900">{order.serviceObject}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Icon name="MapPin" size={11} />
              {order.address}
            </p>
          </div>
          {/* Engineer */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Инженер
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${order.engineer.avatarColor}`}
              >
                {order.engineer.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{order.engineer.name}</p>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => toast.info(`Звонок: ${order.engineer.phone}`)}
                >
                  {order.engineer.phone}
                </button>
              </div>
            </div>
          </div>
          {/* Schedule */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Плановое время
            </p>
            <p className="text-sm font-semibold text-gray-900">
              15 мая 2026
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {fmtTime(order.scheduledStart)} — {fmtTime(order.scheduledEnd)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon name={tab.icon} size={14} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5">
          {/* ══════════════════════════════════════
              TAB 1 — Общая информация
          ══════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Parameters + Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parameters */}
                <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/40">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Параметры наряда
                  </p>
                  {[
                    { label: 'Номер', value: order.id },
                    { label: 'Тип', value: order.type },
                    { label: 'Статус', value: order.statusLabel },
                    { label: 'Приоритет', value: order.priorityLabel },
                    { label: 'Источник', value: 'E-mail' },
                    { label: 'Объект', value: order.serviceObject },
                    { label: 'Адрес', value: order.address },
                    {
                      label: 'Создан',
                      value: fmtDateTime(order.createdAt),
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex gap-4 items-start">
                      <span className="text-xs text-gray-500 w-24 shrink-0 pt-0.5">
                        {row.label}
                      </span>
                      <span className="text-sm text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 bg-gray-50/40">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Задание / описание
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Клиент сообщает об отсутствии охлаждения в торговом зале №3.
                    Оборудование: Daikin VRF MDX20G, 4 внутренних блока, 2022 г. в.
                    По предварительной диагностике — утечка хладагента R-410A.
                    Необходимо: диагностика, устранение утечки, дозаправка хладагента,
                    опрессовка контура, профилактика фильтров.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {['Диагностика', 'R-410A', 'Утечка', 'VRF', 'Daikin'].map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments section */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Icon name="MessageSquare" size={15} className="text-gray-500" />
                    Комментарии и переписка
                    <span className="text-gray-400 font-normal text-xs">
                      ({comments.length})
                    </span>
                  </p>
                </div>

                {/* Comment history */}
                <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${c.avatarColor}`}
                      >
                        {c.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-800">{c.author}</span>
                          <span className="text-[11px] text-gray-400">{c.dt}</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 leading-relaxed">
                          {c.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New comment input */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/40">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Добавить комментарий..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={handleAddComment}>
                      <Icon name="Send" size={13} className="mr-1.5" />
                      Отправить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 2 — Услуги и материалы
          ══════════════════════════════════════ */}
          {activeTab === 'services' && (
            <div className="space-y-5">
              {/* Services table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Icon name="Wrench" size={14} className="text-gray-500" />
                    Услуги
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info('Добавление услуги')}
                  >
                    <Icon name="Plus" size={13} className="mr-1" />
                    Добавить
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs">
                      <tr>
                        <th className="text-left px-5 py-2.5 font-medium">Услуга</th>
                        <th className="text-center px-4 py-2.5 font-medium">Часы</th>
                        <th className="text-right px-4 py-2.5 font-medium">Ставка, ₽/ч</th>
                        <th className="text-right px-5 py-2.5 font-medium">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {order.services.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-gray-900">{s.name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{s.hours}</td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {fmtRub(s.rate)}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-gray-900">
                            {fmtRub(s.total)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-semibold text-sm">
                        <td colSpan={3} className="px-5 py-3 text-gray-700">
                          Итого услуги
                        </td>
                        <td className="px-5 py-3 text-right text-blue-700">
                          {fmtRub(totalServices)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Materials table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Icon name="Package" size={14} className="text-gray-500" />
                    Материалы
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info('Добавление материала')}
                  >
                    <Icon name="Plus" size={13} className="mr-1" />
                    Добавить
                  </Button>
                </div>
                <div className="overflow-x-auto">
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
                      {order.materials.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-gray-900">{m.name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{m.qty}</td>
                          <td className="px-4 py-3 text-center text-gray-500">{m.unit}</td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {fmtRub(m.price)}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-gray-900">
                            {fmtRub(m.total)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-green-50 font-semibold text-sm">
                        <td colSpan={4} className="px-5 py-3 text-gray-700">
                          Итого материалы
                        </td>
                        <td className="px-5 py-3 text-right text-green-700">
                          {fmtRub(totalMaterials)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grand total */}
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 mb-4">Итого к оплате</p>
                <div className="space-y-2 text-sm max-w-xs ml-auto">
                  <div className="flex justify-between text-gray-600">
                    <span>Услуги</span>
                    <span className="font-medium">{fmtRub(totalServices)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Материалы</span>
                    <span className="font-medium">{fmtRub(totalMaterials)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 border-t border-dashed border-gray-200 pt-2">
                    <span>НДС 20%</span>
                    <span>{fmtRub(vat)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-gray-900 border-t-2 border-gray-300 pt-2">
                    <span>ИТОГО</span>
                    <span className="text-blue-700">{fmtRub(grandTotal)}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button variant="outline" size="sm" onClick={() => toast.info('Формирование счёта...')}>
                    <Icon name="FileText" size={13} className="mr-1.5" />
                    Создать счёт
                  </Button>
                  <Button size="sm" onClick={() => toast.info('Формирование акта...')}>
                    <Icon name="FileCheck" size={13} className="mr-1.5" />
                    Создать акт
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 3 — SLA и хронология
          ══════════════════════════════════════ */}
          {activeTab === 'sla' && (
            <div className="space-y-5">
              {/* SLA bars */}
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 mb-5">Метрики SLA</p>
                <div className="space-y-6">
                  {Object.entries(order.sla).map(([key, sla]) => {
                    const { bar, text, badge } = slaColor(sla.planned, sla.elapsed);
                    const pct = Math.min((sla.elapsed / sla.planned) * 100, 100);
                    const remaining = Math.max(sla.planned - sla.elapsed, 0);
                    const badgeColors: Record<string, string> = {
                      GREEN: 'bg-green-100 text-green-700 border-green-200',
                      YELLOW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                      RED: 'bg-red-100 text-red-700 border-red-200',
                    };
                    const badgeLabels: Record<string, string> = {
                      GREEN: 'В норме',
                      YELLOW: 'Внимание',
                      RED: 'Нарушен',
                    };
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{sla.label}</span>
                            <span
                              className={`text-[11px] font-semibold border px-2 py-0.5 rounded-full ${badgeColors[badge]}`}
                            >
                              {badgeLabels[badge]}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-semibold ${text}`}>
                              {sla.elapsed} / {sla.planned} {sla.unit}
                            </span>
                            {remaining > 0 && (
                              <span className="text-xs text-gray-400 ml-2">
                                осталось {remaining} {sla.unit}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all ${bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                          <span>0 {sla.unit}</span>
                          <span>{Math.round(pct)}% использовано</span>
                          <span>{sla.planned} {sla.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vertical timeline */}
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 mb-5">Хронология статусов</p>
                <div className="relative pl-8 space-y-0">
                  {TIMELINE_STEPS.map((step, i) => {
                    const ts = order[step.key as keyof typeof order] as string | null;
                    const isLast = i === TIMELINE_STEPS.length - 1;
                    return (
                      <div key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Vertical line */}
                        {!isLast && (
                          <div
                            className={`absolute left-[-20px] top-8 bottom-0 w-0.5 ${
                              ts ? 'bg-green-300' : 'bg-gray-200'
                            }`}
                          />
                        )}
                        {/* Icon bubble */}
                        <div
                          className={`absolute left-[-28px] w-8 h-8 rounded-full flex items-center justify-center shrink-0
                            ${
                              ts
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                            }`}
                        >
                          <Icon name={step.icon} size={14} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                ts ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </span>
                            {ts ? (
                              <span className="text-xs text-gray-500">{fmtDateTime(ts)}</span>
                            ) : (
                              <span className="text-xs text-gray-300 italic">ожидается</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart */}
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 mb-4">
                  График: плановое vs фактическое время выполнения
                </p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart
                    data={SLA_CHART_DATA}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" мин" width={55} />
                    <Tooltip formatter={(v: number) => `${v} мин`} />
                    <Line
                      type="monotone"
                      dataKey="план"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#6366f1' }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="факт"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={{ r: 4, fill: '#f59e0b' }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-6 justify-center mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-5 h-0.5 bg-indigo-500 rounded" />
                    По плану
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-5 h-0.5 bg-yellow-500 rounded border-dashed" />
                    Фактически
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 4 — Фотоотчёт
          ══════════════════════════════════════ */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Фотоотчёт
                    <span className="text-gray-400 font-normal ml-1">
                      ({order.photos.length} фото)
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    До работ: {order.photos.filter((p) => p.tag === 'before').length} ·
                    После работ: {order.photos.filter((p) => p.tag === 'after').length} ·
                    Дефект: {order.photos.filter((p) => p.tag === 'defect').length} ·
                    Запчасть: {order.photos.filter((p) => p.tag === 'part').length}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => toast.success('Откроется диалог выбора файла')}
                >
                  <Icon name="Upload" size={13} className="mr-1.5" />
                  Загрузить фото
                </Button>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {order.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square bg-gray-100 rounded-xl border border-gray-200
                               flex flex-col items-center justify-center cursor-pointer
                               hover:border-gray-400 hover:shadow-md transition-all overflow-hidden"
                    onClick={() => toast.info(`Просмотр: ${photo.label}`)}
                  >
                    {/* Placeholder background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                    <Icon
                      name="Camera"
                      size={32}
                      className="relative text-gray-300 group-hover:text-gray-400 transition-colors"
                    />
                    {/* Tag label */}
                    <span
                      className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PHOTO_TAG_COLORS[photo.tag]}`}
                    >
                      {photo.label}
                    </span>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <div className="bg-white/90 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <Icon name="Eye" size={13} />
                        Просмотр
                      </div>
                    </div>
                  </div>
                ))}

                {/* Upload placeholder */}
                <button
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-xl
                             flex flex-col items-center justify-center gap-2
                             text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all"
                  onClick={() => toast.success('Откроется диалог выбора файла')}
                >
                  <Icon name="Plus" size={24} />
                  <span className="text-xs font-medium">Добавить</span>
                </button>
              </div>

              <p className="text-xs text-gray-400">
                Обязательно: минимум 2 фото «До работ» и 2 фото «После работ».
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 5 — ИИ-ассистент
          ══════════════════════════════════════ */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              {/* AI briefing */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon name="Sparkles" size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">Авто-брифинг перед выездом</p>
                    <p className="text-xs text-indigo-500">Сформирован ИИ на основе истории оборудования</p>
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-4 text-sm text-gray-800 leading-relaxed space-y-2 shadow-sm">
                  {[
                    { label: 'Оборудование', value: 'Daikin VRF MDX20G (2022 г. в.)' },
                    { label: 'Последнее ТО', value: '3 месяца назад (февраль 2026)' },
                    { label: 'Частая проблема', value: 'Утечка фреона на штуцере испарителя (секция 2)' },
                    { label: 'Расход хладагента', value: '1.8 кг R-410A за год (норма 1.0 кг, превышение 80%)' },
                    { label: 'Код ошибки', value: 'E4 — защита компрессора от высокого давления нагнетания' },
                  ].map((row) => (
                    <div key={row.label} className="flex gap-2">
                      <span className="font-semibold text-gray-600 shrink-0 w-40">{row.label}:</span>
                      <span className="text-gray-800">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI recommendations */}
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Icon name="Lightbulb" size={15} className="text-yellow-500" />
                  Рекомендации ИИ
                </p>
                <div className="space-y-3">
                  {[
                    {
                      num: 1,
                      icon: 'AlertTriangle',
                      color: 'bg-red-100 text-red-700 border-red-200',
                      iconColor: 'text-red-600',
                      text: 'Проверить давление в жидкостном и газовом контурах. Ожидаемое рабочее давление: 7.5 / 24 бар. Вероятно значительное падение из-за утечки.',
                    },
                    {
                      num: 2,
                      icon: 'Search',
                      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                      iconColor: 'text-yellow-600',
                      text: 'Осмотреть штуцерные соединения секции 2 испарителя с помощью электронного течеискателя. Взять с собой набор уплотнительных колец 1/4" и 3/8".',
                    },
                    {
                      num: 3,
                      icon: 'CheckCircle',
                      color: 'bg-green-100 text-green-700 border-green-200',
                      iconColor: 'text-green-600',
                      text: 'После устранения утечки: опрессовка азотом 20 бар на 30 мин → вакуумирование 500 мкм → дозаправка R-410A до рабочего давления.',
                    },
                  ].map((rec) => (
                    <div
                      key={rec.num}
                      className={`flex gap-3 items-start border rounded-xl p-3.5 ${rec.color}`}
                    >
                      <div className={`shrink-0 mt-0.5 ${rec.iconColor}`}>
                        <Icon name={rec.icon} size={17} />
                      </div>
                      <p className="text-sm leading-relaxed">{rec.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI chat */}
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Icon name="MessageSquare" size={15} className="text-indigo-500" />
                  Задать вопрос ИИ-консультанту
                </p>

                {aiAnswer && (
                  <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900 leading-relaxed">
                    <p className="font-semibold text-indigo-700 mb-2 flex items-center gap-1.5">
                      <Icon name="Bot" size={14} />
                      ИИ-ответ
                    </p>
                    {aiAnswer}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                    placeholder="Например: как диагностировать утечку на Daikin VRF MDX20G?"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleAskAI}
                    disabled={aiLoading || !aiQuestion.trim()}
                    size="sm"
                  >
                    {aiLoading ? (
                      <>
                        <Icon name="Loader" size={13} className="mr-1.5 animate-spin" />
                        Думаю...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={13} className="mr-1.5" />
                        Спросить ИИ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 6 — История изменений
          ══════════════════════════════════════ */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  История изменений
                  <span className="text-gray-400 font-normal ml-1">
                    ({order.history.length} событий)
                  </span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Экспорт истории...')}
                >
                  <Icon name="Download" size={13} className="mr-1.5" />
                  Экспортировать
                </Button>
              </div>

              {/* History timeline */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="relative pl-10 space-y-0">
                  {order.history.map((event, i) => {
                    const isLast = i === order.history.length - 1;
                    return (
                      <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Connector line */}
                        {!isLast && (
                          <div className="absolute left-[-22px] top-9 bottom-0 w-0.5 bg-gray-200" />
                        )}
                        {/* Icon */}
                        <div
                          className={`absolute left-[-30px] w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${event.color}`}
                        >
                          <Icon name={event.icon} size={15} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{event.action}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Icon name="User" size={11} />
                              {event.user}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Icon name="Clock" size={11} />
                              {event.dt}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetailFull;
