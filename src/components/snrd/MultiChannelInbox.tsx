import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type Channel = 'telegram' | 'whatsapp' | 'email' | 'avito' | 'phone' | 'portal';
type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

interface Message {
  id: string;
  channel: Channel;
  from: string;
  fromPhone?: string;
  subject?: string;
  preview: string;
  fullText: string;
  time: string;
  status: MessageStatus;
  priority: 'normal' | 'urgent';
  assignedTo?: string;
  tags: string[];
  linkedOrderId?: string;
}

const MESSAGES: Message[] = [
  { id: 'M01', channel: 'telegram', from: 'Иванов Иван', fromPhone: '+7 900 123-45-67', preview: 'Добрый день! Когда приедет мастер?', fullText: 'Добрый день! Я оставлял заявку на ремонт кондиционера. Когда приедет мастер? Уже 3 часа жду.', time: '14:32', status: 'new', priority: 'urgent', tags: ['заявка', 'ожидание'], linkedOrderId: 'WO-2026-000412' },
  { id: 'M02', channel: 'whatsapp', from: 'ТЦ «Европа» - Менеджер', fromPhone: '+7 911 555-22-11', preview: 'Нам нужно срочно обслужить 5 кондиционеров', fullText: 'Здравствуйте! У нас в торговом центре вышли из строя 3 кондиционера в торговом зале. Нам нужно срочно обслуживание. Сколько будет стоить и когда сможете приехать?', time: '14:18', status: 'new', priority: 'urgent', tags: ['срочно', 'корпоративный'], linkedOrderId: undefined },
  { id: 'M03', channel: 'email', from: 'petrov@company.ru', subject: 'Заявка на ТО оборудования', preview: 'Прошу организовать плановое техническое обслуживание...', fullText: 'Уважаемые коллеги!\n\nПрошу организовать плановое техническое обслуживание кондиционеров в нашем офисе согласно договору №125-2025 от 01.03.2025.\n\nОборудование: 12 сплит-систем Samsung, 3 кассетных блока Daikin.\n\nУдобное время: понедельник-пятница с 9:00 до 18:00.\n\nС уважением, Петров А.А.', time: '13:55', status: 'read', priority: 'normal', tags: ['договор', 'ТО'], linkedOrderId: undefined },
  { id: 'M04', channel: 'avito', from: 'Покупатель Avito', preview: 'Здравствуйте, интересует установка кондиционера...', fullText: 'Здравствуйте, интересует установка кондиционера в квартиру. Площадь комнаты 20 кв.м, 5 этаж, кирпичный дом. Сколько будет стоить и какой кондиционер посоветуете?', time: '13:20', status: 'new', priority: 'normal', tags: ['Авито', 'продажа'], linkedOrderId: undefined },
  { id: 'M05', channel: 'phone', from: 'Смирнова Ольга', fromPhone: '+7 916 777-33-44', preview: 'Входящий звонок — 4 мин 12 сек', fullText: 'Входящий звонок от +7 916 777-33-44\nПродолжительность: 4 мин 12 сек\nОператор: Сидорова А.\nТема: Вопрос о гарантийном обслуживании после ремонта', time: '12:45', status: 'replied', priority: 'normal', tags: ['звонок', 'гарантия'], linkedOrderId: 'WO-2026-000398' },
  { id: 'M06', channel: 'portal', from: 'Новиков Д.С. (Портал)', preview: 'Оценил работу: 5/5 — Отличное обслуживание!', fullText: 'Оставлена оценка через клиентский портал:\nОценка: 5/5 ★★★★★\nКомментарий: Отличное обслуживание! Мастер Петров А.В. приехал вовремя, всё объяснил и сделал аккуратно. Кондиционер работает идеально. Спасибо!', time: '12:10', status: 'new', priority: 'normal', tags: ['отзыв', '5 звёзд'], linkedOrderId: 'WO-2026-000405' },
  { id: 'M07', channel: 'telegram', from: 'Козлов Петр', fromPhone: '+7 903 222-88-55', preview: 'Отправил фото сломанного блока', fullText: 'Вот фото того, что сломалось. Видно, что из внутреннего блока течёт вода. Это серьёзно?', time: '11:33', status: 'read', priority: 'normal', tags: ['фото', 'поломка'], linkedOrderId: undefined },
  { id: 'M08', channel: 'email', from: 'buh@stroigroup.ru', subject: 'Счёт №2026-0441 — оплата', preview: 'Направляем платёжное поручение на оплату счёта...', fullText: 'Направляем платёжное поручение на оплату счёта №2026-0441 от 12.05.2026 на сумму 45 800 руб.\nОплата будет произведена до 20.05.2026.\n\nПросим подтвердить получение.', time: '10:55', status: 'replied', priority: 'normal', tags: ['оплата', 'счёт'], linkedOrderId: undefined },
];

