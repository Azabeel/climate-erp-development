import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type Channel = 'telegram' | 'whatsapp' | 'email' | 'avito' | 'phone' | 'portal';
type DialogStatus = 'new' | 'open' | 'mine' | 'closed';

interface ChatMessage {
  id: string;
  direction: 'in' | 'out';
  text?: string;
  time: string;
  delivered: boolean;
  read: boolean;
  type: 'text' | 'voice' | 'photo';
  duration?: string; // voice
}

interface RecentOrder {
  id: string;
  type: string;
  status: string;
  statusColor: string;
}

interface Dialog {
  id: string;
  channel: Channel;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  clientType: 'Физическое лицо' | 'Юридическое лицо';
  lastMessage: string;
  time: string;
  unread: number;
  status: DialogStatus;
  operator: string | null;
  tags: string[];
  note: string;
  recentOrders: RecentOrder[];
  messages: ChatMessage[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const channelConfig: Record<Channel, { label: string; iconName: string; color: string; avatarBg: string; textColor: string }> = {
  telegram: { label: 'Telegram',  iconName: 'Send',        color: 'text-blue-500',   avatarBg: 'bg-blue-500',   textColor: 'text-white' },
  whatsapp: { label: 'WhatsApp',  iconName: 'MessageCircle', color: 'text-green-600', avatarBg: 'bg-green-500',  textColor: 'text-white' },
  email:    { label: 'Email',     iconName: 'Mail',         color: 'text-slate-600',  avatarBg: 'bg-slate-500',  textColor: 'text-white' },
  avito:    { label: 'Авито',     iconName: 'ShoppingBag',  color: 'text-orange-500', avatarBg: 'bg-orange-500', textColor: 'text-white' },
  phone:    { label: 'Звонок',    iconName: 'Phone',        color: 'text-purple-600', avatarBg: 'bg-purple-500', textColor: 'text-white' },
  portal:   { label: 'Портал',    iconName: 'Globe',        color: 'text-indigo-600', avatarBg: 'bg-indigo-500', textColor: 'text-white' },
};

const CHANNEL_FILTERS: { key: Channel | 'all'; label: string; icon: string }[] = [
  { key: 'all',      label: 'Все',      icon: 'Inbox' },
  { key: 'telegram', label: 'TG',       icon: 'Send' },
  { key: 'whatsapp', label: 'WA',       icon: 'MessageCircle' },
  { key: 'email',    label: 'Email',    icon: 'Mail' },
  { key: 'avito',    label: 'Авито',    icon: 'ShoppingBag' },
  { key: 'phone',    label: 'Звонок',   icon: 'Phone' },
  { key: 'portal',   label: 'Портал',   icon: 'Globe' },
];

const STATUS_FILTERS: { key: DialogStatus | 'all'; label: string }[] = [
  { key: 'all',    label: 'Все' },
  { key: 'new',    label: 'Новые' },
  { key: 'open',   label: 'Открытые' },
  { key: 'mine',   label: 'Мои' },
  { key: 'closed', label: 'Закрытые' },
];

const QUICK_REPLIES = [
  'Принято',
  'Уточняю информацию',
  'Скоро свяжемся',
  'Создам заявку',
];

const OPERATORS = ['Сидорова А.', 'Белова Н.', 'Козлов Д.'];

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_DIALOGS: Dialog[] = [
  {
    id: 'd01',
    channel: 'telegram',
    name: 'Иванов Иван Сергеевич',
    phone: '+7 900 123-45-67',
    email: 'ivanov@mail.ru',
    clientType: 'Физическое лицо',
    lastMessage: 'Когда приедет мастер? Уже 3 часа жду.',
    time: '14:32',
    unread: 3,
    status: 'new',
    operator: null,
    tags: ['ожидание', 'срочно'],
    note: '',
    recentOrders: [
      { id: 'WO-2026-000412', type: 'Ремонт', status: 'В работе',     statusColor: 'bg-blue-100 text-blue-700' },
      { id: 'WO-2026-000311', type: 'ТО',     status: 'Выполнен',    statusColor: 'bg-green-100 text-green-700' },
    ],
    messages: [
      { id: 'm1', direction: 'in',  text: 'Добрый день! Я оставлял заявку на ремонт кондиционера.',                                         time: '14:10', delivered: true, read: true,  type: 'text' },
      { id: 'm2', direction: 'out', text: 'Здравствуйте, Иван! Да, ваша заявка принята, мастер выехал к вам.',                             time: '14:15', delivered: true, read: true,  type: 'text' },
      { id: 'm3', direction: 'in',  text: 'Когда приедет мастер? Уже 3 часа жду.',                                                          time: '14:32', delivered: true, read: false, type: 'text' },
    ],
  },
  {
    id: 'd02',
    channel: 'whatsapp',
    name: 'Менеджер Анна',
    company: 'ТЦ «Европа»',
    phone: '+7 911 555-22-11',
    email: 'anna@tc-europa.ru',
    clientType: 'Юридическое лицо',
    lastMessage: 'Нам нужно срочно обслужить 5 кондиционеров',
    time: '14:18',
    unread: 1,
    status: 'new',
    operator: null,
    tags: ['срочно', 'корпоративный'],
    note: '',
    recentOrders: [
      { id: 'WO-2026-000388', type: 'ТО', status: 'Выполнен', statusColor: 'bg-green-100 text-green-700' },
    ],
    messages: [
      { id: 'm1', direction: 'in',  text: 'Здравствуйте! У нас вышли из строя 3 кондиционера в торговом зале.',                             time: '14:00', delivered: true, read: true,  type: 'text' },
      { id: 'm2', direction: 'in',  text: 'Нам нужно срочное обслуживание. Сколько будет стоить и когда приедете?',                         time: '14:18', delivered: true, read: false, type: 'text' },
    ],
  },
  {
    id: 'd03',
    channel: 'email',
    name: 'Петров Алексей Анатольевич',
    company: 'ООО «СтройГруп»',
    phone: '+7 495 123-00-11',
    email: 'petrov@stroygroup.ru',
    clientType: 'Юридическое лицо',
    lastMessage: 'Прошу организовать плановое ТО кондиционеров согласно договору.',
    time: '13:55',
    unread: 0,
    status: 'open',
    operator: 'Сидорова А.',
    tags: ['договор', 'ТО'],
    note: 'Клиент VIP. Перезвонить до 17:00.',
    recentOrders: [
      { id: 'WO-2026-000401', type: 'ТО',     status: 'В очереди', statusColor: 'bg-yellow-100 text-yellow-700' },
      { id: 'WO-2026-000299', type: 'Ремонт', status: 'Выполнен',  statusColor: 'bg-green-100 text-green-700' },
      { id: 'WO-2026-000187', type: 'ТО',     status: 'Выполнен',  statusColor: 'bg-green-100 text-green-700' },
    ],
    messages: [
      { id: 'm1', direction: 'in',  text: 'Уважаемые коллеги! Прошу организовать плановое ТО кондиционеров в нашем офисе согласно договору №125-2025.', time: '13:55', delivered: true, read: true, type: 'text' },
      { id: 'm2', direction: 'out', text: 'Алексей Анатольевич, добрый день! Принято. Согласуем дату и время. Свяжемся сегодня.',           time: '14:05', delivered: true, read: true, type: 'text' },
    ],
  },
  {
    id: 'd04',
    channel: 'avito',
    name: 'Покупатель Авито',
    phone: '+7 925 444-77-88',
    clientType: 'Физическое лицо',
    lastMessage: 'Интересует установка кондиционера в квартиру, 20 кв.м.',
    time: '13:20',
    unread: 2,
    status: 'new',
    operator: null,
    tags: ['продажа', 'установка'],
    note: '',
    recentOrders: [],
    messages: [
      { id: 'm1', direction: 'in', text: 'Здравствуйте, интересует установка кондиционера в квартиру. Площадь комнаты 20 кв.м, 5 этаж, кирпичный дом.', time: '13:10', delivered: true, read: true,  type: 'text' },
      { id: 'm2', direction: 'in', text: 'Сколько будет стоить и какой кондиционер посоветуете?',                                            time: '13:20', delivered: true, read: false, type: 'text' },
    ],
  },
  {
    id: 'd05',
    channel: 'phone',
    name: 'Смирнова Ольга Викторовна',
    phone: '+7 916 777-33-44',
    clientType: 'Физическое лицо',
    lastMessage: 'Входящий звонок — 4 мин 12 сек',
    time: '12:45',
    unread: 0,
    status: 'mine',
    operator: 'Белова Н.',
    tags: ['гарантия', 'звонок'],
    note: 'Перезвонить если нет ответа от инженера.',
    recentOrders: [
      { id: 'WO-2026-000398', type: 'Ремонт', status: 'Выполнен', statusColor: 'bg-green-100 text-green-700' },
    ],
    messages: [
      { id: 'm1', direction: 'in',  text: 'Входящий звонок — 4 мин 12 сек. Тема: гарантийное обслуживание.',                               time: '12:45', delivered: true, read: true, type: 'voice', duration: '4:12' },
      { id: 'm2', direction: 'out', text: 'Оставили заявку на повторный выезд в рамках гарантии. Мастер приедет завтра с 10:00 до 14:00.',  time: '12:51', delivered: true, read: true, type: 'text' },
    ],
  },
  {
    id: 'd06',
    channel: 'portal',
    name: 'Новиков Дмитрий Сергеевич',
    phone: '+7 903 888-11-22',
    email: 'novikov@example.com',
    clientType: 'Физическое лицо',
    lastMessage: 'Оценил работу: 5/5 — Отличное обслуживание!',
    time: '12:10',
    unread: 1,
    status: 'new',
    operator: null,
    tags: ['отзыв', '5 звёзд'],
    note: '',
    recentOrders: [
      { id: 'WO-2026-000405', type: 'Ремонт', status: 'Закрыт', statusColor: 'bg-gray-100 text-gray-600' },
    ],
    messages: [
      { id: 'm1', direction: 'in', text: '★★★★★ Отличное обслуживание! Мастер Петров А.В. приехал вовремя, всё объяснил и сделал аккуратно. Кондиционер работает идеально. Спасибо!', time: '12:10', delivered: true, read: false, type: 'text' },
    ],
  },
  {
    id: 'd07',
    channel: 'telegram',
    name: 'Козлов Пётр Игоревич',
    phone: '+7 903 222-88-55',
    clientType: 'Физическое лицо',
    lastMessage: 'Вот фото — из внутреннего блока течёт вода.',
    time: '11:33',
    unread: 0,
    status: 'open',
    operator: 'Козлов Д.',
    tags: ['фото', 'поломка'],
    note: '',
    recentOrders: [],
    messages: [
      { id: 'm1', direction: 'in',  text: 'Добрый день! У нас из кондиционера течёт вода внутри.',                                          time: '11:20', delivered: true, read: true, type: 'text' },
      { id: 'm2', direction: 'out', text: 'Здравствуйте! Пришлите, пожалуйста, фото — надо посмотреть на дренажный поддон.',                time: '11:25', delivered: true, read: true, type: 'text' },
      { id: 'm3', direction: 'in',  text: '',                                                                                               time: '11:33', delivered: true, read: true, type: 'photo' },
      { id: 'm4', direction: 'in',  text: 'Вот — из внутреннего блока течёт вода. Это серьёзно?',                                           time: '11:33', delivered: true, read: true, type: 'text' },
    ],
  },
  {
    id: 'd08',
    channel: 'email',
    name: 'Бухгалтер Марина',
    company: 'ООО «СтройГруп»',
    phone: '+7 495 123-00-11',
    email: 'buh@stroygroup.ru',
    clientType: 'Юридическое лицо',
    lastMessage: 'Направляем платёжное поручение на оплату счёта №2026-0441.',
    time: '10:55',
    unread: 0,
    status: 'mine',
    operator: 'Сидорова А.',
    tags: ['оплата', 'счёт'],
    note: '',
    recentOrders: [
      { id: 'WO-2026-000399', type: 'ТО', status: 'Закрыт', statusColor: 'bg-gray-100 text-gray-600' },
    ],
    messages: [
      { id: 'm1', direction: 'in',  text: 'Направляем платёжное поручение на оплату счёта №2026-0441 от 12.05.2026 на сумму 45 800 руб. Оплата до 20.05.2026.', time: '10:55', delivered: true, read: true, type: 'text' },
      { id: 'm2', direction: 'out', text: 'Спасибо, получили! Подтверждаем.',                                                               time: '11:02', delivered: true, read: true, type: 'text' },
    ],
  },
  {
    id: 'd09',
    channel: 'whatsapp',
    name: 'Захарова Елена',
    phone: '+7 926 111-44-33',
    clientType: 'Физическое лицо',
    lastMessage: 'Хочу узнать цену на чистку кондиционера',
    time: '10:22',
    unread: 1,
    status: 'new',
    operator: null,
    tags: ['прайс', 'чистка'],
    note: '',
    recentOrders: [],
    messages: [
      { id: 'm1', direction: 'in', text: 'Добрый день! Хочу узнать цену на чистку кондиционера. Модель — LG A09LH.', time: '10:22', delivered: true, read: false, type: 'text' },
    ],
  },
  {
    id: 'd10',
    channel: 'avito',
    name: 'Лебедев Андрей',
    phone: '+7 921 333-66-99',
    clientType: 'Физическое лицо',
    lastMessage: 'А есть рассрочка на установку?',
    time: '09:48',
    unread: 0,
    status: 'closed',
    operator: 'Белова Н.',
    tags: ['рассрочка', 'установка'],
    note: 'Клиент ушёл к конкуренту.',
    recentOrders: [],
    messages: [
      { id: 'm1', direction: 'in',  text: 'Здравствуйте! Меня интересует установка кондиционера Mitsubishi.',                               time: '09:30', delivered: true, read: true, type: 'text' },
      { id: 'm2', direction: 'out', text: 'Добрый день! Установка Mitsubishi от 5 500 руб, плюс стоимость самого кондиционера.',             time: '09:35', delivered: true, read: true, type: 'text' },
      { id: 'm3', direction: 'in',  text: 'А есть рассрочка на установку?',                                                                 time: '09:48', delivered: true, read: true, type: 'text' },
      { id: 'm4', direction: 'out', text: 'К сожалению, рассрочку на услуги не предоставляем. Только на оборудование через банк.',          time: '09:52', delivered: true, read: true, type: 'text' },
    ],
  },
  {
    id: 'd11',
    channel: 'phone',
    name: 'Орлов Сергей',
    phone: '+7 917 555-00-88',
    clientType: 'Физическое лицо',
    lastMessage: 'Пропущенный звонок — 0 сек',
    time: 'Вчера',
    unread: 1,
    status: 'new',
    operator: null,
    tags: ['пропущенный'],
    note: '',
    recentOrders: [],
    messages: [
      { id: 'm1', direction: 'in', text: 'Пропущенный звонок — 0 сек.', time: 'Вчера 18:54', delivered: true, read: false, type: 'voice', duration: '0:00' },
    ],
  },
  {
    id: 'd12',
    channel: 'portal',
    name: 'Карпова Наталья',
    company: 'ИП Карпова Н.В.',
    phone: '+7 906 222-77-11',
    email: 'karpova@business.ru',
    clientType: 'Юридическое лицо',
    lastMessage: 'Прошу предоставить акт выполненных работ за апрель.',
    time: 'Вчера',
    unread: 0,
    status: 'open',
    operator: 'Сидорова А.',
    tags: ['документы', 'акт'],
    note: '',
    recentOrders: [
      { id: 'WO-2026-000350', type: 'ТО',     status: 'Закрыт',    statusColor: 'bg-gray-100 text-gray-600' },
      { id: 'WO-2026-000280', type: 'Ремонт', status: 'Закрыт',    statusColor: 'bg-gray-100 text-gray-600' },
    ],
    messages: [
      { id: 'm1', direction: 'in',  text: 'Добрый день! Прошу предоставить акт выполненных работ за апрель 2026 г.',                       time: 'Вчера 16:30', delivered: true, read: true, type: 'text' },
      { id: 'm2', direction: 'out', text: 'Наталья, добрый день! Акт формируем, пришлём на вашу почту сегодня до 19:00.',                   time: 'Вчера 16:45', delivered: true, read: true, type: 'text' },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Initials({ name, bg }: { name: string; bg: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`
    : name.slice(0, 2);
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {letters.toUpperCase()}
    </div>
  );
}

function StatusDot({ status }: { status: DialogStatus }) {
  if (status === 'new')    return <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />;
  if (status === 'open')   return <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />;
  if (status === 'mine')   return <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />;
  return <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />;
}

function StatusLabel({ status }: { status: DialogStatus }) {
  const map: Record<DialogStatus, { label: string; cls: string }> = {
    new:    { label: 'Новый',     cls: 'bg-green-100 text-green-700' },
    open:   { label: 'В работе',  cls: 'bg-blue-100 text-blue-700' },
    mine:   { label: 'Мои',       cls: 'bg-yellow-100 text-yellow-700' },
    closed: { label: 'Закрыт',    cls: 'bg-gray-100 text-gray-500' },
  };
  const { label, cls } = map[status];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

function DoubleCheck({ read }: { read: boolean }) {
  return (
    <span className={`text-[10px] ml-1 ${read ? 'text-blue-500' : 'text-gray-400'}`}>✓✓</span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const InboxFull = () => {
  const [dialogs, setDialogs]           = useState<Dialog[]>(INITIAL_DIALOGS);
  const [selectedId, setSelectedId]     = useState<string>(INITIAL_DIALOGS[0].id);
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DialogStatus | 'all'>('all');
  const [search, setSearch]             = useState('');
  const [inputText, setInputText]       = useState('');
  const [newTag, setNewTag]             = useState('');
  const [showOperatorMenu, setShowOperatorMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = dialogs.find(d => d.id === selectedId) ?? dialogs[0];

  // Filtered list
  const filtered = dialogs.filter(d => {
    if (channelFilter !== 'all' && d.channel !== channelFilter) return false;
    if (statusFilter !== 'all'  && d.status  !== statusFilter)  return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !d.name.toLowerCase().includes(q) &&
        !(d.company ?? '').toLowerCase().includes(q) &&
        !d.lastMessage.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // Helpers
  const updateDialog = (id: string, patch: Partial<Dialog>) =>
    setDialogs(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id:        `m${Date.now()}`,
      direction: 'out',
      text,
      time:      new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      delivered: true,
      read:      false,
      type:      'text',
    };
    updateDialog(selected.id, {
      messages:    [...selected.messages, msg],
      lastMessage: text,
      time:        msg.time,
    });
    setInputText('');
    toast.success('Сообщение отправлено');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const closeDialog = () => {
    updateDialog(selected.id, { status: 'closed' });
    toast.success('Диалог закрыт');
  };

  const assignOperator = (op: string) => {
    updateDialog(selected.id, { operator: op, status: 'mine' });
    setShowOperatorMenu(false);
    toast.success(`Назначен оператор: ${op}`);
  };

  const createOrder = () => {
    toast.success(`Заявка создана из диалога ${selected.id}`);
  };

  const addTag = () => {
    const t = newTag.trim();
    if (!t) return;
    if (selected.tags.includes(t)) { setNewTag(''); return; }
    updateDialog(selected.id, { tags: [...selected.tags, t] });
    setNewTag('');
    toast.success(`Тег «${t}» добавлен`);
  };

  const removeTag = (tag: string) => {
    updateDialog(selected.id, { tags: selected.tags.filter(t => t !== tag) });
  };

  const saveNote = () => {
    toast.success('Заметка сохранена');
  };

  const cfg = channelConfig[selected.channel];

  return (
    <div className="flex h-full bg-gray-50" style={{ minHeight: 0 }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div className="w-[260px] flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">

        {/* Channel filter */}
        <div className="p-2 border-b border-gray-100">
          <div className="flex flex-wrap gap-1">
            {CHANNEL_FILTERS.map(f => (
              <button
                key={f.key}
                title={f.label}
                onClick={() => setChannelFilter(f.key as Channel | 'all')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                  ${channelFilter === f.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Icon name={f.icon as any} size={12} />
                {f.key === 'all' && <span>Все</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-2 py-1.5 border-b border-gray-100">
          <div className="relative">
            <Icon name="Search" size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-7 h-7 text-xs"
              placeholder="Поиск диалогов..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="px-2 py-1.5 flex gap-1 flex-wrap border-b border-gray-100">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key as DialogStatus | 'all')}
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors
                ${statusFilter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Dialog list */}
        <ScrollArea className="flex-1">
          <div className="py-1">
            {filtered.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-8">Диалогов не найдено</div>
            )}
            {filtered.map(d => {
              const dcfg = channelConfig[d.channel];
              const isSelected = d.id === selectedId;
              return (
                <button
                  key={d.id}
                  onClick={() => { setSelectedId(d.id); updateDialog(d.id, { unread: 0 }); }}
                  className={`w-full text-left px-3 py-2.5 flex gap-2 items-start transition-colors
                    ${isSelected
                      ? 'bg-blue-50 border-l-[3px] border-blue-500'
                      : 'border-l-[3px] border-transparent hover:bg-gray-50'
                    }`}
                >
                  {/* Avatar */}
                  <Initials name={d.name} bg={dcfg.avatarBg} />

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
                        {d.company ? d.company : d.name}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{d.time}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon name={dcfg.iconName as any} size={10} className={dcfg.color} />
                      <span className="text-[11px] text-gray-500 truncate">{d.lastMessage}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={d.status} />
                        <StatusLabel status={d.status} />
                      </div>
                      {d.unread > 0 && (
                        <Badge className="h-4 px-1.5 text-[10px] bg-blue-600 text-white rounded-full">
                          {d.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* ── CENTER PANEL ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">

        {/* Chat header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Initials name={selected.name} bg={cfg.avatarBg} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900 truncate">{selected.name}</span>
                {selected.company && (
                  <span className="text-xs text-gray-500 truncate">({selected.company})</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Icon name={cfg.iconName as any} size={12} className={cfg.color} />
                <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                {selected.operator && (
                  <>
                    <span className="text-gray-300">·</span>
                    <Icon name="User" size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{selected.operator}</span>
                  </>
                )}
                <StatusLabel status={selected.status} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => setShowOperatorMenu(v => !v)}
              >
                <Icon name="UserPlus" size={12} />
                Назначить
              </Button>
              {showOperatorMenu && (
                <div className="absolute right-0 top-8 z-20 bg-white shadow-lg border border-gray-200 rounded-lg py-1 min-w-[160px]">
                  {OPERATORS.map(op => (
                    <button
                      key={op}
                      onClick={() => assignOperator(op)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
                    >
                      {op}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={createOrder}
            >
              <Icon name="FilePlus" size={12} />
              Создать заявку
            </Button>
            <Button
              size="sm"
              variant={selected.status === 'closed' ? 'secondary' : 'destructive'}
              className="h-7 text-xs gap-1"
              onClick={closeDialog}
              disabled={selected.status === 'closed'}
            >
              <Icon name="X" size={12} />
              {selected.status === 'closed' ? 'Закрыт' : 'Закрыть диалог'}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="flex flex-col gap-2">
            {selected.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Voice message */}
                {msg.type === 'voice' && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl max-w-[260px]
                    ${msg.direction === 'in' ? 'bg-white border border-gray-200' : 'bg-blue-600'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                      ${msg.direction === 'in' ? 'bg-gray-100' : 'bg-blue-500'}`}>
                      <Icon name="Mic" size={13} className={msg.direction === 'in' ? 'text-gray-600' : 'text-white'} />
                    </div>
                    <div className="flex-1">
                      <div className="h-1 bg-gray-300 rounded-full w-24" />
                    </div>
                    <span className={`text-[11px] font-mono flex-shrink-0 ${msg.direction === 'in' ? 'text-gray-500' : 'text-blue-100'}`}>
                      {msg.duration}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] ${msg.direction === 'in' ? 'text-gray-400' : 'text-blue-100'}`}>{msg.time}</span>
                      {msg.direction === 'out' && <DoubleCheck read={msg.read} />}
                    </div>
                  </div>
                )}

                {/* Photo message */}
                {msg.type === 'photo' && (
                  <div className={`rounded-2xl overflow-hidden max-w-[200px]
                    ${msg.direction === 'in' ? '' : ''}`}>
                    <div className="w-[180px] h-[120px] bg-gray-200 flex flex-col items-center justify-center rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-300 transition-colors">
                      <Icon name="Camera" size={28} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Фотография</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-0.5 px-1">
                      <span className="text-[10px] text-gray-400">{msg.time}</span>
                      {msg.direction === 'out' && <DoubleCheck read={msg.read} />}
                    </div>
                  </div>
                )}

                {/* Text message */}
                {msg.type === 'text' && msg.text && (
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[340px] text-sm leading-snug
                      ${msg.direction === 'in'
                        ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm'
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-0.5 mt-1 text-[10px]
                      ${msg.direction === 'in' ? 'text-gray-400' : 'text-blue-200'}`}>
                      {msg.time}
                      {msg.direction === 'out' && <DoubleCheck read={msg.read} />}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick replies */}
        <div className="px-4 py-2 flex gap-1.5 flex-wrap border-t border-gray-100 bg-gray-50">
          {QUICK_REPLIES.map(qr => (
            <button
              key={qr}
              onClick={() => setInputText(qr)}
              className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="px-3 py-2 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Emoji"
                onClick={() => toast.info('Emoji picker')}
              >
                <Icon name="Smile" size={16} />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Прикрепить"
                onClick={() => toast.info('Прикрепить файл')}
              >
                <Icon name="Paperclip" size={16} />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Шаблоны"
                onClick={() => toast.info('Шаблоны сообщений')}
              >
                <Icon name="LayoutTemplate" size={16} />
              </button>
            </div>
            <textarea
              className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 max-h-24 min-h-[36px]"
              placeholder="Введите сообщение..."
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
            />
            <Button
              size="sm"
              className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white gap-1"
              onClick={sendMessage}
              disabled={!inputText.trim()}
            >
              <Icon name="Send" size={14} />
              Отправить
            </Button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div className="w-[280px] flex-shrink-0 flex flex-col bg-white overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-3 flex flex-col gap-3">

            {/* Client card */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Initials name={selected.name} bg={cfg.avatarBg} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{selected.name}</p>
                  {selected.company && (
                    <p className="text-[10px] text-gray-500 truncate">{selected.company}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Icon name="Phone" size={11} className="text-gray-400" />
                  <span>{selected.phone}</span>
                </div>
                {selected.email && (
                  <div className="flex items-center gap-1.5">
                    <Icon name="Mail" size={11} className="text-gray-400" />
                    <span className="truncate">{selected.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Icon name="User" size={11} className="text-gray-400" />
                  <span>{selected.clientType}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-2.5 flex flex-col gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs w-full gap-1"
                  onClick={() => toast.info('Открыть карточку клиента')}
                >
                  <Icon name="ExternalLink" size={11} />
                  Открыть карточку
                </Button>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="h-7 text-xs flex-1 gap-1 bg-blue-600 hover:bg-blue-700"
                    onClick={createOrder}
                  >
                    <Icon name="FilePlus" size={11} />
                    Заявка
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs flex-1 gap-1"
                    onClick={() => toast.info(`Звонок на ${selected.phone}`)}
                  >
                    <Icon name="Phone" size={11} />
                    Позвонить
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent orders */}
            {selected.recentOrders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1.5">Последние заявки</p>
                <div className="flex flex-col gap-1.5">
                  {selected.recentOrders.map(order => (
                    <button
                      key={order.id}
                      onClick={() => toast.info(`Открыть заявку ${order.id}`)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div>
                        <p className="text-[11px] font-medium text-blue-600">{order.id}</p>
                        <p className="text-[10px] text-gray-500">{order.type}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selected.recentOrders.length === 0 && (
              <div className="text-center py-2">
                <p className="text-xs text-gray-400">Заявок нет</p>
              </div>
            )}

            <Separator className="my-0" />

            {/* Tags */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Теги диалога</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {selected.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 text-blue-400 hover:text-blue-700"
                    >
                      <Icon name="X" size={9} />
                    </button>
                  </span>
                ))}
                {selected.tags.length === 0 && (
                  <span className="text-xs text-gray-400">Нет тегов</span>
                )}
              </div>
              <div className="flex gap-1">
                <Input
                  className="h-6 text-xs flex-1"
                  placeholder="Новый тег..."
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={addTag}
                >
                  <Icon name="Plus" size={11} />
                </Button>
              </div>
            </div>

            <Separator className="my-0" />

            {/* Internal note */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Внутренняя заметка</p>
              <Textarea
                className="text-xs resize-none min-h-[72px]"
                placeholder="Заметка для коллег (не видна клиенту)..."
                value={selected.note}
                onChange={e => updateDialog(selected.id, { note: e.target.value })}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs mt-1.5 w-full gap-1"
                onClick={saveNote}
              >
                <Icon name="Save" size={11} />
                Сохранить заметку
              </Button>
            </div>

          </div>
        </ScrollArea>
      </div>

    </div>
  );
};

export default InboxFull;
