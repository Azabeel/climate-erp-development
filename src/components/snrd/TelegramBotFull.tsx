import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type DialogStatus = 'Новый' | 'Ожидает' | 'Отвечено' | 'Бот' | 'Закрыт';

interface Dialog {
  id: string;
  name: string;
  company?: string;
  lastMessage: string;
  time: string;
  status: DialogStatus;
  avatar: string;
  messages: ChatMsg[];
}

interface ChatMsg {
  id: string;
  from: 'client' | 'operator' | 'bot';
  text: string;
  time: string;
}

interface BotCommand {
  id: string;
  command: string;
  description: string;
  response: string;
  enabled: boolean;
}

interface Broadcast {
  id: string;
  audience: string;
  text: string;
  date: string;
  status: 'Запланирована' | 'Отправлена' | 'Черновик';
  count: number;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<DialogStatus, string> = {
  Новый: 'bg-blue-100 text-blue-700',
  Ожидает: 'bg-yellow-100 text-yellow-700',
  Отвечено: 'bg-green-100 text-green-700',
  Бот: 'bg-purple-100 text-purple-700',
  Закрыт: 'bg-gray-100 text-gray-500',
};

const DIALOGS: Dialog[] = [
  {
    id: 'd1', name: 'Иванов Иван', company: 'ООО Арктика', avatar: 'И',
    lastMessage: 'Когда приедет инженер?', time: '10:42', status: 'Новый',
    messages: [
      { id: 'm1', from: 'client', text: 'Здравствуйте! Хотел уточнить статус заявки №WO-2025-001234', time: '10:30' },
      { id: 'm2', from: 'bot', text: 'Добрый день! Заявка №WO-2025-001234 в работе. Инженер назначен.', time: '10:30' },
      { id: 'm3', from: 'client', text: 'Когда приедет инженер?', time: '10:42' },
    ],
  },
  {
    id: 'd2', name: 'Петрова Анна', company: 'ТЦ Меркурий', avatar: 'П',
    lastMessage: 'Спасибо, ждём!', time: '10:35', status: 'Отвечено',
    messages: [
      { id: 'm1', from: 'client', text: 'Нужна плановая замена фильтров в 3 кабинетах', time: '10:20' },
      { id: 'm2', from: 'operator', text: 'Хорошо, оформляем заявку. Удобно завтра с 10:00?', time: '10:25' },
      { id: 'm3', from: 'client', text: 'Да, завтра подходит', time: '10:28' },
      { id: 'm4', from: 'operator', text: 'Отлично! Заявка создана: WO-2025-001240. Инженер Смирнов.', time: '10:30' },
      { id: 'm5', from: 'client', text: 'Спасибо, ждём!', time: '10:35' },
    ],
  },
  {
    id: 'd3', name: 'Сидоров Михаил', avatar: 'С',
    lastMessage: '/status WO-2025-001200', time: '10:28', status: 'Бот',
    messages: [
      { id: 'm1', from: 'client', text: '/status WO-2025-001200', time: '10:28' },
      { id: 'm2', from: 'bot', text: 'Статус заявки WO-2025-001200: ✅ ЗАВЕРШЕНА. Инженер: Козлов А.В. Дата: 17.05.2025', time: '10:28' },
    ],
  },
  {
    id: 'd4', name: 'Козлова Елена', company: 'Офис-Центр', avatar: 'К',
    lastMessage: 'Не работает кондиционер, течёт вода', time: '10:15', status: 'Ожидает',
    messages: [
      { id: 'm1', from: 'client', text: 'Не работает кондиционер, течёт вода', time: '10:15' },
      { id: 'm2', from: 'bot', text: 'Принято! Создаём срочную заявку. Ожидайте звонка диспетчера.', time: '10:15' },
    ],
  },
  {
    id: 'd5', name: 'Новиков Дмитрий', company: 'Ресторан Парус', avatar: 'Н',
    lastMessage: 'Хорошо, принято', time: '09:50', status: 'Закрыт',
    messages: [
      { id: 'm1', from: 'client', text: 'Нужна чистка сплит-системы на кухне', time: '09:40' },
      { id: 'm2', from: 'operator', text: 'Записали на 20 мая в 11:00. Стоимость: 2500 руб.', time: '09:45' },
      { id: 'm3', from: 'client', text: 'Хорошо, принято', time: '09:50' },
    ],
  },
  {
    id: 'd6', name: 'Морозова Светлана', avatar: 'М',
    lastMessage: 'А сколько стоит установка?', time: '09:30', status: 'Новый',
    messages: [
      { id: 'm1', from: 'client', text: 'Здравствуйте', time: '09:25' },
      { id: 'm2', from: 'bot', text: 'Добрый день! Чем могу помочь?', time: '09:25' },
      { id: 'm3', from: 'client', text: 'А сколько стоит установка?', time: '09:30' },
    ],
  },
  {
    id: 'd7', name: 'Васильев Алексей', company: 'Банк Альфа', avatar: 'В',
    lastMessage: 'ОК, спасибо за оперативность', time: '09:10', status: 'Отвечено',
    messages: [
      { id: 'm1', from: 'client', text: 'Нужен выезд для диагностики серверной', time: '09:00' },
      { id: 'm2', from: 'operator', text: 'Сегодня в 15:00 подойдёт? Инженер Федоров.', time: '09:05' },
      { id: 'm3', from: 'client', text: 'ОК, спасибо за оперативность', time: '09:10' },
    ],
  },
  {
    id: 'd8', name: 'Зайцева Ольга', avatar: 'З',
    lastMessage: '/new_request', time: '08:55', status: 'Бот',
    messages: [
      { id: 'm1', from: 'client', text: '/new_request', time: '08:55' },
      { id: 'm2', from: 'bot', text: 'Создание новой заявки. Опишите проблему:', time: '08:55' },
      { id: 'm3', from: 'client', text: 'Кондиционер не охлаждает', time: '08:57' },
      { id: 'm4', from: 'bot', text: '✅ Заявка создана! Номер: WO-2025-001242. Диспетчер свяжется в течение 30 минут.', time: '08:57' },
    ],
  },
  {
    id: 'd9', name: 'Лебедев Игорь', company: 'Аптека Здоровье', avatar: 'Л',
    lastMessage: 'Ждём инженера', time: '08:40', status: 'Ожидает',
    messages: [
      { id: 'm1', from: 'client', text: 'Аварийная ситуация — сломался кулер в медикаментозном складе', time: '08:35' },
      { id: 'm2', from: 'bot', text: '🚨 АВАРИЙНАЯ заявка создана! Инженер выедет в течение 2 часов.', time: '08:35' },
      { id: 'm3', from: 'client', text: 'Ждём инженера', time: '08:40' },
    ],
  },
  {
    id: 'd10', name: 'Соколова Мария', company: 'Фитнес Актив', avatar: 'С',
    lastMessage: 'Квитанция оплачена', time: '08:20', status: 'Закрыт',
    messages: [
      { id: 'm1', from: 'client', text: '/pay', time: '08:15' },
      { id: 'm2', from: 'bot', text: 'Счёт №INV-2025-0521 на сумму 8 500 руб. Ссылка для оплаты: pay.servisklimat.ru/abc123', time: '08:15' },
      { id: 'm3', from: 'client', text: 'Квитанция оплачена', time: '08:20' },
    ],
  },
];

const INIT_COMMANDS: BotCommand[] = [
  { id: 'c1', command: '/start', description: 'Приветствие и меню', enabled: true,
    response: '👋 Добро пожаловать в Сервис Климат!\n\nЯ помогу вам:\n• Создать заявку\n• Узнать статус\n• Оплатить счёт\n\nВыберите действие 👇' },
  { id: 'c2', command: '/status', description: 'Статус заявки по номеру', enabled: true,
    response: 'Введите номер заявки (например WO-2025-001234):' },
  { id: 'c3', command: '/new_request', description: 'Создать новую заявку', enabled: true,
    response: '📋 Создание заявки\n\nОпишите проблему, и я передам её диспетчеру.' },
  { id: 'c4', command: '/my_orders', description: 'Мои заявки', enabled: true,
    response: 'Загружаю ваши активные заявки...' },
  { id: 'c5', command: '/pay', description: 'Оплатить счёт', enabled: true,
    response: 'Поиск неоплаченных счетов по вашему аккаунту...' },
  { id: 'c6', command: '/call', description: 'Заказать звонок', enabled: true,
    response: '📞 Заказать обратный звонок?\n\nДиспетчер перезвонит в течение 15 минут в рабочее время.' },
  { id: 'c7', command: '/help', description: 'Помощь и контакты', enabled: true,
    response: '❓ Помощь\n\nТелефон: +7 (495) 123-45-67\nEmail: info@servisklimat.ru\nРабочие часы: Пн-Пт 9:00-18:00' },
];

const BROADCASTS: Broadcast[] = [
  { id: 'b1', audience: 'Все клиенты', text: 'Уважаемые клиенты! Напоминаем о необходимости планового ТО перед летним сезоном...', date: '20.05.2025 10:00', status: 'Запланирована', count: 247 },
  { id: 'b2', audience: 'Договорные клиенты', text: 'Для клиентов с договором ТО: плановые работы запланированы на следующей неделе...', date: '18.05.2025 14:00', status: 'Отправлена', count: 84 },
  { id: 'b3', audience: 'Должники', text: 'Уважаемый клиент, у вас есть неоплаченный счёт. Просим оплатить до 25.05.2025...', date: '', status: 'Черновик', count: 12 },
];

const LINE_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  messages: Math.floor(50 + Math.random() * 80),
}));

