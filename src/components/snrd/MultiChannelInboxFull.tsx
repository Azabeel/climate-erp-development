import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Channel = 'telegram' | 'whatsapp' | 'email' | 'avito' | 'phone';
type DialogStatus = 'new' | 'active' | 'closed';

interface Dialog {
  id: string;
  channel: Channel;
  clientName: string;
  clientPhone: string;
  clientPrevRequests: number;
  clientActiveOrders: number;
  preview: string;
  time: string;
  status: DialogStatus;
  unread: boolean;
  unreadCount?: number;
}

interface Message {
  id: string;
  sender: 'client' | 'operator';
  operatorName?: string;
  text: string;
  time: string;
}

// ─────────────────────────────────────────────
// Constants & mock data
// ─────────────────────────────────────────────

const CHANNEL_META: Record<Channel, { label: string; emoji: string; iconName: string; color: string; bgColor: string }> = {
  telegram: { label: 'Telegram', emoji: '💬', iconName: 'MessageCircle', color: 'text-sky-600', bgColor: 'bg-sky-100' },
  whatsapp: { label: 'WhatsApp', emoji: '📱', iconName: 'Smartphone', color: 'text-green-600', bgColor: 'bg-green-100' },
  email:    { label: 'Email',    emoji: '📧', iconName: 'Mail',        color: 'text-violet-600', bgColor: 'bg-violet-100' },
  avito:    { label: 'Avito',    emoji: '🛍️', iconName: 'ShoppingBag', color: 'text-orange-500', bgColor: 'bg-orange-100' },
  phone:    { label: 'Звонки',   emoji: '📞', iconName: 'Phone',       color: 'text-rose-600',  bgColor: 'bg-rose-100' },
};

