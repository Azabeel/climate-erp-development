import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type AssistantMode = 'consultant' | 'analyst' | 'dispatcher' | 'chatbot';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

interface Session {
  id: string;
  date: string;
  title: string;
  mode: AssistantMode;
  messageCount: number;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  relevance: number;
}

interface AnswerSource {
  id: string;
  label: string;
  type: 'manual' | 'case' | 'spec';
}

// ─── Static data ─────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<AssistantMode, { label: string; icon: string; color: string; bgColor: string; description: string }> = {
  consultant: {
    label: 'Технический консультант',
    icon: 'Wrench',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Диагностика, ремонт, коды ошибок',
  },
  analyst: {
    label: 'Бизнес-аналитик',
    icon: 'BarChart2',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Отчёты, KPI, прогнозы',
  },
  dispatcher: {
    label: 'Диспетчер',
    icon: 'MapPin',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Планирование и назначения',
  },
  chatbot: {
    label: 'Чат-бот',
    icon: 'MessageCircle',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Симуляция клиентского чата',
  },
};

const SESSIONS: Session[] = [
  { id: 's1', date: '17 мая, 11:42', title: 'Ошибка E1 Daikin FTXB35C', mode: 'consultant', messageCount: 8 },
  { id: 's2', date: '17 мая, 09:15', title: 'Анализ выручки май 2026', mode: 'analyst', messageCount: 5 },
  { id: 's3', date: '16 мая, 16:30', title: 'SLA-алерты: ТЦ Галактика', mode: 'dispatcher', messageCount: 12 },
  { id: 's4', date: '16 мая, 14:08', title: 'Клиент спрашивает о стоимости', mode: 'chatbot', messageCount: 6 },
  { id: 's5', date: '15 мая, 10:22', title: 'Диагностика компрессора Mitsubishi', mode: 'consultant', messageCount: 9 },
];

const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  { id: 'a1', title: 'Daikin FTXB — коды ошибок E1-E9: полное руководство', category: 'Мануал', relevance: 97 },
  { id: 'a2', title: 'Алгоритм диагностики неисправностей инвертора Daikin', category: 'Кейс', relevance: 89 },
  { id: 'a3', title: 'R-410A: давление в системе и метод проверки утечек', category: 'Технический стандарт', relevance: 74 },
];

const ANSWER_SOURCES: AnswerSource[] = [
  { id: 'src1', label: 'Сервисный мануал Daikin RY/RYS (2023)', type: 'manual' },
  { id: 'src2', label: 'Кейс #3847: ошибка E1 в жилом здании (2025)', type: 'case' },
  { id: 'src3', label: 'ГОСТ Р 53238-2008 системы кондиционирования', type: 'spec' },
];

