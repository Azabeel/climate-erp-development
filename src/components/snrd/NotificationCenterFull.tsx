import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifCategory = 'SLA' | 'Задачи' | 'Система' | 'Закупки' | 'Финансы';
type Priority = 'critical' | 'urgent' | 'info';
type DayGroup = 'today' | 'yesterday' | 'week';
type DeliveryFreq = 'instant' | 'hourly' | 'never';

interface Notification {
  id: string;
  category: NotifCategory;
  icon: string;
  iconColor: string;
  title: string;
  text: string;
  datetime: string;
  dayGroup: DayGroup;
  priority: Priority;
  unread: boolean;
}

interface ChannelSetting {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
}

interface TypeSetting {
  key: NotifCategory;
  label: string;
  freq: DeliveryFreq;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  // Today — SLA
  {
    id: 'n01',
    category: 'SLA',
    icon: 'AlertTriangle',
    iconColor: 'text-red-600',
    title: 'SLA: критическое нарушение',
    text: 'Наряд WO-2026-001831 — SLA нарушен. Клиент: ООО «АркЛогистик».',
    datetime: '10:03',
    dayGroup: 'today',
    priority: 'critical',
    unread: true,
  },
  {
    id: 'n02',
    category: 'SLA',
    icon: 'Clock',
    iconColor: 'text-orange-500',
    title: 'До нарушения SLA 45 минут',
    text: 'Наряд WO-2026-001847 — TTR истекает в 11:00. Инженер: Петров А.',
    datetime: '10:15',
    dayGroup: 'today',
    priority: 'urgent',
    unread: true,
  },
  {
    id: 'n03',
    category: 'SLA',
    icon: 'Clock',
    iconColor: 'text-yellow-500',
    title: 'До нарушения SLA 2 часа',
    text: 'Наряд WO-2026-001852 — TTF истекает в 12:30. Ожидает запчасти.',
    datetime: '10:31',
    dayGroup: 'today',
    priority: 'urgent',
    unread: true,
  },
  // Today — Tasks
  {
    id: 'n04',
    category: 'Задачи',
    icon: 'Bell',
    iconColor: 'text-orange-500',
    title: 'Напоминание: звонок клиенту',
    text: 'Позвонить клиенту Иванову И.И. по вопросу согласования даты ТО.',
    datetime: '09:00',
    dayGroup: 'today',
    priority: 'urgent',
    unread: true,
  },
  {
    id: 'n05',
    category: 'Задачи',
    icon: 'CheckSquare',
    iconColor: 'text-blue-500',
    title: 'Задача: подготовить КП',
    text: 'Подготовить коммерческое предложение для ООО «СнежКом» до 14:00.',
    datetime: '09:45',
    dayGroup: 'today',
    priority: 'urgent',
    unread: false,
  },
  {
    id: 'n06',
    category: 'Задачи',
    icon: 'UserCheck',
    iconColor: 'text-purple-500',
    title: 'Назначить инженера на наряд',
    text: 'Наряд WO-2026-001860 ожидает назначения более 30 минут.',
    datetime: '10:05',
    dayGroup: 'today',
    priority: 'urgent',
    unread: true,
  },
  // Today — Purchases
  { id: 'n07', category: 'Закупки', icon: 'PackageCheck', iconColor: 'text-green-600',
    title: 'ЗИП получен на склад', text: 'ЗИП для наряда WO-001823 получен. Фильтр дренажный Daikin — 2 шт.',
    datetime: '10:50', dayGroup: 'today', priority: 'info', unread: false },
  { id: 'n08', category: 'Закупки', icon: 'Truck', iconColor: 'text-blue-500',
    title: 'Отправка заказа поставщиком', text: '«КлиматТех» отправил заказ №ZAK-2026-0412. Трек: CDEK-881234.',
    datetime: '11:10', dayGroup: 'today', priority: 'info', unread: false },
  // Today — Finance
  {
    id: 'n09',
    category: 'Финансы',
    icon: 'CreditCard',
    iconColor: 'text-green-600',
    title: 'Счёт оплачен',
    text: 'Счёт №1023 оплачен клиентом ООО «Мегамол». Сумма: 47 800 ₽.',
    datetime: '11:32',
    dayGroup: 'today',
    priority: 'info',
    unread: true,
  },
  {
    id: 'n10',
    category: 'Финансы',
    icon: 'TrendingUp',
    iconColor: 'text-emerald-500',
    title: 'Маржа наряда выше нормы',
    text: 'Наряд WO-2026-001800: маржинальность 62%. Норма: 35%.',
    datetime: '11:45',
    dayGroup: 'today',
    priority: 'info',
    unread: false,
  },
  // Today — System
  {
    id: 'n11',
    category: 'Система',
    icon: 'RefreshCw',
    iconColor: 'text-blue-500',
    title: 'Обновление системы запланировано',
    text: 'Плановое обновление v4.2.1 сегодня в 23:00. Простой ~15 мин.',
    datetime: '08:00',
    dayGroup: 'today',
    priority: 'info',
    unread: false,
  },
  // Yesterday — SLA
  {
    id: 'n12',
    category: 'SLA',
    icon: 'AlertTriangle',
    iconColor: 'text-red-600',
    title: 'SLA нарушен — WO-2026-001819',
    text: 'Клиент: ЗАО «АлтайХолод». TTR превышен на 1ч 20мин.',
    datetime: 'Вчера 17:40',
    dayGroup: 'yesterday',
    priority: 'critical',
    unread: false,
  },
  {
    id: 'n13',
    category: 'SLA',
    icon: 'CheckCircle',
    iconColor: 'text-green-500',
    title: 'SLA восстановлен',
    text: 'Наряд WO-2026-001815 закрыт. SLA соблюдён. TTF: 3ч 45мин / 4ч.',
    datetime: 'Вчера 15:20',
    dayGroup: 'yesterday',
    priority: 'info',
    unread: false,
  },
  // Yesterday — Tasks
  {
    id: 'n14',
    category: 'Задачи',
    icon: 'Bell',
    iconColor: 'text-orange-500',
    title: 'Задача просрочена',
    text: 'Задача «Отправить акт клиенту» просрочена на 1 день.',
    datetime: 'Вчера 18:00',
    dayGroup: 'yesterday',
    priority: 'urgent',
    unread: false,
  },
  // Yesterday — Finance
  {
    id: 'n15',
    category: 'Финансы',
    icon: 'FileText',
    iconColor: 'text-blue-500',
    title: 'Акт выполненных работ подписан',
    text: 'Акт №АКТ-2026-0398 подписан ЭЦП клиентом ООО «СтройКлимат».',
    datetime: 'Вчера 14:10',
    dayGroup: 'yesterday',
    priority: 'info',
    unread: false,
  },
  // Yesterday — Purchases
  {
    id: 'n16',
    category: 'Закупки',
    icon: 'AlertCircle',
    iconColor: 'text-red-500',
    title: 'Запчасть задерживается',
    text: 'Компрессор Mitsubishi для WO-001801 задержан поставщиком на 3 дня.',
    datetime: 'Вчера 13:00',
    dayGroup: 'yesterday',
    priority: 'urgent',
    unread: false,
  },
  // Yesterday — System
  {
    id: 'n17',
    category: 'Система',
    icon: 'Shield',
    iconColor: 'text-purple-500',
    title: 'Новый пользователь добавлен',
    text: 'Добавлен инженер Смирнов К.А. Роль: Старший инженер.',
    datetime: 'Вчера 10:00',
    dayGroup: 'yesterday',
    priority: 'info',
    unread: false,
  },
  // This week — SLA
  { id: 'n18', category: 'SLA', icon: 'Activity', iconColor: 'text-yellow-500',
    title: 'Рейтинг SLA снизился', text: 'Выполнение SLA за неделю: 87.3% (норма 95%). Проверьте наряды.',
    datetime: '15.05 09:00', dayGroup: 'week', priority: 'urgent', unread: false },
  // This week — Tasks
  { id: 'n19', category: 'Задачи', icon: 'Calendar', iconColor: 'text-blue-500',
    title: 'ТО по плану — 12 объектов', text: 'На следующей неделе запланировано ТО 12 объектов.',
    datetime: '14.05 14:30', dayGroup: 'week', priority: 'info', unread: false },
  { id: 'n20', category: 'Задачи', icon: 'Star', iconColor: 'text-yellow-500',
    title: 'Новая оценка от клиента', text: 'ООО «АркЛогистик» поставил оценку 5★ за WO-2026-001788.',
    datetime: '14.05 11:15', dayGroup: 'week', priority: 'info', unread: false },
  // This week — Finance
  { id: 'n21', category: 'Финансы', icon: 'TrendingDown', iconColor: 'text-red-500',
    title: 'Дебиторская задолженность', text: 'ООО «ТехноХолод» — просрочка счёта №1007. 18 дней, 83 200 ₽.',
    datetime: '13.05 16:00', dayGroup: 'week', priority: 'urgent', unread: false },
  { id: 'n22', category: 'Финансы', icon: 'DollarSign', iconColor: 'text-green-600',
    title: 'Выручка за неделю', text: 'Недельная выручка: 1 240 800 ₽. Рост +14%.',
    datetime: '12.05 09:00', dayGroup: 'week', priority: 'info', unread: false },
  // This week — Purchases
  {
    id: 'n23',
    category: 'Закупки',
    icon: 'ShoppingCart',
    iconColor: 'text-blue-500',
    title: 'Заявка на закупку создана',
    text: '8 позиций ЗИП по наряду WO-2026-001840 переданы на закупку.',
    datetime: '13.05 12:00',
    dayGroup: 'week',
    priority: 'info',
    unread: false,
  },
  // This week — System
  { id: 'n24', category: 'Система', icon: 'Database', iconColor: 'text-gray-500',
    title: 'Резервная копия создана', text: 'Автоматическая резервная копия БД: 4.2 ГБ.',
    datetime: '12.05 03:00', dayGroup: 'week', priority: 'info', unread: false },
  { id: 'n25', category: 'Система', icon: 'Wifi', iconColor: 'text-orange-500',
    title: 'Интеграция 1С недоступна', text: 'Интеграция с 1С:УНФ была недоступна 12 мин. Восстановлена.',
    datetime: '11.05 22:14', dayGroup: 'week', priority: 'urgent', unread: false },
];

