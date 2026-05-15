import { useState, useRef } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Edit2,
  Save,
  X,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ChannelType = 'sms' | 'email' | 'telegram' | 'push' | 'whatsapp';
type EventType =
  | 'work_order_assigned'
  | 'engineer_en_route'
  | 'work_completed'
  | 'sla_warning'
  | 'parts_ordered'
  | 'parts_received'
  | 'thirty_min_warning'
  | 'review_request';

interface NotificationTemplate {
  id: string;
  name: string;
  event: EventType;
  channel: ChannelType;
  subject: string;
  body: string;
  enabled: boolean;
  sentCount: number;
  lastSentAt: string;
}

const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: 't1',
    name: 'Наряд принят — SMS',
    event: 'work_order_assigned',
    channel: 'sms',
    subject: '',
    body: 'Заявка {{order_number}} принята. Инженер {{engineer_name}} приедет {{date}} в {{time}}. Адрес: {{address}}.',
    enabled: true,
    sentCount: 1847,
    lastSentAt: '15.05.2026 14:32',
  },
  {
    id: 't2',
    name: 'Инженер выехал — Telegram',
    event: 'engineer_en_route',
    channel: 'telegram',
    subject: '',
    body: '🚗 Инженер {{engineer_name}} выехал к вам.\nОжидайте примерно через {{eta}} мин.\nНомер заявки: {{order_number}}',
    enabled: true,
    sentCount: 1203,
    lastSentAt: '15.05.2026 13:58',
  },
  {
    id: 't3',
    name: 'Работы выполнены — Email',
    event: 'work_completed',
    channel: 'email',
    subject: 'Заявка {{order_number}} выполнена — ООО «Сервис Климат»',
    body: 'Уважаемый(ая) {{client_name}},\n\nРаботы по заявке {{order_number}} успешно выполнены.\n\nПожалуйста, оцените качество обслуживания:\n{{link}}\n\nС уважением,\nКоманда «Сервис Климат»',
    enabled: true,
    sentCount: 982,
    lastSentAt: '15.05.2026 12:15',
  },
  {
    id: 't4',
    name: 'Предупреждение SLA — Push',
    event: 'sla_warning',
    channel: 'push',
    subject: '',
    body: '⚠️ SLA под угрозой!\nНаряд {{order_number}} — {{client_name}}\nОсталось: {{eta}} мин до нарушения SLA',
    enabled: true,
    sentCount: 73,
    lastSentAt: '15.05.2026 11:47',
  },
  {
    id: 't5',
    name: 'ЗИП заказан — WhatsApp',
    event: 'parts_ordered',
    channel: 'whatsapp',
    subject: '',
    body: 'Здравствуйте, {{client_name}}!\n\nПо вашей заявке {{order_number}} заказана необходимая запчасть.\nОжидаемая дата получения: {{date}}.\n\nКак только деталь поступит, мы с вами свяжемся для согласования времени визита.',
    enabled: true,
    sentCount: 341,
    lastSentAt: '14.05.2026 17:20',
  },
  {
    id: 't6',
    name: 'ЗИП получен — SMS',
    event: 'parts_received',
    channel: 'sms',
    subject: '',
    body: 'Запчасть по заявке {{order_number}} получена. Свяжемся для согласования времени визита. Сервис Климат.',
    enabled: true,
    sentCount: 287,
    lastSentAt: '14.05.2026 10:05',
  },
  {
    id: 't7',
    name: 'Инженер через 30 мин — Telegram',
    event: 'thirty_min_warning',
    channel: 'telegram',
    subject: '',
    body: '⏱ Инженер {{engineer_name}} будет у вас примерно через 30 минут.\nЗаявка: {{order_number}}\nАдрес: {{address}}',
    enabled: false,
    sentCount: 512,
    lastSentAt: '13.05.2026 09:30',
  },
  {
    id: 't8',
    name: 'Запрос оценки — Email',
    event: 'review_request',
    channel: 'email',
    subject: 'Оцените качество обслуживания — {{order_number}}',
    body: 'Уважаемый(ая) {{client_name}},\n\nСпасибо, что выбрали «Сервис Климат»!\n\nПросим вас уделить минуту и оценить качество работы инженера {{engineer_name}}.\n\nСсылка для оценки: {{link}}\n\nВаше мнение помогает нам становиться лучше!\n\nС уважением,\n«Сервис Климат»',
    enabled: true,
    sentCount: 654,
    lastSentAt: '15.05.2026 08:00',
  },
];