const QUICK_QUESTIONS: Record<AssistantMode, string[]> = {
  consultant: ['Коды ошибок', 'Рекомендуемые запчасти', 'Алгоритм диагностики'],
  analyst: ['Отчёт за месяц', 'Топ клиентов', 'Прогноз выручки'],
  dispatcher: ['SLA-алерты', 'Свободные инженеры', 'Оптимальный маршрут'],
  chatbot: ['Стоимость ТО', 'Срок ремонта', 'Статус заявки'],
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    text: 'У клиента кондиционер Daikin FTXB35C выдаёт ошибку E1. Что это означает?',
    time: '11:42',
  },
  {
    id: 'm2',
    role: 'assistant',
    text: 'Ошибка E1 на Daikin FTXB35C — это сигнал защиты по температуре теплообменника внутреннего блока (Indoor Heat Exchanger Temp. Sensor Error).\n\n**Вероятные причины:**\n- Загрязнённый фильтр или теплообменник\n- Неисправный датчик температуры (термистор)\n- Заблокированный воздухозаборник\n- Недостаточный заряд хладагента\n\n**Рекомендуемая диагностика:**\n1. Проверить и очистить фильтры (15 мин)\n2. Измерить сопротивление термистора (норма: 5–15 кОм при 25°C)\n3. Проверить давление R-32 в системе\n4. Осмотреть воздуховоды на предмет блокировок',
    time: '11:42',
  },
  {
    id: 'm3',
    role: 'user',
    text: 'Фильтры чистые. Термистор как проверить точнее?',
    time: '11:44',
  },
  {
    id: 'm4',
    role: 'assistant',
    text: 'Для точной проверки термистора внутреннего блока Daikin FTXB35C:\n\n**Шаг 1 — Доступ к плате:**\nСнимите переднюю панель, отсоедините разъём термистора (обычно белый 2-пиновый, маркировка TH2 или TH-IN).\n\n**Шаг 2 — Измерение мультиметром (режим «Ω»):**\n- При 0°C: ~15,8 кОм\n- При 25°C: ~5,4 кОм  ← **норма в комнате**\n- При 50°C: ~2,1 кОм\n\n**Шаг 3 — Интерпретация:**\n- Сопротивление 0 Ом → короткое замыкание, замена\n- Сопротивление ∞ → обрыв цепи, замена\n- Значение вне диапазона >10% → дрейф, замена\n\n**Артикул запчасти:** 2103994 (Daikin Thermistor Indoor Unit)',
    time: '11:45',
  },
  {
    id: 'm5',
    role: 'user',
    text: 'Измерил — 3.1 кОм при комнатной температуре ~25°C. Это выход из строя?',
    time: '11:48',
  },
  {
    id: 'm6',
    role: 'assistant',
    text: '**Да, термистор неисправен.** При 25°C норма — 5,4 кОм, вы получили 3,1 кОм — отклонение -43%, что значительно превышает допустимые ±10%.\n\nПлата управления воспринимает температуру теплообменника как слишком высокую → срабатывает защита E1.\n\n**Рекомендации:**\n✅ Заменить термистор (артикул 2103994, ≈850 ₽)\n✅ После замены сбросить ошибку: выключить питание на 5 мин\n✅ Проверить холодный пуск — E1 должна исчезнуть\n\n**Время замены:** ~25 минут, доступность средняя.',
    time: '11:49',
  },
  {
    id: 'm7',
    role: 'user',
    text: 'Запчасть есть на складе?',
    time: '11:50',
  },
  {
    id: 'm8',
    role: 'assistant',
    text: 'По данным склада на 17.05.2026:\n\n📦 **Термистор Daikin 2103994**\n- Склад центральный (ул. Гагарина, 45): **3 шт** в наличии\n- Склад мобильный (у инженера Петрова С.): **1 шт**\n\nМожно зарезервировать прямо из наряда WO-2026-001847 → вкладка «Материалы» → «Добавить запчасть».\n\nЕсли хотите — создам заявку на списание автоматически.',
    time: '11:51',
  },
];