const INITIAL_CHANNELS: ChannelSetting[] = [
  { key: 'email', label: 'Email', icon: 'Mail', enabled: true },
  { key: 'telegram', label: 'Telegram', icon: 'Send', enabled: true },
  { key: 'sms', label: 'SMS', icon: 'MessageSquare', enabled: false },
  { key: 'push', label: 'Push', icon: 'Bell', enabled: true },
];

const INITIAL_TYPE_SETTINGS: TypeSetting[] = [
  { key: 'SLA', label: 'SLA', freq: 'instant' },
  { key: 'Задачи', label: 'Задачи', freq: 'instant' },
  { key: 'Закупки', label: 'Закупки', freq: 'hourly' },
  { key: 'Финансы', label: 'Финансы', freq: 'hourly' },
  { key: 'Система', label: 'Система', freq: 'never' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_BADGE: Record<Priority, { label: string; variant: string }> = {
  critical: { label: 'Критично', variant: 'bg-red-100 text-red-700 border-red-200' },
  urgent: { label: 'Срочно', variant: 'bg-orange-100 text-orange-700 border-orange-200' },
  info: { label: 'Информация', variant: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const CATEGORY_TAB_MAP: Record<string, NotifCategory | null> = {
  Все: null,
  SLA: 'SLA',
  Задачи: 'Задачи',
  Система: 'Система',
};

const DAY_GROUP_LABEL: Record<DayGroup, string> = {
  today: 'Сегодня',
  yesterday: 'Вчера',
  week: 'На этой неделе',
};

const FREQ_OPTIONS: { value: DeliveryFreq; label: string }[] = [
  { value: 'instant', label: 'Немедленно' },
  { value: 'hourly', label: 'Раз в час' },
  { value: 'never', label: 'Не отправлять' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, variant } = PRIORITY_BADGE[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variant}`}>
      {label}
    </span>
  );
}

function DayGroupDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

interface NotifCardProps {
  notif: Notification;
  onOpen: (id: string) => void;
  onRead: (id: string) => void;
}

function NotifCard({ notif, onOpen, onRead }: NotifCardProps) {
  return (
    <div
      className={`relative flex gap-3 rounded-lg p-3 mb-2 border transition-colors
        ${notif.unread ? 'bg-blue-50/60 border-blue-100' : 'bg-white border-gray-100'}
      `}
    >
      {notif.unread && (
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-blue-500" />
      )}
      <div className={`mt-0.5 flex-shrink-0 ${notif.iconColor}`}>
        <Icon name={notif.icon as any} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className={`text-sm font-medium leading-snug ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
            {notif.title}
          </span>
          <PriorityBadge priority={notif.priority} />
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.text}</p>
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-xs text-gray-400">{notif.datetime}</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs"
              onClick={() => onOpen(notif.id)}
            >
              Открыть
            </Button>
            {notif.unread && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => onRead(notif.id)}
              >
                <Icon name="Check" size={12} className="mr-1" />
                Прочитано
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationCenterFull() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [channels, setChannels] = useState<ChannelSetting[]>(INITIAL_CHANNELS);
  const [typeSettings, setTypeSettings] = useState<TypeSetting[]>(INITIAL_TYPE_SETTINGS);
  const [activeTab, setActiveTab] = useState('Все');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  // ─── Derived ────────────────────────────────────────────────────────────────

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => n.unread).length;
  const criticalCount = notifications.filter((n) => n.priority === 'critical').length;
  const taskCount = notifications.filter((n) => n.category === 'Задачи').length;

  const filteredNotifications = notifications.filter((n) => {
    const tabCategory = CATEGORY_TAB_MAP[activeTab];
    if (tabCategory && n.category !== tabCategory) return false;
    if (filterType !== 'all' && n.category !== filterType) return false;
    if (filterPeriod !== 'all' && n.dayGroup !== filterPeriod) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.text.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const groupedNotifications = (['today', 'yesterday', 'week'] as DayGroup[]).reduce<
    Record<DayGroup, Notification[]>
  >(
    (acc, group) => {
      acc[group] = filteredNotifications.filter((n) => n.dayGroup === group);
      return acc;
    },
    { today: [], yesterday: [], week: [] },
  );

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('Все уведомления отмечены как прочитанные');
  }

  function handleOpen(id: string) {
    const notif = notifications.find((n) => n.id === id);
    toast.info(`Открываем: ${notif?.title ?? id}`);
  }

  function handleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    toast.success('Уведомление отмечено как прочитанное');
  }

  function handleToggleChannel(key: string) {
    setChannels((prev) =>
      prev.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c)),
    );
  }

  function handleFreqChange(key: NotifCategory, freq: DeliveryFreq) {
    setTypeSettings((prev) =>
      prev.map((t) => (t.key === key ? { ...t, freq } : t)),
    );
  }

  function handleSaveSettings() {
    toast.success('Настройки уведомлений сохранены');
  }

  // ─── KPI cards ──────────────────────────────────────────────────────────────

  const kpiCards = [
    { label: 'Всего', value: totalCount, icon: 'Bell', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Непрочитанных', value: unreadCount, icon: 'MailOpen', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Критических', value: criticalCount, icon: 'AlertTriangle', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Задач', value: taskCount, icon: 'CheckSquare', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  // ─── Notification list renderer ──────────────────────────────────────────────

  function renderGroup(group: DayGroup) {
    const items = groupedNotifications[group];
    if (!items.length) return null;
    return (
      <div key={group}>
        <DayGroupDivider label={DAY_GROUP_LABEL[group]} />
        {items.map((notif) => (
          <NotifCard key={notif.id} notif={notif} onOpen={handleOpen} onRead={handleRead} />
        ))}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Центр уведомлений</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Управление уведомлениями и настройка каналов доставки
          </p>
        </div>
        <Button
          variant="outline"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <Icon name="CheckCheck" size={16} className="mr-2" />
          Отметить все прочитанными
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${kpi.bg} ${kpi.color} rounded-lg p-2.5`}>
                <Icon name={kpi.icon as any} size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: notification list */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Icon
                  name="Search"
                  size={15}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Поиск по уведомлениям..."
                  className="pl-8 h-8 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 w-[150px] text-sm">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="SLA">SLA</SelectItem>
                  <SelectItem value="Задачи">Задачи</SelectItem>
                  <SelectItem value="Закупки">Закупки</SelectItem>
                  <SelectItem value="Финансы">Финансы</SelectItem>
                  <SelectItem value="Система">Система</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="h-8 w-[160px] text-sm">
                  <SelectValue placeholder="Период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Весь период</SelectItem>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="yesterday">Вчера</SelectItem>
                  <SelectItem value="week">На этой неделе</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tabs + list */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-0 pt-4 px-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-8">
                  {['Все', 'SLA', 'Задачи', 'Система'].map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="text-xs px-3">
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  <ScrollArea className="h-[580px] px-4 pt-2 pb-4">
                    {filteredNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Icon name="BellOff" size={40} className="mb-3 opacity-40" />
                        <p className="text-sm">Уведомлений не найдено</p>
                      </div>
                    ) : (
                      <>
                        {renderGroup('today')}
                        {renderGroup('yesterday')}
                        {renderGroup('week')}
                      </>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>

        {/* Right: settings */}
        <div className="space-y-4">
          {/* Channels */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon name="Radio" size={16} className="text-blue-500" />
                Каналы доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {channels.map((ch) => (
                <div key={ch.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon name={ch.icon as any} size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{ch.label}</span>
                  </div>
                  <Switch
                    checked={ch.enabled}
                    onCheckedChange={() => handleToggleChannel(ch.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Types frequency */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon name="SlidersHorizontal" size={16} className="text-purple-500" />
                Типы уведомлений
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {typeSettings.map((ts) => (
                <div key={ts.key} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-700 flex-shrink-0">{ts.label}</span>
                  <Select
                    value={ts.freq}
                    onValueChange={(v) => handleFreqChange(ts.key, v as DeliveryFreq)}
                  >
                    <SelectTrigger className="h-7 w-[145px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQ_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button
                className="w-full mt-2 h-8 text-sm"
                onClick={handleSaveSettings}
              >
                <Icon name="Save" size={14} className="mr-2" />
                Сохранить
              </Button>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon name="BarChart2" size={16} className="text-green-500" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {(
                [
                  ['SLA', 'text-red-500'],
                  ['Задачи', 'text-orange-500'],
                  ['Закупки', 'text-green-500'],
                  ['Финансы', 'text-emerald-500'],
                  ['Система', 'text-blue-500'],
                ] as [NotifCategory, string][]
              ).map(([cat, color]) => {
                const count = notifications.filter((n) => n.category === cat).length;
                const pct = Math.round((count / totalCount) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{cat}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
