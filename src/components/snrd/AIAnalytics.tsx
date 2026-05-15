import { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Bot, TrendingUp, TrendingDown, AlertTriangle, Zap,
  Send, RefreshCw, BarChart3, Lightbulb,
  Clock, Check, X, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

type InsightSeverity = 'red' | 'green' | 'blue' | 'orange';

interface Insight {
  id: string;
  type: 'anomaly' | 'trend' | 'opportunity' | 'warning';
  severity: InsightSeverity;
  icon: React.ReactNode;
  title: string;
  description: string;
  value?: string;
  badge?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  chart?: {
    type: 'bar' | 'line';
    data: { label: string; value: number }[];
    color: string;
  };
}

interface RecommendedAction {
  id: string;
  action: string;
  reason: string;
  effect: string;
  effectValue: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface Alert {
  id: string;
  level: 'error' | 'warning' | 'info';
  text: string;
  time: string;
}

// ─── Static data ───────────────────────────────────────────────────────────────

const INSIGHTS: Insight[] = [
  {
    id: 'i1',
    type: 'anomaly',
    severity: 'red',
    icon: <TrendingDown className="w-5 h-5" />,
    title: 'Аномалия SLA',
    description: 'SLA нарушен у 3 нарядов инженера Петрова за сегодня',
    value: '3 нарушения',
    badge: 'Критично',
  },
  {
    id: 'i2',
    type: 'trend',
    severity: 'green',
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Рост выручки',
    description: 'Выручка растёт 3-й месяц подряд — устойчивый положительный тренд',
    value: '+8.2%',
    badge: 'Тренд',
  },
  {
    id: 'i3',
    type: 'opportunity',
    severity: 'blue',
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Потенциал ТО',
    description: '2 клиента без технического обслуживания более 6 месяцев',
    value: '45 000 ₽',
    badge: 'Возможность',
  },
  {
    id: 'i4',
    type: 'warning',
    severity: 'orange',
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Запасы R-410A',
    description: 'При текущем потреблении запасов хладагента хватит на 5 рабочих дней',
    value: '5 дней',
    badge: 'Предупреждение',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    text: 'Почему у Петрова такой высокий процент нарушений SLA?',
    timestamp: '09:14',
  },
  {
    id: 'm2',
    role: 'assistant',
    text: 'Анализ показывает три ключевых фактора:\n\n1. **Перегруженность** — за последние 7 дней Петрову назначено 34 наряда при средней норме 22. Это на 55% выше оптимальной загрузки.\n\n2. **Удалённые объекты** — 40% нарядов сконцентрированы в Подольске и Домодедово, время в пути составляет до 1.5 ч в один конец.\n\n3. **Отсутствие запчастей** — 4 наряда перешли в статус AWAITING_PARTS, что сдвинуло закрытие остальных.\n\n**Рекомендация:** перераспределить 8 нарядов на Сидорова (загрузка 60%) и ускорить поставку артикула LGXP-3310.',
    timestamp: '09:14',
    chart: {
      type: 'bar',
      data: [
        { label: 'Пн', value: 6 },
        { label: 'Вт', value: 5 },
        { label: 'Ср', value: 7 },
        { label: 'Чт', value: 4 },
        { label: 'Пт', value: 8 },
        { label: 'Сб', value: 4 },
      ],
      color: '#ef4444',
    },
  },
  {
    id: 'm3',
    role: 'user',
    text: 'Покажи прогноз выручки на следующий месяц',
    timestamp: '09:17',
  },
  {
    id: 'm4',
    role: 'assistant',
    text: 'На основе данных за 6 месяцев и текущей воронки продаж прогноз выручки на июнь составляет **4 850 000 ₽** (±7%).\n\nДрайверы роста:\n— Подтверждённые договоры на ТО: +420 000 ₽\n— Сезонный спрос (кондиционеры): +380 000 ₽\n— Реализация закрытых сделок CRM: +210 000 ₽\n\nРиски снижения:\n— Просроченная задолженность «АвтоЛогистик»: -150 000 ₽\n— Уход инженера Фёдорова в отпуск (3 нед): -80 000 ₽',
    timestamp: '09:17',
    chart: {
      type: 'line',
      data: [
        { label: 'Янв', value: 3800 },
        { label: 'Фев', value: 3650 },
        { label: 'Мар', value: 4100 },
        { label: 'Апр', value: 4320 },
        { label: 'Май', value: 4580 },
        { label: 'Июн', value: 4850 },
      ],
      color: '#6366f1',
    },
  },
];

const QUICK_QUESTIONS = [
  'Почему упала выручка?',
  'Кто лучший инженер?',
  'Где теряем деньги?',
  'Прогноз на месяц',
];

const AI_RESPONSES: Record<string, Omit<ChatMessage, 'id' | 'role' | 'timestamp'>> = {
  'Почему упала выручка?': {
    text: 'Глубокий анализ показывает снижение выручки в марте на 12% относительно февраля. Три причины:\n\n1. **Сезонный провал** — спрос на кондиционеры упал на 40%, что типично для марта.\n2. **Потеря клиента** — «СтройГрупп» расторгли договор на обслуживание (было 180 000 ₽/мес).\n3. **Простой инженеров** — 4 дня карантина в бригаде (потери ~220 000 ₽).\n\n**Апрель восстанавливается** — текущая выручка уже на 8% выше аналогичного периода прошлого года.',
    chart: {
      type: 'bar',
      data: [
        { label: 'Янв', value: 3800 },
        { label: 'Фев', value: 4100 },
        { label: 'Мар', value: 3610 },
        { label: 'Апр', value: 4320 },
        { label: 'Май', value: 4580 },
      ],
      color: '#f59e0b',
    },
  },
  'Кто лучший инженер?': {
    text: 'По комплексному рейтингу за последние 30 дней **лидер — Сидоров Алексей**:\n\n• Выполнено нарядов: **47** (1-е место)\n• Средняя оценка клиентов: **4.9 / 5.0**\n• Нарушений SLA: **0**\n• Маржа нарядов: **42%** (выше среднего на 7 п.п.)\n• Скорость закрытия: **2.1 ч** vs средние 3.4 ч\n\n**Итоговый балл: 9.4 / 10**\n\nНа 2-м месте — Козлов Дмитрий (8.7), на 3-м — Новиков Игорь (8.1).',
    chart: {
      type: 'bar',
      data: [
        { label: 'Сидоров', value: 94 },
        { label: 'Козлов', value: 87 },
        { label: 'Новиков', value: 81 },
        { label: 'Петров', value: 68 },
        { label: 'Фёдоров', value: 74 },
      ],
      color: '#22c55e',
    },
  },
  'Где теряем деньги?': {
    text: 'Анализ себестоимости выявил **4 зоны потерь** суммарно на ~380 000 ₽/мес:\n\n1. **ГСМ** — перерасход 18% из-за неоптимальных маршрутов: **-92 000 ₽**\n2. **Хладагент R-410A** — утечки при хранении и списания сверх нормы: **-74 000 ₽**\n3. **Простои** — ожидание запчастей (avg 2.3 дня на наряд): **-130 000 ₽**\n4. **Гарантийные переделки** — 6% нарядов требуют повторного выезда: **-84 000 ₽**\n\n**Быстрый выигрыш:** оптимизация маршрутов через OSRM даст экономию ~85 000 ₽/мес.',
    chart: {
      type: 'bar',
      data: [
        { label: 'Простои', value: 130 },
        { label: 'ГСМ', value: 92 },
        { label: 'Переделки', value: 84 },
        { label: 'Хладагент', value: 74 },
      ],
      color: '#ef4444',
    },
  },
  'Прогноз на месяц': {
    text: 'Прогноз на **июнь 2026**:\n\n**Выручка:** 4 850 000 ₽ (+5.9% к маю)\n**Количество нарядов:** 312 (+18 к маю)\n**Маржинальность:** 34.2% (целевой уровень 32%)\n\nКлючевые события:\n— Пик сезона кондиционеров: 3-я неделя июня\n— Плановое ТО: 28 договорных клиентов\n— Истекающие договоры (риск): 4 клиента на 340 000 ₽\n\n**Рекомендация:** расширить смену на 15–25 июня, добавить 2 временных инженера.',
    chart: {
      type: 'line',
      data: [
        { label: '1 нед', value: 980 },
        { label: '2 нед', value: 1120 },
        { label: '3 нед', value: 1580 },
        { label: '4 нед', value: 1170 },
      ],
      color: '#6366f1',
    },
  },
};

const RECOMMENDED_ACTIONS: RecommendedAction[] = [
  {
    id: 'a1',
    action: 'Перераспределить 8 нарядов от Петрова',
    reason: 'Петров перегружен на 55%, 3 нарушения SLA сегодня. Сидоров загружен на 60% — есть запас.',
    effect: 'Снижение нарушений SLA',
    effectValue: '↓ на 80%',
    icon: <Bot className="w-5 h-5" />,
    iconBg: 'bg-red-100 text-red-600',
  },
  {
    id: 'a2',
    action: 'Заказать R-410A у поставщика «КлиматТрейд»',
    reason: 'Запасов осталось на 5 дней. Сезонный пик через 10 дней — дефицит остановит работу.',
    effect: 'Предотвращение простоев',
    effectValue: '≈ 180 000 ₽',
    icon: <AlertTriangle className="w-5 h-5" />,
    iconBg: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'a3',
    action: 'Отправить КП клиентам «Альфа-Центр» и «ТехноМаркет»',
    reason: '6+ месяцев без ТО. Вероятность сделки по модели CRM — 74%. Оптимальное время для контакта.',
    effect: 'Потенциал выручки',
    effectValue: '+45 000 ₽',
    icon: <Zap className="w-5 h-5" />,
    iconBg: 'bg-blue-100 text-blue-600',
  },
];

const ALERTS: Alert[] = [
  { id: 'al1', level: 'error', text: 'SLA нарушен: наряд WO-2026-004821 просрочен на 2ч 14мин', time: '10:42' },
  { id: 'al2', level: 'warning', text: 'Баланс хладагента R-32 ниже минимального порога (8 кг)', time: '09:30' },
  { id: 'al3', level: 'info', text: 'Синхронизация с 1С:УНФ завершена — 34 документа передано', time: '08:00' },
];

const DIGEST_METRICS = [
  { label: 'Открытых нарядов', value: '47', change: '+5', positive: false },
  { label: 'Выполнено сегодня', value: '12', change: '+3', positive: true },
  { label: 'SLA под угрозой', value: '4', change: '+2', positive: false },
  { label: 'Выручка (план/факт)', value: '78%', change: '+6%', positive: true },
];

const PIE_DATA = [
  { name: 'Ремонт', value: 42, color: '#6366f1' },
  { name: 'ТО', value: 28, color: '#22c55e' },
  { name: 'Монтаж', value: 18, color: '#f59e0b' },
  { name: 'Гарантия', value: 12, color: '#ef4444' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const insightBg: Record<InsightSeverity, string> = {
  red: 'bg-red-50 border-red-200',
  green: 'bg-green-50 border-green-200',
  blue: 'bg-blue-50 border-blue-200',
  orange: 'bg-orange-50 border-orange-200',
};
const insightIcon: Record<InsightSeverity, string> = {
  red: 'bg-red-100 text-red-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
};
const insightBadge: Record<InsightSeverity, string> = {
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
};
const insightValue: Record<InsightSeverity, string> = {
  red: 'text-red-600',
  green: 'text-green-600',
  blue: 'text-blue-600',
  orange: 'text-orange-600',
};
const alertBg: Record<Alert['level'], string> = {
  error: 'bg-red-50 border-red-200',
  warning: 'bg-orange-50 border-orange-200',
  info: 'bg-blue-50 border-blue-200',
};
const alertText: Record<Alert['level'], string> = {
  error: 'text-red-600',
  warning: 'text-orange-600',
  info: 'text-blue-600',
};

function MiniChart({ chart }: { chart: NonNullable<ChatMessage['chart']> }) {
  if (chart.type === 'bar') {
    return (
      <div className="mt-3 h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={chart.color} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return (
    <div className="mt-3 h-[160px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatMessageText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AIAnalytics() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const [deferredActions, setDeferredActions] = useState<Set<string>>(new Set());
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const knownAnswer = AI_RESPONSES[text.trim()];
      const answer: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        text: knownAnswer?.text ??
          `Анализирую запрос: «${text.trim()}»...\n\nНа основе данных за последние 30 дней: система выявила 3 ключевых паттерна. Показатели находятся в пределах нормы, однако есть точки роста. Рекомендую детальный просмотр раздела "Аналитика" для получения полного отчёта с визуализацией.`,
        chart: knownAnswer?.chart,
      };
      setMessages(prev => [...prev, answer]);
      setIsTyping(false);
    }, 1500);
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Данные обновлены', { description: 'ИИ-аналитика пересчитана на текущий момент' });
    }, 1200);
  }

  function handleApplyAction(id: string) {
    setAppliedActions(prev => new Set([...prev, id]));
    const action = RECOMMENDED_ACTIONS.find(a => a.id === id);
    toast.success('Действие применено', { description: action?.action });
  }

  function handleDeferAction(id: string) {
    setDeferredActions(prev => new Set([...prev, id]));
    toast.info('Отложено', { description: 'Напомним завтра утром' });
  }

  function handleDownloadReport() {
    toast.success('Отчёт формируется', { description: 'Утренний дайджест будет готов через несколько секунд' });
  }

  function handleWeeklyReport() {
    toast.success('Недельный отчёт запущен', { description: 'PDF будет отправлен на email руководителя' });
  }

  const visibleInsights = INSIGHTS.filter(i => !dismissedInsights.has(i.id));

  return (
    <div className="flex flex-col gap-4 p-4 h-full min-h-0 bg-gray-50">

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ИИ-Аналитика</h1>
            <p className="text-xs text-gray-500">Умный ассистент бизнеса • обновлено сегодня в 10:45</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Insights Row */}
      {visibleInsights.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 flex-shrink-0">
          {visibleInsights.map(insight => (
            <div
              key={insight.id}
              className={`relative rounded-xl border p-4 ${insightBg[insight.severity]} transition-all`}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setDismissedInsights(prev => new Set([...prev, insight.id]))}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${insightIcon[insight.severity]}`}>
                  {insight.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold text-gray-900">{insight.title}</span>
                    {insight.badge && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${insightBadge[insight.severity]}`}>
                        {insight.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                  {insight.value && (
                    <p className={`text-sm font-bold mt-1.5 ${insightValue[insight.severity]}`}>{insight.value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Area */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Chat */}
        <div className="flex flex-col flex-1 min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-800">Чат с ИИ-аналитиком</span>
            <span className="text-xs text-gray-400 ml-auto">задайте любой вопрос о бизнесе</span>
          </div>

          {/* Quick questions */}
          <div className="flex gap-2 px-4 py-2 border-b border-gray-50 flex-shrink-0 overflow-x-auto">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isTyping}
                className="flex-shrink-0 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef as React.RefObject<HTMLDivElement>}>
            <div className="flex flex-col gap-4 p-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                    >
                      <div>{formatMessageText(msg.text)}</div>
                      {msg.chart && <MiniChart chart={msg.chart} />}
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2 px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(inputValue)}
              placeholder="Задайте вопрос об аналитике бизнеса..."
              disabled={isTyping}
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 disabled:opacity-50 transition"
            />
            <Button
              size="sm"
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right column */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 min-h-0">

          {/* Morning digest */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800">Утренний дайджест</span>
              </div>
              <button
                onClick={handleDownloadReport}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Скачать отчёт"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">15 мая 2026 — сводка на 10:45</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {DIGEST_METRICS.map(m => (
                <div key={m.label} className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-gray-500 mb-1 leading-tight">{m.label}</p>
                  <p className="text-base font-bold text-gray-900">{m.value}</p>
                  <p className={`text-[10px] font-medium ${m.positive ? 'text-green-600' : 'text-red-500'}`}>
                    {m.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Mini pie */}
            <div className="mt-1">
              <p className="text-[10px] text-gray-500 mb-1.5">Структура нарядов</p>
              <div className="flex items-center gap-2">
                <div className="w-[60px] h-[60px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={PIE_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={28} strokeWidth={0}>
                        {PIE_DATA.map(entry => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1">
                  {PIE_DATA.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-[10px] text-gray-600">{d.name} {d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly report */}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Недельный отчёт</span>
            </div>
            <p className="text-xs text-indigo-100 mb-3">Комплексный PDF с графиками, KPI и рекомендациями</p>
            <Button
              size="sm"
              onClick={handleWeeklyReport}
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50 text-xs font-semibold h-8"
            >
              Сгенерировать отчёт
            </Button>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-800">Алерты</span>
              <span className="ml-auto text-[10px] bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded-full">
                {ALERTS.length}
              </span>
            </div>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-2">
                {ALERTS.map(alert => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-3 ${alertBg[alert.level]}`}
                  >
                    <p className="text-xs text-gray-700 leading-relaxed mb-1">{alert.text}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-medium ${alertText[alert.level]}`}>
                        {alert.level === 'error' ? 'Критично' : alert.level === 'warning' ? 'Внимание' : 'Инфо'}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-800">Рекомендованные действия</h2>
          <span className="text-xs text-gray-400">на основе анализа данных</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {RECOMMENDED_ACTIONS.map(action => {
            const applied = appliedActions.has(action.id);
            const deferred = deferredActions.has(action.id);
            return (
              <div
                key={action.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
                  applied ? 'border-green-300 opacity-70' : deferred ? 'border-gray-200 opacity-50' : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${action.iconBg}`}>
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{action.action}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{action.reason}</p>
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-600">{action.effect}:</span>
                  <span className="text-xs font-bold text-green-600">{action.effectValue}</span>
                </div>
                <div className="flex gap-2">
                  {applied ? (
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                      <Check className="w-4 h-4" /> Применено
                    </div>
                  ) : deferred ? (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                      <Clock className="w-4 h-4" /> Отложено
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApplyAction(action.id)}
                        className="flex-1 h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Применить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeferAction(action.id)}
                        className="flex-1 h-7 text-xs text-gray-500"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Отложить
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
