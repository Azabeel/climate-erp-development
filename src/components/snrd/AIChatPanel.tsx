import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  unread?: boolean;
  category: 'error' | 'refrigerant' | 'diagnostic' | 'repair' | 'tuning';
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  sources?: string[];
}

const conversations: Conversation[] = [
  {
    id: '1',
    title: 'Код ошибки E5 на Daikin',
    preview: 'Высокое давление в системе. Проверьте...',
    timestamp: '10:42',
    unread: true,
    category: 'error',
  },
  {
    id: '2',
    title: 'Какой хладагент для R-32?',
    preview: 'R-32 — однокомпонентный хладагент с GWP 675...',
    timestamp: '09:15',
    category: 'refrigerant',
  },
  {
    id: '3',
    title: 'Алгоритм диагностики компрессора',
    preview: 'Замер пускового тока, проверка обмоток...',
    timestamp: 'Вчера',
    category: 'diagnostic',
  },
  {
    id: '4',
    title: 'Замена платы управления Mitsubishi',
    preview: 'Артикул SE76A693G02. Перед заменой...',
    timestamp: 'Вчера',
    category: 'repair',
  },
  {
    id: '5',
    title: 'Параметры заправки чиллера York',
    preview: 'Дозаправка R-410A — 2.8 кг на контур...',
    timestamp: '2 дня назад',
    category: 'tuning',
  },
  {
    id: '6',
    title: 'Прошивка платы Haier AS24',
    preview: 'Обновление до версии 3.21 через сервисный...',
    timestamp: '3 дня назад',
    category: 'repair',
  },
  {
    id: '7',
    title: 'Ошибка F3 на Gree GWH18',
    preview: 'Неисправность датчика температуры внешнего...',
    timestamp: '3 дня назад',
    category: 'error',
  },
  {
    id: '8',
    title: 'Регламент ТО прецизионных кондиционеров',
    preview: 'Ежеквартальная замена фильтров G4, проверка...',
    timestamp: '5 дней назад',
    category: 'tuning',
  },
];

const activeMessages: Message[] = [
  {
    id: 'm1',
    role: 'user',
    content: 'На сплит-системе Daikin FTXB25C выскакивает код ошибки E5. Что это значит и как устранить?',
    timestamp: '10:28',
  },
  {
    id: 'm2',
    role: 'ai',
    content:
      'Код E5 на Daikin FTXB25C — защита по высокому давлению в контуре хладагента. Срабатывает реле HPS при давлении ≥ 4.15 МПа.\n\nОсновные причины:\n1. Загрязнение конденсатора (наружный блок)\n2. Перезаправка системы хладагентом\n3. Неисправность вентилятора наружного блока\n4. Завоздушенность контура\n5. Засор капиллярной трубки',
    timestamp: '10:28',
    sources: ['Daikin Service Manual FTXB-C series, p.47', 'База кейсов: 234 решённых случая'],
  },
  {
    id: 'm3',
    role: 'user',
    content: 'Уже почистил конденсатор и проверил вентилятор — крутится нормально. Что дальше?',
    timestamp: '10:32',
  },
  {
    id: 'm4',
    role: 'ai',
    content:
      'Хорошо, переходим к диагностике хладагента. Подключите манометрический коллектор:\n\n• Замерьте давление нагнетания при работе — норма 2.8–3.4 МПа при +35°C на улице\n• Замерьте давление всасывания — норма 0.9–1.1 МПа\n• Проверьте перегрев на всасывании (норма 5–8 K)\n\nЕсли давление нагнетания > 3.6 МПа — слейте 50–80 г хладагента R-410A и проверьте.',
    timestamp: '10:33',
    sources: ['Регламент Daikin TM-2023-04'],
  },
  {
    id: 'm5',
    role: 'user',
    content: 'Давление нагнетания 3.9 МПа, всасывание 1.3 МПа. Перегрев 2 К.',
    timestamp: '10:38',
  },
  {
    id: 'm6',
    role: 'ai',
    content:
      'Картина характерна для перезаправки системы. Низкий перегрев (2 K вместо 5–8 K) подтверждает избыток хладагента.\n\nРекомендация:\n1. Слейте 100–120 г R-410A через сервисный порт жидкостной линии\n2. Дайте системе поработать 10 минут\n3. Повторно замерьте давления и перегрев\n4. Целевые параметры: нагнетание 3.0 МПа, всасывание 1.0 МПа, перегрев 6 K\n\nВажно: слитый хладагент необходимо собрать в сервисный баллон-рекуператор и занести в журнал хладагентов.',
    timestamp: '10:39',
    sources: ['EN 378-2:2016', 'Внутренний регламент СЦ §4.2'],
  },
  {
    id: 'm7',
    role: 'user',
    content: 'Можешь оформить эту операцию в журнал хладагентов? Баллон R-410A №SK-2024-018.',
    timestamp: '10:41',
  },
  {
    id: 'm8',
    role: 'ai',
    content:
      'Готово. Создаю запись в журнале хладагентов:\n\n• Тип операции: RECOVERY (рекуперация)\n• Хладагент: R-410A\n• Количество: 0.110 кг\n• Баллон-приёмник: SK-2024-018\n• Привязка к наряду: WO-2026-001247\n\nПодтвердите создание — и запись будет сохранена с вашей электронной подписью.',
    timestamp: '10:42',
  },
];

