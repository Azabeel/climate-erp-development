import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChannelTab = 'email' | 'sms' | 'telegram' | 'push';

type TriggerCategory = 'Статус' | 'SLA' | 'Оплата' | 'Напоминание';

interface EmailTemplate {
  id: string;
  name: string;
  trigger: string;
  triggerCategory: TriggerCategory;
  channel: ChannelTab;
  active: boolean;
  subject?: string;
  body: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VARIABLES = [
  { key: '{client_name}', label: 'client_name' },
  { key: '{order_number}', label: 'order_number' },
  { key: '{engineer_name}', label: 'engineer_name' },
  { key: '{eta}', label: 'eta' },
  { key: '{amount}', label: 'amount' },
  { key: '{date}', label: 'date' },
  { key: '{time}', label: 'time' },
  { key: '{address}', label: 'address' },
  { key: '{status}', label: 'status' },
];

const PREVIEW_VALUES: Record<string, string> = {
  '{client_name}': 'Иванов Иван',
  '{order_number}': 'WO-2026-000142',
  '{engineer_name}': 'Петров А.С.',
  '{eta}': '25',
  '{amount}': '4 850 ₽',
  '{date}': '17.05.2026',
  '{time}': '14:30',
  '{address}': 'ул. Ленина, 42, кв. 7',
  '{status}': 'В работе',
};

const TRIGGER_OPTIONS = [
  { value: 'assigned', label: 'Назначен исполнитель', category: 'Статус' as TriggerCategory },
  { value: 'en_route', label: 'Инженер выехал', category: 'Статус' as TriggerCategory },
  { value: 'completed', label: 'Работы выполнены', category: 'Статус' as TriggerCategory },
  { value: 'cancelled', label: 'Наряд отменён', category: 'Статус' as TriggerCategory },
  { value: 'sla_warning', label: 'SLA предупреждение', category: 'SLA' as TriggerCategory },
  { value: 'sla_breach', label: 'SLA нарушено', category: 'SLA' as TriggerCategory },
  { value: 'invoice_issued', label: 'Счёт выставлен', category: 'Оплата' as TriggerCategory },
  { value: 'payment_received', label: 'Оплата получена', category: 'Оплата' as TriggerCategory },
  { value: '30min_before', label: 'За 30 минут до визита', category: 'Напоминание' as TriggerCategory },
  { value: 'ppr_reminder', label: 'Плановое ТО (напоминание)', category: 'Напоминание' as TriggerCategory },
  { value: 'parts_ready', label: 'Запчасть получена', category: 'Напоминание' as TriggerCategory },
  { value: 'rating_request', label: 'Запрос оценки', category: 'Напоминание' as TriggerCategory },
];

const CATEGORY_COLORS: Record<TriggerCategory, string> = {
  'Статус': 'bg-blue-100 text-blue-700',
  'SLA': 'bg-red-100 text-red-700',
  'Оплата': 'bg-green-100 text-green-700',
  'Напоминание': 'bg-yellow-100 text-yellow-700',
};

const CHANNEL_ICONS: Record<ChannelTab, string> = {
  email: 'Mail',
  sms: 'MessageSquare',
  telegram: 'Send',
  push: 'Bell',
};

// ─── Initial Templates ────────────────────────────────────────────────────────

const INITIAL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'e1', name: 'Назначен исполнитель', trigger: 'assigned',
    triggerCategory: 'Статус', channel: 'email', active: true,
    subject: 'Ваша заявка {order_number} принята в работу',
    body: 'Уважаемый(ая) {client_name},\n\nВаша заявка {order_number} принята в работу.\nИнженер {engineer_name} посетит вас {date} в {time}.\nАдрес: {address}\n\nС уважением,\nСервис Климат',
  },
  {
    id: 'e2', name: 'Инженер выехал', trigger: 'en_route',
    triggerCategory: 'Статус', channel: 'email', active: true,
    subject: 'Инженер выехал к вам — ожидайте',
    body: 'Уважаемый(ая) {client_name},\n\nИнженер {engineer_name} уже в пути.\nОриентировочное время прибытия: {eta} минут.\n\nС уважением,\nСервис Климат',
  },
  {
    id: 'e3', name: 'Работы выполнены', trigger: 'completed',
    triggerCategory: 'Статус', channel: 'email', active: true,
    subject: 'Наряд {order_number} выполнен',
    body: 'Уважаемый(ая) {client_name},\n\nРаботы по наряду {order_number} успешно выполнены.\nСумма: {amount}\n\nОставьте оценку качества обслуживания по ссылке.\n\nС уважением,\nСервис Климат',
  },
  {
    id: 'e4', name: 'SLA предупреждение', trigger: 'sla_warning',
    triggerCategory: 'SLA', channel: 'email', active: true,
    subject: '[ВНИМАНИЕ] SLA по наряду {order_number} истекает',
    body: 'Внимание!\n\nПо наряду {order_number} (клиент: {client_name}) приближается нарушение SLA.\nСтатус: {status}\n\nПримите меры немедленно.',
  },
  {
    id: 'e5', name: 'Счёт выставлен', trigger: 'invoice_issued',
    triggerCategory: 'Оплата', channel: 'email', active: true,
    subject: 'Счёт на оплату — {order_number}',
    body: 'Уважаемый(ая) {client_name},\n\nНаправляем счёт на оплату по наряду {order_number}.\nСумма к оплате: {amount}\n\nПожалуйста, оплатите до {date}.',
  },
  {
    id: 'e6', name: 'Напоминание о визите', trigger: '30min_before',
    triggerCategory: 'Напоминание', channel: 'email', active: false,
    subject: 'Инженер будет через 30 минут',
    body: 'Уважаемый(ая) {client_name},\n\nИнженер {engineer_name} прибудет приблизительно через 30 минут.\nАдрес: {address}',
  },
  {
    id: 'e7', name: 'Запрос оценки', trigger: 'rating_request',
    triggerCategory: 'Напоминание', channel: 'email', active: true,
    subject: 'Оцените качество обслуживания',
    body: 'Уважаемый(ая) {client_name},\n\nБлагодарим за обращение!\nПожалуйста, оцените качество выполненных работ по наряду {order_number}.',
  },
  {
    id: 'e8', name: 'Наряд отменён', trigger: 'cancelled',
    triggerCategory: 'Статус', channel: 'email', active: true,
    subject: 'Наряд {order_number} отменён',
    body: 'Уважаемый(ая) {client_name},\n\nНаряд {order_number} был отменён.\nДля уточнения причин свяжитесь с диспетчером.',
  },

  // SMS
  {
    id: 's1', name: 'Назначен исполнитель', trigger: 'assigned',
    triggerCategory: 'Статус', channel: 'sms', active: true,
    body: 'СервисКлимат: заявка {order_number} принята. Инженер {engineer_name} приедет {date} в {time}.',
  },
  {
    id: 's2', name: 'Инженер выехал', trigger: 'en_route',
    triggerCategory: 'Статус', channel: 'sms', active: true,
    body: 'СервисКлимат: инженер {engineer_name} выехал. Ожидайте ~{eta} мин.',
  },
  {
    id: 's3', name: 'Работы выполнены', trigger: 'completed',
    triggerCategory: 'Статус', channel: 'sms', active: true,
    body: 'СервисКлимат: наряд {order_number} выполнен. Итог: {amount}. Спасибо!',
  },
  {
    id: 's4', name: 'SLA предупреждение', trigger: 'sla_warning',
    triggerCategory: 'SLA', channel: 'sms', active: false,
    body: 'СервисКлимат [SLA]: наряд {order_number} — истекает срок. Статус: {status}.',
  },
  {
    id: 's5', name: 'Счёт выставлен', trigger: 'invoice_issued',
    triggerCategory: 'Оплата', channel: 'sms', active: true,
    body: 'СервисКлимат: счёт по наряду {order_number} на {amount}. Проверьте email.',
  },
  {
    id: 's6', name: 'За 30 минут', trigger: '30min_before',
    triggerCategory: 'Напоминание', channel: 'sms', active: true,
    body: 'СервисКлимат: инженер {engineer_name} будет через ~30 мин. Адрес: {address}.',
  },
  {
    id: 's7', name: 'Плановое ТО', trigger: 'ppr_reminder',
    triggerCategory: 'Напоминание', channel: 'sms', active: true,
    body: 'СервисКлимат: плановое ТО оборудования — {date}. Подтвердите визит.',
  },
  {
    id: 's8', name: 'Наряд отменён', trigger: 'cancelled',
    triggerCategory: 'Статус', channel: 'sms', active: false,
    body: 'СервисКлимат: наряд {order_number} отменён. Для уточнений: +7(800)555-01-23.',
  },

  // Telegram
  {
    id: 't1', name: 'Назначен исполнитель', trigger: 'assigned',
    triggerCategory: 'Статус', channel: 'telegram', active: true,
    body: '✅ *Заявка принята*\n\nНомер: `{order_number}`\nКлиент: {client_name}\nИнженер: {engineer_name}\n📅 {date} в {time}',
  },
  {
    id: 't2', name: 'Инженер выехал', trigger: 'en_route',
    triggerCategory: 'Статус', channel: 'telegram', active: true,
    body: '🚗 *Инженер выехал*\n\n{engineer_name} направляется к вам.\nОриентировочно через: *{eta} мин*\nАдрес: {address}',
  },
  {
    id: 't3', name: 'Работы выполнены', trigger: 'completed',
    triggerCategory: 'Статус', channel: 'telegram', active: true,
    body: '🎉 *Работы выполнены*\n\nНаряд: `{order_number}`\nСумма: *{amount}*\n\nОцените качество 👇',
  },
  {
    id: 't4', name: 'SLA нарушено', trigger: 'sla_breach',
    triggerCategory: 'SLA', channel: 'telegram', active: true,
    body: '🔴 *НАРУШЕНИЕ SLA*\n\nНаряд: `{order_number}`\nКлиент: {client_name}\nСтатус: {status}\n\nТребуется срочное вмешательство!',
  },
  {
    id: 't5', name: 'Оплата получена', trigger: 'payment_received',
    triggerCategory: 'Оплата', channel: 'telegram', active: true,
    body: '💰 *Оплата получена*\n\nНаряд: `{order_number}`\nСумма: *{amount}*\nКлиент: {client_name}',
  },
  {
    id: 't6', name: 'Плановое ТО', trigger: 'ppr_reminder',
    triggerCategory: 'Напоминание', channel: 'telegram', active: false,
    body: '🔧 *Плановое ТО*\n\nКлиент: {client_name}\nДата: {date} в {time}\nАдрес: {address}',
  },
  {
    id: 't7', name: 'Запчасть готова', trigger: 'parts_ready',
    triggerCategory: 'Напоминание', channel: 'telegram', active: true,
    body: '📦 *Запчасть получена*\n\nПо наряду `{order_number}` пришла запчасть.\nСвяжемся для согласования даты.',
  },
  {
    id: 't8', name: 'Запрос оценки', trigger: 'rating_request',
    triggerCategory: 'Напоминание', channel: 'telegram', active: true,
    body: '⭐ Пожалуйста, оцените работу инженера {engineer_name} по наряду `{order_number}`.',
  },

  // Push
  {
    id: 'p1', name: 'Назначен исполнитель', trigger: 'assigned',
    triggerCategory: 'Статус', channel: 'push', active: true,
    body: 'Инженер {engineer_name} назначен. Визит {date} в {time}.',
  },
  {
    id: 'p2', name: 'Инженер выехал', trigger: 'en_route',
    triggerCategory: 'Статус', channel: 'push', active: true,
    body: '{engineer_name} выехал. Ожидайте через ~{eta} мин.',
  },
  {
    id: 'p3', name: 'Работы выполнены', trigger: 'completed',
    triggerCategory: 'Статус', channel: 'push', active: true,
    body: 'Наряд {order_number} выполнен. Оцените качество!',
  },
  {
    id: 'p4', name: 'SLA предупреждение', trigger: 'sla_warning',
    triggerCategory: 'SLA', channel: 'push', active: true,
    body: 'ВНИМАНИЕ: SLA по наряду {order_number} истекает!',
  },
  {
    id: 'p5', name: 'Счёт выставлен', trigger: 'invoice_issued',
    triggerCategory: 'Оплата', channel: 'push', active: false,
    body: 'Счёт по наряду {order_number} на {amount} готов к оплате.',
  },
  {
    id: 'p6', name: 'За 30 минут', trigger: '30min_before',
    triggerCategory: 'Напоминание', channel: 'push', active: true,
    body: 'Инженер прибудет примерно через 30 минут.',
  },
  {
    id: 'p7', name: 'Плановое ТО', trigger: 'ppr_reminder',
    triggerCategory: 'Напоминание', channel: 'push', active: true,
    body: 'Напоминание: плановое ТО запланировано на {date}.',
  },
  {
    id: 'p8', name: 'Наряд отменён', trigger: 'cancelled',
    triggerCategory: 'Статус', channel: 'push', active: false,
    body: 'Наряд {order_number} отменён. Подробности в приложении.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPreview(text: string): string {
  let result = text;
  for (const [key, val] of Object.entries(PREVIEW_VALUES)) {
    result = result.split(key).join(val);
  }
  return result;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: TriggerCategory }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[category]}`}>
      {category}
    </span>
  );
}

function EmailPreview({ subject, body }: { subject?: string; body: string }) {
  return (
    <div className="border rounded-lg overflow-hidden text-xs">
      <div className="bg-gray-100 px-3 py-2 border-b">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="text-gray-500 text-[10px]">От: noreply@servisklimat.ru</div>
        {subject && (
          <div className="font-medium text-gray-800 mt-0.5 truncate">
            {renderPreview(subject)}
          </div>
        )}
      </div>
      <div className="bg-white p-3 text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[100px]">
        {renderPreview(body)}
      </div>
    </div>
  );
}

function BubblePreview({ body, channel }: { body: string; channel: ChannelTab }) {
  const icon = channel === 'telegram' ? 'Send' : channel === 'sms' ? 'MessageSquare' : 'Bell';
  const color = channel === 'telegram' ? 'bg-blue-500' : channel === 'sms' ? 'bg-green-500' : 'bg-purple-500';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center`}>
          <Icon name={icon} size={13} className="text-white" />
        </div>
        <span className="text-xs font-medium text-gray-700">
          {channel === 'telegram' ? 'Сервис Климат' : channel === 'sms' ? '+7 (800) 555-01-23' : 'Push-уведомление'}
        </span>
      </div>
      <div className={`${color} text-white rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap max-w-[220px]`}>
        {renderPreview(body)}
      </div>
      <div className="text-[10px] text-gray-400 ml-1">{new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  );
}