const BAR_DATA = [
  { command: '/start', count: 312 },
  { command: '/status', count: 198 },
  { command: '/new_request', count: 145 },
  { command: '/my_orders', count: 89 },
  { command: '/pay', count: 67 },
  { command: '/call', count: 43 },
  { command: '/help', count: 38 },
];

const AUDIENCE_OPTIONS = [
  'Все клиенты',
  'Договорные клиенты',
  'Без договора',
  'Должники',
  'Клиенты без заявок 90+ дней',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BotStatusBar() {
  return (
    <Card className="mb-4">
      <CardContent className="py-3 px-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-sm">@ServisKlimat_bot</span>
          <Badge className="bg-green-100 text-green-700 text-xs">Online</Badge>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <span><b className="text-gray-900">247</b> подписчиков</span>
          <span><b className="text-gray-900">89</b> сообщений сегодня</span>
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success('Бот перезапущен')}>
            <Icon name="RefreshCw" className="w-4 h-4 mr-1" />
            Перезапустить бота
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success('Тест-сообщение отправлено в @ServisKlimat_bot')}>
            <Icon name="Send" className="w-4 h-4 mr-1" />
            Тест-сообщение
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MsgBubble({ msg }: { msg: ChatMsg }) {
  const isClient = msg.from === 'client';
  const isBot = msg.from === 'bot';
  return (
    <div className={`flex ${isClient ? 'justify-start' : 'justify-end'} mb-2`}>
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
        isClient ? 'bg-gray-100 text-gray-800' :
        isBot ? 'bg-purple-100 text-purple-900' : 'bg-blue-500 text-white'
      }`}>
        {isBot && <p className="text-[10px] font-semibold mb-0.5 text-purple-600">🤖 Бот</p>}
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <p className={`text-[10px] mt-1 ${isClient ? 'text-gray-400' : isBot ? 'text-purple-400' : 'text-blue-100'}`}>{msg.time}</p>
      </div>
    </div>
  );
}

// ─── Dialogs Tab ──────────────────────────────────────────────────────────────

function DialogsTab() {
  const [selected, setSelected] = useState<Dialog | null>(DIALOGS[0]);
  const [inputMsg, setInputMsg] = useState('');

  return (
    <div className="flex gap-3 h-[560px]">
      {/* List */}
      <Card className="w-72 flex-shrink-0 overflow-hidden">
        <CardHeader className="py-3 px-3 border-b">
          <CardTitle className="text-sm">Активные диалоги</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[500px]">
          {DIALOGS.map(d => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className={`w-full text-left px-3 py-2.5 border-b last:border-0 hover:bg-gray-50 transition-colors ${selected?.id === d.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm flex-shrink-0">
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{d.name}</span>
                    <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">{d.time}</span>
                  </div>
                  {d.company && <p className="text-[10px] text-gray-500 truncate">{d.company}</p>}
                  <p className="text-xs text-gray-500 truncate mt-0.5">{d.lastMessage}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 mt-1 ${STATUS_COLOR[d.status]}`}>{d.status}</Badge>
                </div>
              </div>
            </button>
          ))}
        </ScrollArea>
      </Card>

      {/* Chat */}
      {selected ? (
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 border-b flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">{selected.name}</CardTitle>
              {selected.company && <p className="text-xs text-gray-500">{selected.company}</p>}
            </div>
            <Badge className={`text-xs ${STATUS_COLOR[selected.status]}`}>{selected.status}</Badge>
          </CardHeader>
          <ScrollArea className="flex-1 px-4 py-3">
            {selected.messages.map(m => <MsgBubble key={m.id} msg={m} />)}
          </ScrollArea>
          <div className="px-4 py-3 border-t flex gap-2">
            <Input
              placeholder="Введите сообщение..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              className="flex-1"
              onKeyDown={e => {
                if (e.key === 'Enter' && inputMsg.trim()) {
                  toast.success('Сообщение отправлено');
                  setInputMsg('');
                }
              }}
            />
            <Button size="sm" onClick={() => { if (inputMsg.trim()) { toast.success('Сообщение отправлено'); setInputMsg(''); } }}>
              <Icon name="Send" className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.info(`Диалог передан оператору`)}>
              <Icon name="UserCheck" className="w-4 h-4 mr-1" />
              Оператору
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center text-gray-400">
          <p>Выберите диалог</p>
        </Card>
      )}
    </div>
  );
}

// ─── Commands Tab ─────────────────────────────────────────────────────────────

function CommandsTab() {
  const [commands, setCommands] = useState<BotCommand[]>(INIT_COMMANDS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  function toggleEnabled(id: string) {
    setCommands(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  }

  function startEdit(cmd: BotCommand) {
    setEditingId(cmd.id);
    setEditText(cmd.response);
  }

  function saveEdit(id: string) {
    setCommands(prev => prev.map(c => c.id === id ? { ...c, response: editText } : c));
    setEditingId(null);
    toast.success('Ответ команды сохранён');
  }

  return (
    <div className="space-y-3">
      {commands.map(cmd => (
        <Card key={cmd.id}>
          <CardContent className="py-3 px-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-semibold text-blue-600">{cmd.command}</span>
                  <span className="text-sm text-gray-500">— {cmd.description}</span>
                </div>
                {editingId === cmd.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      className="w-full border rounded-md px-3 py-2 text-sm font-mono resize-y min-h-[80px]"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(cmd.id)}>
                        <Icon name="Save" className="w-4 h-4 mr-1" />
                        Сохранить
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Отмена</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 font-mono whitespace-pre-wrap line-clamp-2">{cmd.response}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch checked={cmd.enabled} onCheckedChange={() => toggleEnabled(cmd.id)} />
                <Button size="sm" variant="ghost" onClick={() => startEdit(cmd)}>
                  <Icon name="Pencil" className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Broadcasts Tab ───────────────────────────────────────────────────────────

function BroadcastsTab() {
  const [audience, setAudience] = useState('');
  const [text, setText] = useState('');
  const [datetime, setDatetime] = useState('');

  const STATUS_BADGE: Record<Broadcast['status'], string> = {
    Запланирована: 'bg-blue-100 text-blue-700',
    Отправлена: 'bg-green-100 text-green-700',
    Черновик: 'bg-gray-100 text-gray-600',
  };

  function handleSend() {
    if (!audience || !text) { toast.error('Заполните аудиторию и текст'); return; }
    const cnt = audience === 'Все клиенты' ? 247 : audience === 'Договорные клиенты' ? 84 : 12;
    toast.success(`Рассылка отправлена ${cnt} получателям`);
    setText(''); setAudience(''); setDatetime('');
  }

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="space-y-3">
        {BROADCASTS.map(b => (
          <Card key={b.id}>
            <CardContent className="py-3 px-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${STATUS_BADGE[b.status]}`}>{b.status}</Badge>
                  <span className="text-sm font-medium">{b.audience}</span>
                  <span className="text-xs text-gray-400">• {b.count} получателей</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{b.text}</p>
                {b.date && <p className="text-xs text-gray-400 mt-1">📅 {b.date}</p>}
              </div>
              {b.status !== 'Отправлена' && (
                <Button size="sm" variant="outline" onClick={() => toast.success(`Рассылка отправлена ${b.count} получателям`)}>
                  <Icon name="Send" className="w-4 h-4 mr-1" />
                  Отправить
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create form */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon name="PlusCircle" className="w-4 h-4" />
            Создать рассылку
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 px-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Аудитория</label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите аудиторию..." />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Текст сообщения</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm resize-y min-h-[80px]"
              placeholder="Введите текст рассылки..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Дата и время (необязательно)</label>
            <Input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} />
          </div>
          <Button onClick={handleSend} className="w-full">
            <Icon name="Send" className="w-4 h-4 mr-2" />
            {datetime ? 'Запланировать' : 'Отправить сейчас'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Подписчиков', value: '247', icon: 'Users', color: 'text-blue-600' },
          { label: 'Сообщений сегодня', value: '89', icon: 'MessageSquare', color: 'text-green-600' },
          { label: 'Конверсия в заявки', value: '12%', icon: 'TrendingUp', color: 'text-purple-600' },
          { label: 'Среднее время ответа', value: '3.2 мин', icon: 'Clock', color: 'text-orange-600' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <Icon name={kpi.icon as any} className={`w-8 h-8 ${kpi.color}`} />
              <div>
                <p className="text-lg font-bold">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Line chart */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm">Сообщений в день (30 дней)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={LINE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar chart */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm">Популярность команд</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BAR_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="command" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const [autoReply, setAutoReply] = useState(true);
  const [offHoursMsg, setOffHoursMsg] = useState(
    'Спасибо за обращение! Наш рабочий день — Пн-Пт 9:00-18:00. Мы ответим в ближайшее рабочее время.'
  );
  const [webhook, setWebhook] = useState('https://api.servisklimat.ru/webhook/telegram');

  function saveSettings() {
    toast.success('Настройки сохранены');
  }

  return (
    <div className="space-y-4 max-w-xl">
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm">Подключение</CardTitle>
        </CardHeader>
        <CardContent className="py-4 px-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Токен бота</label>
            <div className="flex gap-2">
              <Input value="7312••••••••••••••••••••••••••••FeK" readOnly className="font-mono text-sm" />
              <Button size="sm" variant="outline" onClick={() => toast.info('Токен скопирован')}>
                <Icon name="Copy" className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Webhook URL</label>
            <div className="flex gap-2">
              <Input value={webhook} onChange={e => setWebhook(e.target.value)} className="font-mono text-sm" />
              <Button size="sm" variant="outline" onClick={() => toast.success('Webhook обновлён')}>
                <Icon name="RefreshCw" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm">Автоответ</CardTitle>
        </CardHeader>
        <CardContent className="py-4 px-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Включить автоответ</p>
              <p className="text-xs text-gray-500">Бот отвечает на незарегистрированные команды</p>
            </div>
            <Switch checked={autoReply} onCheckedChange={setAutoReply} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Сообщение в нерабочие часы</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm resize-y min-h-[80px]"
              value={offHoursMsg}
              onChange={e => setOffHoursMsg(e.target.value)}
            />
          </div>
          <Button onClick={saveSettings}>
            <Icon name="Save" className="w-4 h-4 mr-2" />
            Сохранить настройки
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function TelegramBotFull() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Send" className="w-5 h-5 text-blue-500" />
        <h1 className="text-xl font-bold">Интеграция Telegram-бота</h1>
      </div>

      <BotStatusBar />

      <Tabs defaultValue="dialogs">
        <TabsList className="mb-4">
          <TabsTrigger value="dialogs">
            <Icon name="MessageSquare" className="w-4 h-4 mr-1" />
            Диалоги
          </TabsTrigger>
          <TabsTrigger value="commands">
            <Icon name="Terminal" className="w-4 h-4 mr-1" />
            Команды
          </TabsTrigger>
          <TabsTrigger value="broadcasts">
            <Icon name="Megaphone" className="w-4 h-4 mr-1" />
            Рассылки
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Icon name="BarChart2" className="w-4 h-4 mr-1" />
            Аналитика
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Icon name="Settings" className="w-4 h-4 mr-1" />
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dialogs"><DialogsTab /></TabsContent>
        <TabsContent value="commands"><CommandsTab /></TabsContent>
        <TabsContent value="broadcasts"><BroadcastsTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