const channelConfig: Record<Channel, { label: string; color: string; bg: string; icon: string }> = {
  telegram: { label: 'Telegram', color: 'text-blue-500', bg: 'bg-blue-50', icon: 'Send' },
  whatsapp: { label: 'WhatsApp', color: 'text-green-600', bg: 'bg-green-50', icon: 'MessageCircle' },
  email: { label: 'Email', color: 'text-gray-600', bg: 'bg-gray-50', icon: 'Mail' },
  avito: { label: 'Авито', color: 'text-orange-500', bg: 'bg-orange-50', icon: 'ShoppingBag' },
  phone: { label: 'Телефон', color: 'text-purple-600', bg: 'bg-purple-50', icon: 'Phone' },
  portal: { label: 'Портал', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: 'Globe' },
};

const OPERATORS = ['Сидорова А.', 'Белова Н.', 'Козлов Д.', 'Не назначен'];

const MultiChannelInbox = () => {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [selected, setSelected] = useState<Message | null>(MESSAGES[0]);
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'all'>('all');
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = messages.filter(m => {
    if (channelFilter !== 'all' && m.channel !== channelFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery && !m.from.toLowerCase().includes(searchQuery.toLowerCase()) && !m.preview.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const newCount = messages.filter(m => m.status === 'new').length;

  const markRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' as MessageStatus } : m));
  };

  const handleSelect = (msg: Message) => {
    setSelected(msg);
    setReplyText('');
    if (msg.status === 'new') markRead(msg.id);
  };

  const handleReply = () => {
    if (!replyText.trim() || !selected) return;
    setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, status: 'replied' as MessageStatus } : m));
    setSelected(prev => prev ? { ...prev, status: 'replied' } : null);
    setReplyText('');
  };

  const handleArchive = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'archived' as MessageStatus } : m));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="flex h-full">
      {/* Список сообщений */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        {/* Поиск */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Фильтры каналов */}
        <div className="p-2 border-b border-gray-100">
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${channelFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Все {newCount > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">{newCount}</span>}
            </button>
            {(Object.keys(channelConfig) as Channel[]).map(ch => {
              const cfg = channelConfig[ch];
              const cnt = messages.filter(m => m.channel === ch && m.status === 'new').length;
              return (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${channelFilter === ch ? `${cfg.bg} ${cfg.color}` : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Icon name={cfg.icon} size={10} />
                  {cfg.label}
                  {cnt > 0 && <span className="bg-red-500 text-white rounded-full px-1 text-xs">{cnt}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1 mt-1.5">
            {(['all', 'new', 'read', 'replied'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${statusFilter === s ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                {{ all: 'Все', new: 'Новые', read: 'Прочитано', replied: 'Отвечено' }[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Список */}
        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">Нет сообщений</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(msg => {
                const cfg = channelConfig[msg.channel];
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === msg.id ? 'bg-blue-50' : ''} ${msg.status === 'new' ? 'border-l-2 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={cfg.icon} size={13} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-medium truncate ${msg.status === 'new' ? 'text-gray-900' : 'text-gray-600'}`}>
                            {msg.from}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{msg.time}</span>
                        </div>
                        {msg.subject && <div className="text-xs font-medium text-gray-700 truncate mb-0.5">{msg.subject}</div>}
                        <p className="text-xs text-gray-500 truncate">{msg.preview}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {msg.priority === 'urgent' && <span className="text-xs text-red-500 font-medium">Срочно</span>}
                          {msg.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Детальный просмотр */}
      {selected ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Шапка */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full ${channelConfig[selected.channel].bg} flex items-center justify-center`}>
                <Icon name={channelConfig[selected.channel].icon} size={16} className={channelConfig[selected.channel].color} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{selected.from}</span>
                  {selected.fromPhone && <span className="text-sm text-gray-500">{selected.fromPhone}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${channelConfig[selected.channel].bg} ${channelConfig[selected.channel].color}`}>
                    {channelConfig[selected.channel].label}
                  </span>
                  {selected.priority === 'urgent' && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">Срочно</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">{selected.time} · {selected.status === 'new' ? 'Новое' : selected.status === 'read' ? 'Прочитано' : 'Отвечено'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selected.linkedOrderId && (
                <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <Icon name="ExternalLink" size={12} />
                  {selected.linkedOrderId}
                </button>
              )}
              <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white">
                {OPERATORS.map(op => <option key={op}>{op}</option>)}
              </select>
              <button
                onClick={() => handleArchive(selected.id)}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-400"
                title="Архивировать"
              >
                <Icon name="Archive" size={15} />
              </button>
            </div>
          </div>

          {/* Тело сообщения */}
          <ScrollArea className="flex-1 p-6">
            {selected.subject && (
              <h3 className="text-base font-semibold text-gray-900 mb-3">{selected.subject}</h3>
            )}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {selected.fullText}
            </div>
            {selected.tags.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Блок ответа */}
          <div className="border-t border-gray-200 p-4">
            {/* Быстрые ответы */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {[
                'Принято, назначаем мастера',
                'Уточним детали и свяжемся',
                'Заявка создана, ожидайте звонка',
                'Мастер едет, примерное время: 30 мин',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setReplyText(q)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors text-gray-600"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Ответить через ${channelConfig[selected.channel].label}...`}
                className="flex-1 border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(); }}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={handleReply} disabled={!replyText.trim()} className="h-9">
                  <Icon name="Send" size={14} className="mr-1.5" />
                  Отправить
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Заявка
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Ctrl+Enter для отправки</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <Icon name="Inbox" size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Выберите сообщение</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiChannelInbox;
