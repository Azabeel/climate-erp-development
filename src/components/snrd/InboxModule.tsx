import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';

type Channel =
  | 'Telegram'
  | 'WhatsApp'
  | 'Email'
  | 'Avito'
  | 'WebsiteChat'
  | 'Phone'
  | 'MAX';

type AITag = 'Новая заявка' | 'Жалоба' | 'Вопрос' | 'Спам' | 'КП' | 'ТО';

interface MessageItem {
  id: string;
  channel: Channel;
  sender: string;
  senderInfo?: string;
  preview: string;
  fullText: string;
  timestamp: string;
  unread: boolean;
  aiTag: AITag;
  aiReply: string;
  attachments?: string[];
  folder: 'inbox' | 'unassigned';
}

interface FolderItem {
  key: string;
  title: string;
  icon: string;
  count: number;
  color?: string;
}

const FOLDERS: FolderItem[] = [
  { key: 'all', title: 'Все сообщения', icon: 'Inbox', count: 47 },
  { key: 'unassigned', title: 'Неназначенные', icon: 'AlertCircle', count: 12, color: 'text-orange-600' },
  { key: 'Telegram', title: 'Telegram', icon: 'Send', count: 8, color: 'text-blue-500' },
  { key: 'WhatsApp', title: 'WhatsApp', icon: 'MessageCircle', count: 15, color: 'text-green-600' },
  { key: 'Email', title: 'Email', icon: 'Mail', count: 10, color: 'text-gray-700' },
  { key: 'Avito', title: 'Avito', icon: 'Store', count: 5, color: 'text-blue-700' },
  { key: 'WebsiteChat', title: 'Чат на сайте', icon: 'MessageSquare', count: 4, color: 'text-purple-600' },
  { key: 'Phone', title: 'Звонки', icon: 'Phone', count: 3, color: 'text-emerald-600' },
  { key: 'MAX', title: 'MAX', icon: 'Zap', count: 2, color: 'text-pink-600' },
];

