import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, BookOpen, AlertCircle, Wrench, BarChart2, MessageSquare, Loader2, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode: AIMode;
  liked?: boolean | null;
}

type AIMode = 'consultant' | 'analyst' | 'dispatcher' | 'general';

const MODE_CFG: Record<AIMode, { label: string; icon: React.ElementType; color: string; bg: string; prompt: string }> = {
  consultant: {
    label: 'Технический консультант',
    icon: Wrench,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    prompt: 'Задайте технический вопрос по оборудованию, коду ошибки или методу ремонта',
  },
  analyst: {
    label: 'Бизнес-аналитик',
    icon: BarChart2,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    prompt: 'Спросите об эффективности, выручке, SLA или стратегии',
  },
  dispatcher: {
    label: 'Ассистент диспетчера',
    icon: AlertCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    prompt: 'Помогу с расстановкой приоритетов, назначением инженеров и SLA-алертами',
  },
  general: {
    label: 'Общий помощник',
    icon: MessageSquare,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    prompt: 'Задайте любой вопрос о работе системы',
  },
};

const QUICK_PROMPTS: Record<AIMode, string[]> = {
  consultant: [
    'Код ошибки E4 на Daikin FTXB35C — что это?',
    'Как проверить давление в системе R-410A?',
    'Признаки неисправности компрессора',
    'Периодичность ТО кондиционеров',
  ],
  analyst: [
    'Анализ выручки за май 2026',
    'Топ-5 клиентов по прибыльности',
    'Тренд нарушений SLA за квартал',
    'Эффективность инженера Козлова М.',
  ],
  dispatcher: [
    'Какие наряды под угрозой SLA сейчас?',
    'Кого назначить на аварийный выезд?',
    'Свободные инженеры в центре города',
    'Перенести наряд №WO-047 на завтра',
  ],
  general: [
    'Как создать новую заявку?',
    'Как добавить оборудование клиента?',
    'Настройка уведомлений',
    'Экспорт отчёта в Excel',
  ],
};

const MOCK_RESPONSES: Record<AIMode, Record<string, string>> = {
  consultant: {
    default: `**Код ошибки E4 (Daikin)**\n\nОшибка E4 на кондиционерах Daikin серии FTXB указывает на **перегрев инвертора** (защита по температуре силовых модулей).\n\n**Причины:**\n- Загрязнённые рёбра радиатора инвертора\n- Недостаточная вентиляция наружного блока\n- Неисправность вентилятора наружного блока\n- Дефект термопасты на IGBT-модуле\n\n**Диагностика:**\n1. Проверить зазоры вокруг наружного блока (мин. 20 см сзади, 50 см спереди)\n2. Очистить рёбра радиатора инвертора сжатым воздухом\n3. Проверить вращение вентилятора наружного блока\n4. Измерить температуру инвертора при работе (норма < 85°C)\n\n**Вероятность:** в 70% случаев помогает чистка наружного блока.`,
  },
  analyst: {
    default: `**Анализ выручки май 2026**\n\nВыручка составила **4,2 млн ₽** — прирост +18% к апрелю.\n\n**Структура:**\n- Ремонт: 1,84 млн (44%) ↑+22%\n- ТО: 1,05 млн (25%) ↑+8%\n- Монтаж: 0,82 млн (19%) ↑+31%\n- ЗИП: 0,49 млн (12%) ↑+5%\n\n**Ключевые драйверы роста:**\n1. Рост монтажных работ — начало сезона (+9 новых клиентов)\n2. Конверсия лидов из Avito выросла с 12% до 18%\n3. Средний чек ремонта вырос на 7% благодаря КП с вариантами\n\n**Рекомендации:** усилить продажи абонементного ТО — текущая конверсия 15%, потенциал до 28%.`,
  },
  dispatcher: {
    default: `**Текущие SLA-алерты (${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })})**\n\n🔴 **Критично (2 наряда):**\n- WO-2026-000038 (ТК Северный) — TTO просрочен на 4ч 7мин\n- WO-2026-000047 (ТЦ Мираж) — TTR истекает через 23 мин\n\n🟡 **Предупреждение (1 наряд):**\n- WO-2026-000051 (Сбербанк-Сервис) — TTR истекает через 1ч 38мин\n\n**Рекомендации:**\n1. WO-047: назначить Козлова М. (свободен, в 4 км) — ETA 12 мин\n2. WO-038: связаться с клиентом и объяснить задержку из-за ЗИП\n3. WO-051: Петров С. завершит WO-049 через ~30 мин, можно переназначить`,
  },
  general: {
    default: `Для создания новой заявки:\n\n1. Нажмите кнопку **«Создать»** в правом верхнем углу любого раздела\n2. Или перейдите в **Заявки** и нажмите «+ Создать»\n3. Заполните обязательные поля: клиент, объект, тип работы, приоритет\n4. Выберите инженера или нажмите «Автораспределение»\n5. Нажмите «Сохранить» — заявка создана, уведомления отправлены автоматически\n\n💡 **Горячая клавиша:** Ctrl+N — быстрое создание заявки из любого экрана.`,
  },
};

