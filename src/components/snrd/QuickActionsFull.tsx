import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  shortcut?: string;
  toastMessage: string;
}

interface MyTask {
  id: string;
  title: string;
  deadline: string;
  deadlineType: 'today' | 'overdue' | 'upcoming';
  priority: 'high' | 'medium' | 'low';
  done: boolean;
}

interface RecentObject {
  id: string;
  type: 'order' | 'client' | 'request';
  number: string;
  client: string;
  status: string;
  statusVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: string;
  color: string;
}

interface Notification {
  id: string;
  icon: string;
  color: string;
  text: string;
  time: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'create-request',
    label: 'Создать заявку',
    description: 'Новая заявка на обслуживание',
    icon: 'ClipboardList',
    color: 'text-blue-600',
    bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100',
    shortcut: 'Ctrl+N',
    toastMessage: 'Открыта форма создания заявки',
  },
  {
    id: 'assign-engineer',
    label: 'Назначить инженера',
    description: 'Подобрать исполнителя для заявки',
    icon: 'UserCheck',
    color: 'text-purple-600',
    bg: 'bg-purple-50 hover:bg-purple-100 border-purple-100',
    toastMessage: 'Открыт модуль назначения инженера',
  },
  {
    id: 'create-order',
    label: 'Создать наряд',
    description: 'Новый наряд на выполнение работ',
    icon: 'Wrench',
    color: 'text-green-600',
    bg: 'bg-green-50 hover:bg-green-100 border-green-100',
    toastMessage: 'Открыта форма создания наряда',
  },
  {
    id: 'add-client',
    label: 'Добавить клиента',
    description: 'Зарегистрировать нового клиента',
    icon: 'UserPlus',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100',
    toastMessage: 'Открыта карточка нового клиента',
  },
  {
    id: 'search-client',
    label: 'Поиск клиента',
    description: 'Быстрый поиск в базе клиентов',
    icon: 'Search',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-100',
    shortcut: 'Ctrl+K',
    toastMessage: 'Открыт поиск клиентов',
  },
  {
    id: 'create-cp',
    label: 'Создать КП',
    description: 'Good-Better-Best предложение',
    icon: 'FileText',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100',
    toastMessage: 'Открыт конструктор коммерческого предложения',
  },
  {
    id: 'call-client',
    label: 'Звонок клиенту',
    description: 'Позвонить через IP-телефонию',
    icon: 'Phone',
    color: 'text-teal-600',
    bg: 'bg-teal-50 hover:bg-teal-100 border-teal-100',
    toastMessage: 'Открыта панель звонка',
  },
  {
    id: 'create-task',
    label: 'Создать задачу',
    description: 'Добавить задачу в трекер',
    icon: 'SquarePlus',
    color: 'text-pink-600',
    bg: 'bg-pink-50 hover:bg-pink-100 border-pink-100',
    toastMessage: 'Открыта форма создания задачи',
  },
  {
    id: 'export-report',
    label: 'Выгрузить отчёт',
    description: 'Сформировать отчёт за период',
    icon: 'Download',
    color: 'text-blue-700',
    bg: 'bg-sky-50 hover:bg-sky-100 border-sky-100',
    toastMessage: 'Запущена выгрузка отчёта',
  },
  {
    id: 'add-stock',
    label: 'Добавить в склад',
    description: 'Оприходовать материалы или ЗИП',
    icon: 'PackagePlus',
    color: 'text-orange-600',
    bg: 'bg-orange-50 hover:bg-orange-100 border-orange-100',
    toastMessage: 'Открыта форма приходования на склад',
  },
  {
    id: 'create-purchase',
    label: 'Создать закупку',
    description: 'Заявка на приобретение ЗИП',
    icon: 'ShoppingCart',
    color: 'text-amber-600',
    bg: 'bg-amber-50 hover:bg-amber-100 border-amber-100',
    toastMessage: 'Открыта форма заявки на закупку',
  },
  {
    id: 'telegram',
    label: 'Написать в Telegram',
    description: 'Отправить сообщение клиенту',
    icon: 'Send',
    color: 'text-blue-500',
    bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100',
    toastMessage: 'Открыт Telegram-мессенджер',
  },
];

const MY_TASKS: MyTask[] = [
  {
    id: 't1',
    title: 'Согласовать КП для ТЦ «Европа» (три варианта)',
    deadline: 'Сегодня до 14:00',
    deadlineType: 'today',
    priority: 'high',
    done: false,
  },
  {
    id: 't2',
    title: 'Перезвонить Иванову по вопросу гарантии',
    deadline: 'Просрочено — вчера 17:00',
    deadlineType: 'overdue',
    priority: 'high',
    done: false,
  },
  {
    id: 't3',
    title: 'Проверить акты за апрель перед отправкой в 1С',
    deadline: 'Сегодня до 17:00',
    deadlineType: 'today',
    priority: 'medium',
    done: false,
  },
  {
    id: 't4',
    title: 'Обновить прайс-лист на хладагенты R-32',
    deadline: 'Завтра до 10:00',
    deadlineType: 'upcoming',
    priority: 'medium',
    done: false,
  },
  {
    id: 't5',
    title: 'Написать регламент по приёмке оборудования',
    deadline: 'Просрочено — 3 дня',
    deadlineType: 'overdue',
    priority: 'low',
    done: false,
  },
];

