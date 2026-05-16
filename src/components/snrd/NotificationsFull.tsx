import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = 'SLA' | 'Наряды' | 'Склад' | 'Финансы' | 'Система' | 'HR';

type FilterTab = 'Все' | NotifType;

interface Notification {
  id: string;
  type: NotifType;
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  relativeTime: string;
  unread: boolean;
}

type Channel = 'Push' | 'Email' | 'Telegram' | 'SMS';

type ChannelSettings = Record<Channel, Record<NotifType, boolean>>;

// ─── Constants ─────────────────────────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = [
  'Все',
  'SLA',
  'Наряды',
  'Склад',
  'Финансы',
  'Система',
  'HR',
];

const TYPE_META: Record<
  NotifType,
  { icon: string; iconColor: string; bgColor: string }
> = {
  SLA:     { icon: 'AlertTriangle', iconColor: 'text-red-600',    bgColor: 'bg-red-100' },
  Наряды:  { icon: 'ClipboardList', iconColor: 'text-blue-600',   bgColor: 'bg-blue-100' },
  Склад:   { icon: 'Package',       iconColor: 'text-orange-600', bgColor: 'bg-orange-100' },
  Финансы: { icon: 'DollarSign',    iconColor: 'text-purple-600', bgColor: 'bg-purple-100' },
  Система: { icon: 'Settings',      iconColor: 'text-gray-600',   bgColor: 'bg-gray-100' },
  HR:      { icon: 'UserCheck',     iconColor: 'text-pink-600',   bgColor: 'bg-pink-100' },
};

const CHANNELS: Channel[] = ['Push', 'Email', 'Telegram', 'SMS'];
const NOTIF_TYPES: NotifType[] = ['SLA', 'Наряды', 'Склад', 'Финансы', 'Система'];

const mkNotif = (
  id: string,
  type: NotifType,
  title: string,
  description: string,
  relativeTime: string,
  unread: boolean,
): Notification => ({
  id,
  type,
  ...TYPE_META[type],
  title,
  description,
  relativeTime,
  unread,
});

const INITIAL_NOTIFICATIONS: Notification[] = [
  mkNotif('n1',  'SLA',     'SLA Alert: TTF нарушен',              'WO-2026-000415 нарушает TTF, осталось 15 мин',                       '2 мин назад',   true),
  mkNotif('n2',  'SLA',     'SLA предупреждение',                  'WO-2026-000408 — до истечения TTR 45 мин',                           '8 мин назад',   true),
  mkNotif('n3',  'Наряды',  'Наряд выполнен',                      'WO-2026-000413 закрыт, оценка клиента 5/5',                          '12 мин назад',  true),
  mkNotif('n4',  'Наряды',  'Новая заявка',                        'Поступила заявка от ТЦ Европа, кондиционер Daikin VRV',               '18 мин назад',  true),
  mkNotif('n5',  'Склад',   'Критический остаток хладагента',      'R-410A ниже минимального остатка: 2.1 кг (мин: 5 кг)',               '25 мин назад',  true),
  mkNotif('n6',  'Финансы', 'Счёт оплачен',                        'Счёт ИП Сергеев оплачен, сумма 45 000 ₽',                            '31 мин назад',  false),
  mkNotif('n7',  'HR',      'Испытательный срок завершён',         'Захаров Р.А. прошёл испытательный срок, оформить документы',          '47 мин назад',  true),
  mkNotif('n8',  'Система', 'Резервное копирование',               'Выполнено резервное копирование БД, размер 2.3 ГБ',                   '1 ч назад',     false),
  mkNotif('n9',  'SLA',     'SLA нарушен — эскалация',             'WO-2026-000401: TTF просрочен на 2 ч, уведомлён руководитель',        '1 ч назад',     false),
  mkNotif('n10', 'Наряды',  'Наряд назначен',                      'WO-2026-000416 назначен инженеру Петрову М.С.',                       '1 ч назад',     true),
  mkNotif('n11', 'Склад',   'Поступление на склад',                'Получены запчасти по заявке ЗАП-2026-0088, 12 позиций',               '2 ч назад',     false),
  mkNotif('n12', 'Финансы', 'Счёт выставлен',                      'Счёт №А-00234 выставлен клиенту ООО «АвтоМаг» на 78 500 ₽',          '2 ч назад',     false),
  mkNotif('n13', 'HR',      'Новый сотрудник добавлен',            'Инженер Никитин В.П. добавлен в систему, роль: инженер',              '3 ч назад',     false),
  mkNotif('n14', 'Наряды',  'Инженер в пути',                      'WO-2026-000414: Петров выехал, ETA 20 мин',                           '3 ч назад',     false),
  mkNotif('n15', 'SLA',     'Контракт SLA обновлён',               'ООО «Гранд Плаза» — SLA обновлён, TTF теперь 4 ч',                   '4 ч назад',     false),
  mkNotif('n16', 'Система', 'Обновление справочников из 1С',       'Синхронизация с 1С:УНФ завершена, обновлено 45 записей',              '4 ч назад',     false),
  mkNotif('n17', 'Склад',   'Ожидается поступление ЗИП',           'Заказ от поставщика АСС Климат прибудет завтра',                      '5 ч назад',     false),
  mkNotif('n18', 'Финансы', 'Просроченная дебиторка',              'ООО «СтройСервис» — задолженность 120 000 ₽ просрочена на 15 дней',   '6 ч назад',     true),
  mkNotif('n19', 'Наряды',  'Заявка на ЗИП одобрена',             'ЗАП-2026-0091 одобрена, запчасть заказана у поставщика',              '6 ч назад',     false),
  mkNotif('n20', 'HR',      'Отпуск согласован',                   'Сидоров К.А.: отпуск с 20 по 27 мая согласован',                     '7 ч назад',     false),
  mkNotif('n21', 'SLA',     'Клиент оценил работу',               'WO-2026-000410: оценка 4/5, клиент ТЦ Мега',                          '8 ч назад',     false),
  mkNotif('n22', 'Система', 'Ошибка интеграции Telegram',          'Бот не отвечает >5 мин, проверить webhook',                           '9 ч назад',     true),
  mkNotif('n23', 'Склад',   'Утечка хладагента: порог превышен',   'Оборудование ID #2041, показатель утечки R-32: 38% (норма: 30%)',     '10 ч назад',    true),
  mkNotif('n24', 'Финансы', 'Акт подписан клиентом',               'Акт №АВР-00189 подписан ООО «ТехноОфис», передан в 1С',              '11 ч назад',    false),
  mkNotif('n25', 'Наряды',  'Плановое ТО сформировано',            '3 наряда ТО сформированы на следующую неделю по расписанию ППР',      '12 ч назад',    false),
];