const STATUS_META: Record<DialogStatus, { label: string; badgeClass: string }> = {
  new:    { label: 'Новый',    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200' },
  active: { label: 'В работе', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  closed: { label: 'Закрыт',   badgeClass: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const DIALOGS: Dialog[] = [
  { id: 'd1',  channel: 'telegram', clientName: 'Иванов Сергей',       clientPhone: '+7 (916) 111-22-33', clientPrevRequests: 4,  clientActiveOrders: 1, preview: 'Добрый день! Кондиционер перестал охлаждать, мигает лампочка', time: '10:47', status: 'new',    unread: true,  unreadCount: 3 },
  { id: 'd2',  channel: 'whatsapp', clientName: 'ООО «АрктикТрейд»',   clientPhone: '+7 (495) 321-00-44', clientPrevRequests: 12, clientActiveOrders: 2, preview: 'Когда приедет мастер? Уже второй час ждём', time: '10:31', status: 'active', unread: true,  unreadCount: 1 },
  { id: 'd3',  channel: 'email',    clientName: 'Петрова Анна',         clientPhone: '+7 (903) 555-66-77', clientPrevRequests: 1,  clientActiveOrders: 0, preview: 'Re: Заявка #WO-2026-000398 — Прошу уточнить стоимость', time: '10:15', status: 'new',    unread: true,  unreadCount: 2 },
  { id: 'd4',  channel: 'avito',    clientName: 'Козлов Дмитрий',       clientPhone: '+7 (926) 888-11-22', clientPrevRequests: 0,  clientActiveOrders: 0, preview: 'Здравствуйте, сколько стоит заправка Mitsubishi Heavy?', time: '09:58', status: 'new',    unread: true,  unreadCount: 1 },
  { id: 'd5',  channel: 'phone',    clientName: 'ТЦ «Европа»',          clientPhone: '+7 (495) 700-88-00', clientPrevRequests: 27, clientActiveOrders: 3, preview: 'Входящий звонок — 4 мин 12 сек', time: '09:45', status: 'active', unread: false },
  { id: 'd6',  channel: 'telegram', clientName: 'Морозова Елена',        clientPhone: '+7 (916) 233-44-55', clientPrevRequests: 3,  clientActiveOrders: 1, preview: 'Спасибо! А фильтры тоже замените заодно?', time: '09:30', status: 'active', unread: false },
  { id: 'd7',  channel: 'whatsapp', clientName: 'Сидоров Михаил',        clientPhone: '+7 (903) 444-77-88', clientPrevRequests: 2,  clientActiveOrders: 0, preview: 'Хорошо, будем ждать мастера в пятницу в 14:00', time: '09:12', status: 'active', unread: false },
  { id: 'd8',  channel: 'email',    clientName: 'ИП Громов А.В.',        clientPhone: '+7 (926) 100-22-33', clientPrevRequests: 6,  clientActiveOrders: 1, preview: 'Пришлите акт выполненных работ на эл. почту', time: '08:55', status: 'new',    unread: true,  unreadCount: 1 },
  { id: 'd9',  channel: 'avito',    clientName: 'Новиков Артём',         clientPhone: '+7 (916) 777-33-44', clientPrevRequests: 0,  clientActiveOrders: 0, preview: 'А есть скидка если взять ТО + чистка?', time: '08:40', status: 'new',    unread: true,  unreadCount: 2 },
  { id: 'd10', channel: 'telegram', clientName: 'Захарова Ольга',        clientPhone: '+7 (903) 999-55-66', clientPrevRequests: 8,  clientActiveOrders: 0, preview: 'Всё отлично, спасибо вашему мастеру!', time: 'Вчера', status: 'closed', unread: false },
  { id: 'd11', channel: 'email',    clientName: 'ООО «Климатсервис»',   clientPhone: '+7 (495) 888-00-11', clientPrevRequests: 15, clientActiveOrders: 2, preview: 'Направляем заявку на плановое ТО 12 кондиционеров', time: 'Вчера', status: 'new',    unread: true,  unreadCount: 4 },
  { id: 'd12', channel: 'phone',    clientName: 'Волков Игорь',          clientPhone: '+7 (926) 222-88-99', clientPrevRequests: 1,  clientActiveOrders: 0, preview: 'Пропущенный звонок — 2 попытки', time: 'Вчера', status: 'new',    unread: true,  unreadCount: 2 },
  { id: 'd13', channel: 'whatsapp', clientName: 'Николаева Светлана',    clientPhone: '+7 (916) 333-00-11', clientPrevRequests: 5,  clientActiveOrders: 1, preview: 'Отправила фото — видите что капает?', time: 'Вчера', status: 'active', unread: false },
  { id: 'd14', channel: 'avito',    clientName: 'Лебедев Константин',    clientPhone: '+7 (903) 666-44-55', clientPrevRequests: 0,  clientActiveOrders: 0, preview: 'Добрый, Daikin FTXB35C — сколько выедет мастер?', time: 'Вчера', status: 'new',    unread: false },
  { id: 'd15', channel: 'email',    clientName: 'Фролова Виктория',      clientPhone: '+7 (926) 555-11-22', clientPrevRequests: 2,  clientActiveOrders: 0, preview: 'Можно записаться на диагностику на следующей неделе?', time: 'Вчера', status: 'closed', unread: false },
];

const MESSAGES_BY_DIALOG: Record<string, Message[]> = {
  d1: [
    { id: 'm1',  sender: 'client',   text: 'Добрый день! У меня кондиционер Daikin FTXB25C перестал охлаждать. Мигает лампочка OPERATION красным.', time: '10:20' },
    { id: 'm2',  sender: 'operator', operatorName: 'Анастасия', text: 'Здравствуйте! Скажите, пожалуйста, как давно появилась проблема?', time: '10:23' },
    { id: 'm3',  sender: 'client',   text: 'Вчера вечером. Сначала стал хуже дуть, потом совсем остановился компрессор.', time: '10:25' },
    { id: 'm4',  sender: 'operator', operatorName: 'Анастасия', text: 'Понятно. Обычно это признак нехватки фреона или ошибка высокого давления. Пришлите фото кодов на дисплее, если есть.', time: '10:27' },
    { id: 'm5',  sender: 'client',   text: 'На дисплее нет ничего, только лампочка моргает. Это серьёзно?', time: '10:31' },
    { id: 'm6',  sender: 'operator', operatorName: 'Анастасия', text: 'Скорее всего потребуется диагностика и дозаправка. Мастер проверит давление манометрами на месте. Можем записать вас на завтра 10:00–12:00.', time: '10:33' },
    { id: 'm7',  sender: 'client',   text: 'Хорошо, записывайте! Адрес: ул. Тверская, д. 18, кв. 54.', time: '10:38' },
    { id: 'm8',  sender: 'client',   text: 'Добрый день! Кондиционер перестал охлаждать, мигает лампочка', time: '10:47' },
  ],
  d2: [
    { id: 'm1',  sender: 'operator', operatorName: 'Кирилл', text: 'Добрый день! Инженер Петров А.В. назначен, выезд в 10:00.', time: '09:55' },
    { id: 'm2',  sender: 'client',   text: 'Хорошо, ждём', time: '09:57' },
    { id: 'm3',  sender: 'client',   text: 'Уже 10:30, никого нет', time: '10:32' },
    { id: 'm4',  sender: 'client',   text: 'Когда приедет мастер? Уже второй час ждём', time: '10:31' },
  ],
  d3: [
    { id: 'm1',  sender: 'client',   text: 'Здравствуйте. Хотела уточнить — в смете написано «работы по монтажу 8500 руб.». Это с материалами или без?', time: '09:50' },
    { id: 'm2',  sender: 'operator', operatorName: 'Анастасия', text: 'Добрый день, Анна! Стоимость монтажа 8 500 руб. — только работы. Медная трубка и крепёж рассчитываются отдельно по факту метража.', time: '10:05' },
    { id: 'm3',  sender: 'client',   text: 'Re: Заявка #WO-2026-000398 — Прошу уточнить стоимость', time: '10:15' },
  ],
  d4: [
    { id: 'm1',  sender: 'client',   text: 'Здравствуйте, сколько стоит заправка Mitsubishi Heavy Industries SRK25ZSX-W?', time: '09:58' },
  ],
  d5: [
    { id: 'm1',  sender: 'operator', operatorName: 'Система', text: 'Входящий звонок с номера +7 (495) 700-88-00. Длительность: 4 мин 12 сек. Записан в CRM.', time: '09:45' },
    { id: 'm2',  sender: 'operator', operatorName: 'Кирилл', text: 'Звонили по заявке WO-2026-000412. Просят ускорить выезд — срочная поломка в зале супермаркета.', time: '09:47' },
  ],
  d6: [
    { id: 'm1',  sender: 'operator', operatorName: 'Анастасия', text: 'Добрый день, Елена! Мастер Соколов записан к вам на пятницу 14:00. Проведёт плановое ТО Mitsubishi Electric.', time: '09:10' },
    { id: 'm2',  sender: 'client',   text: 'Отлично! Подскажите, а фильтры он с собой привезёт?', time: '09:15' },
    { id: 'm3',  sender: 'operator', operatorName: 'Анастасия', text: 'Да, всё необходимое мастер берёт с собой. Фильтры включены в стоимость ТО.', time: '09:20' },
    { id: 'm4',  sender: 'client',   text: 'Спасибо! А фильтры тоже замените заодно?', time: '09:30' },
  ],
  d11: [
    { id: 'm1',  sender: 'client',   text: 'Добрый день! Направляем заявку на плановое ТО 12 кондиционеров в нашем офисе. Объект: БЦ «Галактика», ул. Ленина 5.', time: 'Вчера 15:00' },
    { id: 'm2',  sender: 'client',   text: 'Бренды: Daikin (7 шт.), Mitsubishi Electric (3 шт.), LG (2 шт.). Последнее ТО — октябрь 2025.', time: 'Вчера 15:02' },
    { id: 'm3',  sender: 'client',   text: 'Пришлите коммерческое предложение с разбивкой по каждому блоку.', time: 'Вчера 15:10' },
    { id: 'm4',  sender: 'client',   text: 'Направляем заявку на плановое ТО 12 кондиционеров', time: 'Вчера 15:22' },
  ],
};

const DEFAULT_MESSAGES: Message[] = [
  { id: 'dm1', sender: 'client',   text: 'Здравствуйте! Хотел бы записаться на диагностику.', time: '09:00' },
  { id: 'dm2', sender: 'operator', operatorName: 'Анастасия', text: 'Добрый день! Когда вам удобно?', time: '09:03' },
  { id: 'dm3', sender: 'client',   text: 'В любой будний день после 14:00.', time: '09:05' },
];

const QUICK_REPLIES = [
  'Принято в работу',
  'Уточните адрес',
  'Мастер приедет завтра',
  'Нужно фото',
  'Отличный отзыв!',
];

const CHANNEL_COUNTS: { channel: Channel | 'all'; count: number }[] = [
  { channel: 'all',      count: 47 },
  { channel: 'telegram', count: 12 },
  { channel: 'whatsapp', count: 8  },
  { channel: 'email',    count: 15 },
  { channel: 'avito',    count: 7  },
  { channel: 'phone',    count: 5  },
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function ChannelBadge({ channel, size = 'sm' }: { channel: Channel; size?: 'xs' | 'sm' }) {
  const meta = CHANNEL_META[channel];
  const sizeClass = size === 'xs' ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold ${sizeClass} ${meta.bgColor} ${meta.color} shrink-0`}
      title={meta.label}
    >
      {meta.emoji}
    </span>
  );
}

function ClientAvatar({ name, channel }: { name: string; channel: Channel }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className="relative shrink-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${color}`}>
        {initials}
      </div>
      <span className="absolute -bottom-0.5 -right-0.5">
        <ChannelBadge channel={channel} size="xs" />
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: DialogStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}>
      {meta.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Left column — channels & filters
// ─────────────────────────────────────────────

interface LeftColumnProps {
  activeChannel: Channel | 'all';
  onChannelChange: (ch: Channel | 'all') => void;
  activeStatus: DialogStatus | 'all';
  onStatusChange: (s: DialogStatus | 'all') => void;
  search: string;
  onSearchChange: (v: string) => void;
}

function LeftColumn({ activeChannel, onChannelChange, activeStatus, onStatusChange, search, onSearchChange }: LeftColumnProps) {
  return (
    <div className="w-[260px] shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Icon name="Inbox" className="w-4 h-4 text-indigo-600" />
          Входящие
          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
            47
          </span>
        </h2>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="relative">
          <Icon name="Search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск клиента или текста..."
            className="pl-8 h-8 text-xs bg-white border-gray-200 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Channel filters */}
      <div className="px-3 py-2 border-b border-gray-200">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Каналы</p>
        <div className="space-y-0.5">
          {CHANNEL_COUNTS.map(({ channel, count }) => {
            const isAll = channel === 'all';
            const meta = isAll ? null : CHANNEL_META[channel as Channel];
            const isActive = activeChannel === channel;

            return (
              <button
                key={channel}
                onClick={() => onChannelChange(channel as Channel | 'all')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isAll ? (
                  <Icon name="Layers" className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                ) : (
                  <span className="text-sm leading-none">{meta!.emoji}</span>
                )}
                <span className="flex-1 text-left">{isAll ? 'Все каналы' : meta!.label}</span>
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status filters */}
      <div className="px-3 py-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Статус</p>
        <div className="space-y-0.5">
          {([['all', 'Все'], ['new', 'Новые'], ['active', 'В работе'], ['closed', 'Закрытые']] as const).map(([s, label]) => (
            <button
              key={s}
              onClick={() => onStatusChange(s as DialogStatus | 'all')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                activeStatus === s
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                s === 'new' ? 'bg-blue-500' :
                s === 'active' ? 'bg-amber-500' :
                s === 'closed' ? 'bg-gray-400' :
                'bg-indigo-400'
              }`} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Center column — dialog list
// ─────────────────────────────────────────────

interface CenterColumnProps {
  dialogs: Dialog[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function CenterColumn({ dialogs, selectedId, onSelect }: CenterColumnProps) {
  return (
    <div className="w-[380px] shrink-0 border-r border-gray-200 flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Диалоги</span>
        <span className="text-xs text-gray-400">{dialogs.length} из {DIALOGS.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {dialogs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Icon name="Inbox" className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">Диалогов не найдено</p>
          </div>
        )}
        {dialogs.map((dialog) => (
          <DialogRow
            key={dialog.id}
            dialog={dialog}
            isSelected={selectedId === dialog.id}
            onClick={() => onSelect(dialog.id)}
          />
        ))}
      </div>
    </div>
  );
}

function DialogRow({ dialog, isSelected, onClick }: { dialog: Dialog; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-100 text-left transition-all hover:bg-indigo-50 ${
        isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''
      }`}
    >
      <ClientAvatar name={dialog.clientName} channel={dialog.channel} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-sm truncate flex-1 ${dialog.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {dialog.clientName}
          </span>
          <span className="text-[10px] text-gray-400 shrink-0">{dialog.time}</span>
        </div>
        <p className={`text-xs truncate mb-1 ${dialog.unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
          {dialog.preview}
        </p>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={dialog.status} />
          {dialog.unread && dialog.unreadCount && (
            <span className="ml-auto w-4 h-4 flex items-center justify-center bg-indigo-600 text-white rounded-full text-[9px] font-bold">
              {dialog.unreadCount}
            </span>
          )}
          {dialog.unread && !dialog.unreadCount && (
            <span className="ml-auto w-2 h-2 bg-indigo-600 rounded-full" />
          )}
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────
// Right column — chat area
// ─────────────────────────────────────────────

interface RightColumnProps {
  dialog: Dialog | null;
}

function RightColumn({ dialog }: RightColumnProps) {
  const [messageText, setMessageText] = useState('');
  const [clientCardOpen, setClientCardOpen] = useState(true);

  if (!dialog) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <Icon name="MessageSquare" className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">Выберите диалог</p>
        <p className="text-xs mt-1">Нажмите на диалог в списке слева</p>
      </div>
    );
  }

  const messages = MESSAGES_BY_DIALOG[dialog.id] ?? DEFAULT_MESSAGES;
  const channelMeta = CHANNEL_META[dialog.channel];

  const handleSend = () => {
    if (!messageText.trim()) return;
    toast.success('Сообщение отправлено');
    setMessageText('');
  };

  const handleQuickReply = (text: string) => {
    toast.success(`Быстрый ответ отправлен: «${text}»`);
  };

  const handleCreateOrder = () => {
    toast.success(`Заявка создана для клиента ${dialog.clientName}`);
  };

  const handleAssign = () => {
    toast.success(`Диалог назначен на оператора`);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <ClientAvatar name={dialog.clientName} channel={dialog.channel} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm truncate">{dialog.clientName}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${channelMeta.bgColor} ${channelMeta.color}`}>
              {channelMeta.emoji} {channelMeta.label}
            </span>
            <StatusBadge status={dialog.status} />
          </div>
          <p className="text-xs text-gray-500">{dialog.clientPhone}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={handleAssign} className="h-8 text-xs gap-1.5 border-gray-200">
            <Icon name="UserPlus" className="w-3.5 h-3.5" />
            Назначить
          </Button>
          <Button size="sm" onClick={handleCreateOrder} className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <Icon name="FilePlus" className="w-3.5 h-3.5" />
            Создать заявку
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Icon name="MoreVertical" className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Client card (collapsible) */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setClientCardOpen((p) => !p)}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Icon name="User" className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold">Карточка клиента</span>
          <span className="ml-auto">
            <Icon name={clientCardOpen ? 'ChevronUp' : 'ChevronDown'} className="w-3.5 h-3.5 text-gray-400" />
          </span>
        </button>

        {clientCardOpen && (
          <div className="px-4 pb-3 bg-indigo-50/40">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div>
                <span className="text-gray-500">Клиент: </span>
                <span className="font-medium text-gray-800">{dialog.clientName}</span>
              </div>
              <div>
                <span className="text-gray-500">Телефон: </span>
                <span className="font-medium text-gray-800">{dialog.clientPhone}</span>
              </div>
              <div>
                <span className="text-gray-500">Предыдущих обращений: </span>
                <span className="font-semibold text-indigo-700">{dialog.clientPrevRequests}</span>
              </div>
              <div>
                <span className="text-gray-500">Активных заявок: </span>
                <span className="font-semibold text-amber-700">{dialog.clientActiveOrders}</span>
              </div>
            </div>
            <button
              className="mt-2 text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
              onClick={() => toast.info('Открытие карточки клиента')}
            >
              <Icon name="ExternalLink" className="w-3 h-3" />
              Открыть полную карточку клиента
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Quick replies */}
      <div className="px-4 pt-2 pb-1 border-t border-gray-100 flex gap-2 flex-wrap">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => handleQuickReply(reply)}
            className="text-[11px] px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium whitespace-nowrap"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-end gap-2">
        <div className="flex-1 relative">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`Ответить в ${channelMeta.label}...`}
            className="pr-10 text-sm border-gray-200 focus:border-indigo-400 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors">
            <Icon name="Paperclip" className="w-4 h-4" />
          </button>
        </div>
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!messageText.trim()}
          className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
        >
          <Icon name="Send" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isClient = message.sender === 'client';
  return (
    <div className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[72%] ${isClient ? '' : 'items-end flex flex-col'}`}>
        {!isClient && message.operatorName && (
          <span className="text-[10px] text-gray-400 mb-1 mr-1">{message.operatorName}</span>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isClient
              ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
              : 'bg-indigo-600 text-white rounded-tr-sm'
          }`}
        >
          {message.text}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{message.time}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────

export default function MultiChannelInboxFull() {
  const [activeChannel, setActiveChannel] = useState<Channel | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<DialogStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedDialogId, setSelectedDialogId] = useState<string | null>('d1');

  const filteredDialogs = DIALOGS.filter((d) => {
    if (activeChannel !== 'all' && d.channel !== activeChannel) return false;
    if (activeStatus !== 'all' && d.status !== activeStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!d.clientName.toLowerCase().includes(q) && !d.preview.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selectedDialog = DIALOGS.find((d) => d.id === selectedDialogId) ?? null;

  return (
    <div className="flex h-full min-h-0 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <LeftColumn
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        search={search}
        onSearchChange={setSearch}
      />
      <CenterColumn
        dialogs={filteredDialogs}
        selectedId={selectedDialogId}
        onSelect={setSelectedDialogId}
      />
      <RightColumn dialog={selectedDialog} />
    </div>
  );
}
