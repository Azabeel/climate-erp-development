import { useState, useRef, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  impact: string;
}

interface ForecastItem {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  detail: string;
}

// ─── Static data ────────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    text: 'Здравствуйте! Я ИИ-аналитик «Сервис Климат». Готов проанализировать данные вашего сервисного центра: выручку, маржинальность, эффективность инженеров, SLA и многое другое. Задайте вопрос или выберите один из популярных запросов ниже.',
    timestamp: '09:00',
  },
  {
    id: '2',
    role: 'user',
    text: 'Какие клиенты приносят больше прибыли?',
    timestamp: '09:02',
  },
  {
    id: '3',
    role: 'assistant',
    text: 'Анализ за последние 90 дней показывает:\n\n🏆 ТОП-3 по маржинальности:\n1. ООО «АркадияТех» — выручка 284 000 ₽, маржа 41%\n2. ТЦ «Галактика» — выручка 197 000 ₽, маржа 38%\n3. ЖК «Северный берег» — выручка 156 000 ₽, маржа 35%\n\nЭти клиенты генерируют 52% общей прибыли при 23% от общего числа нарядов. Рекомендую приоритизировать продление их договоров.',
    timestamp: '09:02',
  },
  {
    id: '4',
    role: 'user',
    text: 'Прогноз выручки на следующий квартал',
    timestamp: '09:15',
  },
  {
    id: '5',
    role: 'assistant',
    text: 'На основе исторических данных, сезонности и текущей воронки сделок:\n\n📈 Прогноз Q3 2026:\n• Июнь: 1 240 000 ₽ (+12% к июню прошлого года)\n• Июль: 1 580 000 ₽ (пик сезона, +18%)\n• Август: 1 390 000 ₽ (+9%)\n\nИтого Q3: ~4 210 000 ₽\nДоверительный интервал: ±8%\n\nКлючевые факторы роста: расширение договорной базы (+3 новых контракта), сезонный спрос на ТО кондиционеров.',
    timestamp: '09:15',
  },
  {
    id: '6',
    role: 'user',
    text: 'Найди аномалии в нарядах за май',
    timestamp: '09:28',
  },
  {
    id: '7',
    role: 'assistant',
    text: 'Обнаружено 3 аномалии в нарядах за май 2026:\n\n🔴 Критическая: Клиент «МегаМолл» — 7 жалоб за месяц (норма: 0-1). Причина: повторяющиеся поломки одного и того же блока Samsung. Рекомендую плановую замену оборудования.\n\n🟡 Средняя: Инженер Петров В.С. — средняя маржа нарядов 18% (норма: 32%). Возможны завышенные списания материалов.\n\n🟡 Средняя: Склад «Мобильный-2» — остаток R-410A 0.4 кг (минимум: 5 кг). Требуется срочный дозаказ.',
    timestamp: '09:29',
  },
  {
    id: '8',
    role: 'assistant',
    text: 'Хотите подробный отчёт по любой из этих аномалий? Я могу подготовить PDF с детализацией и рекомендациями.',
    timestamp: '09:29',
  },
];

const ANOMALIES: Anomaly[] = [
  {
    id: 'a1',
    title: '«МегаМолл» — 7 жалоб за май',
    description: 'Повторные поломки Samsung блока #A-12. Клиент на грани расторжения договора.',
    severity: 'high',
  },
  {
    id: 'a2',
    title: 'Инженер Петров В.С. — маржа 18%',
    description: 'Норма по отделу — 32%. Завышенные списания материалов в 6 нарядах.',
    severity: 'medium',
  },
  {
    id: 'a3',
    title: 'Склад «Мобильный-2» — R-410A 0.4 кг',
    description: 'Критически низкий остаток хладагента. До нормы не хватает 4.6 кг.',
    severity: 'medium',
  },
];

const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o1',
    title: 'Кросс-продажи ТО кондиционеров',
    description: '23 клиента с оборудованием старше 3 лет без действующего договора ТО.',
    impact: '+180 000 ₽/мес',
  },
  {
    id: 'o2',
    title: 'Оптимизация маршрутов инженеров',
    description: 'Кластеризация нарядов сократит пробег на 340 км/нед и сэкономит ГСМ.',
    impact: '-42 000 ₽/мес расходов',
  },
  {
    id: 'o3',
    title: 'Продление истекающих договоров',
    description: '8 корпоративных договоров истекают в июне. Совокупная выручка: 1.2 млн ₽/год.',
    impact: '+1 200 000 ₽/год',
  },
];

const FORECAST_ITEMS: ForecastItem[] = [
  {
    label: 'Выручка (следующий месяц)',
    value: '1 240 000 ₽',
    trend: 'up',
    detail: '+12% к аналогичному периоду прошлого года',
  },
  {
    label: 'Загрузка инженеров',
    value: '84%',
    trend: 'up',
    detail: 'Рекомендуется нанять 1-2 специалиста',
  },
  {
    label: 'Закупки ЗИП',
    value: '320 000 ₽',
    trend: 'neutral',
    detail: 'Прогноз на основе открытых нарядов',
  },
];