const categoryColors: Record<string, string> = {
  error: 'bg-red-100 text-red-700',
  refrigerant: 'bg-blue-100 text-blue-700',
  diagnostic: 'bg-amber-100 text-amber-700',
  repair: 'bg-emerald-100 text-emerald-700',
  tuning: 'bg-purple-100 text-purple-700',
};

const categoryLabels: Record<string, string> = {
  error: 'Ошибка',
  refrigerant: 'Хладагент',
  diagnostic: 'Диагностика',
  repair: 'Ремонт',
  tuning: 'Настройка',
};

export default function AIChatPanel() {
  const [activeTab, setActiveTab] = useState('consultant');
  const [selectedConv, setSelectedConv] = useState('1');
  const [inputText, setInputText] = useState('');
  const [model, setModel] = useState('mistral:7b');
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState('');

  const filteredConvs = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSend = () => {
    if (!inputText.trim()) {
      toast.error('Введите сообщение');
      return;
    }
    setIsTyping(true);
    toast.success('Сообщение отправлено ИИ-консультанту');
    setInputText('');
    setTimeout(() => setIsTyping(false), 1800);
  };

  const handleAttachPhoto = () => toast.info('Прикрепить фото оборудования');
  const handleOCR = () => toast.info('OCR распознавание кодов ошибок с фото');
  const handleKB = () => toast.info('Поиск по базе знаний и мануалам');

  return (
    <div className="space-y-4">
      {/* Заголовок и табы */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ИИ-ассистент</h1>
          <p className="text-sm text-gray-500 mt-1">
            Технический консультант на базе LLM с RAG по мануалам и кейсам
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon name="Cpu" size={16} />
            Модель:
          </div>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-44 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mistral:7b">mistral:7b (быстрая)</SelectItem>
              <SelectItem value="llama3:8b">llama3:8b (точная)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Запросов сегодня</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1 247</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon name="MessageSquare" size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Среднее время ответа</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1.2 с</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Удовлетворённость</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">94%</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Icon name="ThumbsUp" size={20} className="text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Решено без инженера</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">312</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Icon name="CheckCircle2" size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="consultant" className="gap-2">
            <Icon name="Wrench" size={16} />
            Технический консультант
          </TabsTrigger>
          <TabsTrigger value="analyst" className="gap-2">
            <Icon name="BarChart3" size={16} />
            Бизнес-аналитик
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="gap-2">
            <Icon name="Bot" size={16} />
            Чат-бот сайта
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Основное окно чата */}
      <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 380px)' }}>
        {/* Левая колонка — список диалогов */}
        <Card className="col-span-4 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Диалоги</CardTitle>
              <Button size="sm" variant="outline" className="h-8">
                <Icon name="Plus" size={14} className="mr-1" />
                Новый
              </Button>
            </div>
            <div className="relative mt-2">
              <Icon
                name="Search"
                size={14}
                className="absolute left-2.5 top-2.5 text-gray-400"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по диалогам..."
                className="pl-8 h-9"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConvs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConv(c.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedConv === c.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {c.title}
                        </p>
                        {c.unread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.preview}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant="secondary"
                          className={`${categoryColors[c.category]} text-[10px] px-1.5 py-0`}
                        >
                          {categoryLabels[c.category]}
                        </Badge>
                        <span className="text-[10px] text-gray-400">{c.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Правая колонка — активный чат */}
        <Card className="col-span-8 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Icon name="Bot" size={20} className="text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">Код ошибки E5 на Daikin</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Daikin FTXB25C • Привязка к наряду WO-2026-001247
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8">
                  <Icon name="Link2" size={14} className="mr-1" />
                  Наряд
                </Button>
                <Button size="sm" variant="outline" className="h-8">
                  <Icon name="MoreHorizontal" size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 px-4">
            <div className="py-4 space-y-4">
              {activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="Bot" size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col gap-1`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.sources.map((src, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[10px] bg-gray-50 text-gray-600 border-gray-200"
                          >
                            <Icon name="BookOpen" size={10} className="mr-1" />
                            {src}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-gray-400 px-2">{msg.timestamp}</span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Icon name="Bot" size={16} className="text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                        <span
                          className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <span
                          className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">AI печатает...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Поле ввода */}
          <div className="border-t p-4 bg-gray-50 rounded-b-lg">
            <div className="flex items-center gap-2 mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAttachPhoto}
                className="h-8 bg-white"
              >
                <Icon name="Paperclip" size={14} className="mr-1" />
                Прикрепить фото
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOCR}
                className="h-8 bg-white"
              >
                <Icon name="ScanLine" size={14} className="mr-1" />
                OCR ошибки
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleKB}
                className="h-8 bg-white"
              >
                <Icon name="BookOpen" size={14} className="mr-1" />
                База знаний
              </Button>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Опишите проблему или задайте вопрос ИИ-консультанту..."
                className="flex-1 min-h-[60px] max-h-[120px] bg-white resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                className="h-auto bg-blue-600 hover:bg-blue-700 px-5"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Enter — отправить, Shift+Enter — новая строка. Ответы ИИ носят рекомендательный
              характер.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