const CHART_DATA = [
  { day: 'Пн', SLA: 4, Наряды: 7, Склад: 2, Финансы: 3, Система: 1, HR: 1 },
  { day: 'Вт', SLA: 2, Наряды: 9, Склад: 3, Финансы: 2, Система: 2, HR: 0 },
  { day: 'Ср', SLA: 6, Наряды: 5, Склад: 1, Финансы: 4, Система: 3, HR: 2 },
  { day: 'Чт', SLA: 3, Наряды: 8, Склад: 4, Финансы: 1, Система: 1, HR: 1 },
  { day: 'Пт', SLA: 5, Наряды: 6, Склад: 2, Финансы: 5, Система: 2, HR: 3 },
  { day: 'Сб', SLA: 1, Наряды: 3, Склад: 0, Финансы: 0, Система: 1, HR: 0 },
  { day: 'Вс', SLA: 2, Наряды: 2, Склад: 1, Финансы: 0, Система: 4, HR: 0 },
];

const CHART_COLORS: Record<NotifType, string> = {
  SLA:     '#ef4444',
  Наряды:  '#3b82f6',
  Склад:   '#f97316',
  Финансы: '#a855f7',
  Система: '#6b7280',
  HR:      '#ec4899',
};

const buildDefaultChannelSettings = (): ChannelSettings => {
  const result = {} as ChannelSettings;
  for (const ch of CHANNELS) {
    result[ch] = {} as Record<NotifType, boolean>;
    for (const t of NOTIF_TYPES) {
      result[ch][t] = ch === 'Push' || (ch === 'Email' && (t === 'SLA' || t === 'Финансы'));
    }
  }
  return result;
};

// ─── Sub-components ────────────────────────────────────────────────────────────