const ENGINEER_EFFICIENCY_DATA = [
  { name: 'Смирнов', score: 9.2, margin: 38 },
  { name: 'Козлов', score: 8.7, margin: 35 },
  { name: 'Иванов', score: 7.1, margin: 29 },
  { name: 'Новиков', score: 6.8, margin: 26 },
  { name: 'Петров', score: 5.4, margin: 18 },
];

const REVENUE_STRUCTURE_DATA = [
  { name: 'Ремонт', value: 47, color: '#6366f1' },
  { name: 'ТО', value: 28, color: '#22c55e' },
  { name: 'Монтаж', value: 15, color: '#f59e0b' },
  { name: 'ЗИП', value: 10, color: '#ec4899' },
];

const MONTHLY_ORDERS_DATA = [
  { month: 'Янв', orders: 64 },
  { month: 'Фев', orders: 58 },
  { month: 'Мар', orders: 72 },
  { month: 'Апр', orders: 81 },
  { month: 'Май', orders: 88 },
];

const REVENUE_DATA = [
  { month: 'Янв', fact: 820000, forecast: null, forecastLow: null, forecastHigh: null },
  { month: 'Фев', fact: 740000, forecast: null, forecastLow: null, forecastHigh: null },
  { month: 'Мар', fact: 910000, forecast: null, forecastLow: null, forecastHigh: null },
  { month: 'Апр', fact: 980000, forecast: null, forecastLow: null, forecastHigh: null },
  { month: 'Май', fact: 1050000, forecast: null, forecastLow: null, forecastHigh: null },
  { month: 'Июн', fact: null, forecast: 1240000, forecastLow: 1140800, forecastHigh: 1339200 },
  { month: 'Июл', fact: null, forecast: 1580000, forecastLow: 1453600, forecastHigh: 1706400 },
  { month: 'Авг', fact: null, forecast: 1390000, forecastLow: 1278800, forecastHigh: 1501200 },
  { month: 'Сен', fact: null, forecast: 1180000, forecastLow: 1085600, forecastHigh: 1274400 },
  { month: 'Окт', fact: null, forecast: 1060000, forecastLow: 975200, forecastHigh: 1144800 },
  { month: 'Ноя', fact: null, forecast: 890000, forecastLow: 818800, forecastHigh: 961200 },
  { month: 'Дек', fact: null, forecast: 1120000, forecastLow: 1030400, forecastHigh: 1209600 },
];

const POPULAR_QUERIES = [
  'Какие клиенты приносят больше прибыли?',
  'Прогноз выручки на следующий квартал',
  'Найди аномалии в нарядах за май',
  'Сравни эффективность инженеров',
  'Анализ SLA нарушений по клиентам',
  'Топ причин повторных обращений',
];

// ─── Helper components ───────────────────────────────────────────────────────────