const CHANNEL_META: Record<ChannelType, { label: string; color: string; bg: string; Icon: React.ComponentType<{ className?: string }> }> = {
  sms: { label: 'SMS', color: 'text-green-700', bg: 'bg-green-100', Icon: Smartphone },
  email: { label: 'Email', color: 'text-blue-700', bg: 'bg-blue-100', Icon: Mail },
  telegram: { label: 'Telegram', color: 'text-sky-700', bg: 'bg-sky-100', Icon: MessageSquare },
  push: { label: 'Push', color: 'text-purple-700', bg: 'bg-purple-100', Icon: Bell },
  whatsapp: { label: 'WhatsApp', color: 'text-emerald-700', bg: 'bg-emerald-100', Icon: MessageSquare },
};

const EVENT_LABEL: Record<EventType, string> = {
  work_order_assigned: 'Наряд назначен',
  engineer_en_route: 'Инженер выехал',
  work_completed: 'Работы выполнены',
  sla_warning: 'Предупреждение SLA',
  parts_ordered: 'ЗИП заказан',
  parts_received: 'ЗИП получен',
  thirty_min_warning: 'Инженер через 30 мин',
  review_request: 'Запрос оценки',
};

const AVAILABLE_VARIABLES = [
  '{{client_name}}',
  '{{order_number}}',
  '{{engineer_name}}',
  '{{eta}}',
  '{{address}}',
  '{{status}}',
  '{{link}}',
  '{{date}}',
  '{{time}}',
];

const SAMPLE_VALUES: Record<string, string> = {
  '{{client_name}}': 'Иванов Иван',
  '{{order_number}}': 'WO-2026-000112',
  '{{engineer_name}}': 'Козлов М.И.',
  '{{eta}}': '25',
  '{{address}}': 'ул. Ленина, 45',
  '{{status}}': 'В пути',
  '{{link}}': 'https://sk.ru/review/abc123',
  '{{date}}': '16.05.2026',
  '{{time}}': '14:30',
};

const CHANNEL_ORDER: ChannelType[] = ['sms', 'email', 'telegram', 'push', 'whatsapp'];

function renderPreview(body: string, subject: string, channel: ChannelType): string {
  let text = channel === 'email' && subject ? `Тема: ${subject}\n\n${body}` : body;
  for (const [variable, value] of Object.entries(SAMPLE_VALUES)) {
    text = text.split(variable).join(value);
  }
  return text;
}