const MOCK_RESPONSES: Record<AssistantMode, string[]> = {
  consultant: [
    'По вашему запросу: рекомендую проверить давление хладагента R-410A (норма при режиме охлаждения: низкое давление 6–8 бар, высокое 16–20 бар). Используйте манометрическую станцию. Если давление ниже нормы — есть утечка, требуется поиск с течеискателем.',
    'Это стандартная неисправность. Замените конденсатор пуска компрессора — ёмкость обычно 45–60 мкФ, напряжение 450В. Стоимость ≈ 350–600 ₽. Время работы — 20 минут.',
    'Алгоритм диагностики:\n1. Проверка ошибок по самодиагностике\n2. Замер давлений в системе\n3. Замер токов компрессора и вентиляторов\n4. Осмотр теплообменников\n5. Анализ журнала работы инвертора',
  ],
  analyst: [
    'Анализ за май 2026: выручка 4,2 млн ₽ (+18% к апрелю). Лидеры роста — монтажные работы (+31%) и ремонт (+22%). Рекомендую усилить продажи абонементного ТО.',
    'Топ-3 клиента по маржинальности: ООО «АркадияТех» (маржа 41%), ТЦ «Галактика» (38%), ЖК «Северный берег» (35%). Эти клиенты формируют 52% прибыли.',
    'Прогноз Q3 2026: выручка 12,4–13,8 млн ₽ (диапазон из-за неопределённости сезонного спроса). Ключевой риск — дефицит инженеров в пиковый период.',
  ],
  dispatcher: [
    'Текущие SLA-алерты:\n🔴 WO-2026-001839 (ТК Северный) — TTO просрочен на 3ч 12мин\n🟡 WO-2026-001851 (Сбербанк) — TTR через 1ч 22мин\n\nРекомендую немедленно назначить Козлова М. на WO-039.',
    'Свободные инженеры в радиусе 5 км от адреса:\n1. Петров С. — свободен, 2,3 км (≈8 мин)\n2. Иванов А. — освободится через 35 мин, 1,8 км\n3. Сидоров Д. — 4,1 км, доступен сейчас',
    'Оптимальный маршрут для Козлова М. на сегодня:\nWO-001 (09:00) → WO-003 (11:30) → WO-007 (14:00) → WO-011 (16:30)\nОбщий пробег: 34 км. Нагрузка: 7,5 ч из 8 ч рабочего дня.',
  ],
  chatbot: [
    'Стоимость технического обслуживания кондиционера:\n- Сплит-система бытовая: от 2 500 ₽\n- Кассетный кондиционер: от 3 800 ₽\n- Мультисплит-система: от 4 500 ₽\n\nВ стоимость входит чистка, дозаправка (до 100 г) и диагностика.',
    'Средний срок ремонта — 1–3 рабочих дня. При наличии запчасти на складе — чаще всего устраняем за 1 выезд. Сложные поломки (замена компрессора, платы управления) — до 5–7 дней.',
    'Для проверки статуса заявки укажите, пожалуйста, номер вашего договора или телефон. Я найду вашу заявку и сообщу актуальный статус.',
  ],
};

let counter = 0;
const uid = () => `msg-${++counter}-${Date.now()}`;