interface NotificationRowProps {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationRow({ notif, onRead, onDelete }: NotificationRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={[
        'relative flex gap-3 px-4 py-3 cursor-pointer transition-colors',
        notif.unread ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50',
      ].join(' ')}
      onClick={() => onRead(notif.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Blue unread stripe */}
      {notif.unread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
      )}

      {/* Icon */}
      <div
        className={[
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
          notif.bgColor,
        ].join(' ')}
      >
        <Icon name={notif.icon} size={16} className={notif.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={['text-sm truncate', notif.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'].join(' ')}>
            {notif.title}
          </p>
          <span className="flex-shrink-0 text-xs text-gray-400 mt-0.5">{notif.relativeTime}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.description}</p>
        <Badge
          variant="outline"
          className={['mt-1 text-xs px-1.5 py-0', notif.iconColor, 'border-current'].join(' ')}
        >
          {notif.type}
        </Badge>
      </div>

      {/* Delete button on hover */}
      {hovered && (
        <button
          className="flex-shrink-0 self-center p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notif.id);
          }}
          title="Удалить уведомление"
        >
          <Icon name="X" size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Settings Panel ─────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  settings: ChannelSettings;
  onToggle: (channel: Channel, type: NotifType) => void;
  onSave: () => void;
}

function SettingsPanel({ settings, onToggle, onSave }: SettingsPanelProps) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="Bell" size={15} className="text-gray-500" />
          Настройки уведомлений
        </h3>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <p className="text-xs text-gray-500 mb-3">Выберите каналы для каждого типа уведомлений</p>

        {/* Header row */}
        <div className="grid grid-cols-5 gap-1 mb-2 text-center">
          <div className="col-span-1" />
          {CHANNELS.map((ch) => (
            <div key={ch} className="text-xs font-medium text-gray-600 truncate">{ch}</div>
          ))}
        </div>

        {/* Matrix */}
        <div className="space-y-3">
          {NOTIF_TYPES.map((type) => {
            const meta = TYPE_META[type];
            return (
              <div key={type} className="grid grid-cols-5 gap-1 items-center">
                <div className="flex items-center gap-1 col-span-1">
                  <div className={['w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', meta.bgColor].join(' ')}>
                    <Icon name={meta.icon} size={10} className={meta.iconColor} />
                  </div>
                  <span className="text-xs text-gray-700 truncate">{type}</span>
                </div>
                {CHANNELS.map((ch) => (
                  <div key={ch} className="flex justify-center">
                    <button
                      onClick={() => onToggle(ch, type)}
                      className={[
                        'w-8 h-5 rounded-full relative transition-colors duration-200 focus:outline-none',
                        settings[ch][type] ? 'bg-blue-500' : 'bg-gray-300',
                      ].join(' ')}
                      title={`${ch} / ${type}`}
                    >
                      <span
                        className={[
                          'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                          settings[ch][type] ? 'translate-x-3.5' : 'translate-x-0.5',
                        ].join(' ')}
                      />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Тихий режим</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">С 22:00 до 08:00</span>
              <button className="w-8 h-5 rounded-full bg-blue-500 relative focus:outline-none">
                <span className="absolute top-0.5 translate-x-3.5 w-4 h-4 bg-white rounded-full shadow" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Email для уведомлений</p>
            <Input className="text-xs h-7" placeholder="admin@servisklimat.ru" />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <Button size="sm" className="w-full" onClick={onSave}>
          <Icon name="Save" size={14} className="mr-1.5" />
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function NotificationsFull() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Все');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelSettings, setChannelSettings] = useState<ChannelSettings>(buildDefaultChannelSettings);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesType = activeFilter === 'Все' || n.type === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q || n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('Все уведомления отмечены как прочитанные');
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info('Уведомление удалено');
  };

  const toggleChannel = (channel: Channel, type: NotifType) => {
    setChannelSettings((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type],
      },
    }));
  };

  const saveSettings = () => {
    toast.success('Настройки уведомлений сохранены');
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Уведомления</h2>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 hover:bg-red-500 text-white px-2 py-0.5 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon
              name="Search"
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              className="pl-8 h-8 w-48 text-xs"
              placeholder="Поиск уведомлений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <Icon name="CheckCheck" size={14} className="mr-1.5" />
            Все прочитаны
          </Button>

          <Button
            variant={showSettings ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-8"
            onClick={() => setShowSettings((v) => !v)}
          >
            <Icon name="SlidersHorizontal" size={14} className="mr-1.5" />
            Настройки
          </Button>
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-gray-100 flex-shrink-0 overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const count =
            tab === 'Все'
              ? notifications.filter((n) => n.unread).length
              : notifications.filter((n) => n.type === tab && n.unread).length;
          const isActive = activeFilter === tab;
          const meta = tab !== 'Все' ? TYPE_META[tab] : null;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}
            >
              {meta && (
                <Icon
                  name={meta.icon}
                  size={12}
                  className={isActive ? 'text-white' : meta.iconColor}
                />
              )}
              {tab}
              {count > 0 && (
                <span
                  className={[
                    'ml-0.5 px-1.5 py-0 rounded-full text-xs leading-4',
                    isActive ? 'bg-blue-400 text-white' : 'bg-red-500 text-white',
                  ].join(' ')}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Notification list */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Icon name="BellOff" size={32} className="mb-2 opacity-50" />
                <p className="text-sm">Уведомлений нет</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notif={n}
                  onRead={markRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>

          {/* ── Analytics bar chart ── */}
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-700 mb-3">
              Активность за последние 7 дней
            </p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart
                data={CHART_DATA}
                margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
                barSize={6}
                barGap={1}
                barCategoryGap="30%"
              >
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                {(Object.keys(CHART_COLORS) as NotifType[]).map((type) => (
                  <Bar
                    key={type}
                    dataKey={type}
                    stackId="a"
                    fill={CHART_COLORS[type]}
                    radius={type === 'HR' ? [3, 3, 0, 0] : undefined}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {(Object.keys(CHART_COLORS) as NotifType[]).map((type) => (
                <span key={type} className="flex items-center gap-1 text-xs text-gray-500">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ background: CHART_COLORS[type] }}
                  />
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Settings Panel ── */}
        {showSettings && (
          <SettingsPanel
            settings={channelSettings}
            onToggle={toggleChannel}
            onSave={saveSettings}
          />
        )}
      </div>
    </div>
  );
}