// ─── New Template Form ────────────────────────────────────────────────────────

function NewTemplateForm({
  channel,
  onSave,
  onCancel,
}: {
  channel: ChannelTab;
  onSave: (t: EmailTemplate) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');

  const triggerOpt = TRIGGER_OPTIONS.find((o) => o.value === trigger);

  function handleSave() {
    if (!name.trim() || !trigger || !body.trim()) {
      toast.error('Заполните название, триггер и текст шаблона');
      return;
    }
    onSave({
      id: `new-${Date.now()}`,
      name: name.trim(),
      trigger,
      triggerCategory: triggerOpt?.category ?? 'Статус',
      channel,
      active: true,
      subject: channel === 'email' ? subject : undefined,
      body,
    });
    toast.success('Шаблон создан');
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">Новый шаблон</span>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <Icon name="X" size={16} />
        </Button>
      </div>
      <Input placeholder="Название шаблона" value={name} onChange={(e) => setName(e.target.value)} className="text-sm" />
      <Select value={trigger} onValueChange={setTrigger}>
        <SelectTrigger className="text-sm"><SelectValue placeholder="Триггер события" /></SelectTrigger>
        <SelectContent>
          {TRIGGER_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {channel === 'email' && (
        <Input placeholder="Тема письма" value={subject} onChange={(e) => setSubject(e.target.value)} className="text-sm" />
      )}
      <textarea
        className="w-full border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={5}
        placeholder="Текст шаблона..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Отмена</Button>
        <Button size="sm" onClick={handleSave}>Создать</Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmailTemplatesFull() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
  const [activeChannel, setActiveChannel] = useState<ChannelTab>('email');
  const [selectedId, setSelectedId] = useState<string>('e1');
  const [showNewForm, setShowNewForm] = useState(false);

  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editName, setEditName] = useState('');
  const [editTrigger, setEditTrigger] = useState('');
  const [editActive, setEditActive] = useState(true);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const selected = templates.find((t) => t.id === selectedId);

  function selectTemplate(t: EmailTemplate) {
    setSelectedId(t.id);
    setEditName(t.name);
    setEditTrigger(t.trigger);
    setEditSubject(t.subject ?? '');
    setEditBody(t.body);
    setEditActive(t.active);
    setShowNewForm(false);
  }

  // auto-select first on tab change
  function handleTabChange(ch: string) {
    const tab = ch as ChannelTab;
    setActiveChannel(tab);
    setShowNewForm(false);
    const first = templates.find((t) => t.channel === tab);
    if (first) selectTemplate(first);
  }

  // initialise editor when selected changes on mount
  if (selected && editName === '' && !showNewForm) {
    setEditName(selected.name);
    setEditTrigger(selected.trigger);
    setEditSubject(selected.subject ?? '');
    setEditBody(selected.body);
    setEditActive(selected.active);
  }

  function insertVariable(varKey: string) {
    const ta = bodyRef.current;
    if (!ta) {
      setEditBody((prev) => prev + varKey);
    } else {
      const start = ta.selectionStart ?? editBody.length;
      const end = ta.selectionEnd ?? editBody.length;
      const newBody = editBody.slice(0, start) + varKey + editBody.slice(end);
      setEditBody(newBody);
      requestAnimationFrame(() => {
        ta.selectionStart = start + varKey.length;
        ta.selectionEnd = start + varKey.length;
        ta.focus();
      });
    }
    toast.success(`Переменная ${varKey} вставлена`);
  }

  function handleSave() {
    if (!selected) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? {
              ...t,
              name: editName,
              trigger: editTrigger,
              triggerCategory: TRIGGER_OPTIONS.find((o) => o.value === editTrigger)?.category ?? t.triggerCategory,
              subject: activeChannel === 'email' ? editSubject : undefined,
              body: editBody,
              active: editActive,
            }
          : t
      )
    );
    toast.success('Шаблон сохранён');
  }

  function handleTestSend() {
    toast.success('Тестовое сообщение отправлено');
  }

  function handleAddTemplate(t: EmailTemplate) {
    setTemplates((prev) => [...prev, t]);
    setShowNewForm(false);
    selectTemplate(t);
  }

  const previewBody = showNewForm ? '' : editBody;
  const previewSubject = showNewForm ? '' : editSubject;

  return (
    <div className="flex h-full bg-gray-50 gap-0 overflow-hidden">
      {/* ── Left Panel ── */}
      <div className="w-72 flex-shrink-0 bg-white border-r flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-900">Шаблоны уведомлений</h2>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => setShowNewForm(true)}
            >
              <Icon name="Plus" size={13} className="mr-1" />
              Добавить
            </Button>
          </div>
        </div>

        <Tabs value={activeChannel} onValueChange={handleTabChange} className="flex-1 flex flex-col">
          <TabsList className="mx-4 grid grid-cols-4 h-8">
            {(['email', 'sms', 'telegram', 'push'] as ChannelTab[]).map((ch) => (
              <TabsTrigger key={ch} value={ch} className="text-[11px] px-1">
                <Icon name={CHANNEL_ICONS[ch]} size={12} className="mr-0.5" />
                {ch === 'email' ? 'Email' : ch === 'sms' ? 'SMS' : ch === 'telegram' ? 'TG' : 'Push'}
              </TabsTrigger>
            ))}
          </TabsList>

          {(['email', 'sms', 'telegram', 'push'] as ChannelTab[]).map((ch) => (
            <TabsContent key={ch} value={ch} className="flex-1 overflow-y-auto mt-0 px-2 pb-2">
              <div className="space-y-1 pt-2">
                {templates.filter((t) => t.channel === ch).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedId === t.id && !showNewForm
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        name={CHANNEL_ICONS[ch]}
                        size={14}
                        className={`mt-0.5 flex-shrink-0 ${t.active ? 'text-blue-500' : 'text-gray-300'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-medium text-gray-800 truncate">{t.name}</span>
                          <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {t.active ? 'Вкл' : 'Выкл'}
                          </span>
                        </div>
                        <CategoryBadge category={t.triggerCategory} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* ── Center Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white border-r">
        {showNewForm ? (
          <NewTemplateForm
            channel={activeChannel}
            onSave={handleAddTemplate}
            onCancel={() => setShowNewForm(false)}
          />
        ) : selected ? (
          <>
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name={CHANNEL_ICONS[activeChannel]} size={16} className="text-blue-500" />
                <span className="font-semibold text-sm">{editName || selected.name}</span>
                <CategoryBadge category={selected.triggerCategory} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditActive((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    editActive ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      editActive ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs text-gray-500">{editActive ? 'Активен' : 'Отключён'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Название шаблона</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Триггер события</label>
                <Select value={editTrigger} onValueChange={setEditTrigger}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Выберите триггер" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject (email only) */}
              {activeChannel === 'email' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Тема письма</label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="text-sm"
                    placeholder="Тема письма..."
                  />
                </div>
              )}

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">
                    {activeChannel === 'email' ? 'Тело письма' : 'Текст сообщения'}
                  </label>
                  {activeChannel !== 'email' && (
                    <span className={`text-[11px] ${editBody.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                      {editBody.length} симв.
                    </span>
                  )}
                </div>
                <textarea
                  ref={bodyRef}
                  className="w-full border rounded-md p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={activeChannel === 'email' ? 9 : 5}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              </div>

              {/* Variables */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Переменные</label>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => insertVariable(v.key)}
                      className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 rounded-md border border-gray-200 hover:border-blue-300 transition-colors font-mono"
                    >
                      {'{' + v.label + '}'}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} className="flex-1">
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить
                </Button>
                <Button size="sm" variant="outline" onClick={handleTestSend}>
                  <Icon name="Send" size={14} className="mr-1.5" />
                  Тест-отправка
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Выберите шаблон
          </div>
        )}
      </div>

      {/* ── Right Panel ── */}
      <div className="w-64 flex-shrink-0 bg-white flex flex-col">
        <div className="px-4 pt-4 pb-2 border-b">
          <div className="flex items-center gap-2">
            <Icon name="Eye" size={14} className="text-gray-500" />
            <span className="text-xs font-semibold text-gray-700">Предпросмотр</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">С подставленными данными</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {showNewForm || !selected ? (
            <div className="text-xs text-gray-400 text-center pt-8">
              Выберите шаблон для предпросмотра
            </div>
          ) : activeChannel === 'email' ? (
            <EmailPreview subject={previewSubject} body={previewBody} />
          ) : (
            <BubblePreview body={previewBody} channel={activeChannel} />
          )}

          {!showNewForm && selected && (
            <div className="mt-4 space-y-2">
              <Separator />
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide pt-1">
                Тестовые данные
              </div>
              {Object.entries(PREVIEW_VALUES).map(([key, val]) => (
                <div key={key} className="flex items-start gap-1">
                  <span className="text-[10px] font-mono text-blue-600 flex-shrink-0">{key}</span>
                  <span className="text-[10px] text-gray-500">→ {val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