const nowTime = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypingBubble = () => (
  <div className="flex items-end gap-2 mb-3">
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <Icon name="Bot" size={15} className="text-blue-600" />
    </div>
    <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-bl-none px-4 py-3">
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

interface MessageBubbleProps {
  msg: ChatMessage;
  onCopy: (text: string) => void;
}

const MessageBubble = ({ msg, onCopy }: MessageBubbleProps) => {
  const isUser = msg.role === 'user';

  const renderText = (text: string) =>
    text.split('\n').map((line, i) => {
      const withBold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (line === '') return <div key={i} className="h-1.5" />;
      if (line.startsWith('- ') || line.startsWith('✅') || line.startsWith('📦') || line.startsWith('🔴') || line.startsWith('🟡')) {
        return (
          <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: withBold }} />
        );
      }
      if (/^\d+\./.test(line)) {
        return (
          <p key={i} className="text-sm leading-relaxed ml-2" dangerouslySetInnerHTML={{ __html: withBold }} />
        );
      }
      return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: withBold }} />;
    });

  return (
    <div className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-blue-600' : 'bg-blue-100'
        }`}
      >
        {isUser ? (
          <span className="text-white text-xs font-bold">Вы</span>
        ) : (
          <Icon name="Bot" size={15} className="text-blue-600" />
        )}
      </div>
      <div className={`max-w-[72%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-blue-50 border border-blue-100 rounded-bl-none'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.text}</p>
          ) : (
            <div className="space-y-0.5 text-gray-800">{renderText(msg.text)}</div>
          )}
        </div>
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-400">{msg.time}</span>
          {!isUser && (
            <button
              onClick={() => onCopy(msg.text)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              title="Копировать"
            >
              <Icon name="Copy" size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const AIAssistantFull = () => {
  const [mode, setMode] = useState<AssistantMode>('consultant');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { id: uid(), role: 'user', text: text.trim(), time: nowTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const pool = MOCK_RESPONSES[mode];
      const reply = pool[Math.floor(Math.random() * pool.length)];
      const assistantMsg: ChatMessage = { id: uid(), role: 'assistant', text: reply, time: nowTime() };
      setMessages(prev => [...prev, assistantMsg]);
      setLoading(false);
    }, 1000 + Math.random() * 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    toast.success('Скопировано в буфер обмена');
  };

  const handleQuickQuestion = (q: string) => sendMessage(q);

  const handleSessionLoad = (session: Session) => {
    setMode(session.mode);
    toast.success(`Сессия загружена: «${session.title}»`);
  };

  const handleArticleOpen = (article: KnowledgeArticle) => {
    toast.info(`Открываю: ${article.title}`);
  };

  const handleSourceClick = (source: AnswerSource) => {
    toast.info(`Источник: ${source.label}`);
  };

  const cfg = MODE_CONFIG[mode];
  const modeIcon = cfg.icon;

  return (
    <div className="flex h-full bg-gray-50" style={{ height: 'calc(100vh - 80px)' }}>
      {/* ── Left Panel ─────────────────────────────────────────────────── */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0">
        {/* Model status */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon name="Bot" size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">ИИ-ассистент</p>
              <p className="text-xs text-gray-500">Mistral 7B (локально)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Online</span>
            <span className="text-xs text-gray-400 ml-auto">∅ 1.2s</span>
          </div>
        </div>

        {/* Mode selector */}
        <div className="p-3 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">Режим</p>
          <div className="space-y-1">
            {(Object.entries(MODE_CONFIG) as [AssistantMode, typeof MODE_CONFIG[AssistantMode]][]).map(
              ([id, c]) => (
                <button
                  key={id}
                  onClick={() => {
                    setMode(id);
                    setMessages([]);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                    mode === id
                      ? `${c.bgColor} ${c.color} font-medium`
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={c.icon} size={15} />
                  <span>{c.label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Session history */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 pt-3 pb-2">
            История сессий
          </p>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1 pb-3">
              {SESSIONS.map(session => (
                <button
                  key={session.id}
                  onClick={() => handleSessionLoad(session)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <Icon
                      name={MODE_CONFIG[session.mode].icon}
                      size={13}
                      className={`mt-0.5 shrink-0 ${MODE_CONFIG[session.mode].color}`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate leading-tight">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{session.date}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer stats */}
        <div className="p-4 border-t border-gray-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Icon name="BookOpen" size={11} />
            <span>База знаний: 1 247 статей</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Icon name="Cpu" size={11} />
            <span>RAM: 4.2 / 8 GB</span>
          </div>
        </div>
      </div>

      {/* ── Center: Chat ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mode tabs */}
        <div className="bg-white border-b border-gray-200 px-4 pt-3 pb-0">
          <Tabs value={mode} onValueChange={v => { setMode(v as AssistantMode); setMessages([]); }}>
            <TabsList className="h-9">
              {(Object.entries(MODE_CONFIG) as [AssistantMode, typeof MODE_CONFIG[AssistantMode]][]).map(
                ([id, c]) => (
                  <TabsTrigger key={id} value={id} className="gap-1.5 text-xs px-3">
                    <Icon name={c.icon} size={13} />
                    {c.label}
                  </TabsTrigger>
                )
              )}
            </TabsList>
          </Tabs>
        </div>

        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bgColor}`}>
            <Icon name={modeIcon} size={18} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{cfg.label}</p>
            <p className="text-xs text-gray-500">{cfg.description}</p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => setMessages([])}
            >
              <Icon name="Trash2" size={12} className="mr-1" />
              Очистить
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-5 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${cfg.bgColor}`}>
                <Icon name={modeIcon} size={28} className={cfg.color} />
              </div>
              <p className="font-medium text-gray-600 mb-1 text-sm">Готов к работе</p>
              <p className="text-xs max-w-xs text-gray-400">{cfg.description}</p>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} onCopy={handleCopy} />
          ))}

          {loading && <TypingBubble />}
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Quick questions */}
        <div className="bg-white border-t border-gray-100 px-5 py-2 flex items-center gap-2">
          <span className="text-xs text-gray-400 shrink-0">Быстро:</span>
          {QUICK_QUESTIONS[mode].map(q => (
            <button
              key={q}
              onClick={() => handleQuickQuestion(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-gray-200 px-5 py-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Введите вопрос (${cfg.label.toLowerCase()})...`}
              disabled={loading}
              className="flex-1 rounded-xl border-gray-200 text-sm h-10"
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="rounded-xl h-10 px-4"
            >
              {loading ? (
                <Icon name="Loader2" size={15} className="animate-spin" />
              ) : (
                <Icon name="Send" size={15} />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            ИИ может ошибаться. Проверяйте важную техническую информацию по документации.
          </p>
        </div>
      </div>

      {/* ── Right Panel: Context ────────────────────────────────────────── */}
      <div className="w-64 border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Linked work order */}
            <Card className="border-gray-200 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Icon name="FileText" size={13} className="text-blue-500" />
                  Привязанный наряд
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600">WO-2026-001847</span>
                  <Badge variant="outline" className="text-xs h-5 px-1.5 text-orange-600 border-orange-200 bg-orange-50">
                    В работе
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-start gap-1.5">
                    <Icon name="User" size={11} className="mt-0.5 text-gray-400 shrink-0" />
                    <span>ООО «АркадияТех»</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Icon name="MapPin" size={11} className="mt-0.5 text-gray-400 shrink-0" />
                    <span>ул. Ленина, 47, оф. 312</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Icon name="Wind" size={11} className="mt-0.5 text-gray-400 shrink-0" />
                    <span>Daikin FTXB35C-W, 2022</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Icon name="AlertTriangle" size={11} className="mt-0.5 text-orange-400 shrink-0" />
                    <span className="text-orange-700">Ошибка E1, не охлаждает</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs mt-1"
                  onClick={() => toast.info('Открываю наряд WO-2026-001847')}
                >
                  <Icon name="ExternalLink" size={11} className="mr-1" />
                  Открыть наряд
                </Button>
              </CardContent>
            </Card>

            {/* Knowledge base articles */}
            <Card className="border-gray-200 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Icon name="BookOpen" size={13} className="text-purple-500" />
                  База знаний
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {KNOWLEDGE_ARTICLES.map(article => (
                  <div
                    key={article.id}
                    className="p-2 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <Badge variant="outline" className="text-xs h-4 px-1 shrink-0 font-normal">
                        {article.category}
                      </Badge>
                      <span className="text-xs text-green-600 font-medium shrink-0">
                        {article.relevance}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-tight mb-1.5">{article.title}</p>
                    <button
                      onClick={() => handleArticleOpen(article)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                      <Icon name="ExternalLink" size={10} />
                      Открыть
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Answer confidence */}
            <Card className="border-gray-200 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Icon name="TrendingUp" size={13} className="text-green-500" />
                  Уверенность ответа
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Точность RAG</span>
                  <span className="text-sm font-bold text-green-600">87%</span>
                </div>
                <Progress value={87} className="h-2 mb-3" />
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Статьи в контексте</span>
                    <span className="font-medium text-gray-700">3</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Похожих кейсов</span>
                    <span className="font-medium text-gray-700">12</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Токенов в контексте</span>
                    <span className="font-medium text-gray-700">2 847</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Answer sources */}
            <Card className="border-gray-200 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Icon name="Link" size={13} className="text-gray-400" />
                  Источники
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5">
                {ANSWER_SOURCES.map(source => {
                  const iconMap: Record<AnswerSource['type'], string> = {
                    manual: 'BookOpen',
                    case: 'Briefcase',
                    spec: 'FileCheck',
                  };
                  return (
                    <button
                      key={source.id}
                      onClick={() => handleSourceClick(source)}
                      className="w-full flex items-start gap-2 text-left p-1.5 rounded hover:bg-gray-50 transition-colors group"
                    >
                      <Icon
                        name={iconMap[source.type]}
                        size={12}
                        className="text-gray-400 mt-0.5 shrink-0 group-hover:text-blue-500 transition-colors"
                      />
                      <span className="text-xs text-gray-600 leading-tight group-hover:text-blue-600 transition-colors">
                        {source.label}
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AIAssistantFull;