export default function NotificationTemplates() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(INITIAL_TEMPLATES[0].id);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Edit buffer state
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const current = templates.find(t => t.id === selectedTemplate)!;

  function startEdit() {
    setEditName(current.name);
    setEditSubject(current.subject);
    setEditBody(current.body);
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
  }

  function saveEdit() {
    setTemplates(prev =>
      prev.map(t =>
        t.id === selectedTemplate
          ? { ...t, name: editName, subject: editSubject, body: editBody }
          : t
      )
    );
    setEditMode(false);
    toast.success('Шаблон сохранён');
  }

  function toggleEnabled(id: string) {
    setTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  }

  function insertVariable(variable: string) {
    if (!editMode) return;
    const textarea = bodyRef.current;
    if (!textarea) {
      setEditBody(prev => prev + variable);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = editBody.slice(0, start) + variable + editBody.slice(end);
    setEditBody(newBody);
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.selectionStart = start + variable.length;
      textarea.selectionEnd = start + variable.length;
      textarea.focus();
    });
  }

  function handleTestSend() {
    toast.success(`Тест отправлен на +7 999 123-45-67`);
  }

  function handleSelectTemplate(id: string) {
    if (editMode) {
      const confirmed = window.confirm('Есть несохранённые изменения. Выйти без сохранения?');
      if (!confirmed) return;
      setEditMode(false);
    }
    setSelectedTemplate(id);
  }

  const totalEnabled = templates.filter(t => t.enabled).length;
  const countByChannel = (ch: ChannelType) => templates.filter(t => t.channel === ch).length;

  const body = editMode ? editBody : current.body;
  const subject = editMode ? editSubject : current.subject;
  const name = editMode ? editName : current.name;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Stats row */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">Шаблоны уведомлений</span>
        </div>
        <div className="flex items-center gap-4 ml-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500">Всего:</span>
            <span className="font-semibold text-gray-800">{templates.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-500">Активны:</span>
            <span className="font-semibold text-green-700">{totalEnabled}</span>
          </div>
          {(['sms', 'email', 'telegram'] as ChannelType[]).map(ch => {
            const meta = CHANNEL_META[ch];
            const ChanIcon = meta.Icon;
            return (
              <div key={ch} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${meta.bg} ${meta.color} font-medium`}>
                <ChanIcon className="w-3.5 h-3.5" />
                {meta.label}: {countByChannel(ch)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 bg-white border-r flex flex-col overflow-y-auto flex-shrink-0">
          {CHANNEL_ORDER.map(channel => {
            const channelTemplates = templates.filter(t => t.channel === channel);
            if (channelTemplates.length === 0) return null;
            const meta = CHANNEL_META[channel];
            const ChanIcon = meta.Icon;
            return (
              <div key={channel}>
                <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b ${meta.bg} ${meta.color}`}>
                  <ChanIcon className="w-3.5 h-3.5" />
                  {meta.label}
                </div>
                {channelTemplates.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                      selectedTemplate === tmpl.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{tmpl.name}</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">{EVENT_LABEL[tmpl.event]}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleEnabled(tmpl.id); }}
                      className="flex-shrink-0 mt-0.5"
                      title={tmpl.enabled ? 'Отключить' : 'Включить'}
                    >
                      {tmpl.enabled
                        ? <ToggleRight className="w-5 h-5 text-green-500" />
                        : <ToggleLeft className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
            {/* Left: Editor form */}
            <div className="flex-1 flex flex-col p-5 gap-4 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {editMode ? (
                    <input
                      type="text"
                      value={name}
                      onChange={e => setEditName(e.target.value)}
                      className="text-lg font-semibold text-gray-800 border-b border-blue-400 focus:outline-none bg-transparent flex-1 min-w-0"
                    />
                  ) : (
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{current.name}</h2>
                  )}
                  <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CHANNEL_META[current.channel].bg} ${CHANNEL_META[current.channel].color}`}>
                    {(() => { const ChanIcon = CHANNEL_META[current.channel].Icon; return <ChanIcon className="w-3 h-3" />; })()}
                    {CHANNEL_META[current.channel].label}
                  </span>
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {EVENT_LABEL[current.event]}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {editMode ? (
                    <>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="gap-1.5">
                        <X className="w-3.5 h-3.5" />
                        Отменить
                      </Button>
                      <Button size="sm" onClick={saveEdit} className="gap-1.5">
                        <Save className="w-3.5 h-3.5" />
                        Сохранить
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={startEdit} className="gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" />
                      Редактировать
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <div>
                  Отправлено: <span className="font-semibold text-gray-700">{current.sentCount.toLocaleString('ru-RU')}</span>
                </div>
                <div>
                  Последняя: <span className="font-semibold text-gray-700">{current.lastSentAt}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  Статус:
                  {current.enabled
                    ? <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle className="w-3.5 h-3.5" />Активен</span>
                    : <span className="text-gray-400 font-medium">Отключён</span>
                  }
                </div>
              </div>

              {/* Subject (email only) */}
              {current.channel === 'email' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Тема письма
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setEditSubject(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Введите тему письма..."
                    />
                  ) : (
                    <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50">
                      {subject || <span className="text-gray-400">—</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Body textarea */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Текст сообщения
                </label>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={e => editMode && setEditBody(e.target.value)}
                  readOnly={!editMode}
                  rows={8}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 leading-relaxed ${
                    editMode
                      ? 'border-gray-300 bg-white text-gray-800'
                      : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
                  placeholder="Введите текст шаблона..."
                />
              </div>

              {/* Variables panel */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Доступные переменные {editMode && <span className="text-blue-500 normal-case font-normal">(нажмите, чтобы вставить)</span>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_VARIABLES.map(v => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      disabled={!editMode}
                      title={editMode ? `Вставить ${v}` : undefined}
                      className={`px-2 py-0.5 text-xs rounded-md border font-mono transition-colors ${
                        editMode
                          ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
                          : 'border-gray-200 bg-gray-50 text-gray-500 cursor-default'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestSend}
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Тест отправки
                </Button>
                <span className="text-xs text-gray-400">Отправит тест на +7 999 123-45-67</span>
              </div>
            </div>

            {/* Right: Preview panel */}
            <div className="w-full lg:w-80 flex-shrink-0 border-l bg-white flex flex-col">
              <div className="px-4 py-3 border-b bg-gray-50">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Предпросмотр
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  С подставленными значениями
                </div>
              </div>

              {/* Device mockup */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {/* Channel-specific preview wrapper */}
                {current.channel === 'sms' || current.channel === 'push' ? (
                  <div className="mx-auto w-full max-w-[260px]">
                    {/* Phone mockup */}
                    <div className="border-2 border-gray-800 rounded-3xl overflow-hidden shadow-lg bg-gray-900 p-2">
                      <div className="bg-white rounded-2xl overflow-hidden">
                        {/* Status bar */}
                        <div className="bg-gray-100 flex items-center justify-between px-3 py-1.5">
                          <span className="text-xs text-gray-500 font-medium">9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-2 border border-gray-400 rounded-sm">
                              <div className="w-3/4 h-full bg-green-500 rounded-sm" />
                            </div>
                          </div>
                        </div>
                        {/* Notification */}
                        <div className="p-3 bg-white">
                          <div className="bg-gray-100 rounded-xl p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${CHANNEL_META[current.channel].bg}`}>
                                {(() => { const ChanIcon = CHANNEL_META[current.channel].Icon; return <ChanIcon className={`w-3 h-3 ${CHANNEL_META[current.channel].color}`} />; })()}
                              </div>
                              <span className="text-xs font-semibold text-gray-700">Сервис Климат</span>
                              <span className="text-xs text-gray-400 ml-auto">сейчас</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {renderPreview(body, subject, current.channel)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : current.channel === 'telegram' || current.channel === 'whatsapp' ? (
                  <div className="mx-auto w-full max-w-[280px]">
                    <div className="border-2 border-gray-800 rounded-3xl overflow-hidden shadow-lg bg-gray-900 p-2">
                      <div className="rounded-2xl overflow-hidden" style={{ background: current.channel === 'telegram' ? '#efeff3' : '#e5ddd5' }}>
                        {/* App header */}
                        <div className={`flex items-center gap-2 px-3 py-2 ${current.channel === 'telegram' ? 'bg-[#2CA5E0]' : 'bg-[#128C7E]'}`}>
                          <div className="w-6 h-6 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">СК</span>
                          </div>
                          <span className="text-white text-xs font-semibold">Сервис Климат</span>
                        </div>
                        {/* Messages */}
                        <div className="p-3 min-h-[100px]">
                          <div className={`max-w-[90%] rounded-2xl rounded-tl-none px-3 py-2 shadow-sm ${current.channel === 'telegram' ? 'bg-white' : 'bg-white'}`}>
                            <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {renderPreview(body, subject, current.channel)}
                            </p>
                            <span className="text-[10px] text-gray-400 float-right mt-1">14:32</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Email preview */
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Email header */}
                    <div className="bg-gray-50 border-b px-3 py-2 space-y-1">
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-10 flex-shrink-0">От:</span>
                        <span className="text-gray-700">noreply@servisklimat.ru</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-10 flex-shrink-0">Кому:</span>
                        <span className="text-gray-700">ivanov@example.com</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-10 flex-shrink-0">Тема:</span>
                        <span className="text-gray-800 font-medium">
                          {subject
                            ? renderPreview('', subject, current.channel).replace('Тема: ', '').split('\n\n')[0]
                            : '(без темы)'}
                        </span>
                      </div>
                    </div>
                    {/* Email body */}
                    <div className="p-4 bg-white">
                      <div className="border-b border-gray-100 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">СК</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">ООО «Сервис Климат»</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {(() => {
                          const preview = renderPreview(body, subject, current.channel);
                          // For email, strip the "Тема: ...\n\n" prefix if present
                          const lines = preview.split('\n\n');
                          if (lines[0].startsWith('Тема:')) {
                            return lines.slice(1).join('\n\n');
                          }
                          return preview;
                        })()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Variable substitution table */}
                <div className="mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Подставленные значения
                  </div>
                  <div className="space-y-1">
                    {AVAILABLE_VARIABLES.filter(v => body.includes(v) || subject.includes(v)).map(v => (
                      <div key={v} className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">{v}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600 truncate">{SAMPLE_VALUES[v]}</span>
                      </div>
                    ))}
                    {!AVAILABLE_VARIABLES.some(v => body.includes(v) || subject.includes(v)) && (
                      <div className="text-xs text-gray-400">Нет переменных в шаблоне</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