const RECENT_OBJECTS: RecentObject[] = [
  {
    id: 'r1',
    type: 'order',
    number: 'WO-2026-000413',
    client: 'ТЦ «Европа»',
    status: 'В работе',
    statusVariant: 'default',
    icon: 'Wrench',
    color: 'text-blue-600',
  },
  {
    id: 'r2',
    type: 'client',
    number: 'CL-00842',
    client: 'ООО «АйсПро»',
    status: 'Активный',
    statusVariant: 'default',
    icon: 'Building2',
    color: 'text-green-600',
  },
  {
    id: 'r3',
    type: 'request',
    number: 'REQ-2026-001189',
    client: 'ИП Сергеев В.П.',
    status: 'Новая',
    statusVariant: 'secondary',
    icon: 'ClipboardList',
    color: 'text-purple-600',
  },
  {
    id: 'r4',
    type: 'order',
    number: 'WO-2026-000410',
    client: 'МБОУ Школа №47',
    status: 'Завершён',
    statusVariant: 'outline',
    icon: 'Wrench',
    color: 'text-green-700',
  },
  {
    id: 'r5',
    type: 'request',
    number: 'REQ-2026-001185',
    client: 'Клиника «Медика»',
    status: 'SLA угроза',
    statusVariant: 'destructive',
    icon: 'ClipboardList',
    color: 'text-red-600',
  },
  {
    id: 'r6',
    type: 'client',
    number: 'CL-00791',
    client: 'ТРК «Галерея»',
    status: 'VIP',
    statusVariant: 'default',
    icon: 'Building2',
    color: 'text-yellow-600',
  },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    icon: 'AlertTriangle',
    color: 'text-red-500',
    text: 'SLA нарушен: WO-2026-000408 превысил TTF',
    time: '8 мин назад',
  },
  {
    id: 'n2',
    icon: 'UserCheck',
    color: 'text-green-500',
    text: 'Петров А.В. назначен на WO-2026-000413',
    time: '22 мин назад',
  },
  {
    id: 'n3',
    icon: 'Package',
    color: 'text-orange-500',
    text: 'Закупка PO-2026-091 получена на склад',
    time: '1 час назад',
  },
  {
    id: 'n4',
    icon: 'Star',
    color: 'text-yellow-500',
    text: 'Новый отзыв 5/5 — ООО «АйсПро»',
    time: '1.5 часа назад',
  },
  {
    id: 'n5',
    icon: 'MessageSquare',
    color: 'text-blue-500',
    text: 'Входящее из Telegram: ТЦ «Европа» — вопрос по договору',
    time: '2 часа назад',
  },
];