const MESSAGES: MessageItem[] = [
  {
    id: 'm1',
    channel: 'WhatsApp',
    sender: 'ООО «Арктика»',
    senderInfo: '+7 (495) 234-56-78',
    preview: 'Не работает кондей в офисе, срочно нужен мастер!',
    fullText:
      'Здравствуйте! У нас в офисе на Тверской не работает центральный кондиционер. Сегодня жара, сотрудники жалуются. Очень срочно нужен мастер, мы постоянные клиенты с 2022 года. Договор №К-2024-115.',
    timestamp: '2 мин назад',
    unread: true,
    aiTag: 'Новая заявка',
    aiReply:
      'Здравствуйте! Заявка принята, инженер Петров А.С. выедет в течение 2 часов. Номер наряда: WO-2026-1342. Уточните, пожалуйста, тип установки и год монтажа?',
    folder: 'unassigned',
  },
  {
    id: 'm2',
    channel: 'Email',
    sender: 'Иван Петров',
    senderInfo: 'i.petrov@megaholod.ru',
    preview: 'Запрос КП на ТО 3 кондиционеров Daikin FTXB60C',
    fullText:
      'Добрый день! Просим направить коммерческое предложение на годовое техническое обслуживание трёх настенных сплит-систем Daikin FTXB60C, установленных в нашем главном офисе. Желаемая периодичность — 2 раза в год.',
    timestamp: '15 мин назад',
    unread: true,
    aiTag: 'КП',
    aiReply:
      'Иван, благодарим за обращение! Подготовим КП с тремя вариантами (Базовый/Оптимальный/Премиум) в течение рабочего дня. Уточните, нужна ли заправка хладагентом R-410A?',
    folder: 'inbox',
  },
  {
    id: 'm3',
    channel: 'Telegram',
    sender: 'ТЦ «Мега»',
    senderInfo: '@mega_tc_admin',
    preview: 'Жалоба на качество работ от 10.05 — повторно течёт дренаж',
    fullText:
      'Здравствуйте. Вчера ваши инженеры провели ТО кассетных кондиционеров на 2 этаже (наряд WO-2026-1120). Сегодня снова течёт дренаж в торговом зале. Просим вернуться по гарантии срочно.',
    timestamp: '38 мин назад',
    unread: true,
    aiTag: 'Жалоба',
    aiReply:
      'Здравствуйте! Приносим извинения. Гарантийный наряд оформлен (WO-2026-1343), инженер выедет в течение часа. Передам информацию руководителю сервиса.',
    folder: 'inbox',
  },
  {
    id: 'm4',
    channel: 'Avito',
    sender: 'Сергей К.',
    senderInfo: 'Авито профиль',
    preview: 'Сколько стоит установка сплит-системы 9-ка в однушке?',
    fullText:
      'Здравствуйте, хочу установить кондиционер в однокомнатную квартиру, площадь 35 м². Сколько будет стоить под ключ с материалами? Этаж 7-й, нужны ли альпинисты?',
    timestamp: '1 час назад',
    unread: true,
    aiTag: 'Вопрос',
    aiReply:
      'Здравствуйте! Стандартный монтаж 9-ки под ключ — от 12 500 ₽ (трасса до 3 м, кронштейн, кабель ПВС). На 7 этаже альпинисты не нужны, работаем с подоконника. Готовы выехать на бесплатный замер!',
    folder: 'inbox',
  },
  {
    id: 'm5',
    channel: 'WebsiteChat',
    sender: 'Анна Соколова',
    senderInfo: 'Чат на сайте',
    preview: 'Здравствуйте, нужна консультация по выбору модели',
    fullText:
      'Добрый день! Помогите выбрать кондиционер для спальни 18 м². Хочу с инвертором и зимним комплектом, чтобы можно было включать зимой. Бюджет до 60 000 ₽.',
    timestamp: '1 час назад',
    unread: false,
    aiTag: 'Вопрос',
    aiReply:
      'Анна, рекомендую модели Mitsubishi Electric MSZ-LN25VG или Daikin FTXM20R с зимним комплектом. Уложимся в 55–58 тыс. с монтажом. Прислать развёрнутое сравнение?',
    folder: 'inbox',
  },
  {
    id: 'm6',
    channel: 'Phone',
    sender: '+7 (916) 123-45-67',
    senderInfo: 'Входящий звонок, 03:24',
    preview: 'Запись разговора: запрос на срочный ремонт VRF',
    fullText:
      'Клиент: «У нас в ресторане Хорошёвский остановилась внешняя VRF Mitsubishi, мигает E5. Можете приехать сегодня?» Менеджер: «Да, оформляю экспресс-вызов».',
    timestamp: '2 часа назад',
    unread: false,
    aiTag: 'Новая заявка',
    aiReply: 'Заявка уже создана: APP-2026-901. Передайте клиенту ETA инженера.',
    folder: 'inbox',
  },
  {
    id: 'm7',
    channel: 'Telegram',
    sender: 'Михаил Громов',
    senderInfo: '@m_gromov',
    preview: 'Спасибо за работу! Всё отлично, оплатили счёт',
    fullText:
      'Добрый день! Хочу поблагодарить инженера Сидорова — приехал вовремя, работал аккуратно, всё объяснил. Счёт INV-2026-440 оплатили сегодня утром.',
    timestamp: '3 часа назад',
    unread: false,
    aiTag: 'Вопрос',
    aiReply:
      'Михаил, благодарим за обратную связь! Передадим инженеру Сидорову. Будем рады видеть вас снова!',
    folder: 'inbox',
  },
  {
    id: 'm8',
    channel: 'WhatsApp',
    sender: 'Кафе «Лимон»',
    senderInfo: '+7 (903) 555-12-34',
    preview: 'Когда приедет инженер по наряду WO-2026-1289?',
    fullText:
      'Подскажите, пожалуйста, когда ждать мастера? Записаны были на 14:00, уже 14:40, никого нет. Кухня без вытяжки, готовить не можем.',
    timestamp: '4 часа назад',
    unread: false,
    aiTag: 'Жалоба',
    aiReply:
      'Приносим извинения за задержку! Инженер Кузнецов задержался на предыдущем объекте, прибудет в течение 30 минут. ETA отслеживается в системе.',
    folder: 'inbox',
  },
  {
    id: 'm9',
    channel: 'Email',
    sender: 'Бухгалтерия ООО «Глобус»',
    senderInfo: 'buh@globus-tk.ru',
    preview: 'Запрос акта сверки за апрель 2026',
    fullText:
      'Добрый день! Просим направить акт сверки взаиморасчётов за апрель 2026 г. Договор №К-2025-008. По нашим данным сальдо 0 ₽.',
    timestamp: '5 часов назад',
    unread: false,
    aiTag: 'Вопрос',
    aiReply:
      'Здравствуйте! Подготовим акт сверки и направим до конца рабочего дня по ЭДО Диадок.',
    folder: 'inbox',
  },
  {
    id: 'm10',
    channel: 'Avito',
    sender: 'Дмитрий Носов',
    senderInfo: 'Авито профиль',
    preview: 'Заправка фреоном R-22, возможно ли?',
    fullText:
      'Старый кондей Mitsubishi 2009 года, нужна заправка R-22. Делаете? Какая цена за грамм?',
    timestamp: '6 часов назад',
    unread: false,
    aiTag: 'Вопрос',
    aiReply:
      'Дмитрий, работаем с R-22 (есть на складе). Заправка под вакуум — от 6 500 ₽ + 80 ₽/гр. Рекомендуем также проверить герметичность системы.',
    folder: 'inbox',
  },
  {
    id: 'm11',
    channel: 'MAX',
    sender: 'Иванова Е.М.',
    senderInfo: 'MAX мессенджер',
    preview: 'Перенесите ТО на следующую неделю, пожалуйста',
    fullText:
      'Здравствуйте, у нас плановое ТО назначено на 15.05 в 10:00. Можно ли перенести на 19.05 после обеда? Будем в отпуске.',
    timestamp: '8 часов назад',
    unread: false,
    aiTag: 'Вопрос',
    aiReply:
      'Конечно! Перенесли ТО на 19.05.2026 в 14:00. Подтверждение придёт в SMS и Telegram. Хорошего отпуска!',
    folder: 'inbox',
  },
  {
    id: 'm12',
    channel: 'Email',
    sender: 'spam@offer-pro.biz',
    senderInfo: 'Рассылка',
    preview: 'СУПЕР-ВЫГОДНОЕ ПРЕДЛОЖЕНИЕ! Скидки 70%!',
    fullText: 'Только сегодня! Купите курсы по SEO со скидкой 70%! Звоните!',
    timestamp: 'вчера',
    unread: false,
    aiTag: 'Спам',
    aiReply: '— Помечено как спам —',
    folder: 'inbox',
  },
  {
    id: 'm13',
    channel: 'WhatsApp',
    sender: 'Гипермаркет «Лента»',
    senderInfo: '+7 (495) 777-88-99',
    preview: 'Согласование графика ППР на II квартал',
    fullText:
      'Добрый день! Просим согласовать график планово-предупредительных ремонтов холодильного оборудования на II квартал 2026. Объекты: Каширское ш., Варшавское ш.',
    timestamp: 'вчера в 16:42',
    unread: false,
    aiTag: 'ТО',
    aiReply:
      'Здравствуйте! Передаём запрос менеджеру по ключевым клиентам. График согласуем в течение 2 рабочих дней.',
    folder: 'inbox',
  },
  {
    id: 'm14',
    channel: 'Telegram',
    sender: 'Бизнес-центр «Северная Башня»',
    senderInfo: '@severnaya_bc',
    preview: 'Нужен срочный ремонт чиллера, простой производства',
    fullText:
      'Чиллер York YCSA-150 встал в аварию по коду F12. Производство встало, теряем деньги. Можете выехать сегодня в течение 2 часов?',
    timestamp: 'вчера в 14:10',
    unread: false,
    aiTag: 'Новая заявка',
    aiReply:
      'Принято! Выезд аварийной бригады в течение 90 минут (Соколов + Лебедев). Наряд WO-2026-1338. По прибытии диагностика — 4 500 ₽.',
    folder: 'inbox',
  },
  {
    id: 'm15',
    channel: 'WebsiteChat',
    sender: 'Гость #4429',
    senderInfo: 'Чат на сайте',
    preview: 'Какие бренды устанавливаете? Есть ли гарантия?',
    fullText:
      'Здравствуйте, рассматриваю установку кондиционера. С какими брендами работаете и какая гарантия на монтаж?',
    timestamp: 'вчера в 12:05',
    unread: false,
    aiTag: 'Вопрос',
    aiReply:
      'Здравствуйте! Работаем с Daikin, Mitsubishi Electric, Mitsubishi Heavy, Hisense, Haier, Royal Clima и др. Гарантия на монтажные работы — 3 года, на оборудование — заводская.',
    folder: 'inbox',
  },
];