let msgCounter = 0;
const newId = () => `msg-${++msgCounter}`;

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <Bot size={16} className="text-blue-600" />
    </div>
    <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

const AIAssistant = () => {
  const [mode, setMode] = useState<AIMode>('consultant');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: newId(), role: 'user', content: text.trim(), timestamp: new Date(), mode };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const responseText = MOCK_RESPONSES[mode]?.default || 'Обрабатываю запрос...';
    const assistantMsg: Message = { id: newId(), role: 'assistant', content: responseText, timestamp: new Date(), mode, liked: null };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  const handleLike = (id: string, val: boolean) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: val } : m));
    toast.success(val ? 'Спасибо за положительный отзыв!' : 'Спасибо за обратную связь');
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-gray-900 mt-2 mb-1" dangerouslySetInnerHTML={{ __html: bold }} />;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i} className="ml-4 list-disc text-gray-700" dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />;
      }
      if (/^\d+\./.test(line)) {
        return <li key={i} className="ml-4 list-decimal text-gray-700" dangerouslySetInnerHTML={{ __html: bold.replace(/^\d+\.\s*/, '') }} />;
      }
      if (line.startsWith('🔴') || line.startsWith('🟡') || line.startsWith('💡')) {
        return <p key={i} className="text-gray-800 my-1" dangerouslySetInnerHTML={{ __html: bold }} />;
      }
      if (line === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  const cfg = MODE_CFG[mode];

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Left panel — mode selector + quick prompts */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600" /> Режим ИИ
          </h3>
          <div className="space-y-2">
            {(Object.entries(MODE_CFG) as [AIMode, typeof MODE_CFG[AIMode]][]).map(([id, c]) => {
              const Icon = c.icon;
              return (
                <button key={id} onClick={() => { setMode(id); setMessages([]); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${mode === id ? `${c.bg} ${c.color} font-medium` : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Icon size={16} />
                  <span className="text-sm">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Быстрые запросы</h4>
          <div className="space-y-2">
            {QUICK_PROMPTS[mode].map((prompt, i) => (
              <button key={i} onClick={() => sendMessage(prompt)}
                className="w-full text-left text-xs text-gray-600 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <BookOpen size={12} />
            <span>База знаний: 1,247 статей</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <Bot size={12} />
            <span>Модель: Claude 4 Sonnet</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat header */}
        <div className={`px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}>
            {(() => { const Icon = cfg.icon; return <Icon size={18} className={cfg.color} />; })()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{cfg.label}</p>
            <p className="text-xs text-gray-500">{cfg.prompt}</p>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setMessages([])}>
              Очистить
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Bot size={32} className="text-blue-400" />
              </div>
              <p className="font-medium text-gray-600 mb-1">ИИ-ассистент готов к работе</p>
              <p className="text-sm max-w-xs">{cfg.prompt}</p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-blue-100'}`}>
                {msg.role === 'user'
                  ? <span className="text-white text-xs font-bold">Вы</span>
                  : <Bot size={16} className="text-blue-600" />
                }
              </div>
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.role === 'user'
                    ? <p className="text-sm">{msg.content}</p>
                    : <div className="text-sm space-y-0.5">{renderContent(msg.content)}</div>
                  }
                </div>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-1.5 px-1">
                    <span className="text-xs text-gray-400">{msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                    <button onClick={() => { navigator.clipboard?.writeText(msg.content); toast.success('Скопировано'); }}
                      className="text-gray-300 hover:text-gray-500 transition-colors">
                      <Copy size={12} />
                    </button>
                    <button onClick={() => handleLike(msg.id, true)}
                      className={`transition-colors ${msg.liked === true ? 'text-green-500' : 'text-gray-300 hover:text-green-500'}`}>
                      <ThumbsUp size={12} />
                    </button>
                    <button onClick={() => handleLike(msg.id, false)}
                      className={`transition-colors ${msg.liked === false ? 'text-red-400' : 'text-gray-300 hover:text-red-400'}`}>
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={cfg.prompt + '...'}
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-50"
            />
            <Button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} size="sm"
              className="px-4 h-12 rounded-xl">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            ИИ может ошибаться. Проверяйте важную техническую информацию по документации.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