function formatRevenue(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}М`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}К`;
  return String(value);
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const severityConfig = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      icon: 'AlertTriangle',
      iconColor: 'text-red-500',
      label: 'Критично',
    },
    medium: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-700',
      icon: 'AlertCircle',
      iconColor: 'text-orange-500',
      label: 'Средняя',
    },
    low: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: 'Info',
      iconColor: 'text-yellow-600',
      label: 'Низкая',
    },
  };

  const cfg = severityConfig[anomaly.severity];

  return (
    <div className={`rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-2">
        <Icon name={cfg.icon} size={16} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">{anomaly.title}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">{anomaly.description}</p>
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
      <div className="flex items-start gap-2">
        <Icon name="TrendingUp" size={16} className="mt-0.5 shrink-0 text-green-600" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">{opportunity.title}</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              {opportunity.impact}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">{opportunity.description}</p>
        </div>
      </div>
    </div>
  );
}

function ForecastCard({ item }: { item: ForecastItem }) {
  const trendIcon = item.trend === 'up' ? 'TrendingUp' : item.trend === 'down' ? 'TrendingDown' : 'Minus';
  const trendColor = item.trend === 'up' ? 'text-blue-600' : item.trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon name={trendIcon} size={14} className={trendColor} />
        <span className="text-xs text-gray-500">{item.label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900">{item.value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{item.detail}</div>
    </div>
  );
}

// ─── Custom tooltip for revenue chart ───────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs">
      <div className="font-semibold text-gray-700 mb-2">{label}</div>
      {payload.map((entry) => {
        if (entry.value == null) return null;
        return (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold">{formatRevenue(entry.value)} ₽</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────────

export default function AIAnalyticsFull() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [digestSubscribed, setDigestSubscribed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: generateAIResponse(text),
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      toast.success('Анализ выполнен', {
        description: 'ИИ-аналитик подготовил ответ на ваш запрос',
      });
    }, 1800);
  }

  function generateAIResponse(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('инженер') && q.includes('эффективн')) {
      return 'Рейтинг инженеров по эффективности (май 2026):\n\n1. Смирнов А.В. — 9.2/10 (маржа 38%, 0 жалоб, SLA 100%)\n2. Козлов Д.И. — 8.7/10 (маржа 35%, 1 жалоба, SLA 97%)\n3. Иванов К.П. — 7.1/10 (маржа 29%, 0 жалоб, SLA 91%)\n\nОтстающий: Петров В.С. — 5.4/10. Рекомендую провести разбор нарядов совместно с руководителем.';
    }
    if (q.includes('sla') || q.includes('нарушен')) {
      return 'Анализ SLA за май 2026:\n\n🔴 Нарушений TTR: 4 случая (2.1% от нарядов)\n🟡 Нарушений TTO: 11 случаев (5.8%)\n✅ TTF выполнен: 96.2%\n\nНаибольший риск: договоры с ООО «Термо-Плюс» и ИП Сидоров — по 2 нарушения каждый. Рекомендую пересмотреть приоритеты назначения для этих клиентов.';
    }
    if (q.includes('повторн')) {
      return 'Топ-3 причины повторных обращений (последние 60 дней):\n\n1. Некачественная заправка хладагента — 18 случаев (34%)\n2. Засор дренажной системы — 11 случаев (21%)\n3. Неправильная диагностика при первом визите — 8 случаев (15%)\n\nРекомендация: внедрить обязательный чек-лист проверки хладагента после заправки.';
    }
    return `Анализирую запрос: «${query}»...\n\nНа основе данных за последние 90 дней выявлены следующие паттерны:\n• Положительная динамика по ключевым метрикам (+7% к предыдущему периоду)\n• Выявлены 2 области для оптимизации\n• Прогноз на следующий месяц — умеренно позитивный\n\nДля детального отчёта уточните временной период или конкретные метрики.`;
  }

  function handlePopularQuery(query: string) {
    setInputValue(query);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleDigestSubscribe() {
    setDigestSubscribed(true);
    toast.success('Подписка оформлена!', {
      description: 'Ежедневный дайджест будет приходить в 08:00 на ваш email и Telegram',
    });
  }

  return (
    <div className="flex h-full min-h-0 bg-gray-50">
      {/* ── Left: Chat panel (400px) ─────────────────────────────────────────── */}
      <div className="flex w-[400px] shrink-0 flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
            <Icon name="Bot" size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">ИИ-аналитик</div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-gray-500">Онлайн · GPT-4 + RAG</span>
            </div>
          </div>
          <div className="ml-auto">
            <Badge className="bg-indigo-100 text-indigo-700 text-xs">Бета</Badge>
          </div>
        </div>

        {/* Popular queries */}
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="mb-2 text-xs font-medium text-gray-500">Популярные запросы</div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handlePopularQuery(q)}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="shrink-0">
                {msg.role === 'assistant' ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Icon name="Bot" size={13} className="text-white" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                    <Icon name="User" size={13} className="text-gray-600" />
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[280px] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-indigo-600 text-white'
                    : 'rounded-tl-sm bg-gray-100 text-gray-800'
                }`}
              >
                {msg.text}
                <div
                  className={`mt-1 text-[10px] ${
                    msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <Icon name="Bot" size={13} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2">
                <div className="flex items-center gap-1 h-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">ИИ печатает...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Задайте вопрос аналитику..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className="text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
            >
              <Icon name="Send" size={15} className="text-white" />
            </Button>
          </div>
          <div className="mt-1.5 text-center text-[10px] text-gray-400">
            Enter — отправить · ИИ может ошибаться, проверяйте важные данные
          </div>
        </div>
      </div>

      {/* ── Right: Analytics panel ───────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-5 gap-5">
        {/* Morning digest */}
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                <Icon name="Sunrise" size={20} className="text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">Утренний дайджест</span>
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">Сгенерирован ИИ</Badge>
                  <span className="text-xs text-gray-400">16 мая 2026</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                  Сегодня <strong>16 мая</strong>: <strong>8 нарядов</strong> в работе,{' '}
                  <strong className="text-red-600">3 SLA на грани</strong> нарушения, выручка за
                  вчера — <strong>47 000 ₽</strong> (+6% к среднему). Загрузка инженеров — 79%.{' '}
                  <strong>Рекомендую:</strong> назначить инженера на срочный наряд WO-2026-001847
                  (ТЦ «Галактика», SLA истекает в 14:30), проверить остатки R-410A на мобильных
                  складах, связаться с ООО «АркадияТех» по продлению договора (истекает 31 мая).
                </p>
              </div>
            </div>
            <Button
              onClick={handleDigestSubscribe}
              disabled={digestSubscribed}
              variant="outline"
              size="sm"
              className={`shrink-0 border-indigo-300 text-indigo-700 hover:bg-indigo-100 ${
                digestSubscribed ? 'opacity-60' : ''
              }`}
            >
              <Icon
                name={digestSubscribed ? 'Check' : 'Bell'}
                size={14}
                className="mr-1.5"
              />
              {digestSubscribed ? 'Подписка активна' : 'Подписаться на дайджест'}
            </Button>
          </div>
        </div>

        {/* Insights row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Anomalies */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
                <Icon name="AlertTriangle" size={14} className="text-red-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Аномалии</span>
              <Badge className="ml-auto bg-red-100 text-red-700 text-xs">{ANOMALIES.length}</Badge>
            </div>
            <div className="space-y-2">
              {ANOMALIES.map((a) => (
                <AnomalyCard key={a.id} anomaly={a} />
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
                <Icon name="Lightbulb" size={14} className="text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Возможности</span>
              <Badge className="ml-auto bg-green-100 text-green-700 text-xs">
                {OPPORTUNITIES.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {OPPORTUNITIES.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} />
              ))}
            </div>
          </div>

          {/* Forecast */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <Icon name="BarChart3" size={14} className="text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Прогноз</span>
              <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs">Июнь</Badge>
            </div>
            <div className="space-y-2">
              {FORECAST_ITEMS.map((item) => (
                <ForecastCard key={item.label} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Revenue forecast chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Прогноз выручки на 12 месяцев</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Синяя линия — факт (янв–май), зелёная пунктирная — прогноз ИИ (июн–дек)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-6 bg-blue-500 rounded" />
                <span>Факт</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-0.5 w-6 rounded"
                  style={{
                    background: 'repeating-linear-gradient(to right, #22c55e 0px, #22c55e 4px, transparent 4px, transparent 8px)',
                  }}
                />
                <span>Прогноз</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-6 rounded bg-green-100 opacity-70" />
                <span>Интервал ±8%</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="factGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatRevenue}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<RevenueTooltip />} />

              {/* Forecast uncertainty band */}
              <Area
                type="monotone"
                dataKey="forecastHigh"
                stroke="none"
                fill="url(#forecastBandGrad)"
                connectNulls={false}
                name="Верхняя граница"
                legendType="none"
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="forecastLow"
                stroke="none"
                fill="white"
                connectNulls={false}
                name="Нижняя граница"
                legendType="none"
                dot={false}
                activeDot={false}
              />

              {/* Fact line */}
              <Area
                type="monotone"
                dataKey="fact"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#factGrad)"
                connectNulls={false}
                name="Факт"
                dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#6366f1' }}
              />

              {/* Forecast line (dashed green) */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 3"
                connectNulls={false}
                name="Прогноз"
                dot={{ fill: '#22c55e', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#22c55e' }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-3 grid grid-cols-4 gap-3">
            {[
              { label: 'Факт (янв–май)', value: '4 500 000 ₽', color: 'text-indigo-600' },
              { label: 'Прогноз Q3', value: '4 210 000 ₽', color: 'text-green-600' },
              { label: 'Прогноз Q4', value: '3 070 000 ₽', color: 'text-green-600' },
              { label: 'Итого год', value: '11 780 000 ₽', color: 'text-gray-900' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom charts row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Engineer efficiency bar chart */}
          <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Эффективность инженеров</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Балл (0–10) и маржинальность нарядов % (май 2026)
              </p>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart
                data={ENGINEER_EFFICIENCY_DATA}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 45]}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'score' ? `${value}/10` : `${value}%`,
                    name === 'score' ? 'Балл' : 'Маржа',
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} name="score" />
                <Bar dataKey="margin" fill="#c7d2fe" radius={[0, 4, 4, 0]} name="margin" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue structure pie + trend line */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Структура выручки</h3>
              <p className="text-xs text-gray-500 mt-0.5">По типам нарядов</p>
            </div>
            <div className="flex justify-center">
              <PieChart width={155} height={130}>
                <Pie
                  data={REVENUE_STRUCTURE_DATA}
                  cx={72}
                  cy={60}
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {REVENUE_STRUCTURE_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Доля']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </div>
            <div className="space-y-1">
              {REVENUE_STRUCTURE_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-500 mb-1.5">Динамика нарядов (янв–май)</div>
              <ResponsiveContainer width="100%" height={46}>
                <LineChart
                  data={MONTHLY_ORDERS_DATA}
                  margin={{ top: 2, right: 4, left: 4, bottom: 2 }}
                >
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 2, strokeWidth: 0 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, 'Нарядов']}
                    contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