const HOURLY_ACTIVITY = [
  { time: '08:00', events: 4 },
  { time: '09:00', events: 11 },
  { time: '10:00', events: 18 },
  { time: '11:00', events: 23 },
  { time: '12:00', events: 15 },
  { time: '13:00', events: 9 },
  { time: '14:00', events: 21 },
  { time: '15:00', events: 26 },
  { time: '16:00', events: 19 },
  { time: '17:00', events: 13 },
  { time: '18:00', events: 7 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function formatCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const PRIORITY_LABEL: Record<MyTask['priority'], string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const PRIORITY_COLOR: Record<MyTask['priority'], string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const TYPE_LABEL: Record<RecentObject['type'], string> = {
  order: 'Наряд',
  client: 'Клиент',
  request: 'Заявка',
};

// ─── Component ────────────────────────────────────────────────────────────────

const QuickActionsFull = () => {
  const [tasks, setTasks] = useState<MyTask[]>(MY_TASKS);
  const [greeting] = useState(getGreeting());
  const [currentDate] = useState(formatCurrentDate());

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        toast.success('Открыта форма создания заявки');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toast.success('Открыт поиск клиентов');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleAction = (action: QuickAction) => {
    toast.success(action.toastMessage);
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, done: true } : t))
    );
    toast.success('Задача выполнена');
  };

  const activeTasks = tasks.filter(t => !t.done);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Персональное приветствие ── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">{currentDate}</p>
            <h1 className="text-2xl font-bold mb-2">{greeting}, Администратор</h1>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <Icon name="Wrench" size={14} className="text-blue-100" />
                <span className="text-sm font-medium">14 нарядов в работе</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <Icon name="Bell" size={14} className="text-blue-100" />
                <span className="text-sm font-medium">3 ожидают вас</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <Icon name="AlertCircle" size={14} className="text-yellow-300" />
                <span className="text-sm font-medium text-yellow-200">1 SLA под угрозой</span>
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-blue-200 text-xs mb-1">Активность сегодня</div>
            <div className="w-48 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_ACTIVITY}>
                  <defs>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#ffffff"
                    strokeWidth={2}
                    fill="url(#actGrad)"
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{ background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }}
                    labelStyle={{ color: '#93c5fd' }}
                    formatter={(v: number) => [`${v} событий`, '']}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── Основной контент: левая колонка + правый столбец ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Левая+центральная часть */}
        <div className="xl:col-span-2 space-y-6">

          {/* ── Сетка быстрых действий 3×4 ── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Быстрые действия</h2>
                <p className="text-xs text-gray-400 mt-0.5">Горячие клавиши работают глобально</p>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className={`group flex flex-col items-start p-3.5 rounded-xl border text-left transition-all hover:shadow-md active:scale-95 ${action.bg}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center mb-2.5 group-hover:shadow transition-shadow">
                    <Icon name={action.icon} size={18} className={action.color} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight mb-0.5">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight hidden sm:block">
                    {action.description}
                  </p>
                  {action.shortcut && (
                    <kbd className="mt-2 text-[10px] px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-gray-400 leading-none">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Мои задачи ── */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Мои задачи</h2>
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">
                  {activeTasks.length}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7">
                Все задачи
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${task.done ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}
                >
                  <button
                    onClick={() => !task.done && handleTaskToggle(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      task.done
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    disabled={task.done}
                    aria-label={task.done ? 'Выполнено' : 'Отметить выполненной'}
                  >
                    {task.done && <Icon name="Check" size={10} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon
                        name={task.deadlineType === 'overdue' ? 'AlertCircle' : 'Clock'}
                        size={11}
                        className={task.deadlineType === 'overdue' ? 'text-red-500' : task.deadlineType === 'today' ? 'text-yellow-500' : 'text-gray-400'}
                      />
                      <span className={`text-[11px] ${task.deadlineType === 'overdue' ? 'text-red-500 font-medium' : task.deadlineType === 'today' ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {task.deadline}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[task.priority]}`}>
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Недавние объекты (горизонтальный скролл) ── */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Недавние объекты</h2>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7">
                История
              </Button>
            </div>
            <div className="overflow-x-auto px-5 py-4">
              <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                {RECENT_OBJECTS.map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => toast.success(`Переход к ${TYPE_LABEL[obj.type]} ${obj.number}`)}
                    className="flex flex-col items-start w-44 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left bg-gray-50 hover:bg-white flex-shrink-0"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3`}>
                      <Icon name={obj.icon} size={16} className={obj.color} />
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                      {TYPE_LABEL[obj.type]}
                    </p>
                    <p className="text-xs font-semibold text-gray-800 mb-1 truncate w-full">
                      {obj.number}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate w-full mb-2">
                      {obj.client}
                    </p>
                    <Badge variant={obj.statusVariant} className="text-[10px] px-2 py-0 h-5">
                      {obj.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Виджет «Активность сегодня» ── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Активность сегодня</h2>
                <p className="text-xs text-gray-400 mt-0.5">Почасовое количество событий в системе</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">166</p>
                <p className="text-[11px] text-gray-400">событий за день</p>
              </div>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_ACTIVITY} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v} событий`, 'Активность']}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#todayGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#6366f1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Правый столбец — Уведомления */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Уведомления</h2>
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-100 text-red-600">
                  {NOTIFICATIONS.length}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7">
                Все
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {NOTIFICATIONS.map(n => (
                <button
                  key={n.id}
                  onClick={() => toast.info(n.text)}
                  className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={n.icon} size={15} className={n.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug line-clamp-2">{n.text}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500 h-8"
                onClick={() => toast.success('Все уведомления прочитаны')}
              >
                <Icon name="CheckCheck" size={13} className="mr-1.5" />
                Отметить все прочитанными
              </Button>
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Быстрые ссылки</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Диспетчерский центр', icon: 'Radio', color: 'text-blue-600' },
                { label: 'Карта инженеров', icon: 'MapPin', color: 'text-green-600' },
                { label: 'SLA мониторинг', icon: 'ShieldCheck', color: 'text-red-500' },
                { label: 'Склад', icon: 'Package', color: 'text-orange-500' },
                { label: 'Аналитика', icon: 'BarChart3', color: 'text-purple-600' },
              ].map(link => (
                <button
                  key={link.label}
                  onClick={() => toast.success(`Переход: ${link.label}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon name={link.icon} size={14} className={link.color} />
                  <span className="text-xs text-gray-700 font-medium">{link.label}</span>
                  <Icon name="ChevronRight" size={12} className="text-gray-300 ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Статус системы */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-sm font-semibold text-green-800">Система работает</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Backend API', ok: true },
                { label: 'База данных', ok: true },
                { label: 'Telegram Bot', ok: true },
                { label: 'Email уведомления', ok: true },
                { label: 'Синхронизация 1С', ok: false },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-green-700">{s.label}</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-green-500' : 'bg-yellow-400'}`} />
                    <span className={`text-[10px] font-medium ${s.ok ? 'text-green-600' : 'text-yellow-600'}`}>
                      {s.ok ? 'OK' : 'Ожидание'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsFull;