const channelMeta: Record<Channel, { icon: string; color: string; bg: string; label: string }> = {
  Telegram: { icon: 'Send', color: 'text-blue-500', bg: 'bg-blue-50', label: 'Telegram' },
  WhatsApp: { icon: 'MessageCircle', color: 'text-green-600', bg: 'bg-green-50', label: 'WhatsApp' },
  Email: { icon: 'Mail', color: 'text-gray-700', bg: 'bg-gray-100', label: 'Email' },
  Avito: { icon: 'Store', color: 'text-blue-700', bg: 'bg-blue-50', label: 'Avito' },
  WebsiteChat: { icon: 'MessageSquare', color: 'text-purple-600', bg: 'bg-purple-50', label: 'Чат сайта' },
  Phone: { icon: 'Phone', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Звонок' },
  MAX: { icon: 'Zap', color: 'text-pink-600', bg: 'bg-pink-50', label: 'MAX' },
};

const aiTagColor: Record<AITag, string> = {
  'Новая заявка': 'bg-blue-100 text-blue-700',
  Жалоба: 'bg-red-100 text-red-700',
  Вопрос: 'bg-gray-100 text-gray-700',
  Спам: 'bg-zinc-200 text-zinc-600',
  КП: 'bg-amber-100 text-amber-800',
  ТО: 'bg-emerald-100 text-emerald-700',
};

export default function InboxModule() {
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string>('m1');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');

  const filtered = MESSAGES.filter((m) => {
    if (activeFolder === 'all') return true;
    if (activeFolder === 'unassigned') return m.folder === 'unassigned';
    return m.channel === activeFolder;
  }).filter((m) =>
    search ? (m.sender + m.preview).toLowerCase().includes(search.toLowerCase()) : true,
  );

  const selected = MESSAGES.find((m) => m.id === selectedId) ?? filtered[0];

  const handleAIReply = () => {
    if (!selected) return;
    setReplyText(selected.aiReply);
    toast.success('AI-ответ сгенерирован');
  };

  const handleSend = () => {
    if (!replyText.trim()) {
      toast.error('Введите текст ответа');
      return;
    }
    toast.success(`Ответ отправлен в ${channelMeta[selected.channel].label}`);
    setReplyText('');
  };

  const handleAction = (action: string) => {
    toast.success(action);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4 bg-gray-50 p-4">
      {/* LEFT: Folders */}
      <Card className="w-[260px] shrink-0 shadow-sm">
        <CardContent className="p-3">
          <div className="mb-3 flex items-center gap-2 px-2">
            <Icon name="Inbox" size={18} className="text-blue-600" />
            <h2 className="text-sm font-semibold">Inbox</h2>
          </div>
          <Separator className="mb-3" />
          <div className="space-y-1">
            {FOLDERS.map((f) => {
              const active = activeFolder === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFolder(f.key)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name={f.icon} size={16} className={f.color ?? 'text-gray-500'} />
                    {f.title}
                  </span>
                  <Badge variant={active ? 'default' : 'secondary'} className="text-[10px]">
                    {f.count}
                  </Badge>
                </button>
              );
            })}
          </div>
          <Separator className="my-4" />
          <div className="px-2 text-xs text-gray-500">Метки</div>
          <div className="mt-2 space-y-1 px-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-red-500" /> VIP-клиенты
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Требуют ответа
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Постоянные
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CENTER: Message list */}
      <Card className="w-[400px] shrink-0 shadow-sm">
        <CardContent className="flex h-full flex-col p-0">
          <div className="border-b p-3">
            <div className="relative">
              <Icon
                name="Search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Поиск по сообщениям..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{filtered.length} сообщений</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                <Icon name="Filter" size={12} className="mr-1" />
                Сортировка
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filtered.map((m) => {
                const meta = channelMeta[m.channel];
                const active = selected?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`flex w-full gap-3 p-3 text-left transition-colors ${
                      active ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                      <Icon name={meta.icon} size={16} className={meta.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm ${m.unread ? 'font-semibold' : 'font-medium'}`}>
                          {m.sender}
                        </span>
                        <span className="shrink-0 text-[11px] text-gray-500">{m.timestamp}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-gray-600">
                        {m.preview.length > 60 ? m.preview.slice(0, 60) + '…' : m.preview}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge className={`px-1.5 py-0 text-[10px] ${aiTagColor[m.aiTag]}`} variant="outline">
                          {m.aiTag}
                        </Badge>
                        {m.unread && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">Сообщений нет</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* RIGHT: Message thread */}
      <Card className="flex-1 shadow-sm">
        <CardContent className="flex h-full flex-col p-0">
          {selected ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${channelMeta[selected.channel].bg}`}
                  >
                    <Icon
                      name={channelMeta[selected.channel].icon}
                      size={18}
                      className={channelMeta[selected.channel].color}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{selected.sender}</div>
                    <div className="text-xs text-gray-500">
                      {channelMeta[selected.channel].label} · {selected.senderInfo}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleAction('Помечено прочитанным')}>
                    <Icon name="CheckCheck" size={14} className="mr-1" /> Прочитано
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAction('Создана заявка APP-2026-902')}>
                    <Icon name="FilePlus" size={14} className="mr-1" /> В заявку
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAction('Создан лид')}>
                    <Icon name="UserPlus" size={14} className="mr-1" /> В лиды
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Icon name="MoreHorizontal" size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('Архивировано')}>
                        <Icon name="Archive" size={14} className="mr-2" /> В архив
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Отложено на 1 час')}>
                        <Icon name="Clock" size={14} className="mr-2" /> Отложить
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Помечено спамом')}>
                        <Icon name="Ban" size={14} className="mr-2" /> Спам
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Thread */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                      {selected.sender.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="rounded-lg rounded-tl-none bg-gray-100 p-3 text-sm text-gray-800">
                        {selected.fullText}
                      </div>
                      <div className="mt-1 text-[11px] text-gray-500">{selected.timestamp}</div>
                    </div>
                  </div>

                  {selected.attachments && selected.attachments.length > 0 && (
                    <div className="ml-11 flex gap-2">
                      {selected.attachments.map((_a, i) => (
                        <div
                          key={i}
                          className="flex h-20 w-20 items-center justify-center rounded-md border bg-gray-50 text-xs text-gray-500"
                        >
                          <Icon name="Image" size={24} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-blue-700">
                      <Icon name="Sparkles" size={14} /> AI-предложение ответа
                    </div>
                    <div className="text-sm text-gray-800">{selected.aiReply}</div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAIReply}>
                        Использовать
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.info('Перегенерирую…')}>
                        <Icon name="RefreshCw" size={12} className="mr-1" /> Другой вариант
                      </Button>
                    </div>
                  </div>

                  <div className="ml-11 flex gap-2 text-xs">
                    <Button variant="outline" size="sm" className="h-7" onClick={() => handleAction('Связано с клиентом')}>
                      <Icon name="Link2" size={12} className="mr-1" /> Связать с клиентом
                    </Button>
                    <Button variant="outline" size="sm" className="h-7" onClick={() => handleAction('Создан наряд WO-2026-1344')}>
                      <Icon name="Wrench" size={12} className="mr-1" /> В наряд
                    </Button>
                  </div>
                </div>
              </ScrollArea>

              {/* Reply box */}
              <div className="border-t p-3">
                <Textarea
                  placeholder={`Ответить в ${channelMeta[selected.channel].label}…`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={handleAIReply}>
                      <Icon name="Sparkles" size={14} className="mr-1 text-blue-600" /> AI ответ
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Прикрепить файл')}>
                      <Icon name="Paperclip" size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Эмодзи')}>
                      <Icon name="Smile" size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Шаблоны')}>
                      <Icon name="FileText" size={14} className="mr-1" /> Шаблоны
                    </Button>
                  </div>
                  <Button size="sm" onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
                    <Icon name="Send" size={14} className="mr-1" /> Отправить
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Выберите сообщение
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
